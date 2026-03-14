---
layout: page
title: "What Are vProgs?"
section: learn
description: "Learn what Kaspa vProgs are — verifiable programs that execute off-chain and verify on-chain using ZK proofs, enabling scalable L1 programmability."
---

Verifiable Programs (vProgs) are lightweight, deterministic logic modules native to Kaspa's Layer 1. They represent a fundamentally new approach to blockchain programmability -- a "third way" that avoids both the monolithic bloat of L1 virtual machines and the fragmentation of L2 rollups.

The core principle is simple: **execute off-chain, verify on-chain**. Complex computation happens outside the blockchain, and only a compact cryptographic proof is submitted to L1 for verification. The result is a system that scales without sacrificing security, composability, or decentralization.

---

## The Problem: A Blockchain Programmability Dilemma

The blockchain industry has been stuck between two imperfect choices for smart contract execution:

### Option 1: L1 Monolithic Bloat (the Ethereum path)

Put a full virtual machine on L1. Every node re-executes every transaction.

- Congestion and high gas fees under load
- Heavy hardware requirements for node operators, leading to centralization
- Network throughput limited by slowest validator
- State bloat grows unbounded

### Option 2: L2 Fragmentation (the Rollup path)

Move execution off L1 to separate rollup chains. Bridge assets between them.

- Liquidity split across dozens of isolated rollups
- Bridge hacks and security risks (billions lost historically)
- Asynchronous finality -- transactions take minutes to hours to settle across chains
- Centralized sequencers control transaction ordering
- Users must navigate multiple chains, bridges, and gas tokens

### Option 3: The vProgs Path

vProgs offer a synthesis: programmable, scalable, and unified on L1.

- **Off-chain execution** -- complex logic runs outside the blockchain
- **On-chain ZK verification** -- L1 only validates a compact proof, never re-runs computation
- **Unified liquidity** -- all programs share one L1 settlement layer
- **Synchronous composability** -- programs interact atomically, no bridges needed
- **Pure PoW security** -- no economic security assumptions, no trusted sequencers

---

## The Four Architecture Pillars

vProgs are built on four foundational design principles:

### 1. Sovereign State

Each vProg owns an exclusive set of accounts and operates as a "mini zkVM" -- a self-contained verification environment.

- **Mutual trustlessness**: the integrity of one vProg does not depend on any other
- **Autonomous resource management**: each vProg defines its own gas pricing (gas scales) and throughput regulation (STORM constants)
- **Isolation by design**: a poorly-managed or heavily-used vProg cannot burden the rest of the network

This sovereignty is an architectural defense against the "noisy neighbor" problem that plagues monolithic L1s. On Ethereum, a single popular NFT mint can spike gas fees for every user on the network. With vProgs, resource costs are internalized per application.

### 2. Off-Chain Compute

The heavy lifting happens off-chain. vProgs execute their logic in an external computation environment, and the result is a zero-knowledge proof attesting to correct execution.

- L1 **never re-runs computation** -- it only checks the proof
- Scales horizontally via a **decentralized prover market**: more provers means more throughput
- Total system capacity grows proportionally to prover market size and efficiency
- No single bottleneck -- any participant can become a prover

### 3. L1 Sequencing

Kaspa's L1 BlockDAG serves as the immutable sequencing layer -- the "traffic controller" that determines the global order of operations.

- **BlockDAG consensus** provides a deterministic sequence `T` of all transactions
- **Pure Proof-of-Work** security -- no staking, no trusted validators
- **DagKnight** protocol delivers near-instant finality
- The L1 does not execute programs -- it sequences them and verifies proofs

### 4. ZK Verification

Zero-knowledge proofs are the cryptographic mechanism that ties everything together.

- Proofs are submitted to L1 alongside state commitments
- State commitments use **hierarchical Merkle roots** for efficient verification
- **Concise witnesses** (compact Merkle proofs) enable cross-vProg composability
- L1 verification is minimal and fast -- a constant-time operation regardless of computation complexity

---

## The Account Model

vProgs use an account model inspired by Solana's design:

- **Accounts hold state data** -- each account stores the current state of a piece of program data
- **Transactions pre-declare access** -- every transaction specifies which accounts it will read from and write to, before execution begins
- **Parallel processing** -- pre-declaration enables the BlockDAG to process non-conflicting transactions in parallel
- **Conflict resolution** -- DagKnight serializes operations that touch the same accounts

