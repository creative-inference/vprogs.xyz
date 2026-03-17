# R&D Channel — Draft Updates

Auto-generated 2026-03-17. Review before merging into [R&D Insights](/changelog/rnd-insights).

---

Here is a draft update for the vProgs technical documentation site, summarizing the recent messages from the Kaspa Core R&D channel.

### Silverscript Language & Tooling (2026-02-10)

The first version of Silverscript, a high-level smart contract language for Kaspa, was announced. It is designed for UTXO-based contracts with local state and complements vProgs, which are intended for shared state. The initial release is experimental and targets Testnet-12. Subsequent updates introduced a VS Code extension, a full-featured debugger with DAP support, and a series of breaking changes to refine the language syntax and AST.

> "I'm happy to announce Silverscript! Silverscript is Kaspa's first high-level smart contract language. It enables DeFi, vaults, and native asset management directly on Kaspa's L1. It's based on CashScript, but adds on top of it essential features like loops, arrays, and function calls. It specializes in managing contracts with local state, compatible with the UTXO model, serving as a complement to vProgs (shared state)." — @someone235

**Timeline & Key Developments:**

*   **2026-02-10:** The initial announcement of the Silverscript language and its [GitHub repository](https://github.com/kaspanet/silverscript).
*   **2026-02-20:** A [VS Code extension](https://marketplace.visualstudio.com/items?itemName=IzioDev.silverscript) providing syntax highlighting was released by @IzioDev.
*   **2026-02-20:** A significant number of [breaking changes](https://gist.github.com/someone235/9c4bdd126ef587afe4876d7f79fa8624) to the language syntax and AST were announced by @someone235, including changes to `bytes` syntax and transaction field names (`lockingBytecode` -> `scriptPubKey`).
*   **2026-02-23:** @missutton proposed a declarative syntax for covenants to simplify state management and script generation ([proposal link](https://github.com/michaelsutton/silverscript/blob/decl/DECL.md)).
*   **2026-03-05:** @manyfestation merged a powerful command-line [debugger for Silverscript](https://github.com/kaspanet/silverscript/pull/43), a critical tool for developers.
*   **2026-03-11:** The debugger was enhanced with support for the Debug Adapter Protocol (DAP), enabling integration with IDEs like VS Code for a graphical debugging experience ([PR #58](https://github.com/kaspanet/silverscript/pull/58)).
*   **2026-03-16:** The debugger gained an `eval` command for inspecting expressions during a debug session ([PR #73](https://github.com/kaspanet/silverscript/pull/73)).

### vProgs L2 Framework (2026-02-11)

Significant progress was made on the core vProgs L2 framework, focusing on linking L2 execution to the L1 blockDAG and ensuring node robustness. A series of pull requests introduced key architectural components like `Checkpoints` for mapping L2 activity to L1 blocks and a coordination mechanism between rollback and pruning.

**Key Pull Requests:**

*   **[vprogs/pull/12](https://github.com/kaspanet/vprogs/pull/12) (2026-02-11):** Introduced `Checkpoints` (a combination of index + metadata) to replace simple indexes for addressing executed batches. This allows the scheduler to link its computational results back to the source L1 `ChainBlock`.
*   **[vprogs/pull/13](https://github.com/kaspanet/vprogs/pull/13) (2026-02-13):** Implemented a coordination mechanism between the rollback and pruning processes. This prevents data from being pruned while a rollback to that data is in progress, hardening the L2 node against edge cases.
*   **[vprogs/pull/14](https://github.com/kaspanet/vprogs/pull/14) (2026-02-13):** Mirrored the `Checkpoint` changes in the L1 bridge component, ensuring both the scheduler and bridge use the same data structures. It also introduced `ChainBlockMetadata` to pass L1 block hash and blue score to the L2 execution environment.

### KIP-0020: Covenant ID (2026-02-11)

A KIP was proposed by @missutton to standardize the creation and identification of covenants. The proposal defines a `covenant_id` derived from the outpoint of an "authorizing" input and the indices of the outputs that will contain the covenant script. This provides a deterministic way to bind a group of UTXOs together under a single covenant instance.

*   **[kips/pull/35](https://github.com/kaspanet/kips/pull/35):** The pull request for KIP-0020.
*   **[KIP-0020 Spec](https://github.com/michaelsutton/kips/blob/kip20/kip-0020.md):** Direct link to the specification file.

### ZK Covenant Rollup PoC (2026-02-19)

A major milestone was achieved with the announcement of a proof-of-concept ZK Covenant Rollup. This comprehensive demo, developed by @Max143672, showcases a fully-functional account-based L2 on Kaspa, validating the L1's capabilities for supporting advanced L2 solutions. The PoC includes deposit, transfer, and withdrawal logic, with every state transition verified by ZK proofs (both STARK and Groth16) executed by on-chain covenant scripts.

> "This is beyond amazing. Extremely significant progress. The main initial goal was a poc to get convinced we have all L1 capabilities needed, but this is already a highly mature canonical bridge implementation." — @missutton

*   **[zk-rollup-covenant-example branch](https://github.com/biryukovmaxim/rusty-kaspa/tree/zk-rollup-covenant-example):** The source code for the PoC.
*   **[Explanatory Book](https://biryukovmaxim.github.io/rusty-kaspa/ch01-introduction.html):** Detailed documentation explaining the architecture and implementation of the ZK rollup.

### Consensus: Adaptive Block Mass (2026-02-22)

A detailed discussion began around implementing an adaptive block mass mechanism, inspired by Monero, to address the long-term security budget. The initial proposal involves penalizing miners for creating blocks with mass larger than the median of recent blocks.

*   **The Proposal:** @FreshAir08 initiated the discussion, suggesting a quadratic penalty on the coinbase reward for blocks exceeding the median mass of the last X blocks.
*   **Key Refinement (2026-02-25):** @Ross_ku_963 provided a crucial analysis, pointing out that Monero's model (which only penalizes coinbase) works due to its tail emission. For Kaspa, where fees will eventually dominate rewards, the penalty must apply to the *total* miner income (coinbase + fees) to remain effective long-term.
*   **Analysis:** @someone235 created a [spreadsheet with charts](https://docs.google.com/spreadsheets/d/13H-jGmfbA7anDPh5PnFYbY-TllsrZWspETvfmQpTu_w/edit?usp=sharing) to analyze various penalty functions, comparing linear, quadratic, and Monero-style formulas.

### KIP-0021: Sequencing Commitment (2026-02-24)

@missutton introduced a draft for KIP-0021, which proposes a "Sequencing Commitment" scheme. This mechanism allows L2 solutions to trustlessly prove that a sequence of transactions was accepted by the Kaspa L1. It is a fundamental building block for bridges and rollups, enabling them to inherit security from the base layer. A key discussion point raised by @Max143672 was the need for an RPC layer to expose the commitment data, so external users (like L2 provers) can access it without having to sync the entire chain.

*   **[kips/pull/36](https://github.com/kaspanet/kips/pull/36):** The pull request for KIP-0021.
*   **[KIP-0021 Spec](https://github.com/michaelsutton/kips/blob/kip21/kip-0021.md):** Direct link to the specification file.

### ZK & Precompile Design Debate (2026-02-14)

A technical debate began regarding the best approach for integrating ZK proof verification on-chain.

*   **The Concern:** @Max143672 argued that adding a precompile for a specific ZK system like RISC Zero creates vendor lock-in and makes the protocol dependent on a specific VM version. Bug fixes or upgrades would require a hard fork.
> "I feel that precompile for risc0 succinct is the wrong way. Basically it's a vendor lock. It also a lock to specific version and circuit. It means we will need a hf for bug fixes and for newer VM circuit. The opposite is adding opcodes that are required for finite field arithmetics, FRI, Fiat-Shamir." — @Max143672
*   **The Counterargument:** @saefstroem countered that rebuilding verifiers from low-level opcodes is inefficient and risky compared to using audited, established implementations. He suggested that precompiles are unavoidable for complex systems like STARKs on a UTXO chain and that a faster hard-fork mechanism might be a better solution.
> "Why rebuild a verifier when there exist many audited/established implementations? What is the point? Imo focus should be put at easing the workload from user perspective... But in general Kaspa’s UTXO system will unlikely be able to support STARK low level components in the near future as I see it, and using precompile opcodes will be unavoidable." — @saefstroem
*   **Alternative Proposal:** @saefstroem also suggested the Ligero protocol as a quantum-safe option that could potentially be implemented with a small set of opcodes, offering a middle ground.

### Rusty Kaspa Core & Infrastructure (2026-02-10)

Continuous improvements were made to the core node software, culminating in a major release.

*   **Build/CI Performance (2026-02-10):** [PR #878](https://github.com/kaspanet/rusty-kaspa/pull/878) was merged, significantly speeding up CI test times by caching compiled dependencies, reducing test runs from ~30 minutes to ~15 minutes.
*   **Windows Build Fix (2026-02-10):** A workaround for a RISC-Zero-related build issue on Windows was developed and merged in [PR #879](https://github.com/kaspanet/rusty-kaspa/pull/879), enabling developers on Windows to build and test covenant-related features.
*   **Consensus Bug Fix (2026-02-14):** @Max143672 discovered that mass calculation for transaction outputs with covenant bindings was missing. A new branch `covpp-reset2` was created to address this.
*   **RPC Client Shutdown (2026-02-14):** A long-standing discussion about resource management in the `KaspaRpcClient` was addressed in [PR #863](https://github.com/kaspanet/rusty-kaspa/pull/863). @aspectron76 provided a detailed explanation of the client's design, stating it was intended to be managed by a wrapper that handles connection state and notification re-subscriptions. The agreed solution was to add an optional auto-cleanup mechanism.
*   **Rusty Kaspa v1.1.0 Release (2026-03-04):** A [new stable version was released](https://github.com/kaspanet/rusty-kaspa/releases/tag/v1.1.0), featuring the new VSPC v2 API for integrators, major IBD catchup and performance improvements, and the beta release of the in-house Stratum Bridge.
*   **Covenant State Persistence (2026-03-12):** @IzioDev initiated a discussion on how to preserve covenant state and history beyond the node's pruning horizon. The leading idea is to create an optional, opt-in indexer within kaspad that would store historical transaction data needed for covenant verification.

### Testnet-12 Updates & SDKs (2026-02-10)

Work continued on Testnet-12 to support covenant development and testing, with corresponding updates to various SDKs.

*   **Transaction Encoding (2026-02-10):** A clarification was made regarding `decode_sig_op_count`. This function uses a compressed encoding for signature operations for `tx.version > 0`, which is active on Testnet-12 but not mainnet.
*   **Python SDK (2026-02-20):** @smartgoo_v announced that Python bindings for Testnet-12 and covenant features are available on the `tn12` branch of the [kaspa-python-sdk repository](https://github.com/kaspanet/kaspa-python-sdk/tree/tn12). A full `v1.1.0` release followed on **2026-03-05**.
*   **WASM SDK (2026-03-05):** @IzioDev provided a pre-compiled WASM build for Testnet-12 to simplify testing for developers. A major update was merged on **2026-03-16** ([PR #885](https://github.com/kaspanet/rusty-kaspa/pull/885)), bringing the WASM SDK nearly to feature parity with the native Rust implementation for covenants. This enables webapps and browser extensions to fully interact with covenants.
*   **Testnet Connectivity (2026-03-06):** It was confirmed that there are no public PNN nodes for Testnet-12. Developers should connect to specific community-run nodes, such as `wss://tn12reset-wrpc.kasia.fyi`.