---
layout: page
title: "Example Projects"
section: build
description: "Reference implementations for vProgs and Silverscript on Kaspa. DEX, lending, stablecoin, and DAO examples with architecture overviews and key files."
---

Reference implementations demonstrating common patterns for vProgs and Silverscript development. Each example includes a description, architecture overview, and key file listing.

> **Note:** These examples are forward-looking reference designs based on the vProgs architecture. Implementations will be refined as the SDK matures. Examples marked [Coming Soon] depend on tooling not yet available.

---

## 1. Decentralized Exchange (DEX)

A constant-product AMM (Automated Market Maker) built as a vProg with Silverscript covenants for liquidity pool management.

**Architecture:**

- **vProg:** Manages pool state (reserves, LP shares, fee accrual) off-chain with ZK-proven transitions
- **Covenants:** Silverscript covenants enforce deposit/withdrawal rules on L1 UTXOs
- **ZK Backend:** RISC Zero (based ZK app tier, 10-30s proving)

**Key files:**

```
dex-vprog/
  src/
    lib.rs                  # Pool state schema and transition logic
    pool.rs                 # Constant-product AMM math (x * y = k)
    lp_token.rs             # Liquidity provider token accounting
    fees.rs                 # Fee calculation and distribution
  covenants/
    liquidity_pool.ss       # Silverscript: deposit/withdraw LP rules
    swap_order.ss           # Silverscript: swap execution covenant
  tests/
    pool_tests.rs           # AMM invariant tests
    integration.rs          # Full swap lifecycle test
```

**Core transition logic:**

```rust
pub fn swap(
    pool: &PoolState,
    input_token: Token,
    input_amount: u64,
    min_output: u64,
) -> Result<(PoolState, u64), SwapError> {
    let fee = input_amount * pool.fee_bps / 10_000;
    let input_after_fee = input_amount - fee;

    // Constant product: x * y = k
    let (reserve_in, reserve_out) = pool.reserves(input_token);
    let output = (reserve_out * input_after_fee) / (reserve_in + input_after_fee);

    if output < min_output {
        return Err(SwapError::SlippageExceeded);
    }

    Ok((pool.apply_swap(input_token, input_amount, output, fee), output))
}
```

---

## 2. Multi-Sig Wallet

An M-of-N multi-signature wallet using Silverscript covenants for spending authorization.

**Architecture:**

- **Pure Silverscript:** No vProg needed -- covenant logic handles all authorization
- **Pattern:** N:M covenant (multiple signers, flexible output structure)
- **Use case:** Treasury management, shared custody

**Key files:**

```
multisig-wallet/
  covenants/
    multisig.ss             # Main multi-sig covenant
    recovery.ss             # Time-locked recovery path
  scripts/
    deploy.sh               # Deployment script
  tests/
    signing_tests.rs        # Threshold signature tests
```

**Silverscript contract:**

```
pragma silverscript ^0.1.0;

contract MultiSig(
    pubkey[5] signers,      // Up to 5 signers
    int threshold            // M-of-N threshold
) {
    entrypoint function spend(sig[] signatures, int[] signerIndices) {
        // Verify at least M valid signatures
        require(signatures.length >= threshold);

        for (i, 0, signatures.length, 5) {
            int idx = signerIndices[i];
            require(idx >= 0);
            require(idx < 5);
            require(checkSig(signatures[i], signers[idx]));
        }
    }

    // Emergency recovery after 90 days with any single signer
    entrypoint function emergencyRecover(sig singleSig, int signerIdx) {
        require(this.age >= 90 days);
        require(signerIdx >= 0);
        require(signerIdx < 5);
        require(checkSig(singleSig, signers[signerIdx]));
    }
}
```

---

## 3. Dutch Auction

A descending-price auction where the price decreases over time until a buyer accepts.

**Architecture:**

- **Silverscript covenant:** Enforces price schedule and settlement rules
- **Time-based pricing:** Uses `this.age` for price decay
- **Pattern:** 1:1 transition (auction state updates) or direct spend (purchase)

**Key files:**

```
dutch-auction/
  covenants/
    auction.ss              # Main auction covenant
    settlement.ss           # Post-auction settlement
  tests/
    price_decay_tests.rs    # Verify price schedule
```

**Silverscript contract:**

```
pragma silverscript ^0.1.0;

contract DutchAuction(
    pubkey seller,
    int startPrice,         // Starting price in sompis
    int reservePrice,       // Minimum price (floor)
    int duration,           // Auction duration in seconds
    int decayRate           // Price drop per second
) {
    // Buy at the current price
    entrypoint function buy(sig buyerSig, pubkey buyer) {
        // Calculate current price based on elapsed time
        int elapsed = this.age;
        int priceDrop = elapsed * decayRate;
        int currentPrice = startPrice - priceDrop;

        // Enforce reserve price floor
        if (currentPrice < reservePrice) {
            currentPrice = reservePrice;
        }

        // Buyer must pay at least the current price
        // First output goes to seller
        require(tx.outputs[0].value >= currentPrice);
    }

    // Seller can cancel the auction at any time
    entrypoint function cancel(sig sellerSig) {
        require(checkSig(sellerSig, seller));
    }
}
```

