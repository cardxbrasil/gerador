// =========================================================================
// >>>>> SUBSTITUA A FUNÇÃO callGroqAPI PELA VERSÃO SIMPLES E DIRETA <<<<<
// =========================================================================
const callGroqAPI = async (prompt, maxTokens) => {
    const proxyUrl = "/.netlify/functions/groq"; // <-- Aponta para a nossa ÚNICA função

    const payload = { prompt, maxTokens };
    const request = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    };

    try {
        const response = await fetch(proxyUrl, request);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: { message: 'Erro desconhecido do servidor.' } }));
            throw new Error(`Erro da API: ${errorData.error?.message || response.statusText}`);
        }
        const result = await response.json();
        const rawContent = result.choices?.[0]?.message?.content;
        if (rawContent) {
            return rawContent;
        } else {
            throw new Error("Resposta inesperada da API Groq.");
        }
    } catch (error) {
        console.error("Fetch da API falhou:", error);
        window.showToast(`Falha na API: ${error.message}`);
        throw error;
   }
};
