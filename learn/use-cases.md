---
layout: page
title: "Real-World Use Cases"
section: learn
description: "Explore real-world vProgs use cases on Kaspa — from instant global payments and decentralized exchanges to lending, NFTs, and supply chains."
---

vProgs make Kaspa programmable. But what does that actually mean for real people? This page walks through concrete scenarios -- things you already understand -- and shows how vProgs change the way they work.

No jargon. No architecture diagrams. Just real problems and how they get solved.

---

## Sending Money Anywhere, Instantly

**The problem today:** Sending money overseas takes 2-5 business days. Banks charge fees at both ends. You might lose 3-7% to exchange rates and intermediary costs. On weekends? Forget it.

**With vProgs:** You send money directly to anyone in the world. It settles in seconds -- not days. There's no bank in the middle taking a cut. The exchange rate is handled automatically, transparently, and at market price. It works at 2am on a Sunday the same as noon on a Tuesday.

**What makes this different from other crypto?** Most blockchains can do simple transfers. vProgs go further -- the currency conversion, compliance checks, and settlement all happen in one atomic step. Nothing is half-done. Either the entire payment completes or nothing happens. And because everything runs on one unified network, there's no bridging money between separate chains and hoping nothing goes wrong in transit.

---

## Trading Without Trusting an Exchange

**The problem today:** When you trade on Coinbase or Binance, you hand your money to a company and trust them to give it back. FTX showed what happens when that trust is misplaced -- billions lost overnight.

**With vProgs:** You trade directly from your own wallet. Your funds never leave your control until the exact moment a trade executes. The trading logic runs off-chain for speed, but a mathematical proof verifies every trade was executed correctly. No exchange holds your assets. No one can freeze your account or run off with your deposits.

**Why not just use Uniswap?** Ethereum DEXs fragment liquidity across dozens of Layer 2 chains. Want to use a token on Arbitrum with a protocol on Optimism? You need bridges, waiting periods, and extra fees. vProgs keep all liquidity in one place. Every application shares the same pool. A lending protocol can interact with a DEX in a single transaction -- no bridges, no delays.

---

## Proving Things Without Revealing Everything

**The problem today:** To get a drink at a bar, you show your entire driver's license -- your name, address, date of birth, license number. To get a mortgage, you hand over years of bank statements, tax returns, and employment records. You reveal far more than necessary.

**With vProgs:** Zero-knowledge proofs let you prove a fact without revealing the underlying data. Prove you're over 21 without showing your birthday. Prove you earn enough for a loan without revealing your salary. Prove you passed a background check without exposing your personal history.

**How is this possible?** The math behind zero-knowledge proofs guarantees that the proof is valid without the verifier learning anything beyond the single fact being proved. vProgs make this practical -- proofs generate in under a second on a phone and verify instantly on Kaspa's network.

---

## Tracking Products From Factory to Shelf

**The problem today:** "Organic." "Fair trade." "Made in Italy." These labels require trust. Somewhere in a supply chain of dozens of companies, records are kept in spreadsheets, emails, and filing cabinets. Fraud is easy and verification is expensive.

**With vProgs:** Each step in a product's journey gets recorded with a cryptographic proof. The coffee bean farmer, the shipping company, the roaster, and the retailer each add verifiable data. Nobody can alter previous entries. A consumer scans a code and sees the entire verified history -- not because a company says so, but because the math proves it.

**What about existing blockchain supply chain solutions?** Most put data on-chain but can't enforce rules across organizations. With vProgs, the compliance logic itself is programmed in -- a shipment that skips a required inspection step literally cannot proceed to the next stage. The rules are enforced by code, not by auditors checking after the fact.

---

## Owning Your Game Items For Real

**The problem today:** You spend $500 on skins and items in a game. The company shuts down the servers, bans your account, or just changes the rules. Your items are gone. You never really owned them -- you rented access.

**With vProgs:** Game items exist as verifiable assets on Kaspa's network. The game runs its logic off-chain for performance (nobody wants blockchain lag in a video game), but ownership and trading are settled on L1. You can sell items in a marketplace, trade with friends, or even use them in a different game that recognizes the same assets -- all without the original game company's permission.

**Why is this better than existing NFT gaming?** Speed and cost. Kaspa processes over 30,000 transactions per second with near-instant finality. Trading an item doesn't cost $20 in gas fees or take minutes to confirm. And because vProgs support complex logic, games can have sophisticated economies -- auctions, lending items, fractional ownership of rare assets -- without building on a slow, expensive chain.

---

## Insurance That Pays Itself

**The problem today:** Your flight gets cancelled. You file a claim. You upload boarding passes, confirmation emails, and receipts. You wait 2-6 weeks. Maybe you get paid. Maybe they find a reason to deny it.

