---
layout: page
title: "Inline ZK Covenant with Noir"
section: build
description: "Write a ZK circuit in Noir, compile to Groth16, and integrate with a Kaspa covenant. Sub-second inline proofs for wallets, escrows, and payments."
---

Write a ZK circuit in Noir, compile it to a Groth16 proof, and integrate it with a Kaspa covenant. Inline ZK covenants are the simplest ZK tier -- users prove their own transactions with sub-second proof times, no prover market needed.

> **TN12 note:** This tutorial reflects the planned Tier 1 architecture (Noir/Groth16 inline covenants). The current `OpZkPrecompile` on TN12 supports RISC Zero proofs (tags `0x20`/`0x21`). Native Noir proof verification is a planned addition. To use ZK covenants on TN12 today, see the [Kaspa Chess example](/build/chess) which uses RISC Zero directly, or wrap a Noir circuit inside a RISC Zero guest program.

---

## Overview

Inline ZK covenants combine Silverscript's covenant model with Noir's ZK circuit language:

| Property | Value |
|----------|-------|
| **ZK Backend** | Noir / Groth16 |
| **Proof Time** | ~1 second (mobile), ~6 seconds (mobile web) |
| **Proof Size** | Tiny (Groth16) |
| **Use Cases** | Wallets, payment channels, escrows, threshold spending |
| **Prover** | User proves their own transaction -- no prover market |

The flow: write a Noir circuit that encodes your transition logic, compile it, and reference the verification key in a KIP-16 covenant. When spending, the user generates a proof locally and includes it in the transaction.

---

## Prerequisites

