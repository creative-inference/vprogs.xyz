---
layout: page
title: "Silverscript Language Reference"
section: build
description: "Silverscript language reference for Kaspa covenant development. Syntax, types, opcodes, and compilation to native Kaspa Script with no VM needed."
---

Silverscript is Kaspa's high-level smart contract language. It compiles directly to native Kaspa Script -- no virtual machine, no intermediate representation. Designed for writing covenant spending conditions on L1 UTXOs.

**Repository:** [github.com/kaspanet/silverscript](https://github.com/kaspanet/silverscript)
**Status:** Experimental, TN12 only (as of March 2026)
**Language:** Rust (90.8%), WASM support planned
**License:** ISC (permissive)

---

## Architecture Context

Silverscript occupies the **local-state** layer of Kaspa's programmability stack:

| | Silverscript | vProgs |
|---|---|---|
| **State model** | Local (UTXO) | Shared (accounts) |
| **Execution** | On-chain (L1 script validation) | Off-chain (ZK proof verification) |
| **Scope** | Covenant spending conditions | Sovereign state machines |
| **Composability** | Transaction-level (inputs/outputs) | Cross-program atomic (Phase 2) |
| **Target** | Native Kaspa Script | ZK circuits |

Together they form the two-layer programmability model: Silverscript manages UTXO-level plumbing; vProgs manage application-level logic. A mature dApp will often use both.

---

## Contract Structure

Every Silverscript program defines a single contract with constructor parameters and entrypoint functions:

```
pragma silverscript ^0.1.0;

contract ContractName(param1Type param1, param2Type param2) {

    state {
        // Optional state fields
    }

    entrypoint function functionName(argType arg) {
        // Function body
    }
}
```

### Components

| Component | Required | Description |
|-----------|----------|-------------|
| `pragma` | Yes | Compiler version constraint |
| `contract` | Yes | Contract declaration with constructor parameters |
| `state` | No | Persistent state carried across UTXO transitions |
| `entrypoint` | Yes (at least one) | Functions callable when spending the UTXO |

Constructor parameters are baked into the script at deployment time. They become part of the script hash and cannot be changed after deployment.

---

## Data Types

### Scalar Types

| Type | Size | Description |
|------|------|-------------|
| `int` | 64-bit signed | Integer arithmetic (8-byte support via KIP-10) |
| `bool` | 1 bit | Boolean (`true` / `false`) |
| `string` | Variable | UTF-8 string data |
| `byte` | 1 byte | Single byte |
| `bytes` | Variable | Arbitrary byte sequence |
| `bytes20` | 20 bytes | Fixed-size byte array |
| `bytes32` | 32 bytes | Fixed-size byte array (hashes, IDs) |

### Cryptographic Types

| Type | Size | Description |
|------|------|-------------|
| `pubkey` | 32 bytes | Schnorr public key |
| `sig` | 65 bytes | Schnorr signature |
| `datasig` | 64 bytes | Data signature (non-transaction) |

### Collection Types

| Type | Description |
|------|-------------|
| `type[]` | Dynamic-length array |
| `type[N]` | Fixed-size array (N is a compile-time constant) |

### Unit Literals

**Value units:**
```
1 kas       = 100000000 sompis
1 grains    = 100 sompis
1 litras    = 1 sompi
```

**Time units:**
```
1 weeks     = 604800 seconds
1 days      = 86400 seconds
1 hours     = 3600 seconds
1 minutes   = 60 seconds
1 seconds   = 1 second
```

**Usage:**
```
require(tx.outputs[0].value >= 10 kas);
require(this.age >= 7 days);
```

---

## Operators

### Arithmetic

| Operator | Description |
|----------|-------------|
| `+` | Addition |
| `-` | Subtraction |
| `*` | Multiplication |
| `/` | Integer division |
| `%` | Modulo |

### Comparison

| Operator | Description |
|----------|-------------|
| `==` | Equal |
| `!=` | Not equal |
| `<` | Less than |
| `>` | Greater than |
| `<=` | Less than or equal |
| `>=` | Greater than or equal |

### Logical

| Operator | Description |
|----------|-------------|
| `&&` | Logical AND |
| `\|\|` | Logical OR |
| `!` | Logical NOT |

### Bitwise

| Operator | Description |
|----------|-------------|
| `&` | Bitwise AND |
| `\|` | Bitwise OR |
| `^` | Bitwise XOR |

---

## Transaction Introspection API

Contracts can inspect the spending transaction via built-in properties. These map to KIP-10 transaction introspection opcodes.

### Transaction-Level

| Expression | Returns | Opcode |
|------------|---------|--------|
| `tx.inputs.length` | Number of inputs | `OpTxInputCount` |
| `tx.outputs.length` | Number of outputs | `OpTxOutputCount` |

### Input Properties

| Expression | Returns | Opcode |
|------------|---------|--------|
| `tx.inputs[i].value` | Input value in sompis | `OpTxInputAmount` |
| `tx.inputs[i].scriptPubKey` | Input script public key | `OpTxInputSpk` |

### Output Properties

| Expression | Returns | Opcode |
|------------|---------|--------|
| `tx.outputs[i].value` | Output value in sompis | `OpTxOutputAmount` |
| `tx.outputs[i].scriptPubKey` | Output script public key | `OpTxOutputSpk` |

### Active Input Context

| Expression | Returns | Description |
|------------|---------|-------------|
| `this.activeInputIndex` | Current input index | Which input is being validated |
| `this.activeScriptPubKey` | Current script | The script being executed |
| `this.age` | UTXO age in seconds | Time since the UTXO was created |

---

## Cryptographic Primitives

| Function | Description |
|----------|-------------|
| `blake2b(data)` | BLAKE2b hash (native to Kaspa) |
| `sha256(data)` | SHA-256 hash |
| `checkSig(signature, publicKey)` | Schnorr signature verification |

**Usage:**

```
// Verify a signature
require(checkSig(ownerSig, owner));

// Hash data
bytes32 hash = blake2b(someData);

// Compare hashes
require(blake2b(preimage) == expectedHash);
```

---

## Control Flow

### Conditionals

```
if (condition) {
    // true branch
} else {
    // false branch
}
```

### Assertions

```
require(condition);
```

`require` fails the script (and therefore the transaction) if the condition is false. This is the primary mechanism for enforcing spending rules.

### Loops

```
for (i, start, end, MAX_ITERATIONS) {
    // loop body
}
```

- `i` -- loop variable
- `start` -- initial value (inclusive)
- `end` -- end value (exclusive), can be a runtime value
- `MAX_ITERATIONS` -- compile-time upper bound (the compiler unrolls to this count)

**Example:**

```
// Sum all output values (up to 10 outputs)
int total = 0;
for (i, 0, tx.outputs.length, 10) {
    total = total + tx.outputs[i].value;
}
```

The `MAX_ITERATIONS` parameter is required because Kaspa Script does not support true loops -- the compiler unrolls the loop at compile time.

---

## Covenant Declaration System

The most powerful Silverscript feature is the **covenant declaration macro system**. It generates correct covenant entrypoints automatically, providing security-by-construction.

### Declaration Patterns

#### 1:1 Transition (Singleton)

Single input, single output. The function computes the new state.

```
#[covenant.singleton(mode = transition)]
entrypoint function update(State prev_state, int delta) : (State new_state) {
    return State { counter: prev_state.counter + delta };
}
```

The compiler generates:
- Prior state reconstruction from transaction context
- Output state validation via `validateOutputState()`
- Covenant ID and lineage checks (KIP-20)

#### 1:1 Verification (Singleton)

Single input, single output. The developer validates the proposed output.

```
#[covenant.singleton(mode = verification)]
entrypoint function update(State prev_state, int newValue) {
    require(newValue > prev_state.value);
    require(tx.outputs[0].value >= tx.inputs[0].value);
}
```

#### 1:N Verification

Single input, multiple outputs. Validates a split or distribution.

```
#[covenant(from = 1, to = N)]
entrypoint function split(
    State prev_state,
    State[] new_states,
    int[] amounts
) {
    int total = 0;
    for (i, 0, amounts.length, 50) {
        total = total + amounts[i];
        require(amounts[i] > 0);
    }
    require(total == tx.inputs[this.activeInputIndex].value);
}
```

**Default binding:** Auth binding (`OpAuth*`) -- per-input authorization.

#### N:M Verification

Multiple inputs, multiple outputs. Validates complex multi-party flows.

```
#[covenant(from = N, to = M)]
entrypoint function swap(
    State[] prev_states,
    State[] new_states,
    sig[] approvals
) {
    // Validate the swap logic
    // All parties must approve
    for (i, 0, approvals.length, 10) {
        require(checkSig(approvals[i], prev_states[i].owner));
    }
}
```

**Required binding:** Cov binding (`OpCov*`) -- shared covenant context across inputs.

#### N:M Transition

Multiple inputs, multiple outputs. The function computes new states.

```
#[covenant(from = N, to = M, mode = transition)]
entrypoint function merge(
    State[] prev_states
) : (State[] new_states) {
    // Compute merged state
    // ...
}
```

### Pattern Summary

| Pattern | Inputs | Outputs | Binding | Use Case |
|---------|--------|---------|---------|----------|
| 1:1 transition | 1 | 1 | Auth | Counter, vault update |
| 1:1 verification | 1 | 1 | Auth | Conditional update |
| 1:N verification | 1 | N | Auth | Token distribution, fan-out |
| N:M verification | N | M | Cov | Swaps, merges, batch ops |
| N:M transition | N | M | Cov | Complex multi-party flows |

---

## Binding Modes

### Auth Binding (`OpAuth*`)

- Per-input authorization
- Default for 1:1 and 1:N patterns
- Each input is authorized independently
- Uses `OpAuthOutputCount`, `OpAuthOutputIndex`, etc.

### Cov Binding (`OpCov*`)

- Shared covenant context across multiple inputs
- Required for N:M patterns
- Covenant ID derived from `OpInputCovenantId`
- Uses `OpCovOutputCount`, `OpCovOutputIndex`, etc.

---

## Verification vs. Transition Mode

### Verification Mode

The developer checks that proposed outputs satisfy the contract's rules:

```
#[covenant.singleton(mode = verification)]
entrypoint function update(State prev_state, int newVal) {
    // Developer validates the output
    require(newVal > 0);
    require(tx.outputs[0].value >= 1 kas);
}
```

Use when: validation logic is simpler than computation, or when outputs are constructed externally.

### Transition Mode

The developer computes what the outputs should be; the compiler generates validation:

```
#[covenant.singleton(mode = transition)]
entrypoint function bump(State prev_state) : (State new_state) {
    // Developer computes new state
    return State { counter: prev_state.counter + 1 };
}
```

Use when: the new state is deterministically computable from the inputs and action.

---

## State Management

### Declaring State

```
state {
    int counter;
    pubkey lastSigner;
    bool isLocked;
}
```

State is serialized and carried in the UTXO's script public key. The compiler handles:
- Serialization and deserialization
- State reconstruction from prior UTXO via `readInputState()`
- State validation in outputs via `validateOutputState()`

### Accessing Prior State

In entrypoint functions with covenant declarations, the prior state is passed as the first parameter:

```
entrypoint function update(State prev_state, int delta) {
    // prev_state is automatically reconstructed from the spending UTXO
}
```

### State Transitions

In transition mode, return the new state. The compiler validates that the output UTXO carries this exact state:

```
return State { counter: prev_state.counter + delta };
```

In verification mode, manually check output properties:

```
require(tx.outputs[0].value >= minValue);
```

---

## Compiler Security Guarantees

The Silverscript compiler provides **security-by-construction** by generating:

1. **Prior state reconstruction** -- correct deserialization from transaction context
2. **Output cardinality enforcement** -- the declared pattern (1:1, 1:N, N:M) is enforced
3. **State validation** -- `validateOutputState()` ensures outputs carry correct state
4. **Covenant ID checks** -- KIP-20 lineage is verified (outputs must share the covenant ID)
5. **Binding mode enforcement** -- Auth vs. Cov opcodes are selected correctly

This eliminates entire classes of bugs that manual script writing would introduce:
- No reentrancy (UTXO consumed exactly once)
- No storage collisions (state is per-UTXO)
- No unbounded gas (scripts are bounded and deterministic)
- No lineage forgery (Covenant IDs are protocol-enforced)

---

## Compilation

### CLI

```bash
# Compile to Kaspa Script
silverscript compile contract.ss --output contract.script

# Compile with debug symbols
silverscript compile contract.ss --debug

# Check syntax without compilation
silverscript check contract.ss
```

### Output

The compiler produces native Kaspa Script that runs directly on L1. No VM, no interpreter -- the script is validated by Kaspa's consensus-level script engine.

---

## Complete Example: Mecenas (Recurring Payment)

```
pragma silverscript ^0.1.0;

// Mecenas: recurring payment contract
// Allows a patron to pay a beneficiary a fixed amount per period
contract Mecenas(
    pubkey patron,
    pubkey beneficiary,
    int paymentAmount,
    int period
) {
    state {
        int lastPaymentTime;
    }

    // Beneficiary claims a payment after the period elapses
    #[covenant.singleton(mode = transition)]
    entrypoint function claim(
        State prev_state,
        sig beneficiarySig
    ) : (State new_state) {
        require(checkSig(beneficiarySig, beneficiary));
        require(this.age >= period);

        // Ensure sufficient funds remain for the payment
        int inputValue = tx.inputs[this.activeInputIndex].value;
        require(inputValue >= paymentAmount);

        // Output must retain remaining funds minus payment
        int remaining = inputValue - paymentAmount;
        require(tx.outputs[0].value == remaining);

        return State {
            lastPaymentTime: 0
        };
    }

    // Patron can reclaim all funds at any time
    entrypoint function reclaim(sig patronSig) {
        require(checkSig(patronSig, patron));
    }
}
```

---

## Related Resources

- **[Build a Vault with Silverscript](/build/tutorials/silverscript-vault)** -- Step-by-step tutorial
- **[Create a Native Asset](/build/tutorials/native-asset)** -- Token issuance with covenants
- **[Inline ZK Covenant](/build/tutorials/zk-covenant)** -- Combining Silverscript with ZK proofs
- **[API Reference](/build/api-reference)** -- RPC endpoints for transaction submission
- **Silverscript Repository:** [github.com/kaspanet/silverscript](https://github.com/kaspanet/silverscript)
