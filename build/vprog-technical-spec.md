---
layout: page
title: "vProg Technical Specification"
section: build
description: "Complete technical specification for building a vProg: architecture, guest programming model, ZK proving pipeline, state management, and end-to-end development guide."
---

This document is a comprehensive technical specification for building a verifiable program (vProg) on Kaspa. It covers the full stack from guest program development through ZK proof generation to L1 settlement, based on the architecture proposed in March 2026 (8 PRs in review, not yet merged).

---

## 1. Architecture Overview

A vProg is a sovereign state machine that executes off-chain and settles on-chain via zero-knowledge proofs. The architecture has three layers:

```
+---------------------------------------------------------------+
| GUEST PROGRAM                                                  |
| Your application logic (Rust, compiled to zkVM target)         |
| Solana-like API: resources, instructions, program contexts     |
+---------------------------------------------------------------+
        |                                          ^
        | executes via                             | reads state from
        v                                          |
+---------------------------------------------------------------+
| vPROGS FRAMEWORK                                               |
| Scheduler → ZK VM → Transaction Prover → Batch Prover         |
| State management, SMT, lifecycle events, artifact publishing   |
+---------------------------------------------------------------+
        |                                          ^
        | submits proof                            | anchors to
        v                                          |
+---------------------------------------------------------------+
| KASPA L1                                                       |
| KIP-16 ZK verification → KIP-21 lane commitment → DagKnight   |
| Covenant enforces state transition rules                       |
+---------------------------------------------------------------+
```

### 1.1 Key Properties

| Property | Description |
|----------|-------------|
| **Sovereignty** | Your vProg owns an exclusive set of accounts `S_p`. No other program can write to them. |
| **Determinism** | State transitions are deterministic functions `f(state, action) → new_state`. |
| **Trustless verification** | L1 verifies a ZK proof of correct execution. It never re-runs your logic. |
| **Parallel execution** | Transactions with disjoint write sets execute in parallel on the BlockDAG. |
| **Configurable proving** | ZK proving can be disabled (development), transaction-only, or full batch pipeline. |

