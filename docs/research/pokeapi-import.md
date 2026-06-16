# Research: Importação da PokéAPI

## Objetivo

Importar tipos, golpes e Pokémon da PokéAPI v2 para o banco de dados local, eliminando qualquer dependência de API em runtime durante batalhas.

## Referências

- PokéAPI v2: https://pokeapi.co/api/v2
- Rate limit: sem rate limit oficial, mas boas práticas recomendam ~150ms de delay
- Cache: a PokéAPI usa CDN, respostas são estáveis e raramente mudam

## Endpoints utilizados

| Endpoint | Dados extraídos |
|----------|----------------|
| `GET /type?limit=100` | Lista de tipos |
| `GET /type/{name}` | damage_relations (efetividade) |
| `GET /move?limit=2000` | Lista de golpes |
| `GET /move/{name}` | type, damage_class, power, accuracy, pp |
| `GET /pokemon?limit=2000` | Lista de Pokémon |
| `GET /pokemon/{name}` | stats, types, moves, sprites |

## Ordem de importação

```
1. Tipos          → tabela pokemon_types
2. Efetividade    → tabela type_effectiveness
3. Golpes         → tabela moves
4. Pokémon        → tabelas pokemons + pokemon_moves
```

A ordem importa: Pokémon precisam de tipos já criados, e `pokemon_moves` precisa de `moves` existentes.

## Regras de filtragem

### Tipos
- Ignorar `shadow` e `unknown` (não são tipos de combate padrão)
- 18 tipos válidos: Normal, Fire, Water, Grass, Electric, Ice, Fighting, Poison, Ground, Flying, Psychic, Bug, Rock, Ghost, Dragon, Dark, Steel, Fairy

### Golpes
- Ignorar se `type` não está nos tipos importados
- Ignorar se `damage_class` não é `physical`, `special` ou `status`
- `power` pode ser `null` (golpes de status) — armazenar como null
- `pp` mínimo de 1 (usar 5 como fallback se vier 0)

### Pokémon
- Ignorar se `primary_type` não existe na nossa tabela
- Linkar apenas golpes que já estão na tabela `moves`
- Sprites: armazenar URL diretamente (não baixar no import inicial)
- Preço calculado por faixa de total de stats base

## Efetividade de tipos

A PokéAPI retorna `damage_relations` por tipo atacante:
- `double_damage_to` → multiplier 2.0
- `half_damage_to`   → multiplier 0.5
- `no_damage_to`     → multiplier 0.0
- (não listado)       → multiplier 1.0

Armazenado em `type_effectiveness(attacking_type_id, defending_type_id, multiplier)`.

## Dados necessários da PokéAPI

### Stats (mapeamento)
```
hp              → base_hp
attack          → base_attack
defense         → base_defense
special-attack  → base_special_attack
special-defense → base_special_defense
speed           → base_speed
```

### Sprites (fallback em cascata)
```
sprites.other.official-artwork.front_default → sprite_official
sprites.other.home.front_default             → sprite_home
sprites.front_default                        → sprite_front
```
Accessor `getSpriteAttribute()` no model aplica o fallback automaticamente.

### Preço por total de stats base
```
>= 600 → 2000 moedas  (lendários/pseudo-lendários)
>= 500 → 1000 moedas  (semi-fortes)
>= 400 →  600 moedas  (intermediários)
>= 300 →  300 moedas  (básicos)
default →  150 moedas  (básicos fracos)
```

## Riscos técnicos

| Risco | Mitigação |
|-------|-----------|
| Timeout na API | `retry(3, 1000)` + `timeout(30)` no Http client |
| Import longo (>30 min) | Job com `timeout = 7200`, 1 try, log de progresso |
| Golpe sem tipo na DB | Skip com log |
| Pokémon com forma alternativa | `slug` único evita duplicata |
| Sprite null | Fallback para placeholder no accessor |
| PokéAPI indisponível | Import nunca é chamado em runtime de batalha |

## Decisões tomadas

- **URLs de sprites** armazenadas diretamente (não download local no MVP). Podem ser baixadas para S3 em uma etapa posterior via Job separado.
- **Golpes de status** são importados (power = null) porque afetam stats na batalha.
- **`pokemon_moves`** usa `sync()` para garantir que associações antigas sejam limpas em re-imports.
- **Preço** calculado automaticamente no import pelo total de stats. Pode ser ajustado manualmente depois.
- **`--fresh`** requer confirmação explícita para evitar truncate acidental.

## O que não será feito agora

- Download local de imagens para S3
- Importar habitats, flavor texts, evoluções
- Filtrar por geração específica (importa tudo até o limite)
- Importar habilidades (abilities) — pode ser feito em fase posterior
- Websocket de progresso em tempo real (progresso via log/CLI)

## Uso

```bash
# Import completo (roda em foreground)
php artisan pokebet:import

# Só os tipos (rápido, ~36 requests)
php artisan pokebet:import --step=types

# Só os golpes
php artisan pokebet:import --step=moves

# Só Pokémon (requer tipos e golpes já importados)
php artisan pokebet:import --step=pokemon

# Limitar a geração 1 (151 Pokémon)
php artisan pokebet:import --step=pokemon --limit=151

# Em background via queue (recomendado para produção)
php artisan pokebet:import --queue

# Reimport do zero
php artisan pokebet:import --fresh
```
