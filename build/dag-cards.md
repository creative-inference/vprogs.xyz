---
layout: page
title: "DAG Cards — Collectible Card Battler on Kaspa"
section: build
description: "Trustless collectible card game on Kaspa. Cards are covenant UTXOs. Decks are composed on-chain. Battles use KWP-5 verifiable RNG. Trade freely — no marketplace owner."
---

A collectible card battler where every card is a covenant UTXO, every battle outcome is verifiable from block hashes, and trading happens peer-to-peer with no marketplace middleman. Built on [Kaspa World Protocol](/learn/kaspa-world-protocol/).

---

## How It Works

### Cards Are UTXOs

Each card is a self-preserving covenant UTXO encoding its properties:

```
Card UTXO (80 bytes)
├── owner:     bytes32   — x-only pubkey of card holder
├── card_id:   uint16    — card template (defines art, name, base stats)
├── attack:    uint16    — attack power
├── defense:   uint16    — defense power
├── hp:        uint16    — hit points
├── element:   uint8     — fire/water/earth/air/void (affects matchups)
└── xp:        uint32    — experience from battles (enables leveling)
```

The covenant enforces: only the owner can transfer or play the card. XP can only increase. Stats can only change through valid level-up transitions.

### Decks Are Compositions

A deck isn't a separate entity — it's a set of 5 Card UTXOs the player declares as inputs to a battle transaction. The battle covenant validates:

- All 5 cards belong to the same owner
- No duplicate `card_id` in the deck
- All cards meet minimum level for the arena tier

### Battles Use KWP-5 Verifiable RNG

Combat is fully deterministic. The block hash at battle submission seeds an xorshift64 PRNG (per [KWP-5](/learn/kaspa-world-protocol/)):

```
seed = block_tip_hash at battle tx submission

Round flow (each round):
1. rng.next(2) → which player attacks first
2. rng.next(attacker.attack) + 1 → raw damage
3. Element matchup modifier applied (1.5x advantage, 0.75x disadvantage)
4. rng.next(defender.defense + 1) → block amount
5. net_damage = max(1, raw - block)
6. Repeat for second player
7. First card to 0 HP is eliminated
```

Anyone can replay the RNG from the block hash and verify every damage roll.

### Trading Is Peer-to-Peer

Card transfers are simple covenant self-transitions — the owner signs a tx that recreates the Card UTXO with a new `owner` pubkey. No marketplace contract needed. No listing fees. No platform cut.

For atomic trades (my card for your card), an ICC transaction swaps both Card UTXOs simultaneously:

```
Input 0:  [Card A — Alice's card]
Input 1:  [Card B — Bob's card]
Output 0: [Card A — now owner = Bob]
Output 1: [Card B — now owner = Alice]
```

Both sign. Both cards move. Atomic — no escrow, no trust.

---

## Entity Schema

Four entity types defined in the [KWP-2 schema](https://github.com/creative-inference/kwp):

| Entity | Description | Covenant Type |
|--------|-------------|---------------|
| **Card** | Individual card with stats and XP | Signed (owner transfer/play) |
| **Pack** | Sealed pack of 5 random cards | Public (anyone can open, RNG from block hash) |
| **Arena** | Battle session between two players | Public (timeout via `this.age`) |
| **Season** | Seasonal leaderboard tracker | Public (records wins, resets periodically) |

### Pack Opening

Packs are the minting mechanism. A Pack covenant UTXO is opened by spending it — the transaction creates 5 Card UTXOs with stats determined by KWP-5 RNG seeded from the block hash:

```
Input 0:  [Pack UTXO]  (public, anyone who owns it can open)
Output 0: [Card 1]     (stats from rng.next())
Output 1: [Card 2]
Output 2: [Card 3]
Output 3: [Card 4]
Output 4: [Card 5]
```

The rarity distribution and stat ranges are defined in the world schema — every client can independently compute what cards a pack should produce from a given block hash.

---

## What KWP Enables

| Feature | KWP Standard | How |
|---------|-------------|-----|
| Card state encoding | KWP-1 State ABI | int16/uint8 fields at known hex offsets |
| Card type identification | KWP-2 Entity Schema | `identifyEntity(scriptHex)` on any UTXO |
| Finding all your cards | KWP-3 Indexing | Query by owner pubkey across Card entity type |
| Battle turn coordination | KWP-4 Coordination | Signed messages for deck reveal + battle rounds |
| Damage rolls, pack opening | KWP-5 Verifiable RNG | xorshift64 from block hash, replayable |
| Battle ICC, trade ICC | KWP-6 Transaction Templates | Multi-input atomic swaps and battle settlement |
| Multiple cards per player | KWP-7 Collections | New: managing sets of entities owned by one key |

### New Standard Required: KWP-7 (Collections)

DAG Gate has one Player UTXO per player. DAG Cards has *many* Card UTXOs per player. This surfaces a new pattern:

- **Enumeration**: how does a client find all cards owned by a pubkey?
- **Batch operations**: how do you play 5 cards in one transaction (5 inputs)?
- **Ownership proof**: how does a battle covenant verify all 5 cards share an owner?

KWP-7 defines the collection entity pattern — entities that exist in multiples per owner, with standards for enumeration, batch input, and ownership validation.

---

## Architecture

```
┌────────────────────────────────────────────┐
│                 Kaspa L1                    │
│        Sequences + verifies proofs          │
├──────────┬──────────┬──────────┬───────────┤
│ Card     │ Pack     │ Arena    │ Season    │
│ Covenant │ Covenant │ Covenant │ Covenant  │
│          │          │          │           │
│ Owner    │ Mint via │ Battle   │ Win/loss  │
│ transfer │ RNG open │ session  │ tracking  │
│ + play   │          │ + settle │           │
└──────────┴──────────┴──────────┴───────────┘
         ▲              ▲              ▲
         │              │              │
    ┌────┴────┐   ┌─────┴────┐   ┌────┴────┐
    │ Browser │   │ Mobile   │   │ Bot     │
    │ Client  │   │ App      │   │ (auto   │
    │         │   │          │   │  play)  │
    └─────────┘   └──────────┘   └─────────┘
         All read same cards. All play same rules.
```

---

## Try It

Schema: [`schemas/dag-cards.json`](https://github.com/creative-inference/kwp) (coming soon)

Built with [Kaspa World Protocol](https://github.com/creative-inference/kwp) — bring your own frontend.
