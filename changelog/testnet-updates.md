---
layout: page
title: "Testnet Updates"
section: changelog
---

TN12 is the primary testnet for Covenants++ and vProgs development. This page tracks its launch, resets, feature set, and known issues.

---

## TN12 Overview

TN12 serves as the proving ground for the Covenants++ hard fork features before they ship to mainnet. It is where ZK verification, covenant scripts, and new opcodes are tested in a live network environment.

| Property | Value |
|----------|-------|
| Testnet name | TN12 |
| Initial launch | January 5, 2026 |
| Major reset | February 9, 2026 |
| Purpose | Covenants++ feature testing |
| Branch | `covpp` in rusty-kaspa |
| Status | Active |

---

## Launch: January 5, 2026

TN12 launched as the dedicated Covenants++ testnet. The initial deployment included the base covenant infrastructure and provided a live environment for core developers to iterate on the hard fork features.

The same day, Michael Sutton published the [milestones gist](https://gist.github.com/michaelsutton/5bd9ab358f692ee4f54ce2842a0815d1) outlining the phased path from covenants to full vProgs.

---

## Reset: February 9, 2026

TN12 was reset with several significant new features. Michael Sutton announced:

> "TN12 reset is live with a few significant new features, including: Covenant IDs, Opcode for accessing a Blake3-based sequencing commitment, ZK verify precompiles + opcodes for Groth16 and RISC0."

### Features Added in Reset

#### Covenant IDs (KIP-20)

Covenant IDs provide a mechanism for identifying and tracking covenant instances on-chain. This enables:

- Unique identification of each covenant deployment
- State tracking across transactions
- Reference by other covenants and applications

Opcodes 0xcf through 0xd3 were assigned for covenant ID operations (agreed January 17, 2026).

**Related proposal:** [KIP-20](https://github.com/kaspanet/kips) -- formal proposal published February 11, 2026.

#### Blake3 Sequencing Commitment (seqcommit)

An opcode (0xd4) for accessing a Blake3-based sequencing commitment within covenant scripts. This enables covenants to reference the canonical transaction ordering, which is essential for:

- Verifying that transactions are included in the correct sequence
- Building proofs that reference L1 block ordering
- Foundation for KIP-21's partitioned sequencing commitments

**Design note:** Blake3 was chosen for L1 seqcommit despite being approximately 10x more costly than Blake2s in Cairo, because Blake3 has roughly a 40% performance advantage in SP1/RISC Zero -- the stacks used for based ZK apps.

#### ZK Verification Precompiles

On-chain verification support for two ZK proof systems:

**Groth16:**
- Mature, widely-used SNARK system
- Tiny proof size (constant, approximately 200 bytes)
- Fast on-chain verification
- Used in the ZK Covenant Rollup PoC for on-chain verification

**RISC Zero:**
- STARK-based proof system running on a RISC-V virtual machine
- Larger proof sizes but no trusted setup required
- Used for based ZK applications (10-30 second proof times)
- Enables general-purpose computation proving

These precompiles are defined by KIP-16 (authored by Alexander S).

---

## Post-Reset Development

After the TN12 reset, several major milestones were achieved on the testnet:

### ZK Covenant Rollup PoC (February 19, 2026)

Maxim Biryukov demonstrated the full deposit-transfer-withdraw cycle on TN12:

- **Deposit:** Users deposit KAS via a delegate script on L1
- **Transfer:** L2 transfers between accounts within the rollup
- **Withdraw:** Users withdraw via a permission tree with ZK-proven authorization
- **Proof systems:** Both STARK (succinct) and Groth16 proofs generated and verified on-chain
- **State management:** Sparse Merkle Tree for L2 account state
- **Sequencing:** Sequence commitment chaining L1 block data into proofs
- **Script verification:** Full on-chain verification through kaspa-txscript

This PoC represents the canonical bridge template -- the pattern that all based rollup applications on Kaspa will follow.

**Resources:**
- [ZK Rollup PoC Book](https://biryukovmaxim.github.io/rusty-kaspa/ch01-introduction.html)
- [Source branch](https://github.com/biryukovmaxim/rusty-kaspa/tree/zk-rollup-covenant-example)

### Native Assets ZK PoC (January 6, 2026)

Ori Newman published a native assets proof-of-concept using SP1, demonstrating how first-class token support can work on L1 with ZK verification. This was demonstrated on TN12 prior to the reset.

### Silverscript Testing

Following Silverscript's announcement on February 10, the language has been used for covenant development on TN12. Tooling development includes:

- VSCode extension by IzioDev
- DAP debugger by manyfestation (PR submitted March 10, 2026)
- Covenant declarations proposal by Michael Sutton (February 24, 2026)

---

## TN12 Feature Summary

| Feature | Opcode(s) | KIP | Status |
|---------|-----------|-----|--------|
| Covenant ID operations | 0xcf - 0xd3 | KIP-20 | Active on TN12 |
| Blake3 seqcommit | 0xd4 | KIP-15 (extended) | Active on TN12 |
| Groth16 verification | Precompile | KIP-16 | Active on TN12 |
| RISC Zero verification | Precompile | KIP-16 | Active on TN12 |
| Transaction introspection | Various | KIP-10 | Active (from Crescendo) |
| Covenant scripts | Various | KIP-17 | Active on TN12 |

---

## Known Issues and Open Questions

### Covenant State Past Pruning

How applications preserve state after L1 pruning is an active design question. IzioDev raised this on March 12, 2026, proposing an optional kaspad indexer with trustless historical data retrieval. This affects any application running on TN12 that needs to reference historical state.

### RPC Layer for External Proof Generation

External applications (including vProgs) need RPC access to lane roots and activity status to produce proofs. This interface is not yet designed. Maxim Biryukov flagged this on March 4, 2026, and Michael Sutton confirmed it as a necessary design item.

### Proof Size and Cost

While Groth16 proofs are tiny (approximately 200 bytes), RISC Zero proofs are significantly larger. The economic model for on-chain verification costs is still being designed as part of the broader gas model.

### Hash Function Selection

The choice of Blake3 for the seqcommit opcode creates a trade-off: it is optimal for SP1/RISC Zero-based applications but approximately 10x more expensive for Cairo-based rollups (where Blake2s has a precompile). This may influence which ZK stack is preferred for different application types.

---

## Testnet History

| Date | Event |
|------|-------|
| 2026-01-01 | `covpp` branch created in rusty-kaspa |
| 2026-01-05 | TN12 launched |
| 2026-01-06 | Native assets ZK PoC (SP1) demonstrated |
| 2026-01-17 | Opcode numbers agreed (0xcf-0xd4) |
| 2026-02-09 | TN12 reset with Covenant IDs, Blake3 seqcommit, ZK precompiles |
| 2026-02-19 | ZK Covenant Rollup PoC completed (Milestone 3) |
| 2026-02-24 | KIP-21 published; covenant declarations proposal |
| 2026-03-04 | Rusty Kaspa v1.1.0 stable release (pre-covpp baseline) |
| 2026-03-10 | Silverscript DAP debugger PR |

---

## Further Reading

- [Changelog](/changelog/) -- full development timeline
- [R&D Channel Insights](/changelog/rnd-insights) -- technical context from core developers
- [Development Roadmap](/ecosystem/roadmap) -- how TN12 fits into the phased rollout
- [KIP Index](/references/kips) -- status of proposals being tested on TN12
- [Repositories](/references/repos) -- links to the covpp branch and related code
