# service-rankings

NestJS + Postgres. Ranking dos atletas que finalizaram.

**Porta:** `3003` (container `:3000`)  
**DB:** `db-resultados` (mesmo do service-resultados)

## Rotas

- `GET /rankings/geral` — ordenado por tempo  
- `GET /rankings/categoria/:id` — stub (retorna o geral)

## Env

```
DATABASE_URL=postgresql://mcp:mcp@db-resultados:5432/mcp_resultados
```
