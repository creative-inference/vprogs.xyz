---
layout: page
title: "R&D Channel Insights"
section: changelog
description: "Curated technical insights from Kaspa Core R&D Telegram. Key architectural decisions, breakthroughs, and strategy from December 2025 to March 2026."
---

Curated technical intelligence from the [Kaspa Core R&D (public)](https://t.me/kasparnd) Telegram group. This page distills the most significant architectural decisions, technical breakthroughs, and strategic direction from core developer discussions spanning December 2025 through March 2026.

For a reverse-chronological event feed, see the [Changelog](/changelog/). For testnet-specific details, see [Testnet Updates](/changelog/testnet-updates).

---

## Key Contributors

| Username | Identity | Role |
|----------|----------|------|
| missutton | Michael Sutton | Core developer, architect of Covenants++, KIP-21, vProgs phasing |
| someone235 | Ori Newman | Core developer, KIP-17, Silverscript lead |
| hashdag | Yonatan Sompolinsky | Co-founder, research lead |
| we_are_legion | Hans | vProgs L2 runtime developer |
| Max143672 | Maxim Biryukov | ZK covenant integration, RISC Zero |
| saefstroem | Alexander S | KIP-16 ZK precompiles author |
| aspectron76 | Anton Yemelyanov | RK framework/SDK architect |
| IzioDev | IzioDev | Native assets PoC, VCC v2, Silverscript VSCode extension |
| coderofstuff | coderofstuff | Stratum bridge, DagKnight branch |
| manyfestation | manyfestation | Noir PoC, Silverscript compiler, DAP debugger |

See [Partners & Projects](/ecosystem/partners) for detailed profiles.

---

## Major Events: December 2025 -- March 2026

### Covenants++ Founding Announcement (Dec 14, 2025)

Yonatan Sompolinsky proposed the Covenants++ hard fork with three pillars:

> "We want to propose a hardfork that will provide initial building blocks for programmability, under the umbrella term Covenants++. The covenants in our minds have three types of usages -- first the limited programmability framework typically associated with covenants, e.g. native non-KAS assets and smart money management; second, a ZKP verifier to enable based rollup plugin to L1; third, a script that will provide a covenant type that allows inspecting miner payloads and aggregate, which will be helpful for RTD."

Three KIPs were proposed: one by Alexander S (extending KIP-16), and the other two by Ori Newman and Michael Sutton respectively. This announcement marked the formal beginning of the Covenants++ development cycle.

### Sparkle L2 Retirement (Dec 4, 2025)

Anton Yemelyanov retired the Sparkle L2 project in favor of the vProgs approach. This was a significant ecosystem consolidation event, signaling that the community was converging on vProgs as the canonical programmability layer.

### vProgs Phasing Strategy (Dec 26, 2025)

Michael Sutton outlined the phasing strategy that shapes all subsequent development:

> "My current perspective re the coming hardfork is that we should: 1. build the zk stack such that it supports (based-rollups and) sovereign standalone applications (vprogs w/o syncompo) 2. technically, the above means that proving in O(prog activity) time becomes essential 3. the main value proposition of such standalone vprogs comes from their ability to canonically bridge a shared native asset"

**Key architectural insight:** The initial vProgs deployment will be standalone -- no synchronous composability yet. Each vProg operates as an independent sovereign program bridging to L1 via ZK proofs. The "degenerate" CD commit scheme groups activity by programs/subnets (not accounts), with the full syncompo CD coming later.

A follow-up on December 27:

> "In this initial scheme, L1 has no notion of accounts yet. It's only aware of the overall vProg entity (through its L1 covenant, just like any standalone based rollup)."

### ZK Strategy Defined (Jan 16, 2026)

Sompolinsky published the definitive ZK strategy document, establishing three tiers:

| Tier | Use Case | ZK Stack | Proof Time | Proof Size |
|------|----------|----------|-----------|-----------|
| Inline ZK covenants | Small contracts, wallets | Noir / Groth16 | ~1s mobile, ~6s mobile web | 10-20 KB (Noir), tiny (Groth16) |
| Based ZK apps | Regular large apps | RISC Zero / SP1 | 10-30 seconds | Variable |
| Based ZK rollups | Meta-apps with user-defined logic | Cairo | Longer | Variable |

**Why Cairo for rollups:** "Sierra bytecode format uniquely provides provable metering and safety" -- essential for meta-apps where users submit their own logic.

**Why Noir for inline:** Approximately 1 second proving on mobile makes it suitable for per-transaction proofs where no prover market is needed.

**Hash function trade-offs** (Sutton): Blake3 is approximately 10x more costly than Blake2s in Cairo (Blake2s has a precompile), but Blake3 has roughly a 40% advantage over Blake2s in SP1/RISC Zero.

### vProgs Repository Goes Public (Jan 21, 2026)

Hans announced the public release:

> "vprogs is now public -- a Rust framework for based computation on Kaspa. Designed as a layered monorepo where each layer has a single responsibility: core -> storage -> state -> scheduling -> transaction-runtime -> node. Dependencies flow downward only."

Key PRs that followed:
- **PR #7** -- L1 bridge (Feb 4, 2026)
- **PR #10** -- Reorg filter with halving-based denoising (Feb 5, 2026)
- **PR #13** -- Rollback/pruning coordination
- **PR #14** -- ChainBlockMetadata

### TN12 Launch and Reset (Jan 5 / Feb 9, 2026)

TN12 launched on January 5 as the primary testnet for Covenants++ development. It was reset on February 9 with significant new features:

> "TN12 reset is live with a few significant new features, including: Covenant IDs, Opcode for accessing a Blake3-based sequencing commitment, ZK verify precompiles + opcodes for Groth16 and RISC0."

See [Testnet Updates](/changelog/testnet-updates) for full details.

### ZK Covenant Rollup PoC -- Milestone 3 (Feb 19, 2026)

Maxim Biryukov completed the full deposit-transfer-withdraw cycle:

- Deposits via delegate script
- L2 transfers between accounts
- Withdrawals via permission tree
- Both STARK (succinct) and Groth16 proof generation with on-chain verification
- Sequence commitment chaining L1 block data into proofs
- Sparse Merkle Tree for L2 account state
- Full on-chain script verification through kaspa-txscript

Sutton's response: "This is beyond amazing. Extremely significant progress. This is already a highly mature canonical bridge implementation. It brings us to post milestone 3."

Resources:
- [ZK Rollup PoC Book](https://biryukovmaxim.github.io/rusty-kaspa/ch01-introduction.html)
- [Source branch](https://github.com/biryukovmaxim/rusty-kaspa/tree/zk-rollup-covenant-example)

### Silverscript Announcement (Feb 10, 2026)

Ori Newman announced Silverscript as the dedicated L1 covenant language. Follow-up work included Sutton's covenant declarations proposal (Feb 24) and manyfestation's DAP debugger PR (Mar 10).

### KIP-21 Published (Feb 24, 2026)

Michael Sutton published the KIP-21 proposal for Partitioned Sequencing Commitments. This KIP introduces lane-based commitments that enable O(activity) proving -- the foundational mechanism that makes vProgs economically viable by ensuring that a vProg only needs to prove work proportional to its own activity, not all L1 activity.

### Native Assets Debate

A significant unresolved architectural tension emerged:

**For native assets** (Sompolinsky): "Native assets render L1 as the primary liquidity hub, and this solidifies social and dev consensus around L1."

**Against native assets** (Yemelyanov): "I am against any implementation of tokens on L1. I believe vProgs should be the programmable layer that implements absolutely everything."

**Pragmatic middle** (Newman): Built the native assets ZK PoC using SP1 to demonstrate the approach.

**Current resolution:** Native assets ship with Covenants++ as a stepping stone, with vProgs eventually becoming the canonical token layer.

---

## Open Questions

These unresolved issues from the R&D channel affect the technical direction:

### Covenant State Preservation Past Pruning

IzioDev (March 12, 2026): "How do we preserve state past pruning? One option would be an indexer storing near-full transaction data. Would it make sense to embed such an indexer into kaspad, enabled via an optional CLI flag? Important: historical data should be retrievable trustlessly from another node."

This affects any application that needs to reference historical state.

### KIP-21 RPC Layer

Maxim Biryukov (March 4, 2026): "We need a way to expose the data (root of each active lane, what's not active anymore) to external users via RPC. Otherwise it's impossible to produce proofs."

Sutton confirmed: "Yes, definitely. There will be a need to design an RPC layer over this."

This is a prerequisite for external applications to generate ZK proofs against L1 state.

---

## Further Reading

- [Changelog](/changelog/) -- reverse-chronological event feed
- [Testnet Updates](/changelog/testnet-updates) -- TN12 details
- [Development Roadmap](/ecosystem/roadmap) -- phased timeline
- [Applications & Use Cases](/ecosystem/applications) -- what is being built
- [KIP Index](/references/kips) -- status of all relevant KIPs
