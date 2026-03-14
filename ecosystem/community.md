---
layout: page
title: "Community"
section: ecosystem
description: "Join the Kaspa developer community. Telegram channels, research forums, contribution pathways, and resources for vProgs and Covenants++ builders."
---

The Kaspa community spans developers, researchers, miners, investors, and enterprise stakeholders across multiple platforms. This page collects the key gathering points, contribution pathways, and developer resources.

---

## Community Channels

### Telegram

| Channel | Description | Link |
|---------|-------------|------|
| **Kaspa Core R&D (public)** | Primary technical discussion. Core developers share updates, proposals, and architectural decisions here. The most important channel for following vProgs and Covenants++ development. | [t.me/kasparnd](https://t.me/kasparnd) |
| **Kaspa (main)** | General community discussion about Kaspa. | [t.me/kaspa](https://t.me/Kaspa_Main) |

The R&D channel is where most of the technical insights referenced in this documentation originate. Key contributors include Michael Sutton, Ori Newman, Yonatan Sompolinsky, Hans, Maxim Biryukov, and others listed on the [Partners & Projects](/ecosystem/partners) page.

### Discord

The Kaspa Discord server hosts developer channels, community discussion, and ecosystem coordination.

- [Kaspa Discord](https://discord.gg/kaspa)

### Reddit

| Subreddit | Description |
|-----------|-------------|
| [r/kaspa](https://www.reddit.com/r/kaspa/) | Main Kaspa community subreddit |
| [r/CryptoTechnology](https://www.reddit.com/r/CryptoTechnology/) | Technical discussion (vProgs posts appear here) |

Notable posts:
- [vProgs and Kaspa -- technical discussion](https://www.reddit.com/r/CryptoTechnology/comments/1ox1mek/vprogs_and_kaspa/)
- [Kaspa's Yellow Paper explained](https://www.reddit.com/r/kaspa/comments/1oyevzm/kaspas_yellow_paper_explained_for_crypto_dummies/)

### Kaspa Research Forum

The official research forum for in-depth technical proposals and discussions:

- [research.kas.pa](https://research.kas.pa/)

Key threads:

| Thread | Description |
|--------|-------------|
| [Concrete vProgs Proposal](https://research.kas.pa/t/concrete-proposal-for-a-synchronously-composable-verifiable-programs-architecture/387) | Core architectural proposal for synchronously composable vProgs |
| [Formal Backbone Model](https://research.kas.pa/t/zoom-in-a-formal-backbone-model-for-the-vprog-computation-dag/407) | Mathematical model for the vProg computation DAG |
| [Subnets Sequencing Commitments](https://research.kas.pa/t/subnets-sequencing-commitments/274) | Seed design for KIP-21 lane-based commitments |
| [Based ZK-Rollups Design](https://research.kas.pa/t/on-the-design-of-based-zk-rollups-over-kaspas-utxo-based-dag-consensus/208) | ZK rollup design over Kaspa's UTXO DAG |
| [L1/L2 Canonical Bridge](https://research.kas.pa/t/l1-l2-canonical-bridge-entry-exit-mechanism/258) | Entry/exit mechanism for the canonical bridge |

---

## How to Contribute

### Protocol Development

Kaspa's core protocol is implemented in Rust. The main repositories accept contributions via pull requests:

- [rusty-kaspa](https://github.com/kaspanet/rusty-kaspa) -- the Kaspa node implementation
- [vProgs](https://github.com/kaspanet/vprogs) -- the vProgs L2 runtime
- [Silverscript](https://github.com/kaspanet/silverscript) -- the L1 covenant language
- [KIPs](https://github.com/kaspanet/kips) -- Kaspa Improvement Proposals

To contribute to protocol development:

1. Review open issues and PRs in the relevant repository
2. Join the [R&D Telegram channel](https://t.me/kasparnd) to understand current priorities
3. Read the relevant KIPs for the area you want to work on (see [KIP Index](/references/kips))
4. Fork the repository, make your changes, and submit a PR
5. Engage in the review process -- core developers are active reviewers

### Application Development

Building applications on Kaspa currently means working with:

- **Silverscript** for L1 covenant scripts
- **vProgs framework** for off-chain execution with on-chain ZK verification
- **ZK tooling** -- Noir (inline), RISC Zero/SP1 (based apps), Cairo (rollups)

The [Applications & Use Cases](/ecosystem/applications) page describes the application tiers and what is currently possible.

### Documentation

This documentation site is open source:

- [vProgs.xyz Repository](https://github.com/creative-inference/vprogs.xyz)

Contributions welcome for:
- Technical accuracy improvements
- New application guides and tutorials
- Translations
- Diagrams and visual explanations

### Research

The [Kaspa Research Forum](https://research.kas.pa/) is the venue for proposing and discussing research ideas. Active research areas include:

- Consensus theory (DagKnight, block ordering)
- ZK proof systems and their application to DAG-based blockchains
- Synchronous composability in UTXO-based systems
- State management and pruning strategies
- Economic models (gas, prover markets)

---

## Community Guidelines

### Technical Discussion

- Lead with substance. The R&D channel and research forum prioritize technical depth.
- Reference KIPs, code, and research papers when proposing changes.
- Acknowledge the phased nature of development -- not all features are available yet.

### General Discussion

- Respect the fair-launch, no-premine ethos of the project.
- Focus on technology and ecosystem development.
- Help newcomers understand the architecture and roadmap.

### Code Contributions

- Follow the coding style of the repository you are contributing to.
- Write tests for new functionality.
- Keep PRs focused -- one logical change per PR.
- Engage constructively in code review.

---

## Developer Resources

### Documentation

| Resource | Description |
|----------|-------------|
| [vProgs.xyz](/) | This site -- comprehensive vProgs documentation |
| [ZK Rollup PoC Book](https://biryukovmaxim.github.io/rusty-kaspa/ch01-introduction.html) | Step-by-step guide to the ZK covenant rollup pattern |
| [Kaspa Features](https://kaspa.org/features/) | Official feature overview (BlockDAG, GHOSTDAG, PoW) |
| [vProgs Yellow Paper](https://github.com/kaspanet/research/blob/main/vProgs/vProgs_yellow_paper.pdf) | Formal vProgs specification |

### Articles

| Article | Description |
|---------|-------------|
| [Quick Introduction to vProgs](https://medium.com/@jcroger/a-quick-introduction-to-vprogs-b3a93395e6ed) | Accessible introduction by JC Roger |
| [Hail The Silverscript](https://kasmedia.com/article/hail-the-silverscript) | In-depth article on Silverscript |
| [Yellow Paper Explained](https://www.reddit.com/r/kaspa/comments/1oyevzm/kaspas_yellow_paper_explained_for_crypto_dummies/) | Non-technical guide to the Yellow Paper |

### Key Repositories

| Repository | Description |
|-----------|-------------|
| [vProgs](https://github.com/kaspanet/vprogs) | L2 runtime monorepo |
| [Silverscript](https://github.com/kaspanet/silverscript) | L1 covenant language |
| [rusty-kaspa](https://github.com/kaspanet/rusty-kaspa) | Node implementation |
| [KIPs](https://github.com/kaspanet/kips) | Improvement proposals |

See [Repositories](/references/repos) for an annotated list of all key repos.

---

## Further Reading

- [Partners & Projects](/ecosystem/partners) -- who is building in the ecosystem
- [KII Foundation](/ecosystem/kii) -- enterprise programs, hackathons, and grants
- [Sources & Links](/references/sources) -- complete reference collection
- [R&D Channel Insights](/changelog/rnd-insights) -- curated technical intelligence from the R&D channel
