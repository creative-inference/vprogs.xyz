---
layout: page
title: "Execution Model"
section: architecture
---

The vProgs execution model separates computation from verification: complex logic runs off-chain, producing a ZK proof that L1 validates in constant time. The L1 never re-executes any vProg computation. This design enables horizontal scaling through a permissionless prover market while keeping L1 node requirements low.

---

## Execution Lifecycle

A vProg state transition follows a six-step lifecycle:

```
+----------+     +-----------+     +------------+     +-----------+
| 1. DEFINE |---->| 2. EXECUTE |---->| 3. PROVE   |---->| 4. SUBMIT |
| User txn  |     | Off-chain  |     | Generate   |     | Proof to  |
| declares  |     | prover runs|     | ZK proof   |     | L1        |
| r(x),w(x) |     | vProg logic|     |            |     |           |
+----------+     +-----------+     +------------+     +-----------+
                                                            |
                                                            v
                                                     +-----------+
                                                     | 5. VERIFY |
                                                     | L1 checks |
                                                     | proof via |
                                                     | KIP-16    |
                                                     +-----------+
                                                            |
                                                            v
                                                     +-----------+
                                                     | 6. FINALIZE|
                                                     | DagKnight |
                                                     | instant   |
                                                     | finality  |
                                                     +-----------+
```

### Step 1: Transaction Definition

The user constructs a transaction specifying:

- **Read set `r(x)`** -- accounts the transaction will read
- **Write set `w(x)`** -- accounts the transaction will modify (must be a subset of `r(x)`)
- **Witness set `pi(x)`** -- dependency resolution data, including concise witnesses for any cross-vProg reads
- **State transition parameters** -- the inputs to the vProg's logic

### Step 2: Off-Chain Execution

An off-chain prover executes the vProg's state transition function:

1. Loads the current state of all accounts in `r(x)`
2. Applies the vProg's deterministic logic
3. Produces the new state for all accounts in `w(x)`
4. Records the full execution trace for proof generation

The prover is not trusted -- correctness is guaranteed by the ZK proof, not by the prover's identity or reputation.

### Step 3: Proof Generation

The prover generates a ZK proof `pi` attesting that the state transition was computed correctly. The proof object `z_p^i` contains:

| Component | Description |
|-----------|-------------|
| ZK proof `pi` | Cryptographic attestation of correct execution |
| State commitment `C_p^t` | Merkle root over the state history since last proof |
| Time reference `t` | Anchoring point in the global sequence `T` |

### Step 4: L1 Submission

The proof is submitted to L1 as part of a transaction. The submission targets the vProg's L1 covenant, which enforces the verification logic via [KIP-16 verifier opcodes](/architecture/zk-verification).

### Step 5: L1 Verification

L1 nodes validate the proof:

- Verify the ZK proof against the state commitment
- Check that the proof anchors correctly to the sequencing chain (via [KIP-21](/architecture/sequencing))
- Confirm covenant conditions are satisfied
- **No re-execution of vProg logic** -- verification is constant-time

### Step 6: Finalization

Once the proof is included in the BlockDAG and ordered by [DagKnight](/architecture/dagknight), the state transition achieves instant finality. The new state commitment becomes the authoritative state for the vProg.

---

## Scope Computation

The **scope** of a transaction is the set of historical state transitions that a prover must process to generate a valid proof. Scope determines the cost of proof generation.

### Scope Definition

```
scope(x) = all state transitions between:
  - the current transaction x
  - the latest ZK-anchored witness (proven state)
  for each account in r(x)
```

### Scope Traversal

To compute scope, the prover traverses the [Computation DAG](/architecture/account-model) backward from the transaction's read set:

1. Start from the read-set vertices `{(a, t) | a in r(x)}`
2. Follow edges backward through the computation DAG
3. Stop at anchor points (previously proven states)
4. All vertices encountered constitute the scope

```
Anchor          Scope for tx_5          tx_5
  |             [===============]        |
  v                                      v
--[proof]--tx_1--tx_2--tx_3--tx_4------[tx_5]-->
```

### Scope Size and Cost

Scope size directly determines proof generation cost:

