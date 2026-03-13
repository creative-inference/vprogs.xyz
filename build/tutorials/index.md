---
layout: section
title: "Tutorials"
section: build
description: "Hands-on guides for building on vProgs and Silverscript, ordered by difficulty. Each tutorial builds on concepts from the previous ones."
---

## Beginner

### 1. [Your First vProg](/build/tutorials/first-vprog)

Define a state schema, write transition logic in Rust, execute off-chain, generate a ZK proof, and submit to L1. The foundational tutorial for understanding the vProgs execution model.

**Time:** 45 minutes | **Prerequisites:** Rust basics, [Dev Environment Setup](/build/dev-environment)

### 2. [Create a Native Asset](/build/tutorials/native-asset)

Issue a new token using covenant primitives. Covers minting, transferring, and burning tokens using Silverscript-style syntax with Covenant ID lineage tracking.

**Time:** 30 minutes | **Prerequisites:** Tutorial 1

### 3. [Build a Vault with Silverscript](/build/tutorials/silverscript-vault)

Build a time-locked vault contract in Silverscript. Deposit funds, enforce a time lock, and withdraw. Full contract code with line-by-line explanations.

**Time:** 30 minutes | **Prerequisites:** Tutorial 2

---

## Intermediate

### 4. [Inline ZK Covenant with Noir](/build/tutorials/zk-covenant)

Write a simple ZK circuit in Noir, compile it, integrate with a covenant, and deploy. Demonstrates per-transaction proving with sub-second proof times.

**Time:** 60 minutes | **Prerequisites:** Tutorial 3, basic familiarity with ZK concepts

---

## Advanced

### 5. [Cross-vProg Transaction](/build/tutorials/cross-vprog) -- Phase 2 / Coming Soon

Compose multiple vProgs in a single atomic transaction: borrow from a lending vProg, swap on a DEX vProg, and stake on a staking vProg. Requires synchronous composability (Phase 2).

**Time:** 60 minutes | **Prerequisites:** All previous tutorials

---

## Prerequisites Checklist

Before starting any tutorial, ensure you have completed the [Dev Environment Setup](/build/dev-environment):

- [ ] Rust nightly toolchain installed
- [ ] vProgs repo cloned and built
- [ ] Silverscript repo cloned and built
- [ ] IDE configured with rust-analyzer
- [ ] Connected to TN12 or running local simnet

---

## Additional Resources

- **[Silverscript Reference](/build/silverscript-reference)** -- Full language spec for covenant development
- **[API Reference](/build/api-reference)** -- RPC endpoints and data types
- **[Example Projects](/build/examples)** -- Complete reference implementations
- **[Developer Tools](/build/tools)** -- CLI tools and debugging utilities
