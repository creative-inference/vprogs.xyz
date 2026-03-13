---
layout: page
title: "KIP Index"
section: references
---

Kaspa Improvement Proposals (KIPs) are the formal mechanism for proposing changes to the Kaspa protocol. This page indexes all KIPs relevant to Covenants++ and vProgs, with their current status, a summary, and links to the full proposals.

---

## Overview

The KIPs listed here fall into two groups:

1. **Crescendo KIPs** (KIP-9, KIP-10, KIP-13, KIP-14, KIP-15) -- activated in the Crescendo hard fork, providing the foundational primitives (transaction introspection, sequencing commitments, 10 BPS).

2. **Covenants++ KIPs** (KIP-16, KIP-17, KIP-20, KIP-21) -- targeting the Covenants++ hard fork (May 5, 2026), adding ZK verification, covenant scripts, covenant identity, and partitioned sequencing for vProgs.

---

## KIP Table

| KIP | Title | Author | Status | Summary | Link |
|-----|-------|--------|--------|---------|------|
| KIP-9 | Network Performance Upgrade | Core team | **Activated** (Crescendo) | Network-level performance parameters for the 10 BPS upgrade | [GitHub](https://github.com/kaspanet/kips) |
| KIP-10 | Transaction Introspection Opcodes | Core team | **Activated** (Crescendo) | Foundation for covenants: transaction introspection enabling scripts to inspect their own transaction, plus 8-byte arithmetic opcodes | [GitHub](https://github.com/kaspanet/kips/blob/master/kip-0010.md) |
| KIP-13 | Network Parameters | Core team | **Activated** (Crescendo) | Additional network parameter adjustments for the Crescendo upgrade | [GitHub](https://github.com/kaspanet/kips) |
| KIP-14 | Crescendo Hardfork | Core team | **Activated** | Meta-KIP defining the Crescendo hard fork, activating KIP-9, KIP-10, KIP-13, and KIP-15 together | [GitHub](https://github.com/kaspanet/kips/blob/master/kip-0014.md) |
| KIP-15 | Sequencing Commitments | Core team | **Activated** (Crescendo) | Recursive canonical transaction ordering commitment (seqcommit) -- enables scripts to reference the ordering of transactions within the DAG | [GitHub](https://github.com/kaspanet/kips/blob/master/kip-0015.md) |
| KIP-16 | ZK Verification Precompiles | Alexander S (saefstroem) | **Testing** (TN12) | On-chain verification opcodes and precompiles for Groth16 and RISC Zero ZK proof systems -- the second pillar of Covenants++ | [GitHub](https://github.com/kaspanet/kips) |
| KIP-17 | Covenant Scripts | Ori Newman (someone235) | **Testing** (TN12) | Covenant script implementation enabling limited programmability on L1 -- the first pillar of Covenants++ | [GitHub](https://github.com/kaspanet/kips) |
| KIP-20 | Covenant IDs | Core team | **Testing** (TN12) | Unique identification mechanism for covenant instances, enabling state tracking and cross-reference. Opcodes 0xcf-0xd3 | [GitHub](https://github.com/kaspanet/kips) |
| KIP-21 | Partitioned Sequencing Commitment | Michael Sutton (missutton) | **Proposal** | Lane-based sequencing commitments enabling O(activity) proving -- the foundational KIP for vProgs. Each vProg only needs to prove work proportional to its own activity | [GitHub](https://github.com/michaelsutton/kips/blob/kip21/kip-0021.md) |

---

## Dependency Graph

KIPs build on each other in a defined dependency chain:

```
KIP-9 (network perf) ──┐
KIP-10 (introspection) ─┤
KIP-13 (parameters) ────┼── KIP-14 (Crescendo hard fork)
KIP-15 (seqcommit) ─────┘
         |
         v
KIP-10 ──── KIP-17 (covenant scripts)
KIP-15 ──── KIP-21 (partitioned seqcommit)
KIP-16 (ZK precompiles) -- standalone, extends KIP-10
KIP-17 ──── KIP-20 (covenant IDs)
```

**Reading the graph:**
- Crescendo (KIP-14) bundled KIP-9, KIP-10, KIP-13, and KIP-15
- KIP-17 (covenants) depends on KIP-10 (transaction introspection)
- KIP-20 (covenant IDs) depends on KIP-17 (covenant scripts)
- KIP-21 (partitioned seqcommit) extends KIP-15 (seqcommit) for vProgs
- KIP-16 (ZK precompiles) is relatively standalone, extending KIP-10's opcode framework

---

## Status Definitions

| Status | Meaning |
|--------|---------|
| **Activated** | Deployed on mainnet via hard fork |
| **Testing** | Implemented and active on TN12 testnet |
| **Proposal** | Formal proposal published, under review |
| **Draft** | Work in progress, not yet formally proposed |

---

## Crescendo KIPs (Activated)

### KIP-9: Network Performance Upgrade

Part of the Crescendo hard fork that brought Kaspa to 10 blocks per second. Adjusted network-level parameters to support higher throughput while maintaining security guarantees.

### KIP-10: Transaction Introspection Opcodes

The foundation for all covenant functionality. KIP-10 adds opcodes that allow scripts to inspect the transaction they are part of -- examining inputs, outputs, amounts, and other transaction fields. Also introduces 8-byte arithmetic, expanding the computational capabilities of Kaspa's script system.

Without KIP-10, covenants cannot exist -- scripts need to "see" the transaction to enforce spending conditions.

### KIP-13: Network Parameters

Additional parameter adjustments complementing KIP-9 for the Crescendo upgrade.

### KIP-14: Crescendo Hardfork

The meta-KIP that defined the Crescendo hard fork activation. Bundled KIP-9, KIP-10, KIP-13, and KIP-15 into a single coordinated upgrade.

### KIP-15: Sequencing Commitments

Introduces a recursive canonical transaction ordering commitment (seqcommit) into blocks. This allows scripts and external verifiers to prove the ordering of transactions within the DAG. KIP-15 provides the base mechanism that KIP-21 later partitions into lanes for vProgs.

---

## Covenants++ KIPs (In Development)

### KIP-16: ZK Verification Precompiles

Authored by Alexander S, KIP-16 adds on-chain verification capabilities for zero-knowledge proofs. Two proof systems are supported:

- **Groth16** -- mature SNARK with tiny constant-size proofs (approximately 200 bytes) and fast verification
- **RISC Zero** -- STARK-based system running on a RISC-V VM, no trusted setup required

These precompiles are the second pillar of Covenants++, enabling based rollup integration with L1.

**Status:** Active on TN12 since the February 9 reset.

### KIP-17: Covenant Scripts

Authored by Ori Newman, KIP-17 implements the covenant script system -- the first pillar of Covenants++. Covenants allow scripts to enforce conditions on how UTXOs can be spent, enabling:

- Native non-KAS assets
- Smart money management
- Programmable spending conditions

**Status:** Implementation ready for review since December 26, 2025. Active on TN12.

### KIP-20: Covenant IDs

Provides unique identification for covenant instances. Assigns opcodes 0xcf through 0xd3 for covenant ID operations (agreed January 17, 2026). Enables:

- Tracking covenant state across transactions
- Referencing specific covenant instances
- Building higher-level abstractions on top of covenants

**Status:** Formal proposal published February 11, 2026. Active on TN12.

### KIP-21: Partitioned Sequencing Commitment

Authored by Michael Sutton, KIP-21 is the foundational KIP for vProgs. It partitions the sequencing commitment (from KIP-15) into lanes, where each lane corresponds to a vProg or subnet. This enables:

- **O(activity) proving** -- a vProg only proves work proportional to its own activity, not all L1 activity
- **Scalable verification** -- the cost of running a vProg scales with its usage, not the network's total throughput
- **Program isolation** -- each vProg has its own sequencing lane

The "degenerate" CD commit scheme groups activity by programs/subnets (not accounts) for Phase 1 standalone vProgs. The full synchronous composability CD scheme comes later.

**Status:** Proposal published February 24, 2026. Under review.

**Open question:** An RPC layer needs to be designed to expose lane roots and activity status to external users for proof generation (raised by Maxim Biryukov, confirmed by Sutton).

---

## Further Reading

- [Development Roadmap](/ecosystem/roadmap) -- how KIPs map to development phases
- [Testnet Updates](/changelog/testnet-updates) -- which KIPs are active on TN12
- [Sources & Links](/references/sources) -- links to all KIP documents
- [R&D Channel Insights](/changelog/rnd-insights) -- context behind KIP decisions
