---
layout: page
title: "Create a Native Asset"
section: build
---

Issue, transfer, and burn tokens on Kaspa using covenant primitives and Silverscript. Native assets are first-class citizens on L1, activated with the Covenants++ hard fork (May 5, 2026).

---

## Overview

Kaspa's native asset system uses **Covenant IDs** (KIP-20) to provide lineage tracking at the protocol level. Each asset is identified by a unique Covenant ID, and the protocol enforces lineage without recursive proofs.

In this tutorial, you will:

1. Define a token contract with supply rules
2. Mint tokens with a Silverscript issuance covenant
3. Transfer tokens between addresses
4. Burn tokens by consuming without continuation

---

## Prerequisites

- Completed [Your First vProg](/build/tutorials/first-vprog)
- Silverscript compiler built (see [Quickstart](/build/quickstart))
- Connected to TN12 (see [Testnet Guide](/build/testnet))

---

## Step 1: Design the Token

Define the token's properties:

| Property | Value |
|----------|-------|
| Name | TestToken |
| Symbol | TST |
| Max Supply | 1,000,000 |
| Decimals | 8 |
| Minting | Authorized by issuer pubkey |

---

## Step 2: Write the Issuance Covenant

The issuance covenant controls minting. It uses a 1:N covenant pattern: one input (the mint authority) produces N outputs (the minted tokens).

```
pragma silverscript ^0.1.0;

// Token issuance covenant
// 1:N pattern: single mint authority input -> multiple token outputs
contract TokenIssuer(
    pubkey issuer,
    int maxSupply,
    int decimals
) {
    // State tracks total minted supply
    state {
        int totalMinted;
    }

    // Mint new tokens. The issuer signs to authorize.
    // Produces one or more token outputs plus a change output
    // back to this covenant (carrying updated state).
    #[covenant(from = 1, to = N)]
    entrypoint function mint(
        State prev_state,
        State[] new_states,
        sig issuerSig,
        int[] amounts,
        bytes[] recipients
    ) {
        // Verify issuer authorization
        require(checkSig(issuerSig, issuer));

        // Calculate total minting amount
        int totalMint = 0;
        for (i, 0, amounts.length, 100) {
            totalMint = totalMint + amounts[i];
            require(amounts[i] > 0);
        }

        // Enforce supply cap
        require(prev_state.totalMinted + totalMint <= maxSupply);

        // Validate output states
        // The last output must carry the updated mint state
        State updatedMintState = State {
            totalMinted: prev_state.totalMinted + totalMint
        };

        // Verify each token output has correct amount
        for (i, 0, amounts.length, 100) {
            require(tx.outputs[i].value >= amounts[i]);
        }
    }
}
```

---

## Step 3: Write the Transfer Covenant

The transfer covenant controls how tokens move between holders. It uses a 1:1 transition pattern for simple transfers.

```
pragma silverscript ^0.1.0;

// Token transfer covenant
// Enforces that tokens can only move with holder authorization
contract TokenTransfer(pubkey holder) {

    // Transfer tokens to a new holder
    #[covenant.singleton(mode = transition)]
    entrypoint function transfer(
        State prev_state,
        pubkey newHolder,
        sig holderSig
    ) : (State new_state) {
        // Current holder must authorize the transfer
        require(checkSig(holderSig, holder));

        // The output must go to a new TokenTransfer covenant
        // with the new holder's pubkey
        // The compiler generates the validation automatically
        // in transition mode
        return prev_state;
    }

    // Split tokens across multiple outputs
    #[covenant(from = 1, to = N)]
    entrypoint function split(
        State prev_state,
        int[] amounts,
        pubkey[] newHolders,
        sig holderSig
    ) {
        require(checkSig(holderSig, holder));

        // Verify amounts sum to input value (no inflation)
        int total = 0;
        for (i, 0, amounts.length, 50) {
            total = total + amounts[i];
            require(amounts[i] > 0);
        }
        require(total == tx.inputs[this.activeInputIndex].value);

        // Validate each output
        for (i, 0, amounts.length, 50) {
            require(tx.outputs[i].value == amounts[i]);
        }
    }
}
```

---

## Step 4: Write the Burn Function

Burning tokens is achieved by spending a token UTXO without creating a covenant continuation output. The covenant must explicitly allow this.

```
pragma silverscript ^0.1.0;

contract BurnableToken(pubkey holder) {

    // Burn tokens -- spend without continuation
    entrypoint function burn(sig holderSig) {
        require(checkSig(holderSig, holder));
        // No covenant output required -- the token is destroyed
        // The value returns to the holder as plain KAS
    }
}
```

---

## Step 5: Compile and Deploy

### Compile the contracts

```bash
# Compile the issuance covenant
silverscript compile token_issuer.ss --output token_issuer.script

# Compile the transfer covenant
silverscript compile token_transfer.ss --output token_transfer.script

# Compile the burn contract
silverscript compile burnable_token.ss --output burnable_token.script
```

### Deploy to TN12

[Coming Soon] Deployment CLI is under development. The following illustrates the intended workflow:

```bash
# Deploy the issuance covenant with constructor parameters
silverscript deploy token_issuer.script \
    --param issuer=<your_pubkey> \
    --param maxSupply=100000000000000 \
    --param decimals=8 \
    --network testnet

# The deployment returns a Covenant ID (KIP-20)
# This ID uniquely identifies your token on L1
# > Covenant ID: 0xa1b2c3...
```

---

## Step 6: Mint Tokens

```bash
# [Coming Soon] -- CLI minting workflow
# Mint 1000 TST tokens to a recipient address
silverscript call token_issuer \
    --function mint \
    --amounts "[100000000000]" \
    --recipients "[kaspatest:qr...]" \
    --sign-with <issuer_key> \
    --network testnet
```

---

## Step 7: Transfer Tokens

```bash
# [Coming Soon] -- CLI transfer workflow
silverscript call token_transfer \
    --function transfer \
    --param newHolder=<recipient_pubkey> \
    --sign-with <holder_key> \
    --network testnet
```

---

## How Covenant IDs Work

KIP-20 Covenant IDs provide protocol-level lineage tracking:

```
Genesis UTXO (Covenant ID assigned at creation)
    |
    +-- Mint Output 1 (same Covenant ID, proven lineage)
    |
    +-- Mint Output 2 (same Covenant ID, proven lineage)
    |       |
    |       +-- Transfer (Covenant ID preserved)
    |
    +-- Updated Mint Authority (same Covenant ID, updated state)
```

The protocol enforces that:

- Covenant IDs are assigned at creation and propagated through transitions
- Only valid covenant scripts can produce outputs with the same Covenant ID
- No recursive lineage proofs needed -- the protocol handles it natively

---

## Key Concepts

| Concept | Description |
|---------|-------------|
| **Covenant ID** | KIP-20 native lineage identifier, assigned at UTXO creation |
| **1:N pattern** | One input produces multiple outputs (minting, distribution) |
| **1:1 transition** | Single input to single output with state update |
| **Auth binding** | Per-input authorization via `OpAuth*` opcodes |
| **State validation** | `validateOutputState()` ensures outputs carry correct state |

---

## Next Steps

- **[Build a Vault with Silverscript](/build/tutorials/silverscript-vault)** -- Time-locked custody with full Silverscript code
- **[Silverscript Reference](/build/silverscript-reference)** -- Complete language specification
- **[Inline ZK Covenant](/build/tutorials/zk-covenant)** -- Add ZK proofs to your covenants
