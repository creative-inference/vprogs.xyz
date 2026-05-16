---
layout: page
title: "Development Roadmap"
section: ecosystem
description: "Kaspa vProgs development roadmap from Crescendo through the Toccata hard fork to full programmability. Phased rollout timeline with DagKnight and ZK milestones."
---

Kaspa is evolving from a pure proof-of-work digital currency into a universal programmable settlement layer. The upcoming **Toccata hard fork** brings two new programmability paths, while **DagKnight** provides the consensus foundation. This page tracks the phased rollout from foundational consensus changes through to a full application ecosystem.

---

## Timeline

### Crescendo (Activated)

The first covenant-enabling hard fork, activating KIP-9, KIP-10, KIP-13, and KIP-15. Crescendo brought the 10 BPS upgrade and laid the groundwork for transaction introspection and sequencing commitments -- the primitives that Toccata and vProgs build upon.

- **KIP-10:** Transaction introspection opcodes and 8-byte arithmetic
- **KIP-15:** Recursive canonical transaction ordering commitment (seqcommit)
- **KIP-9/13:** Network-level performance upgrades

### Toccata (Covenants++) — Feature Freeze April 15, Mainnet ~June 5–20, 2026

The second hard fork, officially named **"Toccata"** in keeping with Kaspa's harmonic tradition. Initiated by Ori Newman as an effort to introduce covenants, it has expanded into Kaspa's full dual programmability landscape. [Michael Sutton's Toccata outlook (April 3, 2026)](https://medium.com/@michaelsuttonil/kaspa-covenants-toccata-hard-fork-outlook-a4d81a40900c) details the scope and rollout plan.

Toccata brings two programmability pillars:

| Pillar | Description | Key KIPs |
|--------|-------------|----------|
| **Native L1 covenant programming** | Peer-to-peer applications including complex stateful multi-contract flows, grounded in local UTXO computation via [Silverscript](/architecture/silverscript) | KIP-17, KIP-20 |
| **Based ZK applications** | ZK verification opcodes, sequencing commitment access, and partitioned sequencing architecture for based ZK apps including canonical bridging | KIP-16, KIP-21 |

#### Already implemented (on TN12)

- Extended script-engine opcode support -- the main covenants backbone (KIP-17)
- Covenant IDs for lineage management as a consensus + engine feature (KIP-20)
- ZK opcodes with zk-verifier precompile subsystem (KIP-16, by Alexander Safstrom):
  - Flexible Groth16 verifier with arbitrary parameters and verification keys
  - RISC Zero STARK verifier (activated on TN12; mainnet activation under decision)
- Sequencing commitment access opcode -- enabling based applications that fully follow L1 sequencing
- Silverscript -- the L1 covenant language (initiated by Ori Newman, Michael Sutton, IzioDev, and Manyfest)

#### Being finalized (pre-freeze)

- Final script-engine pricing policies (implemented; KIP pending)
- KIP-21: fully implemented with strong performance, pending thorough review
- Subnet and gas commitment support complementing KIP-21




Crucially, a major pull request (PR #884) introducing the new script pricing mechanism has been approved in Rusty-Kaspa. This lays the necessary economic groundwork for smart contract execution on vProgs and serves as a major technical prerequisite for the launch.



As part of hardening the new script pricing mechanisms, the txscript engine now utilizes a `RuntimeResourceMeter` to track `ScriptUnits`. Transactions mixing old and new input mass accounting are rejected to strictly enforce the new `compute_budget` field, ensuring the KIP-21 execution environment is robustly metered.



- **Consensus & Mempool Policies:** Toccata lane and gas limits are being integrated into the core consensus rules. Developers are actively finalizing how the protocol differentiates system versus user subnets and validates gas usage, ensuring strict mempool validation policies for the security and stability of vProgs before transactions are block-eligible.



- **Mempool & Transient Mass Policies:** Toccata activation includes a delayed mempool policy for safe transitions around the activation boundary. The mempool now optimizes block templates via an advanced multi-dimensional knapsack problem (standard mass, gas, transient mass, lane limits), and developers plan to remove the `TRANSIENT_BYTE_TO_MASS_FACTOR` post-fork for simplified mass calculations and greater flexibility.



- **Transient Mass Fee Stability:** A key update (PR #995) has been approved to ensure stable fee pricing for vProg transient mass. This future-proofs the calculation and prevents fee volatility during the Toccata upgrade, marking a solid step toward a smooth activation.

#### Key PoCs completed

- Inline ZK covenants (by Maxim Biryukov)
- Based ZK covenants with KAS canonical bridge -- full deposit-transfer-withdraw cycle (by Maxim Biryukov)
- Native assets via ZK proof (SP1, by Ori Newman)

#### Why the date moved from May 5

The hard fork was originally targeted for May 5, 2026. Once ZK circuits and runtimes bind to the sequencing commitment hashing structure, later structural changes become breaking changes. The extra time ensures KIP-21's design is locked in correctly from the start.

### Road from Feature Freeze to Mainnet

| Step | Description |
|------|-------------|
| **1. Clean TN12 restart** | Restart dedicated testnet with all final features -- not simulating hard-fork activation, just a clean network with the full feature set |
| **2. Merge to master** | Merge long-lived `covpp` branch into master -- final auditing, closing TODOs, perfecting activation logic, DB upgradability |
| **3. TN10 test hard fork** | Simulate full mainnet-style transition on the long-term TN10 testnet -- the key rehearsal step |
| **4. Mainnet activation** | Finalize date and hardcode once TN10 rehearsal succeeds |

**Node impact:** Node requirements are expected to stay roughly the same, with a projected ~20–50% increase in disk space usage. Core developers have clarified this is a worst-case estimate tied specifically to active subnets and STARK enablement, highlighting proactive resource management. Existing Kaspa APIs will continue working without change.




As developers finalize parameters for the TN12 reset to mirror mainnet settings (including increasing the gas limit per lane to 1 billion), a strategic decision was made to separate the finalization of new network constants from the activation logic. This allows for stable testing of mainnet-ready parameters before introducing the consensus activation mechanism in a subsequent step.




**Testnet-10 Activation:** Kaspa is actively executing the "Toccata" hard fork on testnet-10 (TN10). This activation serves as a crucial mainnet rehearsal, testing major protocol changes to ensure a seamless upgrade. Alongside this, developers are bumping the consensus database version in Rusty-Kaspa to guarantee database compatibility across nodes.

### DagKnight (Active Development)

The evolution of the GHOSTDAG protocol into a parameterless adaptive consensus mechanism:

- Enhanced block ordering precision
- Near-instant finality
- Prerequisite for vProgs deployment at full throughput
- DagKnight branch active in the main rusty-kaspa repository (as of Feb 27, 2026)

### vProgs (Phased Rollout)

Toccata is a significant milestone on the road to vProgs, where the long-term destination is synchronously composable verifiable programs. The vProgs repo, primarily developed by Hans Moog, is already implementing the runtime layer -- a highly optimized, parallel-centric execution environment for based computation over Kaspa.

Hans Moog outlined the four building blocks required for the full vision (April 2026):

| # | Building Block | Status |
|---|---------------|--------|
| 1 | **Runtime** -- efficiently drive state transitions | Done |
| 2 | **Proving** -- prove the activity of that runtime | Done |
| 3 | **L1 Settlement** -- settle proofs on L1 using covenants | **In progress** (Toccata) |
| 4 | **Meta-program** -- orchestrate user-deployed guests for composability | Future |

Step 3 already enables programmability, but cross-app interactions must go through L1. Full synchronous composability requires step 4. Each milestone has taken a few weeks so far.

- **Phase 1 -- Standalone vProgs (Toccata + steps 1-3):** Sovereign programs bridging to L1 via ZK proofs, operating independently. No cross-vProg composability yet -- apps interact through L1. KIP-21 enables proving in O(program activity) time. ZK proving pipeline proposed March 2026 (8 PRs in review) with RISC Zero as the first backend and a Solana-like guest programming API.
- **Phase 2 -- Synchronous Composability (step 4):** Meta-program for orchestrating user-deployed guests, cross-vProg atomic transactions, concise witnesses, prover market, and the full computation DAG.

---

## Development Phases

### Phase 1: Toccata Hard Fork (~June 2026) — Building Block 3

Focus: L1 covenant settlement for ZK proofs.

- Covenants++ consensus infrastructure (KIP-16, KIP-17, KIP-20)
- Silverscript L1 covenant language
- ZK verification opcodes and precompiles
- KIP-21 partitioned sequencing commitments (lane-based, enabling O(activity) proving)
- L1 covenant settlement enabling standalone based ZK applications

**Status:** Feature freeze April 15, 2026. KIP-21 fully implemented. ZK Covenant Rollup PoC completed February 19, 2026. Building blocks 1 (runtime) and 2 (proving) already done.

Additionally, a new custom UDP-based block relay protocol for latency reduction is undergoing community testing. Early results from a transatlantic relay show the new protocol handling up to 50% of block propagation, demonstrating major performance gains over standard TCP relay.

### Phase 2: Standalone vProgs (post-Toccata) — Building Blocks 1-3 Complete

Focus: Programmable apps that settle on L1.

- vProgs parallel-centric execution environment for based computation
- ZK proving pipeline (RISC Zero backend, Solana-like guest API)
- Per-app proving in O(app activity) time via KIP-21 lanes
- SDKs and developer tooling for both programmability paths
- Apps are programmable but interact through L1

**Status:** Active. Runtime and proving layers done. ZK proving pipeline proposed March 2026 (8 PRs in review). vProgs repo public since January 21, 2026.

### Phase 3: Synchronous Composability — Building Block 4

Focus: Meta-program for cross-app orchestration.

- Meta-program that invokes and orchestrates user-deployed guests
- Extended Computation DAG with per-account modeling
- Cross-vProg atomic transactions via concise witnesses
- Full syncompo CD commitment scheme
- Prover market infrastructure
- Gas model and resource management

**Status:** Design phase. Depends on Phase 2 maturity.

### Phase 4: Full Ecosystem

Focus: Developer tools and application layer.

- Developer tools and SDKs (ongoing, not gated on hard fork)
- DeFi primitives (DEX, lending, vaults)
- Enterprise integration features
- Compliance and audit tooling

**Status:** Planning. The [KII Foundation](/ecosystem/kii) is already operational, preparing enterprise demand.

---

## Key Technical Dependencies

The dependency chain determines what can ship and when:

```
GHOSTDAG
  --> DagKnight (ordering precision, near-instant finality)
        --> Toccata Hard Fork (covenants, ZK opcodes, KIP-21)
              --> Standalone Based ZK Apps (vProgs runtime, canonical bridge)
                    --> Synchronous Composability (cross-vProg atomicity)
                          --> Application Layer (DeFi, DAOs, enterprise)
```

Within the Toccata fork, dependencies include:

- **KIP-10** (transaction introspection) enables **KIP-17** (covenant scripts)
- **KIP-15** (seqcommit) enables **KIP-21** (partitioned seqcommit for vProgs)
- **KIP-16** (ZK precompiles) enables on-chain proof verification
- **KIP-20** (covenant IDs) enables covenant identity and state tracking

---

## Target Capabilities

| Capability | Target | Dependency |
|-----------|--------|------------|
| Throughput | 30,000+ TPS | DagKnight + vProgs |
| Finality | Near-instant | DagKnight |
| Composability | Synchronous, atomic | vProgs Phase 3 |
| Security | Pure PoW + ZK proofs | Toccata |
| Liquidity | Unified L1 | Native assets + vProgs |
| Programmability | Dual: Silverscript (L1) + vProgs (ZK) | Toccata + Phase 2 |

---

## Enterprise Focus

The roadmap explicitly targets institutional adoption:

- Automated compliance logic encoded on-chain
- ZK-based monitoring and reporting without exposing sensitive data
- Real-time settlement without trusted third parties
- Audit trails via state commitments
- Enterprise-grade digital infrastructure through the [KII Foundation](/ecosystem/kii)

---

## Further Reading

- [Applications & Use Cases](/ecosystem/applications) -- what is being built at each phase
- [KIP Index](/references/kips) -- detailed status of each proposal
- [Changelog](/changelog/) -- reverse-chronological development updates
- [Sources & Links](/references/sources) -- primary research and official resources
- [Toccata Hard-Fork Outlook -- Michael Sutton](https://medium.com/@michaelsuttonil/kaspa-covenants-toccata-hard-fork-outlook-a4d81a40900c)

## Deployment Strategy and "r0" Milestone

The development team has reached a major technical milestone with the completion of a foundational vProgs implementation, referred to as "r0". This achievement transitions vProgs from a theoretical design phase into practical code.

Despite this progress, core developers are actively debating the exact timeline for including full vProgs capabilities in upcoming hard forks. The primary focus remains on security; there is a strong consensus to avoid rushing complex programmability features that could introduce vulnerabilities and force a rapid, emergency follow-up hard fork. This measured approach ensures that protocol stability is maintained as the network evolves.