Each transaction specifies three sets:

| Set | Symbol | Purpose |
|-----|--------|---------|
| **Read set** | `r(x)` | Accounts the transaction needs to read |
| **Write set** | `w(x)` | Accounts the transaction will modify (must be a subset of the read set) |
| **Witness set** | `pi(x)` | Dependency resolution data for cross-vProg reads |

---

## How Execution Works (Summary)

The full execution flow is covered in [How It Works](/learn/how-it-works), but here is the high-level picture:

1. **Define** -- A user or application defines the desired state transition
2. **Execute** -- An off-chain prover runs the computation
3. **Prove** -- The prover generates a ZK proof attesting to correct execution
4. **Verify** -- The proof and state commitment are submitted to L1, which validates them cryptographically
5. **Finalize** -- State is finalized with instant DagKnight finality

The L1 never sees the actual computation. It only sees the proof that the computation was done correctly. This is what enables horizontal scaling -- adding more provers increases throughput without adding any burden to L1 nodes.

---

## Synchronous Composability

One of vProgs' most important properties is **synchronous composability** (syncompo): multiple vProgs can interact within a single atomic L1 transaction.

Consider a DeFi operation: borrow stablecoins from a lending protocol, swap them on a DEX, and stake the result. With L2 rollups, this requires bridging between isolated environments, waiting for finality at each step, and accepting bridge risk. With vProgs:

- All three operations execute off-chain in a single combined proof
- One atomic transaction is submitted to L1
- Either all operations succeed, or none do
- No bridges, no waiting, no fragmentation

This is possible because of **concise witnesses** -- compact Merkle proofs that allow one vProg to verifiably read another vProg's state within the same transaction.

---

## Deployment Phases

vProgs are being deployed in two major phases:

### Phase 1: Standalone vProgs

The initial deployment focuses on sovereign, independent programs:

- Each vProg operates as a standalone application
- Bridges to L1 via ZK proofs through the canonical bridge
- L1 has no notion of individual accounts -- it only tracks the vProg entity through its covenant
- The "degenerate" Computation DAG (CD) groups activity by program, not by account
- Proving scales as O(program activity) via KIP-21 lane partitioning

This phase delivers full programmability and ZK verification without waiting for the more complex composability layer.

### Phase 2: Full Synchronous Composability

The second phase extends the system with cross-vProg atomicity:

- Extended Computation DAG with per-account modeling
- Cross-vProg atomic transactions via concise witnesses
- Full synchronous composability across all programs
- Complete CD specification with scope-based gas calculations

---

## The Consensus Foundation

vProgs do not exist in isolation. They build on a stack of consensus upgrades:

| Layer | Component | Status |
|-------|-----------|--------|
| **Consensus** | DagKnight (parameterless adaptive ordering) | In development |
| **Commitment** | KIP-21 (partitioned lane-based sequencing) | Specified |
| **Verification** | KIP-16 (ZK verification opcodes) | On TN12 |
| **Covenants** | KIP-17/20 (covenant binding and IDs) | On TN12 |
| **Language** | Silverscript (L1 covenant contracts) | Experimental |
| **Applications** | vProgs (sovereign programs) | Phase 1 in development |

The **Covenants++ hard fork** (May 5, 2026) activates the foundational KIPs (16, 17, 20, 21) that make vProgs possible. Silverscript provides the complementary local-state covenant layer, handling UTXO-level rules while vProgs handle shared-state application logic.

---

## Key Takeaways

- vProgs are **native L1 programs**, not L2 rollups. They share one unified settlement layer.
- Computation happens **off-chain**. L1 only verifies proofs. This keeps the base layer lean and fast.
- Each vProg is **sovereign** -- it controls its own state, gas pricing, and resource management.
- **Synchronous composability** means programs can interact atomically, like contracts on Ethereum but without the bloat.
- The system scales **horizontally** through a decentralized prover market, not by adding load to L1 nodes.
- Security comes from **cryptographic proof** (ZK) and **Proof-of-Work**, not economic guarantees or trusted parties.

---

## Next Steps

- [Why vProgs?](/learn/why-vprogs) -- Deeper analysis of the design rationale
- [How It Works](/learn/how-it-works) -- Step-by-step execution flow
- [vProgs Compared](/learn/compared) -- Side-by-side with other platforms
- [Architecture Overview](/architecture/overview) -- Full technical specification
