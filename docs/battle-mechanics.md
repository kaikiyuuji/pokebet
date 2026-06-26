# Mecânicas de Batalha — Pokébet

Tudo que acontece numa batalha, na ordem em que acontece.

---

## 1. Antes da batalha começar

### Seed de aleatoriedade
Cada batalha recebe um seed único: 32 caracteres hexadecimais gerados com `random_bytes(16)`. Esse seed controla **todo** o aleatório da simulação via `mt_srand(crc32($seed))`. A batalha é 100% reproduzível — dado o mesmo seed, o resultado é sempre idêntico.

### Níveis dos Pokémon

Antes de simular, o sistema calcula um "completeness score" para cada Pokémon:

```
completeness = estágio_evolutivo / tamanho_da_cadeia
```

Exemplos:
| Pokémon    | Estágio | Cadeia | Score |
|------------|---------|--------|-------|
| Lapras     | 1       | 1      | 1.00  |
| Charizard  | 3       | 3      | 1.00  |
| Ivysaur    | 2       | 3      | 0.67  |
| Eevee      | 1       | 2      | 0.50  |
| Bulbasaur  | 1       | 3      | 0.33  |

**Nível do jogador:**
- Pokémon normal: `random_int(5, 100)`
- Pokémon lendário: `random_int(5, 50)` — cap em 50 para não trivializar com base stats altos

**Nível do oponente** depende da diferença de scores:

| Situação | Lógica |
|----------|--------|
| Jogador é lendário | Oponente recebe boost de 25–40 níveis, mínimo 75 |
| Score do jogador ≤ score do oponente | Oponente fica no mesmo range (±4 do nível do jogador) |
| Jogador tem score maior | Oponente ganha boost proporcional à vantagem |

Fórmula do boost quando jogador tem score maior:
```
diff  = score_jogador - score_oponente
boost = round(diff × 45) + random_int(-4, 4)
boost = max(1, boost)
```

Exemplos de boost:
- diff 0.33 → boost base ~15 (estágio final vs meio de cadeia 3)
- diff 0.50 → boost base ~22 (estágio final vs base de cadeia 2)
- diff 0.67 → boost base ~30 (estágio final vs base de cadeia 3)

Ou seja: jogar com um Charizard contra um Bulbasaur dá ao Bulbasaur ~30 níveis a mais.

---

## 2. Seleção de golpes

Cada Pokémon entra com **2 golpes** selecionados aleatoriamente do pool de golpes que ele sabe.

Regra garantida: **pelo menos 1 dos 2 golpes causa dano direto.** O sistema separa golpes de dano dos de status e sorteia 1 de dano antes de completar o resto com qualquer golpe disponível.

---

## 3. Simulação rodada a rodada

A batalha tem no máximo **50 rounds**.

### Quem ataca primeiro
Pokémon com maior `base_speed` ataca primeiro. Empate de speed: **50% de chance** para cada lado (`mt_rand(0, 1)`).

### Dentro de cada round
Ambos os Pokémon atacam uma vez. Se um Pokémon chega a 0 HP durante o turno do adversário, a batalha para imediatamente — o segundo Pokémon do round pode não chegar a atacar.

### Qual golpe usar
Em cada turno, o Pokémon sorteia **1 dos seus 2 golpes** com probabilidade igual (50/50).

---

## 4. Cálculo de dano

### HP máximo
```
max_hp = floor((2 × base_hp × level) / 100) + level + 10
```
Fórmula da Geração III+ sem IVs ou EVs.

### Dano base
```
base = floor(((2 × level / 5 + 2) × power × (atk / def)) / 50 + 2)
```

- Golpe físico usa `base_attack` do atacante e `base_defense` do defensor
- Golpe especial usa `base_special_attack` e `base_special_defense`

### Multiplicadores aplicados em cima do dano base

