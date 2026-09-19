# service-resultados

NestJS + Postgres. Resultados da prova (tempo e status).

**Porta:** `3002` (container `:3000`)  
**DB:** `db-resultados` (compartilhado com rankings)

## Rotas

- `GET /resultados` — todos os resultados  
- `GET /resultados/:id` — por `atleta_id`

Status: `Finalizou` | `DNF` | `DNS`

## Env

```
DATABASE_URL=postgresql://mcp:mcp@db-resultados:5432/mcp_resultados
```
