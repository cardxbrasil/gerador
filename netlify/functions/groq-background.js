// netlify/functions/groq-background.js

const Groq = require('groq-sdk');
const cache = require('@netlify/cache'); // <-- CORREÇÃO APLICADA AQUI
const path = require('path');
const os = require('os');
const fs = require('fs');

// Configurações do motor da IA
const MODEL_NAME = process.env.GROQ_MODEL_NAME || 'llama3-70b-8192';
let currentKeyIndex = 0;

exports.handler = async (event) => {
    const { prompt, maxTokens, jobId } = JSON.parse(event.body);
    console.log(`--- BACKGROUND JOB ${jobId} INICIADO ---`);

    const apiKeys = process.env.GROQ_API_KEYS.split(',').map(k => k.trim()).filter(Boolean);
    const apiKey = apiKeys[currentKeyIndex % apiKeys.length];
    currentKeyIndex++; // Roda para a próxima chave na próxima invocação

    try {
        const groq = new Groq({ apiKey });
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: MODEL_NAME,
            max_tokens: maxTokens || 4096,
        });

        const result = JSON.stringify(chatCompletion);

        // Define o caminho para o cache
        const cacheDir = path.join(os.tmpdir(), 'results');
        // Garante que o diretório de cache exista
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir, { recursive: true });
        }
        
        // Salva o resultado em um arquivo com o nome do jobId
        const resultPath = path.join(cacheDir, `${jobId}.json`);
        fs.writeFileSync(resultPath, result);

        // Persiste o diretório no cache da Netlify
        await cache.save(cacheDir);

        console.log(`✅ BACKGROUND JOB ${jobId} CONCLUÍDO E RESULTADO SALVO.`);
        return { statusCode: 200 };

    } catch (error) {
        console.error(`❌ ERRO NO BACKGROUND JOB ${jobId}:`, error);
        return { statusCode: 500, body: `Erro: ${error.message}` };
    }
};
