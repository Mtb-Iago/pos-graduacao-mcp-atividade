# mcp-server

NestJS + MCP SDK (Streamable HTTP). Expõe tools e chama os microsserviços.

**Porta:** `8000`  
**Endpoint:** `POST|GET|DELETE /mcp`

## Tools

| Tool | Chama |
|---|---|
| `get_atletas` | `service-atletas/atletas` |
| `get_categorias` | `service-atletas/categorias` |
| `get_resultados` | `service-resultados/resultados` |
| `get_rankings` | `service-rankings/rankings/geral` |

Sessão nasce no `POST` de `initialize` (header `mcp-session-id`).
