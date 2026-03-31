---
layout: page
title: "Proof of Craft — On-Chain Crafting Economy on Kaspa"
section: build
description: "Resource gathering and crafting game on Kaspa. Materials are covenant UTXOs. Recipes are on-chain rules. Craft items, trade freely, build reputation — all verified by consensus."
---

A crafting economy where materials are covenant UTXOs, recipes are consensus-enforced rules, and the marketplace has no owner. Gather resources, combine them into items, trade with anyone, and build a crafter reputation — all on Kaspa L1. Built on [Kaspa World Protocol](/learn/kaspa-world-protocol/).

---

## How It Works

### Materials Are UTXOs

Every material in the world is a covenant UTXO:

```
Material UTXO (48 bytes)
├── owner:       bytes32  — x-only pubkey
├── material_id: uint16   — material type (iron, wood, crystal, etc.)
├── quantity:    uint32   — stack size
├── quality:     uint8    — common/uncommon/rare/epic/legendary
└── source:      uint8    — gathered/crafted/traded (provenance tracking)
```

Materials are gathered from Source covenants — shared world entities that regenerate over time using `this.age`:

```
Source UTXO (iron_mine)
├── source_type: uint16   — what material this produces
├── capacity:    uint32   — max per harvest
├── regen_rate:  uint32   — units per hour
└── last_harvest: uint32  — DAA score of last harvest

Available = min(capacity, regen_rate * (this.age / 3600))
```

Anyone can harvest — it's a public covenant. First to submit the tx gets the materials. This creates natural competition for scarce resources.

### Crafting Is Input-to-Output ICC

A recipe consumes input Material UTXOs and produces output Item UTXOs. The Recipe covenant validates the transformation:

```
Recipe: Iron Sword
  Inputs:  3x Iron (quantity >= 3) + 1x Wood (quantity >= 1)
  Output:  1x Iron Sword

Transaction:
  Input 0:  [Iron Material UTXO]      — quantity reduced by 3
  Input 1:  [Wood Material UTXO]      — quantity reduced by 1
  Input 2:  [Recipe covenant]          — validates the transformation
  Output 0: [Updated Iron UTXO]       — remaining iron (or consumed if 0)
  Output 1: [Updated Wood UTXO]       — remaining wood (or consumed if 0)
  Output 2: [Iron Sword Item UTXO]    — newly created
  Output 3: [Recipe covenant]         — self-preserving (reusable)
```

The Recipe covenant checks:
- Correct input material types and minimum quantities
- Output item matches the recipe definition
- Quality of output is determined by input quality + KWP-5 RNG
- Crafter's pubkey is recorded on the output item (provenance)

### Items Carry Provenance

Every crafted item records who made it and from what:

```
Item UTXO (72 bytes)
├── owner:       bytes32  — current holder
├── item_id:     uint16   — item type
├── quality:     uint8    — affected by material quality + crafter skill
├── crafter:     bytes32  — pubkey of who crafted it (permanent)
├── craft_score: uint16   — DAA score when crafted (timestamp)
```

The `crafter` field is immutable — set at creation, enforced by the covenant. This means:

- **Reputation is on-chain.** Filter items by crafter to see their work.
- **Provenance is verifiable.** Anyone can trace an item back to its materials.
- **Branding emerges naturally.** Good crafters become known by their pubkey.

### Trading Is Open

Like DAG Cards, trades are ICC transactions — two players swap items/materials atomically. No marketplace entity takes a cut. No listing required.

But Proof of Craft also introduces **order book covenants** — persistent buy/sell orders that anyone can fill:

```
Order UTXO (64 bytes)
├── maker:       bytes32  — who placed the order
├── offering_id: uint16   — what they're selling (item/material type)
├── wanting_id:  uint16   — what they want in return
├── price:       uint32   — quantity ratio
├── quantity:    uint32   — how many available
```

The Order covenant is public — anyone can fill it by providing the wanted materials. The ICC transaction swaps assets atomically. Partial fills are supported (quantity decreases, Order UTXO persists).

---

## Entity Schema

Six entity types:

