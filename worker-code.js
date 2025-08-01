// =================================================================
// CÓDIGO FINAL E COMPLETO PARA O WORKER (worker-code.js)
// Arquitetura: Rodízio Progressivo de Chaves via KV Store
// =================================================================

export default {
  async fetch(request, env, ctx) {
    // Cabeçalhos CORS para permitir que seu site na Netlify acesse esta API
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Responde à "pré-verificação" do navegador (requisição OPTIONS)
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    // Garante que só aceitamos requisições do tipo POST
    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Método não permitido.' }),
        { status: 405, headers: corsHeaders }
      );
    }

    try {
      // Lê o prompt e os maxTokens enviados pelo seu aplicativo
      const { prompt, maxTokens } = await request.json();
      
      // Lê as chaves da API da variável de ambiente que configuramos
      const apiKeys = (env.GROQ_API_KEYS || '').split(',').map(k => k.trim()).filter(Boolean);

      if (apiKeys.length === 0) {
        throw new Error('Nenhuma chave de API da Groq foi configurada nas variáveis de ambiente do Worker.');
      }

      // --- A LÓGICA DE RODÍZIO COM MEMÓRIA PERFEITA (KV STORE) ---
      // 1. Pega o último índice salvo no "post-it" KV. Se não existir, começa do 0.
      let currentIndex = await env.API_KEY_STATE.get('lastKeyIndex');
      currentIndex = currentIndex ? parseInt(currentIndex) : 0;

      const apiKey = apiKeys[currentIndex % apiKeys.length];
      console.log(`Usando a chave de API de índice ${currentIndex}...`);

      // 2. Calcula e SALVA o PRÓXIMO índice para a chamada futura.
      const nextIndex = (currentIndex + 1) % apiKeys.length;
      ctx.waitUntil(env.API_KEY_STATE.put('lastKeyIndex', nextIndex.toString()));
      // --------------------------------------------------------

      // Faz a chamada final para a API da Groq
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          model: 'llama3-70b-8192',
          max_tokens: maxTokens || 4096,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro da API Groq: ${errorText}`);
      }

      const data = await response.json();
      // Retorna a resposta da Groq para o seu aplicativo
      return new Response(JSON.stringify(data), { status: 200, headers: corsHeaders });

    } catch (error) {
      // Se qualquer coisa der errado, retorna um erro claro
      return new Response(
        JSON.stringify({ error: `Erro do servidor no Worker: ${error.message}` }),
        { status: 500, headers: corsHeaders }
      );
    }
  },
};
