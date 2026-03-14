---
layout: page
title: "Build a Vault with Silverscript"
section: build
description: "Build a time-locked vault in Silverscript on Kaspa. Covers deposits, configurable lock periods, withdrawals, and emergency recovery with full code."
---

Build a fully functional time-locked vault in Silverscript. This tutorial covers deposit, time-based locking, and withdrawal with complete code and line-by-line explanations.

---

## What You Will Build

A vault that:

1. Accepts deposits of KAS
2. Locks funds for a configurable duration
3. Allows withdrawal only after the lock period expires
4. Supports an emergency recovery path via a backup key

---

## Prerequisites

- Completed [Create a Native Asset](/build/tutorials/native-asset)
- Silverscript compiler installed (see [Quickstart](/build/quickstart))
- Connected to TN12 (see [Testnet Guide](/build/testnet))

---

## The Complete Contract

```
pragma silverscript ^0.1.0;

// Time-Locked Vault
// Deposits are locked for a specified duration. Only the owner can
// withdraw after the lock period. A backup key provides emergency
// recovery after a longer timeout.
contract Vault(
    pubkey owner,           // Primary key -- can withdraw after lockTime
    pubkey backupKey,       // Recovery key -- can withdraw after 2x lockTime
    int lockTime            // Lock duration in seconds
) {

    // State: tracks the vault's deposit history
    state {
        int depositCount;       // Number of deposits made
        int lastDepositTime;    // Timestamp of most recent deposit
    }

    // ------------------------------------------------------------------
    // Deposit: add funds to the vault
    // Uses 1:1 transition -- one input (existing vault UTXO or funding tx)
    // produces one output (updated vault UTXO with more funds)
    // ------------------------------------------------------------------
    #[covenant.singleton(mode = transition)]
    entrypoint function deposit(
        State prev_state,
        sig ownerSig
    ) : (State new_state) {
        // Only the owner can deposit (prevents griefing with dust)
        require(checkSig(ownerSig, owner));

        // Output must have at least as much value as input
        // (the difference is the deposit amount)
        require(
            tx.outputs[this.activeInputIndex].value >=
            tx.inputs[this.activeInputIndex].value
        );

        // Return updated state
        return State {
            depositCount: prev_state.depositCount + 1,
            lastDepositTime: 0  // Will be set by block timestamp
        };
    }

    // ------------------------------------------------------------------
    // Withdraw: remove funds after lock period
    // The owner can withdraw any amount after lockTime has elapsed
    // since the UTXO was created.
    // ------------------------------------------------------------------
    entrypoint function withdraw(sig ownerSig) {
        // Verify owner signature
        require(checkSig(ownerSig, owner));

        // Check that the lock period has elapsed
        // this.age returns the UTXO's age in seconds
        require(this.age >= lockTime);
    }

    // ------------------------------------------------------------------
    // Partial Withdraw: take some funds, keep the rest locked
    // Uses 1:1 transition -- produces a new vault UTXO with remaining
    // funds and a plain output for the withdrawn amount.
    // ------------------------------------------------------------------
    #[covenant.singleton(mode = verification)]
    entrypoint function partialWithdraw(
        State prev_state,
        sig ownerSig,
        int withdrawAmount
    ) {
        // Verify owner signature
        require(checkSig(ownerSig, owner));

        // Check lock period
        require(this.age >= lockTime);

        // Validate withdrawal amount
        int inputValue = tx.inputs[this.activeInputIndex].value;
        require(withdrawAmount > 0);
        require(withdrawAmount < inputValue);

        // First output: remaining funds stay in the vault
        int remaining = inputValue - withdrawAmount;
        require(tx.outputs[0].value == remaining);

        // The compiler validates that output[0] carries the
        // same covenant script with preserved state
        // (this is automatic in verification mode)

        // Second output: withdrawn funds go to a plain address
        require(tx.outputs[1].value == withdrawAmount);
    }

    // ------------------------------------------------------------------
    // Emergency Recovery: backup key can withdraw after 2x lockTime
    // This provides a safety net if the owner loses access.
    // ------------------------------------------------------------------
    entrypoint function emergencyRecover(sig backupSig) {
        // Verify backup key signature
        require(checkSig(backupSig, backupKey));

        // Require double the lock time for emergency recovery
        require(this.age >= lockTime * 2);
    }
}
```

