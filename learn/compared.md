---
layout: page
title: "vProgs Compared"
section: learn
---

How do Kaspa's Verifiable Programs stack up against other approaches to blockchain programmability? This page provides structured comparisons against the major platforms and architectures in the space.

---

## Overview Comparison

| Feature | Kaspa vProgs | Ethereum L2 Rollups | Solana | Sui | Traditional L1 (EVM) |
|---------|-------------|-------------------|--------|-----|---------------------|
| **Execution location** | Off-chain (ZK provers) | Off-chain (rollup operators) | On-chain (validators) | On-chain (validators) | On-chain (all nodes) |
| **Verification** | ZK proofs on L1 | Fraud proofs or validity proofs on L1 | Consensus re-execution | Consensus re-execution | Full re-execution |
| **Composability** | Synchronous (L1 atomic) | Asynchronous (cross-rollup bridges) | Synchronous (single chain) | Synchronous (single chain) | Synchronous (single chain) |
| **Liquidity** | Unified (single L1) | Fragmented (per rollup) | Unified (single chain) | Unified (single chain) | Unified (single chain) |
| **Consensus** | Pure PoW (BlockDAG) | Inherits L1 + sequencer | PoS (Tower BFT) | PoS (Narwhal/Bullshark) | PoS (Casper/other) |
| **Finality** | Near-instant (DagKnight) | Minutes to hours (challenge period) | ~400ms | ~2-3s | ~12min (Ethereum) |
| **Target TPS** | 30,000+ | 1,000-4,000 per rollup | ~4,000 (theoretical 65k) | ~10,000+ | ~15-30 (Ethereum L1) |
| **MEV resistance** | Structural (DAG + deterministic) | Weak (centralized sequencers) | Weak (leader-based) | Moderate (object-centric) | Weak (proposer-based) |
| **Node requirements** | Lightweight (verify proofs only) | Minimal (post to L1) | Heavy (full re-execution) | Heavy (full re-execution) | Heavy (full re-execution) |
| **Security model** | PoW + ZK (cryptographic) | Economic (bonds/fraud) or cryptographic (ZK) | Economic (staking) | Economic (staking) | Economic (staking) |

---

## vProgs vs. Ethereum L2 Rollups

Ethereum's rollup-centric roadmap moves execution to separate L2 chains that settle back to Ethereum L1. vProgs take a fundamentally different approach.

### Architecture

| Aspect | Ethereum L2 Rollups | Kaspa vProgs |
|--------|-------------------|-------------|
| **Number of execution environments** | Many (Arbitrum, Optimism, Base, zkSync, Scroll, etc.) | One unified L1 layer |
| **State location** | Split across rollups | Single L1 settlement state |
| **Cross-environment interaction** | Bridges (async, risky) | Concise witnesses (sync, atomic) |
| **Sequencing** | Centralized sequencer per rollup | Decentralized PoW (BlockDAG) |
| **Data availability** | Posted to L1 calldata/blobs | Native L1 (BlockDAG) |

### The Fragmentation Problem

The practical consequence of the rollup model:

- A user on Arbitrum cannot atomically interact with a contract on Base
- Moving assets requires a bridge -- a trust assumption and delay
- Liquidity is diluted across 20+ rollups
- Developers must choose a rollup, fragmenting their user base
- "Superchains" and shared sequencers are partial mitigations, not solutions

vProgs avoid this entirely. All programs share one L1, and synchronous composability means any program can interact with any other program in a single atomic transaction.

### Security Comparison

| Property | Optimistic Rollups | ZK Rollups | vProgs |
|----------|-------------------|-----------|--------|
| **Correctness** | Fraud proofs (7-day challenge) | ZK validity proofs | ZK validity proofs |
| **Withdrawal time** | 7 days (challenge period) | Minutes (proof generation) | Instant (DagKnight finality) |
| **Sequencer trust** | Must trust sequencer for ordering | Must trust sequencer for ordering | No sequencer (decentralized PoW) |
| **Data availability** | Depends on L1 DA layer | Depends on L1 DA layer | Native to L1 |

---

## vProgs vs. Solana

Solana prioritizes raw speed through an optimized single-chain architecture. Both Solana and vProgs use account-based models with pre-declared access, but their execution and security models diverge significantly.

### Architecture

| Aspect | Solana | Kaspa vProgs |
|--------|--------|-------------|
| **Execution** | On-chain (SVM, all validators execute) | Off-chain (ZK provers) |
| **Account model** | Pre-declared read/write sets | Pre-declared read/write sets (inspired by Solana) |
| **Consensus** | PoS (Tower BFT + PoH) | PoW (BlockDAG + DagKnight) |
| **State management** | Global state, all validators store everything | Sovereign per-vProg state, L1 stores commitments |
| **Scalability approach** | Hardware optimization, Firedancer client | Prover market (horizontal, off-chain) |

### Tradeoffs

**Where Solana leads:**
- Mature ecosystem with established DeFi protocols
- Sub-second finality today (production)
- Battle-tested runtime environment

**Where vProgs lead:**
- **Scalability model**: vProgs scale by adding provers (no added L1 burden); Solana scales by requiring better hardware (centralizing pressure)
- **Security**: Pure PoW vs. PoS -- no slashing risk, no validator cartel formation, no nothing-at-stake
- **Sovereignty**: each vProg controls its own resources; on Solana, a popular program can congest the entire network (historically demonstrated with NFT mints)
- **Node accessibility**: vProgs L1 nodes only verify proofs; Solana validators need high-end hardware (~$3,000+/month)
- **MEV resistance**: BlockDAG's parallel structure is structurally more resistant than Solana's leader-based rotation

---

## vProgs vs. Sui

