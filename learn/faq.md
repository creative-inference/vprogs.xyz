---
layout: page
title: "Frequently Asked Questions"
section: learn
description: "Get answers to common questions about Kaspa vProgs — how they differ from L2s, what languages they support, and how ZK verification works."
---

Answers to the most common questions about Kaspa's Verifiable Programs (vProgs).

---

## General

### Is vProgs an L2?

No. vProgs are native to Kaspa's L1. They are not a separate chain, rollup, or sidechain.

The confusion is understandable because vProgs share one characteristic with L2s: computation happens off-chain. But the similarities end there. L2 rollups are independent execution environments that post state roots back to L1. They fragment liquidity, require bridges, and typically rely on centralized sequencers.

vProgs, by contrast:

- Settle directly on Kaspa L1 as first-class protocol entities
- Share a single unified liquidity pool with all other vProgs
- Use L1 BlockDAG consensus for sequencing (no separate sequencer)
- Compose synchronously with other vProgs in atomic L1 transactions
- Are verified by L1 nodes as part of normal block processing

The accurate description is: vProgs are **sovereign programs native to L1 with off-chain execution and on-chain ZK verification**.

---

### What can I build with vProgs?

Anything you would build with smart contracts on other platforms, plus use cases that are impractical elsewhere due to gas costs or composability limitations:

- **DeFi**: decentralized exchanges, lending/borrowing protocols, stablecoins, yield vaults, derivatives
- **DAOs**: on-chain governance with complex voting and treasury management
- **NFTs and digital assets**: with native asset support via Covenants++
- **Gaming**: on-chain game state with off-chain computation (no gas bottleneck)
- **Enterprise applications**: compliance automation, ZK-based auditing, real-time settlement
- **Privacy applications**: ZK proofs natively support selective disclosure and private computation
- **Cross-program DeFi**: complex multi-protocol operations (borrow + swap + stake) in a single atomic transaction

---

### How is this different from Ethereum smart contracts?

The execution model is fundamentally different:

| | Ethereum | vProgs |
|---|---------|--------|
| **Where logic runs** | On-chain (every node re-executes) | Off-chain (provers execute) |
| **How correctness is guaranteed** | Consensus re-execution | ZK proof verification |
| **L1 computational load** | Proportional to contract complexity | Constant (proof verification) |
| **State management** | One global state, shared gas market | Sovereign per-vProg state, independent gas |
| **Scalability** | Limited by block gas limit | Limited by prover market capacity |
| **Security** | PoS (economic guarantees) | PoW + ZK proofs (cryptographic guarantees) |

The composability model is similar -- both support synchronous, atomic interactions between programs. But vProgs achieve this without the L1 bloat because L1 nodes never re-execute the underlying computation.

---

## Development

### Do I need to learn a new programming language?

It depends on what you are building.

**For L1 covenant contracts (Silverscript):** Silverscript is a new language, but it is designed to be approachable. If you have experience with Solidity, CashScript, or any C-style language, the syntax will be familiar. Silverscript handles local-state (UTXO) contracts like vaults, multi-sig wallets, time-locks, and asset issuance rules.

**For vProgs (shared-state programs):** vProgs are language-agnostic at the execution layer. What matters is the ZK proving system:

- **Noir** -- for inline ZK covenants (smallest applications). Noir has a Rust-like syntax.
- **RISC Zero / SP1** -- for standard applications. These allow writing provable programs in Rust.
- **Cairo** -- for rollup-style applications with user-submitted logic. Cairo has its own syntax but a growing ecosystem.

In practice, Rust is the dominant language across most of the ZK stack. If you know Rust, you are well-positioned.

---

### Is vProgs EVM compatible?

Not directly, and by design.

vProgs do not run the EVM. They use zero-knowledge proofs for verification instead of re-execution, which is a fundamentally different architecture. Porting an existing Solidity contract is not a copy-paste operation.

However:

- **EVM equivalence via zkEVM**: A zkEVM could theoretically be built as a vProg (or vProgs-Based Rollup). This would allow EVM bytecode to execute inside a ZK-proving environment that settles on Kaspa L1. This is not a priority for the core team but is architecturally possible.
- **Similar mental models**: If you understand smart contract development on EVM (state transitions, composability, gas), the concepts transfer directly to vProgs. The execution model is different, but the application design patterns are similar.
- **Account model familiarity**: vProgs use an account model (like Ethereum and Solana), not a UTXO model. Developers accustomed to account-based state management will find the model intuitive.

---

### What programming tools are available today?

As of March 2026, the ecosystem is in active development:

