---
layout: page
title: "Repositories"
section: references
---

An annotated directory of the key GitHub repositories in the Kaspa and vProgs ecosystem. Each entry describes what the repository contains, its current status, and notable branches or pull requests.

---

## Protocol Repositories

### rusty-kaspa

- **URL:** [github.com/kaspanet/rusty-kaspa](https://github.com/kaspanet/rusty-kaspa)
- **Language:** Rust
- **Description:** The primary Kaspa node implementation. This is the reference implementation of the Kaspa protocol, including GHOSTDAG consensus, transaction processing, mining, and the network layer.
- **Status:** Active development. v1.1.0 stable released March 4, 2026 (pre-Covenants++ baseline).
- **Key branches:**
  - `main` -- stable release branch
  - `covpp` -- Covenants++ implementation branch (created January 1, 2026). Contains covenant scripts, ZK precompiles, covenant IDs, and Blake3 seqcommit
  - DagKnight branch -- active as of February 27, 2026
- **Maintainers:** Core team (Michael Sutton, Ori Newman, and others)

### KIPs (Official)

- **URL:** [github.com/kaspanet/kips](https://github.com/kaspanet/kips)
- **Description:** The official Kaspa Improvement Proposals repository. Contains the formal specifications for protocol changes, including KIP-10 (transaction introspection), KIP-14 (Crescendo), KIP-15 (sequencing commitments), KIP-17 (covenant scripts), and KIP-20 (covenant IDs).
- **Status:** Active. New proposals added as they reach formal status.
- **Key files:**
  - `kip-0010.md` -- Transaction Introspection Opcodes
  - `kip-0014.md` -- Crescendo Hardfork
  - `kip-0015.md` -- Sequencing Commitments
- **See also:** [KIP Index](/references/kips) for a complete table with status and summaries.

### KIPs (Michael Sutton)

- **URL:** [github.com/michaelsutton/kips](https://github.com/michaelsutton/kips)
- **Description:** Michael Sutton's fork of the KIPs repository, containing proposals in development before they are merged into the official repo.
- **Status:** Active. Contains KIP-21 (Partitioned Sequencing Commitment).
- **Key branches:**
  - `kip21` -- KIP-21 proposal (published February 24, 2026)
- **Key file:** `kip-0021.md` -- the foundational KIP for vProgs, introducing lane-based sequencing commitments

---

## vProgs Repositories

### vProgs Runtime

- **URL:** [github.com/kaspanet/vprogs](https://github.com/kaspanet/vprogs)
- **Language:** Rust
- **Description:** The official vProgs L2 runtime. A layered monorepo where each layer has a single responsibility, with dependencies flowing downward only.
- **Architecture:**
  ```
  core -> storage -> state -> scheduling -> transaction-runtime -> node
  ```
- **Status:** Public since January 21, 2026. Active development.
- **Key PRs:**
  - PR #7 -- L1 bridge (February 4, 2026). Implements the canonical connection between L1 and the vProgs runtime.
  - PR #10 -- Reorg filter (February 5, 2026). Halving-based denoising mechanism for handling L1 reorganizations.
  - PR #13 -- Rollback/pruning coordination. Manages state consistency during L1 pruning events.
  - PR #14 -- ChainBlockMetadata. Metadata handling for chain blocks.
- **Lead developer:** Hans (we_are_legion)

### Silverscript

- **URL:** [github.com/kaspanet/silverscript](https://github.com/kaspanet/silverscript)
- **Language:** Rust
- **Description:** The L1 covenant language for Kaspa. Silverscript provides a developer-friendly language for writing covenant scripts that compile to Kaspa's transaction script system. Announced by Ori Newman on February 10, 2026.
- **Status:** Active development.
- **Related tooling:**
  - VSCode extension by IzioDev
  - DAP debugger by manyfestation (PR submitted March 10, 2026)
  - Covenant declarations proposal by Michael Sutton (February 24, 2026)
- **Lead developer:** Ori Newman (someone235), with compiler contributions from manyfestation

### ZK Covenant Rollup PoC

- **URL:** [github.com/biryukovmaxim/rusty-kaspa](https://github.com/biryukovmaxim/rusty-kaspa/tree/zk-rollup-covenant-example)
- **Branch:** `zk-rollup-covenant-example`
- **Language:** Rust
- **Description:** Proof-of-concept demonstrating the full deposit-transfer-withdraw cycle for ZK-based rollups on Kaspa. This is the canonical bridge template -- the pattern that all based rollup applications are expected to follow.
- **Features demonstrated:**
  - Deposits via delegate script
  - L2 transfers between accounts
  - Withdrawals via permission tree
  - STARK and Groth16 proof generation with on-chain verification
  - Sparse Merkle Tree for L2 account state
  - Sequence commitment chaining
- **Status:** Milestone 3 complete (February 19, 2026).
- **Developer:** Maxim Biryukov (Max143672)

---

## Documentation Repositories

### ZK Rollup PoC Book

- **URL:** [biryukovmaxim.github.io/rusty-kaspa](https://biryukovmaxim.github.io/rusty-kaspa/ch01-introduction.html)
- **Description:** Step-by-step documentation for the ZK Covenant Rollup proof-of-concept. Covers the architecture, deposit flow, transfer mechanism, withdrawal process, and proof generation.
- **Status:** Published. Accompanies the ZK Covenant Rollup PoC branch.
- **Developer:** Maxim Biryukov

### vProgs.xyz

- **URL:** [github.com/creative-inference/vprogs.xyz](https://github.com/creative-inference/vprogs.xyz)
- **Description:** This documentation site. Covers vProgs architecture, the Kaspa ecosystem, development roadmap, and reference material.
- **Status:** Active development.

---

## Research Repository

### Kaspa Research

- **URL:** [github.com/kaspanet/research](https://github.com/kaspanet/research)
- **Description:** Research papers and formal specifications for Kaspa protocol features.
- **Key file:** `vProgs/vProgs_yellow_paper.pdf` -- the formal vProgs specification, referenced by KIP-21.

---

## Repository Status Summary

| Repository | Language | Status | Primary Focus |
|-----------|----------|--------|---------------|
| [rusty-kaspa](https://github.com/kaspanet/rusty-kaspa) | Rust | Active (v1.1.0) | Node implementation |
| [vProgs](https://github.com/kaspanet/vprogs) | Rust | Active | L2 runtime |
| [Silverscript](https://github.com/kaspanet/silverscript) | Rust | Active | L1 covenant language |
| [KIPs](https://github.com/kaspanet/kips) | Markdown | Active | Protocol proposals |
| [KIPs (Sutton)](https://github.com/michaelsutton/kips) | Markdown | Active | KIP-21 |
| [ZK Rollup PoC](https://github.com/biryukovmaxim/rusty-kaspa/tree/zk-rollup-covenant-example) | Rust | Milestone 3 | ZK bridge template |
| [Research](https://github.com/kaspanet/research) | PDF/LaTeX | Published | Formal specifications |
| [vProgs.xyz](https://github.com/creative-inference/vprogs.xyz) | Markdown | Active | Documentation |

---

## How to Watch for Updates

To stay current with repository activity:

1. **Star and watch** the repositories you care about on GitHub
2. **Follow the covpp branch** in rusty-kaspa for Covenants++ progress
3. **Monitor vProgs PRs** for runtime development updates
4. **Join the R&D Telegram** ([t.me/kasparnd](https://t.me/kasparnd)) where developers announce PRs and releases

---

## Further Reading

- [KIP Index](/references/kips) -- status of all proposals
- [Sources & Links](/references/sources) -- complete reference collection
- [R&D Channel Insights](/changelog/rnd-insights) -- context on PRs and technical decisions
- [Community](/ecosystem/community) -- where to engage with developers