- **Smaller scope** = less computation = cheaper and faster proofs
- **Larger scope** = more computation = more expensive and slower proofs
- **Proof latency impacts scope**: longer intervals between proof submissions mean larger scopes for subsequent proofs

This creates a natural economic incentive for frequent proof submissions -- provers that submit more often reduce scope sizes for future transactions, lowering costs for users.

---

## Proof Anchoring

Proof anchoring is the mechanism by which verified ZK proofs create trusted checkpoints in the computation DAG.

### How Anchoring Works

```
Before proof at t3:
  States:  s1 -> s2 -> s3 -> s4 -> s5
  Scope:   [=========================] (full history)

After proof verified at t3:
  States:  [proven] -> s4 -> s5
  Scope:              [=======] (from anchor)

  s1, s2, s3 can be pruned -- their correctness
  is cryptographically guaranteed by the proof
```

Anchoring provides:

- **History compression** -- proven state can be treated as axiomatic
- **Scope reduction** -- future transactions only trace back to the nearest anchor
- **Storage efficiency** -- pre-anchor state can be pruned
- **Proof pipeline acceleration** -- conditional proofs can begin from unverified anchors

### The Two-Anchor Proof Model

KIP-21 specifies a two-anchor model for lane-based proving:

```
Anchor B_start                           Anchor B_end
     |                                        |
     v                                        v
  SeqCommit(B_start)                    SeqCommit(B_end)
     |                                        |
  include lane in                        include lane in
  ActiveLanes(B_start)                   ActiveLanes(B_end)
     |                                        |
     +--- compressed lane-local diff ---------+
          lane_tip(L, start) => lane_tip(L, end)
```

1. The prover provides two global anchors: `SeqCommit(B_start)` and `SeqCommit(B_end)`
2. Provides lane-inclusion witnesses under both anchors (SMT proofs)
3. Provides a compressed lane-diff witness between the anchors
4. **Proof size is O(lane activity), not O(total chain blocks)**

---

## Conditional Proofs

Conditional proofs are an optimization for pipelined proof generation:

### Concept

A conditional proof takes as input the state commitment of a **potentially unproven** prior segment. The proof is valid conditional on that prior commitment being eventually verified.

```
Segment 1          Segment 2          Segment 3
[s1...s100]        [s101...s200]      [s201...s300]

Proof 1: proves s1->s100 (unconditional)
Proof 2: proves s101->s200, GIVEN s100 is correct (conditional on Proof 1)
Proof 3: proves s201->s300, GIVEN s200 is correct (conditional on Proof 2)
```

### Benefits

- **Pipeline parallelism:** Proofs for consecutive segments can be generated in parallel
- **Reduced latency:** No need to wait for Proof 1 verification before starting Proof 2
- **Efficient catch-up:** A prover falling behind can parallelize recovery across multiple segments

### Resolution

Conditional proofs resolve to unconditional proofs once their dependencies are verified. If a dependency fails (the prior commitment is incorrect), all conditional proofs depending on it are invalidated.

---

## Prover Market

The vProgs architecture establishes a permissionless, competitive prover market:

### Properties

- **Permissionless:** Any party can act as a prover for any vProg
- **Competitive:** Provers compete on speed and cost
- **Horizontally scalable:** Total capacity grows with prover count
- **Trustless:** Correctness is guaranteed by the ZK proof, not prover identity

### Prover Incentives

- **Fee revenue:** Provers earn fees for generating valid proofs
- **Scope economics:** More frequent proofs = smaller scopes = lower per-proof cost
- **Specialization:** Provers can optimize for specific vProgs or ZK stacks
- **No slashing risk:** Unlike validators, provers only risk computation costs -- a failed proof attempt costs compute time but incurs no penalty

### Prover Architecture

```
+-------------------+     +-------------------+     +-------------------+
|   Prover Pool A   |     |   Prover Pool B   |     |   Prover Pool C   |
|   (vProg: DEX)    |     |   (vProg: Lending) |     |   (vProg: NFT)   |
+-------------------+     +-------------------+     +-------------------+
         |                         |                         |
         v                         v                         v
+-------------------------------------------------------------------+
|                     Kaspa L1 (Verification Only)                   |
|  KIP-16 ZK opcodes  |  KIP-21 lane commitments  |  DagKnight      |
+-------------------------------------------------------------------+
```

