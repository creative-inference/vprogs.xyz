---
layout: page
title: "Formal Computation Model"
section: research
description: "Mathematical formalism of the vProg computation DAG on Kaspa. Covers state evolution, dependency graphs, Merkle commitments, and scalability bounds."
---

This document presents the mathematical formalism underlying the vProg computation DAG --- the directed acyclic graph structure that models state evolution, dependency formation, and proof anchoring across verifiable programs on Kaspa. The model draws on random graph theory to establish rigorous scalability bounds and uses hierarchical Merkle commitments to enable efficient cross-program state verification.

The formal model was introduced on the [Kaspa Research Forum](https://research.kas.pa/t/zoom-in-a-formal-backbone-model-for-the-vprog-computation-dag/407) and provides the theoretical backbone for the [Composability Architecture Proposal](/research/composability-proposal).

---

## Core Definitions

### The vProg Primitive

A verifiable program `p` is defined as the pair:

```
p = (f_p, S_p)
```

where:

- `f_p` is a **state transition function** defining the program's execution logic
- `S_p` is an **exclusive account set** --- the set of accounts that `p` legally owns

**Access control invariant:** Write access to any account `a in S_p` is exclusive to the owning vProg `p`. Read access is permissioned across programs, enabling composability without sovereignty violations.

This separation --- exclusive write, permissioned read --- is the foundational property that allows vProgs to operate as sovereign execution environments while remaining composable.

### Operation Sequence

The system maintains a globally ordered sequence `T` combining two types of operations:

| Operation | Symbol | Description |
|-----------|--------|-------------|
| Transaction | `x` | A state transition that reads and writes accounts |
| Proof submission | `z` | A zero-knowledge proof anchoring state to L1 |

Each transaction `x` specifies three sets:

- **Read set** `r(x)` --- accounts the transaction will read
- **Write set** `w(x)` --- accounts the transaction will modify, where `w(x) <= r(x)`
- **Witness set** `pi(x)` --- dependency resolution data (Merkle proofs of cross-vProg state)

The constraint `w(x) <= r(x)` enforces that a transaction can only write to accounts it has also read, preventing blind writes.

---

## Computation DAG Structure

### Vertices and Hyperedges

The computation DAG `G = (V, E)` is a directed hypergraph where:

- **Vertices** `v = (a, t)` represent the state of account `a` at logical time `t`
- **Hyperedges** `e = (I, O, x)` represent transactions connecting input vertices (reads) to output vertices (writes)

For a transaction `x`:

```
I(x) = { (a, t_a) : a in r(x) }     -- input vertices (read set)
O(x) = { (a, t_x) : a in w(x) }     -- output vertices (write set)
```

Dynamic dependency relationships form as transactions reference outputs of prior transactions. A dependency exists from `x_2` to `x_1` when:

```
exists a : a in r(x_2) AND a in w(x_1) AND t_{x_1} < t_{x_2}
```

### DAG Evolution

The computation DAG grows monotonically as new transactions are processed. Each transaction appends new output vertices and edges. The graph captures the complete causal history of all state transitions across all vProgs.

Without intervention, the DAG would grow unboundedly. Proof anchoring (below) provides the compression mechanism.

---

## State Compression via Proof Anchoring

### Proof Object

The proof object `z_p^i` submitted by vProg `p` for epoch `i` contains:

| Component | Symbol | Description |
|-----------|--------|-------------|
| ZK proof | `pi` | Cryptographic attestation of correct execution over the epoch |
| State commitment | `C_p^t` | Merkle root over the epoch's state history |
| Time reference | `t` | Anchoring point in the global sequence |

### Hierarchical Merkle Commitment

The state commitment `C_p^t` is structured as a Merkle tree over per-step state roots:

```
C_p^t = MerkleRoot(
  state_root_step_1,
  state_root_step_2,
  ...
  state_root_step_n
)
```

where each `state_root_step_k` is itself the root of a Merkle tree over the account states at step `k`.

This two-level structure enables:

- **Concise witnesses** --- a compact Merkle inclusion proof can attest to any account's state at any intermediate step within the epoch
- **Cross-vProg verification** --- vProg A can verify vProg B's state at a specific step using only `C_B^t` plus a logarithmic-size inclusion proof
- **Minimal L1 storage** --- only the root `C_p^t` needs to be stored on L1; the full state tree can live off-chain

### Anchor Points and Pruning

When a proof `z_p^i` is validated on L1, the corresponding commitment `C_p^t` becomes a **trustless anchor point**. All vertices in `G` that are:

1. Owned by vProg `p`, and
2. Created before time `t`, and
3. Fully subsumed by the proven state

...can be pruned from the active computation DAG. The anchor point replaces the pruned subgraph with a single verified commitment, dramatically reducing the working set of the DAG.

---

## Computational Scope

### Definition

The **scope** of a transaction `x`, denoted `scope(x)`, is the minimal set of historical vertices in the computation DAG required to validate `x`.

### Computation Algorithm

```
function ComputeScope(x, G):
    frontier = { (a, latest(a)) : a in r(x) }
    scope = {}
    while frontier is not empty:
        v = frontier.pop()
        if v is an anchor point:
            continue    // proven state; no further traversal needed
        scope = scope + {v}
        for each predecessor u of v in G:
            frontier = frontier + {u}
    return scope
```

The algorithm traverses backward from the transaction's read set through the DAG, stopping at anchor points (proven states). All vertices encountered constitute the scope.

### Scope Size and Cost

Scope size directly determines the computational cost of proof generation:

| Scope characteristic | Impact |
|---------------------|--------|
| Larger scope | More computation for ZK proof generation |
| Higher proof latency | Larger accumulated scopes between anchors |
| More frequent proofs | Smaller scopes, cheaper per-transaction cost |

This creates a natural feedback loop: the [gas economics](/research/gas-economics) of the system incentivize frequent proof submissions to keep scopes manageable.

---

## Scalability Analysis

### Erdos-Renyi Random Graph Model

The formal scalability analysis models dependency formation between vProgs using Erdos-Renyi random graph theory. During a proof epoch of length `F`, dependencies form between vProgs as transactions create cross-program reads.

The model parameters:

| Parameter | Symbol | Description |
|-----------|--------|-------------|
| Number of vProgs | `N` | Total programs in the system |
| Proof epoch length | `F` | Time between consecutive proof submissions |
| Cross-dependency rate | `q` | Average rate of cross-vProg dependencies per epoch |

### Phase Transition Threshold

The critical result is a sharp phase transition:

```
F < N / q     =>    dependencies remain manageable
F >= N / q    =>    giant component forms; scope explodes
```

**Below threshold** (`F < N/q`): The dependency graph during each epoch remains fragmented into small components. Average scope size is `O(log N)`, meaning proof generation cost grows only logarithmically with system size.

**Above threshold** (`F >= N/q`): A giant connected component emerges in the dependency graph, encompassing a constant fraction of all vProgs. Scope sizes become `O(N)`, and proof generation becomes impractical.

### Interpretation

The phase transition is analogous to percolation thresholds in random graphs. The epoch length `F` controls edge density: longer epochs accumulate more cross-program dependencies, eventually connecting the graph.

The practical constraint is:

```
F_max = N / q
```

Systems must maintain proof submission frequency such that epoch lengths stay below `F_max`. As the number of vProgs `N` grows, the maximum tolerable epoch length increases linearly --- a favorable scaling property. Conversely, higher cross-dependency rates `q` demand shorter epochs.

### Implications for System Design

1. **Proof frequency is not optional** --- it is a structural requirement for scalability
2. **Economic incentives must align** --- the [gas model](/research/gas-economics) must make frequent proving cheaper than infrequent proving
3. **Dependency rate matters** --- highly interconnected vProg ecosystems require faster proving infrastructure
4. **Scaling is favorable** --- more vProgs actually increases the system's tolerance for longer epochs

---

## Conditional Proofs

### Mechanism

A conditional proof is a ZK proof whose validity depends on the validity of a prior, potentially unverified proof:

```
proof_i = Prove(
    input: C_p^{t-1},     -- state commitment from prior epoch (may be unproven)
    execution: steps_{t-1..t},
    output: C_p^t
)
```

The proof is "conditional" because it assumes `C_p^{t-1}` is correct. If the prior proof is later invalidated, all conditional proofs building on it are also invalidated.

### Pipeline Parallelism

Conditional proofs enable pipelined proof generation:

```
Epoch 1:  [prove epoch 1         ]
Epoch 2:       [prove epoch 2 (conditional on epoch 1)    ]
Epoch 3:            [prove epoch 3 (conditional on epoch 2)    ]
```

Without conditional proofs, each epoch must wait for the prior epoch's proof to be fully verified before beginning. With conditional proofs, proving can proceed in parallel, reducing end-to-end latency from `O(n * T_prove)` to approximately `T_prove + O(n * T_step)`.

### Settlement

The chain of conditional proofs settles when the root proof (epoch 1) is verified on L1. All subsequent conditional proofs become unconditionally valid through transitivity.

---

## Key Properties

| Property | Mechanism | Consequence |
|----------|-----------|-------------|
| Exclusive write, permissioned read | Account ownership model | Sovereignty + composability |
| Hierarchical Merkle commitments | Two-level state tree | Concise cross-vProg witnesses |
| Proof anchoring | ZK proofs create anchor points | History compression, bounded scope |
| Phase transition bound | Erdos-Renyi analysis | Quantified scalability limits |
| Conditional proofs | Chained assumptions | Pipelined proof generation |

---

## References

- [Formal backbone model for the vProg computation DAG](https://research.kas.pa/t/zoom-in-a-formal-backbone-model-for-the-vprog-computation-dag/407) -- Kaspa Research Forum
- [Composability Architecture Proposal](/research/composability-proposal)
- [Gas and Resource Economics](/research/gas-economics)
- [Security Model](/research/security-model)
