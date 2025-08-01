// netlify/functions/check-job.js
const cache = require('netlify-cache');
const path = require('path');
const os = require('os');
const fs = require('fs');

exports.handler = async (event) => {
    const { jobId } = event.queryStringParameters;
    if (!jobId) {
        return { statusCode: 400, body: "jobId ausente." };
    }

    const cacheDir = path.join(os.tmpdir(), 'results');
    const resultPath = path.join(cacheDir, `${jobId}.json`);

    // Verifica se a "estante" existe
    if (await cache.restore(cacheDir) && fs.existsSync(resultPath)) {
        console.log(`Resultado encontrado para o job ${jobId}.`);
        const result = fs.readFileSync(resultPath, 'utf-8');
        return {
            statusCode: 200, // "Pizza Pronta!"
            body: result,
        };
    } else {
        console.log(`Resultado para o job ${jobId} ainda não está pronto.`);
        return {
            statusCode: 202, // "Ainda preparando..."
        };
    }
};
