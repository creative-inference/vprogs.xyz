---
layout: page
title: "Decentralized Finance (DeFi)"
section: applications
description: "DeFi on vProgs and Kaspa L1. Native DEX, lending, stablecoins, ZK auctions, and synchronous composability without bridges or fragmented liquidity."
---

Decentralized finance as deployed on most platforms today operates across a fragmented landscape of competing Layer 2 networks, each with their own liquidity pools, bridging requirements, and trust assumptions. Moving assets between protocols on different chains requires bridges -- infrastructure that has been the source of the largest losses in DeFi history. Executing a multi-step strategy (borrow, swap, stake) requires multiple transactions across multiple systems, with bridge risk and settlement delay at each transition.

vProgs on Kaspa take a different approach. All applications run on a single L1. Every vProg shares the same state. In Phase 2, they interact synchronously within a single transaction -- making the "flash loan + swap + stake + repay in one atomic step" architecture that is theoretically possible on Ethereum practically achievable without the overhead of a complex L2 ecosystem.

This page covers what is being built and demonstrated today, what becomes available in Phase 1, and what Phase 2 composability enables.

---

## Why L1-Native DeFi Is Different

### No Bridges, No Bridge Risk

Bridges are one of the highest-risk components of DeFi. Between 2021 and 2023, bridge exploits accounted for over $2 billion in losses. A bridge requires a trusted or semi-trusted party (a multisig, a committee of validators, or a smart contract with custodial logic) to hold assets on one chain while issuing representations on another. Every bridge is an attack surface.

vProgs eliminate this by design. There is no "move assets to L2" step. The vProg lives on Kaspa L1. Native assets issued on Kaspa L1 are the same assets inside a vProg. There is no wrapping, no bridging, no custodian in the middle.

### Unified Liquidity

On Ethereum, liquidity is split across mainnet, Arbitrum, Optimism, Base, zkSync, and dozens of other L2s. A DEX on Arbitrum does not have access to liquidity sitting in a pool on Base. This fragmentation raises spreads, reduces capital efficiency, and creates arbitrage opportunities that extract value from ordinary users.

All vProgs on Kaspa share the same L1 state. A liquidity pool is accessible to every vProg that needs it. The entire DeFi ecosystem on Kaspa operates as one unified market, not a collection of siloed islands.

### Synchronous Composability (Phase 2)

In Phase 2, vProgs can call each other atomically within a single L1 transaction. Either every step of a complex operation succeeds, or the entire transaction reverts cleanly. There is no partial execution, no stuck funds, no need to monitor multiple transactions across multiple chains to ensure a strategy completed correctly.

This synchronous composability is not available in Phase 1. Phase 1 vProgs are sovereign and independent. But the architecture is explicitly designed to enable composability in Phase 2 -- it is a planned capability, not an afterthought.

---

## What Is Live and Demonstrated Today

### ZK Covenant Rollup PoC (February 2026)

The foundational pattern for all based rollup applications on Kaspa was proven on TN12 (the active testnet) by Maxim Biryukov in February 2026. This proof-of-concept ran a complete deposit-transfer-withdraw cycle:

- User deposits funds via a delegate script on L1
- Funds are represented in L2 state (Sparse Merkle Tree)
- L2 transfers between accounts are processed off-chain
- Withdrawals are executed via a permission tree, with ZK proof submitted to L1 for verification
- Both STARK (succinct) and Groth16 proof formats were demonstrated
- Sequence commitment chaining tied L1 block data into each proof
- Full on-chain script verification ran through kaspa-txscript

Michael Sutton (Kaspa Core) described this as "a highly mature canonical bridge implementation." This is Milestone 3 completion in the vProgs development sequence.

