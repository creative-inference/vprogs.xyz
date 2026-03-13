---
layout: section
title: "Architecture"
section: architecture
description: "Kaspa's Verifiable Programs (vProgs) represent a new paradigm for blockchain programmability -- a \"third way\" that avoids both the monolithic bloat of L1 virtual machines and the liquidity fragmentation of L2 rollups. The architecture delivers programmable, scalable, PoW-secured settlement with instant DAG finality and unified L1 liquidity."
---

The vProgs architecture rests on four foundational pillars, each addressing a distinct aspect of the system design.

---

## The Four Pillars

### Sovereign State

Each vProg owns an exclusive set of accounts and operates as a self-contained "mini zkVM." State integrity is mutually trustless -- no vProg depends on another's correctness. Resource management (gas scales, STORM constants, storage costs) is internalized per application, preventing any single program from burdening the network.

**Deep dive:** [Account Model & State](/architecture/account-model)

---

### Off-Chain Compute

Complex execution happens entirely off-chain. The L1 never re-runs computation -- it only validates cryptographic proofs. This separation enables horizontal scaling through a decentralized prover market, where total capacity grows with prover count and efficiency rather than node hardware.

**Deep dive:** [Execution Model](/architecture/execution-model)

---

### L1 Sequencing

Kaspa's BlockDAG consensus provides the global, immutable sequence of operations. The L1 acts as a "traffic controller," ordering transactions without executing them. KIP-21 partitions sequencing commitments into per-application lanes, enabling O(activity) proving per vProg rather than O(global chain).

**Deep dive:** [L1 Sequencing (KIP-21)](/architecture/sequencing)

---

### ZK Verification

Zero-knowledge proofs are the trust anchor. State transitions are attested by cryptographic proofs submitted to L1, where lightweight verification replaces heavyweight re-execution. A tiered ZK stack supports everything from mobile-friendly inline proofs to full rollup environments.

**Deep dive:** [ZK Verification](/architecture/zk-verification)

---

## How the Pillars Fit Together

```
                    +---------------------------+
                    |    Application Layer       |
                    |  (DeFi, DAOs, Enterprise)  |
                    +---------------------------+
                               |
                    +---------------------------+
                    | Synchronous Composability  |
                    | Cross-vProg atomic txns    |
                    +---------------------------+
                         /              \
          +----------------+      +------------------+
          | Sovereign State|      | Off-Chain Compute |
          | (Account Model)|      | (ZK Provers)      |
          +----------------+      +------------------+
                         \              /
                    +---------------------------+
                    |     L1 Sequencing          |
                    |  (KIP-21 Lane Commitments) |
                    +---------------------------+
                               |
                    +---------------------------+
                    |     ZK Verification        |
                    |  (KIP-16 Verifier Opcodes) |
                    +---------------------------+
                               |
                    +---------------------------+
                    |   Kaspa BlockDAG + PoW     |
                    |   DagKnight Consensus      |
                    +---------------------------+
```

Off-chain provers execute vProg logic and generate ZK proofs. The L1 sequences operations via KIP-21's lane-based commitment structure and verifies proofs via KIP-16's verifier opcodes. Sovereign state ensures isolation; synchronous composability enables cross-program atomicity without fragmentation.

---

## Architecture Pages

| Page | Description |
|------|-------------|
| [Architecture Overview](/architecture/overview) | The four pillars in depth and how they compose |
| [Account Model & State](/architecture/account-model) | Solana-inspired pre-declared read/write sets and sovereign state |
| [Execution Model](/architecture/execution-model) | Off-chain execution, witness generation, proof lifecycle |
| [ZK Verification](/architecture/zk-verification) | Three-tier ZK stack, KIP-16 verifier opcodes, proof lifecycle |
| [L1 Sequencing (KIP-21)](/architecture/sequencing) | Partitioned lanes, recursive tip hashes, sparse Merkle tree |
| [KIP-21 to vProgs Mapping](/architecture/sequencing-mapping) | Concept mapping, what's buildable now vs. future |
| [Synchronous Composability](/architecture/composability) | Cross-vProg atomicity, concise witnesses, parallelism-aware gas |
| [DagKnight Consensus](/architecture/dagknight) | Parameterless adaptive consensus enabling vProgs |
| [Covenant Stack](/architecture/covenants) | The KIP infrastructure from Crescendo to Covenants++ |
| [Silverscript](/architecture/silverscript) | Kaspa's L1 smart contract language and its relationship to vProgs |

---

## Architectural Comparison

| Feature | EVM L1 | L2 Rollups | vProgs |
|---------|--------|------------|--------|
| Execution | On-chain (heavy) | Off-chain (isolated) | Off-chain (unified) |
| Composability | Synchronous | Asynchronous | Synchronous |
| Liquidity | Unified | Fragmented | Unified |
| L1 Load | High | Minimal | Minimal |
| Scalability | Limited | Bridge latency | Prover market |
| Security | Consensus | Economic guarantees | Cryptographic proof |
| Finality | Block time | Challenge period | Instant (DagKnight) |

---

## Deployment Phases

**Phase 1 -- Standalone vProgs:** Each vProg operates as an independent sovereign program, bridging to L1 via ZK proofs through the canonical bridge. L1 has no notion of per-account state -- it is aware only of the overall vProg entity through its L1 covenant. Proving operates in O(program activity) time via KIP-21.

**Phase 2 -- Full Synchronous Composability:** Extended Computation DAG with per-account modeling. Cross-vProg atomic transactions via concise witnesses. Full synchronous composability with the Continuous Account Dependency mechanism.

---

## Further Reading

- [Concrete proposal for synchronously composable vProgs](https://research.kas.pa/t/concrete-proposal-for-a-synchronously-composable-verifiable-programs-architecture/387)
- [Formal backbone model for vProg computation DAG](https://research.kas.pa/t/zoom-in-a-formal-backbone-model-for-the-vprog-computation-dag/407)
- [KIP-21: Partitioned Sequencing Commitment](https://github.com/michaelsutton/kips/blob/kip21/kip-0021.md)
- [vProgs Repository](https://github.com/kaspanet/vprogs)
