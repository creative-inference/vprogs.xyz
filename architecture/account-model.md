---
layout: page
title: "Account Model & State"
description: "Learn how vProgs use a Solana-inspired account model with pre-declared read/write sets to enable parallel transaction processing on Kaspa's BlockDAG."
section: architecture
---

The vProgs account model draws inspiration from Solana's design: accounts hold state data, and transactions pre-declare the accounts they will read and write. This pre-declaration is the key enabler of parallel processing on Kaspa's BlockDAG -- the system can identify non-conflicting transactions and process them concurrently without risking state corruption.

---

## Core Design

### Accounts as State Containers

In the vProgs model, an **account** is a stateful data container owned by a specific vProg. Each vProg `p` owns an exclusive set of accounts `S_p`:

- Accounts hold arbitrary state data relevant to the owning vProg
- Write access to `S_p` is exclusive to vProg `p` -- no other program can modify these accounts
- Read access is permissioned across programs, enabling cross-vProg composability
- Each account has a well-defined state at every point in the global sequence `T`

### Sovereign Ownership

The exclusivity of account ownership is a foundational security property:

```
vProg A                    vProg B                    vProg C
+-----------+              +-----------+              +-----------+
| Account 1 |              | Account 4 |              | Account 7 |
| Account 2 |              | Account 5 |              | Account 8 |
| Account 3 |              | Account 6 |              | Account 9 |
+-----------+              +-----------+              +-----------+
     S_a                        S_b                        S_c

  - Write: only A             - Write: only B             - Write: only C
  - Read: A, B, C (*)         - Read: A, B, C (*)         - Read: A, B, C (*)

(*) Cross-vProg reads require concise witnesses
```

This design means:

- **No shared mutable state** between programs -- eliminates reentrancy attack classes
- **Independent failure domains** -- a bug in vProg A cannot corrupt vProg B's state
- **Per-vProg resource regulation** -- each program controls its own gas scales and STORM constants
- **Parallel proving** -- provers for different vProgs can operate without coordination

---

## Transaction Structure

Each transaction `x` specifies three sets:

| Set | Symbol | Description |
|-----|--------|-------------|
| **Read set** | `r(x)` | Accounts the transaction will read |
| **Write set** | `w(x)` | Accounts the transaction will modify |
| **Witness set** | `pi(x)` | Dependency resolution data (concise witnesses) |

A critical constraint: **`w(x)` must be a subset of `r(x)`** -- every account that is written must also be read. This ensures that the transaction has full context for any state it modifies.

### Pre-Declaration Benefits

Declaring read/write sets upfront provides several architectural advantages:

1. **Parallel scheduling:** Non-conflicting transactions (disjoint write sets) can be processed concurrently on the BlockDAG
2. **Deterministic conflict detection:** The sequencing layer can identify and correctly serialize conflicting operations
3. **Scope computation:** Provers can determine exactly which state they need to access
4. **Gas estimation:** Resource costs can be calculated before execution
5. **MEV resistance:** Deterministic scheduling reduces front-running opportunities

---

## Computation DAG

The account model gives rise to a **Computation DAG (CD)** -- a directed acyclic graph that tracks dependencies between account states across time.

### Vertices and Edges

- **Vertices:** `v = (a, t)` -- represent account `a`'s state at time `t` in the global sequence
- **Hyperedges:** Transactions connect input vertices (reads) to output vertices (writes)

```
Time -->   t1         t2         t3         t4

Acct A:    v(A,t1) ---------> v(A,t3) ----------> v(A,t4)
                   \                  /
                    \   tx_2         / tx_3
                     \              /
Acct B:    v(B,t1) -> v(B,t2) ----+
                     tx_1

tx_1: reads A,B; writes B
tx_2: reads A; writes A
tx_3: reads A,B; writes A
```

Dynamic dependency relationships form naturally as transactions reference each other's outputs. This graph structure is what enables:

- **Scope computation** -- tracing backward to find what state a prover needs
- **Proof anchoring** -- compressing history at proven checkpoints
- **Parallelism identification** -- finding non-conflicting transaction sets

### State Compression via Proof Anchoring

When a ZK proof is submitted and verified, it creates a **trustless anchor point** in the computation DAG. This enables:

- **Historical vertex deletion:** State before the anchor can be pruned
- **Reduced scope computation:** Future transactions only need to trace back to the nearest anchor
- **Efficient state verification:** The anchor's state commitment is cryptographically guaranteed

```
Before anchoring:
  v1 -> v2 -> v3 -> v4 -> v5 -> v6 -> v7 -> v8
  [------- full scope for proving v8 ---------]

After anchoring at v5 (ZK proof verified):
  [pruned] -> [anchor v5] -> v6 -> v7 -> v8
              [-- reduced scope for v8 --]
```

---

## State Commitments

Each vProg's state is periodically committed to L1 via a hierarchical Merkle structure:

```
C_p^t = MerkleRoot(
  state_root_step_1,
  state_root_step_2,
  ...
  state_root_step_n
)
```

