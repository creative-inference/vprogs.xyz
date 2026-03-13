---
layout: page
title: "Composability Architecture Proposal"
section: research
---

This document describes the concrete architectural proposal for synchronously composable verifiable programs on Kaspa. The design establishes an account-centric execution model where sovereign vProgs interact atomically within single L1 transactions, achieving composability without sacrificing decentralization or introducing trusted intermediaries.

The proposal was published on the [Kaspa Research Forum](https://research.kas.pa/t/concrete-proposal-for-a-synchronously-composable-verifiable-programs-architecture/387) and builds on the [Formal Computation Model](/research/formal-model).

---

## Design Principles

### Account-Centric Architecture

The vProgs model adopts an account-based state representation inspired by Solana's account model:

- Each vProg owns a set of accounts and defines their state transition logic
- Transactions declare their read and write account dependencies upfront, before execution
- Upfront declaration enables parallel scheduling --- the runtime can identify non-conflicting transactions and execute them concurrently

This is a deliberate departure from the pure UTXO model at the application layer, while Kaspa's L1 remains UTXO-based. The account abstraction lives within vProg state; the L1 UTXO layer serves as the settlement and data availability substrate.

### Sovereign Execution

Each vProg operates as what the research forum describes as "practically a mini zkVM":

- Independent state commitment to L1 via its own covenant
- Permissionless prover sets --- any party can advance a vProg's state
- Mutual trustlessness between vProgs: no vProg needs to trust any other for its own correctness
- Custom execution logic defined by the vProg's state transition function

Sovereignty is enforced by the exclusive write property: only vProg `p` can modify accounts in `S_p`. Other vProgs can read (with witnesses) but never write to accounts they do not own.

### Autonomous Resource Regulation

Each vProg controls its own throughput and state growth:

- Custom gas scales per vProg --- a compute-heavy program can price gas differently than a storage-heavy one
- STORM constants regulate growth bounds (see [Gas and Resource Economics](/research/gas-economics))
- No global gas limit imposed across vProgs; each manages its own resource budget
- This prevents a single popular vProg from starving others of resources

---

## Synchronous Composability Mechanism

### Cross-vProg Transaction Flow

A cross-vProg transaction follows a strict protocol:

**Step 1: Declaration.** The transaction declares all accounts it will read and write, across all vProgs involved. This declaration is binding --- the transaction cannot access undeclared accounts.

**Step 2: Witness provision.** For each cross-vProg read (reading an account owned by a different vProg), the transaction must provide a **concise witness** --- a Merkle inclusion proof against the target vProg's state commitment `C_p^t`. This proves the account's state without requiring the reading vProg to trust the owning vProg.

**Step 3: Gas payment.** For cross-vProg writes (modifying an account on a target vProg), the transaction must pay gas to the target vProg. This compensates the target for the increased scope and proving cost.

**Step 4: Atomic execution.** All operations execute atomically. Either all reads succeed and all writes commit, or the entire transaction reverts. There is no partial execution.

### Scope Definition

The **scope** of a transaction is the set of state transitions between the current transaction and backward to the latest witness that was already ZK-proof-anchored.

Formally, for transaction `x`:

```
scope(x) = { v in G : v is reachable from r(x) by backward traversal
             AND v is not behind any anchor point }
```

Scope determines proving cost: a larger scope means the prover must re-execute more state transitions to generate the ZK proof encompassing `x`. This creates a direct economic link between proof frequency and transaction cost (see [Gas and Resource Economics](/research/gas-economics)).

### Read-Fail Handling

Two safeguards prevent failures from corrupting state:

1. **Read-before-write ordering.** Transactions must begin by reading all declared-read accounts before performing any writes. If a read fails (e.g., the witness is stale or the state has changed), the transaction reverts before any writes occur. No partial mutation is possible.

2. **Gas commitment protection.** Gas commitments are structured so that "failure to write to declared accounts" cannot create negative economic consequences for the target vProg. The gas is either consumed (on success) or refunded (on failure) in a way that leaves both parties whole.

These mechanisms are analyzed in detail in the [Security Model](/research/security-model).

---

## Validity Proofs

### Prover Model

vProgs maintain **permissionless prover sets**:

- Any party can generate and submit a validity proof for any vProg
- Provers compete on latency and cost
- No single prover has privileged access
- L1 covenants enforce proof validity --- a prover cannot submit an invalid proof regardless of their identity

This creates a competitive prover market where:

- Multiple provers can work on the same epoch in parallel
- The first valid proof submission advances the vProg's state on L1
- Economic incentives (proving fees) attract prover participation
- No single point of failure --- if one prover goes offline, others can take over

### Conditional Proofs and Pipelining

Conditional proofs (detailed in the [Formal Model](/research/formal-model)) enable pipelined proof generation:

```
Time -->
Epoch k:    [generate proof k                    ]
Epoch k+1:       [generate proof k+1 (conditional on k)     ]
Epoch k+2:            [generate proof k+2 (conditional on k+1)    ]
                                                        |
                                    Proof k verified on L1; k+1, k+2 settle
```

Key properties of pipelining:

- **Latency reduction.** End-to-end proof latency drops from serial to near-parallel
- **Throughput increase.** Multiple proving machines can work on consecutive epochs simultaneously
- **Risk management.** If a conditional proof's predecessor is invalidated, the chain of dependent proofs is also invalidated --- but this is a correctness feature, not a bug

### Proof Latency Impact on Economics

Proof latency directly impacts the [gas economics](/research/gas-economics) of the system:

| Proof latency | Epoch length | Scope size | Transaction cost |
|--------------|-------------|-----------|-----------------|
| Low (fast provers) | Short | Small | Cheap |
| High (slow provers) | Long | Large | Expensive |

This creates a natural economic incentive for faster proving infrastructure and more frequent proof submissions.

---

## Economics of Composability

### Two Externalities

Cross-vProg composability creates two distinct externalities:

**1. Witness/scope computation (parallelizable).** When a transaction reads from another vProg, the witness must be verified and the scope computed. This work can be distributed across multiple provers and parallelized, making it a manageable externality.

**2. New transaction computation (sequential).** The state transitions created by a cross-vProg write introduce sequential dependencies in the target vProg's execution trace. These dependencies cannot be parallelized and represent a genuine cost imposed on the target.

The gas model must price both externalities appropriately to prevent abuse while encouraging beneficial composability.

### Continuous Account Dependency (CAD)

For vProgs with frequent, ongoing cross-program interactions, per-transaction witness overhead becomes burdensome. The CAD mechanism addresses this:

- **Persistent dependency registration.** vProg A registers a continuous dependency on specific accounts in vProg B
- **Funded by initiator.** The initiating vProg pays an ongoing fee to maintain the dependency
- **Reduced per-transaction cost.** Once a CAD is established, individual transactions benefit from pre-computed witness infrastructure
- **Automatic scope management.** The system maintains up-to-date witnesses for CAD-linked accounts, reducing the scope computation needed per transaction

CAD is particularly valuable for DeFi composability patterns where the same pairs of vProgs interact repeatedly (e.g., a lending protocol reading price oracle state).

### Weighted Area Gas Functions

The gas model uses **Weighted Area** functions that account for parallelism opportunities:

```
gas(x) = w_seq * sequential_cost(x) + w_par * parallel_cost(x)
```

where:

- `sequential_cost(x)` reflects computation that creates sequential dependencies
- `parallel_cost(x)` reflects computation that can be distributed
- `w_seq > w_par` because sequential work is more expensive to the system

This pricing structure incentivizes transaction patterns that maximize parallelism --- transactions that read from many vProgs but write to few are cheaper than transactions that write across many vProgs.

Full gas model details are in [Gas and Resource Economics](/research/gas-economics).

---

## Phasing Strategy

The composability architecture is being deployed in phases, as outlined by Michael Sutton:

### Phase 1: Standalone vProgs (Current)

- Each vProg operates independently as a sovereign program
- No synchronous composability between vProgs
- State commitment via "degenerate" CD scheme --- grouping by programs/subnets, not accounts
- L1 has no notion of individual accounts; only aware of vProg entities through their L1 covenants
- Primary value proposition: canonical bridging of shared native assets

### Phase 2: Synchronous Composability

- Full account-level state modeling in the Computational DAG
- Cross-vProg atomic transactions enabled
- CD-based scope gas calculations
- Global vProg state index
- Transaction v2 structure with read/write declarations
- Data witness verification infrastructure

### Transition Design

The phasing strategy is designed so that vProgs deployed in Phase 1 can be upgraded to support Phase 2 composability without breaking existing functionality. The "degenerate" CD scheme is a strict subset of the full CD --- it simply lacks the account-level granularity needed for synchronous composability.

---

## Open Design Questions

Several aspects of the composability architecture remain under active research:

- **Witness storage conventions** --- transient vs. permanent storage for cross-vProg witnesses
- **vProg vetting** --- prerequisites and governance for deploying new vProgs
- **Source code enforcement** --- mechanisms for ensuring vProg code is publicly available and auditable
- **Off-chain witness broadcasting** --- gossip protocol design for efficient witness distribution

These are tracked in [Open Research Questions](/research/open-questions).

---

## References

- [Concrete proposal for synchronously composable vProgs](https://research.kas.pa/t/concrete-proposal-for-a-synchronously-composable-verifiable-programs-architecture/387) -- Kaspa Research Forum
- [Formal Computation Model](/research/formal-model)
- [Gas and Resource Economics](/research/gas-economics)
- [Security Model](/research/security-model)
- [Covenant++ milestones and vProgs directions](https://gist.github.com/michaelsutton/5bd9ab358f692ee4f54ce2842a0815d1) -- Michael Sutton
