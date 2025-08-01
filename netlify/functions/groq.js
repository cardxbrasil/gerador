// netlify/functions/groq.js - VERSÃO FINAL SIMPLIFICADA
const Groq = require('groq-sdk');

const MODEL_NAME = process.env.GROQ_MODEL_NAME || 'llama3-70b-8192';
const DEFAULT_TIMEOUT_MS = 9500; // Fixo em 9.5s

let currentKeyIndex = 0;

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Método não permitido.' }) };
    }
    
    const apiKeys = (process.env.GROQ_API_KEYS || '').split(',').map(k => k.trim()).filter(Boolean);
    if (apiKeys.length === 0) {
        return { statusCode: 500, body: JSON.stringify({ error: 'Nenhuma chave de API configurada.' }) };
    }

    try {
        const { prompt, maxTokens } = JSON.parse(event.body);
        const apiKey = apiKeys[currentKeyIndex % apiKeys.length];
        currentKeyIndex++;

        const groq = new Groq({ apiKey });
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: MODEL_NAME,
            max_tokens: maxTokens || 4096,
        }, { signal: controller.signal });
        
        clearTimeout(timeoutId);

        return {
            statusCode: 200,
            body: JSON.stringify(chatCompletion),
        };
    } catch (error) {
        console.error("Erro na função Groq:", error);
        return { statusCode: 500, body: JSON.stringify({ error: `Erro do servidor: ${error.message}` }) };
    }
};
