// netlify/functions/groq-background.js
const Groq = require('groq-sdk');
const cache = require('netlify-cache');
const path = require('path');
const os = require('os');
const fs = require('fs');

// Sua lógica de chaves e modelo
const MODEL_NAME = process.env.GROQ_MODEL_NAME || 'gemma-7b-it';
let currentKeyIndex = 0;

exports.handler = async (event) => {
    const { prompt, maxTokens, jobId } = JSON.parse(event.body);
    console.log(`--- BACKGROUND JOB ${jobId} INICIADO ---`);

    const apiKeys = process.env.GROQ_API_KEYS.split(',').map(k => k.trim()).filter(Boolean);
    const apiKey = apiKeys[currentKeyIndex % apiKeys.length];
    currentKeyIndex++;

    try {
        const groq = new Groq({ apiKey });
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: MODEL_NAME,
            max_tokens: maxTokens || 4096,
        });

        const result = JSON.stringify(chatCompletion);

        // Salva o resultado na "estante de entrega" (cache)
        const cacheDir = path.join(os.tmpdir(), 'results');
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
        
        const resultPath = path.join(cacheDir, `${jobId}.json`);
        fs.writeFileSync(resultPath, result);

        await cache.save(cacheDir);

        console.log(`✅ BACKGROUND JOB ${jobId} CONCLUÍDO E SALVO.`);
        return { statusCode: 200 };

    } catch (error) {
        console.error(`❌ ERRO NO BACKGROUND JOB ${jobId}:`, error);
        return { statusCode: 500 };
    }
};
