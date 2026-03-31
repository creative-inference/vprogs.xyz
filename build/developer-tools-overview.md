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


Community-driven testing recently identified and resolved a critical bug causing mismatches between compile-time and runtime integer math. This fix prevents silent, hard-to-debug errors and significantly improves the overall reliability of vProg execution.



Recently, a major refactoring of the SilverScript codebase was completed (PR #91). This significant overhaul simplifies the architecture, paving the way for more stable and rapid future development of the language.

## Opcode Refinement and Standardization

The underlying native Kaspa Script is being continuously enhanced to support advanced applications. Recent developments include:
*   **Arbitrary Data Signatures:** New opcodes (such as the proposed `checkdatasig` / `CheckSignedMsgFromStack` under review in PR #926) allow covenants to verify signatures on arbitrary data directly from the stack.
*   **Standardized Documentation:** Comprehensive, standardized documentation for opcode stack usage is being rolled out to clarify developer expectations and reduce bugs.


*   **Flexible Number Encoding:** The requirement for minimally encoded numbers in scripts has been removed from `rusty-kaspa`. This protocol simplification liberalizes integer encoding rules, offering greater flexibility for vProg developers and tooling.
*   **Advanced Authentication:** The integration of new signature-checking opcodes (`checkDataSig` / `checkSigFromStack`) into both `rusty-kaspa` and the SilverScript compiler provides a fundamental building block for enabling complex authentication logic.

## Enhanced Debugger Capabilities & WebAssembly

Building decentralized applications on a parallelized BlockDAG requires deep visibility into execution paths. The Kaspa developer tooling suite is expanding to include **enhanced vProg debugger capabilities**, allowing developers to step through complex multi-contract flows, inspect stack states, and simulate transactions locally before deploying to the TN12 testnet. Additionally, WebAssembly support continues to bridge the gap for browser-based toolchains and client-side proof generation.


To further streamline integration, recent architecture refinements (such as PR #935 in Rusty-Kaspa) separate core logic from WASM-specific types. This separation paves the way for easier usage across native Rust and Python SDKs. Meanwhile, rigorous R&D on the testnet continues to fortify the smart contract layer; active testing has identified and addressed vital edge cases, including potential integer overflow and clamping issues with large numbers.

SilverScript now officially supports source-level debugging and complex state-transition test scenarios. This represents a major leap in developer experience, drastically simplifying the process of building and testing sophisticated smart contracts.


> **Note:** To accelerate the recent major codebase refactoring, the debugger recording feature was temporarily removed from the SilverScript compilation path. The development team plans to re-integrate this key developer tool soon as part of their iterative progress.
