# Pokémon Battle Bets

Aplicação web onde o usuário escolhe um Pokémon, define uma aposta, assiste à batalha simulada no servidor e ganha ou perde moedas com base no resultado.

> Desenvolvido com pair programming ao lado do [Claude](https://claude.ai) (Anthropic) — das decisões de arquitetura até a implementação das features.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend | Laravel 13 / PHP 8.3+ |
| Frontend | React 18 + Inertia.js + Tailwind CSS |
| Banco de dados | SQLite (dev) / PostgreSQL (prod) |
| Cache / Fila | File/Sync (dev) / Redis (prod) |
| Autenticação | Laravel Breeze |
| Dados externos | PokéAPI v2 (cache local 7 dias) |

## Instalação

```bash
# 1. Dependências
composer install
npm install

# 2. Ambiente
cp .env.example .env
php artisan key:generate
```

Edite o `.env` para usar SQLite (sem precisar de PostgreSQL ou Redis):

```env
DB_CONNECTION=sqlite
SESSION_DRIVER=file
QUEUE_CONNECTION=sync
CACHE_STORE=file
```

```bash
# 3. Crie o arquivo do banco e rode as migrations
touch database/database.sqlite
php artisan migrate
```

---

### Opção A — `php artisan serve` (sem Herd)

Um único comando sobe o servidor PHP, Vite e os logs:

```bash
composer run dev
```

Acesse em `http://localhost:8000`.

---

### Opção B — Laravel Herd

1. Abra o **Herd** e adicione a pasta do projeto
2. O Herd serve automaticamente em `http://pokebet.test`
3. Suba apenas o Vite:

```bash
npm run dev
```

## Fluxo do jogo

1. Jogador seleciona um Pokémon da 1ª geração
2. Adversário é sorteado via roleta (servidor)
3. Jogador define o valor da aposta (mínimo 10 moedas)
4. Batalha é simulada no servidor e salva turno a turno
5. **Vitória:** jogador recebe `aposta × 0,8` de lucro
6. **Derrota:** jogador perde o valor apostado integralmente
7. **Empate:** sem alteração de saldo

### Balanceamento de nível

O nível do adversário é ajustado pela pontuação de completude evolutiva (`estágio / tamanho_da_cadeia`):

| Pokémon do jogador | vs Adversário | Ajuste no adversário |
|--------------------|--------------|----------------------|
| Lendário (Mewtwo, pássaros, Mew) | Qualquer | Jogador limitado ao Nv. 50; adversário sempre Nv. 75–100 |
| Evo final de cadeia 3 (Charizard) | Base de cadeia 3 (Bulbasaur) | +26–34 níveis |
| Evo final de cadeia 3 | Meio de cadeia 3 (Ivysaur) | +11–19 níveis |
| Evo final de cadeia 2 (Raticate) | Base de cadeia 2 (Rattata) | +18–26 níveis |
| Standalone (Lapras, Ditto) | Standalone | Normal ±4 |

## Estrutura do projeto

```
app/
  Game/
    Battle/     # BattleSimulator, DamageCalculator, MoveSelector, LevelGenerator
    Pokemon/    # PokeApiService (cache em runtime), PokemonImporter
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
  research/     # Pesquisa técnica por feature
  prd/          # Documentos de requisitos
  qa/           # Planos de QA
```