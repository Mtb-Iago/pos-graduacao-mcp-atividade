# chat-client

Express + Gemini + MCP Client. UI de chat que consulta a competição via tools MCP.

**Porta:** `3005`  
**UI:** http://localhost:3005

## Fluxo

Usuário → Gemini → tools MCP → microsserviços → resposta

## Env (`.env`)

```
GEMINI_API_KEY=sua-chave
```

## Rotas

- `POST /api/connect` — conecta ao MCP  
- `POST /api/chat` — `{ "message": "..." }`
