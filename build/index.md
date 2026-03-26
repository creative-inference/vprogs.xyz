---
layout: section
title: "Build on vProgs"
section: build
description: "Start building verifiable programs on Kaspa. vProgs bring sovereign, ZK-verified programmability to Kaspa's L1 BlockDAG -- off-chain execution with on-chain cryptographic proof, unified liquidity, and synchronous composability."
---

Whether you are writing your first covenant in Silverscript or architecting a full DeFi protocol with ZK proofs, this section has you covered.

---

## Pages in This Section

{% include section-pages.html section="build" %}

---

## Platform Status

| Component | Status | Notes |
|-----------|--------|-------|
| Kaspa L1 BlockDAG (10 BPS) | **Live** | Mainnet, DagKnight consensus |
| Covenants++ Hard Fork | **Scheduled May 5, 2026** | KIP-16, KIP-17, KIP-20, KIP-21 |
| Silverscript | **Experimental (TN12)** | Compiles to native Kaspa Script |
| vProgs Repo | **Public** | [github.com/kaspanet/vprogs](https://github.com/kaspanet/vprogs) |
| Phase 1: Standalone vProgs | **In Development** | Sovereign programs, ZK bridge to L1 |
| Phase 2: Synchronous Composability | **Research** | Cross-vProg atomic transactions |

## Architecture at a Glance

```
User defines state transition
    |
    v
Off-chain prover executes logic
    |
    v
ZK proof generated (Noir / RISC Zero / Cairo)
    |
    v
Proof + state commitment submitted to L1
    |
    v
L1 validates proof cryptographically (no re-execution)
    |
    v
State finalized with instant DAG finality
```

vProgs use a layered architecture where Silverscript handles UTXO-level covenants (local state) and vProgs handle account-based state machines (shared state). Both build on the Covenants++ consensus layer. See the [Silverscript Reference](/build/silverscript-reference/) for the covenant programming model and the [Tutorials](/build/tutorials/) for hands-on guides.

---

## Community and Support

- **Source Code:** [github.com/kaspanet/vprogs](https://github.com/kaspanet/vprogs) | [github.com/kaspanet/silverscript](https://github.com/kaspanet/silverscript)
- **Research Forum:** [research.kas.pa](https://research.kas.pa)
- **Core R&D Channel:** [t.me/kasparnd](https://t.me/kasparnd)
- **KIPs Repository:** [github.com/kaspanet/kips](https://github.com/kaspanet/kips)
