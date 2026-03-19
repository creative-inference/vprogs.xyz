---
layout: page
title: "Banking & Finance"
section: applications
description: "vProgs for banking and financial services. ISO 20022 settlement, ZK compliance, market-making, credit unions, and mobility insurance on Kaspa."
---

The global correspondent banking system is a network of bilateral account relationships built over decades. It moves trillions of dollars but does so slowly, expensively, and through chains of intermediaries that each introduce delay and counterparty risk. Cross-border transfers average 3--5 business days and $45 in fees. Settlement is not final until cleared through multiple institutions. And compliance -- the KYC, AML, and sanctions screening that regulators require -- adds further overhead at every step.

vProgs address the settlement layer directly. Near-instant DagKnight finality eliminates interbank settlement risk. ZK-proven compliance checks satisfy regulatory requirements without sharing raw transaction data with every party in the chain. ISO 20022-compatible middleware bridges existing bank messaging infrastructure to Kaspa settlement. The result is a path from the current correspondent banking architecture to direct settlement -- not as a wholesale replacement, but as an opt-in alternative that banks can adopt incrementally.

---

## The Settlement Problem

### Correspondent Banking

A payment from a small European bank to a recipient in Southeast Asia typically flows:

```
Sending Bank
  --> Correspondent Bank (Europe)
    --> Correspondent Bank (Clearing Region)
      --> Receiving Correspondent
        --> Receiving Bank
```

Each hop adds 1--2 business days, a fee, and an additional point of failure. The sending bank does not have direct visibility into when or whether the payment completes. SWIFT messaging coordinates the chain but does not provide finality -- it communicates instructions, not settlement.

### The Fee Structure

The $45 average cross-border transfer fee (World Bank data) is the visible cost. The hidden cost is float: money in transit is not earning return, and the 3--5 day window creates treasury management complexity for any business that sends or receives international payments regularly.

For remittances to developing countries, the impact is more direct. A family sending $200 home from abroad loses $9--15 in transfer fees -- a meaningful percentage of the transferred amount -- and waits days for it to arrive.

### The Compliance Overhead

Correspondent banks perform KYC and AML screening at each hop. This means the same customer's data is verified multiple times by different institutions, each maintaining their own compliance infrastructure, without those institutions being able to share the underlying data for privacy and competitive reasons.

The result is duplicated cost across the system and compliance checks that are inconsistent because different institutions apply different standards to the same underlying facts.

---

## How vProgs Solve It

### Instant Finality

DagKnight consensus provides near-instant finality. A payment that settles on Kaspa is final -- there is no pending state, no settlement window, no possibility of reversal through a clearing process. This eliminates the float problem and the counterparty risk that accumulates when settlement is deferred.

### ZK-Proven Compliance

Zero-knowledge proofs allow a compliance check to be performed and its result attested to cryptographically -- without the verifying party seeing the underlying data. A bank can prove that a customer passed KYC and AML screening to a counterparty or regulator without revealing the customer's personal information. The proof is mathematically binding: it is either valid or it is not.

This breaks the dilemma between privacy and compliance. Regulators can verify that checks were performed correctly. Counterparties can accept the attestation without receiving a copy of the underlying data. The compliance cost is incurred once, and the proof travels with the transaction.

### Selective Disclosure

ZK selective disclosure allows more granular attestation: prove that a transaction amount falls below a reporting threshold without revealing the exact amount; prove that a counterparty is not on a sanctions list without revealing which list was checked or what other accounts they hold; prove solvency without disclosing a full balance sheet.

This architecture is not theoretical -- ZK proof generation runs in approximately 1 second on mobile hardware for inline covenant proofs, and 10--30 seconds for larger based applications. Verification on Kaspa L1 is near-instant once a proof is submitted.

### Conditional Payment Release

vProgs encode payment conditions directly: release funds when delivery is confirmed, when a compliance check passes, when a counterparty signature is received, or when any combination of verifiable conditions is met. This replaces letters of credit and escrow arrangements that currently require trusted intermediary institutions with programmatic enforcement.

---

## WarpCore

WarpCore is ISO 20022-compliant middleware that bridges existing bank messaging infrastructure to Kaspa settlement.

