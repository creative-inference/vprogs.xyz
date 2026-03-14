---
layout: page
title: "Applications & Use Cases"
section: ecosystem
description: "Applications and use cases for vProgs on Kaspa. DEXs, lending, rollups, stablecoins, and more with native L1 deployment and ZK-based security."
---

vProgs transform Kaspa from a payment rail into a comprehensive programmable platform. All applications benefit from native L1 deployment (no L2 fragmentation), ZK-based security (cryptographic proof, not economic guarantees), and unified liquidity (all apps share L1 state). Synchronous composability -- the ability for vProgs to interact atomically within a single transaction -- arrives in Phase 2.

This page covers what is being built now, what becomes possible in each phase, and how the ZK stack maps to application tiers.

---

## What Is Being Built Now

These are concrete applications actively under development or demonstrated, based on Kaspa Core R&D activity as of March 2026.

### ZK Covenant Rollups (Demonstrated)

The canonical bridge pattern for all based rollup applications on Kaspa. A full deposit-transfer-withdraw cycle was proven on TN12 by Maxim Biryukov in February 2026:

- Deposits via delegate script
- L2 transfers between accounts
- Withdrawals via permission tree
- Both STARK (succinct) and Groth16 proof generation with on-chain verification
- Sequence commitment chaining L1 block data into proofs
- Sparse Merkle Tree for L2 account state
- Full on-chain script verification through kaspa-txscript

This PoC represents **Milestone 3** completion. Michael Sutton described it as "a highly mature canonical bridge implementation."

