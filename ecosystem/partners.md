---
layout: page
title: "Partners & Projects"
section: ecosystem
description: "Directory of teams and projects building on Kaspa and vProgs. Core contributors, protocol developers, and ecosystem partners in early development."
---

This directory tracks the teams and projects building on or contributing to the Kaspa and vProgs ecosystem. As the ecosystem is in active early development, many of these are core contributors and research-stage projects rather than production deployments.

---

## Core Protocol Team

These contributors are directly involved in Kaspa protocol development, Covenants++, and vProgs.

### Michael Sutton (missutton)

- **Role:** Core developer, architect of Covenants++ and KIP-21, vProgs phasing strategy
- **Key contributions:**
  - KIP-21 -- Partitioned Sequencing Commitments (lane-based commitments enabling O(activity) proving)
  - Covenants++ milestone planning and phasing
  - Covenant declarations proposal for Silverscript
  - vProgs standalone-first strategy design
- **Links:** [KIP-21 Proposal](https://github.com/michaelsutton/kips/blob/kip21/kip-0021.md) | [Milestones Gist](https://gist.github.com/michaelsutton/5bd9ab358f692ee4f54ce2842a0815d1)

### Ori Newman (someone235)

- **Role:** Core developer, KIP-17 author, Silverscript lead
- **Key contributions:**
  - KIP-17 implementation (covenant scripts)
  - Silverscript language design and announcement (Feb 2026)
  - Native assets ZK PoC using SP1 (Jan 2026)
- **Links:** [Silverscript](https://github.com/kaspanet/silverscript)

### Yonatan Sompolinsky (hashdag)

- **Role:** Co-founder, research lead
- **Key contributions:**
  - Covenants++ hard fork announcement and design (Dec 2025)
  - Comprehensive ZK strategy document (Jan 2026)
  - GHOSTDAG and DagKnight research
  - Strategic direction for native assets and L1 liquidity
- **Links:** [Kaspa Research](https://research.kas.pa/)

### Hans (we_are_legion)

- **Role:** vProgs L2 runtime developer
- **Key contributions:**
  - vProgs monorepo architecture (core -> storage -> state -> scheduling -> transaction-runtime -> node)
  - L1 bridge implementation (PR #7)
  - Reorg filter with halving-based denoising (PR #10)
  - Rollback/pruning coordination (PR #13)
- **Links:** [vProgs Repository](https://github.com/kaspanet/vprogs)

### Maxim Biryukov (Max143672)

- **Role:** ZK covenant integration developer
- **Key contributions:**
  - ZK Covenant Rollup PoC -- full deposit-transfer-withdraw cycle (Feb 2026, Milestone 3)
  - STARK and Groth16 proof generation and on-chain verification
  - Sparse Merkle Tree implementation for L2 account state
  - RISC Zero integration work
- **Links:** [ZK Rollup PoC](https://biryukovmaxim.github.io/rusty-kaspa/ch01-introduction.html) | [Source](https://github.com/biryukovmaxim/rusty-kaspa/tree/zk-rollup-covenant-example)

### Alexander S (saefstroem)

- **Role:** KIP-16 author
- **Key contributions:**
  - KIP-16 -- ZK verification precompiles and opcodes
  - Groth16 and RISC Zero on-chain verification design
- **Links:** [KIPs Repository](https://github.com/kaspanet/kips)

---

## Ecosystem Developers

### Anton Yemelyanov (aspectron76)

- **Role:** Rusty Kaspa framework and SDK architect
- **Key contributions:**
  - RK framework/SDK architecture
  - Advocate for vProgs-only approach to programmability (against L1 native tokens)
  - Sparkle L2 (retired Dec 2025 in favor of vProgs)
- **Links:** [Rusty Kaspa](https://github.com/kaspanet/rusty-kaspa)

### IzioDev

- **Role:** Application developer
- **Key contributions:**
  - Native assets PoC implementation
  - VCC v2 (Visual Covenant Compiler)
  - Silverscript VSCode extension
  - Research on covenant state preservation past pruning
- **Links:** --

### manyfestation

- **Role:** Tooling developer
- **Key contributions:**
  - Noir PoC (inline ZK covenants)
  - Silverscript compiler work
  - DAP debugger for Silverscript (PR submitted Mar 2026)
- **Links:** --

### coderofstuff

- **Role:** Infrastructure developer
- **Key contributions:**
  - Stratum bridge implementation
  - DagKnight branch work in main repository
- **Links:** --

---

## Projects

### vProgs Runtime

- **Description:** The official L2 runtime for verifiable programs on Kaspa. A Rust framework designed as a layered monorepo where each layer has a single responsibility.
- **Architecture:** `core -> storage -> state -> scheduling -> transaction-runtime -> node`
- **Status:** Public repository, active development
- **Team:** Hans (we_are_legion), with contributions from core team
- **Link:** [github.com/kaspanet/vprogs](https://github.com/kaspanet/vprogs)

### Silverscript

- **Description:** The L1 covenant language for Kaspa. Provides a developer-friendly way to write covenant scripts that compile to Kaspa's transaction script system.
- **Status:** Announced February 2026, active development
- **Team:** Ori Newman (someone235), with compiler work by manyfestation
- **Link:** [github.com/kaspanet/silverscript](https://github.com/kaspanet/silverscript)

### ZK Covenant Rollup PoC

- **Description:** Proof-of-concept demonstrating the full deposit-transfer-withdraw cycle for ZK-based rollups on Kaspa. Serves as the canonical bridge template.
- **Status:** Milestone 3 complete (Feb 2026)
- **Team:** Maxim Biryukov
- **Link:** [Documentation](https://biryukovmaxim.github.io/rusty-kaspa/ch01-introduction.html)

### VCC v2 (Visual Covenant Compiler)

- **Description:** Visual tooling for creating and compiling covenant scripts.
- **Status:** In development
- **Team:** IzioDev
- **Link:** --

### Silverscript DAP Debugger

- **Description:** Debug Adapter Protocol integration for Silverscript, enabling step-through debugging in VSCode.
- **Status:** PR submitted (Mar 2026)
- **Team:** manyfestation
- **Link:** --

---

## How to Get Listed

This directory is maintained as part of the [vProgs documentation project](https://github.com/creative-inference/vprogs.xyz). If you are building on Kaspa or contributing to the ecosystem, you can submit a pull request to add your team or project.

To be listed, provide:

- **Team/Project name**
- **Description** -- what you are building and how it relates to Kaspa/vProgs
- **Status** -- research, development, testnet, production
- **Team members** -- key contributors
- **Links** -- repository, documentation, website

---

## Further Reading

- [Community](/ecosystem/community) -- where to connect with the ecosystem
- [KII Foundation](/ecosystem/kii) -- enterprise adoption programs
- [Applications & Use Cases](/ecosystem/applications) -- what is being built
- [Repositories](/references/repos) -- annotated list of key GitHub repos
