---
layout: section
title: "vProgs Research Program"
section: research
description: "The vProgs research program develops the theoretical foundations and engineering principles for verifiable, synchronously composable programs on Kaspa's BlockDAG. This body of work spans formal computation models, cryptographic proving systems, resource economics, and security analysis --- establishing the scientific basis for a programmability layer that preserves L1 decentralization guarantees."
---

The research draws on random graph theory, zero-knowledge cryptography, mechanism design, and distributed systems theory. It is conducted in the open via the [Kaspa Research Forum](https://research.kas.pa/) and the [Kaspa Core R&D channel](https://t.me/kasparnd).

---

## Research Areas

### [Formal Computation Model](/research/formal-model)

Mathematical formalism for the vProg computation DAG: vertex-hyperedge structure, state compression via proof anchoring, hierarchical Merkle commitments, and Erdos-Renyi scalability analysis with phase transition thresholds.

---

### [Composability Architecture Proposal](/research/composability-proposal)

The concrete architectural design for synchronous composability: account-centric execution, sovereign vProg operation, cross-vProg transaction flow, scope definition, conditional proofs, pipelined proving, and Continuous Account Dependency (CAD).

---

### [Gas and Resource Economics](/research/gas-economics)

Weighted Area gas functions, STORM constants for autonomous resource regulation, parallelism-aware pricing, fee market design, and the economic incentive structures that keep proof epochs below critical scalability thresholds.

---

### [Proving Systems Analysis](/research/proving-systems)

Comparative evaluation of Noir, RISC Zero, SP1, and Cairo across the three-tier ZK strategy. Proof times, circuit sizes, aggregation strategies, hash function tradeoffs (Blake3 vs Blake2s), and the rationale for tier-specific stack selection.

---

### [Security Model](/research/security-model)

Threat model and attack surface analysis: proof withholding, state manipulation, MEV extraction, reorg attacks, read-fail safeguards, local state security guarantees, and the structural properties that eliminate reentrancy.

---

### [Open Research Questions](/research/open-questions)

A living document tracking unresolved problems: witness storage past pruning, vProg vetting mechanisms, source code enforcement, off-chain witness broadcasting, KIP-21 RPC layer design, and lane extraction rules.

---

## Key References

- [Formal backbone model for the vProg computation DAG](https://research.kas.pa/t/zoom-in-a-formal-backbone-model-for-the-vprog-computation-dag/407) -- Kaspa Research Forum
- [Concrete proposal for synchronously composable vProgs](https://research.kas.pa/t/concrete-proposal-for-a-synchronously-composable-verifiable-programs-architecture/387) -- Kaspa Research Forum
- [Covenant++ milestones and vProgs directions](https://gist.github.com/michaelsutton/5bd9ab358f692ee4f54ce2842a0815d1) -- Michael Sutton
- [KIP-21: Partitioned Sequencing Commitment](https://github.com/michaelsutton/kips/blob/kip21/kip-0021.md)
- [ZK Covenant Rollup PoC](https://github.com/biryukovmaxim/rusty-kaspa/tree/zk-rollup-covenant-example) -- Maxim Biryukov
- [Kaspa Core R&D (public)](https://t.me/kasparnd) -- Telegram
