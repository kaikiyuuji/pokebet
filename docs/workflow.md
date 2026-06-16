# Workflow de Desenvolvimento — Pokémon Battle Bets

## Fluxo resumido

```
Grill → Research (opcional) → Prototype (opcional) → PRD → Issues → Implement → Review → Merge/Deploy
```

## 1. Grill — validar a ideia

Antes de criar qualquer feature, responder rapidamente:

- Qual problema essa feature resolve?
- Ela melhora batalha, coleção, economia, retenção ou monetização interna?
- Ela é necessária para o MVP?
- Ela pode gerar exploit?
- Ela depende de dados da PokéAPI?
- Ela precisa ser auditável em logs?

**Critério para continuar:** objetivo claro, impacto no gameplay/economia, não quebra a lógica de batalha, pode ser implementada em partes pequenas.

## 2. Research — `docs/research/{feature-name}.md`

```md
# Research: Nome da feature
## Objetivo
## Referências
## Regras relevantes
## Dados necessários da PokéAPI
## Riscos técnicos
## Decisões tomadas
## O que não será feito agora
```

## 3. Prototype — `prototypes/`

Usar quando a feature tiver lógica incerta. Sair do prototype quando a regra funcionar com 10+ batalhas simuladas e casos extremos testados.

## 4. PRD — `docs/prd/{feature-name}.md`

```md
# PRD: Nome da feature
## Objetivo
## Escopo / Fora de escopo
## User stories
## Fluxo do usuário
## Regras de negócio
## Regras técnicas
## Tabelas afetadas
## Eventos/logs necessários
## Critérios de aceite
## Riscos
```

## 5. Issues — quebrar em tickets

```md
# Issue: Título
## Contexto
## Tarefas
## Critérios de aceite
## Bloqueia / Bloqueado por
```

## 6. Implement

Ordem padrão: Migration → Model → Seeder/Importer → Service → Action → Controller → Request → Frontend → Tests

**Checklist antes de finalizar:**
- [ ] Sem chamada à PokéAPI durante batalha
- [ ] Moedas alteradas apenas no backend
- [ ] Operações críticas dentro de `DB::transaction`
- [ ] Logs salvos por turno
- [ ] Inputs validados
- [ ] Casos de erro tratados
- [ ] Testes cobrindo regra principal

## 7. Review — `docs/qa/{feature-name}.md`

```md
# QA: Nome da feature
## Cenários felizes / Cenários de erro / Casos extremos
## Segurança/exploits
## Checklist visual / técnico
## Resultado da revisão
```

## Features prioritárias (MVP)

1. Importação da PokéAPI
2. Escolha de Pokémon
3. Sorteio de adversário
4. Sorteio de golpes válidos
5. Simulador de batalha
6. Logs/replay de batalha
7. Economia de moedas
8. Loja de Pokémon
9. Coleção do usuário
10. Personalização de perfil

## Definição de pronto

- PRD aprovado
- Quebrada em issues pequenas
- Sem regra crítica no frontend
- Logs quando afeta batalha/economia
- Testes mínimos
- QA manual passou
- Sem dependência runtime da PokéAPI
- Sem exploit óbvio de moedas