| Multiplicador | Valor | Condição |
|---------------|-------|----------|
| Tipo (STAB) | 1.5× | Tipo do golpe = tipo do Pokémon |
| Tipo (STAB) | 1.0× | Tipo diferente |
| Crítico | 1.5× | 6.25% de chance por golpe |
| Crítico | 1.0× | 93.75% dos golpes |
| Aleatoriedade | 85% a 100% | Todo golpe varia nessa faixa |
| Tipo (efetividade) | veja tabela | Gen 6+ type chart |

**Fórmula final:**
```
dano = max(1, floor(base × tipo × stab × critico × random))
```

Dano mínimo garantido: **1**.

---

## 5. Tabela de tipos (Gen 6+)

Multiplicadores calculados sobre o(s) tipo(s) do defensor. Pokémon com dois tipos multiplica os dois.

| Atacante ↓ / Defensor → | Normal | Fogo | Água | Elétrico | Grama | Gelo | Lutador | Veneno | Terra | Voador | Psíquico | Inseto | Pedra | Fantasma | Dragão | Sombrio | Aço | Fada |
|-------------------------|--------|------|------|----------|-------|------|---------|--------|-------|--------|----------|--------|-------|----------|--------|---------|-----|------|
| Normal | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 0.5 | 0 | 1 | 1 | 0.5 | 1 |
| Fogo | 1 | 0.5 | 0.5 | 1 | **2** | **2** | 1 | 1 | 1 | 1 | 1 | **2** | 0.5 | 1 | 0.5 | 1 | **2** | 1 |
| Água | 1 | **2** | 0.5 | 1 | 0.5 | 1 | 1 | 1 | **2** | 1 | 1 | 1 | **2** | 1 | 0.5 | 1 | 1 | 1 |
| Elétrico | 1 | 1 | **2** | 0.5 | 0.5 | 1 | 1 | 1 | 0 | **2** | 1 | 1 | 1 | 1 | 0.5 | 1 | 1 | 1 |
| Grama | 1 | 0.5 | **2** | 1 | 0.5 | 1 | 1 | 0.5 | **2** | 0.5 | 1 | 0.5 | **2** | 1 | 0.5 | 1 | 0.5 | 1 |
| Gelo | 1 | 0.5 | 0.5 | 1 | **2** | 0.5 | 1 | 1 | **2** | **2** | 1 | 1 | 1 | 1 | **2** | 1 | 0.5 | 1 |
| Lutador | **2** | 1 | 1 | 1 | 1 | **2** | 1 | 0.5 | 1 | 0.5 | 0.5 | 0.5 | **2** | 0 | 1 | **2** | **2** | 0.5 |
| Veneno | 1 | 1 | 1 | 1 | **2** | 1 | 1 | 0.5 | 0.5 | 1 | 1 | 1 | 0.5 | 0.5 | 1 | 1 | 0 | **2** |
| Terra | 1 | **2** | 1 | **2** | 0.5 | 1 | 1 | **2** | 1 | 0 | 1 | 0.5 | **2** | 1 | 1 | 1 | **2** | 1 |
| Voador | 1 | 1 | 1 | 0.5 | **2** | 1 | **2** | 1 | 1 | 1 | 1 | **2** | 0.5 | 1 | 1 | 1 | 0.5 | 1 |
| Psíquico | 1 | 1 | 1 | 1 | 1 | 1 | **2** | **2** | 1 | 1 | 0.5 | 1 | 1 | 1 | 1 | 0 | 0.5 | 1 |
| Inseto | 1 | 0.5 | 1 | 1 | **2** | 1 | 0.5 | 0.5 | 1 | 0.5 | **2** | 1 | 1 | 0.5 | 1 | **2** | 0.5 | 0.5 |
| Pedra | 1 | **2** | 1 | 1 | 1 | **2** | 0.5 | 1 | 0.5 | **2** | 1 | **2** | 1 | 1 | 1 | 1 | 0.5 | 1 |
| Fantasma | 0 | 1 | 1 | 1 | 1 | 1 | 0 | 1 | 1 | 1 | **2** | 1 | 1 | **2** | 1 | 0.5 | 1 | 1 |
| Dragão | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | **2** | 1 | 0.5 | 0 |
| Sombrio | 1 | 1 | 1 | 1 | 1 | 1 | 0.5 | 1 | 1 | 1 | **2** | 1 | 1 | **2** | 1 | 0.5 | 1 | 0.5 |
| Aço | 1 | 0.5 | 0.5 | 0.5 | 1 | **2** | 1 | 1 | 1 | 1 | 1 | 1 | **2** | 1 | 1 | 1 | 0.5 | **2** |
| Fada | 1 | 0.5 | 1 | 1 | 1 | 1 | **2** | 0.5 | 1 | 1 | 1 | 1 | 1 | 1 | **2** | **2** | 0.5 | 1 |

