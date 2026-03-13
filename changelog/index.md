---
layout: section
title: "Changelog"
section: changelog
description: "A reverse-chronological record of major developments in the Kaspa and vProgs ecosystem. This feed tracks protocol milestones, testnet updates, key proposals, and ecosystem events."
---

For deeper technical context, see the [R&D Channel Insights](/changelog/rnd-insights). For testnet-specific details, see [Testnet Updates](/changelog/testnet-updates).

---

## 2026

### March 2026

**March 10** -- Silverscript DAP debugger PR submitted by manyfestation, enabling step-through debugging of Silverscript covenant scripts in VSCode.

**March 4** -- Rusty Kaspa v1.1.0 stable release. This serves as the pre-Covenants++ baseline -- the last stable release before the covpp branch merges.

### February 2026

**February 27** -- DagKnight branch becomes active in the main rusty-kaspa repository, marking a significant step toward consensus upgrade integration.

**February 24** -- KIP-21 (Partitioned Sequencing Commitment) proposal published by Michael Sutton. This is the foundational KIP for vProgs, introducing lane-based sequencing commitments that enable O(activity) proving. Covenant declarations proposal for Silverscript published the same day.

**February 19** -- ZK Covenant Rollup PoC completed by Maxim Biryukov (Milestone 3). Full deposit-transfer-withdraw cycle demonstrated on TN12 with both STARK and Groth16 proof generation. Michael Sutton called it "a highly mature canonical bridge implementation." See [R&D Insights](/changelog/rnd-insights) for details.

**February 11** -- KIP-20 (Covenant IDs) formal proposal published, providing identity and state tracking for covenants.

**February 10** -- Silverscript announced by Ori Newman. A dedicated L1 covenant language for Kaspa, designed to compile to the transaction script system.

**February 9** -- TN12 reset with major new features: Covenant IDs, Blake3-based sequencing commitment opcode, and ZK verify precompiles for Groth16 and RISC Zero. See [Testnet Updates](/changelog/testnet-updates).

**February 5** -- vProgs reorg filter PR (halving-based denoising mechanism) submitted.

**February 4** -- vProgs L1 bridge PR ready, implementing the canonical connection between L1 and the vProgs runtime.

### January 2026

**January 21** -- vProgs repository goes public at [github.com/kaspanet/vprogs](https://github.com/kaspanet/vprogs). Described as "a Rust framework for based computation on Kaspa" with a layered monorepo architecture.

**January 17** -- Opcode numbers agreed for Covenants++: 0xcf-0xd3 for covenant ID operations, 0xd4 for seqcommit.

**January 16** -- Yonatan Sompolinsky publishes comprehensive ZK strategy document defining three tiers: inline ZK (Noir), based apps (RISC Zero/SP1), and based rollups (Cairo).

**January 11** -- Noir identified as the inline ZK direction, with approximately 1 second proving on mobile and approximately 6 seconds on mobile web.

**January 6** -- Michael Sutton publishes the [milestones gist](https://gist.github.com/michaelsutton/5bd9ab358f692ee4f54ce2842a0815d1) outlining the phased path from covenants to full vProgs. Same day, Ori Newman publishes native assets ZK PoC using SP1.

**January 5** -- TN12 launched, the primary testnet for Covenants++ development. See [Testnet Updates](/changelog/testnet-updates).

**January 1** -- `covpp` branch created in the rusty-kaspa repository, beginning active Covenants++ implementation.

---

## 2025

### December 2025

**December 26** -- KIP-17 implementation ready for review (Ori Newman). Same day, Michael Sutton outlines vProgs phasing strategy: standalone vProgs first, then synchronous composability.

**December 14** -- Covenants++ hard fork announced by Yonatan Sompolinsky. Three pillars defined: covenants (limited programmability), ZK verifier (based rollup support), and RTD (real-time data from miner payloads). Three KIPs proposed by Alex, Ori, and Sutton respectively.

**December 4** -- Sparkle L2 retired by Anton Yemelyanov in favor of the vProgs approach. This marked a consolidation of the ecosystem around vProgs as the programmability layer.

---

## Upcoming

### Covenants++ Hard Fork -- Targeting May 5, 2026

The next major milestone. Activates covenants, ZK verification precompiles, RTD support, covenant IDs, native assets, and Silverscript. See the [Development Roadmap](/ecosystem/roadmap) for full details.

### DagKnight Consensus Upgrade

Parameterless adaptive consensus with near-instant finality. Branch active in the main repository. No target date announced.

### vProgs Phase 1 -- Standalone Programs

Sovereign vProgs operating independently, bridging to L1 via ZK proofs. Depends on Covenants++ and DagKnight. No target date announced.

---

## Feed Sources

This changelog is compiled from:

- [Kaspa Core R&D Telegram](https://t.me/kasparnd) -- primary source for development updates
- [Kaspa GitHub repositories](https://github.com/kaspanet) -- PRs, releases, and branch activity
- [Kaspa Research Forum](https://research.kas.pa/) -- proposals and research updates
- [kaspa.org](https://kaspa.org/) -- official announcements

---

## Further Reading

- [R&D Channel Insights](/changelog/rnd-insights) -- curated technical intelligence with contributor context
- [Testnet Updates](/changelog/testnet-updates) -- TN12 launch, reset, features, and known issues
- [Development Roadmap](/ecosystem/roadmap) -- phased timeline and dependencies
