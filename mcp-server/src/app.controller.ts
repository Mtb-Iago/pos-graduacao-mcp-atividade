import { Controller, Req, Res, Get, Post, Delete } from '@nestjs/common';
import type { Request, Response } from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import * as crypto from 'crypto';

const TOOLS = {
  ATLETAS: 'get_atletas',
  CATEGORIAS: 'get_categorias',
  RESULTADOS: 'get_resultados',
  RESULTADO_ATLETA: 'get_resultado_atleta',
  RANKINGS: 'get_rankings',
  RANKING_CATEGORIA: 'get_ranking_categoria'
} as const;

const SERVICES_URL = {
  ATLETAS: 'http://service-atletas:3000',
  RESULTADOS: 'http://service-resultados:3000',
  RANKINGS: 'http://service-rankings:3000'
} as const;

function createMcpServer(): McpServer {
  const mcp = new McpServer({ name: 'mtb-mcp', version: '1.0.0' });

  mcp.registerTool(
    TOOLS.ATLETAS,
    { description: 'Busca lista de atletas com suas categorias' },
    async () => {
      try {
        const res = await axios.get(`${SERVICES_URL.ATLETAS}/atletas`);
        return { content: [{ type: 'text', text: JSON.stringify(res.data) }] };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { isError: true, content: [{ type: 'text', text: msg }] };
      }
    }
  );

  mcp.registerTool(
    TOOLS.CATEGORIAS,
    { description: 'Busca categorias disponiveis' },
    async () => {
      try {
        const res = await axios.get(`${SERVICES_URL.ATLETAS}/categorias`);
        return { content: [{ type: 'text', text: JSON.stringify(res.data) }] };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { isError: true, content: [{ type: 'text', text: msg }] };
      }
    }
  );

  mcp.registerTool(
    TOOLS.RESULTADOS,
    { description: 'Busca lista de resultados da prova' },
    async () => {
      try {
        const res = await axios.get(`${SERVICES_URL.RESULTADOS}/resultados`);
        return { content: [{ type: 'text', text: JSON.stringify(res.data) }] };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { isError: true, content: [{ type: 'text', text: msg }] };
      }
    }
  );

  mcp.registerTool(
    TOOLS.RANKINGS,
    { description: 'Busca o ranking geral da prova ordenado por tempo' },
    async () => {
      try {
        const res = await axios.get(`${SERVICES_URL.RANKINGS}/rankings/geral`);
        return { content: [{ type: 'text', text: JSON.stringify(res.data) }] };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { isError: true, content: [{ type: 'text', text: msg }] };
      }
    }
  );

  mcp.registerTool(
    TOOLS.RESULTADO_ATLETA,
    { description: 'Busca resultado da prova para um atleta especifico' },
    async (args: any) => {
      try {
        const id = args?.id || args?.arguments?.id || '';
        const res = await axios.get(`${SERVICES_URL.RESULTADOS}/resultados/${id}`);
        return { content: [{ type: 'text', text: JSON.stringify(res.data) }] };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { isError: true, content: [{ type: 'text', text: msg }] };
      }
    }
  );

  mcp.registerTool(
    TOOLS.RANKING_CATEGORIA,
    { description: 'Busca o ranking da prova para uma categoria especifica' },
    async (args: any) => {
      try {
        const id = args?.id || args?.arguments?.id || '';
        const res = await axios.get(`${SERVICES_URL.RANKINGS}/rankings/categoria/${id}`);
        return { content: [{ type: 'text', text: JSON.stringify(res.data) }] };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { isError: true, content: [{ type: 'text', text: msg }] };
      }
    }
  );

  return mcp;
}

@Controller('mcp')
export class AppController {
  private sessions: Map<string, { transport: StreamableHTTPServerTransport; mcp: McpServer }> = new Map();

  @Post()
  async handleMessages(@Req() req: Request, @Res() res: Response) {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;

    try {
      if (sessionId && this.sessions.has(sessionId)) {
        const session = this.sessions.get(sessionId)!;
        await session.transport.handleRequest(req, res, req.body);
        return;
      }

      if (!sessionId && isInitializeRequest(req.body)) {
        const mcp = createMcpServer();
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => crypto.randomUUID(),
          onsessioninitialized: (id) => {
            console.log(`Sessão MCP inicializada: ${id}`);
            this.sessions.set(id, { transport, mcp });
          }
        });

        transport.onclose = () => {
          const sid = transport.sessionId;
          if (sid) {
            this.sessions.delete(sid);
            console.log(`Sessão MCP encerrada: ${sid}`);
          }
        };

        await mcp.connect(transport);
        await transport.handleRequest(req, res, req.body);
        return;
      }

      res.status(400).json({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Bad Request: No valid session ID provided'
        },
        id: null
      });
    } catch (error) {
      console.error('Erro ao processar POST MCP:', error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: { code: -32603, message: 'Internal server error' },
          id: null
        });
      }
    }
  }

  @Get()
  async establishSseStream(@Req() req: Request, @Res() res: Response) {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;

    if (!sessionId || !this.sessions.has(sessionId)) {
      return res.status(400).send('Invalid or missing session ID');
    }

    const session = this.sessions.get(sessionId)!;
    await session.transport.handleRequest(req, res);
  }

  @Delete()
  async terminateSession(@Req() req: Request, @Res() res: Response) {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;

    if (!sessionId || !this.sessions.has(sessionId)) {
      return res.status(400).send('Invalid or missing session ID');
    }

    const session = this.sessions.get(sessionId)!;
    await session.transport.handleRequest(req, res);
  }
}
