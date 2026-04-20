---
layout: page
title: "KIP-21 to vProgs Mapping"
description: "Map abstract vProgs concepts to concrete KIP-21 infrastructure: state commitments, lane routing, proof verification, and what remains as future work."
section: architecture
---

KIP-21 specifies the consensus plumbing that vProgs will plug into. This page maps abstract vProgs concepts -- as described in the research proposals and yellow paper -- to concrete KIP-21 infrastructure. It answers: what is already specified, what is partially addressed, and what remains future work?

---

## Concept Mapping Tables

### State Commitments

| vProgs Concept | KIP-21 Implementation | Status |
|---|---|---|
| State commitment `C_p^t` (hierarchical Merkle root) | `ActiveLanesRoot(B)` -- 256-depth SMT over active lane tips | **Implemented** |
| Per-vProg state roots | Lane tip hash (`lane_tip_hash`) chained recursively per lane | **Implemented** |
| Global sequencing of operations `T` | `SeqCommit(B)` chained through selected-parent ancestry | **Implemented** |
| State finalized with instant DAG finality | `SeqCommit(B)` stored in `accepted_id_merkle_root` header field | **Implemented** |

### Concise Witnesses

| vProgs Concept | KIP-21 Implementation | Status |
|---|---|---|
| Concise witnesses (compact Merkle inclusion proofs) | SMT inclusion/non-inclusion proofs under `ActiveLanesRoot` | **Implemented** |
| Cross-vProg state verification | Two-anchor lane proof model | **Implemented** |
| Intermediate state provability | Lane-local compressed tip transition between anchors | **Implemented** |

### L1 Sequencing Layer

| vProgs Concept | KIP-21 Implementation | Status |
|---|---|---|
| L1 as "traffic controller" / immutable sequencing | `SeqCommit(B)` recurrence through selected-parent chain | **Implemented** |
| Transactions pre-declare read/write sets | Lane extraction from `tx.subnetwork_id` (future: vProg lane families) | **Partial** |
| Parallel processing via BlockDAG | Lanes are independent; per-lane proving is O(activity) | **Implemented** |

### Sovereign State Management

| vProgs Concept | KIP-21 Implementation | Status |
|---|---|---|
| Each vProg owns exclusive accounts `S_p` | Each lane has its own recursive tip hash and state | **Specified** (as lanes) |
| Mutual trustlessness between vProgs | Lanes are isolated; SMT keys are domain-separated per lane | **Implemented** |
| STORM constants / resource regulation | Inactivity purge after threshold `F` blue-score units | **Partial** |

### Off-Chain Computation

| vProgs Concept | KIP-21 Implementation | Status |
|---|---|---|
| ZK proof `z_p^i` attesting to state transitions | Two-anchor lane proof model consumes `SeqCommit` anchors | **Implemented** |
| Proof object contains state commitment | Lane tip hash chains activity digests with `MergesetContextHash` | **Implemented** |
| Prover market (permissionless provers) | Optional persistent witness store for historical SMT access | **Implemented** |
| Proof stitching (combined proofs) | Not in KIP-21 scope -- depends on CD-specific lane update rules | **Future** |

### Synchronous Composability

| vProgs Concept | KIP-21 Implementation | Status |
|---|---|---|
| Cross-vProg atomic transactions | Not in KIP-21 scope -- requires CD layer | **Future** |
| Concise witnesses for cross-vProg reads | SMT proofs provide the mechanism; CD rules define usage | **Implemented (infrastructure)** |
| CAD (Continuous Account Dependency) | Not in KIP-21 scope | **Future** |
| Weighted Area gas functions | Not in KIP-21 scope | **Future** |

---

## Status Summary

