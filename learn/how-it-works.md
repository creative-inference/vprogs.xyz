---
layout: page
title: "How vProgs Work"
section: learn
description: "Walk through the full vProgs lifecycle: define state transitions, execute off-chain, generate ZK proofs, and verify on Kaspa's L1 BlockDAG."
---

This page walks through the complete vProgs execution lifecycle, from defining a state transition to final on-chain settlement. Each step is explained in plain terms with enough technical detail to build a solid understanding of the mechanics.

---

## The Big Picture

The vProgs execution model can be summarized in one sentence: **users define what should happen, provers execute it off-chain and generate a cryptographic proof, and L1 verifies the proof and finalizes the state.**

The key insight is that L1 nodes never re-execute the computation. They only check a compact proof that the computation was performed correctly. This separation of execution from verification is what makes the system scalable.

```
Define --> Execute --> Prove --> Submit --> Verify --> Finalize
 (user)   (off-chain)  (prover)  (to L1)   (L1 nodes)  (DagKnight)
```

---

## Step 1: Define the State Transition

Everything begins with a user or application defining the desired state change. A state transition is a description of:

- **Which program** (vProg) to interact with
- **What operation** to perform (e.g., transfer tokens, update a record, execute a swap)
- **Which accounts** will be read from and written to
- **What inputs** the operation requires (amounts, parameters, signatures)

### Account Pre-Declaration

A critical design choice borrowed from Solana: every transaction must declare its account access upfront, before execution begins.

| Declaration | Symbol | Purpose |
|-------------|--------|---------|
| **Read set** | `r(x)` | All accounts the transaction will read from |
| **Write set** | `w(x)` | Accounts that will be modified (must be a subset of the read set) |
| **Witness set** | `pi(x)` | Data needed to resolve dependencies on other vProgs |

This pre-declaration serves two purposes:

1. **Parallel processing**: the BlockDAG can identify non-conflicting transactions and process them simultaneously
2. **Deterministic execution**: by declaring access in advance, the system can detect and correctly serialize conflicting operations

### Cross-vProg Dependencies

If a transaction needs to read state from a different vProg (e.g., checking a price on a DEX before executing a trade on a lending protocol), the witness set includes the necessary data from that other program. This is the foundation of synchronous composability -- more on this in Step 5.

---

## Step 2: Execute Off-Chain

Once the state transition is defined, the actual computation happens entirely off-chain. This is one of the most important design decisions in the vProgs architecture.

### Who Executes?

Execution is performed by **provers** -- entities that run the vProg logic and generate cryptographic proofs of correctness. Provers can be:

- Dedicated infrastructure providers
- The vProg developer's own servers
- Any participant in the **decentralized prover market**

There is no centralized sequencer or privileged execution environment. Anyone with sufficient compute resources can become a prover, creating a competitive market that drives down costs and increases throughput.

### What Happens During Execution?

The prover:

1. Loads the current state of all relevant accounts (from the read set)
2. Runs the vProg's logic against the declared inputs
3. Computes the resulting state changes (new account values)
4. Records every step of the computation in a format suitable for proof generation

The prover has full access to the vProg's state and logic. It performs the same computation that would happen on-chain in a traditional VM-based blockchain -- but without burdening any L1 node.

### Sovereign Execution Environments

Each vProg operates as a "mini zkVM" -- a self-contained execution environment with its own:

- **State space**: the set of accounts it owns and manages
- **Gas scales**: custom pricing for computation within its domain
- **STORM constants**: parameters regulating state growth and throughput
- **Storage costs**: fees for operations requiring permanent state storage

This sovereignty means that resource consumption in one vProg does not affect any other. A complex DeFi protocol running at maximum throughput has zero impact on a simple token transfer in a different vProg.

---

## Step 3: Generate the ZK Proof

After execution, the prover generates a zero-knowledge proof -- a compact cryptographic certificate that attests: "the computation described by this transaction was executed correctly, and the resulting state is valid."

### What the Proof Contains

The proof object includes:

| Component | Purpose |
|-----------|---------|
| **ZK proof** (`pi`) | Cryptographic proof of correct execution |
| **State commitment** (`C_p^t`) | A Merkle root over the resulting state |
| **Per-step state roots** | Intermediate state snapshots enabling composability |

### State Commitments

The state commitment is structured as a **hierarchical Merkle tree**:

- The root represents the complete state of the vProg at a point in time
- Each leaf represents an individual account's state
- Intermediate nodes provide structure for efficient verification
- Per-step roots capture the state at each transaction within a batch

This structure enables **concise witnesses** -- compact proofs that any specific account held a specific value at a specific point in the execution sequence. These witnesses are essential for cross-vProg composability.

### ZK Stack

The proof generation uses different ZK systems depending on the application tier:

| Tier | Use Case | ZK System | Typical Proof Time |
|------|----------|-----------|-------------------|
| **Inline ZK** | Small contracts, wallets | Noir / Groth16 | ~1 second (mobile) |
| **Based ZK apps** | Standard applications | RISC Zero / SP1 | 10-30 seconds |
| **Based ZK rollups** | Meta-apps with user logic | Cairo | Longer (varies) |

The tiered approach means lightweight operations (like a simple transfer) can be proven in about a second even on a mobile device, while complex applications use more powerful proving infrastructure.

---

## Step 4: Submit to L1

The proof, state commitment, and transaction metadata are packaged and submitted to Kaspa's L1 BlockDAG.

### What Gets Submitted

The L1 transaction contains:

- The ZK proof itself
- The new state commitment (Merkle root)
- The transaction's account access declarations (read/write sets)
- Any witness data for cross-vProg dependencies

### KIP-21 Lane Sequencing

