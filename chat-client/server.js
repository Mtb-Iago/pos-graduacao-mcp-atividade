require('dotenv').config();
const express = require('express');
const path = require('path');
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StreamableHTTPClientTransport } = require('@modelcontextprotocol/sdk/client/streamableHttp.js');
const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


let mcpClient = null;
let mcpConnected = false;

const MCP_URL = 'http://mcp-server:8000/mcp';

const MCP_TOOLS = [
    { name: 'get_atletas', description: 'Busca lista de todos os atletas cadastrados com suas categorias' },
    { name: 'get_categorias', description: 'Busca todas as categorias disponiveis na competição' },
    { name: 'get_resultados', description: 'Busca lista de todos os resultados da prova com tempo e status (Finalizou, DNF, DNS)' },
    { name: 'get_resultado_atleta', description: 'Busca resultado por ID do atleta', parameters: { properties: { id: { type: SchemaType.STRING, description: "ID do atleta" } }, required: ["id"] } },
    { name: 'get_rankings', description: 'Busca o ranking geral da prova ordenado por tempo, apenas atletas que finalizaram' },
    { name: 'get_ranking_categoria', description: 'Busca o ranking da prova para uma categoria especifica', parameters: { properties: { id: { type: SchemaType.STRING, description: "ID da categoria" } }, required: ["id"] } }
];

async function initMcp() {
    console.log('Conectando ao MCP Server em', MCP_URL);
    const transport = new StreamableHTTPClientTransport(new URL(MCP_URL));
    mcpClient = new Client({ name: 'chat-client', version: '1.0.0' }, { capabilities: {} });
    await mcpClient.connect(transport);
    mcpConnected = true;
    console.log('Conectado ao MCP Server!');

    try {
        const result = await mcpClient.listTools();
        console.log('Tools retornadas pelo MCP:', result.tools?.map(t => t.name) || []);
    } catch (e) {
        console.warn('listTools falhou (não crítico):', e.message);
    }
}


const SYSTEM_PROMPT = `Você é um assistente especializado EXCLUSIVAMENTE no Sistema de Gestão de competições MTB (Mountain Bike).

Você tem acesso às seguintes ferramentas para consultar dados reais do sistema:
- get_atletas: busca todos os atletas cadastrados com suas categorias
- get_categorias: busca as categorias da competição
- get_resultados: busca os resultados da prova (tempo, status)
- get_rankings: busca o ranking geral ordenado por tempo

REGRAS OBRIGATÓRIAS:
1. Você SÓ pode responder perguntas relacionadas a atletas, categorias, resultados e rankings da competição MTB.
2. SEMPRE use as ferramentas disponíveis para buscar dados antes de responder. NUNCA invente dados.
3. Se a pergunta NÃO for sobre a competição MTB, responda: "Desculpe, só consigo responder sobre dados da competição MTB (atletas, categorias, resultados e rankings)."
4. Seja direto e objetivo nas respostas.
5. Responda sempre em português brasileiro.`;

function buildGeminiFunctionDeclarations() {
    return MCP_TOOLS.map(tool => ({
        name: tool.name,
        description: tool.description,
        parameters: {
            type: SchemaType.OBJECT,
            properties: tool.parameters?.properties || {},
            required: tool.parameters?.required || []
        }
    }));
}

async function chatWithGemini(userMessage) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'sua-chave-aqui') {
        throw new Error('GEMINI_API_KEY não configurada no .env');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: 'gemini-3.5-flash-lite',
        systemInstruction: SYSTEM_PROMPT,
        tools: [{ functionDeclarations: buildGeminiFunctionDeclarations() }]
    });

    const contents = [{ role: 'user', parts: [{ text: userMessage }] }];
    let response = await model.generateContent({ contents });
    let result = response.response;

    let maxIterations = 5;
    while (result.candidates?.[0]?.content?.parts?.some(p => p.functionCall) && maxIterations-- > 0) {
        const modelContent = result.candidates[0].content;
        contents.push(modelContent);

        const functionCallParts = modelContent.parts.filter(p => p.functionCall);
        const functionResponseParts = [];

        for (const part of functionCallParts) {
            const toolName = part.functionCall.name;
            const toolArgs = part.functionCall.args || {};
            const toolId = part.functionCall.id;
            console.log(`Gemini chamou ferramenta: ${toolName}`, toolArgs);

            const functionResponse = { name: toolName };
            if (toolId) functionResponse.id = toolId;

            try {
                const mcpResult = await mcpClient.callTool({ name: toolName, arguments: toolArgs });

                if (mcpResult.isError) {
                    console.warn(`Serviço de ${toolName} offline ou inacessível.`);
                    functionResponse.response = {
                        result: `[SISTEMA]: O serviço responsável pela ferramenta '${toolName}' está temporariamente indisponível. 
                        Informe ao usuário de forma amigável que você não conseguiu acessar esses dados no momento.`
                    };
                } else {
                    const textContent = mcpResult.content?.[0]?.text || JSON.stringify(mcpResult);
                    console.log(`Resultado de ${toolName}: ${textContent.substring(0, 200)}...`);
                    functionResponse.response = { result: textContent };
                }
            } catch (err) {
                console.error(`Erro ao comunicar com MCP na tool ${toolName}:`, err.message);
                functionResponse.response = { 
                    result: `[SISTEMA]: Falha ao executar '${toolName}'. 
                    O serviço está fora do ar. Avise o usuário e não tente chamar essa ferramenta novamente nesta resposta.` 
                };
            }

            functionResponseParts.push({ functionResponse });
        }

        contents.push({ role: 'user', parts: functionResponseParts });
        response = await model.generateContent({ contents });
        result = response.response;
    }

    return result.text();
}


app.post('/api/connect', async (req, res) => {
    try {
        if (!mcpConnected) await initMcp();
        res.json({ success: true, tools: MCP_TOOLS.map(t => t.name) });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    try {
        if (!mcpConnected) await initMcp();
        const reply = await chatWithGemini(message);
        res.json({ reply });
    } catch (err) {
        console.error("Erro no chat:", err.message);
        if (err.status === 429) {
            return res.json({ 
                reply: "O modelo de IA atigiu o limite de requisições, aguarde alguns instantes..." 
            });
        }
        res.status(500).json({ error: err.message });
    }
});

app.listen(3005, () => {
    console.log('Chat Client rodando em http://localhost:3005');
    initMcp().catch(err => console.warn('MCP não conectou no startup:', err.message));
});
