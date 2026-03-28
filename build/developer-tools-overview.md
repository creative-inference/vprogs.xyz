---
layout: page
title: "Developer Tools & Silverscript"
description: "Explore the cutting-edge tools, WebAssembly support, and debugger features for building vProgs on Kaspa."
section: build
---
# Building on vProgs

Developing on Kaspa's Layer 1 requires robust, efficient tooling. The ecosystem is rapidly maturing to support a seamless developer experience for writing, testing, and deploying Verifiable Programs (vProgs).

## Silverscript
Kaspa introduces **Silverscript**, a high-level smart contract language that compiles directly into native Kaspa Script. Designed for flexibility, it empowers developers to write complex UTXO spending conditions without managing low-level assembly.



Recent upgrades have introduced compiler optimizations and opcode hardening, improving both the security and performance of the smart contract language as it moves closer to a production-ready state.

## Opcode Refinement and Standardization

The underlying native Kaspa Script is being continuously enhanced to support advanced applications. Recent developments include:
*   **Arbitrary Data Signatures:** New opcodes (such as the proposed `checkdatasig` / `CheckSignedMsgFromStack` under review in PR #926) allow covenants to verify signatures on arbitrary data directly from the stack.
*   **Standardized Documentation:** Comprehensive, standardized documentation for opcode stack usage is being rolled out to clarify developer expectations and reduce bugs.

## Enhanced Debugger Capabilities & WebAssembly

Building decentralized applications on a parallelized BlockDAG requires deep visibility into execution paths. The Kaspa developer tooling suite is expanding to include **enhanced vProg debugger capabilities**, allowing developers to step through complex multi-contract flows, inspect stack states, and simulate transactions locally before deploying to the TN12 testnet. Additionally, WebAssembly support continues to bridge the gap for browser-based toolchains and client-side proof generation.