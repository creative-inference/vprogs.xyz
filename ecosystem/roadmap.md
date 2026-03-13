---
layout: page
title: "Development Roadmap"
section: ecosystem
---

Kaspa is evolving from a pure proof-of-work digital currency into a universal programmable settlement layer. Two major concurrent upgrades drive this transformation: **DagKnight** (consensus) and **vProgs** (programmability). This page tracks the phased rollout from foundational consensus changes through to a full application ecosystem.

---

## Timeline

### Crescendo (Activated)

The first covenant-enabling hard fork, activating KIP-9, KIP-10, KIP-13, and KIP-15. Crescendo brought the 10 BPS upgrade and laid the groundwork for transaction introspection and sequencing commitments -- the primitives that Covenants++ and vProgs build upon.

- **KIP-10:** Transaction introspection opcodes and 8-byte arithmetic
- **KIP-15:** Recursive canonical transaction ordering commitment (seqcommit)
- **KIP-9/13:** Network-level performance upgrades

### Covenants++ (Targeting May 5, 2026)

The second hard fork, announced by Yonatan Sompolinsky on December 14, 2025. Covenants++ delivers three pillars of L1 programmability:

| Pillar | Description | Key KIPs |
|--------|-------------|----------|
| **Covenants** | Limited programmability framework for native assets, smart money management | KIP-17, KIP-20 |
| **ZK Verifier** | On-chain verification of zero-knowledge proofs (Groth16 + RISC Zero) | KIP-16 |
| **RTD Support** | Real-time data -- covenant type for inspecting and aggregating miner payloads | -- |

Additional features shipping with this fork:

- Covenant IDs (KIP-20)
- Blake3-based sequencing commitment opcode
- ZK verify precompiles and opcodes for Groth16 and RISC Zero
- Native assets support (ZK PoC demonstrated using SP1 by Ori Newman)
- Silverscript -- the L1 covenant language (announced Feb 10, 2026)

### DagKnight (Active Development)

The evolution of the GHOSTDAG protocol into a parameterless adaptive consensus mechanism:

- Enhanced block ordering precision
- Near-instant finality
- Prerequisite for vProgs deployment at full throughput
- DagKnight branch active in the main rusty-kaspa repository (as of Feb 27, 2026)

### vProgs (Phased Rollout)

Native L1 programmability via off-chain execution with on-chain ZK verification. The vProgs repo went public on January 21, 2026.

- **Phase 1 -- Standalone vProgs:** Sovereign programs bridging to L1 via ZK proofs, operating independently. No cross-vProg composability. No L1 account model yet.
- **Phase 2 -- Synchronous Composability:** Cross-vProg atomic transactions, concise witness mechanism, prover market infrastructure, and the full computation DAG.

---

## Development Phases

### Phase 1: Core Infrastructure

Focus: Consensus-level prerequisites.

- DagKnight consensus implementation
- Enhanced block ordering and sequencing
- Network stability and performance testing
- TN12 testnet deployment and iteration

**Status:** Active. TN12 launched January 5, 2026; reset with new features February 9, 2026.

### Phase 2: vProgs Foundation

Focus: L1 primitives for verifiable programs.

- Account model implementation
- ZK proof verification on L1 (Groth16 + RISC Zero precompiles)
- State commitment mechanism (Merkle tree structure)
- Basic vProg deployment framework
- L1 bridge implementation
- KIP-21 partitioned sequencing commitments (lane-based, enabling O(activity) proving)

**Status:** Active. ZK Covenant Rollup PoC completed February 19, 2026 (full deposit-transfer-withdraw cycle). KIP-21 published February 24, 2026.

### Phase 3: Composability

Focus: Cross-program interaction and economic infrastructure.

- Cross-vProg atomic transactions
- Concise witness mechanism
- Prover market infrastructure
- Gas model and resource management
- Full computation DAG (the "syncompo CD" scheme)

**Status:** Design phase. Depends on Phase 2 maturity.

### Phase 4: Full Ecosystem

Focus: Developer tools and application layer.

- Developer tools and SDKs
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
        --> vProgs L1 Integration (sequencing + ZK verification)
              --> Synchronous Composability (cross-vProg atomicity)
                    --> Application Layer (DeFi, DAOs, enterprise)
```

Within the Covenants++ fork, dependencies include:

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
| Composability | Synchronous, atomic | vProgs Phase 2 |
| Security | Pure PoW + ZK proofs | Covenants++ |
| Liquidity | Unified L1 | Native assets + vProgs |
| Programmability | Native vProgs | vProgs Phase 1+ |

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