---

## Line-by-Line Explanation

### Contract Declaration

```
contract Vault(
    pubkey owner,
    pubkey backupKey,
    int lockTime
) {
```

Constructor parameters are baked into the contract at deployment time. They become part of the script hash and cannot be changed. This means each vault instance is uniquely identified by its owner, backup key, and lock duration.

### State Declaration

```
state {
    int depositCount;
    int lastDepositTime;
}
```

State is carried forward in UTXO transitions. The Silverscript compiler generates the boilerplate to reconstruct prior state from transaction context (`readInputState()`) and validate new state in outputs (`validateOutputState()`).

### Covenant Declaration Macros

```
#[covenant.singleton(mode = transition)]
```

This macro tells the compiler:
- **singleton**: 1:1 pattern (one input, one output)
- **transition**: the function *computes* the new state (vs. *verifying* proposed state)
- The compiler generates all state reconstruction, validation, and Covenant ID checks

```
#[covenant.singleton(mode = verification)]
```

In **verification** mode, the developer manually checks that proposed outputs are correct. The compiler still generates Covenant ID enforcement and state plumbing.

### Time Lock Check

```
require(this.age >= lockTime);
```

`this.age` is a transaction introspection primitive that returns the UTXO's age in seconds. The lock time is specified in seconds using Silverscript's time unit system:

```
// These are equivalent:
int lockTime = 86400;           // Raw seconds
int lockTime = 1 days;          // Using time units
int lockTime = 24 hours;        // Using time units
```

### Value Conservation

```
require(
    tx.outputs[this.activeInputIndex].value >=
    tx.inputs[this.activeInputIndex].value
);
```

Transaction introspection lets the contract inspect input and output values, ensuring funds are not lost during transitions.

---

## Deploying the Vault

### Compile

```bash
silverscript compile vault.ss --output vault.script
```

### Deploy

[Coming Soon] Deployment CLI is under development.

```bash
# Deploy with constructor parameters
silverscript deploy vault.script \
    --param owner=<owner_pubkey> \
    --param backupKey=<backup_pubkey> \
    --param "lockTime=86400" \
    --initial-deposit 100000000 \
    --network testnet
```

### Interact

```bash
# Deposit more funds
silverscript call vault --function deposit \
    --amount 50000000 \
    --sign-with <owner_key> \
    --network testnet

# Withdraw after lock period
silverscript call vault --function withdraw \
    --sign-with <owner_key> \
    --network testnet

# Partial withdraw
silverscript call vault --function partialWithdraw \
    --param withdrawAmount=25000000 \
    --sign-with <owner_key> \
    --network testnet
```

---

## Security Properties

Silverscript's UTXO model provides inherent security guarantees:

| Property | How It Works |
|----------|-------------|
| **No reentrancy** | Each UTXO is consumed exactly once -- no shared mutable state |
| **Deterministic execution** | Validation is bounded and predictable |
| **Lineage enforcement** | KIP-20 Covenant IDs ensure only valid covenant scripts produce continuation outputs |
| **Compiler-checked transitions** | The `#[covenant]` macro generates correct state validation boilerplate |
| **Explicit state** | All state changes are visible in the transaction structure |

---

## Next Steps

- **[Inline ZK Covenant](/build/tutorials/zk-covenant)** -- Add ZK proofs to your covenants
- **[Cross-vProg Transaction](/build/tutorials/cross-vprog)** -- Compose vProgs atomically (Phase 2)
- **[Silverscript Reference](/build/silverscript-reference)** -- Full language specification
- **[Example Projects](/build/examples)** -- More complex contract patterns
