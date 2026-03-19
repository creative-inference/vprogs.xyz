---
layout: page
title: "Energy"
section: applications
description: "vProgs for energy markets. ZET-EX decentralized exchange, GigaWatt Coin, EigenFlow market-making, and tokenized green energy assets on Kaspa."
---

Global carbon credit and renewable energy certificate markets are projected to reach $2 trillion by 2030. These markets exist to price and transfer the environmental value of clean energy production and carbon reduction -- but they operate with significant structural inefficiencies: fragmented bilateral trading between participants, settlement that can take days, limited price transparency, and verification of underlying environmental claims that depends on centralized registries that are difficult to audit.

The clean energy transition will require enormous capital flows directed at the right assets in the right places at the right time. Infrastructure that cannot price and settle green energy assets efficiently is infrastructure that slows the transition.

vProgs bring settlement-layer infrastructure to energy markets: a decentralized exchange for tokenized energy assets, fractional tokenization of physical energy infrastructure, a market-making framework built for Kaspa's DAG architecture, and real-time data covenants that enable price feeds and IoT verification at L1 without external oracle dependencies.

The people building these applications have direct energy sector experience. The KII Foundation leadership includes the co-founders of Dii Desert Energy (120+ partners, 35 countries) and ZETA (Zero Emissions Traders Alliance), a former Head of Innovation at Eni SpA, and 20+ years of energy trading expertise. This is not a generic blockchain application of energy market concepts -- it is an initiative led by practitioners who know the specific market failures they are addressing.

---

## The Energy Trading Problem

### Fragmented Markets

Carbon credits, renewable energy certificates (RECs), green hydrogen certificates, and e-fuel credits each trade in separate market infrastructure, often through separate registries and settlement systems. A counterparty wanting to construct a portfolio across asset classes must maintain relationships, accounts, and settlement processes with multiple separate market operators. Price discovery across asset classes is opaque because there is no unified view.

### Settlement Latency

Bilateral OTC (over-the-counter) trades in environmental markets often settle T+2 or longer. For a market where climate-policy decisions create sudden demand spikes, 2-day settlement is a meaningful constraint on market responsiveness. Slower settlement also increases counterparty credit risk -- the period during which one party has delivered and the other has not yet paid.

### Verification and Trust

The value of a carbon credit or renewable energy certificate depends entirely on the validity of the underlying claim: that a specific quantity of CO2 was captured, that a specific kilowatt-hour was generated from a renewable source. Verification typically relies on accredited third-party auditors and centralized registries. This creates single points of failure and has historically been a source of double-counting scandals and fraudulent claims that undermine market confidence.

### Geographic Concentration

Clean energy production is concentrated in regions with high solar or wind resources -- the MENA (Middle East and North Africa) region has exceptional solar capacity and is the focus of some of the largest renewable energy development projects globally. Efficiently connecting MENA energy production to global capital markets that want exposure to clean energy assets requires cross-border settlement infrastructure.

---

## ZET-EX

ZET-EX is a decentralized exchange for tokenized energy assets -- green hydrogen certificates, e-fuel credits, carbon offsets, and related instruments. It is the flagship application of the ZETA (Zero Emissions Traders Alliance), and its primary geographic focus is the MENA region.

**Origins:** ZETA was co-founded by Paul van Son, KII Foundation Chairman. Van Son also co-founded Dii Desert Energy, the initiative that brought together 120+ partners across 35 countries to develop the clean energy potential of the MENA desert regions. ZET-EX is a direct application of that network's insight into what market infrastructure clean energy trading requires.

**What ZET-EX provides:**

- A decentralized exchange where tokenized energy assets can be traded without a central counterparty
- Unified price discovery across asset classes that currently trade in separate systems
- Settlement on Kaspa L1 with DagKnight finality -- replacing multi-day bilateral settlement with near-instant final settlement
- Transparent on-chain order books and trade history, auditable by any market participant
- Programmable settlement conditions: payment conditional on delivery confirmation, compliance attestation, or counterparty verification

**MENA focus:** The Middle East and North Africa region is emerging as a major green hydrogen and solar energy production center. Projects including NEOM's hydrogen facility in Saudi Arabia and Abu Dhabi's clean energy initiatives represent the scale of investment in the region. ZET-EX is designed to serve this market from the start, with the ZETA alliance's existing counterparty relationships providing initial liquidity.

