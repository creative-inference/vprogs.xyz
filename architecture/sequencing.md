---
layout: page
title: "L1 Sequencing (KIP-21)"
section: architecture
---

KIP-21 is a consensus-level specification authored by Michael Sutton that replaces Kaspa's monolithic per-chain-block sequencing commitment with a **partitioned lane-based commitment scheme**. It is the foundational infrastructure that vProgs will plug into -- not the vProgs specification itself, but the consensus plumbing that makes vProgs possible.

---

## Why Partitioned Sequencing

Before KIP-21, Kaspa's sequencing commitment (introduced in KIP-15 during the Crescendo hard fork) operated as a single global append-only stream. Every chain block committed to all accepted transactions as one undifferentiated hash chain.

This creates a proving problem: a vProg prover that wants to prove its own application's state transitions must process **the entire chain's activity** -- every transaction in every block, even those unrelated to its program. Proving cost scales as O(global DAG activity).

KIP-21 solves this by partitioning the commitment into **lanes** -- logical application partitions where each lane maintains its own state independently. A vProg prover only needs to process its own lane's activity, achieving **O(lane activity) proving cost**.

```
Before KIP-21 (monolithic):
  Block 1: [tx_A, tx_B, tx_C, tx_D]  -- all committed as one stream
  Block 2: [tx_E, tx_F, tx_G]
  Prover for App A must process ALL transactions

After KIP-21 (partitioned):
  Block 1: Lane A: [tx_A]   Lane B: [tx_B, tx_C]   Lane C: [tx_D]
  Block 2: Lane A: [tx_E]   Lane B: [tx_F]          Lane C: [tx_G]
  Prover for App A processes ONLY Lane A transactions
```

---

## Core Concept: Application Lanes

A **lane** is a logical application partition with:

- Its own **recursive tip hash** (`lane_tip_hash`) -- a hash chain of all activity in that lane
- A **last-touch blue score** -- tracking when the lane was last active
- Membership in an **active lanes sparse Merkle tree** (SMT)

Currently, lanes are extracted from `tx.subnetwork_id`. Future KIPs will define vProg-based lane families using the same outer machinery. The key insight from the specification:

> "A vProg can be modeled as a lane under this KIP, just as subnets are modeled as lanes today."

---

## Commitment Structure

The block header still exposes a single 32-byte `accepted_id_merkle_root` field, but post-activation it encodes a layered commitment:

```
SeqCommit(B) = H_seq( SeqCommit(parent(B)),  SeqStateRoot(B) )
                                                    |
                            SeqStateRoot(B) = H_seq( ActiveLanesRoot(B),
                                                     H_seq( MergesetContextHash(B),
                                                            MinerPayloadRoot(B) ))
```

### Components

| Component | Purpose |
|-----------|---------|
| `SeqCommit(B)` | The header value -- chained through selected-parent ancestry |
| `SeqStateRoot(B)` | Per-block state combining all sub-components |
| `ActiveLanesRoot(B)` | 256-depth SMT root over all active lane tips |
| `MergesetContextHash(B)` | Block context: timestamp, DAA score, blue score |
| `MinerPayloadRoot(B)` | Merkle root over coinbase payloads from all mergeset blocks |

### Commitment Tree

```
                   SeqCommit(B)
                  /            \
    SeqCommit(parent(B))    SeqStateRoot(B)
                           /                \
              ActiveLanesRoot(B)       H_seq(ctx, miners)
              /           \           /              \
         [SMT over     lane tips]  MergesetContext   MinerPayload
          active lanes            Hash(B)            Root(B)
```

The path from `SeqCommit(B)` to any lane's state is deterministic:

```
SeqCommit(B)
  -> right child: SeqStateRoot(B)
    -> left child: ActiveLanesRoot(B)
      -> SMT path by lane_key: leaf_hash for target lane
```

---

## Hashing Specification

All hash functions use **BLAKE3 with explicit domain separation tags**:

| Symbol | Domain Tag | Usage |
|--------|-----------|-------|
| `H_lane_key` | `"SeqCommitLaneKey"` | Lane key derivation |
| `H_lane_tip` | `"SeqCommitLaneTip"` | Lane tip hash update |
| `H_activity_leaf` | `"SeqCommitActivityLeaf"` | Per-transaction activity leaf |
| `H_mergeset_context` | `"SeqCommitMergesetContext"` | Block context hash |
| `H_leaf` | `"SeqCommitActiveLeaf"` | SMT leaf hash |
| `H_node` | `"SeqCommitActiveNode"` | SMT internal node hash |
| `H_seq` | `"SeqCommitmentMerkleBranchHash"` | Commitment tree branch |

Domain separation prevents second-preimage attacks across different hash contexts.

---

## Per-Block State Transition

For each chain block `B`, two operations occur:

### 1. Touched Lanes Are Updated

For each lane touched by transactions in block `B`:

1. Compute an **activity digest** -- Merkle root over per-transaction activity leaves:
   ```
   activity_leaf(tx) = H_activity_leaf(tx_digest(tx) || le_u32(merge_idx(tx)))
   activity_digest_lane(B) = MerkleRoot([activity_leaf(tx) for tx in LaneTxList(B, lane)])
   ```

2. Determine the parent reference:
   - If the lane is already active: chain from its previous `lane_tip_hash`
   - If the lane is new or reactivated after purge: anchor to `SeqCommit(parent(B))`

3. Compute the new tip:
   ```
   new_tip = TipUpdateHash(parent_ref, lane_id_bytes, activity_digest, MergesetContextHash(B))
   ```

4. Record the block's blue score as the lane's `last_touch_blue_score`

### 2. Stale Lanes Are Purged

Lanes are purged after a fixed inactivity threshold `F` (measured in blue score units):

```
Purge if: ActiveLanes[lane].last_touch_blue_score + F <= B.blue_score
```

This ensures bounded memory -- the active set scales with recent activity, not historical diversity. A lane that goes inactive for longer than `F` blue-score units is removed from the SMT and must re-anchor to `SeqCommit(parent(B))` if reactivated.

---

## The Two-Anchor Lane Proof Model

This is the proving model that vProg provers will use to submit state transitions to L1.

```
Anchor B_start                                    Anchor B_end
    |                                                  |
    v                                                  v
 include lane under                            include lane under
 ActiveLanes(B_start)                          ActiveLanes(B_end)
    |                                                  ^
    |                                                  |
    +---------- compressed lane-local tip transition --+
              lane_tip(L, B_start) => ... => lane_tip(L, B_end)
```

### Proof Steps

1. **Provide two global anchors:** `SeqCommit(B_start)` and `SeqCommit(B_end)` -- these are header values that any L1 node can look up
2. **Provide lane-inclusion witnesses:** SMT inclusion proofs showing the lane exists under both `ActiveLanesRoot(B_start)` and `ActiveLanesRoot(B_end)`
3. **Provide a compressed lane-diff witness:** Proof of all lane-tip transitions between the two anchors

**Proof size is O(lane activity), not O(total chain blocks)** -- this is the fundamental scalability property that makes per-vProg proving feasible.

### Why Two Anchors

The two-anchor model provides:

- **Bounded scope:** The prover only needs to account for activity between two known points
- **Verifiable anchoring:** Both anchors are L1 header values, verifiable by any node
- **Composability:** Different vProgs can use different anchor pairs without coordination
- **Incremental proving:** Each new proof starts from the previous proof's end anchor

---

## Sparse Merkle Tree Specification

KIP-21 fully specifies the SMT used for `ActiveLanesRoot`:

### Structure

- **Fixed depth:** 256 levels
- **Key:** `lane_key(lane) = H_lane_key(lane_id_bytes(lane))` -- 256-bit, interpreted MSB-first as path
- **Path traversal:** Bit `i` of the key determines left (0) or right (1) at level `i`

### Node Hashing

| Node Type | Hash Rule |
|-----------|-----------|
| Empty leaf | `EMPTY_0 = ZERO_HASH` (32 zero bytes) |
| Empty internal (level i+1) | `EMPTY_{i+1} = H_node(EMPTY_i \|\| EMPTY_i)` |
| Non-empty internal | `H_node(left_child_hash \|\| right_child_hash)` |
| Non-empty leaf | `H_leaf(leaf_payload)` |

### Leaf Payload

