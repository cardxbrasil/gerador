// netlify/functions/check-job.js

const cache = require('@netlify/cache'); // <-- CORREÇÃO APLICADA AQUI
const path = require('path');
const os = require('os');
const fs = require('fs');

exports.handler = async (event) => {
    const { jobId } = event.queryStringParameters;
    if (!jobId) {
        return { statusCode: 400, body: "ID do job ausente." };
    }

    const cacheDir = path.join(os.tmpdir(), 'results');
    const resultPath = path.join(cacheDir, `${jobId}.json`);

    // Tenta restaurar a "estante" de entrega do cache
    if (await cache.restore(cacheDir) && fs.existsSync(resultPath)) {
        // Se a pizza está na estante, entrega!
        console.log(`Resultado encontrado para o job ${jobId}. Entregando...`);
        const result = fs.readFileSync(resultPath, 'utf-8');
        return {
            statusCode: 200, // Código HTTP para "OK, aqui está o resultado"
            body: result,
        };
    } else {
        // Se a pizza ainda não está na estante, avisa que está sendo preparada
        console.log(`Resultado para o job ${jobId} ainda não está pronto.`);
        return {
            statusCode: 202, // Código HTTP para "Pedido aceito, ainda processando"
        };
    }
};
