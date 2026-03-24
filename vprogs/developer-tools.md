---
layout: page
title: "Developer Tools & Silverscript"
description: "Explore the cutting-edge tools, WebAssembly support, and debugger features for building vProgs on Kaspa."
section: developers
---
# Building on vProgs

Developing on Kaspa's Layer 1 requires robust, efficient tooling. The ecosystem is rapidly maturing to support a seamless developer experience for writing, testing, and deploying Verifiable Programs (vProgs).

## Silverscript
Kaspa introduces **Silverscript**, a high-level smart contract language that compiles directly into native Kaspa Script. Designed for flexibility, it empowers developers to build complex programmable UTXO logic seamlessly.

## Infrastructure and Tooling Optimizations
To support real-world applications, Kaspa's tools are continuously battle-tested. Recent network activity at 1500-3000 TPS has served as a stress test, driving vital optimizations in explorer databases and node infrastructure. To manage the massive data growth associated with a thriving vProgs ecosystem, developers are actively planning long-term scaling architectures—evaluating solutions from native node indexing to distributed SQL.

Building on a BlockDAG also presents unique tooling considerations. For example, developers must account for BlockDAG nuances, such as checking the "anticone" to correctly query all blocks containing a specific transaction. These deep technical challenges are being solved at the foundational level to abstract complexity and provide a smooth, reliable developer experience.