**EigenFlow integration:** ZET-EX uses EigenFlow (described below) as its market-making framework. Tight spreads are essential for a functional market -- without them, the bid-ask spread becomes an implicit tax on every transaction, reducing market efficiency and deterring participation.

**Current status:** ZET-EX is in development. A demonstration was presented at the 15th Dii Desert Energy Leadership Summit in Dubai in November 2025. This is an industry-level conference -- the same forum where multi-billion dollar clean energy projects are announced -- and the presentation represents engagement with the actual target market, not just a blockchain industry audience.

ZET-EX is not yet in production. It is awaiting the Kaspa infrastructure (Covenants++ and vProgs Phase 1) that its settlement layer requires.

---

## GigaWatt Coin

GigaWatt Coin is a blockchain instrument backed by renewable energy credits and physical energy infrastructure.

**Fractional kWh tokenization:** The core concept is representing kilowatt-hours of renewable energy production as on-chain tokens -- each token corresponding to a verifiable unit of clean energy generated by a specific facility. This allows fractional ownership of energy production: a holder of GigaWatt Coin tokens has exposure to the value of the energy those tokens represent.

**What backs the token:** Physical energy infrastructure (solar installations, wind farms, grid assets) and the renewable energy credits generated by that infrastructure. The token is designed to be an energy-backed instrument -- its value is grounded in real-world production, not just algorithmic mechanisms.

**Why this matters for capital allocation:** Clean energy infrastructure requires large upfront capital investment. Tokenization allows that capital to be raised more efficiently by making the underlying asset divisible, tradable, and accessible to a broader investor base. An institution that wants clean energy exposure but cannot build a solar farm can hold GigaWatt Coin tokens.

**Settlement and yield:** Token holders receive their proportional share of energy revenue -- effectively, a yield instrument tied to energy production. Smart contract logic handles revenue distribution automatically: as energy sales settle to the protocol's treasury, proceeds distribute to token holders without requiring active management or trust in a fund manager.

**Current status:** GigaWatt Coin is in development. It requires Kaspa native assets (shipping with Covenants++) and vProgs for the distribution logic.

---

## EigenFlow

EigenFlow is the market-making framework that enables tight spreads on energy asset markets -- and on any tokenized asset market on Kaspa. It was published on Zenodo, the academic research repository hosted by CERN, making it a peer-visible technical contribution.

**The market-making problem in a DAG:** Standard market-making models were designed for sequential order books. The Avellaneda-Stoikov model -- the dominant quantitative framework for optimal bid-ask spread determination -- assumes a sequential clearing process. Kaspa's BlockDAG confirms blocks in parallel. Applying Avellaneda-Stoikov directly to a parallel block environment creates pricing inconsistencies: a market maker quoting prices based on sequential assumptions will misprices inventory risk in a DAG topology.

**EigenFlow's solution:**

- **Spectral Consensus Kernel:** Adapts the Avellaneda-Stoikov framework to account for the parallel confirmation structure of the BlockDAG. Instead of treating confirmation as a sequential queue, the kernel models confirmation probability as a spectral property of the DAG's topology at any given moment.
- **EigenFlow weights:** A dynamic weighting scheme that adjusts the market maker's bid-ask spread and inventory targets based on real-time DAG state. Positions are managed relative to the parallel block structure, not a sequential queue.

**Claimed efficiency gain:** The published analysis claims 35--75% efficiency improvement compared to naive application of traditional market-making models to DAG environments. This is a research claim requiring independent verification before treating it as a guaranteed production performance figure. The range (35--75%) reflects sensitivity to market conditions and configuration.

**Application to energy markets:** For ZET-EX to function as a liquid market, market makers need a framework that actually works for Kaspa's architecture. EigenFlow is that framework. Better market-making efficiency means tighter spreads, which means lower transaction costs for every participant, which means a more liquid market.

---

## RTD Covenants: Real-Time Energy Data at L1

RTD (Real-Time Data) is one of the three founding pillars of Kaspa's Covenants++, alongside covenants and ZK verification. RTD covenants allow miners to include payload data that covenants can inspect and aggregate.

