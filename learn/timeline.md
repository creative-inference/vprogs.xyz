---
layout: page
title: "When Are vProgs Going Live?"
section: learn
description: "The honest timeline for Kaspa vProgs — what's live now, what's shipping next, and when full programmability arrives on mainnet."
---

This is the question everyone asks. Here's the honest answer: vProgs are being built in phases, and some pieces are already running. There is no single "launch day" — capabilities are shipping incrementally as each layer of the stack matures.

---

## What's Live Right Now

These are not future promises. They are running on Kaspa's TN12 testnet today.

| Feature | Status | Since |
|---------|--------|-------|
| Covenant scripts (spending conditions on UTXOs) | Active on TN12 | Jan 2026 |
| Covenant IDs (trackable on-chain identity) | Active on TN12 | Feb 2026 |
| ZK proof verification (Groth16 + RISC Zero) | Active on TN12 | Feb 2026 |
| Blake3 sequencing commitment opcode | Active on TN12 | Feb 2026 |
| Silverscript (covenant language) | In development, testable | Feb 2026 |
| ZK Covenant Rollup (full deposit-transfer-withdraw) | PoC complete on TN12 | Feb 2026 |
| Native assets via ZK proof (SP1) | PoC demonstrated | Jan 2026 |

The full deposit-transfer-withdraw cycle for a ZK covenant rollup was demonstrated on February 19, 2026 by Maxim Biryukov. This is not a whitepaper concept — it ran on a live testnet with real ZK proofs verified on-chain.

---

## The Next Major Milestone: Covenants++ Hard Fork

**Target: May 5, 2026**

This is the mainnet hard fork that enables L1 programmability. Announced by Yonatan Sompolinsky on December 14, 2025, Covenants++ delivers three pillars:

| Pillar | What It Enables |
|--------|-----------------|
| **Covenants** | Programmable spending conditions, native assets, smart money management |
| **ZK Verifier** | On-chain verification of zero-knowledge proofs |
| **RTD Support** | Real-time data — covenants that inspect miner payloads |

After this fork activates, developers can deploy covenants and ZK-verified applications on Kaspa mainnet. This is the inflection point — the moment Kaspa goes from "fast PoW currency" to "programmable settlement layer."

### What ships with the fork:

- Transaction introspection opcodes (proposed in KIP-10, KIP-17)
- Covenant identity system (proposed in KIP-20)
- ZK verification opcodes for Groth16 and RISC Zero (proposed in KIP-16)
- Blake3-based sequencing commitment
- Silverscript language and compiler
- Native asset support

---

## After Covenants++: The vProgs Phases

### Phase 1: Standalone vProgs

**Timeline: Following Covenants++ activation**

Individual programs that execute off-chain and verify on L1. Each vProg operates independently with its own state.

What you can build:
- ZK covenant rollups (the pattern already proven on TN12)
- Token systems with native asset support
- Privacy-preserving applications with ZK proofs
- Time-locked vaults and escrow systems
- Any application that needs verifiable off-chain computation

What's not yet available:
- Cross-vProg atomic transactions
- Shared state between programs
- The full prover market

### Phase 2: Synchronous Composability

**Timeline: After Phase 1 matures**

This is the full vision — multiple vProgs interacting atomically in a single transaction, with unified liquidity across the entire network.

What it unlocks:
- Flash loan from lending vProg, swap on DEX vProg, stake on yield vProg — all in one atomic transaction
- No bridges, no fragmented liquidity, no cross-chain risk
- A composable DeFi stack rivaling Ethereum's, but at 30,000+ TPS with instant finality

Key infrastructure still in design:
- Concise witness mechanism for cross-vProg reads
- Continuous Account Dependency (CAD) for parallel execution
- Parallelism-aware gas model
- Prover market economics

---

## DagKnight: The Other Critical Piece

vProgs don't exist in isolation. They depend on DagKnight — the next-generation consensus protocol replacing GHOSTDAG.

| Property | GHOSTDAG (Current) | DagKnight (Coming) |
|----------|-------------------|-------------------|
| Ordering | Approximate | Precise |
| Finality | Probabilistic | Near-instant |
| Parameters | Manual tuning | Parameterless, adaptive |
| Throughput | Already fast | Enables 30,000+ TPS |

The DagKnight branch has been active in the main rusty-kaspa repository since February 27, 2026. Precise block ordering and instant finality are prerequisites for vProgs to operate at full throughput.

---

## The Dependency Chain

Understanding what depends on what explains why this is phased:

```
Crescendo (done)
  |
  v
Covenants++ hard fork (May 5, 2026)
  |
  v
DagKnight consensus (active development)
  |
  v
Phase 1: Standalone vProgs
  |
  v
Phase 2: Synchronous Composability
  |
  v
Full Application Ecosystem (DeFi, DAOs, enterprise)
```

Each layer depends on the one below it. You can't have composable vProgs without standalone vProgs. You can't have standalone vProgs without ZK verification on L1. And you can't have ZK verification without the Covenants++ fork.

---

## Why Not Just Ship Everything at Once?

Shipping in phases is a deliberate choice, not a delay:

**Security first.** Each layer gets tested independently on TN12 before mainnet. The ZK covenant rollup PoC proved the full cycle works before anyone talks about composability.

**No trusted setup shortcuts.** vProgs use Groth16 and RISC Zero — proof systems with well-understood security properties. Building on unproven cryptography to ship faster would be irresponsible.

**The base layer matters most.** A bug in an L2 rollup loses funds on that rollup. A bug in L1 consensus could compromise the entire network. Kaspa's approach is to get each layer right before building the next one.

**Developers can start now.** You don't need Phase 2 composability to build useful applications. The covenant primitives shipping with Covenants++ are powerful on their own. ZK-verified rollups, native tokens, and programmable vaults are all Phase 1 applications.

---

## How to Track Progress

- **[Testnet Updates](/changelog/testnet-updates)** -- TN12 feature tracking and known issues
- **[Development Roadmap](/ecosystem/roadmap)** -- full phased rollout with dependencies
- **[R&D Insights](/changelog/rnd-insights)** -- what core developers are discussing
- **[KIP Index](/references/kips)** -- status of every proposal
- **[Repositories](/references/repos)** -- links to active branches and PRs

---

## The Bottom Line

Covenants++ is shipping to mainnet around May 2026. That's the real starting line -- the moment developers can deploy ZK-verified applications on Kaspa L1. Phase 1 standalone vProgs follow, with the full composable ecosystem building from there.

The architecture is not theoretical. The ZK proof verification works. The covenant rollup works. The testnet is live. What remains is hardening, auditing, and activating on mainnet.

If you want to build, start now. The [quickstart guide](/build/quickstart) and [tutorials](/build/tutorials/) are ready. Everything you prototype on TN12 today will translate directly to mainnet after Covenants++ activates.