| Entity | Description | Covenant Type |
|--------|-------------|---------------|
| **Material** | Raw resource with type, quantity, and quality | Signed (owner) |
| **Item** | Crafted item with stats and crafter provenance | Signed (owner) |
| **Source** | World resource node that regenerates over time | Public (anyone can harvest) |
| **Recipe** | Crafting rule — validates input→output transformation | Public (self-preserving) |
| **Order** | Open buy/sell order on the marketplace | Public (anyone can fill) |
| **Crafter** | Player profile with skill levels and reputation | Signed |

### Crafting Quality System

Output quality depends on inputs + RNG + crafter skill:

```
base_quality = average(input_material_qualities)
rng_bonus = rng.next(crafter_skill_level) — seeded from block hash
final_quality = min(5, base_quality + (rng_bonus > threshold ? 1 : 0))

Quality scale: 1=common, 2=uncommon, 3=rare, 4=epic, 5=legendary
```

Higher quality inputs and higher crafter skill increase the chance of upgrading quality. But there's always randomness — a novice can get lucky, a master can roll poorly.

---

## What KWP Enables

| Feature | KWP Standard | How |
|---------|-------------|-----|
| Material/item state | KWP-1 State ABI | Packed fields with type, quantity, quality |
| Entity classification | KWP-2 Entity Schema | Distinguish materials from items from orders |
| Finding materials for sale | KWP-3 Indexing | Filter Orders by `wanting_id` and `price` |
| Trade negotiation | KWP-4 Coordination | Multi-step offer/counter/accept |
| Crafting quality rolls | KWP-5 Verifiable RNG | Deterministic quality from block hash |
| Crafting ICC (3+ inputs) | KWP-6 Transaction Templates | Recipe validation with variable input count |
| Material stacks, inventory | KWP-7 Collections | Multiple materials per owner |
| Recipe definitions | KWP-9 Recipes | New: input→output transformation rules |

### New Standard Required: KWP-9 (Recipes / Transformation Rules)

Proof of Craft surfaces a pattern that doesn't exist in DAG Gate or DAG Cards: **consuming multiple input entities to produce a different output entity.**

KWP-9 defines:

- **Recipe schema** — declaring what inputs produce what outputs
- **Variable input count** — recipes with 2, 3, or N material inputs
- **Quantity validation** — checking sufficient quantities across inputs
- **Quality propagation** — how input properties affect output properties
- **Catalyst entities** — inputs that participate but aren't consumed (like the Recipe covenant itself)

This pattern applies beyond games: supply chain (raw materials → product), DeFi (collateral → loan position), and any system where entities are combined or transformed.

---

## Architecture

```
┌───────────────────────────────────────────────────┐
│                    Kaspa L1                        │
│     Materials, items, recipes, orders — all UTXOs  │
├─────────┬─────────┬─────────┬─────────┬───────────┤
│Material │ Item    │ Source  │ Recipe  │ Order     │
│ stacks  │ crafted │ regen   │ rules   │ buy/sell  │
│ + owner │ + prov  │ via age │ (perma) │ (fill)    │
└─────────┴─────────┴─────────┴─────────┴───────────┘
         ▲                         ▲
         │                         │
    ┌────┴──────────┐         ┌────┴──────────┐
    │ Crafting UI   │         │ Market        │
    │ (inventory,   │         │ Dashboard     │
    │  recipe book, │         │ (orders,      │
    │  workshop)    │         │  price charts)│
    └───────────────┘         └───────────────┘
    Same materials. Same recipes. Different workshops.
```

### Economy Without an Owner

The marketplace has no operator. Orders are covenant UTXOs that anyone can fill. Prices emerge from supply and demand — not set by an admin.

Source covenants regenerate resources on a fixed schedule (`this.age`). Scarcity is protocol-native. The world doesn't need a game master to balance the economy — the math is in the covenants.

Crafters build reputation by pubkey. Quality speaks for itself. No review system needed — just filter items by crafter and check their track record on-chain.

---

## Try It

Schema: [`schemas/proof-of-craft.json`](https://github.com/creative-inference/kwp) (coming soon)

Built with [Kaspa World Protocol](https://github.com/creative-inference/kwp) — bring your own frontend.