**With vProgs:** The insurance contract checks the flight status automatically. Cancelled? The payout transfers to your wallet immediately. No claim form. No adjuster. No waiting. The rules were agreed upon when you bought the policy, and the code executes them exactly as written.

**This applies to more than flights:**
- **Crop insurance** -- satellite data confirms drought conditions, farmers get paid automatically
- **Shipping insurance** -- GPS data confirms a package was lost, refund issues instantly
- **Health insurance** -- pre-approved procedures trigger payment upon verified completion

The key insight: when the conditions for a payout can be verified with data, there's no reason a human needs to be in the loop.

---

## Community-Run Organizations

**The problem today:** Starting a community fund, a co-op, or a club with shared finances requires trust. Someone holds the bank account. Decisions happen in meetings with no binding enforcement. Embezzlement, mismanagement, and power struggles are common.

**With vProgs:** A group creates a programmable treasury. Rules are set in code: spending requires a majority vote, monthly budgets are enforced automatically, and every transaction is publicly auditable. No single person controls the funds. Proposals go through a transparent voting process, and approved actions execute automatically.

**Real examples:**
- A neighborhood pool club where dues are collected and maintenance contracts are paid automatically based on member votes
- An open-source project where contributors vote on how donation funds are allocated
- A community solar project where revenue is distributed proportionally to investors, with accounting handled entirely by code

---

## Getting a Loan Without a Bank

**The problem today:** Banks decide who gets credit. They use opaque scoring models. They charge whatever rates the market will bear. They can take days or weeks to approve a simple loan. And if you're in a developing country without a banking relationship, you're often out of luck entirely.

**With vProgs:** You put up collateral (crypto assets or tokenized real-world assets), and the lending protocol issues a loan instantly. Interest rates are set by supply and demand, visible to everyone. If your collateral drops in value, the system liquidates just enough to stay solvent -- no margin call phone tag. Everything is transparent, auditable, and runs 24/7.

**The composability advantage:** With vProgs, you can borrow funds, swap them into a different asset, and stake them for yield -- all in a single atomic transaction. If any step fails, the whole thing unwinds cleanly. On fragmented L2 systems, this same operation requires multiple transactions across multiple chains, with bridge risk at every hop.

---

## Voting That Can't Be Rigged

**The problem today:** Elections require massive infrastructure and still face questions about integrity. Corporate shareholder votes are opaque. Community polls are easily gamed with fake accounts.

**With vProgs:** Each voter gets a cryptographic credential. They cast their vote with a zero-knowledge proof that confirms they're eligible and haven't voted before -- without revealing who they are or how they voted. The tally is publicly verifiable. Nobody can stuff the ballot box, and nobody can see how any individual voted.

**Why ZK matters here:** Privacy and verifiability are usually at odds. You can have a transparent count or a secret ballot, but not both. Zero-knowledge proofs break this tradeoff -- the math guarantees the count is correct while keeping individual votes private.

---

## What Makes vProgs Different

All of these use cases exist as ideas on other platforms. What makes vProgs a fundamentally different approach:

| Property | What It Means in Practice |
|----------|--------------------------|
| **One network, one liquidity pool** | Everything shares the same assets and state. No bridges, no fragmented ecosystems, no "which chain is this on?" confusion. |
| **Mathematical proof, not trust** | Security comes from cryptography, not from trusting validators who staked tokens. A proof is either valid or it isn't -- there's no economic attack that can override math. |
| **Instant finality** | Transactions are final in seconds. No waiting for confirmations. No 7-day challenge windows. Done is done. |
| **Off-chain speed, on-chain security** | Complex logic runs at full speed off-chain. Only the proof goes on-chain. You get the performance of centralized systems with the security of decentralized ones. |
| **Atomic composability** | Multiple applications can interact in a single transaction. Either everything succeeds or everything reverts. No half-completed operations, no stuck funds. |

---

## Where Things Stand

vProgs are being actively built. Here's what's real today and what's coming:

| | Status |
|---|---|
| **Kaspa network (30k+ TPS)** | Live on mainnet |
| **Basic programmability (Covenants++)** | Scheduled for May 5, 2026 |
| **Standalone vProgs (Phase 1)** | In active development |
| **Cross-program composability (Phase 2)** | In research and design |

Phase 1 enables all the standalone use cases: payments, trading, lending, insurance, gaming, and voting -- each as independent programs. Phase 2 adds the ability for these programs to interact atomically, unlocking the composability examples described above.

---

## Learn More

- [What Are vProgs?](/learn/what-are-vprogs/) -- technical introduction for the curious
- [How It Works](/learn/how-it-works/) -- step-by-step execution flow
- [Platform Comparison](/learn/compared/) -- vProgs vs Ethereum, Solana, Sui
- [Development Roadmap](/ecosystem/roadmap/) -- timeline and milestones
- [FAQ](/learn/faq/) -- common questions answered
