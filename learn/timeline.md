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

## The Next Major Milestone: Toccata Hard Fork (Covenants++)

**Feature freeze: April 15, 2026**
**Mainnet target: ~June 5–20, 2026**

The Covenants++ upgrade has been officially named **"Toccata"** — in keeping with Kaspa's harmonic naming tradition. Announced by Yonatan Sompolinsky on December 14, 2025 and detailed in [Michael Sutton's Toccata outlook (April 3, 2026)](https://medium.com/@michaelsuttonil/kaspa-covenants-toccata-hard-fork-outlook-a4d81a40900c), Toccata brings two programmability pillars:

| Pillar | What It Enables |
|--------|-----------------|
| **Native L1 covenant programming** | Peer-to-peer applications via Silverscript, including complex stateful multi-contract flows |
| **Based ZK applications** | ZK verification opcodes, sequencing commitment access, and KIP-21's partitioned architecture for based ZK apps and canonical bridging |

After Toccata activates, developers can deploy covenants and ZK-verified applications on Kaspa mainnet. This is the inflection point — the moment Kaspa goes from "fast PoW currency" to "programmable settlement layer."

### What ships with Toccata:

- Extended script-engine opcode support (KIP-17)
- Covenant identity system (KIP-20)
- ZK verification opcodes for Groth16 and RISC Zero (KIP-16, by Alexander Safstrom)
- KIP-21 partitioned sequencing commitment (fully implemented)
- Blake3-based sequencing commitment opcode
- Silverscript language and compiler
- Native asset support
- Script-engine pricing policies

---

### Road from feature freeze to mainnet:

| Step | Description |
|------|-------------|
| Clean TN12 restart | All final features on a fresh network |
| Merge to master | Final auditing, activation logic, DB upgradability |
| TN10 test hard fork | Full mainnet-style transition rehearsal |
| Mainnet activation | Date finalized after successful TN10 rehearsal |

Node requirements stay roughly the same, with ~20–50% more disk space usage. Existing Kaspa APIs continue working without change.

---

## After Toccata: The vProgs Phases

Hans Moog (April 2026) laid out the four building blocks for the full vProgs vision:

1. **Runtime** — efficiently drive state transitions (**done**)
2. **Proving** — prove the activity of that runtime (**done**)
3. **L1 Settlement** — settle proofs on L1 using covenants (**in progress** — Toccata)
4. **Meta-program** — orchestrate user-deployed guests for composability (**future**)

Step 3 already enables programmability. Each milestone has taken a few weeks so far, suggesting continued rapid progress.

### Phase 1: Standalone vProgs (steps 1-3 complete)

**Timeline: Following Toccata activation**

Individual programs that execute off-chain and verify on L1. Each vProg operates independently with its own state. Cross-app interactions go through L1.

What you can build:
- ZK covenant rollups (the pattern already proven on TN12)
- Token systems with native asset support
- Privacy-preserving applications with ZK proofs
- Time-locked vaults and escrow systems
- Any application that needs verifiable off-chain computation

What's not yet available:
- Cross-vProg atomic transactions (requires step 4)
- Shared state between programs
- The full prover market

### Phase 2: Synchronous Composability (step 4)

**Timeline: After Phase 1 matures**

This is the full vision — a meta-program that invokes and orchestrates user-deployed guests, enabling multiple vProgs to interact atomically in a single transaction with unified liquidity.

What it unlocks:
- Flash loan from lending vProg, swap on DEX vProg, stake on yield vProg — all in one atomic transaction
- No bridges, no fragmented liquidity, no cross-chain risk
- A composable DeFi stack rivaling Ethereum's, but at 30,000+ TPS with instant finality

Key infrastructure still in design:
- Meta-program for guest orchestration and constraint enforcement
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
Toccata hard fork (~June 5-20, 2026)
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

Toccata is shipping to mainnet around June 2026. That's the real starting line -- the moment developers can deploy ZK-verified applications on Kaspa L1. Phase 1 standalone vProgs follow, with the full composable ecosystem building from there.

The architecture is not theoretical. The ZK proof verification works. The covenant rollup works. The testnet is live. What remains is hardening, auditing, and activating on mainnet.

If you want to build, start now. The [quickstart guide](/build/quickstart) and [tutorials](/build/tutorials/) are ready. Everything you prototype on TN12 today will translate directly to mainnet after Toccata activates.
