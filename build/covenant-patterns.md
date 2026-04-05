---
layout: page
title: "Advanced Covenant Patterns"
description: "Explore Inter-Covenant Communication (ICC), Multi-Contract Flows (MCF), and Dynamic UTXO Selection for building high-concurrency dApps on Kaspa."
section: build
---

# Advanced Covenant Patterns

As the Kaspa ecosystem matures, standard architectural patterns are emerging to help developers build sophisticated, high-concurrency decentralized applications on top of L1 UTXOs.

## Core Architectural Patterns

Building complex applications without a monolithic virtual machine requires specialized design patterns:

*   **Inter-Covenant Communication (ICC):** Standardized methods for securely passing state and chaining execution flow between independent covenants.
*   **Multi-Contract Flows (MCF):** Architectural patterns for managing distributed state across multiple interacting covenants within a single transaction graph.

These patterns form the foundation for multi-contract dApps, ensuring atomic execution and trustless verification.

## Solving State Contention: Dynamic UTXO Selection

In a highly parallelized UTXO system, state contention can occur when multiple users try to interact with the same smart contract UTXO simultaneously.

To provide a seamless user experience, developers are designing **Dynamic UTXO Selection**:
*   **Abstract IDs:** Instead of hardcoding specific UTXO outpoints in their transactions, users reference abstract IDs representing the covenant's state.
*   **Miner Resolution:** Miners resolve these abstract inputs to the most recent, valid UTXOs during block template construction.

This approach drastically simplifies the user experience and enables complex, high-concurrency applications like on-chain games and orderbook DEXs. To ensure network stability, Dynamic UTXO Selection is being introduced via a phased rollout, beginning with SDK-level support before moving to strict consensus-level changes.

## DeFi Concurrency Solutions: Pool Splitting

To address concurrency challenges inherent in the UTXO model, developers are designing application-level solutions for Decentralized Finance (DeFi) protocols. One emerging pattern is **Pool Splitting**, where a single liquidity pool (such as a DEX AMM) is distributed across multiple parallel rebalancing covenants. This allows concurrent users to trade against different UTXOs representing fractions of the same pool, minimizing state contention while background processes or arbitrageurs rebalance the fractional pools to maintain price parity.


Building on this, developers are prototyping novel DeFi models that feature mergeable and splittable liquidity pools. By leveraging Kaspa's parallelism and the fact that UTXO state is known in advance, these models aim to enable trades with zero slippage. To further solve the challenge of liquidity fragmentation across these split pools, developers are exploring advanced features like **signatures over covenant IDs** to virtually aggregate disparate liquidity pools for larger trades. To manage complexity and preserve consensus stability, these virtual aggregation features are being built directly into the SDK rather than the core protocol.