> **Status note:** The ZK proving layers described in this spec are proposed across 8 open PRs ([#21](https://github.com/kaspanet/vprogs/pull/21), [#28](https://github.com/kaspanet/vprogs/pull/28)--[#34](https://github.com/kaspanet/vprogs/pull/34)) and have not yet been merged. The core execution layers (core through node) are merged and functional.

---

## 2. Repository Structure

The vProgs monorepo at [github.com/kaspanet/vprogs](https://github.com/kaspanet/vprogs) is a layered Rust workspace. Dependencies flow strictly downward.

### 2.1 Core Layers

```
core                        Primitive types, trait definitions
  └→ storage                Persistent key-value state storage
       └→ state             Account state management, read/write tracking
            └→ scheduling   Transaction ordering, parallel dispatch, batch lifecycle
                 └→ transaction-runtime    Execution environment for guest programs
                      └→ node             Network integration, L1 bridge, RPC
```

### 2.2 ZK Proving Layers

```
core-codec                  Zero-copy binary encoding for ZK wire formats
  └→ core-smt              Versioned Sparse Merkle Tree (state commitments)
       └→ zk-abi           Host↔guest wire format for proof composition
            ├→ zk-transaction-prover   Per-transaction proof generation
            ├→ zk-batch-prover         Batch aggregation (tx proofs + SMT → single proof)
            ├→ zk-vm                   Processor trait with ZK lifecycle hooks
            └→ zk-backend-risc0        RISC Zero backend (guest programs + integration tests)
```

### 2.3 Build Requirements

| Requirement | Version | Notes |
|-------------|---------|-------|
| Rust | nightly | Required for zkVM guest compilation |
| protoc | 3.21+ | Protocol buffer compiler |
| Git | 2.40+ | Workspace dependency management |
| RAM | 16 GB minimum, 32+ GB recommended | ZK proof generation is memory-intensive |
| CPU | 4+ cores, 8+ recommended | Parallel proof generation benefits from cores |

---

## 3. Account Model

vProgs use a Solana-inspired account model. Understanding accounts is prerequisite to writing guest programs.

### 3.1 Account Structure

An account is a unit of state owned by a vProg. Each account holds arbitrary data (serialized bytes) and metadata.

```
Account {
    address: [u8; 32],        // unique identifier
    owner: ProgramId,         // the vProg that has write access
    data: Vec<u8>,            // application-specific state
    lamports: u64,            // balance (for resource accounting)
}
```

### 3.2 Access Control

| Access | Rule |
|--------|------|
| **Write** | Only the owning vProg can modify an account in `S_p` |
| **Read** | Any vProg can read another's accounts via concise witnesses (Phase 2) |
| **Declare** | Every transaction must pre-declare its read set `r(x)` and write set `w(x)` before execution |

The constraint `w(x) ⊆ r(x)` is enforced: you must read an account before you can write to it.

### 3.3 Transaction Definition

```
Transaction {
    program_id: ProgramId,                  // target vProg
    instruction: InstructionData,           // operation + parameters
    read_set: Vec<AccountAddress>,          // r(x): accounts to read
    write_set: Vec<AccountAddress>,         // w(x): accounts to modify
    witness_set: Vec<ConciseWitness>,       // π(x): cross-vProg state proofs (Phase 2)
    signatures: Vec<Signature>,             // authorization
}
```

Pre-declaration of account sets enables the scheduler to identify non-conflicting transactions and dispatch them in parallel.

---

## 4. Guest Programming Model

Guest programs are the application logic that runs inside the zkVM. They use a Solana-like API.

### 4.1 Core Concepts

| Concept | Description |
|---------|-------------|
| **Resource** | A typed wrapper around an account's data. Your program defines resource types. |
| **Instruction** | An operation your program supports (e.g., `Transfer`, `Swap`, `CreatePool`). |
| **Program Context** | The execution environment passed to your instruction handler: accounts, inputs, caller info. |

### 4.2 Guest Program Structure

A guest program is a Rust crate compiled to the zkVM target (RISC-V for RISC Zero). It implements instruction handlers that operate on resources.

```rust
// Define your resource types
#[derive(Resource)]
pub struct TokenAccount {
    pub owner: Pubkey,
    pub balance: u64,
}

#[derive(Resource)]
pub struct PoolState {
    pub reserve_a: u64,
    pub reserve_b: u64,
    pub lp_supply: u64,
}

// Define your instructions
pub enum Instruction {
    Transfer { amount: u64 },
    Swap { amount_in: u64, min_out: u64 },
    AddLiquidity { amount_a: u64, amount_b: u64 },
}

// Implement instruction handlers
pub fn process_instruction(
    ctx: &ProgramContext,
    instruction: Instruction,
) -> Result<(), ProgramError> {
    match instruction {
        Instruction::Transfer { amount } => {
            let from = ctx.accounts.get::<TokenAccount>(0)?;
            let to = ctx.accounts.get::<TokenAccount>(1)?;

            // Verify authorization
            verify_signature(ctx, &from.owner)?;

            // Execute state transition
            from.balance = from.balance.checked_sub(amount)
                .ok_or(ProgramError::InsufficientBalance)?;
            to.balance = to.balance.checked_add(amount)
                .ok_or(ProgramError::Overflow)?;

            Ok(())
        }
        Instruction::Swap { amount_in, min_out } => {
            let pool = ctx.accounts.get::<PoolState>(0)?;
            let user_in = ctx.accounts.get::<TokenAccount>(1)?;
            let user_out = ctx.accounts.get::<TokenAccount>(2)?;

            verify_signature(ctx, &user_in.owner)?;

            // Constant-product AMM: x * y = k
            let k = pool.reserve_a * pool.reserve_b;
            let new_reserve_a = pool.reserve_a + amount_in;
            let new_reserve_b = k / new_reserve_a;
            let amount_out = pool.reserve_b - new_reserve_b;

            if amount_out < min_out {
                return Err(ProgramError::SlippageExceeded);
            }

            // Update state
            user_in.balance -= amount_in;
            user_out.balance += amount_out;
            pool.reserve_a = new_reserve_a;
            pool.reserve_b = new_reserve_b;

            Ok(())
        }
        // ...
    }
}
```

### 4.3 Current Limitations (March 2026, pending merge)

| Limitation | Status | Future |
|-----------|--------|--------|
| ZK proving layers not yet merged | PRs in review | Merge pending |
| Single hardcoded guest program | Proposed design | User-deployed guests coming next |
| Guest handles own authentication | Proposed design | Framework-managed auth planned |
| No cross-program composability | Proposed design | Multi-program invocation planned |
| No L1 asset bridging from guest | Proposed design | Canonical bridge integration planned |

### 4.4 Authentication

Guests currently handle their own access authentication (e.g., signature verification). When user-deployed guests ship, the framework will manage authentication automatically. The current transaction processor will become a hardcoded circuit handling invocation and access delegation to user programs, similar to SUI's programmable transactions with linear type safety at the program boundary.

### 4.5 PoW Randomness

Guest programs have access to the block hash as a source of unpredictable, unbiasable randomness. Because the block hash is a PoW output revealed after transaction sequencing, it cannot be predicted or manipulated by any party. This is useful for:

- Fair random selection (lotteries, raffles)
- Game mechanics (random encounters, loot drops)
- Randomized protocol parameters
- Verifiable random functions without oracle dependencies

```rust
// Access block hash as randomness source
let block_hash = ctx.block_hash();
let random_seed = hash(block_hash, &unique_nonce);
```

---

## 5. ZK Proving Pipeline

The proving pipeline transforms executed transactions into cryptographic proofs of correct state transitions.

### 5.1 Pipeline Overview

```
     ┌──────────────────────────────────────────────────────────────┐
     │                    EXECUTION PHASE                            │
     │                                                               │
     │  tx_1 ─→ [scheduler] ─→ execute ─→ execution trace + result  │
     │  tx_2 ─→ [scheduler] ─→ execute ─→ execution trace + result  │
     │  tx_3 ─→ [scheduler] ─→ execute ─→ execution trace + result  │
     │          (parallel dispatch for non-conflicting txns)         │
     └──────────────────────────────┬───────────────────────────────┘
                                    │
                                    v
     ┌──────────────────────────────────────────────────────────────┐
     │               TRANSACTION PROVING (Level 1)                   │
     │                                                               │
     │  trace_1 ─→ [tx prover thread] ─→ tx_proof_1                 │
     │  trace_2 ─→ [tx prover thread] ─→ tx_proof_2                 │
     │  trace_3 ─→ [tx prover thread] ─→ tx_proof_3                 │
     │          (parallel proving via Backend trait)                  │
     └──────────────────────────────┬───────────────────────────────┘
                                    │
                                    v
     ┌──────────────────────────────────────────────────────────────┐
     │                  BATCH PROVING (Level 2)                      │
     │                                                               │
     │  [tx_proof_1, tx_proof_2, tx_proof_3]                         │
     │       + SMT proof (covering batch resources)                  │
     │       ─→ [batch prover] ─→ single batch_proof                │
     │                                                               │
     │  batch_proof attests to: state_root_old → state_root_new     │
     └──────────────────────────────┬───────────────────────────────┘
                                    │
                                    v
     ┌──────────────────────────────────────────────────────────────┐
     │                  L1 SETTLEMENT                                │
     │                                                               │
     │  batch_proof submitted to L1 covenant                         │
     │  KIP-16 verifies proof (constant time)                        │
     │  KIP-21 updates lane tip hash                                 │
     │  DagKnight finalizes with instant finality                    │
     └──────────────────────────────────────────────────────────────┘
```

### 5.2 Level 1: Transaction Proving

The **Transaction Prover** operates per-transaction:

1. Receives a serialized execution context via the ZK ABI wire format
2. Submits the context to a backend-specific prover on a dedicated thread
3. The backend (e.g., RISC Zero) runs the guest program inside the zkVM and produces a proof
4. The proof artifact is stored for batch aggregation

**What the transaction proof attests to:**
- The guest program executed correctly against the provided resource set
- The output state is the correct result of applying the instruction to the input state
- All access checks (signatures, permissions) were valid

### 5.3 Level 2: Batch Proving

The **Batch Prover** aggregates transaction proofs into a single batch proof:

1. Collects all transaction proof artifacts for the batch
2. Generates an SMT (Sparse Merkle Tree) proof covering the batch's resources
3. Submits the combined input (tx proofs + SMT proof) to a batch-specific backend prover
4. Produces a single proof attesting to the batch's state root transition

**What the batch proof attests to:**
- All transactions in the batch were individually proven correct
- The aggregate state transition from `state_root_old` to `state_root_new` is valid
- The SMT correctly reflects all resource mutations in the batch

### 5.4 Proving Configuration

The ZK VM supports three modes:

| Mode | Description | Use Case |
|------|-------------|----------|
| **Disabled** | No proof generation; execution only | Development, testing |
| **Transaction-only** | Per-tx proofs generated, no batch aggregation | Debugging proof generation |
| **Full pipeline** | Transaction proofs + batch aggregation | Production |

---

## 6. ZK ABI (Wire Format)

The ZK ABI defines how data flows between the host (framework) and guest (your program) across the proof boundary.

### 6.1 Design Principles

- **Backend-agnostic:** Any zkVM backend can consume the ABI (non-Rust backends would reimplement the format in their language)
- **`no_std` compatible:** Runs inside zkVM guests with no standard library
- **Minimal proof cost:** Every byte operation in a zkVM contributes to proof cost, so the ABI uses zero-copy encoding

### 6.2 Two Proving Levels

The ABI specifies wire formats for two levels of proving:

**Transaction Processor ABI:**

```
TransactionInput {
    instruction: Bytes,              // serialized instruction data
    accounts: Vec<AccountState>,     // input account states
    program_id: [u8; 32],           // target program
    block_hash: [u8; 32],           // PoW randomness source
}

TransactionOutput {
    accounts: Vec<AccountState>,     // output account states
    journal: Bytes,                  // public outputs (logged data)
    status: ExecutionStatus,         // success or error
}
```

**Batch Processor ABI:**

```
BatchInput {
    transaction_proofs: Vec<TransactionProof>,  // Level 1 proof artifacts
    smt_proof: SmtProof,                         // Sparse Merkle Tree inclusion proof
    state_root_old: [u8; 32],                    // pre-batch state root
}

BatchOutput {
    state_root_new: [u8; 32],       // post-batch state root
    journal: Bytes,                  // batch-level public outputs
}
```

### 6.3 Core Codec

The `core-codec` crate provides the encoding primitives used by the ABI:

| Component | Purpose |
|-----------|---------|
| `Reader` | Zero-copy binary decoding (reads fields by reinterpreting byte slices in-place) |
| `Bits` | Bit-level encoding/decoding for compact topology data |
| Sorted-unique encoding | Deterministic key ordering for reproducible hashing |

All codec types are `no_std` so they run inside the zkVM guest without allocation overhead.

---

## 7. State Management

### 7.1 Sparse Merkle Tree (SMT)

The `core-smt` crate provides a versioned Sparse Merkle Tree that produces a single root hash representing the entire vProg state.

**Key optimizations:**

| Optimization | Description |
|--------------|-------------|
| **Shortcut leaves** | Leaves placed at higher tree levels for sparse regions, avoiding full-depth paths |
| **Multi-proof compression** | When proving multiple keys, sibling hashes are shared across proofs |
| **Compact topology bit-packing** | Tree structure encoded with minimal bytes |
| **Versioning** | Tree supports rollback and pruning aligned with the scheduler's batch lifecycle |

### 7.2 State Commitment Structure

Every batch produces a state commitment — the SMT root hash after applying all transactions:

```
state_root = SMT.root_hash(
    account_1.address → hash(account_1.data),
    account_2.address → hash(account_2.data),
    ...
    account_n.address → hash(account_n.data),
)
```

This root hash is what the batch proof attests to. L1 verifies that `state_root_old → state_root_new` is the correct transition.

### 7.3 Lifecycle Integration

The SMT integrates into the scheduler's batch lifecycle:

| Event | SMT Action |
|-------|------------|
| **Batch creation** | Snapshot current tree version |
| **Transaction commit** | Apply account mutations to working tree |
| **Batch commit** | Finalize new root hash, publish artifact |
| **Rollback** | Revert to snapshot version |
| **Pruning** | Remove old tree versions no longer needed |

---

## 8. Backend Trait

The `Backend` trait abstracts proof generation, allowing different zkVM backends.

### 8.1 Trait Interface

```rust
/// Backend for generating transaction-level proofs
trait TransactionBackend {
    type Proof: Serialize + Deserialize;

    fn prove_transaction(
        &self,
        input: &TransactionInput,  // ABI-encoded execution context
    ) -> Result<Self::Proof, ProverError>;
}

/// Backend for generating batch-level proofs
trait BatchBackend {
    type Proof: Serialize + Deserialize;

    fn prove_batch(
        &self,
        transaction_proofs: &[TransactionProof],
        smt_proof: &SmtProof,
        state_root_old: &[u8; 32],
        state_root_new: &[u8; 32],
    ) -> Result<Self::Proof, ProverError>;
}
```

### 8.2 RISC Zero Backend

The first proposed backend (`zk-backend-risc0`, [PR #32](https://github.com/kaspanet/vprogs/pull/32)) provides:

| Component | Description |
|-----------|-------------|
| Transaction guest program | Pre-compiled RISC-V binary that processes a single transaction inside RISC Zero's zkVM |
| Batch guest program | Pre-compiled RISC-V binary that aggregates transaction proofs and verifies the state root transition |
| Integration test suite | End-to-end tests: transaction execution → batch proof → state root verification |

### 8.3 Adding a New Backend

To implement a new zkVM backend (e.g., SP1):

1. Create a new crate (e.g., `zk-backend-sp1`)
2. Implement `TransactionBackend` and `BatchBackend` traits
3. Write guest programs targeting the new zkVM's compilation target
4. Pre-compile guest programs (the RISC Zero backend ships pre-compiled ELF binaries)
5. Add integration tests that exercise the full pipeline

The `Backend` trait was designed for exactly this extensibility. The RISC Zero implementation serves as a reference.

---

## 9. ZK VM (Processor Integration)

The `zk-vm` crate wires the proving pipeline into the scheduler via the `Processor` trait.

### 9.1 Lifecycle Events

The `Processor` trait exposes lifecycle hooks that the ZK VM uses:

| Event | ZK VM Action |
|-------|-------------|
| `on_transaction_executed` | Serialize execution context, submit to Transaction Prover |
| `on_batch_created` | Initialize batch artifact collection |
| `on_batch_commit` | Collect transaction proofs, generate SMT proof, submit to Batch Prover |
| `on_shutdown` | Flush pending proofs, clean up prover threads |
| `on_rollback` | Discard in-progress proofs for rolled-back transactions |

### 9.2 Proving Modes

```rust
enum ProvingMode {
    Disabled,           // No proving, execution only
    TransactionOnly,    // Generate per-tx proofs, skip batch aggregation
    Full,               // Full pipeline: tx proofs → batch proof
}
```

Set via configuration at node startup. Development workflows typically use `Disabled` and enable proving for integration testing.

---

## 10. L1 Settlement

### 10.1 Covenant Structure

A vProg's L1 presence is a covenant — a UTXO with spending conditions that enforce ZK verification:

```
vProg Covenant UTXO:
  spending conditions:
    1. Provide valid ZK proof (KIP-16 verification)
    2. Proof attests to state transition: state_root_old → state_root_new
    3. Output carries new state_root (KIP-17 state validation)
    4. Covenant ID preserved (KIP-20 lineage)
```

### 10.2 KIP-16 Verification

L1 nodes verify proofs via KIP-16 opcodes:

| Tag | System | Sigop Cost | Status |
|-----|--------|-----------|--------|
| `0x20` | RISC0-Groth16 | 140 | Live on TN12 |
| `0x21` | RISC0-Succinct | 740 | Live on TN12 |

### 10.3 KIP-21 Lane Commitment

Each vProg maps to a lane in the partitioned sequencing commitment:

- Lane maintains its own recursive tip hash
- Proof effort scales as **O(vProg activity)**, not O(total network activity)
- Provers only process transactions in their lane
- Active lanes tracked in a 256-depth Sparse Merkle Tree

---

## 11. Resource Economics

### 11.1 Gas Model

Each vProg defines its own gas scales via STORM constants:

| Parameter | Controls |
|-----------|----------|
| `STORM_throughput` | Maximum transactions per epoch |
| `STORM_state_size` | Maximum account growth per epoch |
| `STORM_scope_limit` | Maximum proving cost |
| `STORM_gas_scale` | Base unit pricing |

### 11.2 Weighted Area Gas

```
gas(x) = w_seq * C_seq(x) + w_par * C_par(x)
```

- **Sequential costs** (`C_seq`): writes, cross-vProg operations, state transitions
- **Parallel costs** (`C_par`): reads, witness verification, scope computation
- `w_seq > w_par` incentivizes transactions that can execute in parallel

### 11.3 Scope-Based Pricing

```
scope_gas(x) = base_cost + marginal_cost * |scope(x)|
```

Scope is the set of state transitions between the current transaction and the last proven anchor. Frequent proof submissions reduce scope sizes and lower per-transaction costs.

---

## 12. Development Workflow

### 12.1 Setup

```bash
# Clone the repository
git clone https://github.com/kaspanet/vprogs.git
cd vprogs

# Install Rust nightly
rustup toolchain install nightly
rustup default nightly

# Build the full workspace
cargo build --release
```

### 12.2 Write a Guest Program

1. Create a new crate in the workspace for your guest logic
2. Define resource types (account data structures)
3. Define instruction enum (operations your program supports)
4. Implement `process_instruction` handler
5. Ensure all types implement the codec traits for zero-copy serialization

### 12.3 Test Without Proving

```bash
# Run with proving disabled (fast iteration)
cargo test --package your-vprog -- --proving-mode disabled
```

### 12.4 Test With Proving

```bash
# Run with full proving pipeline (slower, generates real proofs)
cargo test --package your-vprog -- --proving-mode full
```

### 12.5 Integration Test Pattern

The RISC Zero backend's integration test suite demonstrates the canonical pattern:

1. Set up initial account states
2. Construct transactions with read/write sets
3. Execute via the scheduler
4. Generate transaction proofs
5. Aggregate into batch proof
6. Verify `state_root_old → state_root_new` transition

---

## 13. Security Considerations

### 13.1 Eliminated by Construction

| Attack | Why It Cannot Happen |
|--------|---------------------|
| **Reentrancy** | Exclusive write access, upfront account declaration, no recursive calls |
| **Proof forgery** | ZK soundness — computationally infeasible to produce valid proof for incorrect transition |
| **Cross-vProg state corruption** | Read-only access to other vProgs' state via concise witnesses |

### 13.2 Guest Program Responsibilities (Current)

Until framework-managed auth ships, guest programs must:

- Verify signatures for all privileged operations
- Validate all arithmetic (checked operations, overflow protection)
- Enforce access control on resources
- Handle edge cases in business logic (zero amounts, self-transfers, etc.)

### 13.3 Determinism Requirements

Guest programs must be fully deterministic. Non-determinism causes proof failures:

- No floating point arithmetic
- No system calls or I/O
- No random number generation (use the PoW block hash instead)
- No time-dependent logic (use block height or sequence numbers)

---

## 14. Roadmap: What's Coming

| Milestone | Description | Impact on Guest Programs |
|-----------|-------------|-------------------------|
| **User-deployed guests** | Transaction processor becomes invocation circuit; user programs invoked beneath it | API stays similar but scoped to a resource subset |
| **Multi-program composability** | Multiple guest programs interact within a single proof | Cross-program calls, shared resource access |
| **L1 asset bridging** | Move KAS and native assets in/out of vProg environment | Deposit/withdraw instructions |
| **Framework-managed auth** | Automatic signature verification and access control | Remove manual auth checks from guest code |
| **Anchor-like DSL** | Higher-level language for writing guest programs | Faster development, fewer boilerplate errors |
| **SP1 backend** | Second zkVM backend implementation | Backend choice, performance comparison |

---

## 15. Community Contribution Opportunities

Two areas where involvement would be especially impactful:

### 15.1 Anchor-like DSL

Build a developer experience layer on top of the ZK ABI. The ABI is stable enough to target. Goals:

- Declarative resource and instruction definitions
- Auto-generated serialization and deserialization
- Account validation macros
- Error handling patterns
- IDE support (syntax highlighting, completion)

### 15.2 Second zkVM Backend (SP1)

Implement `TransactionBackend` and `BatchBackend` for SP1:

- Validates the Backend trait abstraction
- Provides builders with backend choice
- Enables performance comparison between RISC Zero and SP1
- Reference implementation: `zk-backend-risc0`

---

## Further Reading

- [Architecture Overview](/architecture/overview) -- four pillars and how they compose
- [Account Model](/architecture/account-model) -- formal account model specification
- [ZK Verification](/architecture/zk-verification) -- three-tier ZK stack and proof lifecycle
- [Execution Model](/architecture/execution-model) -- full execution lifecycle with ZK proving layers
- [Proving Systems Analysis](/research/proving-systems) -- RISC Zero, SP1, Noir, Cairo comparison
- [Gas Economics](/research/gas-economics) -- weighted area gas and STORM constants
- [Security Model](/research/security-model) -- threat model and attack surface analysis
- [Formal Model](/research/formal-model) -- computation DAG, scope, and phase transition analysis
- [Quickstart Guide](/build/quickstart) -- 30-minute setup walkthrough
- [Example Projects](/build/examples) -- DEX, multi-sig, auction, DAO reference implementations