```
+------------------+------------------------------------------+
|     STATUS       |              COMPONENTS                   |
+------------------+------------------------------------------+
|                  | SeqCommit(B) recurrence                  |
|                  | ActiveLanesRoot (SMT)                    |
|   IMPLEMENTED    | Lane tip hash chaining                   |
|                  | Two-anchor proof model                   |
|                  | MergesetContextHash                      |
|                  | MinerPayloadRoot                         |
|                  | SMT specification (256-depth, BLAKE3)    |
|                  | Reorg safety (SeqCommitDiff)             |
|                  | IBD bootstrapping                        |
|                  | Persistent witness store (optional)      |
+------------------+------------------------------------------+
|                  | Lane extraction (subnet-based, not       |
|   PARTIAL        |   yet vProg-based)                       |
|                  | Resource regulation (purge exists,       |
|                  |   per-vProg gas scales are future)       |
+------------------+------------------------------------------+
|                  | CD-specific lane update rules            |
|                  | Account-level read/write declarations    |
|                  | Cross-vProg atomicity                    |
|   FUTURE         | Per-vProg gas scales (STORM)             |
|                  | Proof stitching                          |
|                  | vProg deployment/vetting                 |
|                  | Re-anchoring to proven state             |
+------------------+------------------------------------------+
```

---

## What Is Buildable Now

The following components are fully specified in KIP-21 and can be implemented today:

### 1. SMT Libraries

The sparse Merkle tree is fully specified:

- **Depth:** 256 levels, fixed
- **Key derivation:** `H_lane_key(lane_id_bytes)` with `"SeqCommitLaneKey"` domain tag
- **Leaf encoding:** `lane_id_bytes || lane_tip_hash || le_u64(last_touch_blue_score)`
- **Internal nodes:** `H_node(left || right)` with `"SeqCommitActiveNode"` domain tag
- **Empty subtrees:** Pre-computable `EMPTY_{i+1} = H_node(EMPTY_i || EMPTY_i)`

Build inclusion and non-inclusion proof generators now. The proof structure is fixed-shape, making it suitable for ZK-circuit integration.

### 2. Lane Proof Systems

The two-anchor proof model is well-defined:

- **Input:** `SeqCommit(B_start)`, `SeqCommit(B_end)`
- **Prove:** Lane inclusion under both `ActiveLanesRoot` snapshots (via SMT proofs)
- **Prove:** Compressed lane-diff witness between anchors
- **Complexity:** O(lane_activity), not O(chain_blocks)

### 3. Commitment Tree Traversal

The path from any `SeqCommit(B)` to any lane's state is deterministic and fixed:

```
SeqCommit(B)
  -> right child: SeqStateRoot(B)
    -> left child: ActiveLanesRoot(B)
      -> SMT path by lane_key: leaf_hash for target lane
```

### 4. Witness Store Infrastructure

Content-addressed node store with reference-counted garbage collection:

```
node_hash -> (left_child_hash, right_child_hash)
```

- Reconstruct any historical witness from a header anchor
- GC: ref-count on insert, decrement on prune, delete at zero

### 5. Activity Digest Computation

Per-lane block activity is fully specified:

```
activity_leaf(tx) = H_activity_leaf(tx_digest(tx) || le_u32(merge_idx(tx)))

activity_digest_lane(B) = MerkleRoot(
  [activity_leaf(tx) for tx in LaneTxList(B, lane)]
)
```

### 6. Block Context Verification

Applications needing verifiable time or score data:

```
MergesetContextHash(B) = H_mergeset_context(
    le_u64(timestamp) || le_u64(daa_score) || le_u64(blue_score)
)
```

Committed in both `SeqStateRoot(B)` and inside each touched lane-tip update.

---



### 7. Initial Block Download (IBD) Implementation

