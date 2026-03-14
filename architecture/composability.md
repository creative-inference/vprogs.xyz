---
layout: page
title: "Synchronous Composability"
description: "See how vProgs achieve synchronous composability on Kaspa L1 -- atomic cross-program interactions without bridges, rollups, or liquidity fragmentation."
section: architecture
---

Synchronous composability is the ability for multiple decentralized applications to interact and update state within a single, atomic transaction on L1. No bridges. No delays. No fragmentation. This is the property that makes vProgs fundamentally different from L2 rollup architectures, and it is the primary reason for rejecting the rollup model entirely.

---

## Why Composability Is Critical

Without native synchronous composability, liquidity and users flow to centralized rollup entities. Rollup operators become what the Kaspa research describes as "single parasitic entities" -- incentivized to monopolize execution within their isolated environment. DeFi composability breaks down across these boundaries.

```
L2 Rollup World:                         vProgs World:
+--------+ +--------+ +--------+        +----------------------------------+
|Rollup A| |Rollup B| |Rollup C|        |          Kaspa L1                |
|  DEX   | | Lending| | Stable |        |  +-----+ +-------+ +-------+    |
|        | |        | |        |        |  | DEX | |Lending| |Stable |    |
+--------+ +--------+ +--------+        |  +-----+ +-------+ +-------+    |
     |           |           |           |     \       |        /          |
  [bridge]    [bridge]    [bridge]       |      Atomic composition         |
     |           |           |           |       Single L1 transaction     |
  Fragmented liquidity                   +----------------------------------+
  Async finality                           Unified liquidity
  Bridge risk                              Instant finality
  Centralized sequencers                   No bridge risk
```

vProgs counter this centralizing force by guaranteeing cross-vProg atomicity on L1.

---

## How It Works

### Cross-vProg Atomicity

Transactions can establish dependencies across mutually trustless vProgs:

1. Read state from one program
2. Use that state as input to write to another program
3. All within a single atomic L1 transaction
4. Correctness guaranteed by mathematical cryptographic proof, not economic assumptions

### Transaction Flow for Cross-vProg Operations

```
Transaction x declares:
  r(x) = {acct_A1, acct_A2, acct_B1}     <- reads from vProg A and vProg B
  w(x) = {acct_A1}                        <- writes only to vProg A
  pi(x) = {witness_B1}                    <- concise witness for acct_B1

Steps:
  1. Transaction reads all declared-read accounts (acct_A1, acct_A2, acct_B1)
  2. For cross-vProg read (acct_B1): verify concise witness from vProg B
  3. Execute vProg A logic using all read data
  4. Write new state to acct_A1
  5. Submit proof covering the full operation
  6. L1 verifies atomically -- all-or-nothing
```

### Trustless Dependencies

When a transaction reads from `vProg_B` and writes to `vProg_A`:

- The transaction must provide all witness data from `vProg_B` (concise Merkle proofs)
- Gas must be paid to `vProg_A` for resource consumption
- The **scope** of the operation spans state transitions between the current transaction and the latest ZK-anchored witness

---

## Concise Witnesses

The key enabler of synchronous composability is the **concise witness** mechanism.

### Structure

Each vProg maintains state commitments as hierarchical Merkle roots:

```
C_p^t = MerkleRoot(
  state_root_step_1,
  state_root_step_2,
  ...
  state_root_step_n
)
```

The commitment `C_p^t` is a Merkle root over per-step state roots since the last proof submission. Any intermediate account state can be proven with a compact Merkle inclusion proof.

### Cross-vProg Verification

```
vProg A wants to read acct_B1 from vProg B:

vProg B's state commitment:
  C_B^t = MerkleRoot(...)
            |
            +-- state_root_step_k
                  |
                  +-- acct_B1 state = S    <-- target
                  |
                  +-- [sibling hashes]     <-- witness path

Concise witness = Merkle inclusion proof:
  (S, [sibling_1, sibling_2, ..., sibling_log_n])

Verification:
  Recompute root from S + siblings
  Compare against C_B^t (which is ZK-anchored on L1)
  If match: acct_B1 provably had state S at time t
```

