---
layout: page
title: "Applications"
section: applications
description: "Real-world industry applications built on vProgs and Kaspa. Banking, DeFi, energy trading, supply chain provenance, and government infrastructure."
---

vProgs turn Kaspa into programmable settlement infrastructure. Where the Kaspa network has long provided fast, secure, proof-of-work finality, vProgs add the logic layer that enterprise and industrial applications require: conditional payments, ZK-verified compliance, real-time data feeds, and atomic multi-party settlement -- all on a single unified ledger without bridges or fragmented liquidity.

This section covers real-world industry deployment. For the technical architecture of what vProgs are and how they work, see the [ecosystem applications overview](/ecosystem/applications) and the [architecture section](/architecture/).

---

## Industry Sectors

### [Banking & Finance](/applications/banking)

The global correspondent banking system moves money through chains of intermediary institutions. A typical cross-border transfer takes 3--5 business days and costs around $45 in fees. Settlement risk accumulates at every hop.

vProgs enable direct settlement between counterparties with near-instant DagKnight finality, ISO 20022-compatible messaging middleware, and ZK-proven compliance checks that satisfy regulatory requirements without exposing sensitive transaction data.

Active initiatives include WarpCore (ISO 20022 middleware), KasUnion (credit union DeFi), EigenFlow (DAG-native market-making), and K-MIF (usage-based mobility insurance).

[Banking & Finance details](/applications/banking)

---

### [DeFi](/applications/defi)

Decentralized finance on vProgs operates at L1 -- no bridges, no fragmented liquidity across competing rollups, no cross-chain settlement risk. Every vProg shares the same L1 state. In Phase 2, they interact atomically: a single transaction can borrow, swap, stake, and repay across multiple protocols with no partial execution risk.

The first ZK covenant rollup proof-of-concept ran a full deposit-transfer-withdraw cycle on TN12 in February 2026. Early DEX and lending prototypes are active.

[DeFi details](/applications/defi)

---

### [Energy](/applications/energy)

Global carbon and renewable energy credit markets are projected to reach $2 trillion by 2030. Today they operate through fragmented bilateral contracts, slow settlement infrastructure, and limited price transparency. Verification of green credentials typically relies on centralized registries.

ZET-EX is a decentralized exchange for tokenized energy assets -- green hydrogen, e-fuels, and carbon offsets -- developed by the ZETA alliance and targeting MENA region markets. GigaWatt Coin tokenizes fractional kilowatt-hours against physical renewable energy infrastructure. RTD covenants on Kaspa bring real-time energy price data to L1 without an external oracle.

[Energy details](/applications/energy)

---

### [Supply Chain](/applications/supply-chain)

Product counterfeiting costs the global economy an estimated $4.5 trillion annually. Existing provenance solutions typically record data on-chain but cannot enforce verification rules across organizational boundaries.

OliveChain is a named pilot for olive oil fraud prevention -- a sector where 70--80% of products labeled extra virgin fail authenticity standards. The architecture extends to pharmaceuticals, luxury goods, agricultural certification, and any multi-party provenance use case. ZK proofs on IoT sensor data allow each participant to contribute verified records without exposing proprietary operational data.

[Supply chain details](/applications/supply-chain)

---

### [Government & Public Sector](/applications/government)

Government applications require the strongest combination of transparency and privacy: records must be auditable and tamper-proof, while individual citizen data must remain protected. ZK proofs make both simultaneously achievable.

Airspace3D addresses decentralized airspace management for drones and urban air mobility -- an emerging regulatory challenge with no satisfactory centralized solution. Additional applications include digital identity credentials, land registry, public records anchoring, ZK-verified voting, and smart city infrastructure.

[Government & Public Sector details](/applications/government)

---

## The KII Foundation

The [Kaspa Industrial Initiative (KII) Foundation](https://kaspa-kii.org/) (kaspa-kii.org) is the enterprise adoption arm of the Kaspa ecosystem, incorporated as a non-profit and launched July 18, 2024. KII exists to ensure that institutional demand, regulatory readiness, and industry partnerships are in place as vProgs ship.

**Leadership with direct sector experience:**

- **Paul van Son** (Chairman) -- co-founded Dii Desert Energy, a clean energy initiative spanning 120+ partners across 35 countries; co-founded ZETA (Zero Emissions Traders Alliance)
- **Bara Greplova** (Secretary General) -- heads Institutional Relations at INATBA, the International Association for Trusted Blockchain Applications (230+ member organizations)
- **Rosella Migliavacca** (Board) -- former Head of Innovation at Eni SpA, one of Europe's largest energy companies
- **Rory O'Neill** (Board) -- 20+ years in energy trading
- **Charles Bourne** (Board) -- institutional real estate tokenization

KII applied to the European Central Bank's Pontes Market Contact Group, a body advising on European financial market infrastructure. The foundation hosted the "Kaspa in Enterprise" conference in Dublin in Autumn 2024.

The significance of KII is not organizational -- it is network-effect evidence. The same people who built the largest clean energy trading networks are building the energy trading applications for Kaspa. The market knowledge, regulatory relationships, and counterparty trust they bring do not need to be rebuilt from scratch.

---

## Key Statistics

| Metric | Source |
|--------|--------|
| 120+ partner organizations | Dii Desert Energy (Paul van Son) |
| 35 countries | Dii Desert Energy reach |
| 230+ member organizations | INATBA (Bara Greplova) |
| ECB Pontes Group | Applied by WarpCore / KII |
| $45 average cross-border transfer fee | World Bank data |
| 3--5 day settlement | Correspondent banking standard |
| 70--80% olive oil fraud rate | EU enforcement data |
| $4.5T counterfeiting cost | Global IP crime estimates |
| $2T carbon market projection by 2030 | BloombergNEF |

---

## Development Status

All KII projects are being developed in anticipation of vProgs reaching production. The underlying Kaspa infrastructure is on a defined schedule:

| Milestone | Status |
|-----------|--------|
| Kaspa mainnet (30,000+ TPS target) | Live |
| Covenants++ hard fork | Scheduled May 5, 2026 |
| ZK covenant rollup PoC (TN12) | Completed February 2026 |
| vProgs Phase 1 (standalone programs) | Active development |
| vProgs Phase 2 (synchronous composability) | Research and design |

Application-specific statuses are noted on each sector page. Where a project is in sandbox, development, or pilot stage, that is stated explicitly.

---

## Further Reading

- [Ecosystem: Applications & Use Cases](/ecosystem/applications) -- technical developer view
- [KII Foundation](/ecosystem/kii) -- foundation overview and objectives
- [Development Roadmap](/ecosystem/roadmap) -- infrastructure timeline
- [Architecture](/architecture/) -- how vProgs work technically
