---
layout: page
title: "Covenant Stack"
description: "Understand Kaspa's covenant KIP stack from Crescendo through Covenants++ hard fork -- UTXO spending conditions that underpin Silverscript and vProgs."
section: architecture
---

# Covenant Stack

Covenants are spending conditions that UTXOs carry forward. Instead of only checking *who* can spend a coin (via signature), a covenant enforces *how* the coin must be spent -- where funds go next, when they can move, and what the next transaction must look like. In Kaspa, covenants are the consensus layer that both [Silverscript](/build/developer-tools-overview) (local-state contracts) and **vProgs** (shared-state programs) build on top of.

## Structural Foundations

Building a secure covenant layer requires meticulous structural engineering. Recent protocol upgrades include the implementation of **serialized covenant binding**, a structural foundation that enforces strict data boundaries within transactions. This groundwork is essential for securely chaining complex vProgs capabilities in the future.

Additionally, the core scripting engine has been hardened. Signature opcodes have been refined to handle invalid inputs gracefully by returning `false` rather than causing abrupt execution errors. These predictability improvements are critical for deploying robust decentralized applications on Layer 1.