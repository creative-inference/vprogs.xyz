---
layout: page
title: "Glossary"
section: learn
description: "Glossary of key vProgs terms — from zero-knowledge proofs and BlockDAG consensus to accounts, lanes, and state transitions on Kaspa's L1."
---

A comprehensive reference of key terms used across the vProgs documentation. Terms are listed alphabetically for quick lookup.

---

## A

### Account Model
The data model used by vProgs for managing program state. Inspired by Solana's account model, each account holds state data, and transactions must pre-declare which accounts they will read from and write to. This enables parallel processing of non-conflicting transactions on the BlockDAG.

### Active Lanes Root
The root of the 256-depth Sparse Merkle Tree (SMT) that tracks all currently active lanes in KIP-21's partitioned sequencing commitment. Written as `ActiveLanesRoot(B)` for a given block `B`.

### Application Lane
See [Lane](#lane).

---

## B

### Based ZK Rollup
A ZK rollup that relies on the L1 for transaction sequencing (rather than a centralized sequencer). In Kaspa's context, based ZK rollups are one of the application models that can be built on top of the covenant infrastructure, using L1 BlockDAG ordering instead of a separate sequencer.

### BLAKE3
The hash function used throughout Kaspa's sequencing commitment infrastructure (KIP-21). Chosen for being ZK-friendly in RISC Zero/SP1 proving environments, with explicit domain separation tags for each use case.

### BlockDAG
Kaspa's core data structure. Unlike a traditional blockchain where blocks form a single chain, a BlockDAG (Directed Acyclic Graph) allows multiple blocks to be created simultaneously. All valid blocks are included (miners are not competing for the single next block), which increases throughput and reduces wasted work. Currently operating at 10 blocks per second after the Crescendo upgrade.

---

## C

### CAD (Continuous Account Dependency)
An optimization mechanism for vProgs that frequently interact with each other. CAD reduces overhead for repeated composable operations between programs by maintaining persistent dependency relationships funded by the initiating vProg.

### Cairo
The ZK proving stack selected for based ZK rollup applications (meta-apps with user-submitted logic). Cairo's Sierra bytecode provides provable metering, meaning the system can verify that user-submitted programs terminate and consume bounded resources -- a property essential for safely executing arbitrary user code.

### Canonical Bridge
The official bridge mechanism between Kaspa L1 and vProgs. Users deposit KAS or native assets via the canonical bridge, and vProgs settle back to L1 through the same mechanism. Milestone 3 of the Covenants++ roadmap, demonstrated in a full proof-of-concept in February 2026.

### CDAG (Computation DAG)
The structured dependency graph tracking state transitions across vProgs. In Phase 1 (Standalone), the CDAG uses a "degenerate" form that groups activity by program/subnet. In Phase 2 (Full Syncompo), it extends to per-account modeling for fine-grained cross-vProg atomicity.

### Concise Witness
A compact Merkle inclusion proof that enables one vProg to verifiably read another vProg's account state at a specific point in time. Concise witnesses are the key enabler of synchronous composability -- they allow cross-vProg state reads within a single atomic L1 transaction without requiring trust.

### Covenant
A spending condition carried forward by a UTXO. Beyond checking *who* can spend a coin (via signature), a covenant enforces *how* the coin must be spent -- where funds go next, when they can move, and what the next transaction must look like. Covenants are the consensus-layer foundation for both Silverscript and vProgs.

### Covenant ID
A native protocol-level identifier that tracks a covenant UTXO's lineage (introduced by KIP-20). Before covenant IDs, proving that a UTXO descended from a specific covenant required expensive recursive lineage proofs. Covenant IDs eliminate this overhead.

### Covenants++
The upcoming Kaspa hard fork scheduled for May 5, 2026. It activates KIP-16 (ZK verification opcodes), KIP-17 (extended covenant opcodes), KIP-20 (covenant IDs), and KIP-21 (partitioned sequencing commitment). This is the foundational consensus upgrade that makes vProgs possible.

### Crescendo
The previous major Kaspa hard fork (KIP-14). Increased block production from 1 BPS to 10 BPS and activated foundational KIPs including KIP-9 (storage mass), KIP-10 (transaction introspection), KIP-13 (transient storage mass), and KIP-15 (sequencing commitments). Already activated on mainnet.

---

## D

### DagKnight
The next-generation consensus protocol evolving from GHOSTDAG. DagKnight introduces parameterless adaptive consensus, enhanced block ordering precision, and near-instant finality. It is a prerequisite for vProgs deployment because vProgs require reliable, deterministic transaction ordering to compose atomically.

### Data Availability (DA)
The guarantee that transaction data is published and accessible so that anyone can verify state transitions. In vProgs, data availability is native to the L1 BlockDAG -- transaction data is embedded in blocks, not posted to a separate DA layer.

### Degenerate CD
The simplified Computation DAG scheme used in Phase 1 (Standalone vProgs). Groups activity by program/subnet rather than by individual account, enabling O(program activity) proving without requiring the full per-account modeling of Phase 2.

### Domain Separation Tag
A string prefix used in hash computations to ensure that hashes computed for different purposes cannot collide. KIP-21 specifies explicit domain separation tags for each hash function (e.g., `"SeqCommitLaneKey"`, `"SeqCommitLaneTip"`).

---

## F

### Fraud Proof
A mechanism used by optimistic rollups where a watcher can challenge an incorrect state transition within a defined window (typically 7 days). Contrasts with ZK validity proofs used by vProgs, which provide immediate cryptographic certainty.

---

## G

### Gas Scales
Per-vProg custom pricing parameters for computation. Each vProg defines its own gas pricing, meaning resource costs are internalized to the programs and users that incur them. This prevents any single vProg from inflating costs for the rest of the network.

### GHOSTDAG
Kaspa's current consensus protocol. Orders blocks in the BlockDAG by distinguishing between "blue" (honest) and "red" (potentially adversarial) blocks using a parameter `k`. DagKnight evolves GHOSTDAG to be parameterless and adaptive.

### Groth16
A ZK proof system known for very small proof sizes and fast verification. Used in Kaspa's inline ZK covenant tier (with Noir) for per-transaction proving. Groth16 proofs require a trusted setup but offer the most compact proofs available.

---

## H

### Hierarchical Merkle Root
The structure of state commitments in vProgs. The state commitment `C_p^t` is a Merkle root over per-step state roots, forming a tree-of-trees structure that enables concise witnesses for any account state at any intermediate point in time.

---

## I

### Inline ZK Covenant
The simplest tier of ZK-verified applications on Kaspa (Milestone 1). Users submit covenant actions with ZK proofs as unified units. The state transition function is delegated to the ZK prover, with state hashes opaque to L1. Suitable for small contracts and wallet operations. Uses Noir/Groth16 with ~1 second proof times on mobile.

---

## K

### KIP (Kaspa Improvement Proposal)
The formal specification process for protocol changes in Kaspa. Key KIPs for vProgs include KIP-16 (ZK verification), KIP-17 (covenant opcodes), KIP-20 (covenant IDs), and KIP-21 (lane sequencing).

### KIP-21
The partitioned sequencing commitment specification. Replaces the monolithic per-chain-block commitment with a lane-based scheme where each application gets its own lane with an independent tip hash. This enables O(activity) proving per vProg -- provers only need to process their own lane's activity, not the entire chain.

---

## L

### Lane
A logical partition in KIP-21's sequencing commitment. Each lane represents an independent application (currently mapped from `tx.subnetwork_id`, with future KIPs defining vProg-based lane families). Each lane has its own recursive tip hash and last-touch tracking. Stale lanes are automatically purged after an inactivity threshold.

### Lane Tip Hash
The recursive hash tracking the latest state of a specific lane. Updated each time a transaction touches the lane, chaining from the previous tip hash to create an unforgeable history of lane activity.

---

## M

### MEV (Maximal Extractable Value)
Profit extracted by reordering, inserting, or censoring transactions within a block. vProgs provide structural MEV resistance through the BlockDAG's parallel structure, deterministic sequencing, and atomic transaction bundling.

### Merkle Root
A cryptographic hash that summarizes a set of data. In vProgs, Merkle roots are used for state commitments (summarizing all account states) and for the active lanes tree in KIP-21. Merkle proofs (inclusion proofs) allow efficient verification that a specific piece of data is part of the committed set.

### MergesetContextHash
A component of KIP-21's per-block state. Contains block context information: timestamp, DAA score, and blue score. Included in `SeqStateRoot(B)` to bind lane updates to a specific block context.

---

## N

### Native Assets
First-class asset support on Kaspa L1, introduced as part of the Covenants++ hard fork. Native assets are protocol-level tokens (not smart-contract-defined tokens), enabling asset issuance, transfer, and burn at the consensus layer.

### Noir
The ZK proving stack used for inline ZK covenants. Produces Groth16 proofs with approximately 1-second proof times on mobile devices and approximately 6 seconds on mobile web. Selected for the inline tier because of its speed characteristics for per-transaction proving.

---

## P

### Prover
An entity that executes vProg logic off-chain and generates ZK proofs of correct execution. Provers can be dedicated infrastructure providers, vProg developers, or any participant in the decentralized prover market. More provers means more throughput -- the system scales horizontally.

### Prover Market
The decentralized marketplace of ZK proof generators. Provers compete to execute vProg logic and generate proofs. Total system throughput is proportional to the prover market's size and efficiency, enabling horizontal scaling without adding load to L1 nodes.

---

## R

### Read Set
The set of accounts `r(x)` that a vProg transaction declares it will read from. Part of the pre-declared account access model. The write set must be a subset of the read set.

### RISC Zero
A general-purpose ZK proving system used for the "based ZK apps" tier. Supports proving arbitrary computation with 10-30 second proof times. Together with SP1, forms the middle tier of Kaspa's three-tier ZK stack.

---

## S

### SeqCommit
The chained sequencing commitment in block headers. Computed as `SeqCommit(B) = Hash(SeqCommit(parent(B)), SeqStateRoot(B))`. Provides an unforgeable chain of commitments that provers anchor their proofs to. This is the header field that replaced `AcceptedIDMerkleRoot` after Crescendo.

### Silverscript
Kaspa's high-level L1 smart contract language, designed by Ori Newman. Compiles directly to native Kaspa Script (no VM needed). Handles local-state contracts (UTXO covenant spending conditions) as a complement to vProgs' shared-state programs. Features include loops, arrays, covenant declaration macros, and transaction introspection. Experimental on TN12.

### SMT (Sparse Merkle Tree)
The data structure used for `ActiveLanesRoot` in KIP-21. A fixed-depth (256-level) Merkle tree where most leaves are empty. Chosen over Patricia tries for operational simplicity and proof regularity -- fixed-shape proofs are more uniform for ZK circuit design.

### Sovereign State
The principle that each vProg owns and exclusively controls its own set of accounts. No other vProg can directly modify another's state. Cross-vProg interactions happen through declared dependencies and concise witnesses, never through direct state access.

### SP1
A ZK proving system (alongside RISC Zero) used for the based ZK apps tier. Part of the middle tier of Kaspa's three-tier ZK stack.

### State Commitment
A cryptographic commitment (Merkle root) to the complete state of a vProg at a specific point in time. Submitted alongside ZK proofs to L1. Enables verification that state transitions are valid without exposing the full state.

### STORM Constants
State and Throughput Optimal Resource Management constants. Per-vProg parameters that regulate state growth and throughput. Each vProg sets its own STORM constants, preventing any single program from consuming disproportionate network resources.

### Syncompo (Synchronous Composability)
The ability for multiple vProgs to interact and update state within a single atomic L1 transaction. Enabled by concise witnesses and the shared L1 sequencing layer. This is the property that distinguishes vProgs from L2 rollups -- there are no bridges, no async delays, and no fragmentation.

---

## T

### TN12 (Testnet-12)
The experimental testnet for Covenants++. Launched January 5, 2026, and reset February 9, 2026 with covenant IDs (KIP-20), BLAKE3-based sequencing commitment opcodes, ZK verify precompiles for Groth16 and RISC Zero, KIP-17 covenant opcodes, and Silverscript compiler support.

### Two-Anchor Proof Model
The proving model that vProg provers use with KIP-21. Provers provide two global anchors (`SeqCommit(B_start)` and `SeqCommit(B_end)`), lane-inclusion witnesses under both anchors, and a compressed lane-diff witness between the anchors. This ensures proof effort is O(lane activity), not O(total chain blocks).

---

## U

### UTXO (Unspent Transaction Output)
The transaction model used by Kaspa's base layer (and Bitcoin). Each transaction consumes previous outputs and creates new ones. Silverscript builds local-state contracts on UTXOs, while vProgs use an account model layered on top. The UTXO model provides inherent security properties like no reentrancy attacks.

---

## V

### Validity Proof
A ZK proof that a state transition was computed correctly. Unlike fraud proofs (which assume correctness and allow challenges), validity proofs provide immediate cryptographic certainty. vProgs use validity proofs as their primary security mechanism.

### vProg (Verifiable Program)
A lightweight, deterministic logic module native to Kaspa's L1. Each vProg functions as a sovereign "mini zkVM" with its own exclusive accounts, gas pricing, and resource management. Complex execution happens off-chain; L1 only validates ZK proofs of correct execution.

### VBR (vProgs-Based Rollup)
A ZK rollup that follows the vProg programming model: global registration, account-based execution, and read-write declarations. Represented by a single ZK covenant on L1, enabling L2-internal synchronous composability. Part of the roadmap beyond the core milestones.

---

## W

### Weighted Area Gas
The gas model used in vProgs that accounts for both parallelizable computation (witness/scope) and sequential computation (new transaction processing). Designed to incentivize efficient resource usage by reflecting the actual system cost of each operation type.

### Witness
In the vProgs context, witness data refers to the information needed to verify cross-vProg state dependencies. The witness set `pi(x)` in a transaction contains the data required to resolve reads from other programs. See also [Concise Witness](#concise-witness).

### Write Set
The set of accounts `w(x)` that a vProg transaction declares it will modify. Must be a subset of the read set. Part of the pre-declared account access model that enables parallel processing.

---

## Z

### ZK Proof (Zero-Knowledge Proof)
A cryptographic proof that a computation was performed correctly, without revealing the computation's details. In vProgs, ZK proofs are generated by off-chain provers and verified by L1 nodes. The verification is succinct (constant-time regardless of computation complexity), sound (false proofs cannot pass), and zero-knowledge (reveals nothing beyond correctness).

### ZK Stack
Kaspa's three-tier approach to zero-knowledge proving, finalized in January 2026:
- **Tier 1 (Inline)**: Noir/Groth16 -- ~1s on mobile, for per-transaction proofs
- **Tier 2 (Based apps)**: RISC Zero/SP1 -- 10-30s, for aggregated application proofs
- **Tier 3 (Rollups)**: Cairo -- variable, for meta-apps with user-submitted logic

### zkVM (Zero-Knowledge Virtual Machine)
A virtual machine that produces ZK proofs of its execution. Each vProg conceptually operates as a "mini zkVM" -- a self-contained environment that executes logic and produces cryptographic proofs of correct state transitions.
