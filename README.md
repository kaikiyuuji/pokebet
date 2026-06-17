# Pokémon Battle Bets

Web app where users pick Pokémon, place bets, simulate battles server-side, and earn or lose coins based on results.

## Stack

| Layer | Technology |
|-------|-----------|
| Backend | Laravel 13 / PHP 8.3+ |
| Frontend | React 18 + Inertia.js + Tailwind CSS |
| Database | PostgreSQL |
| Cache / Queue | Redis |
| Auth | Laravel Breeze |
| External data | PokéAPI v2 (import + runtime cache) |

## Quick start

```bash
# 1. Dependencies
composer install
npm install

# 2. Environment
cp .env.example .env
php artisan key:generate

# 3. Configure .env with PostgreSQL credentials, then:
php artisan migrate

# 4. Dev server (Laravel + Vite concurrent)
composer run dev
```

## Game flow

1. Player selects a Pokémon from Gen 1 roster
2. Opponent is drawn via roulette (server-side random)
3. Player sets bet amount (min 10 coins)
4. Battle is simulated on the server and saved turn-by-turn
5. **Win:** player earns `bet × 0.8` coins profit
6. **Loss:** player loses the full bet
7. **Draw:** no coin change

### Level balancing

Opponent level is adjusted based on evolutionary completeness (`stage / chain_length`):

| Player Pokémon | vs Opponent | Opponent boost |
|---------------|-------------|---------------|
| Legendary (Mewtwo, birds, Mew) | Any | Player capped at Lv.50; opponent always Lv.75–100 |
| Final evo of 3-stage (Charizard) | Base of 3-stage (Bulbasaur) | +26–34 levels |
| Final evo of 3-stage | Mid of 3-stage (Ivysaur) | +11–19 levels |
| Final evo of 2-stage (Raticate) | Base of 2-stage (Rattata) | +18–26 levels |
| Standalone (Lapras, Ditto) | Standalone | Normal ±4 |

## Project structure

```
app/
  Game/
    Battle/     # BattleSimulator, DamageCalculator, MoveSelector, LevelGenerator
    Pokemon/    # PokeApiService (runtime cache), PokemonImporter
    Economy/    # CoinService
  Actions/
    Battles/    # CreateBattleAction, SimulateBattleAction, ApplyBattleRewardsAction
    Economy/    # AddCoinsAction, DeductCoinsAction
  Models/       # User, Battle, BattleTurn, CoinTransaction
database/
  migrations/
resources/js/
  Pages/Battle/ # SelectPokemon, Show, History, Log
docs/
  research/     # Technical research per feature
  prd/          # Product requirement docs
  qa/           # QA plans
```

See [CLAUDE.md](CLAUDE.md) for architecture rules, critical constraints, and design patterns.
