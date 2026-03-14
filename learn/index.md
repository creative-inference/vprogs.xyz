---
layout: section
title: "Learn About vProgs"
section: learn
description: "Kaspa's Verifiable Programs (vProgs) represent a new paradigm for blockchain programmability. Whether you are a developer evaluating the platform, a researcher studying scalable smart contract architectures, or a community member looking to understand the technology, this section covers everything you need to know."
---

Start with the fundamentals and work your way through to comparisons and advanced topics.

---

## Core Concepts

### [What Are vProgs?](/learn/what-are-vprogs)

The foundational explainer. Understand the "third way" paradigm that avoids both L1 bloat and L2 fragmentation. Learn about the four architecture pillars, the off-chain execution model, and the phased deployment plan.

**Best for:** First-time readers who want a clear mental model of how vProgs work.

---

### [Why vProgs?](/learn/why-vprogs)

A deep dive into the Smart Contract Trilemma and why existing approaches fall short. Explores how ZK verification on a BlockDAG changes the calculus for scalability, composability, and security.

**Best for:** Those evaluating vProgs against other blockchain architectures and wanting to understand the design rationale.

---

### [How It Works](/learn/how-it-works)

An end-to-end walkthrough of the vProgs execution flow: from defining a state transition to final on-chain settlement. Step-by-step explanations of what happens at each stage.

**Best for:** Developers and technical readers who want to understand the mechanics.

---

### [Real-World Use Cases](/learn/use-cases)

What can you actually do with vProgs? Instant global payments, trustless trading, verified credentials, supply chain tracking, insurance that pays itself, community-run organizations, and more -- explained without jargon.

**Best for:** Anyone who wants concrete examples of how vProgs change everyday things.

---

## Evaluation and Reference

### [vProgs Compared](/learn/compared)

Side-by-side comparison of vProgs against Ethereum L2 rollups, Solana, Sui, and traditional L1 smart contract platforms. Tables covering execution model, composability, liquidity, throughput, security, and more.

**Best for:** Analysts and developers comparing platforms for a project or investment thesis.

---

### [Glossary](/learn/glossary)

Comprehensive A-Z reference of all key terms used across the vProgs documentation. From "Account Model" to "ZK Proof," every concept defined in one place.

**Best for:** Quick lookups while reading other documentation.

---

### [FAQ](/learn/faq)

Answers to the most common questions: Is this an L2? Do I need to learn a new language? What about EVM compatibility? How does gas work? When does it ship?

**Best for:** Anyone with specific questions who wants quick, direct answers.

---

## Further Reading

Once you have a solid understanding of vProgs, explore these areas for deeper technical detail:

- [Architecture Overview](/architecture/overview) -- Formal specification and design documents
- [KIP-21 Sequencing](/architecture/kip-21-sequencing) -- The consensus foundation enabling lane-based proving
- [Covenants++](/architecture/covenants) -- The hard fork KIP stack powering vProgs infrastructure
- [Silverscript](/architecture/silverscript) -- The complementary L1 covenant language
- [Roadmap](/ecosystem/roadmap) -- Development phases and milestones
- [Applications](/ecosystem/applications) -- What you can build with vProgs

---

## Quick Reference

| Concept | One-Liner |
|---------|-----------|
| **vProgs** | Lightweight, deterministic programs native to L1 with off-chain execution and on-chain ZK verification |
| **Syncompo** | Synchronous composability -- multiple dApps interact in one atomic L1 transaction |
| **DagKnight** | Parameterless adaptive consensus providing precise ordering and instant finality |
| **Prover Market** | Decentralized market of ZK proof generators enabling horizontal scaling |
| **BlockDAG** | Parallel block structure where all valid blocks are included, not competing |
| **Covenants++** | Hard fork (May 5, 2026) enabling ZK verification, covenant IDs, and lane sequencing |
| **Silverscript** | High-level L1 covenant language -- the local-state complement to vProgs shared state |