This allows `vProg_A` to instantly verify `vProg_B`'s state in the same transaction. The witness is compact (logarithmic in accounts and steps) and verifiable without any interaction with `vProg_B`'s prover.

---

## Read-Fail Safeguards

Two critical safety mechanisms prevent failure modes in cross-vProg operations:

### 1. Read-First Ordering

Transactions must begin by reading all declared-read accounts before performing any writes. This ensures that if a read fails (e.g., stale witness, invalid state), the failure is detected before any state is modified.

```
Correct ordering:
  1. Read acct_A1     (own vProg)
  2. Read acct_B1     (cross-vProg, via witness)    <- fail here = no side effects
  3. Compute new state
  4. Write acct_A1    (own vProg)

Prevented:
  1. Write acct_A1    <- state modified
  2. Read acct_B1     <- if this fails, acct_A1 is already corrupted
```

### 2. Gas Commitment Protection

Gas commitments prevent "failure to write to declared accounts" from causing negative consequences. If a transaction declares a write set but fails to complete all writes, the gas commitment mechanism ensures the transaction is rolled back entirely.

---

## Continuous Account Dependency (CAD)

For vProgs that frequently interact, the CAD mechanism provides optimized persistent cross-vProg dependencies:

### Problem

Without CAD, every cross-vProg read requires a fresh concise witness. For vProgs that interact on every transaction (e.g., a DEX that always reads a price oracle), this creates redundant witness overhead.

### Solution

CAD establishes a **persistent dependency link** between vProgs:

- Funded by the initiating vProg
- Reduces per-transaction overhead for repeated composable operations
- The dependent vProg's state is continuously tracked rather than re-witnessed per transaction
- Economically rational when the cost of maintaining the dependency is less than the cost of repeated witnesses

### CAD vs. Per-Transaction Witnesses

| Property | Per-Transaction Witness | CAD |
|----------|------------------------|-----|
| Cost per read | Witness generation + verification | Amortized (near zero per txn) |
| Setup cost | None | Initial funding |
| Maintenance | None | Continuous funding |
| Best for | Occasional cross-vProg reads | Frequent/continuous reads |
| Flexibility | Any vProg, any time | Pre-established pairs |

---

## Parallelism-Aware Gas

The gas model for synchronous composability accounts for the parallelism opportunities inherent in the architecture.

### Two Externalities

Cross-vProg transactions create two distinct types of computational work:

1. **Witness/scope computation** -- can be parallelized across provers
   - Verifying concise witnesses
   - Computing scope from the [Computation DAG](/architecture/account-model)
   - Generating Merkle proofs

2. **New transaction computation** -- creates sequential dependencies
   - Executing state transition logic
   - Generating new state commitments
   - Creating dependency edges in the Computation DAG

### Weighted Area Gas Functions

The proposed gas model uses **Weighted Area** functions that price these two externalities differently:

```
gas(tx) = w_parallel * parallel_work(tx) + w_sequential * sequential_work(tx)
```

Where:
- `w_parallel` is lower (parallel work is cheaper per unit)
- `w_sequential` is higher (sequential work creates bottlenecks)
- The weights incentivize transaction patterns that maximize parallelism

### MEV Resistance

The gas model contributes to MEV resistance:

- Deterministic, synchronous execution eliminates timing-based extraction
- Pre-declared read/write sets prevent front-running via account-level ordering
- Bundled atomic operations cannot be unbundled by miners
- No latency-based front-running opportunities at the sequencing layer

---

## DeFi Example: Borrow-Swap-Stake

The canonical example of synchronous composability in action:

### Traditional L2 Approach

```
Step 1: Borrow stablecoins on Rollup A
  -> Wait for finality (minutes to hours)
Step 2: Bridge stablecoins to Rollup B
  -> Wait for bridge confirmation (minutes to hours)
  -> Risk: bridge exploit, stuck funds
Step 3: Swap stablecoins on Rollup B DEX
  -> Wait for finality
Step 4: Bridge swapped tokens to Rollup C
  -> Wait for bridge confirmation
Step 5: Stake tokens on Rollup C

Total time: Minutes to hours
Transactions: 5+
Bridge risk: 2 bridge crossings
Liquidity: Fragmented across 3 rollups
Failure mode: Partial completion possible
```

