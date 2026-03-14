---
layout: page
title: "Myths & Misconceptions"
section: learn
---

# Myths and Misconceptions

vProgs represent a fundamentally different architecture. Different architectures get misread through the lens of familiar ones. This page addresses common misconceptions head-on.

---

## "vProgs are lightweight -- they can't handle complex smart contracts"

This is the most common misconception, and it gets the architecture exactly backwards.

**vProgs are computationally unbounded.** The program logic runs off-chain with no L1 constraints on complexity. You can execute arbitrary Rust, any RISC-V program, or full Cairo bytecode. The only thing that hits L1 is a small cryptographic proof. A vProg that runs 10 lines of logic and one that runs 10 million lines of logic look identical to the network -- both are just a proof to verify.

Now compare that to the platforms people call "heavyweight":

| Platform | Contract Size Limit | Compute Limit Per Block | Execution Location |
|----------|-------------------|------------------------|-------------------|
| Ethereum | 24 KB | ~30M gas | On-chain (every node re-executes) |
| Solana | 200 KB | 1.4M compute units | On-chain (every validator re-executes) |
| vProgs | **None** | **None** | Off-chain (L1 only verifies proof) |

Ethereum and Solana impose hard caps on what your contract can do. vProgs don't. The "lightweight" part is what L1 does -- verify a proof -- and that's the entire point. It's why Kaspa can handle 30,000+ TPS instead of 15.

**The complexity lives off-chain where it belongs, secured by mathematics instead of re-execution.**

### The three ZK tiers cover the full complexity spectrum

| Tier | Stack | Proof Time | What You Can Build |
|------|-------|------------|-------------------|
| Inline | Noir / Groth16 | ~1 second | Wallets, payment channels, escrows, threshold spending |
| Based apps | RISC Zero / SP1 | 10-30 seconds | Full DeFi protocols, DAOs, lending, complex state machines |
| Based rollups | Cairo | Longer | Entire rollups accepting arbitrary user-defined logic |

The Cairo tier is worth emphasizing: you can build a rollup *inside* a vProg that accepts and executes arbitrary user-submitted programs. That's not lightweight -- that's a platform within a platform.

---

## "It's basically an L2"

No. L2s are separate chains that settle back to an L1. They have their own block producers, their own sequencers, their own trust assumptions, and their own liquidity pools.

vProgs are native L1 programs. They:

- Use L1 consensus for ordering (not a separate sequencer)
- Share unified L1 liquidity (not bridged fragments)
- Settle with instant DagKnight finality (not 7-day challenge windows)
- Require no bridge to move assets (everything is already on L1)

The critical difference: L2 rollups fragment liquidity and composability. A token on Arbitrum can't atomically interact with a protocol on Optimism. With vProgs, every program shares the same state and liquidity pool, and they can interact atomically in a single transaction.

---

## "Off-chain execution means it's not really decentralized"

Off-chain execution does not mean centralized execution. Anyone can run a prover. The proof is what matters, not who computed it.

Think of it like mathematics: it doesn't matter who solved the equation. The answer is either correct or it isn't. A ZK proof is a mathematical guarantee that the computation was performed correctly. No trust in the prover is required -- the cryptography handles that.

This is actually *more* secure than on-chain execution in many ways:

- **On-chain (Ethereum PoS):** Security relies on economic incentives. Validators could theoretically collude if the profit exceeds their stake. Security is economic.
- **vProgs (Kaspa PoW + ZK):** Security relies on mathematical proof. A proof is either valid or invalid. There is no economic threshold at which the math breaks. Security is cryptographic.

---

## "You need to learn a new programming language"

vProgs are written in Rust. If you know Rust, you can write vProgs. The ZK proving is handled by the stack you choose (Noir, RISC Zero, SP1, or Cairo) -- you write application logic, not circuits.

Silverscript exists as a complementary language for L1 covenant logic (UTXO-level rules), but it's optional and targeted at simpler on-chain conditions. The heavy lifting happens in standard Rust.

---

## "ZK proofs are too slow for real applications"

Proof generation times depend on the tier:

- **Noir:** ~1 second on a phone. Sub-second on a laptop. This is faster than an Ethereum block confirmation.
- **RISC Zero / SP1:** 10-30 seconds for complex applications. Proofs can be batched and pipelined -- users don't wait for proof generation to use the app.
- **Cairo:** Longer, but used for rollup-scale workloads where batch proving amortizes the cost across thousands of transactions.

Proof *verification* on L1 is near-instant. The verification opcodes proposed in KIP-16 execute in milliseconds.

