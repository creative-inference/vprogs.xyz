---
layout: page
title: "Gas and Resource Economics"
section: research
---

This document describes the gas model and resource economics for vProgs on Kaspa. The system uses Weighted Area gas functions, STORM-based autonomous resource regulation, and parallelism-aware pricing to create an efficient fee market that incentivizes frequent proof submission, efficient cross-vProg interaction patterns, and sustainable state growth.

The gas model is tightly coupled to the [Formal Computation Model](/research/formal-model) --- scope size determines proving cost, and the [phase transition threshold](/research/formal-model#scalability-analysis) imposes structural constraints on proof frequency.

---

## Design Objectives

The gas model must simultaneously achieve several goals:

1. **Accurate cost reflection.** Gas prices must reflect the actual computational and storage costs imposed on the network
2. **Parallelism incentivization.** Transactions that can be processed in parallel should cost less than those creating sequential dependencies
3. **Scope management.** Economic incentives must keep proof epochs below the Erdos-Renyi phase transition threshold
4. **Sovereignty preservation.** Each vProg must retain control over its own resource budget and pricing
5. **Abuse prevention.** Cross-vProg interactions must be priced to prevent one program from imposing unbounded costs on another

---

## Weighted Area Gas Functions

### Formulation

The core gas function decomposes transaction cost into sequential and parallel components:

```
gas(x) = w_seq * C_seq(x) + w_par * C_par(x)
```

| Component | Symbol | Description |
|-----------|--------|-------------|
| Sequential cost | `C_seq(x)` | Computation creating serial dependencies in the execution trace |
| Parallel cost | `C_par(x)` | Computation that can be distributed across provers |
| Sequential weight | `w_seq` | Multiplier for sequential work (higher) |
| Parallel weight | `w_par` | Multiplier for parallel work (lower) |

The key insight is that `w_seq > w_par`. Sequential computation is structurally more expensive because it:

- Blocks other transactions from executing
- Increases the critical path length of the proving pipeline
- Creates dependencies that expand scope for future transactions

### Sequential Cost Components

Sequential costs arise from operations that create ordering dependencies:

- **Write operations.** Any account write creates a happens-before relationship with subsequent reads of that account
- **Cross-vProg writes.** Writing to an account on a target vProg inserts a dependency into the target's execution trace
- **State transition computation.** The actual execution of the vProg's state transition function `f_p`

### Parallel Cost Components

Parallel costs arise from operations that can be distributed:

- **Witness verification.** Checking Merkle inclusion proofs against state commitments
- **Scope computation.** Traversing the computation DAG to determine the transaction's scope
- **Read operations.** Pure reads do not create sequential dependencies (though they contribute to scope)
- **Proof generation overhead.** The marginal cost of including a transaction in a proof batch

### Practical Implications

This pricing structure creates clear behavioral incentives:

| Transaction pattern | Gas cost | Incentive |
|--------------------|---------|-----------|
| Read many, write few | Low | Encouraged --- maximizes parallelism |
| Read few, write many | High | Discouraged --- creates serial bottlenecks |
| Single-vProg transaction | Lowest | Optimal --- no cross-vProg overhead |
| Cross-vProg read-only | Moderate | Acceptable --- witnesses are parallelizable |
| Cross-vProg read-write | Highest | Priced to reflect full externality |

---

## STORM Constants

### Autonomous Resource Regulation

STORM (State Transition Overhead Regulation Mechanism) constants govern per-vProg resource bounds. Each vProg defines its own STORM parameters:

| STORM parameter | Controls | Purpose |
|----------------|----------|---------|
| `STORM_throughput` | Maximum transactions per epoch | Prevents throughput abuse |
| `STORM_state_size` | Maximum account state growth per epoch | Bounds state bloat |
| `STORM_scope_limit` | Maximum allowable scope size | Caps proving cost |
| `STORM_gas_scale` | Base gas unit pricing | vProg-specific cost calibration |

### Per-vProg Sovereignty

STORM constants are set by the vProg itself, not by a global parameter:

- A compute-intensive vProg (e.g., a ZK rollup) can set high `STORM_throughput` and `STORM_scope_limit` while charging proportionally higher gas
- A simple token program can set conservative limits and offer low gas costs
- vProgs compete on the quality of their resource management --- poorly configured STORM constants lead to expensive or unresponsive programs

### Dynamic Adjustment

STORM constants can be updated through the vProg's own governance mechanism. The L1 covenant enforces that updates follow the vProg's declared update logic, preventing unilateral changes by any single party.

---

## Scope-Based Pricing

### The Scope-Cost Relationship

The [Formal Model](/research/formal-model) establishes that scope size determines proving cost. The gas model must translate this into transaction pricing:

```
scope_gas(x) = base_cost + marginal_cost * |scope(x)|
```

where:

- `base_cost` covers fixed overhead (transaction validation, state reads)
- `marginal_cost * |scope(x)|` covers the incremental proving work

### Proof Frequency and Transaction Cost

The relationship between proof frequency and per-transaction cost is fundamental:

```
Average scope size ~ F * lambda_p
```

where `F` is the proof epoch length and `lambda_p` is the transaction arrival rate for vProg `p`.

| Proof frequency | Avg scope | Avg gas cost | Prover revenue |
|----------------|----------|-------------|----------------|
| Every block | ~1 transaction | Minimal | Low per-proof |
| Every 10 blocks | ~10 transactions | Moderate | Moderate |
| Every 100 blocks | ~100 transactions | High | High per-proof |

The gas model creates a natural equilibrium: provers submit proofs when the accumulated scope (and thus accumulated gas) justifies the proving cost. More transactions per epoch means more gas revenue per proof, but also more computation per proof.

### Cross-vProg Scope Expansion

When transaction `x` in vProg A reads from vProg B, the scope of `x` may expand to include state transitions in vProg B (back to B's last anchor point). This expanded scope must be reflected in the gas cost:

```
cross_scope_gas(x) = scope_gas_A(x) + sum over B in reads(x): witness_verification_cost(B)
```

The cross-scope cost incentivizes:

- Reading from vProgs with recent proofs (small scope contribution)
- Minimizing the number of cross-vProg reads per transaction
- CAD establishment for frequently accessed vProg pairs

---

## Parallelism Pricing

### The Parallelism Advantage

Because vProgs declare read/write sets upfront, the scheduler can identify non-conflicting transactions and process them in parallel. The gas model rewards this:

- Transactions touching disjoint account sets can be processed concurrently
- The marginal cost of a parallelizable transaction approaches `C_par` (lower weight)
- The marginal cost of a serialized transaction is `C_seq` (higher weight)

### Conflict Detection

Two transactions `x_1` and `x_2` conflict if:

```
w(x_1) intersect r(x_2) != {} OR r(x_1) intersect w(x_2) != {} OR w(x_1) intersect w(x_2) != {}
```

Non-conflicting transactions receive the parallelism discount. The scheduler determines conflict status based on declared sets before execution.

### Batch Pricing

When multiple transactions are batched into a single proof:

```
batch_gas = sum of parallel_gas(x_i) + serialization_penalty(conflicts)
```

The serialization penalty is the additional cost imposed by transactions that force sequential execution within the batch.

---

## Fee Market Design

### Local Fee Markets

Each vProg operates its own local fee market:

- Gas prices are denominated in KAS
- Supply: the vProg's STORM-bounded throughput capacity
- Demand: incoming transactions seeking inclusion
- Price discovery: competitive bidding for limited capacity

### No Global Gas Limit

Unlike monolithic blockchains with a single global gas limit, vProgs have independent resource budgets. This means:

- High demand for vProg A does not increase costs for vProg B
- Each vProg's fee market operates independently
- Total system throughput scales with the number of vProgs
- No "gas wars" across unrelated applications

### Cross-vProg Fee Distribution

When a transaction spans multiple vProgs:

- **Reading vProg** pays gas to its own vProg for execution
- **Target vProg** (being read from) receives compensation for witness infrastructure
- **Written vProg** receives gas for the scope expansion and state mutation

Fee distribution is enforced by the L1 covenant --- the transaction structure must include appropriate gas payments to all involved vProgs.

---

## Economic Incentive Alignment

### Prover Economics

Provers are economically motivated to submit proofs when:

```
accumulated_gas_revenue(epoch) > proving_cost(epoch)
```

This creates a natural equilibrium:

- More transactions accumulate more gas, attracting prover attention
- Proving cost increases with scope size, setting a ceiling on epoch length
- Competition among provers drives down fees toward marginal cost
- The Erdos-Renyi phase transition provides a hard ceiling --- epochs longer than `N/q` are not just expensive but structurally infeasible

### User Economics

Users face predictable costs:

- Gas is denominated per vProg, so costs are transparent
- Cross-vProg transactions are more expensive (reflecting true cost) but not prohibitively so
- Users can minimize costs by batching operations and choosing vProgs with recent proofs

### vProg Operator Economics

vProg operators (deployers/governance participants) balance:

- Setting STORM constants high enough for usability
- Setting STORM constants low enough to keep proving costs manageable
- Attracting provers through sustainable fee levels
- Competing with other vProgs for user adoption

---

## Connection to Scalability Bounds

The gas model is fundamentally constrained by the [Erdos-Renyi phase transition](/research/formal-model#scalability-analysis):

```
F < N / q
```

The gas model must price transactions such that the economic equilibrium epoch length `F*` satisfies this bound. If gas prices are too low, provers delay proofs (increasing `F`), scope grows, and the system approaches the phase transition. If gas prices are too high, transactions become prohibitively expensive and the system underutilizes capacity.

The STORM constants and Weighted Area functions together calibrate this equilibrium, with each vProg tuning its parameters to its specific workload characteristics.

---

## References

- [Formal Computation Model](/research/formal-model) -- scope, anchoring, and phase transition analysis
- [Composability Architecture Proposal](/research/composability-proposal) -- CAD mechanism and externality analysis
- [Security Model](/research/security-model) -- economic attack surfaces
- [Concrete proposal for synchronously composable vProgs](https://research.kas.pa/t/concrete-proposal-for-a-synchronously-composable-verifiable-programs-architecture/387) -- Kaspa Research Forum