```
leaf_payload = lane_id_bytes || lane_tip_hash || le_u64(last_touch_blue_score)
```

### Design Rationale

SMT was chosen over Patricia trie for:

- **Operational simplicity:** Fixed-depth tree, no rebalancing
- **Proof regularity:** Fixed-shape proofs are more uniform for ZK-circuit design
- **Deterministic paths:** Key-based paths, no tree structure dependencies
- **Efficient empty-subtree handling:** Pre-computable empty hashes at each level

---

## Reorg Safety

State is maintained incrementally via reversible per-block diffs (`SeqCommitDiff`), mirroring the existing UTXO-diff strategy:

### Diff Structure

Each diff records:
- **Lane mutations:** insert, update, or remove operations on lane entries
- **Purge-index mutations:** changes to the inactivity tracking index

### Reorg Procedure

```
Reorg from chain A to chain B:

1. Find common ancestor block
2. Walk DOWN chain A from tip to ancestor:
   - Reverse each SeqCommitDiff (undo lane mutations)
3. Walk UP chain B from ancestor to new tip:
   - Apply each SeqCommitDiff (apply lane mutations)
4. New state reflects chain B
```

This procedure ensures that the active-lanes SMT always reflects the currently selected chain, even during reorgs.

---

## IBD (Initial Block Download) at Pruning Point

A new node bootstrapping from the pruning point needs:

| Data | Purpose |
|------|---------|
| Full active-lane leaf data at PP | Reconstruct SMT state |
| `SeqCommit(parent(PP))` | Parent commitment for chaining |
| `MergesetContextHash(PP)` | Block context at pruning point |
| `MinerPayloadRoot(PP)` | Miner payload at pruning point |

These are sufficient to verify `SeqCommit(PP)` and continue normal block processing from that point forward. No historical lane data is required -- the pruning point provides a complete snapshot.

---

## Optional Persistent Witness Store

For provers needing historical witnesses (e.g., proving state from hours ago), KIP-21 describes an optional content-addressed commitment-node store:

```
node_hash -> (left_child_hash, right_child_hash)
```

### Properties

- Covers both `H_seq` nodes (sequencing commitment tree) and SMT internal nodes
- Witnesses are reconstructed by descending from `SeqCommit(B)` through the commitment DAG
- **Garbage collection:** Reference-counted -- increment refs on insertion, decrement on header prune, delete at zero

This store is optional for full nodes but essential for provers that need to construct historical lane proofs.

---

## Block Context Verification

Applications needing verifiable "clock" data can use the block context committed in every chain block:

```
MergesetContextHash(B) = H_mergeset_context(
    le_u64(timestamp) || le_u64(daa_score) || le_u64(blue_score)
)
```

This hash is committed both in `SeqStateRoot(B)` and inside each touched lane-tip update. A ZK proof can reference this data to prove that a state transition occurred at a specific time, DAA score, or blue score -- enabling time-dependent logic without trusting external oracles.

---

## Relationship to Other KIPs

| KIP | Relationship to KIP-21 |
|-----|----------------------|
| **KIP-15** | Predecessor -- introduced recursive `SeqCommit` in Crescendo |
| **KIP-16** | Consumer -- ZK verifier opcodes validate proofs that reference `SeqCommit` anchors |
| **KIP-17** | Complementary -- covenant opcodes manage state alongside lane commitments |
| **KIP-20** | Complementary -- covenant IDs provide UTXO lineage tracking |

The `OpChainblockSeqCommit` opcode (available on TN12) reads the sequencing commitment from chain-block headers, allowing covenant scripts to reference the commitment chain.

---

## Further Reading

- [KIP-21 to vProgs Mapping](/architecture/sequencing-mapping) -- how KIP-21 concepts map to vProgs abstractions
- [Architecture Overview](/architecture/overview) -- how sequencing fits the four-pillar architecture
- [Execution Model](/architecture/execution-model) -- how provers use the two-anchor model
- [ZK Verification](/architecture/zk-verification) -- how proofs are verified against commitments
- [KIP-21 specification](https://github.com/michaelsutton/kips/blob/kip21/kip-0021.md)
- [Subnets Sequencing Commitments (seed design)](https://research.kas.pa/t/subnets-sequencing-commitments/274)