---

## 4. Escrow Service

A trustless escrow using covenants for conditional fund release with optional arbitration.

**Architecture:**

- **Silverscript covenant:** Three-party escrow (buyer, seller, arbiter)
- **Release conditions:** Mutual agreement or arbiter decision
- **Timeout:** Auto-refund to buyer after expiry

**Key files:**

```
escrow-service/
  covenants/
    escrow.ss               # Main escrow covenant
  tests/
    escrow_tests.rs         # Lifecycle tests (deposit, release, dispute, timeout)
```

**Silverscript contract:**

```
pragma silverscript ^0.1.0;

contract Escrow(
    pubkey buyer,
    pubkey seller,
    pubkey arbiter,
    int timeout             // Auto-refund timeout in seconds
) {
    // Seller delivers, buyer confirms release
    entrypoint function release(sig buyerSig) {
        require(checkSig(buyerSig, buyer));
        // Funds go to seller (enforced by output check)
    }

    // Buyer requests refund, seller agrees
    entrypoint function refund(sig sellerSig) {
        require(checkSig(sellerSig, seller));
        // Funds return to buyer
    }

    // Arbiter resolves a dispute
    entrypoint function arbitrate(sig arbiterSig, bool releaseToSeller) {
        require(checkSig(arbiterSig, arbiter));
        // Arbiter decides: funds go to seller or buyer
    }

    // Auto-refund after timeout
    entrypoint function timeoutRefund(sig buyerSig) {
        require(checkSig(buyerSig, buyer));
        require(this.age >= timeout);
        // Funds return to buyer after timeout
    }
}
```

---

## 5. DAO Governance

A decentralized governance system combining a vProg for proposal management with Silverscript covenants for vote-weighted treasury spending.

**Architecture:**

- **vProg:** Manages proposal state, vote tallying, and execution queue off-chain
- **Covenants:** Silverscript covenants enforce treasury spending rules based on vProg state
- **ZK Backend:** RISC Zero (aggregated vote proof)
- **Pattern:** Vote results are proven via ZK; treasury covenant checks the proof

**Key files:**

```
dao-governance/
  src/
    lib.rs                  # Governance state schema
    proposal.rs             # Proposal lifecycle (create, vote, execute)
    voting.rs               # Vote tallying and quorum logic
    treasury.rs             # Treasury allocation rules
  covenants/
    treasury.ss             # Silverscript: treasury spending covenant
    membership.ss           # Silverscript: membership token rules
  tests/
    governance_tests.rs     # Proposal lifecycle tests
    quorum_tests.rs         # Quorum and threshold tests
```

**Core governance logic:**

```rust
#[derive(BorshSerialize, BorshDeserialize)]
pub struct Proposal {
    pub id: u64,
    pub title: String,
    pub recipient: AccountId,
    pub amount: u64,
    pub votes_for: u64,
    pub votes_against: u64,
    pub deadline: u64,
    pub status: ProposalStatus,
}

pub fn tally_votes(proposal: &Proposal, quorum: u64) -> ProposalStatus {
    let total_votes = proposal.votes_for + proposal.votes_against;
    if total_votes < quorum {
        return ProposalStatus::QuorumNotReached;
    }
    if proposal.votes_for > proposal.votes_against {
        ProposalStatus::Passed
    } else {
        ProposalStatus::Rejected
    }
}
```

**Treasury covenant (Silverscript):**

```
pragma silverscript ^0.1.0;

contract Treasury(bytes verificationKey, int quorum) {
    // Execute a passed proposal by spending treasury funds
    // Requires a ZK proof that the vote tally is correct
    entrypoint function execute(
        bytes proof,
        bytes32 proposalHash,
        int amount
    ) {
        // Verify the ZK proof that the proposal passed
        bytes publicInputs = encodePublicInputs(proposalHash, amount);
        require(zkVerify(verificationKey, proof, publicInputs));

        // Output the specified amount to the proposal recipient
        require(tx.outputs[0].value == amount);
    }
}
```

---

## Running the Examples

```bash
# Clone the examples (once available)
git clone https://github.com/kaspanet/vprogs-examples.git

# Build all examples
cd vprogs-examples
cargo build --release

# Run tests for a specific example
cargo test -p dex-vprog

# Compile Silverscript covenants
silverscript compile dex-vprog/covenants/liquidity_pool.ss
```

> **[Coming Soon]** The `vprogs-examples` repository will be published as SDK tooling stabilizes.

---

## Related Resources

- **[Tutorials](/build/tutorials)** -- Step-by-step learning path
- **[Silverscript Reference](/build/silverscript-reference)** -- Language specification
- **[API Reference](/build/api-reference)** -- RPC endpoints for testing
- **[Developer Tools](/build/tools)** -- Debugging and inspection tools
