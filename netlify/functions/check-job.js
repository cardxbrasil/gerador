// netlify/functions/start-job.js

const { invoke } = require('@netlify/functions');

exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        // Gera um ID único para o trabalho, combinando tempo e um número aleatório
        const jobId = Date.now() + '-' + Math.random().toString(36).substring(2);

        // Dispara a função de background, passando o pedido E o número de controle
        await invoke('groq-background', {
            body: JSON.stringify({ ...body, jobId })
        });

        // Retorna o número de controle IMEDIATAMENTE para o cliente
        return {
            statusCode: 202, // Código HTTP para "Pedido Aceito"
            body: JSON.stringify({ jobId }),
        };
    } catch (error) {
        console.error("ERRO CRÍTICO AO INICIAR O JOB:", error);
        return { statusCode: 500, body: JSON.stringify({ error: "Falha ao iniciar a tarefa de geração." }) };
    }
};
