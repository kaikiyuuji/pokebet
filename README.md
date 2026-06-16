# Pokémon Battle Bets

A web application where users choose Pokémon, simulate battles on the server, and earn coins to expand their collection.

## Stack

- **Backend:** Laravel 13 / PHP 8.3+
- **Frontend:** React 18 + Inertia.js + Tailwind CSS
- **Database:** PostgreSQL
- **Cache / Queue:** Redis
- **Auth:** Laravel Breeze

## Quick start

```bash
# 1. Install dependencies
composer install
npm install

# 2. Environment
cp .env.example .env
php artisan key:generate

# 3. Configure .env with your PostgreSQL credentials, then:
php artisan migrate

# 4. Dev server (Laravel + Vite + Queue + Logs)
composer run dev
```

## Project structure

```
app/
  Game/
    Battle/     # BattleSimulator, DamageCalculator, MoveSelector, LevelGenerator
    Pokemon/    # Importers, repositories
    Economy/    # CoinService
  Actions/      # Use-case actions (CreateBattle, BuyPokemon, etc.)
  Models/       # Eloquent models
docs/
  research/     # Technical research per feature
  prd/          # Product requirement docs
  qa/           # QA plans
  workflow.md   # Development workflow
```

See [CLAUDE.md](CLAUDE.md) for architecture rules, critical constraints and design patterns.
