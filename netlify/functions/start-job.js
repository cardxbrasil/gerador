// netlify/functions/start-job.js
const fetch = require('node-fetch'); // Usaremos o fetch para chamar a outra função

exports.handler = async (event, context) => {
    try {
        const body = JSON.parse(event.body);
        const jobId = Date.now() + '-' + Math.random().toString(36).substring(2);

        // O URL da nossa função de background. A Netlify nos dá essa variável.
        const backgroundFunctionUrl = `${process.env.URL}/.netlify/functions/groq-background`;

        // Ligação direta para a função de background
        // O `X-Nf-Token` é uma chave de segurança para funções se comunicarem
        fetch(backgroundFunctionUrl, {
            method: 'POST',
            headers: {
                'X-Nf-Token': context.clientContext.token,
            },
            body: JSON.stringify({ ...body, jobId }),
        });
        
        // Retorna o jobId imediatamente, SEM esperar a resposta do fetch
        return {
            statusCode: 202,
            body: JSON.stringify({ jobId }),
        };
    } catch (error) {
        console.error("Erro ao iniciar o job:", error);
        return { statusCode: 500, body: JSON.stringify({ error: "Falha ao iniciar a tarefa." }) };
    }
};