**Resources:**
- [ZK Rollup PoC Book](https://biryukovmaxim.github.io/rusty-kaspa/ch01-introduction.html)
- [Source branch](https://github.com/biryukovmaxim/rusty-kaspa/tree/zk-rollup-covenant-example)

### Native Assets (Shipping with Covenants++)

First-class token support on L1, activated with the May 5 hard fork:

- ZK PoC demonstrated using SP1 by Ori Newman (January 6, 2026)
- Intended as a stepping stone -- vProgs will eventually be the canonical token layer
- Rationale (Sompolinsky): "Native assets render L1 as the primary liquidity hub, and this solidifies social and dev consensus around L1"

### Inline ZK Covenants (Noir)

Small, self-contained contracts using Noir for per-transaction proving:

- Approximately 1 second proving on mobile, approximately 6 seconds on mobile web
- Ideal for wallets, payment channels, simple escrows, threshold spending
- No prover market needed -- users prove their own transactions
- Noir PoC work by manyfestation

### Based ZK Applications (RISC Zero / SP1)

Larger applications with aggregated proving (10-30 second proof times):

- Regular-sized smart contract equivalents
- Provers aggregate multiple user actions into single proofs
- First applications expected to be sovereign standalone vProgs (Phase 1)

### RTD (Real-Time Data)

One of the three founding pillars of Covenants++ alongside covenants and ZK verification:

- Covenant type allowing inspection and aggregation of miner payloads
- Enables real-time data feeds and oracle-like functionality at L1
- No external oracle dependency for on-chain data

---

## Phase 1: Standalone vProgs

Phase 1 deploys sovereign programs that bridge to L1 via ZK proofs but operate independently. There is no cross-vProg composability yet and no L1 account model. Each vProg is an independent entity with its own state, communicating with L1 through its covenant.

Applications suited to Phase 1:

| Application | Description |
|-------------|-------------|
| Token bridges | Canonical L1/L2 bridge using ZK covenant rollup pattern |
| Sovereign DEXs | Order-book or AMM operating within a single vProg |
| Private transfers | ZK-proven confidential transactions within a vProg |
| DAOs | Self-governing organizations with treasury and voting logic |
| Data feeds | RTD-powered oracle equivalents |
| Gaming | On-chain game state with off-chain execution |

---

## Phase 2: Composability

Phase 2 introduces synchronous composability -- atomic cross-vProg interactions within a single L1 transaction. This unlocks the full power of the platform.

### Composability Examples

**Flash Loan + Swap + Stake (Single Transaction):**

```
1. Borrow from Lending vProg
2. Swap on DEX vProg
3. Stake in Yield vProg
4. Repay Lending vProg
--> All atomic, all in one L1 transaction
```

**Cross-Border Payment with Compliance:**

```
1. Verify sender identity (Identity vProg)
2. Check compliance rules (Compliance vProg)
3. Execute currency swap (DEX vProg)
4. Settle payment (Settlement vProg)
--> Instant, auditable, no intermediaries
```

---

## DeFi Primitives

### Decentralized Exchanges (DEX)

- Atomic swaps via synchronous composability (Phase 2)
- No slippage from bridge delays
- Unified liquidity pool across all vProgs
- MEV-resistant order execution via DagKnight ordering

### Lending and Borrowing

- Collateral management across vProgs
- Instant liquidation via atomic transactions
- Real-time interest rate computation (off-chain, ZK-verified)
- ZK-proven solvency

### Vaults and Yield

- Automated yield strategies composing multiple vProgs
- Single-transaction complex DeFi flows
- Risk management via deterministic execution

### Auctions

- Sealed-bid auctions with ZK privacy
- Fair ordering via DagKnight consensus
- Atomic settlement

---

## DAOs and Governance

### Programmable Multi-sig

- On-chain governance logic via vProgs
- Threshold signatures with ZK proofs
- Atomic proposal execution

### Autonomous Organizations

- Self-governing resource management
- Treasury management composable with DeFi vProgs (Phase 2)
- Transparent, auditable governance

---

## Privacy and Identity

### ZK-Based Privacy

- Private transactions using built-in ZK computation
- Selective disclosure of transaction details
- Compliance-compatible privacy (prove rule adherence without revealing data)

### Identity Verification

- Decentralized identity (DID) on L1
- ZK identity proofs (prove attributes without revealing underlying data)
- Cross-vProg identity composability (Phase 2)

### Escrow

- Trustless escrow via atomic vProg interactions
- Conditional release with ZK verification
- Multi-party escrow support

---

## Enterprise and Institutional

### Automated Compliance

- Compliance logic encoded directly in vProgs
- Real-time regulatory reporting
- ZK-based audit without exposing sensitive data

### Settlement Infrastructure

- Real-time settlement without trusted intermediaries
- Cross-border payment automation
- Institutional-grade finality via DagKnight

### Supply Chain

- Immutable record keeping on L1
- IoT data verification via ZK proofs
- Cross-organization composability (Phase 2)

### Tokenization

- Real-world asset (RWA) tokenization
- Fractional ownership with compliance logic
- Atomic trading on L1

---

## Application Tiers by ZK Stack

The ZK strategy defines three tiers, each mapping to different application categories:

| Tier | ZK Stack | Proof Time | Proof Size | Best For |
|------|----------|------------|------------|----------|
| **Inline** | Noir / Groth16 | ~1s mobile, ~6s mobile web | 10-20 KB (Noir), tiny (Groth16) | Wallets, payment channels, simple covenants |
| **Based apps** | RISC Zero / SP1 | 10-30 seconds | Variable | DeFi, DAOs, lending, complex contracts |
| **Based rollups** | Cairo | Longer | Variable | Meta-apps accepting user-defined logic |

**Why Cairo for rollups:** Cairo's Sierra bytecode format provides provable metering and safety -- essential when accepting arbitrary user-submitted logic (e.g., a DEX where users define custom trading strategies).

**Why Noir for inline:** Sub-second proving on mobile makes Noir suitable for per-transaction proofs where users prove their own transactions without needing a prover market.

**Hash function considerations:** Blake3 is approximately 10x more costly than Blake2s in Cairo (Blake2s has a precompile), but Blake3 has roughly a 40% advantage over Blake2s in SP1/RISC Zero.

---

## Open Design Questions

These active R&D discussions affect application development:

- **Covenant state past pruning:** How do applications preserve state after L1 pruning? An optional kaspad indexer with trustless historical data retrieval is under discussion.
- **KIP-21 RPC layer:** External applications need RPC access to lane roots and activity status to produce proofs -- not yet designed.
- **Native assets vs vProgs tokens:** Native assets ship as a stepping stone with Covenants++, but the long-term plan is for vProgs to be the canonical token layer.

---

## Further Reading

- [Development Roadmap](/ecosystem/roadmap) -- when each phase ships
- [KII Foundation](/ecosystem/kii) -- enterprise adoption initiatives
- [R&D Channel Insights](/changelog/rnd-insights) -- detailed technical intelligence
- [Sources & Links](/references/sources) -- primary research papers and proposals