Each vProg maps to a **lane** in KIP-21's partitioned sequencing commitment. When a transaction is submitted:

1. It is included in a BlockDAG block
2. The block's sequencing commitment updates the relevant lane's tip hash
3. The lane records the new activity under its own partition

This partitioning is what makes proving scalable. A vProg's prover only needs to process activity in its own lane, not the entire chain's history. Proof effort scales as O(vProg activity), not O(total network activity).

### The Sequencing Commitment

Block headers contain a chained commitment:

```
SeqCommit(B) = Hash(SeqCommit(parent(B)), SeqStateRoot(B))
```

This chain of commitments provides an unforgeable record of the global transaction ordering. Provers anchor their proofs to specific points in this chain, and verifiers can confirm that the proof covers the correct range of activity.

---

## Step 5: L1 Verification

L1 nodes receive the transaction and verify it. This is the moment where the system's efficiency advantage becomes concrete: verification is a lightweight, constant-time operation.

### What L1 Nodes Do

1. **Check the ZK proof**: validate the cryptographic proof against the claimed state commitment. This is a mathematical verification -- either the proof is valid or it is not. There is no re-execution of the original computation.
2. **Verify the state commitment**: confirm that the new state root is consistent with the previous anchored state and the claimed transitions.
3. **Check account access**: ensure the transaction only touches accounts declared in its read/write sets.
4. **Resolve ordering**: DagKnight determines the final ordering of the transaction relative to other transactions in the BlockDAG.

### What L1 Nodes Do NOT Do

- They do not execute the vProg's logic
- They do not store or process the full computation trace
- They do not run a virtual machine
- They do not need specialized hardware

This is why vProgs maintain decentralization as they scale. Adding more applications and more throughput does not increase the computational burden on L1 nodes.

### Cross-vProg Verification (Synchronous Composability)

When a transaction depends on state from another vProg, the concise witness mechanism comes into play:

1. `vProg_A` needs to read a value from `vProg_B`
2. `vProg_B` provides a **concise witness** -- a Merkle inclusion proof showing that a specific account held a specific value at a specific point in `vProg_B`'s state commitment chain
3. The L1 transaction includes this witness
4. Verification confirms: the witness is valid, the state read was correct, and the dependent operation in `vProg_A` was computed correctly

All of this happens within a single L1 transaction. There is no bridge, no waiting for separate finality, and no trust assumption beyond the cryptographic proof.

### Example: Atomic DeFi Operation

```
Goal: Borrow USDT from a lending vProg, swap for KAS on a DEX vProg, stake on a yield vProg

1. Lending vProg provides concise witness of available collateral
2. DEX vProg provides concise witness of current price
3. Off-chain prover executes all three operations as one combined computation
4. Single ZK proof covers the entire flow
5. One atomic L1 transaction submits the proof
6. L1 verifies the proof and all witnesses
7. Either all three operations succeed, or none do
```

---

## Step 6: Finalization

Once L1 nodes verify the proof, the state transition is finalized through DagKnight consensus.

### DagKnight Finality

DagKnight provides near-instant finality for the BlockDAG:

- Blocks are ordered with high precision through parameterless adaptive consensus
- Finality is achieved in seconds, not minutes or hours
- Once finalized, the state commitment is permanent and irreversible

### State Update

After finalization:

- The vProg's state commitment is updated to reflect the new Merkle root
- The affected accounts now hold their new values
- The lane's tip hash in the sequencing commitment is updated
- Other vProgs can immediately compose with the new state via concise witnesses

### What Finality Means

A finalized vProg state transition has the following guarantees:

- **Correctness**: the computation was verified by ZK proof (cryptographic certainty)
- **Ordering**: the transaction's position in the global sequence is determined by PoW consensus (not a trusted sequencer)
- **Permanence**: the state change is recorded in the BlockDAG and cannot be reversed
- **Availability**: the state commitment is part of the L1 chain and accessible to all participants

---

## The Complete Flow (Diagram)

```
                     Off-Chain                           On-Chain (L1)
                 +-----------------+              +------------------------+
                 |                 |              |                        |
  User defines   |  Prover loads   |  Proof +     |  L1 nodes verify       |
  state change   |  state, runs    |  state       |  proof, update         |
  (accounts,     |  vProg logic,   |  commitment  |  state commitment,     |
   inputs,       |  generates ZK   |  submitted   |  DagKnight finalizes   |
   operations)   |  proof          |  to BlockDAG |                        |
                 |                 |              |                        |
       |         +--------+--------+              +----------+-------------+
       |                  |                                   |
       v                  v                                   v
    [Define]    [Execute + Prove]                     [Verify + Finalize]
       |                  |                                   |
       |                  |                                   |
       +---- Step 1 ------+---- Steps 2-4 ------- Steps 5-6 -+
```

---

## Resource Management

Each vProg manages its own resources independently:

### Gas Scales

Each vProg defines custom gas pricing for operations within its domain. A computationally intensive DeFi protocol might charge more gas per operation than a simple token transfer program. This is set by the vProg deployer, not by the network.

### STORM Constants

STORM (State and Throughput Optimal Resource Management) constants regulate:

- How fast the vProg's state can grow
- Maximum throughput per time period
- Storage requirements and costs

These parameters prevent any single vProg from consuming disproportionate network resources.

### Storage Costs

Transactions that require permanent state storage must pay according to the vProg's defined storage pricing. This internalizes the cost of state growth to the programs and users that cause it.

---

## Next Steps

- [What Are vProgs?](/learn/what-are-vprogs) -- Architecture pillars and design principles
- [Why vProgs?](/learn/why-vprogs) -- The strategic rationale
- [vProgs Compared](/learn/compared) -- How this compares to other platforms
- [Glossary](/learn/glossary) -- Key terms and definitions
