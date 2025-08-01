// netlify/functions/start-job.js
const { invoke } = require('@netlify/functions');

exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const jobId = Date.now() + '-' + Math.random().toString(36).substring(2);

        // Dispara a função de background usando a ferramenta oficial da Netlify
        await invoke('groq-background', {
            body: JSON.stringify({ ...body, jobId })
        });

        return {
            statusCode: 202,
            body: JSON.stringify({ jobId }),
        };
    } catch (error) {
        console.error("Erro ao iniciar o job:", error);
        return { statusCode: 500, body: JSON.stringify({ error: "Falha ao iniciar a tarefa." }) };
    }
};