- **Silverscript compiler**: experimental, available on Testnet-12 (TN12). Compiles covenant contracts to native Kaspa Script.
- **TN12 testnet**: live with Covenants++ features including ZK verification opcodes, covenant IDs, and sequencing commitment opcodes.
- **ZK Rollup PoC**: a full proof-of-concept demonstrating deposits, L2 transfers, and withdrawals with STARK and Groth16 proofs.
- **vProgs repository**: the official Rust monorepo at [github.com/kaspanet/vprogs](https://github.com/kaspanet/vprogs), public since January 2026.

Developer SDKs, documentation, and higher-level tooling will expand as the platform matures through 2026.

---

## Technical

### What is the proof generation time?

It varies by tier:

| Tier | ZK Stack | Typical Proof Time | Use Case |
|------|----------|-------------------|----------|
| Inline ZK | Noir / Groth16 | ~1 second (mobile), ~6 seconds (mobile web) | Per-transaction proofs for small contracts |
| Based ZK Apps | RISC Zero / SP1 | 10-30 seconds | Aggregated proofs for standard applications |
| Based ZK Rollups | Cairo | Longer (varies by complexity) | Meta-apps with user-submitted logic |

For most user-facing applications, proof times are in the 1-30 second range. The prover market model means proof generation can be parallelized and outsourced to specialized hardware, reducing latency.

Proof verification on L1 is near-instant -- it is a constant-time cryptographic check regardless of the computation's complexity.

---

### How does gas work?

Gas in vProgs works differently from Ethereum's global gas market:

**Sovereign gas pricing**: each vProg defines its own gas scales. A computationally intensive DeFi protocol can set different prices than a simple token program. This means gas costs are internalized -- heavy usage of one vProg does not increase gas costs for users of other vProgs.

**STORM constants**: each vProg also defines throughput and state-growth parameters (STORM constants) that regulate how fast its state can grow and how much throughput it can consume.

**Weighted Area gas**: the gas model distinguishes between parallelizable work (witness/scope computation) and sequential work (new transaction processing), incentivizing efficient resource usage.

**No global gas wars**: because each vProg manages its own resources independently, there is no equivalent of Ethereum's global gas auction where a popular NFT mint spikes fees for everyone.

**Storage costs**: transactions requiring permanent state storage pay according to the vProg's defined storage pricing. This prevents unbounded state growth at the vProg level.

---

### How does cross-vProg composability work?

Through **concise witnesses** -- compact Merkle inclusion proofs.

When a transaction in `vProg_A` needs to read state from `vProg_B`:

1. `vProg_B`'s state commitment contains a hierarchical Merkle root over all its account states
2. A Merkle inclusion proof (concise witness) demonstrates that a specific account in `vProg_B` held a specific value at a specific point in time
3. This witness is included in the transaction
4. L1 verifies both the witness validity and the ZK proof of the combined operation
5. Everything settles in a single atomic L1 transaction

This enables operations like "read a price from a DEX vProg, use it to calculate collateral in a lending vProg, and execute a swap" -- all in one transaction with no bridges or async delays.

Full synchronous composability (Phase 2) extends this with the complete Computation DAG, enabling arbitrary cross-vProg atomic transactions.

---

### What about MEV?

vProgs provide structural resistance to MEV (Maximal Extractable Value) through several mechanisms:

- **No centralized sequencer**: transaction ordering comes from decentralized PoW mining on the BlockDAG, not from a single entity that could reorder for profit
- **Parallel block structure**: the DAG's parallel nature makes mempool-based front-running significantly harder than in single-chain architectures
- **Atomic bundling**: vProg transactions can bundle multiple operations into a single atomic unit, making sandwich attacks impractical
- **Deterministic execution**: the combination of pre-declared account access and deterministic ordering reduces the attack surface for MEV extraction

This does not eliminate MEV entirely (no system can), but the structural properties make the most damaging forms of MEV -- front-running, sandwich attacks, and time-bandit attacks -- significantly harder to execute than on centralized-sequencer L2s or leader-based PoS chains.

---

### How does finality work?

Finality comes from DagKnight consensus on the BlockDAG:

- **Speed**: near-instant (seconds-level) finality
- **Type**: deterministic -- once finalized, a transaction cannot be reversed
- **Mechanism**: DagKnight's parameterless adaptive consensus provides precise block ordering and rapid convergence

This is significantly faster than:
- Ethereum L1: ~12 minutes to finality
- Optimistic rollups: 7-day challenge period for withdrawals
- ZK rollups: minutes (proof generation + L1 inclusion)

For vProgs specifically, finality means:
- The ZK proof has been verified
- The state commitment is anchored in the BlockDAG
- The ordering is determined and irreversible
- Other vProgs can immediately compose with the new state

---

## Roadmap

### When does this ship?

The deployment is phased:

**Already live:**
- Crescendo hard fork (10 BPS, KIP-9/10/13/15) -- activated
- TN12 testnet with Covenants++ features -- launched January 2026
- ZK Rollup proof-of-concept (Milestone 3) -- demonstrated February 2026
- vProgs repository public -- January 2026

**Upcoming:**
- **Covenants++ hard fork**: May 5, 2026 (mainnet activation of KIP-16, 17, 20, 21)
- **Phase 1 (Standalone vProgs)**: following Covenants++ activation, dependent on DagKnight and remaining infrastructure
- **Phase 2 (Full Synchronous Composability)**: after Phase 1 is stable, timeline TBD

The Covenants++ hard fork is the critical near-term milestone. It activates the ZK verification opcodes, covenant IDs, lane-based sequencing, and other consensus primitives that vProgs build on.

---

### What is the difference between Phase 1 and Phase 2?

**Phase 1 -- Standalone vProgs:**
- Each vProg operates independently as a sovereign program
- Bridges to L1 via ZK proofs through the canonical bridge
- No cross-vProg atomic transactions yet
- The Computation DAG groups activity by program (degenerate CD)
- Proving scales as O(program activity)
- Fully functional for single-program applications (DEXs, lending protocols, etc.)

**Phase 2 -- Full Synchronous Composability:**
- Cross-vProg atomic transactions via concise witnesses
- Extended Computation DAG with per-account modeling
- Any vProg can compose with any other vProg in a single transaction
- Enables complex multi-protocol DeFi operations
- Full CD specification with scope-based gas calculations

Phase 1 delivers real programmability and ZK verification. Phase 2 adds the cross-program atomicity that makes the "money legos" vision possible.

---

### What is Silverscript and how does it relate to vProgs?

Silverscript is Kaspa's L1 smart contract language for **local-state** (UTXO-based) covenant contracts. It is a complement to vProgs, not a competitor:

| | Silverscript | vProgs |
|---|---|---|
| **State model** | Local (UTXO) | Shared (accounts) |
| **Execution** | On-chain (L1 script validation) | Off-chain (ZK proof verification) |
| **Use cases** | Vaults, multi-sig, time-locks, asset rules | DeFi protocols, DAOs, complex state machines |

In a mature Kaspa ecosystem, most applications will use both:
- Silverscript for the UTXO-level "plumbing" (custody, asset issuance, spending rules)
- vProgs for the application-level "logic" (protocol state, cross-program composability)

---

### What is the Covenants++ hard fork?

Covenants++ is a consensus upgrade scheduled for May 5, 2026. It activates four KIPs:

| KIP | What It Does |
|-----|-------------|
| **KIP-16** | ZK verification opcodes -- L1 can verify zero-knowledge proofs |
| **KIP-17** | Extended covenant opcodes -- auth/cov binding for stateful contracts |
| **KIP-20** | Covenant IDs -- native UTXO lineage tracking |
| **KIP-21** | Partitioned sequencing commitment -- lane-based proving infrastructure |

This hard fork is the consensus foundation that makes everything else possible: Silverscript contracts, ZK covenants, canonical bridges, and ultimately vProgs.

---

## Security

### How secure is this?

vProgs security rests on two independent pillars:

1. **Proof-of-Work consensus** secures transaction ordering and data availability. An attacker would need to overpower the mining network to reorder or censor transactions.

2. **Zero-knowledge proofs** secure computation correctness. An attacker cannot submit a false state transition because the ZK proof would fail verification. This is a mathematical guarantee, not an economic one.

This dual-layer model has no single point of failure. Even if the prover market were compromised, invalid proofs would be rejected by L1. Even if individual miners acted adversarially, the PoW consensus ensures correct ordering as long as honest miners control the majority of hash power.

---

### What happens if a prover goes offline?

If a specific prover stops operating:

- The vProg's transactions will not be proven until another prover picks up the work
- No funds are at risk -- the last verified state commitment remains valid on L1
- Any other prover can resume proving from the last anchored state
- The decentralized prover market means there is no single point of failure for proving infrastructure

This is analogous to what happens if an Ethereum rollup sequencer goes offline, but without the forced transaction delays -- any prover can step in because the L1 sequencing is done by the BlockDAG, not the prover.

---

### Can a vProg affect other vProgs?

No. Each vProg has **sovereign state** -- it exclusively owns its accounts, and no other vProg can directly modify them.

Cross-vProg interactions happen through declared dependencies and concise witnesses, which are verified cryptographically. A buggy or malicious vProg cannot corrupt another vProg's state. This mutual trustlessness is an architectural guarantee, not a runtime check.

Resource isolation is also enforced at the protocol level through per-vProg gas scales and STORM constants. A heavily-used vProg cannot spike gas costs or consume resources belonging to other programs.

---

## Next Steps

- [What Are vProgs?](/learn/what-are-vprogs) -- Core concepts
- [How It Works](/learn/how-it-works) -- Execution flow walkthrough
- [vProgs Compared](/learn/compared) -- Platform comparison
- [Glossary](/learn/glossary) -- Key terms reference