**What ISO 20022 is:** ISO 20022 is the emerging global standard for financial messaging -- the data format that banks, clearing houses, and payment systems use to communicate instructions. Major networks including SWIFT, TARGET2, and Fedwire are migrating to ISO 20022. Any payment infrastructure that wants to integrate with the global banking system needs to speak this language.

**What WarpCore does:** WarpCore sits between a bank's existing ISO 20022 messaging infrastructure and the Kaspa network. It accepts ISO 20022 messages (payment instructions in the format banks already use), processes them through Kaspa's settlement layer, and returns ISO 20022-formatted confirmations. From the bank's perspective, the interface is familiar; the settlement underneath is Kaspa.

The project's positioning is direct: "ISO 20022 In. Kaspa Finality Out."

**Current status:** Phase 1 is live in a sandbox environment. This means the core message translation and settlement flow has been demonstrated end-to-end in a controlled test environment, but it has not yet processed live production payments.

**Regulatory engagement:** WarpCore and KII applied to the European Central Bank's Pontes Market Contact Group. Pontes (formally the Pontes Market Contact Group for Market Infrastructures) advises the ECB on European financial market infrastructure development. Participation in this group represents engagement with the regulatory infrastructure that governs settlement systems across the Eurozone.

**Technical approach:** WarpCore is designed as middleware -- it does not require banks to replace their existing systems. The integration path is additive: banks adopt WarpCore alongside existing infrastructure, use it for specific corridors or transaction types initially, and expand as confidence grows.

---

## KasUnion

KasUnion applies vProgs capabilities to credit unions and cooperative financial institutions -- organizations that serve populations often underserved by commercial banks.

**The target market:** Credit unions collectively serve hundreds of millions of members globally, particularly in regions where commercial bank access is limited. They face a technology gap: they lack the resources to build or license sophisticated financial infrastructure, but their members increasingly need cross-border payment capability, digital access, and modern loan products.

**What KasUnion provides:**

- Digital banking interfaces with mobile wallet integration for members who may not have traditional bank accounts
- Cross-border payment rails that allow remittances and payments without correspondent banking fees
- Micro-loan origination with automated approval processes, using on-chain data and ZK-verified income attestations to assess creditworthiness without requiring the document-heavy process that banks use
- Tokenized asset management, enabling credit unions to offer members exposure to a broader range of financial instruments within a compliant framework
- Payroll processing via mobile wallets, allowing employers to pay workers directly without requiring them to have traditional bank accounts

**Who this serves:** The "unbanked" and "underbanked" populations -- estimated at 1.4 billion adults globally -- are not unbanked because they lack economic activity. They lack access to the infrastructure. A mobile-native credit union powered by vProgs settlement can reach these populations with costs that commercial bank infrastructure cannot match.

---

## EigenFlow

EigenFlow is a DAG-native market-making framework published on Zenodo, the academic research repository operated by CERN.

**The problem it addresses:** Traditional market-making models were designed for sequential order books -- queues of buy and sell orders that clear one at a time. Kaspa's BlockDAG processes blocks in parallel. Naive application of standard models to a parallel block structure would create pricing inconsistencies and inefficient liquidity provision.

**The technical approach:** EigenFlow extends the Avellaneda-Stoikov market-making model -- a standard quantitative finance framework for optimal bid-ask spread setting -- to parallel block environments. The extension introduces two key components:

- **Spectral Consensus Kernel:** A mathematical framework that accounts for the parallel structure of block confirmation in a DAG when computing optimal prices and spreads
- **EigenFlow weights:** A weighting scheme that adjusts market-maker positioning based on the parallel confirmation topology, reducing inventory risk in the DAG environment

**Claimed efficiency gain:** The published work claims a 35--75% efficiency improvement over naive application of traditional models to DAG environments. This is a research claim based on the published analysis; independent verification would be needed before treating it as a production performance guarantee.

**Why this matters for applications:** Every tokenized asset market on Kaspa -- whether energy credits on ZET-EX, RWA tokens, or native DeFi assets -- requires liquidity. Efficient market-making directly determines the spread (and therefore the transaction cost) that participants pay. A market-making framework purpose-built for Kaspa's architecture is a foundational piece of infrastructure for any asset market on the platform.