Each prover pool operates independently on its target vProg's state. Provers within a pool compete to submit valid proofs first, and the L1 accepts the first valid proof it encounters.

---

## Witness Generation

Witnesses are the data structures that accompany transactions to enable verification:

### Types of Witnesses

| Witness Type | Purpose | Used By |
|-------------|---------|---------|
| **State witness** | Proves an account's current state | Single-vProg transactions |
| **Concise witness** | Proves cross-vProg account state via Merkle inclusion | Cross-vProg reads |
| **Lane-diff witness** | Proves lane state transition between two anchors | Provers submitting to L1 |
| **SMT inclusion witness** | Proves lane membership in active-lanes tree | Anchor verification |

### Concise Witness Construction

A concise witness for account `a` in vProg `p` at time `t` is a Merkle inclusion proof:

```
C_p^t (commitment root)
   |
   +-- state_root_step_k
          |
          +-- account_state(a)   <-- target
          |
          +-- [sibling hashes]   <-- witness path
```

The witness proves that `account_state(a)` is committed under `C_p^t` without revealing any other account state. Witness size is logarithmic in the number of accounts and steps.

### Witness Storage

An open design question is the storage convention for witnesses:

- **Transient storage:** Witnesses exist only during the proof window, then are discarded
- **Persistent storage:** Historical witnesses are maintained for historical queries
- KIP-21 specifies an optional **content-addressed witness store** with reference-counted garbage collection

---

## Scalability Analysis

### Erdos-Renyi Model

The formal analysis uses random graph theory to model dependency formation in the computation DAG:

- **Phase transition threshold:** `F < N/q`
  - `F` = proof epoch length (time between proofs)
  - `N` = number of vProgs
  - `q` = average cross-vProg dependency rate

- **Below threshold:** Dependencies remain manageable, O(log N) average scope
- **Above threshold:** Giant dependency components form, scope explodes

### Practical Implication

Systems must maintain proof submission frequency high enough to keep epoch lengths below the critical threshold. This creates a self-regulating dynamic:

1. High cross-vProg dependency rate `q` requires more frequent proofs
2. More frequent proofs reduce scope sizes
3. Smaller scopes reduce proof generation cost
4. Lower costs attract more provers
5. More provers enable higher proof frequency

---

## Implementation: vProgs Repository

The official implementation at [github.com/kaspanet/vprogs](https://github.com/kaspanet/vprogs) follows a layered Rust monorepo architecture:

```
core -> storage -> state -> scheduling -> transaction-runtime -> node
```

Dependencies flow downward only. Key components:

| Layer | Responsibility |
|-------|---------------|
| `core` | Primitive types and interfaces |
| `storage` | Persistent state storage |
| `state` | Account state management |
| `scheduling` | Transaction ordering and parallelism |
| `transaction-runtime` | Execution environment |
| `node` | Network integration and L1 bridge |

Notable PRs:
- [PR #7](https://github.com/kaspanet/vprogs/pull/7) -- L1 bridge implementation
- [PR #10](https://github.com/kaspanet/vprogs/pull/10) -- Reorg filter with halving-based denoising
- [PR #13](https://github.com/kaspanet/vprogs/pull/13) -- Rollback/pruning coordination
- [PR #14](https://github.com/kaspanet/vprogs/pull/14) -- ChainBlockMetadata

---

## Further Reading

- [Account Model & State](/architecture/account-model) -- the account structure that execution operates on
- [ZK Verification](/architecture/zk-verification) -- how L1 verifies the proofs generated here
- [L1 Sequencing (KIP-21)](/architecture/sequencing) -- how proofs anchor into the sequencing chain
- [Synchronous Composability](/architecture/composability) -- how execution enables cross-vProg atomicity
- [Formal backbone model for vProg computation DAG](https://research.kas.pa/t/zoom-in-a-formal-backbone-model-for-the-vprog-computation-dag/407)