Sui uses an object-centric model with parallel execution, similar in spirit to vProgs' parallel processing but with a different execution model.

### Architecture

| Aspect | Sui | Kaspa vProgs |
|--------|-----|-------------|
| **Execution** | On-chain (Move VM, all validators) | Off-chain (ZK provers) |
| **Data model** | Object-centric (owned vs. shared objects) | Account-based with pre-declared access |
| **Consensus** | PoS (Narwhal/Bullshark) | PoW (BlockDAG + DagKnight) |
| **Parallel execution** | Object-level (owned objects skip consensus) | Transaction-level (non-conflicting txns in parallel) |
| **Smart contract language** | Move | Language-agnostic (proven via ZK) |

### Tradeoffs

**Where Sui leads:**
- Object ownership model enables fast simple transfers (single-writer)
- Move language provides strong safety guarantees at the language level
- Production ecosystem with growing adoption

**Where vProgs lead:**
- **No on-chain execution burden**: Sui validators re-execute all transactions; vProgs nodes only verify proofs
- **Security model**: PoW vs. PoS
- **Language flexibility**: vProgs are language-agnostic at the execution layer (anything that can generate a ZK proof works); Sui requires Move
- **State sovereignty**: each vProg manages its own resources independently

---

## vProgs vs. Traditional L1 Smart Contracts (EVM-style)

This is the most direct comparison. Traditional L1 platforms (Ethereum, BNB Chain, Avalanche C-Chain) run a virtual machine on every node.

### The Core Difference

| Property | EVM L1 | vProgs |
|----------|--------|--------|
| **Execution** | On-chain (every node re-executes) | Off-chain (prover executes, L1 verifies) |
| **L1 load** | High (proportional to computation) | Minimal (proportional to proof count) |
| **Scalability** | Limited by gas block limit | Limited by prover market capacity |
| **State growth** | Unbounded global state | Per-vProg state with STORM regulation |
| **Node requirements** | Increasing over time | Constant (proof verification) |
| **Composability** | Synchronous | Synchronous |
| **Security** | Consensus re-execution | ZK proof (cryptographic) |

### What vProgs Preserve

vProgs maintain the properties that make EVM L1s valuable:

- **Synchronous composability**: any program can call any other program atomically
- **Unified liquidity**: all programs share one settlement layer
- **Permissionless deployment**: anyone can deploy a vProg

### What vProgs Improve

- **Scalability**: computation is offloaded, so L1 throughput is not a bottleneck
- **Decentralization**: lightweight nodes keep the barrier to participation low
- **Resource isolation**: no "noisy neighbor" problem
- **Security**: cryptographic proof instead of consensus re-execution

---

## Comparison: Key Properties

### Liquidity Model

| Platform | Liquidity Model | Impact |
|----------|----------------|--------|
| Kaspa vProgs | Unified L1 | All applications share one liquidity pool |
| Ethereum + Rollups | Fragmented across 20+ rollups | Thin markets, bridge risk, poor UX |
| Solana | Unified single chain | All applications share one liquidity pool |
| Sui | Unified single chain | All applications share one liquidity pool |

### Scalability Approach

| Platform | How It Scales | Limitation |
|----------|--------------|------------|
| Kaspa vProgs | Add more provers (horizontal) | Prover market size |
| Ethereum Rollups | Add more rollups (horizontal but fragmented) | Fragmentation, bridge risk |
| Solana | Better hardware (vertical) | Hardware costs, centralization |
| Sui | Object parallelism + better hardware | Hardware costs for validators |

### Security Guarantees

| Platform | Ordering Security | Execution Security | Trust Assumptions |
|----------|------------------|-------------------|-------------------|
| Kaspa vProgs | PoW (trustless) | ZK proofs (cryptographic) | None |
| Ethereum Rollups | PoS L1 (economic) | Fraud/validity proofs | Sequencer honesty, DA availability |
| Solana | PoS (economic) | Consensus re-execution | 2/3 honest validators |
| Sui | PoS (economic) | Consensus re-execution | 2/3 honest validators |
| EVM L1 | PoS (economic) | Consensus re-execution | 2/3 honest validators |

### Finality

| Platform | Finality Time | Type |
|----------|--------------|------|
| Kaspa vProgs | Seconds | Deterministic (DagKnight) |
| Ethereum L1 | ~12 minutes | Probabilistic then finalized |
| Optimistic Rollups | 7 days (withdrawal) | Challenge-based |
| ZK Rollups | Minutes | Proof generation time |
| Solana | ~400ms | Probabilistic (optimistic confirmation) |
| Sui | ~2-3 seconds | Deterministic (BFT) |

---

## Summary: Where vProgs Stand Out

1. **No fragmentation**: unlike the rollup model, vProgs keep all programs and liquidity on one L1
2. **No L1 bloat**: unlike EVM chains, L1 nodes only verify proofs, not re-execute computation
3. **Unified liquidity**: all applications share one settlement layer with synchronous composability
4. **Instant finality**: DagKnight provides seconds-level finality, faster than Ethereum and rollup challenge periods
5. **Pure PoW security**: no staking assumptions, no validator cartels, no nothing-at-stake
6. **Horizontal scaling**: throughput grows with prover market, not hardware requirements
7. **Sovereign resources**: each program controls its own gas and storage, preventing noisy-neighbor effects
8. **Structural MEV resistance**: BlockDAG's parallel structure and deterministic ordering limit MEV extraction

---

## Next Steps

- [What Are vProgs?](/learn/what-are-vprogs) -- Core concepts
- [How It Works](/learn/how-it-works) -- Execution flow walkthrough
- [Why vProgs?](/learn/why-vprogs) -- Design rationale deep dive
- [FAQ](/learn/faq) -- Common questions answered
