# service-atletas

NestJS + Postgres. Cadastro de atletas e categorias.

**Porta:** `3001` (container `:3000`)  
**DB:** `db-atletas`

## Rotas

- `GET /atletas` — atletas com categoria  
- `GET /categorias` — categorias

## Env

```
DATABASE_URL=postgresql://mcp:mcp@db-atletas:5432/mcp_atletas
```