**What this means for energy markets:**

- Real-time energy prices can be committed to L1 as part of block production, without requiring a separate oracle network
- Smart contracts can reference current energy spot prices for settlement calculations, derivative pricing, and collateral valuation
- Grid data (frequency, demand, regional pricing) can be included in miner payloads, making it available to on-chain logic

**Why no external oracle is preferable:** External oracle systems (Chainlink and equivalents) are separate trust assumptions: the oracle network must be honest and available, and oracle data can be manipulated or delayed. RTD eliminates this dependency for data that can be included by miners -- the same economic participants who are already securing the network.

For energy markets specifically, real-time pricing data is fundamental. A carbon credit exchange cannot price efficiently without current market data. RTD makes that data natively available at L1.

---

## ZK IoT: Verified Generation Data

The value of a renewable energy certificate or green hydrogen credit depends on the verified claim that a specific quantity of clean energy was produced. Today, this verification is typically performed by accredited third-party auditors who inspect metering data and certify compliance with a registry standard.

**The ZK IoT alternative:**

- Smart meters and generation monitoring equipment produce continuous data streams
- That data is processed off-chain; ZK proofs are generated attesting that the raw data meets the certification criteria (e.g., that X MWh of solar energy was generated during period T at facility F)
- The proof, not the raw data, is submitted to L1
- The certificate is issued automatically when the proof verifies

This eliminates the auditor's role as a trusted intermediary. The certificate's validity is backed by cryptographic proof, not by an auditor's signature. It also solves the data privacy problem: grid operators and energy producers may not want to share precise generation data publicly (competitive reasons, infrastructure security). ZK proofs allow the certificate to be issued and verified without the raw data being exposed.

**Smart grid settlement:** Automated payment on verified delivery -- when a ZK proof confirms that X kWh reached a specific delivery point, payment releases automatically. This applies to long-term power purchase agreements, day-ahead market settlements, and real-time balancing market transactions.

---

## KII Leadership in Energy

The energy applications on Kaspa are not generic blockchain applications built by generalists. The leadership team has direct, demonstrated experience in the energy markets they are targeting:

**Paul van Son (KII Chairman):**
- Co-founded Dii Desert Energy -- the clean energy initiative that built the international consortium (120+ partners, 35 countries) for desert solar development
- Co-founded ZETA (Zero Emissions Traders Alliance) -- the organization from which ZET-EX emerges
- The MENA focus of ZET-EX is a direct continuation of the market development work van Son has been doing for over a decade

**Rory O'Neill (KII Board):**
- 20+ years of energy trading experience
- Direct knowledge of how energy markets price assets, how counterparties interact, and where the current infrastructure fails

**Rosella Migliavacca (KII Board):**
- Former Head of Innovation at Eni SpA -- one of Europe's largest integrated energy companies
- Institutional knowledge of how major energy companies evaluate and adopt new infrastructure

**The 15th Dii Desert Energy Leadership Summit, Dubai, November 2025:**
- ZET-EX was demonstrated at this summit -- not a blockchain conference, but the annual gathering of the Dii Desert Energy network
- This is the relevant audience: clean energy project developers, investors, and government stakeholders in the MENA region who will be the actual users of a functioning ZET-EX market

---

## Application Status Summary

| Initiative | Status |
|------------|--------|
| ZET-EX (decentralized energy exchange) | In development; Dubai summit demo November 2025 |
| GigaWatt Coin (fractional kWh tokenization) | In development |
| EigenFlow (market-making framework) | Whitepaper published on Zenodo |
| RTD covenants (native L1 data feeds) | Shipping with Covenants++ May 5, 2026 |
| Kaspa Covenants++ (infrastructure prerequisite) | Scheduled May 5, 2026 |
| vProgs Phase 1 (exchange infrastructure) | Active development |

---

## Further Reading

- [Banking & Finance Applications](/applications/banking) -- EigenFlow and KII in financial markets
- [Supply Chain Applications](/applications/supply-chain) -- provenance and certification
- [KII Foundation](/ecosystem/kii) -- foundation leadership and objectives
- [Ecosystem Applications](/ecosystem/applications) -- technical architecture
- [Development Roadmap](/ecosystem/roadmap) -- infrastructure timeline
