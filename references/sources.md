---
layout: page
title: "Sources & Links"
section: references
description: "Comprehensive link directory for vProgs research and development. Primary papers, KIPs, forum posts, gists, and developer resources in one place."
---

A categorized collection of all reference material used across the vProgs documentation site. This page serves as a comprehensive link directory for researchers, developers, and anyone looking to verify or explore the primary sources.

---

## Primary Research

Core proposals and formal models from the Kaspa research community.

| Title | Author(s) | Description | Link |
|-------|-----------|-------------|------|
| Concrete vProgs Proposal | Core team | Architectural proposal for synchronously composable verifiable programs | [research.kas.pa](https://research.kas.pa/t/concrete-proposal-for-a-synchronously-composable-verifiable-programs-architecture/387) |
| Formal Backbone Model | Core team | Mathematical model for the vProg computation DAG -- "Zoom in" on the formal structure | [research.kas.pa](https://research.kas.pa/t/zoom-in-a-formal-backbone-model-for-the-vprog-computation-dag/407) |
| vProgs Yellow Paper | Core team | Formal vProgs specification, referenced by KIP-21 | [GitHub](https://github.com/kaspanet/research/blob/main/vProgs/vProgs_yellow_paper.pdf) |
| Covenant++ Milestones & vProgs Directions | Michael Sutton | Phased roadmap from covenants to full vProgs | [Gist](https://gist.github.com/michaelsutton/5bd9ab358f692ee4f54ce2842a0815d1) |

---

## Official Kaspa

Publications from kaspa.org and affiliated organizations.

| Title | Description | Link |
|-------|-------------|------|
| Kaspa Features | Official feature overview covering BlockDAG, GHOSTDAG, and pure PoW | [kaspa.org/features](https://kaspa.org/features/) |
| Development Milestones 2025-2026 | Official roadmap and milestone timeline | [kaspa.org](https://kaspa.org/kaspa-development-milestones-revealed-2025/) |
| The Global Payment Problem | Enterprise payments and institutional adoption case | [kaspa.org](https://kaspa.org/the-global-payment-problem-and-how-kaspa-can-fix-this/) |
| Kaspa: SoV / MoE / SoS | Strategic vision: Store of Value, Medium of Exchange, System of Systems | [kaspa.org](https://kaspa.org/kaspa-sov-moe-sos/) |
| KII Foundation | Kaspa Industrial Initiative -- enterprise adoption organization | [kaspa-kii.org](https://kaspa-kii.org/) |

---

## Community & Articles

Community-written articles, discussions, and media coverage.

| Title | Author/Source | Description | Link |
|-------|--------------|-------------|------|
| A Quick Introduction to vProgs | JC Roger (Medium) | Accessible introduction to vProgs for general audiences | [Medium](https://medium.com/@jcroger/a-quick-introduction-to-vprogs-b3a93395e6ed) |
| Kaspa's Yellow Paper Explained | Reddit (r/kaspa) | Non-technical guide to the Yellow Paper | [Reddit](https://www.reddit.com/r/kaspa/comments/1oyevzm/kaspas_yellow_paper_explained_for_crypto_dummies/) |
| vProgs and Kaspa | Reddit (r/CryptoTechnology) | Technical community discussion on vProgs architecture | [Reddit](https://www.reddit.com/r/CryptoTechnology/comments/1ox1mek/vprogs_and_kaspa/) |
| Hail The Silverscript | KasMedia | In-depth article on Silverscript's design and relationship to vProgs | [KasMedia](https://kasmedia.com/article/hail-the-silverscript) |

---

## Kaspa Improvement Proposals (KIPs)

Formal proposals driving the Covenants++ and vProgs development. See the [KIP Index](/references/kips) for a complete table with status and summaries.

| KIP | Title | Link |
|-----|-------|------|
| KIP-9 | (Part of Crescendo hard fork) | [GitHub](https://github.com/kaspanet/kips) |
| KIP-10 | Transaction Introspection Opcodes | [GitHub](https://github.com/kaspanet/kips/blob/master/kip-0010.md) |
| KIP-13 | (Part of Crescendo hard fork) | [GitHub](https://github.com/kaspanet/kips) |
| KIP-14 | Crescendo Hardfork | [GitHub](https://github.com/kaspanet/kips/blob/master/kip-0014.md) |
| KIP-15 | Sequencing Commitments | [GitHub](https://github.com/kaspanet/kips/blob/master/kip-0015.md) |
| KIP-16 | ZK Verification Precompiles | [GitHub](https://github.com/kaspanet/kips) |
| KIP-17 | Covenant Scripts | [GitHub](https://github.com/kaspanet/kips) |
| KIP-20 | Covenant IDs | [GitHub](https://github.com/kaspanet/kips) |
| KIP-21 | Partitioned Sequencing Commitment | [GitHub](https://github.com/michaelsutton/kips/blob/kip21/kip-0021.md) |

---

## Kaspa Research Forum

In-depth technical threads on the official research forum.

| Title | Description | Link |
|-------|-------------|------|
| Subnets Sequencing Commitments | Original seed design for KIP-21's lane-based commitments | [research.kas.pa](https://research.kas.pa/t/subnets-sequencing-commitments/274) |
| Based ZK-Rollups over Kaspa | Design of based ZK rollups over Kaspa's UTXO-based DAG consensus | [research.kas.pa](https://research.kas.pa/t/on-the-design-of-based-zk-rollups-over-kaspas-utxo-based-dag-consensus/208) |
| L1/L2 Canonical Bridge | Entry/exit mechanism for the canonical L1/L2 bridge | [research.kas.pa](https://research.kas.pa/t/l1-l2-canonical-bridge-entry-exit-mechanism/258) |
| Concrete vProgs Proposal | Synchronously composable vProgs architecture | [research.kas.pa](https://research.kas.pa/t/concrete-proposal-for-a-synchronously-composable-verifiable-programs-architecture/387) |
| Formal Backbone Model | Mathematical model for the vProg computation DAG | [research.kas.pa](https://research.kas.pa/t/zoom-in-a-formal-backbone-model-for-the-vprog-computation-dag/407) |

---

## Technical Concepts

Key resources organized by concept area.

| Concept | Description | Key Resource |
|---------|-------------|-------------|
| BlockDAG | Directed acyclic graph block structure | [kaspa.org/features](https://kaspa.org/features/) |
| GHOSTDAG Protocol | Greedy Heaviest-Observed Sub-Tree DAG | [kaspa.org/features](https://kaspa.org/features/) |
| DagKnight Consensus | Parameterless adaptive consensus with near-instant finality | [Milestones](https://kaspa.org/kaspa-development-milestones-revealed-2025/) |
| Zero-Knowledge Proofs | Cryptographic proofs enabling private verification | [Formal Model](https://research.kas.pa/t/zoom-in-a-formal-backbone-model-for-the-vprog-computation-dag/407) |
| Synchronous Composability | Atomic cross-program interactions within single transactions | [vProgs Proposal](https://research.kas.pa/t/concrete-proposal-for-a-synchronously-composable-verifiable-programs-architecture/387) |
| Prover Market | Infrastructure for outsourcing ZK proof generation | [vProgs Proposal](https://research.kas.pa/t/concrete-proposal-for-a-synchronously-composable-verifiable-programs-architecture/387) |
| Silverscript | L1 covenant language | [GitHub](https://github.com/kaspanet/silverscript) |
| Covenants++ | Hard fork enabling covenants, ZK verification, and RTD | [TN12 Testnet](/changelog/testnet-updates) |

---

## GitHub Repositories

See the [Repositories](/references/repos) page for an annotated directory. Quick links:

| Repository | Link |
|-----------|------|
| vProgs | [github.com/kaspanet/vprogs](https://github.com/kaspanet/vprogs) |
| Silverscript | [github.com/kaspanet/silverscript](https://github.com/kaspanet/silverscript) |
| KIPs (Official) | [github.com/kaspanet/kips](https://github.com/kaspanet/kips) |
| KIPs (Michael Sutton) | [github.com/michaelsutton/kips](https://github.com/michaelsutton/kips) |
| rusty-kaspa | [github.com/kaspanet/rusty-kaspa](https://github.com/kaspanet/rusty-kaspa) |
| ZK Covenant Rollup PoC | [biryukovmaxim/rusty-kaspa](https://github.com/biryukovmaxim/rusty-kaspa/tree/zk-rollup-covenant-example) |
| ZK Rollup PoC Book | [biryukovmaxim.github.io/rusty-kaspa](https://biryukovmaxim.github.io/rusty-kaspa/ch01-introduction.html) |
| vProgs.xyz Site | [github.com/creative-inference/vprogs.xyz](https://github.com/creative-inference/vprogs.xyz) |

---

## Additional Resources

- [Kaspa Research Forum](https://research.kas.pa/) -- ongoing research posts and proposals
- [Kaspa Discord](https://discord.gg/kaspa) -- active developer discussions
- [Kaspa Core R&D Telegram](https://t.me/kasparnd) -- primary technical channel
- [Kaspa GitHub Organization](https://github.com/kaspanet) -- protocol implementation

---

## Further Reading

- [KIP Index](/references/kips) -- detailed KIP table with status
- [Repositories](/references/repos) -- annotated repo descriptions
- [R&D Channel Insights](/changelog/rnd-insights) -- curated intelligence from the R&D channel
