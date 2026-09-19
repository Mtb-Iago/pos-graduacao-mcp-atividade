# Gestão MTB — Microsserviços + MCP

## PÓS-GRADUAÇÃO - IFBA

**DISCIPLINA:** DESENVOLVIMENTO DE SISTEMAS DISTRIBUÍDOS E SERVIÇOS  
**Professor:** Luis Paulo da Silva Carvalho  
**Aluno:** Iago da Silva Oliveira  
**E-mail:** 20261dweb0019@ifba.edu.br

Competição de MTB com APIs NestJS, servidor MCP e chat com Gemini.

## Serviços

| Serviço              | Porta | Função               |
| -------------------- | ----- | -------------------- |
| `service-atletas`    | 3001  | Atletas e categorias |
| `service-resultados` | 3002  | Resultados da prova  |
| `service-rankings`   | 3003  | Ranking geral        |
| `mcp-server`         | 8000  | Tools MCP → APIs     |
| `chat-client`        | 3005  | Chat Gemini + MCP    |

`db-atletas` (:5432) e `db-resultados` (:5433) sobem com os seeds SQL.

## Subir

```bash
# 1. Renomeie o arquivo chat-client/.env.example para chat-client/.env
# 2. Preencha com sua respectiva GEMINI_API_KEY no arquivo .env criado
docker compose up -d --build
```

- Chat: http://localhost:3005
- MCP: http://localhost:8000/mcp
- Cliente sem IA: abra `cliente-web/index.html`

## Comandos

```bash
docker compose logs -f
docker compose down
docker compose down -v   # apaga volumes/DBs
```
