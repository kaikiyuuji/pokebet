# Pokémon Battle Bets

## Visão geral da arquitetura

Aplicação web com backend Laravel responsável por autenticação, economia interna, coleção de Pokémon, loja, importação de dados da PokéAPI e simulação das batalhas.

O frontend consome o backend via Inertia.js + React. A batalha é simulada no servidor, salva em logs e exibida ao usuário como replay/resultado. A PokéAPI deve ser usada apenas para importar dados para o banco local, nunca como dependência em tempo real durante uma batalha.

## Stack tecnológico

| Camada | Tecnologia |
|--------|-----------|
| Backend | Laravel 13 / PHP 8.3+ |
| Frontend | React 18 + Inertia.js |
| Banco de dados | PostgreSQL |
| Cache / Fila | Redis |
| Autenticação | Laravel Breeze (Inertia) |
| Dados externos | PokéAPI v2 (import only) |

## Estrutura de diretórios relevantes

```
app/
  Game/
    Battle/         # BattleSimulator, DamageCalculator, MoveSelector, LevelGenerator, EffectivenessCalculator
    Pokemon/        # PokemonRepository, PokemonImporter
    Economy/        # CoinService
  Actions/
    Battles/        # CreateBattleAction, SimulateBattleAction, ApplyBattleRewardsAction
    Pokemon/        # BuyPokemonAction
    Economy/        # AddCoinsAction, DeductCoinsAction
  Models/           # User, Pokemon, PokemonType, Move, Battle, BattleTurn, CoinTransaction
docs/
  research/         # Research por feature
  prd/              # PRDs por feature
  qa/               # Planos de QA por feature
prototypes/         # Protótipos isolados de lógica
```

## Variáveis de ambiente importantes

Definidas em `.env.example`. Copiar para `.env` e ajustar:

```bash
cp .env.example .env
php artisan key:generate
```

Configurar banco PostgreSQL:
```
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=pokebet
DB_USERNAME=postgres
DB_PASSWORD=
```

## Comandos de desenvolvimento

```bash
# Instalar dependências
composer install
npm install

# Banco
php artisan migrate
php artisan db:seed

# Dev server
composer run dev        # Laravel + Vite concurrent
# ou separado:
php artisan serve
npm run dev

# Testes
php artisan test
```

## Regras críticas

1. **Sem PokéAPI em runtime** — importar tudo para o banco local. Usar Jobs para importação.
2. **Golpes da tabela `pokemon_moves`** — nunca sortear golpes globalmente.
3. **Garantir ao menos 1 golpe de dano** — separar damage moves de status moves no `MoveSelector`.
4. **Sprites com fallback** — ordem: `sprite_official` → `sprite_home` → `sprite_front` → placeholder.
5. **Batalhas auditáveis** — salvar cada turno em `battle_turns` com `random_seed` na batalha.
6. **Moedas só no backend** — nunca aceitar valor de recompensa vindo do frontend. Sempre dentro de `DB::transaction`.
7. **Controllers sem regra de negócio** — usar Actions e Services.

## Design patterns

- **Action Pattern** — casos de uso (`CreateBattleAction`, `BuyPokemonAction`)
- **Service Layer** — lógica reutilizável (`DamageCalculator`, `CoinService`)
- **Strategy** — fórmulas variáveis (`EffectivenessCalculator`)
- **Event-driven** — efeitos secundários (ranking, conquistas, notificações)

## Common hurdles

| Problema | Solução |
|----------|---------|
| Dependência PokéAPI em runtime | Jobs de importação, tudo no banco local |
| Golpes inválidos sorteados | Usar `pokemon_moves`, garantir damage move |
| Sprites nulos | Fallback em cascata no Model |
| Exploit de moedas | Recompensa calculada no servidor, `DB::transaction` |
| Batalha não auditável | `battle_turns` + `random_seed` |
| Aleatoriedade não reproduzível | Salvar seed, replay possível |