And proving is embarrassingly parallel -- more provers means more throughput. A prover market allows horizontal scaling without any consensus changes.

---

## "No EVM compatibility means no ecosystem"

EVM compatibility is a design choice, not a prerequisite. Consider:

- Solana has no EVM compatibility and has a $70B+ ecosystem
- Sui has no EVM compatibility and attracted significant developer adoption
- Cosmos chains have no EVM compatibility and power major DeFi protocols

vProgs offer something EVM chains cannot: unbounded off-chain computation with on-chain ZK verification, synchronous composability across all programs, unified liquidity, and instant finality. Developers go where the capabilities are, not where the bytecode is familiar.

That said, the Cairo tier can run EVM-equivalent logic inside a ZK rollup if EVM compatibility is needed for a specific use case.

---

## "Kaspa is just a payment chain -- programmability doesn't fit"

Kaspa was designed as a high-throughput settlement layer. vProgs don't change that -- they leverage it. The L1 still does what it does best: fast, secure ordering and settlement. vProgs add a verification layer on top without adding execution burden.

The BlockDAG architecture (30,000+ TPS, instant DagKnight finality, pure PoW security) is what makes vProgs viable in the first place. No other chain combines this throughput with this consensus model. vProgs aren't bolted on -- they're designed to exploit the specific properties of Kaspa's architecture.

---

## "Synchronous composability is just a buzzword"

Here's what it means concretely. Consider this transaction:

```
1. Borrow 1000 USDT from Lending vProg
2. Swap USDT for KAS on DEX vProg
3. Stake KAS in Yield vProg
4. Use yield position as collateral in Lending vProg
```

On Ethereum L2s, this requires four separate transactions across potentially four separate chains, with bridges in between. Any step can fail independently, leaving you in a partial state with funds stranded on the wrong chain.

With vProgs, this is **one atomic L1 transaction**. Either all four steps succeed or none of them do. No bridges. No partial failures. No stranded funds. One block, done.

This isn't a buzzword -- it's the difference between a fragmented ecosystem of isolated apps and an integrated financial system where everything can interact safely.

---

## "The technology isn't proven -- it's all theoretical"

Key milestones already demonstrated:

| Milestone | Status | What Was Proved |
|-----------|--------|----------------|
| ZK covenant rollup PoC | **Complete** (Feb 2026) | Full deposit-transfer-withdraw cycle with on-chain verification |
| STARK + Groth16 proofs on TN12 | **Complete** | Both proof systems verified by L1 nodes |
| Native asset ZK PoC (SP1) | **Complete** (Jan 2026) | Token issuance with ZK verification |
| Noir inline covenant PoC | **Complete** | Sub-second proving on mobile |
| Testnet 12 | **Live** | Covenant IDs, Blake3, ZK precompiles running |
| Covenants++ hard fork | **Scheduled May 5, 2026** | Consensus-level foundation for vProgs |

The theoretical foundations (computation DAG, Erdos-Renyi scalability analysis, formal model) have been published and peer-reviewed on the Kaspa Research Forum. The code is open source.

---

## "It will never be as fast as Solana"

Kaspa already processes more transactions per second than Solana at the base layer. DagKnight consensus achieves 30,000+ TPS with instant finality -- compared to Solana's theoretical 65,000 TPS, which in practice operates closer to 3,000-4,000 TPS due to congestion and failed transactions.

But the comparison misses the point. vProgs move computation *off* the base layer entirely. L1 throughput is used for proof verification and state commitment, not execution. This means:

- L1 throughput scales with the number of *proofs*, not the number of *computations*
- A single proof can represent thousands of off-chain transactions
- More provers can be added without any L1 changes
- The bottleneck is proving hardware, which scales horizontally and improves with Moore's Law

The architecture is designed so that L1 speed is never the bottleneck for application complexity.

---

## The Bottom Line

vProgs aren't a limited scripting layer bolted onto a payment chain. They're an unbounded computation platform that uses Kaspa's high-throughput BlockDAG as a verification and settlement backbone. The "lightweight" L1 footprint isn't a weakness -- it's the architectural decision that removes every computation limit other chains impose.

---

## Further Reading

- [What Are vProgs?](/learn/what-are-vprogs/) -- foundational explainer
- [Platform Comparison](/learn/compared/) -- detailed comparison tables
- [Architecture Overview](/architecture/overview/) -- four-pillar design
- [Real-World Use Cases](/learn/use-cases/) -- concrete applications
- [FAQ](/learn/faq/) -- quick answers to common questions
