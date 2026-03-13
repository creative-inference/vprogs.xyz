---
layout: page
title: "Open Research Questions"
section: research
---

This is a living document tracking unresolved research questions in the vProgs architecture. Each question includes context, the current state of discussion, proposed approaches where they exist, and cross-references to related research areas. Questions are drawn from the [Kaspa Research Forum](https://research.kas.pa/), the [Kaspa Core R&D channel](https://t.me/kasparnd), and the [Composability Architecture Proposal](/research/composability-proposal).

Last updated: March 2026.

---

## 1. Witness Storage Past Pruning

### Problem Statement

Kaspa nodes prune historical block data to maintain bounded storage requirements. However, vProgs require witnesses (Merkle inclusion proofs against state commitments) to verify cross-vProg state. When the underlying block data is pruned, how are these witnesses preserved and made available?

### Context

IzioDev raised this question directly (March 2026):

> "How do we preserve state past pruning? One option would be an indexer storing near-full transaction data. Would it make sense to embed such an indexer into kaspad, enabled via an optional CLI flag? Important: historical data should be retrievable trustlessly from another node."

The emphasis on **trustless retrieval** is critical. A solution where witnesses are stored by a trusted third party would undermine the security model. Any archival node must be able to prove the authenticity of the historical data it provides.

### Proposed Approaches

| Approach | Description | Tradeoffs |
|----------|-------------|-----------|
| **Embedded indexer** | Optional kaspad module storing full transaction history | Increases node requirements; opt-in reduces decentralization |
| **Dedicated archival network** | Separate peer-to-peer network for historical data | Requires its own incentive mechanism; adds infrastructure complexity |
| **Proof-anchored checkpoints** | Store only state commitments (anchor points) and regenerate witnesses on demand | Requires provers to maintain sufficient state history for regeneration |
| **Content-addressed storage** | Store witnesses in IPFS or similar systems, referenced by hash | Availability not guaranteed without incentives |

### Key Constraint

The chosen mechanism must satisfy the trustlessness requirement: a node retrieving historical witness data from another node must be able to verify its authenticity without trusting the provider. This likely means tying archived data to on-chain commitments that survive pruning.

### Related

- [Formal Computation Model](/research/formal-model) -- anchor points and pruning
- [Security Model](/research/security-model) -- anchor point permanence

---

## 2. vProg Vetting Mechanisms

### Problem Statement

What are the precise prerequisites for deploying a new vProg on Kaspa? The architecture must balance permissionless innovation with protection against malicious or poorly designed programs that could degrade the ecosystem.

### Context

The [Composability Architecture Proposal](/research/composability-proposal) lists vProg vetting as an open question. The tension is between:

- **Permissionless deployment** --- anyone can deploy a vProg, maximizing innovation but risking spam or malicious programs
- **Vetted deployment** --- some form of review or requirements, protecting users but introducing gatekeeping

### Dimensions of Vetting

| Dimension | Question |
|-----------|----------|
| **Economic** | Should deploying a vProg require a stake or bond? How large? |
| **Technical** | Should vProg code pass static analysis or formal verification? |
| **Social** | Should existing vProg operators vote on new deployments? |
| **Temporal** | Should there be a probationary period before a vProg can participate in composability? |
| **Resource** | Should vProgs demonstrate prover capacity before activation? |

### Considerations

- The permissionless prover model means a vProg without provers is simply non-functional (proofs never submitted), not actively harmful
- A vProg with pathological STORM constants could create externalities for cross-vProg interactions (e.g., excessively large scopes)
- The phasing strategy (standalone first, then composability) provides a natural probationary mechanism --- a vProg must operate successfully standalone before participating in cross-vProg interactions

### Related

- [Composability Architecture Proposal](/research/composability-proposal) -- sovereign execution model
- [Gas and Resource Economics](/research/gas-economics) -- STORM constants

---

## 3. Source Code Enforcement

### Problem Statement

Should vProg source code be publicly available, and if so, how is this enforced? Users interacting with a vProg need to understand its state transition function to trust it, but on-chain enforcement of source code availability is non-trivial.

### Context

The composability proposal identifies this as a prerequisite for trustworthy cross-vProg interaction. If vProg A reads from vProg B, vProg A's users need confidence that vProg B's behavior is as advertised.

### Approaches Under Discussion

| Approach | Description | Limitations |
|----------|-------------|------------|
| **On-chain code registry** | vProg source code stored in a global registry on L1 | Storage cost; code size limits; who verifies compilation? |
| **Verified compilation** | Proof that on-chain bytecode was compiled from published source | Requires deterministic compilation; compiler bugs could break verification |
| **Social convention** | Community expectation of open source; unverified vProgs are avoided by users | Not enforceable; relies on user diligence |
| **ZK-proven compilation** | ZK proof that the deployed circuit/program was compiled from specific source code | Technically ambitious; no existing implementation |

### The Compilation Gap

Even if source code is published, there is a gap between "published source" and "deployed program." The ZK circuit or VM bytecode that the prover actually executes may not correspond to the published source. Bridging this gap requires either:

1. Deterministic, auditable compilation toolchains, or
2. Cryptographic proof of compilation correctness

Neither is fully solved in the current ZK ecosystem.

### Related

- [Proving Systems Analysis](/research/proving-systems) -- compilation targets for each tier
- [Security Model](/research/security-model) -- trust assumptions

---

## 4. Off-Chain Witness Broadcasting

### Problem Statement

Cross-vProg transactions require witnesses (Merkle proofs of state in other vProgs). These witnesses must be available to transaction constructors before submission. How should witnesses be broadcast and distributed off-chain?

### Context

The composability proposal notes the complexity tradeoffs of gossip protocols for witness distribution. The challenge is:

- Witnesses are generated by provers and must reach users
- Stale witnesses cause read failures (see [Security Model](/research/security-model))
- The freshness requirement creates a real-time distribution problem
- The volume of witnesses scales with the number of active cross-vProg interactions

### Design Space

| Protocol | Latency | Bandwidth | Complexity |
|----------|---------|-----------|-----------|
| **Direct prover-to-user** | Low | Low (on-demand) | Requires discovery; centralizes around provers |
| **Gossip network** | Moderate | High (broadcast) | Standard P2P; bandwidth scales with vProg count |
| **Dedicated relay network** | Low | Moderate | Requires relay incentives; potential centralization |
| **L1 payload embedding** | High (next block) | Constrained by payload size | Simple but slow; storage mass costs |
| **Hybrid** | Variable | Variable | Most flexible; most complex |

### Key Tradeoffs

- **Freshness vs. bandwidth.** Broadcasting every state update to all participants wastes bandwidth. Targeted delivery is efficient but requires infrastructure.
- **Decentralization vs. latency.** Centralized relay services offer low latency but introduce trust assumptions. Decentralized gossip is trustless but slower.
- **CAD optimization.** [Continuous Account Dependencies](/research/composability-proposal) may provide a natural framework for witness subscription --- a CAD registration could include a witness delivery channel.

### Related

- [Composability Architecture Proposal](/research/composability-proposal) -- CAD mechanism
- [Security Model](/research/security-model) -- read-fail safeguards

---

## 5. KIP-21 RPC Layer

### Problem Statement

KIP-21 introduces partitioned sequencing commitments with lane-based structure. External users (provers, vProg operators, application developers) need programmatic access to lane data to construct and verify proofs. What RPC interface should expose this data?

### Context

Maxim Biryukov raised this requirement (March 2026):

> "We need a way to expose the data (root of each active lane, what's not active anymore) to external users via RPC. Otherwise it's impossible to produce proofs."

Michael Sutton confirmed the need: "Yes, definitely. There will be a need to design an RPC layer over this."

### Required Data

| Data | Consumer | Purpose |
|------|----------|---------|
| Active lane roots | Provers | Construct proofs anchored to current state |
| Lane deactivation history | Provers, auditors | Determine which lanes are no longer active |
| Per-lane sequencing commitments | Provers | Anchor proofs to specific lane state |
| Lane-to-vProg mapping | Application developers | Route transactions to correct lanes |
| Lane extraction rules | All | Determine which transactions belong to which lanes |

### Design Considerations

- **Performance.** Lane data changes every block (10 BPS). The RPC layer must handle high query rates without degrading node performance.
- **Consistency.** Queries must return consistent snapshots --- a lane root and its corresponding sequencing commitment must be from the same block.
- **Streaming.** Provers need real-time updates as new blocks are produced. A polling-based RPC may not be sufficient; WebSocket or subscription-based APIs may be necessary.
- **Backwards compatibility.** The RPC layer should extend (not replace) existing Kaspa RPC interfaces.

### Related

- [Formal Computation Model](/research/formal-model) -- sequencing commitments and anchoring
- [Proving Systems Analysis](/research/proving-systems) -- prover data requirements

---

## 6. Lane Extraction Rules

### Problem Statement

KIP-21's partitioned sequencing commitment divides L1 transaction data into lanes. The rules for determining which transactions belong to which lanes (lane extraction) must be precisely specified and efficiently computable.

### Context

Lane extraction is the mechanism by which a vProg's prover identifies the subset of L1 data relevant to its program. The rules determine:

- Which transactions target a specific vProg
- How payload data is parsed and attributed to lanes
- How conflicts between lanes are resolved
- How the lane Merkle tree is constructed

### Open Sub-Questions

| Sub-question | Description |
|-------------|-------------|
| **Payload parsing** | How is transaction payload data attributed to specific vProgs/lanes? Is there a header format? |
| **Multi-lane transactions** | Can a single L1 transaction contribute data to multiple lanes? If so, how is it partitioned? |
| **Lane creation/destruction** | What governs the lifecycle of lanes? Can a vProg have multiple lanes? |
| **Efficiency** | Can lane extraction be done in O(vProg activity) rather than O(global activity)? This is the key property KIP-21 must deliver. |
| **Determinism** | All nodes must compute identical lane assignments. What happens with ambiguous or malformed payloads? |

### Connection to O(Activity) Proving

The entire purpose of KIP-21's lane structure is to enable O(activity) proving --- a vProg's prover should only need to process data proportional to that vProg's activity, not the global DAG activity. Lane extraction rules are the mechanism that achieves this:

- A prover for vProg `p` extracts lane `l_p` from the sequencing commitment
- Lane `l_p` contains only transactions relevant to `p`
- The prover generates a proof over `l_p`, not the full block data
- The proof includes a Merkle inclusion proof that `l_p` is a valid lane of the full sequencing commitment

If lane extraction requires scanning all transactions (O(global activity)), the efficiency gain is lost. The extraction rules must be structured so that lane membership is determinable from transaction metadata alone, without full payload parsing.

### Related

- [Formal Computation Model](/research/formal-model) -- computation DAG structure
- [Gas and Resource Economics](/research/gas-economics) -- scope and proving cost

---

## 7. Conditional Proof Settlement Semantics

### Problem Statement

Conditional proofs (see [Formal Model](/research/formal-model)) enable pipelined proving, but the precise settlement semantics need further specification. When does a conditional proof become "final"? What happens to dependent state if a conditional chain is invalidated?

### Open Sub-Questions

- **Finality definition.** Is a conditional proof final when its root predecessor is verified, or only after a certain number of L1 confirmations?
- **State visibility.** Can other vProgs read state that is only conditionally proven? If so, what are the risk implications?
- **Rollback propagation.** If a conditional proof chain is invalidated, how does the rollback propagate through cross-vProg dependencies?
- **Economic impact.** Who bears the cost of re-proving after a conditional chain invalidation?

### Related

- [Formal Computation Model](/research/formal-model) -- conditional proof mechanism
- [Security Model](/research/security-model) -- proof pipeline integrity

---

## 8. Native Asset Interaction Model

### Problem Statement

Native assets (shipping with Covenants++) coexist with vProgs. The interaction model between native asset covenants and vProgs needs specification, particularly around:

- How vProgs hold and transfer native assets
- Whether native asset operations participate in synchronous composability
- How the Inter-Covenant Communication (ICC) protocol mediates between ZK covenants and asset covenants

### Context

There is an acknowledged architectural tension in the community:

- Native assets provide L1 liquidity and social consensus (hashdag's position)
- vProgs should be the canonical programmable layer for everything (aspectron76's position)
- Native assets serve as a stepping stone, with vProgs eventually becoming the canonical token layer (pragmatic middle)

The interaction model must support all three perspectives during the transition period.

### Related

- [Composability Architecture Proposal](/research/composability-proposal) -- cross-vProg transaction flow
- [Proving Systems Analysis](/research/proving-systems) -- Milestone 4 (native asset canonical bridge)

---

## Contributing

This document is maintained as a living reference. New questions are added as they emerge from research discussions, implementation work, and community feedback. Questions are retired (moved to an archive section) when they are resolved by published specifications or implemented code.

Primary sources for new questions:

- [Kaspa Research Forum](https://research.kas.pa/)
- [Kaspa Core R&D (public)](https://t.me/kasparnd)
- [vProgs repository issues](https://github.com/kaspanet/vprogs/issues)
- [Kaspa KIPs repository](https://github.com/kaspanet/kips)