The PoC is documented: the [ZK Rollup PoC Book](https://biryukovmaxim.github.io/rusty-kaspa/ch01-introduction.html) and [source branch](https://github.com/biryukovmaxim/rusty-kaspa/tree/zk-rollup-covenant-example) are publicly available.

### Native Assets (Shipping with Covenants++ on May 5, 2026)

First-class token support activates with Covenants++. A ZK proof-of-concept using SP1 was demonstrated by Ori Newman on January 6, 2026. Native assets are explicitly positioned as a stepping stone -- vProgs will be the canonical token layer -- but they establish L1 liquidity that DeFi protocols can build on from day one.

The importance of native assets for DeFi: they establish L1 as the primary liquidity hub before vProgs Phase 1 ships. By the time standalone vProgs are available, there will already be a base layer of tokenized assets to trade.

### Inline ZK Covenants (Active Development)

Small, self-contained contracts using Noir for per-transaction proving are being developed in parallel:

- Approximately 1 second proving time on mobile
- Approximately 6 seconds on mobile web
- Suitable for payment channels, threshold spending, simple escrows, and wallet-level logic
- No prover market required -- users prove their own transactions client-side

Inline covenants are the "lightweight tier" of the vProgs ZK stack -- fast enough for interactive use without dedicated proving infrastructure.

### Early DEX and Finance Prototypes

Projects including Zealous Swap and Kaspa Finance have begun building on the Kaspa ecosystem. These are early-stage prototypes; they are not in production. They represent real ecosystem development activity, not just plans.

---

## Phase 1: Standalone DeFi Applications

Phase 1 vProgs are sovereign programs: they bridge to L1 via ZK proofs and maintain their own internal state, but they do not interact with other vProgs. Applications in this phase operate independently.

### Decentralized Exchanges (Phase 1)

A Phase 1 DEX is an order-book or AMM (Automated Market Maker) that operates entirely within a single vProg:

- Orders and liquidity are managed within the vProg's state
- Trades are executed off-chain and ZK-proven to L1
- No bridge is needed -- the vProg is already on L1
- Settlement is final upon L1 proof verification
- The vProg accepts native Kaspa assets and any tokens issued on Kaspa L1

Without composability, a Phase 1 DEX cannot atomically interact with a lending protocol in the same transaction. Swaps are self-contained within the DEX vProg. But this is already a significant advance: a DEX with no bridge risk, no fragmented liquidity across chains, and ZK-proven trade execution.

### Lending and Borrowing (Phase 1)

A Phase 1 lending protocol manages collateral, loan issuance, interest accrual, and liquidation within a single vProg:

- Borrowers deposit collateral (Kaspa native assets or tokens)
- The vProg issues loan amounts up to a collateralization ratio
- Interest accrues continuously, computed off-chain and ZK-verified at each settlement step
- Liquidation triggers automatically when collateral falls below the maintenance margin -- no manual intervention, no margin call delays
- ZK solvency proofs allow the protocol to demonstrate reserve adequacy to users without publishing all position data

**Oracle pricing in Phase 1:** RTD (Real-Time Data) covenants on Kaspa allow miners to include payload data that covenants can inspect. This provides a native oracle mechanism for price data at L1 without requiring an external oracle system. Price feeds for collateral valuation can be provided through RTD without the off-chain oracle dependency that has caused liquidation failures on other platforms.

### Private Transfers and Payment Channels (Phase 1)

Confidential transactions within a vProg: the amount and counterparties of a payment can be hidden from L1 observers while still being verifiable to intended parties. This is directly applicable to corporate treasury operations, payroll, and any payment context where financial data is commercially sensitive.

Payment channels built on inline ZK covenants allow high-frequency microtransaction streams to settle periodically to L1, with each off-chain update cryptographically bound to the prior state.

---

## Phase 2: Composable DeFi

Phase 2 introduces synchronous composability. This is the architecture that makes complex multi-protocol strategies possible in a single atomic operation.

### Flash Loan Architecture

Flash loans borrow and repay within a single transaction -- the canonical composability primitive. On Ethereum, flash loans rely on the EVM's within-transaction execution model. On vProgs, synchronous composability enables the equivalent:

```
1. Borrow from Lending vProg (no collateral required -- must repay in same transaction)
2. Execute swap on DEX vProg
3. Deposit proceeds in Yield vProg
4. Repay Lending vProg with yield profit
--> All atomic. If any step fails, the entire transaction reverts.
```

This is not available in Phase 1. It requires the cross-vProg call mechanism that Phase 2 introduces.

### Cross-Border Payment with Inline Compliance

```
1. Identity vProg verifies sender meets KYC threshold (ZK proof -- no data exposed)
2. Compliance vProg confirms transaction does not trigger reporting requirements
3. DEX vProg executes currency conversion at market rate
4. Settlement vProg finalizes payment to recipient
--> Instant. Auditable by regulators via ZK proofs. No intermediary institutions.
```

This is the architecture WarpCore is designed to feed into once Phase 2 ships.

### Liquidation Efficiency

In a composable DeFi environment, liquidation can be performed by any participant in a single atomic transaction:

```
1. Detect undercollateralized position in Lending vProg
2. Borrow liquidation capital from separate Lending vProg (or own funds)
3. Liquidate collateral at DEX vProg
4. Repay Lending vProg and keep liquidation bonus
--> No capital at risk between steps. No front-running window.
```

This makes liquidation more efficient and reduces the risk of bad debt in lending protocols.

---

## Stablecoins

Stablecoins are the liquidity substrate of DeFi. Without a stable unit of account, all on-chain commerce is subject to the price volatility of the underlying asset.

### Asset-Backed Stablecoins

Tokens backed 1:1 by fiat or other stable assets held in reserve. The vProgs implementation adds ZK solvency proofs: the issuer can prove that reserves cover all outstanding tokens without publishing the exact composition or location of the reserve portfolio. This addresses the transparency-versus-privacy dilemma that has made centralized stablecoin auditing contentious.

### Algorithmic and Over-Collateralized Stablecoins

CDP (Collateralized Debt Position) models -- similar to DAI on Ethereum -- issue stablecoins against over-collateralized crypto asset deposits. vProgs provide:

- Atomic liquidation when collateral ratios breach thresholds
- RTD-based price feeds for collateral valuation without external oracles
- Composability with lending and yield protocols (Phase 2) for capital efficiency

### Reserve Proofs

ZK reserve proofs are directly relevant to regulatory requirements emerging in multiple jurisdictions that require stablecoin issuers to demonstrate reserve adequacy on a continuous or near-continuous basis. Generating a ZK proof of solvency on a schedule satisfies this requirement without requiring public disclosure of the reserve portfolio.

---

## Sealed-Bid ZK Auctions

ZK proofs enable sealed-bid auctions where bids are committed to cryptographically, the auction closes, and a ZK proof reveals only the winning bid and winner without exposing losing bids:

- No information leakage about losing bidder valuations
- Mathematically binding commitment -- bids cannot be changed after submission
- Automatic settlement of the auction outcome to L1

Applications: NFT sales, government asset auctions, spectrum licensing, energy capacity auctions (see [Energy](/applications/energy)), and any context where bid privacy prevents strategic gaming of the auction process.

---

## Prover Market Economics

Larger vProg applications (based applications using RISC Zero or SP1) have proof times of 10--30 seconds and require computational resources beyond what an individual user runs. The prover market is the economic infrastructure that solves this:

- Applications that need proofs broadcast proving requests
- Specialized provers compete to fulfill requests
- The fastest or cheapest prover wins the job and earns the fee
- Proof is submitted to L1; application proceeds

This is a market for a specialized computational service. It follows the same economic logic as transaction fee markets: supply (prover capacity) and demand (proving requests) determine prices. In steady state, prover competition drives proving costs toward the marginal cost of the compute required.

Phase 1 vProgs can operate with centralized provers or small trusted prover sets. The full decentralized prover market infrastructure is part of Phase 2.

---

## vProgs DeFi vs Ethereum L2 DeFi

| Property | vProgs (Kaspa) | Ethereum L2 Ecosystem |
|----------|----------------|----------------------|
| Liquidity | Unified on L1 | Fragmented across 10+ L2s |
| Bridge requirement | None | Required for cross-L2 operations |
| Bridge risk | Not applicable | Historical losses >$2B |
| Composability | Synchronous (Phase 2) | Cross-L2 requires async messaging |
| Settlement finality | Near-instant (DagKnight) | Minutes to hours depending on L2 |
| MEV | Reduced via DAG ordering | Significant on most L2s |
| ZK security | All applications ZK-proven | Varies by L2 type |
| Throughput | 30,000+ TPS target | Varies by L2 |

The Ethereum L2 ecosystem has scale and existing deployment. vProgs has architectural advantages that are particularly significant for applications that require cross-protocol interaction or strict finality guarantees.

---

## Current Status and Timeline

| Capability | Status |
|------------|--------|
| ZK covenant rollup PoC (TN12) | Demonstrated February 2026 |
| Native asset ZK PoC | Demonstrated January 2026 |
| Inline ZK covenants (Noir) | Active development |
| Native assets on L1 | Shipping May 5, 2026 (Covenants++) |
| Standalone vProgs Phase 1 | Active development; no confirmed ship date |
| Synchronous composability Phase 2 | Research and design phase |
| Full prover market | Phase 2 |
| Zealous Swap / Kaspa Finance prototypes | Early stage; not in production |

---

## Further Reading

- [Banking & Finance Applications](/applications/banking) -- WarpCore, KasUnion, EigenFlow
- [Ecosystem Applications](/ecosystem/applications) -- technical architecture details
- [Architecture](/architecture/) -- how vProgs and ZK proofs work
- [Development Roadmap](/ecosystem/roadmap) -- phase timeline