Where each `state_root_step_i` is the Merkle root of all account states in `S_p` at step `i` since the last proof submission.

### Concise Witnesses

This hierarchical structure enables **concise witnesses** -- compact Merkle inclusion proofs that attest to a specific account's state at a specific time. A concise witness proves:

> "Account `a` in vProg `p` had state `s` at time `t`"

...with a proof size logarithmic in the number of accounts and steps.

Concise witnesses are the mechanism that enables [synchronous composability](/architecture/composability): when `vProg_A` needs to read state from `vProg_B`, it provides a concise witness as part of the transaction's witness set `pi(x)`.

---

## Parallelism on the BlockDAG

The pre-declared read/write sets interact with Kaspa's BlockDAG structure to enable parallel processing:

### Conflict Detection

Two transactions `x` and `y` **conflict** if their write sets overlap:

```
conflict(x, y)  <=>  w(x) intersection w(y) != empty set
```

Non-conflicting transactions can be processed in any order or in parallel. Conflicting transactions must be serialized.

### DAG-Aware Scheduling

The BlockDAG naturally enables parallel block production. With pre-declared account sets:

1. Miners include transactions in parallel blocks
2. DagKnight provides precise ordering of these parallel blocks
3. Conflicting transactions in parallel blocks are correctly serialized by consensus
4. Non-conflicting transactions execute in parallel, regardless of block ordering

```
Block 1 (miner A):          Block 2 (miner B):
  tx_1: w={acct_1}            tx_2: w={acct_3}      <-- no conflict,
  tx_3: w={acct_2}            tx_4: w={acct_4}          parallel OK

Block 3 (miner C):
  tx_5: w={acct_1}                                   <-- conflicts with
                                                         tx_1, serialized
                                                         by DagKnight
```

### Scaling Properties

The parallelism scales with the number of independent account domains:

- A network with 1000 active vProgs, each with disjoint accounts, can process 1000 streams of transactions in parallel
- Cross-vProg reads do not create write conflicts (read-only access)
- Only cross-vProg writes (which are forbidden -- write access is exclusive) would create inter-program conflicts

---

## Resource Management

Each vProg autonomously controls its own resource economy:

### Gas Scales

Custom pricing for computation within a vProg. A compute-intensive vProg (e.g., ZK proof aggregation) can set higher gas prices than a simple token transfer vProg.

### STORM Constants

Regulate state growth and throughput per vProg:

- **Storage growth rate** -- how fast accounts can be created
- **Throughput caps** -- maximum transactions per epoch
- **State size limits** -- bounds on total account data

### Storage Costs

Transactions requiring permanent storage must compensate per the vProg's defined scales. This internalizes the externality of state bloat -- the vProg's users pay for the state they consume.

---

## Phase 1 vs. Phase 2 Account Model

### Phase 1: Standalone (Current Target)

In Phase 1, the L1 has **no notion of individual accounts** within a vProg:

- L1 is aware only of the overall vProg entity through its L1 covenant
- The "degenerate" CD commit scheme groups activity by programs/subnets, not accounts
- Each vProg is modeled as a single KIP-21 lane
- Account-level state management is entirely internal to the vProg

### Phase 2: Full Account Model

In Phase 2, the L1 gains awareness of per-account state:

- Extended Computation DAG with per-account vertices
- Cross-vProg atomic transactions via concise witnesses
- Account-level read/write declarations in transactions
- Full [synchronous composability](/architecture/composability)

The transition from Phase 1 to Phase 2 does not change the KIP-21 outer machinery -- only the lane-local update rules change from program-level to account-level.

---

## Comparison to Other Models

| Property | EVM (Ethereum) | Solana | vProgs |
|----------|---------------|--------|--------|
| State model | Global shared state | Account-based with pre-declaration | Account-based with pre-declaration |
| Write access | Any contract can call any other | Programs own accounts | Exclusive write per vProg |
| Read access | Unrestricted | Unrestricted | Permissioned via concise witnesses |
| Execution | On-chain re-execution | On-chain parallel execution | Off-chain, ZK-verified |
| Conflict handling | Serial (single thread) | Parallel (non-conflicting) | Parallel (BlockDAG + pre-declaration) |
| Reentrancy risk | Yes (shared mutable state) | Mitigated (program ownership) | Eliminated (exclusive write + ZK) |
| State bloat | Global problem | Global problem | Per-vProg regulation |

---

## Further Reading

- [Execution Model](/architecture/execution-model) -- how off-chain computation produces proofs
- [Synchronous Composability](/architecture/composability) -- how concise witnesses enable cross-vProg reads
- [L1 Sequencing (KIP-21)](/architecture/sequencing) -- how lanes map to vProg state
- [Formal backbone model for vProg computation DAG](https://research.kas.pa/t/zoom-in-a-formal-backbone-model-for-the-vprog-computation-dag/407)
- [Concrete proposal for synchronously composable vProgs](https://research.kas.pa/t/concrete-proposal-for-a-synchronously-composable-verifiable-programs-architecture/387)