- Completed [Create a Native Asset](/build/tutorials/native-asset)
- Noir compiler installed (see [noir-lang.org](https://noir-lang.org))
- Familiarity with basic ZK concepts (proofs, circuits, witnesses)

### Install Noir

```bash
curl -L https://raw.githubusercontent.com/noir-lang/noirup/main/install | bash
noirup
nargo --version
```

---

## What You Will Build

A **private threshold check** covenant: prove that a secret value exceeds a threshold without revealing the value. This is useful for compliance checks, credit scoring, or conditional access.

---

## Step 1: Write the Noir Circuit

Create a new Noir project:

```bash
nargo new threshold_check
cd threshold_check
```

Edit `src/main.nr`:

```noir
// Prove that a private value exceeds a public threshold
// without revealing the value itself.

fn main(
    // Private inputs (known only to the prover)
    secret_value: Field,
    blinding_factor: Field,

    // Public inputs (visible on-chain)
    threshold: pub Field,
    commitment: pub Field,
) {
    // 1. Verify the commitment binds to the secret value
    //    commitment = hash(secret_value, blinding_factor)
    let computed_commitment = std::hash::pedersen_hash(
        [secret_value, blinding_factor]
    );
    assert(commitment == computed_commitment);

    // 2. Verify the secret value exceeds the threshold
    //    This comparison is done inside the circuit --
    //    the verifier learns nothing about secret_value
    //    except that it is >= threshold.
    assert(secret_value as u64 >= threshold as u64);
}
```

### Compile the circuit

```bash
nargo compile
```

This produces an ACIR (Abstract Circuit Intermediate Representation) artifact in `target/threshold_check.json`.

---

## Step 2: Generate the Verification Key

```bash
# Generate proving and verification keys
nargo codegen-verifier

# The verification key is what goes on-chain
# It is stored in target/vk.bin
```

The verification key is a compact representation of the circuit that L1 uses to check proofs. It is constant-size regardless of circuit complexity.

---

## Step 3: Write the Covenant

The covenant references the verification key and uses KIP-16's ZK verification opcodes to check the proof on-chain.

```
pragma silverscript ^0.1.0;

// Threshold check covenant
// Funds can only be spent if the spender proves knowledge of a
// secret value exceeding the threshold, verified via ZK proof.
contract ThresholdGate(
    pubkey owner,
    int threshold,
    bytes verificationKey
) {
    entrypoint function spend(
        sig ownerSig,
        bytes proof,
        bytes32 commitment
    ) {
        // 1. Verify owner signature
        require(checkSig(ownerSig, owner));

        // 2. Construct public inputs for ZK verification
        //    Public inputs: [threshold, commitment]
        bytes publicInputs = encodePublicInputs(threshold, commitment);

        // 3. Verify the ZK proof on-chain (KIP-16)
        //    This opcode validates the Groth16 proof against
        //    the verification key and public inputs.
        //    L1 checks the proof cryptographically -- it never
        //    learns the secret value.
        require(zkVerify(verificationKey, proof, publicInputs));
    }
}
```

> **Note:** The `zkVerify` function maps to KIP-16's ZK verification opcodes. The exact opcode interface is being finalized for the Covenants++ hard fork.

---

## Step 4: Generate a Proof (Client Side)

The user generates a proof locally before submitting the transaction:

```rust
// [Coming Soon] -- Client-side proving API

use noir_rs::{ProverClient, ProofInputs};

fn generate_threshold_proof(
    secret_value: u64,
    blinding_factor: [u8; 32],
    threshold: u64,
) -> Result<(Vec<u8>, [u8; 32]), ProvingError> {
    // 1. Compute the commitment
    let commitment = pedersen_hash(secret_value, blinding_factor);

    // 2. Set up prover inputs
    let inputs = ProofInputs::new()
        .private("secret_value", secret_value)
        .private("blinding_factor", blinding_factor)
        .public("threshold", threshold)
        .public("commitment", commitment);

    // 3. Generate the proof (~1 second on mobile)
    let client = ProverClient::new("target/threshold_check.json")?;
    let proof = client.prove(inputs)?;

    Ok((proof, commitment))
}
```

---

## Step 5: Submit the Transaction

Combine the proof with a standard Kaspa transaction that spends the covenant UTXO:

```rust
// [Coming Soon] -- Transaction submission API

async fn spend_with_proof(
    client: &KaspaClient,
    utxo: &Utxo,
    proof: Vec<u8>,
    commitment: [u8; 32],
    owner_key: &PrivateKey,
) -> Result<TxId, SubmitError> {
    // 1. Sign the transaction
    let sig = owner_key.sign(&utxo.tx_id);

    // 2. Build the script sig with proof data
    //    The script sig contains: [signature, proof, commitment]
    let script_sig = build_script_sig(sig, proof, commitment);

    // 3. Create and submit the transaction
    let tx = Transaction::new()
        .add_input(utxo, script_sig)
        .add_output(destination, amount)
        .build();

    let tx_id = client.submit_transaction(tx).await?;
    Ok(tx_id)
}
```

---

## Step 6: Verify On-Chain

When the transaction reaches L1, the script engine:

1. Pops the signature, proof, and commitment from the stack
2. Verifies the owner's signature via `checkSig`
3. Calls the KIP-16 ZK verification opcode with the proof, verification key, and public inputs
4. If the proof is valid, the script succeeds and the UTXO is spent

The entire verification takes milliseconds on L1 -- only the proof generation (done by the user) takes ~1 second.

---

## ZK Tiers Reference

| Tier | Backend | Proof Time | When to Use |
|------|---------|------------|-------------|
| **Inline** (this tutorial) | Noir / Groth16 | ~1s mobile | Small contracts, wallets, simple covenants |
| **Based apps** | RISC Zero / SP1 | 10-30s | DeFi protocols, DAOs, complex state machines |
| **Based rollups** | Cairo | Longer | Meta-apps with user-defined logic |

Inline ZK covenants are the right choice when:
- The circuit is simple enough for per-transaction proving
- Users should prove their own transactions (no prover market)
- Sub-second proof times are required (mobile, web)

---

## Practical Considerations

**Circuit size:** Noir circuits for inline covenants should be small. Complex logic is better suited to the based ZK app tier (RISC Zero / SP1).

**Verification key size:** The verification key is stored in the covenant's constructor parameters. Groth16 keys are compact (a few hundred bytes).

**Blake3 vs Blake2b:** If your circuit needs to hash data that L1 also hashes, be aware that Kaspa uses Blake2b natively but Blake3 for sequencing commitments. Blake3 is ZK-friendlier in RISC Zero/SP1 but more expensive in Cairo.

---

## Next Steps

- **[Build a Vault with Silverscript](/build/tutorials/silverscript-vault)** -- Full Silverscript contract walkthrough
- **[Cross-vProg Transaction](/build/tutorials/cross-vprog)** -- Compose multiple vProgs atomically (Phase 2)
- **[Silverscript Reference](/build/silverscript-reference)** -- Covenant macros and binding modes