### vProgs Approach

```
Step 1: Off-chain prover computes all operations:
  - Borrow from Lending vProg (read/write)
  - Swap on DEX vProg (read/write, reads Lending state via witness)
  - Stake on Staking vProg (read/write, reads DEX state via witness)

Step 2: Generate combined ZK proof (proof stitching)
  - Single proof covers all three state transitions
  - Cross-vProg witnesses included in proof

Step 3: Submit single atomic transaction to L1
  - L1 verifies one proof
  - All three state transitions finalize atomically

Step 4: Instant finality via DagKnight

Total time: Seconds (proof generation) + instant (finality)
Transactions: 1
Bridge risk: None
Liquidity: Unified on L1
Failure mode: All-or-nothing (atomic)
```

### What Makes This Possible

```
+-----------+          +-----------+          +-----------+
| Lending   |  witness | DEX       |  witness | Staking   |
| vProg     |--------->| vProg     |--------->| vProg     |
|           |          |           |          |           |
| borrow()  |          | swap()    |          | stake()   |
+-----------+          +-----------+          +-----------+
     |                      |                      |
     v                      v                      v
+-----------------------------------------------------------+
|              Single Atomic L1 Transaction                  |
|  Proof: pi_combined = stitch(pi_lend, pi_swap, pi_stake)  |
+-----------------------------------------------------------+
     |
     v
+-----------------------------------------------------------+
|              Instant Finality (DagKnight)                  |
+-----------------------------------------------------------+
```

---

## Unified Liquidity

Synchronous composability preserves unified L1 liquidity:

- All vProgs share the same L1 settlement state
- No liquidity fragmentation across isolated environments
- No bridge risks or cross-chain complexity
- Every vProg can interact with every other vProg atomically
- True decentralization -- no rollup monopolies controlling liquidity

### Network Effects

Unified liquidity creates positive network effects:

1. New vProgs can immediately access existing liquidity pools
2. Users do not need to bridge assets to use new applications
3. Arbitrage is instantaneous and atomic, improving price efficiency
4. Composable primitives can be combined in novel ways without permission

---

## Phasing

Synchronous composability is a **Phase 2** capability:

### Phase 1 (Current Target): Standalone vProgs

- Each vProg operates independently
- No cross-vProg reads or writes
- Each vProg is a single [KIP-21 lane](/architecture/sequencing)
- The "degenerate" CD groups activity by program, not account

### Phase 2: Full Synchronous Composability

- Extended Computation DAG with per-account vertices
- Cross-vProg atomic transactions via concise witnesses
- Continuous Account Dependency mechanism
- Weighted Area gas model
- Proof stitching for multi-vProg operations

The transition preserves KIP-21's outer machinery -- only the lane-local update rules change. See [KIP-21 to vProgs Mapping](/architecture/sequencing-mapping) for details.

---

## Open Design Questions

Several aspects of synchronous composability remain under active research:

| Question | Description |
|----------|-------------|
| **Witness storage** | Transient vs. permanent storage for concise witnesses |
| **Off-chain broadcasting** | Gossip protocol complexity for witness distribution |
| **vProg vetting** | Prerequisites for deploying a composable vProg |
| **Source code availability** | Enforcement mechanisms for vProg code transparency |
| **Scope explosion** | Managing dependency chains across many vProgs |

The [formal analysis](/architecture/execution-model) using Erdos-Renyi random graph models provides quantitative bounds on scope growth, establishing that frequent proof submissions keep dependencies manageable.

---

## Further Reading

- [Architecture Overview](/architecture/overview) -- how composability fits the four-pillar architecture
- [Account Model & State](/architecture/account-model) -- the account structure enabling cross-vProg reads
- [Execution Model](/architecture/execution-model) -- scope computation and proof generation
- [L1 Sequencing (KIP-21)](/architecture/sequencing) -- the lane infrastructure composability builds on
- [Concrete proposal for synchronously composable vProgs](https://research.kas.pa/t/concrete-proposal-for-a-synchronously-composable-verifiable-programs-architecture/387)
- [Formal backbone model for vProg computation DAG](https://research.kas.pa/t/zoom-in-a-formal-backbone-model-for-the-vprog-computation-dag/407)