EigenFlow is also the market-making infrastructure for ZET-EX, the energy asset exchange described in the [Energy section](/applications/energy).

---

## K-MIF

K-MIF (Kaspa Mobility Insurance Framework) applies vProgs to usage-based motor insurance -- a sector that has long promised more personalized pricing but remained constrained by settlement and data infrastructure.

**The current model's limitations:** Traditional car insurance prices risk annually based on static factors -- age, vehicle type, claims history. Usage-based insurance programs exist (telematics-based policies that track driving behavior) but typically operate through centralized data processors, with claims still handled through manual adjustment processes.

**The vProgs approach:**

- **Micro-duration policies:** Rather than annual or monthly coverage, K-MIF enables per-trip or per-hour insurance. A driver activates coverage when they start a journey and deactivates when they arrive. This is impractical with traditional settlement infrastructure (the transaction costs would exceed the premium) but viable at Kaspa's fee levels.
- **Automated claims processing:** Claim triggers -- accident detection via telematics, vehicle immobilization, GPS-verified events -- feed into the vProg directly. When trigger conditions are met and verified, the claim payment executes without manual adjuster involvement.
- **AI risk assessment:** Dynamic pricing based on real-time driving behavior data, processed off-chain with ZK proofs submitted to the vProg to update pricing parameters without exposing raw telemetry data.

**ZK data privacy:** A critical requirement for insurance data: the raw telematics data (precise GPS tracks, acceleration profiles, trip histories) is commercially sensitive and personally identifiable. ZK proofs allow the insurer to verify that claim conditions are met and to price risk accurately without a centralized party holding a complete record of the insured's movements.

---

## ZK Compliance Architecture

For banks and financial institutions, the compliance architecture is as important as the settlement functionality. vProgs support a complete ZK compliance stack:

### KYC/AML Proofs

A financial institution that has performed KYC (Know Your Customer) and AML (Anti-Money Laundering) screening can generate a ZK attestation that a given account or transaction passed those checks. Counterparties and regulators can verify the attestation without receiving the underlying customer data. The proof certifies:

- That a specific verification process was followed
- That the subject met the criteria (or did not)
- That the attestation was generated by an authorized institution

without revealing the customer's name, address, document details, or transaction history.

### Solvency Proofs

A financial institution can prove solvency -- that assets exceed liabilities by a defined margin -- without publishing a full balance sheet. This is directly applicable to reserve attestations for asset-backed stablecoins, collateral verification in lending, and regulatory capital reporting.

### Selective Disclosure Standards

vProgs support selective disclosure: the ability to reveal specific attributes from a credential while keeping others private. Combined with the ECB Pontes engagement and ISO 20022 compatibility, this positions WarpCore and the broader KII finance stack to operate within European regulatory frameworks that require auditability while respecting data protection obligations (GDPR compatibility is an explicit design consideration).

### Automated Settlement Triggers

vProgs can encode multi-condition settlement: payment releases when signature from Party A is received AND delivery confirmation from Party B is provided AND compliance check from Party C passes. This replaces the role of an escrow agent or letter of credit issuer with code that enforces the same logic without requiring a trusted third party.

---

## Current Status Summary

| Initiative | Status |
|------------|--------|
| WarpCore (ISO 20022 middleware) | Phase 1 sandbox live; ECB Pontes application submitted |
| EigenFlow (market-making framework) | Whitepaper published on Zenodo |
| KasUnion (credit union DeFi) | Described initiative; development underway |
| K-MIF (mobility insurance) | Described initiative; development underway |
| Kaspa Covenants++ (prerequisite) | Scheduled May 5, 2026 |
| vProgs Phase 1 (prerequisite) | Active development |

---

## Further Reading

- [DeFi Applications](/applications/defi) -- DEX, lending, and stablecoin infrastructure
- [Energy Applications](/applications/energy) -- ZET-EX and EigenFlow in energy markets
- [KII Foundation](/ecosystem/kii) -- foundation overview and leadership
- [Ecosystem Applications](/ecosystem/applications) -- technical architecture
- [Development Roadmap](/ecosystem/roadmap) -- infrastructure timeline