Pokémon com dois tipos: os dois multiplicadores se multiplicam entre si. Fogo/Voador vs Grama = 2 × 2 = **4×**. Água/Dragão vs Elétrico = 2 × 0.5 = **1×**.

---

## 6. Fim da batalha

### Após 50 rounds sem KO
Se nenhum Pokémon chegar a 0 HP em 50 rounds, o sistema compara o percentual de HP restante:
```
jogador_pct   = hp_restante_jogador   / hp_max_jogador
oponente_pct  = hp_restante_oponente  / hp_max_oponente
```
Quem tem percentual maior vence. Iguais: empate.

### Resultados possíveis
| Resultado | Condição |
|-----------|----------|
| Vitória | Oponente chega a 0 HP primeiro, ou jogador tem % HP maior no limite de rounds |
| Derrota | Jogador chega a 0 HP primeiro, ou jogador tem % HP menor no limite de rounds |
| Empate | Ambos chegam a 0 HP no mesmo turno, ou % HP igual no limite de rounds |

---

## 7. Apostas e recompensas

| Resultado | Moedas |
|-----------|--------|
| Vitória | +80% da aposta (`floor(aposta × 0.8)`) |
| Derrota | −100% da aposta (capped no saldo atual — não vai negativo) |
| Empate | 0 |

Exemplo com aposta de 100 moedas:
- Vitória → +80 moedas
- Derrota → −100 moedas
- Empate → nada muda

---

## 8. Configurações ajustáveis

Todos esses valores estão no `.env` e têm defaults no `config/battle.php`:

| Config | Default | Descrição |
|--------|---------|-----------|
| `BATTLE_MIN_LEVEL` | 5 | Nível mínimo de qualquer Pokémon |
| `BATTLE_MAX_LEVEL` | 100 | Nível máximo |
| `BATTLE_MAX_LEVEL_DIFF` | 4 | Spread máximo ao gerar nível dentro de range |
| `BATTLE_CRITICAL_CHANCE` | 0.0625 | 6.25% de chance de crítico por golpe |
| `BATTLE_CRITICAL_MULTIPLIER` | 1.5 | Multiplicador de crítico |
| `BATTLE_RANDOM_DAMAGE_MIN` | 0.85 | Mínimo do fator aleatório de dano |
| `BATTLE_RANDOM_DAMAGE_MAX` | 1.00 | Máximo do fator aleatório de dano |

---

## Resumo dos sorteios em ordem

1. Seed da batalha: `random_bytes(16)` — gerado uma vez, salvo no banco
2. Nível do jogador: `random_int(5, 100)` ou `random_int(5, 50)` se lendário
3. Nível do oponente: fórmula de boost baseada em scores evolutivos
4. Golpes de cada Pokémon: 2 sorteados do pool, garantindo 1 de dano
5. Por round: quem ataca primeiro (determinístico por speed, coin flip em empate)
6. Por turno: qual golpe usar (50/50 entre os 2 golpes)
7. Por golpe: crítico (6.25%), fator aleatório de dano (85–100%)