The KIP-21 Initial Block Download (IBD) implementation (PR #933 in Rusty-Kaspa) ensures that new nodes can properly sync and validate the chain history containing smart contract data, serving as a foundational requirement for vProgs.



To further bolster sync performance, a significant optimization was recently merged into Rusty-Kaspa to batch UTXO writes during IBD. This drastically reduces sync times and strengthens the core protocol in preparation for the increased data demands of vProgs.




Complementing the node-level IBD improvements in Rusty-Kaspa, the vProgs repository has recently introduced its own performance benchmarks and details on vProgs-specific IBD optimizations. This active measurement signals a shift toward refining the verifiable programs implementation for real-world efficiency and scalability.




### 8. Transaction Versioning and Forward Compatibility

KIP-21's sequencing commitment design explicitly builds in forward compatibility by standardizing on the modern Blake3 hashing algorithm and committing to the transaction version. This optimization allows vProgs to efficiently filter and ignore legacy transactions without wasting guest program resources parsing older formats. By committing to the version, vProgs can also securely and easily ignore transactions from future protocol upgrades they do not understand, ensuring long-term L2 stability.

## What Is Still Coming (Post-KIP-21)

| Feature | Description | Dependency |
|---------|-------------|------------|
| **CD-specific lane update rules** | vProg lanes recurse from previous anchor with CD tips (account-state vertices) | vProgs CD specification |
| **Account-level read/write declarations** | Transactions declaring specific account read/write sets within a vProg | vProgs [account model](/architecture/account-model) |
| **Cross-vProg atomicity** | Single-transaction operations spanning multiple vProg lanes | [Synchronous composability](/architecture/composability) specification |
| **Per-vProg gas scales** | Custom gas pricing per vProg (beyond the inactivity purge) | STORM constants specification |
| **Proof stitching** | Combined ZK proofs for multi-vProg atomic operations | CD + composability specification |
| **vProg deployment/vetting** | Prerequisites and process for deploying a new vProg | Governance specification |
| **Re-anchoring to proven state** | Lanes re-anchoring to a previously proven vProg/account commitment instead of `SeqCommit(parent(B))` | CD specification |

---

## The Forward-Compatibility Guarantee

The critical design property of KIP-21's proposed architecture is its **forward compatibility**. The specification explicitly separates the outer machinery (commitment structure, SMT, lane proofs) from the inner machinery (lane-local update rules):

```
+-------------------------------------------------------+
|  OUTER MACHINERY (KIP-21 -- stable)                    |
|                                                        |
|  SeqCommit(B) chaining                                 |
|  ActiveLanesRoot SMT                                   |
|  Two-anchor proof model                                |
|  Lane tip hash structure                               |
|  Reorg safety (SeqCommitDiff)                          |
|  IBD bootstrapping                                     |
+-------------------------------------------------------+
                        |
                        v
+-------------------------------------------------------+
|  INNER MACHINERY (changes per phase)                   |
|                                                        |
|  Phase 1 (now): Subnet-based lane extraction           |
|    - lane_id = tx.subnetwork_id                        |
|    - Activity = transaction list per lane per block     |
|                                                        |
|  Phase 2 (future): vProg CD-based lane update rules    |
|    - lane_id = vProg identifier                        |
|    - Activity = account-state vertex transitions       |
|    - Cross-lane composability via concise witnesses    |
+-------------------------------------------------------+
```

When vProgs arrive, only the lane-local update rules change. The `SeqCommit` chain, SMT structure, proof model, and all outer machinery remain unchanged. This means:

- SMT libraries built now will work with vProgs
- Lane proof circuits designed now will need only inner-logic modifications
- Witness store infrastructure built now will serve vProg provers directly
- Tools built against `SeqCommit` headers will continue to work

---

## Architecture Position

```
+-------------------------------------------------------------------+
|                    vProgs Application Layer                         |
|         (DeFi, DAOs, Privacy, Enterprise -- FUTURE)               |
+-------------------------------------------------------------------+
|              Synchronous Composability Layer                       |
|    (Cross-vProg atomicity, proof stitching -- FUTURE)             |
+-------------------------------------------------------------------+
|              CD-Specific Lane Update Rules                         |
|    (Account-state vertices, per-vProg state -- FUTURE)            |
+-------------------------------------------------------------------+
|           KIP-21: Partitioned Sequencing Commitment         <-- HERE
|   +----------------+--------------------+------------------+      |
|   | ActiveLanes    | MergesetContext     | MinerPayload     |      |
|   | SMT (lanes)    | Hash (clock)       | Root (miners)    |      |
|   +--------+-------+---------+----------+---------+--------+      |
|            +------------------+---------+                         |
|                    SeqStateRoot(B)                                 |
|                         |                                          |
|              SeqCommit(B) = H_seq(parent, state)                  |
+-------------------------------------------------------------------+
|        Toccata / Covenants++ (KIP-16, KIP-17, KIP-20)            |
+-------------------------------------------------------------------+
|           Kaspa L1 BlockDAG + DagKnight Consensus                 |
+-------------------------------------------------------------------+
```

KIP-21 sits at a critical junction: above the raw consensus layer and below the application-specific vProgs logic. It establishes the commitment and proving infrastructure that both the initial standalone vProgs and the eventual fully composable system will use.

---

## Key Takeaway

KIP-21 specifies five foundational elements for vProgs:

1. **The lane abstraction** -- vProgs will be modeled as lanes
2. **The commitment structure** -- `SeqCommit(B)` chains through selected-parent ancestry
3. **The proving model** -- two-anchor, O(activity) per lane
4. **The SMT specification** -- exact hashing, keying, and proof structure
5. **Forward compatibility** -- the outer machinery stays, only lane-local rules change

Everything above KIP-21 in the stack (CD rules, composability, gas model, application layer) builds on this foundation. Everything at KIP-21's level and below (SMT, commitment structure, lane proofs, witness store) is buildable today.

---

## Further Reading

- [L1 Sequencing (KIP-21)](/architecture/sequencing) -- the full KIP-21 specification details
- [Architecture Overview](/architecture/overview) -- how sequencing fits the four-pillar architecture
- [Account Model & State](/architecture/account-model) -- the account model that CD-specific rules will implement
- [Execution Model](/architecture/execution-model) -- how provers use the two-anchor model
- [KIP-21 specification](https://github.com/michaelsutton/kips/blob/kip21/kip-0021.md)
- [vProgs Yellow Paper](https://github.com/kaspanet/research/blob/main/vProgs/vProgs_yellow_paper.pdf)

## Implementation Pragmatism

As the vProgs framework transitions from theory to code, developers are actively optimizing the KIP-21 implementation. Pragmatic engineering improvements—particularly storage-saving changes—are being prioritized over rigid adherence to the original KIP text. This flexible approach ensures the specification evolves organically alongside practical discoveries made during the build process.

## Implementation Progress

A major technical milestone for Kaspa's virtual programmability layer has been reached with the opening of a pull request in `rusty-kaspa` by developer `@biryukovmaxim` for the implementation of KIP-21 (vProgs). This marks the first concrete code implementation of the partitioned sequencing commitment, transitioning the specification from theory into active node software.


To ensure stability and reviewability for the upcoming hard fork, developers are proposing a phased rollout strategy for the KIP-21 mempool. The initial implementation will feature simple, conservative selection logic for a limited number of lanes, with more advanced optimizations planned for post-hard-fork releases. Additionally, the lane-limited block selection algorithm is being designed to handle a high number of concurrent lanes. The emerging consensus favors a purely fee-market-driven approach over enforced fairness, preventing gaming and maintaining economic efficiency.


Active development on vProgs tooling also shows significant progress in scaling infrastructure for the KIP-21 mempool rollout. This ongoing work is critical for smoothly integrating verifiable programs into the main Kaspa network and efficiently handling the new lane-based transaction types.



Active development on the vProgs-enabled testnet (TN12) is driving the deep re-engineering efforts necessary to activate the partitioned sequencing commitment (KIP-21, also referred to as Coven-PoV). Recently, a core protocol change was implemented that modified the hash of v1 transactions, underscoring the technical complexity of integrating the new sequence data into the consensus layer.



Furthermore, the covenant code for KIP-21 is undergoing rigorous open community review. This transparent auditing process has facilitated collaborative problem-solving, recently leading to the confirmation of minor bug fixes and important clarifications regarding consensus-path code prior to deployment.


Core developer Michael Sutton has announced that the technical review for the main KIP-21 (vProgs) pull request by Maxim Biryukov is almost complete. This critical milestone signals that Kaspa's programmability layer is moving closer to the final stages before implementation.



Kaspa is currently approaching a consensus feature freeze for the vProgs (KIP-21) upgrade. The main implementation pull request (PR #943) is nearly ready to merge, locking in essential features such as ZK opcodes and gas commitments for the upcoming release.

Simultaneously, the node's communication layer has been hardened; a bug affecting the GRPC deserialization of transactions was identified and quickly resolved (PR #958), improving the reliability of core RPC services.
