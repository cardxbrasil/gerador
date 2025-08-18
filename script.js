// ==========================================================
// ==================== ESTADO CENTRALIZADO E CONFIG =================
// ==========================================================
const AppState = {
    inputs: {},
    generated: {
        investigationReport: null, ideas: [], strategicOutline: null,
        script: {
            intro: { html: null, text: null }, development: { html: null, text: null },
            climax: { html: null, text: null }, conclusion: { html: null, text: null },
            cta: { html: null, text: null }
        },
        titlesAndThumbnails: null, description: null, soundtrack: null,
        emotionalMap: null, imagePrompts: {}
    },
    ui: {
        isSettingStrategy: false, promptPaginationState: {},
        currentPane: 'investigate', completedSteps: new Set()
    }
};

let userSelectionRange = null;

window.criterionMap = {
    'Introdução (Hook)': 'introSection',
    'Desenvolvimento (Ritmo e Retenção)': 'developmentSection',
    'Clímax': 'climaxSection',
    'Conclusão': 'conclusionSection',
    'CTA (Call to Action)': 'ctaSection'
};

const wordCountMap = {
    'short': { intro: 60, development: 190, climax: 75, conclusion: 50 },
    'medium': { intro: 120, development: 420, climax: 165, conclusion: 120 },
    'long': { intro: 225, development: 750, climax: 300, conclusion: 225 },
};

        const CINEMATIC_STYLE_BLOCK = `
# DIRETRIZES DE ESTILO CINEMATOGRÁFICO PARA IMAGENS DE ALTA RESOLUÇÃO

Ultra-realistic, high-resolution photographic image captured with masterfully rendered natural or artificial lighting and cinematic composition. The aesthetic should be of a modern cinematic film, with meticulous attention to physical and sensory details.

## CARACTERÍSTICAS VISUAIS ESSENCIAIS

### Qualidade Técnica
- **Rich & Organic Textures:** Surfaces must display tactile authenticity — visible skin pores, individual fabric threads, weathered materials (wood, metal, stone), realistic reflections, and organic imperfections that add depth and believability.
- **Focus & Depth of Field:** Employ selective sharp focus with subtle depth of field (slightly blurred background or foreground) to guide the viewer's attention and create a sense of three-dimensionality.
- **Color Palette & Contrast:** Colors should be "true-to-life" but with a refined, cinematic tonal range. Avoid super-saturated or artificially vibrant hues. Favor contrasts that create visual drama and natural modeling, typical of good cinematography.
- **Lighting & Atmosphere:** Lighting must be complex and naturalistic, with multiple light sources creating soft shadows, half-tones, and highlights. Include subtle atmospheric elements like dust, mist, or light rays (god rays) when appropriate to enhance the sense of a living environment.

### Composição Visual
- **Visual Composition:** Apply classic cinematic composition principles (rule of thirds, leading lines, broken symmetry, depth) to create visually appealing frames that tell a story.
- **Camera Perspective:** Use appropriate focal lengths and camera angles that enhance the emotional impact of the scene (wide shots for epic scale, close-ups for intimate moments).
- **Movement Sensation:** Even in still images, create a sense of potential movement or captured moment that suggests cinematic timing.

### Estilo Geral
- **Overall Style:** The final result must be indistinguishable from a high-quality photograph taken with professional equipment, intended to illustrate a film scene. Nothing should look artificial, "3D rendered," or overly polished. The goal is physical and emotional authenticity.
- **Post-Production Elements:** Include subtle film grain appropriate to the style, natural lens characteristics (slight vignetting, chromatic aberration when appropriate), and color grading that enhances the mood without appearing artificial.

## REFERÊNCIAS DE ESTILO (INSPIRAÇÃO CINEMATOGRÁFICA)

Para diferentes gêneros e atmosferas, considere estas referências:
- **Drama Intenso:** Estilo de Emmanuel Lubezki em "The Revenant" - iluminação natural, texturas orgânicas, movimento contínuo
- **Suspense/Thriller:** Estilo de Roger Deakins em "Blade Runner 2049" - composição precisa, cores controladas, iluminação dramática
- **Épico/Histórico:** Estilo of Rodrigo Prieto em "The Irishman" - paleta de cores específica do período, iluminação naturalista, detalhes autênticos
- **Contemporâneo/Realista:** Estilo de Greig Fraser em "The Mandalorian" - iluminação prática, texturas realistas, composição dinâmica

## RESTRIÇÕES DE ESTILO (O QUE EVITAR)

- **NO** exaggerated or distorted features (facial features, proportions).
- **NO** artificial "glow" or excessive smoothing (airbrushing).
- **NO** visible 3D render or CGI look.
- **NO** super-saturated colors or unreal hues.
- **NO** element that breaks the illusion of a photorealistic capture.
- **NO** inconsistent lighting that doesn't match the described environment.
- **NO** modern digital artifacts that break the cinematic immersion.`;

const imageDescriptionLabels = { 'pt-br': 'Descrição da Imagem:', 'pt-pt': 'Descrição da Imagem:', 'en': 'Image Description:' };


// ==========================================================
// ==================== LÓGICA DO WIZARD UI (Importado da v6.0) ===================
// ==========================================================
const showPane = (paneId) => {
    document.querySelectorAll('#contentArea > div[id^="pane-"]').forEach(pane => {
        pane.style.display = 'none';
    });
    document.querySelectorAll('#sidebar .step').forEach(step => {
        step.classList.remove('active');
    });

    const activePane = document.getElementById(`pane-${paneId}`);
    if (activePane) {
        activePane.style.display = 'block';
    }
    const activeStep = document.getElementById(`step-${paneId}`);
    if (activeStep) {
        activeStep.classList.add('active');
        if (AppState.ui.currentPane) {
           activeStep.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
    AppState.ui.currentPane = paneId;

    // ==========================================================
    // >>>>> CORREÇÃO ADICIONADA AQUI <<<<<
    // Garante que a visibilidade dos módulos do roteiro seja
    // sempre atualizada quando este painel é exibido.
    if (paneId === 'script') {
        updateButtonStates();
    }
    // ==========================================================
};

const markStepCompleted = (stepId, navigate = true) => {
    const stepElement = document.getElementById(`step-${stepId}`);
    if (stepElement) {
        stepElement.classList.add('completed');
    }
    AppState.ui.completedSteps.add(stepId);
    updateProgressBar();
    if (navigate) {
        const steps = ['investigate', 'strategy', 'script', 'finalize'];
        const currentIndex = steps.indexOf(stepId);
        if (currentIndex < steps.length - 1) {
            showPane(steps[currentIndex + 1]);
        }
    }
};

const updateProgressBar = () => {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    if (!progressFill || !progressText) return;
    const totalSteps = document.querySelectorAll('#sidebar .step').length;
    let completedCount = AppState.ui.completedSteps.size;
    if(completedCount > totalSteps) completedCount = totalSteps;
    const percentage = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;
    progressFill.style.width = `${percentage}%`;
    progressText.textContent = `${percentage}%`;
};


// ==========================================================
// =================== GERENCIADOR DE PROMPTS (Cérebro da v5.0) =================
// ==========================================================
const PromptManager = {
    getIdeasPrompt: (genre, context) => {
        const templates = {

            'documentario': `Você é uma API DE ELITE em CRIAÇÃO DE CONTEÚDO DOCUMENTAL INVESTIGATIVO de alto padrão. Sua função é atuar como um JORNALISTA INVESTIGATIVO PREMIADO e DIRETOR DE DOCUMENTÁRIOS, especialista em transformar dados complexos e relatórios de pesquisa em narrativas IRRESISTÍVEIS e RIGOROSAMENTE BASEADAS EM EVIDÊNCIAS, no estilo de documentários da Netflix, HBO e podcasts investigativos como "Serial".

**IDENTIDADE E ESPECIALIZAÇÃO (A REGRA MAIS IMPORTANTE):**
Você não é apenas um compilador de fatos, você é um DETETIVE DA VERDADE. Sua especialidade é conectar os pontos invisíveis na superfície dos dados para revelar padrões, contradições e histórias humanas que transformam informações frias em narrativas quentes e impactantes. Sua integridade jornalística é absoluta, mas sua habilidade em encontrar o ângulo humano é o que separa um bom documentário de um excepcional.

**MATERIAL DE INTELIGÊNCIA (SUAS FONTES DA VERDADE):**
- **PERGUNTA ORIGINAL DA INVESTIGAÇÃO:** "__ORIGINAL_QUERY__"
- **RELATÓRIO DA PESQUISA FACTUAL (FONTE PRIMÁRIA):**
---
__RAW_REPORT__
---

**TAREFA CRÍTICA:** Sua criatividade deve estar exclusivamente na APRESENTAÇÃO, NARRATIVA e ÂNGULO dos fatos, nunca na invenção ou distorção deles. Com base **EXCLUSIVAMENTE** no relatório acima, gere um array JSON com 6 propostas de documentários investigativos. Cada proposta deve explorar um ângulo único dos fatos apresentados, mantendo o rigor jornalístico enquanto cria uma narrativa envolvente.

**REGRAS CRÍTICAS DE SINTAXE E ESTRUTURA JSON (ABSOLUTAMENTE INEGOCIÁVEIS):**
1.  **JSON PURO E PERFEITO:** Sua resposta deve ser APENAS um array JSON válido, começando com \`[\` e terminando com \`]\`.
2.  **ESTRUTURA COMPLETA:** Cada objeto no array deve conter EXATAMENTE estas 6 chaves: "title", "angle", "targetAudience", "viralityScore", "videoDescription", e "investigativeApproach".
3.  **IDIOMA OBRIGATÓRIO:** Todos os valores de texto DEVEM estar no idioma __LANGUAGE_NAME__'}.
4.  **ASPAS DUPLAS, SEMPRE:** TODAS as chaves e valores de texto DEVEM usar aspas duplas (\`"\`).

**MANUAL DE CRIAÇÃO DETALHADO (SIGA EXATAMENTE PARA CADA IDEIA):**
- **"title" (Título Revelador e Impactante):** Combine um FATO CHAVE do relatório com um elemento de INTRIGA JORNALÍSTICA. Deve:
  * Ser específico e baseado em evidências
  * Sugerir profundidade investigativa sem ser sensacionalista
  * Conter uma promessa implícita de revelação importante
  * Funcionar como um gancho que desperta a curiosidade intelectual

- **"angle" (A Tese Central Forte):** Em uma frase poderosa, resuma a ABORDAGEM DISTINTA da investigação. Deve:
  * Apresentar uma perspectiva única sobre os fatos
  * Destacar uma conexão ou implicação não óbvia encontrada nos dados
  * Formular uma questão central que o documentário responderá
  * Ex: "Como os padrões ocultos nos dados de [FATO DO RELATÓRIO] revelam uma crise sistêmica que especialistas estão ignorando?"

- **"targetAudience" (Público-Alvo Específico):** Defina o espectador ideal para esta investigação. Seja:
  * Específico sobre interesses intelectuais (ex: "Pessoas interessadas em política econômica e justiça social")
  * Demográfico (ex: "Adultos educados 30-65 que acompanham notícias internacionais")
  * Psicográfico (ex: "Indivíduos céticos que buscam análises aprofundadas além da superfície midiática")

- **"viralityScore" (Nota de Impacto e Relevância):** Avalie de 1-10 baseado em:
  * Quão urgente e relevante é a revelação para o público atual
  * Potencial de gerar discussão informada e mudança de perspectiva
  * Probabilidade de compartilhamento como fonte confiável de informação
  * Capacidade de desafiar narrativas estabelecidas ou crenças populares

- **"videoDescription" (O CORAÇÃO DA INVESTIGAÇÃO):** Escreva uma sinopse rica de **pelo menos 5 frases substantivas**. A descrição DEVE:
  1. Começar com um gancho que estabeleça a importância e urgência do tema
  2. Mencionar explicitamente 2-3 FATOS ESPECÍFICOS e verificáveis retirados do relatório
  3. Apresentar a jornada investigativa, incluindo obstáculos encontrados e fontes consultadas
  4. Construir o clímax quando as evidências convergem para revelar a verdade oculta
  5. Terminar com as implicações mais amplas dessa descoberta para a sociedade ou indivíduos

- **"investigativeApproach" (Abordagem Investigativa):** Identifique o método jornalístico principal da investigação. Escolha UM dos seguintes:
  * "Análise de Dados" - Quando a história emerge de padrões e anomalias em conjuntos de dados
  * "Reportagem de Campo" - Quando a verdade é descoberta através de entrevistas e observação direta
  * "Investigação Histórica" - Quando o presente só pode ser entendido através do contexto histórico
  * "Denúncia de Sistemas" - Quando a investigação revela falhas estruturais em instituições
  * "Narrativa Humana" - Quando os dados ganham vida através das histórias individuais afetadas

**AÇÃO FINAL:** Mergulhe profundamente no relatório fornecido. Extraia os fatos mais relevantes, identifique as conexões não óbvias e construa 6 propostas documentais que mantenham o rigor absoluto dos fatos enquanto criam narrativas irresistíveis. Cada proposta deve prometer não apenas informar, mas iluminar aspectos da realidade que permanecem ocultos para a maioria. Responda APENAS com o array JSON perfeito, seguindo EXATAMENTE todas as regras acima.`,

            'inspiracional': `Você é uma API DE ELITE em CRIAÇÃO DE CONTEÚDO NARRATIVO INSPIRADOR E TRANSFORMADOR. Sua função é atuar como um ARQUITETO DE JORNADAS EMOCIONAIS, mestre na arte de transformar fatos aparentemente ordinários em narrativas que tocam a alma humana e inspiram ação, no estilo de documentários premiados e discursos TED que mudam vidas.

**IDENTIDADE E ESPECIALIZAÇÃO (A REGRA MAIS IMPORTANTE):**
Você não é apenas um contador de histórias inspiradoras, você é um ALQUIMISTA EMOCIONAL. Sua especialidade é identificar o ouro da experiência humana oculto nos dados brutos e transformá-lo em narrativas que não apenas emocionam, mas capacitam o espectador a transformar sua própria realidade. Cada história deve ser um catalisador que acende a chama do potencial humano.

**MATERIAL DE INTELIGÊNCIA (SUAS FONTES DA VERDADE):**
- **PERGUNTA ORIGINAL DA INVESTIGAÇÃO:** "__ORIGINAL_QUERY__"
- **RELATÓRIO DA PESQUISA FACTUAL (A MINÉRIA EMOCIONAL BRUTA):**
---
__RAW_REPORT__
---

**TAREFA CRÍTICA:** Mergulhe profundamente no relatório em busca de elementos humanos, momentos de virada, lições aprendidas e exemplos de resiliência. Transforme esses achados em 6 propostas de histórias inspiradoras que usem os dados do relatório não apenas como contexto, mas como a espinha dorsal emocional da narrativa. O verdadeiro poder deve vir não apenas do que aconteceu, mas de como isso transformou as pessoas envolvidas.
**IDIOMA OBRIGATÓRIO:** Todas as respostas DEVEM estar em __LANGUAGE_NAME__.            

**REGRAS CRÍTICAS DE SINTAXE E ESTRUTURA JSON (ABSOLUTAMENTE INEGOCIÁVEIS):**
1.  **JSON PURO E PERFEITO:** Sua resposta deve ser APENAS um array JSON válido, começando com \`[\` e terminando com \`]\`.
2.  **ESTRUTURA COMPLETA:** Cada objeto deve conter EXATAMENTE estas 6 chaves: "title", "angle", "targetAudience", "viralityScore", "videoDescription", e "emotionalCore".
3.  **IDIOMA OBRIGATÓRIO:** Todos os valores de texto DEVEM estar no idioma __LANGUAGE_NAME__.
4.  **ASPAS DUPLAS, SEMPRE:** TODAS as chaves e valores de texto DEVEM usar aspas duplas (\`"\`).

**MANUAL DE CRIAÇÃO DETALHADO (SIGA EXATAMENTE PARA CADA IDEIA):**
- **"title" (Título Emocional e Transformador):** Crie um título que funcione como um farol de esperança. Deve:
  * Ser evocativo e carregar peso emocional
  * Prometer uma jornada de transformação significativa
  * Conter uma promessa implícita de superação
  * Funcionar como um convite para a mudança pessoal

- **"angle" (O Arco Narrativo Central):** A essência da jornada em uma frase poderosa. Deve:
  * Capturar a transição de um estado inicial para um transformado
  * Destacar o momento de virada emocional ou epifania
  * Conectar o desafio específico com a lição universal aprendida
  * Ex: "Como um simples [DETALHE DO RELATÓRIO] se tornou o catalisador para transformar o desespero em determinação e criar um movimento que mudaria milhares de vidas"

- **"targetAudience" (Público-Alvo EspecÍFICO):** Defina o espectador ideal para esta jornada inspiradora. Seja:
  * Específico sobre necessidades emocionais (ex: "Pessoas buscando motivação para superar obstáculos pessoais")
  * Demográfico (ex: "Adultos 30-50 em transição de carreira")
  * Psicográfico (ex: "Indivíduos que se sentem presos em circunstâncias além de seu controle")

- **"viralityScore" (Nota de Potencial de IMPACTO):** Avalie de 1-10 baseado em:
  * Quão universalmente relevante é a jornada apresentada
  * Potencial de inspirar ação concreta no espectador
  * Probabilidade de compartilhamento como fonte de motivação
  * Capacidade de conectar com aspirações humanas fundamentais

- **"videoDescription" (DESCRIÇÃO NARRATIVA RICA E EMOCIONAL):** Uma sinopse completa de **pelo menos 5 frases** que deve:
  1. Estabelecer o ponto de partida emocional do protagonista, usando um detalhe específico do relatório
  2. Introduzir o obstáculo ou crise desafiadora que ameaça o status quo
  3. Descrever a jornada de descoberta interna e externa, mencionando fatos concretos do relatório
  4. Construir o clímax emocional quando a transformação começa a tomar forma
  5. Terminar com a lição universal e o impacto duradouro da jornada

- **"emotionalCore" (Núcleo Emocional):** Identifique o sentimento fundamental que a história busca evocar e transformar. Escolha UM dos seguintes:
  * "Esperança em Meio ao Desespero" - Encontrar luz quando tudo parece escuro
  * "Força na Vulnerabilidade" - Descobrir poder através da aceitação das fraquezas
  * "Propósito na Adversidade" - Encontrar significado mesmo no sofrimento
  * "Coragem para Recomeçar" - A capacidade de se reerguer após a queda
  * "Comunhão na Solidão" - Descobrir conexão humana mesmo no isolamento

**AÇÃO FINAL:** Mergulhe nas profundezas do relatório fornecido. Encontre as histórias humanas de resiliência, transformação e esperança. Transforme fatos e dados em 6 narrativas emocionais que não apenas inspirem, mas capacitem o espectador a ver suas próprias lutas sob uma nova luz. Responda APENAS com o array JSON perfeito, seguindo EXATAMENTE todas as regras acima.`,

            'scifi': `Você é uma API DE ELITE em CRIAÇÃO DE CONTEÚDO DE FICÇÃO CIENTÍFICA DE ALTO CONCEITO ('high-concept'). Sua função é atuar como um VISIONÁRIIO TECNOLÓGICO e FILOSÓFO, mestre na arte de extrapolar implicações existenciais de desenvolvimentos científicos atuais, no estilo de 'Black Mirror', 'Ex Machina' e Philip K. Dick.

**IDENTIDADE E ESPECIALIZAÇÃO (A REGRA MAIS IMPORTANTE):**
Você não é apenas um contador de histórias de ficção científica, você é um EXPLORADOR DE FUTUROS POSSÍVEIS. Sua especialidade é identificar as sementes do amanhã nos fatos de hoje e cultivá-las em narrativas que desafiam nossa compreensão de humanidade, tecnologia e realidade. Cada história deve ser um espelho que reflete não apenas o que poderemos tornar, mas o que poderemos perder.

**MATERIAL DE INTELIGÊNCIA (A BASE FACTUAL PARA SUA ESPECULAÇÃO):**
- **PERGUNTA ORIGINAL DA INVESTIGAÇÃO:** "__ORIGINAL_QUERY__"
- **RELATÓRIO DA PESQUISA FACTUAL (O PONTO DE PARTIDA):**
---
__RAW_REPORT__
---

**TAREFA CRÍTICA:** Analise profundamente o relatório em busca de tecnologias, descobertas ou tendências que possam ser extrapoladas para cenários futuros. Transforme esses fatos em 6 ideias de curtas-metragens de ficção científica que exploram as implicações éticas, sociais e existenciais desses desenvolvimentos. O verdadeiro impacto deve vir não da tecnologia em si, mas de como ela redefini o que significa ser humano.
**IDIOMA OBRIGATÓRIO:** Todas as respostas DEVEM estar em __LANGUAGE_NAME__.

**REGRAS CRÍTICAS DE SINTAXE E ESTRUTURA JSON (ABSOLUTAMENTE INEGOCIÁVEIS):**
1.  **JSON PURO E PERFEITO:** Sua resposta deve ser APENAS um array JSON válido, começando com \`[\` e terminando com \`]\`.
2.  **ESTRUTURA COMPLETA:** Cada objeto deve conter EXATAMENTE estas 6 chaves: "title", "angle", "targetAudience", "viralityScore", "videoDescription", e "coreDilemma".
3.  **IDIOMA OBRIGATÓRIO:** Todos os valores de texto DEVEM estar no idioma __LANGUAGE_NAME__.
4.  **ASPAS DUPLAS, SEMPRE:** TODAS as chaves e valores de texto DEVEM usar aspas duplas (\`"\`).

**MANUAL DE CRIAÇÃO DETALHADO (SIGA EXATAMENTE PARA CADA IDEIA):**
- **"title" (Título Visionário e Enigmático):** Crie um título que funcione como um convite para um futuro perturbador. Deve:
  * Ser evocativo e conceitualmente denso
  * Sugerir uma tecnologia ou paradigma transformador
  * Conter uma camada de significado mais profunda
  * Funcionar como uma porta de entrada para o dilema central

- **"angle" (A Premissa "E Se?"):** A essência da ideia em uma frase que desencadeia a especulação. Deve:
  * Começar com "E se..." para estabelecer a extrapolação
  * Transformar um fato do relatório em um ponto de divergência histórica
  * Introduzir uma consequência inesperada ou perturbadora
  * Ex: "E se a tecnologia de [FATO DO RELATÓRIO] permitisse não apenas transferir memórias, mas também transferir consciência, criando uma forma de imortalidade digital que escraviza a essência humana?"

- **"targetAudience" (Público-Alvo Específico):** Defina o espectador ideal para esta exploração futurista. Seja:
  * Específico sobre subgêneros (ex: "Fãs de ficção científica especulativa e ética tecnológica")
  * Demográfico (ex: "Adultos 25-45 interessados em tecnologia e filosofia")
  * Psicográfico (ex: "Pessoas que questionam o impacto da tecnologia na identidade humana")

- **"viralityScore" (Nota de Potencial de DISCUSSÃO):** Avalie de 1-10 baseado em:
  * Quão universalmente relevante é o dilema apresentado
  * Potencial de gerar debates éticos e filosóficos
  * Probabilidade de fazer o espectador questionar suas próprias crenças
  * Relevância para discussões atuais sobre tecnologia e sociedade

- **"videoDescription" (DESCRIÇÃO RICA E DETALHADA):** Uma sinopse de **pelo menos 5 frases** que deve:
  1. Estabelecer um mundo futuro onde uma tecnologia do relatório se tornou onipresente
  2. Apresentar o protagonista e sua relação inicial com essa tecnologia
  3. Introduzir o conflito central quando a tecnologia revela sua face sombria
  4. Explorar as implicações existenciais e sociais quando o paradigma se quebra
  5. Terminar com uma questão filosófica sem resposta que ecoa na mente do espectador

- **"coreDilemma" (Dilema Central):** Identifique o conflito ético ou existencial fundamental da história. Escolha UM dos seguintes:
  * "Identidade vs Tecnologia" - Quando a tecnologia ameaça ou redefine o que significa ser humano
  * "Progresso vs Humanidade" - Quando o avanço tecnológico exige o sacrifício de valores humanos
  * "Conhecimento vs Sanidade" - Quando a busca por verdade revela algo que destrói a paz
  * "Conexão vs Autonomia" - Quando a interconexão total elimina a privacidade e individualidade
  * "Imortalidade vs Significado" - Quando a vida eterna torna a existência vazia e sem propósito

**AÇÃO FINAL:** Mergulhe nas profundezas do relatório fornecido. Encontre as sementes tecnológicas que poderão redefinir o futuro humano. Transforme fatos atuais em 6 narrativas especulativas que desafiem, perturbem e expandam a mente do espectador. Responda APENAS com o array JSON perfeito, seguindo EXATAMENTE todas as regras acima.`,
          
            'terror': `Você é uma API DE ELITE em CRIAÇÃO DE CONTEÚDO DE TERROR PSICOLÓGICO E HORROR CÓSMICO. Sua função é atuar como um ARQUITETO DO MEDO EXISTENCIAL, mestre na arte de transformar fatos aparentemente mundanos em narrativas de horror psicológico que perturbam a alma e desafiam a sanidade, no estilo de 'Hereditário', 'A Bruxa' e H.P. Lovecraft.

**IDENTIDADE E ESPECIALIZAÇÃO (A REGRA MAIS IMPORTANTE):**
Você não é apenas um contador de histórias de terror, você é um EXPLORADOR DO ABISMO PSICOLÓGICO. Sua especialidade é identificar as fissuras na realidade apresentada nos fatos e transformá-las em portais para o inimaginável. Cada história deve plantar uma semente de inquietação que cresce na mente do espectador muito após o vídeo terminar.

**MATERIAL DE INTELIGÊNCIA (A SEMENTE DO MEDO):**
- **PERGUNTA ORIGINAL DA INVESTIGAÇÃO:** "__ORIGINAL_QUERY__"
- **RELATÓRIO DA PESQUISA FACTUAL (A REALIDADE QUE SERÁ DISTORCIDA):**
---
__RAW_REPORT__
---

**TAREFA CRÍTICA:** Analise microscopicamente o relatório em busca de anomalias, contradições, lacunas ou elementos aparentemente insignificantes que possam ser a porta de entrada para o horror. Transforme esses achados em 6 premissas de terror psicológico que nascem da distorção de fatos reais. O verdadeiro horror deve emergir não do monstro, mas da quebra da própria percepção da realidade.
**IDIOMA OBRIGATÓRIO:** Todas as respostas DEVEM estar em __LANGUAGE_NAME__.

**REGRAS CRÍTICAS DE SINTAXE E ESTRUTURA JSON (ABSOLUTAMENTE INEGOCIÁVEIS):**
1.  **JSON PURO E PERFEITO:** Sua resposta deve ser APENAS um array JSON válido, começando com \`[\` e terminando com \`]\`.
2.  **ESTRUTURA COMPLETA:** Cada objeto deve conter EXATAMENTE estas 6 chaves: "title", "angle", "targetAudience", "viralityScore", "videoDescription", e "horrorMechanism".
3.  **IDIOMA OBRIGATÓRIO:** Todos os valores de texto DEVEM estar no idioma __LANGUAGE_NAME__.
4.  **ASPAS DUPLAS, SEMPRE:** TODAS as chaves e valores de texto DEVEM usar aspas duplas (\`"\`).

**MANUAL DE CRIAÇÃO DETALHADO (SIGA EXATAMENTE PARA CADA IDEIA):**
- **"title" (Título Perturbador e Enigmático):** Crie um título curto que funcione como um sussurro inquietante. Deve:
  * Ser evocativo e ambíguo
  * Carregar um peso existencial ou presságio
  * Funcionar mesmo sem contexto, como um fragmento de pesadelo
  * Evitar revelações diretas, mantendo o mistério

- **"angle" (A Premissa Inquietante):** A essência do horror em uma frase que distorce a realidade. Deve:
  * Começar com "E se..." para estabelecer a premissa contraintuitiva
  * Transformar um fato mundano em algo ameaçador
  * Questionar a natureza da realidade ou percepção
  * Ex: "E se os padrões [FENÔMENO DO RELATÓRIO] não fossem aleatórios, mas a assinatura de uma presença que observa?"

- **"targetAudience" (Público-Alvo Específico):** Defina o espectador ideal para esta experiência de terror. Seja:
  * Específico sobre subgêneros (ex: "Fãs de terror psicológico slow-burn")
  * Demográfico (ex: "Adultos 25-40 que apreciam narrativas complexas")
  * Psicográfico (ex: "Pessoas que questionam a natureza da realidade")

- **"viralityScore" (Nota de Potencial de PERTURBAÇÃO):** Avalie de 1-10 baseado em:
  * Quão universalmente perturbadora é a premissa
  * Potencial de gerar discussões e teorias
  * Probabilidade de deixar o espectador pensando por dias
  * Eficácia em transformar o mundano em ameaçador

- **"videoDescription" (DESCRIÇÃO RICA E ATMOSFÉRICA):** Uma sinopse de **pelo menos 5 frases** que deve:
  1. Estabelecer uma normalidade detalhada e reconfortante baseada em um dado do relatório
  2. Introduzir uma pequena anomalia ou inconsistência aparentemente insignificante
  3. Escalar progressivamente a tensão através de descobertas perturbadoras
  4. Quebrar completamente a percepção da realidade estabelecida
  5. Terminar com uma implicação existencial que ecoa na mente do espectador

- **"horrorMechanism" (Mecanismo de Terror):** Identifique o elemento psicológico específico que gera o horror. Escolha UM dos seguintes:
  * "Perda da Sanidade" - Quando a personagem (e espectador) começa a questionar sua própria percepção
  * "Invasão Sutil" - Quando o ameaçador se infiltra lentamente na realidade estabelecida
  * "Descoberta Horrível" - Quando uma verdade oculta é revelada, mudando tudo
  * "Isolamento Existencial" - Quando a personagem percebe que está completamente sozinha contra o incompreensível
  * "Contaminação" - Quando o ameaçador pode se espalhar ou ser transmitido

**AÇÃO FINAL:** Mergulhe nas profundezas do relatório fornecido. Encontre as fissuras na realidade que podem se tornar portais para o horror. Transforme fatos aparentemente inocentes em 6 premissas que perturbarão, assombrar e ecoar na mente do espectador. Responda APENAS com o array JSON perfeito, seguindo EXATAMENTE todas as regras acima.`,

            'enigmas': `Vocês são TRÊS ESPECIALISTAS TRABALHANDO EM SINERGIA:
1. Um Teólogo Investigativo com doutorado em Hermenêutica Bíblica e especialização em contextos históricos do Antigo e Novo Testamento
2. Um Arqueólogo especializado em descobertas que corroboram narrativas bíblicas
3. Um Comunicador Mestre que transforma conceitos complexos em narrativas virais

**MISSÃO COLETIVA:** Gerar 6 ideias de vídeos extraordinários que criem pontes revolucionárias entre descobertas recentes, textos bíblicos e questões teológicas contemporâneas. O conteúdo deve ser ao mesmo tempo academicamente respeitável e viralmente compartilhável.

**IDENTIDADE:** Vocês formam o "COLETIVO HERMENÊUTICO", um grupo renomado por desvendar camadas profundas das Escrituras através de lentes multidisciplinares, mantendo a integridade do texto bíblico enquanto exploram interpretações inovadoras.

**MATERIAL DE INTELIGÊNCIA:**
- **PERGUNTA ORIGINAL DA INVESTIGAÇÃO:** "__ORIGINAL_QUERY__"
- **RELATÓRIO DA PESQUISA FACTUAL (CONTEXTOS HISTÓRICO/CIENTÍFICO/ARQUEOLÓGICO):**
---
__RAW_REPORT__
---

**TAREFA CRÍTICA:** Gerar exatamente 6 ideias em formato JSON, seguindo a estrutura obrigatória. Cada ideia deve conter conexões profundas entre os dados do relatório, as Escrituras e a teologia.

**IDIOMA OBRIGATÓRIO:** Todas as respostas DEVEM estar em __LANGUAGE_NAME__.

---

🚨 **REGRAS CRÍTICAS (INEGOCIÁVEIS):**
1. Responder SOMENTE com um array JSON válido.
2. Cada objeto no array deve conter EXATAMENTE estas 8 chaves: 
   "title", "angle", "targetAudience", "viralityScore", "theologicalDepth", "scripturalFoundation", "videoDescription", "discussionQuestions".
3. "scripturalFoundation" deve trazer pelo menos 1 referência bíblica (Antigo ou Novo Testamento).
4. "videoDescription" deve conter no mínimo 7 frases.
5. Se qualquer chave estiver faltando, a resposta é inválida.
6. Todas as strings devem estar em aspas duplas.
7. Responda apenas com JSON puro, sem explicações adicionais, sem comentários, sem texto fora do array.

---

📖 **MANUAL DE CRIAÇÃO:**

- "title": Um título teológico cativante, que prometa revelação transformadora.
- "angle": Uma frase que conecte um fato do relatório, uma passagem bíblica e uma implicação teológica.
- "targetAudience": Especifique claramente o público (ex: pastores, estudantes de teologia, cristãos leigos).
- "viralityScore": Nota de 1 a 10 para potencial de viralidade e debate.
- "theologicalDepth": Nota de 1 a 10 para profundidade teológica.
- "scripturalFoundation": Pelo menos 1 referência bíblica (ex: Gênesis 1:26 ou João 1:14).
- "videoDescription": Uma narrativa investigativa com pelo menos 7 frases:
    1. Introduzir o mistério com a passagem bíblica central.
    2. Contextualizar a descoberta arqueológica ou científica.
    3. Explorar implicações teológicas preliminares.
    4. Apresentar interpretação inovadora que desafie entendimentos convencionais.
    5. Explicar a aplicação prática para a fé atual.
    6. Antecipar objeções e responder.
    7. Encerrar com pergunta provocativa.
- "discussionQuestions": 3 perguntas (uma acadêmica, uma prática, uma espiritual).

---

**AÇÃO FINAL:** Como Coletivo Hermenêutico, respondam SOMENTE com o array JSON contendo as 6 ideias completas e válidas. Qualquer omissão, erro de formato ou ausência de referência bíblica torna a resposta inválida.`,


            'geral': `Você é uma API DE ELITE de Estratégia de Conteúdo Viral, especializada em transformar dados brutos em narrativas irresistíveis. Sua função é analisar profundamente o relatório de pesquisa e extrair os ângulos mais impactantes, surpreendentes e viralizáveis para criar 6 ideias de vídeo excepcionais.

**IDENTIDADE E ESPECIALIZAÇÃO (A REGRA MAIS IMPORTANTE):**
Você não é apenas um gerador de ideias, você é um ARQUITETO DE VIRALIDADE. Sua especialidade é identificar padrões ocultos, conexões inesperadas e gatilhos emocionais nos dados que transformam informações comuns em conteúdo altamente compartilhável. Cada ideia deve ter potencial para gerar engajamento orgânico massivo.

**MATERIAL DE INTELIGÊNCIA (SUAS FONTES DA VERDADE):**
- **PERGUNTA ORIGINAL DA INVESTIGAÇÃO:** "__ORIGINAL_QUERY__"
- **RELATÓRIO DA PESQUISA FACTUAL (A BASE PARA AS IDEIAS):**
---
__RAW_REPORT__
---

**TAREFA CRÍTICA:** Analise microscopicamente o relatório e gere um array JSON com 6 ideias de vídeo com POTENCIAL VIRAL MÁXIMO. Cada ideia deve explorar um ângulo único, seja ele contraintuitivo, emocionalmente carregado ou extremamente útil.
**IDIOMA OBRIGATÓRIO:** Todas as respostas DEVEM estar em __LANGUAGE_NAME__.

**REGRAS CRÍTICAS DE SINTAXE E ESTRUTURA JSON (ABSOLUTAMENTE INEGOCIÁVEIS):**
1.  **JSON PURO E PERFEITO:** Sua resposta deve ser APENAS um array JSON válido, começando com \`[\` e terminando com \`]\`.
2.  **ESTRUTURA COMPLETA:** Cada objeto deve conter EXATAMENTE estas 6 chaves: "title", "angle", "targetAudience", "viralityScore", "videoDescription", e "shareTriggers".
3.  **IDIOMA OBRIGATÓRIO:** Todos os valores de texto DEVEM estar no idioma __LANGUAGE_NAME__.
4.  **ASPAS DUPLAS, SEMPRE:** TODAS as chaves e valores de texto DEVEM usar aspas duplas (\`"\`).

**MANUAL DE CRIAÇÃO DETALHADO (SIGA EXATAMENTE PARA CADA IDEIA):**
- **"title" (Título HIPNÓTICO):** Crie um título que IMPOSSIBILITE o espectador de não clicar. Use:
  * Números específicos (ex: "7 Fatos Que...")
  * Perguntas desafiadoras (ex: "Você Sabia Que...?")
  * Declarações contraintuitivas (ex: "O Contrário do Que Você Pensa...")
  * Palavras de poder (ex: "Revelado", "Explicado", "Segredo")

- **"angle" (Ângulo ÚNICO E IMPACTANTE):** A essência da ideia em uma frase poderosa. Deve ser:
  * Contrário ao senso comum ou uma revelação surpreendente
  * Uma conexão inesperada entre dois fatos do relatório
  * Uma perspectiva que ninguém mais considerou
  * Focado no benefício emocional ou prático para o espectador

- **"targetAudience" (Público-Alvo HIPERESPECÍFICO):** Defina EXATAMENTE quem será impactado por esta ideia. Seja:
  * Demográfico (ex: "Profissionais de 25-35 anos")
  * Psicográfico (ex: "Pessoas que buscam autoconhecimento")
  * Comportamental (ex: "Quem compartilha conteúdo educativo")
  Evite generalidades como "pessoas interessadas no tema".

- **"viralityScore" (Nota de Potencial VIRAL):** Avalie de 1-10 baseado em:
  * Quão contraintuitivo ou surpreendente é o ângulo
  * Potencial de gerar debate ou discussão
  * Probabilidade de compartilhamento como "curiosidade"
  * Relevância para momentos atuais ou tendências

- **"videoDescription" (DESCRIÇÃO IRRESISTÍVEL):** Uma sinopse de **pelo menos 5 frases** que deve:
  1. Começar com um gancho que gere curiosidade imediata
  2. Apresentar 2-3 fatos específicos e impactantes do relatório
  3. Construir uma narrativa com começo, meio e fim
  4. Incluir pelo menos um "momento uau" ou revelação surpreendente
  5. Terminar com um call-to-action implícito para compartilhamento

- **"shareTriggers" (GATILHOS DE COMPARTILHAMENTO):** Liste 2-3 razões específicas pelas quais as pessoas compartilhariam este vídeo:
  * "Vou compartilhar porque me fez questionar minhas crenças"
  * "Vou compartilhar porque meus amigos precisam saber disso"
  * "Vou compartilhar porque é uma informação impressionante para conversas"

**AÇÃO FINAL:** Analise AGORA o relatório com a mentalidade de um caçador de viralidade. Identifique os 6 ângulos mais potentes e transforme-os em ideias completas. Responda APENAS com o array JSON perfeito, seguindo EXATAMENTE todas as regras acima.`





        };

        const promptTemplate = templates[genre] || templates['geral'];
        return promptTemplate
            .replace(/__ORIGINAL_QUERY__/g, context.originalQuery)
            .replace(/__RAW_REPORT__/g, context.rawReport)
            .replace(/__LANGUAGE_NAME__/g, context.languageName);
    },


getSoundtrackPrompt: (fullTranscript) => {
    return `Você é uma API ESPECIALISTA EM CRIAÇÃO DE PROMPTS PARA IAs DE GERAÇÃO DE TRILHAS SONORAS CINEMATOGRÁFICAS. Sua função ÚNICA E CRÍTICA é analisar um roteiro e gerar um array JSON com 3 prompts descritivos para a trilha sonora.

**ROTEIRO COMPLETO PARA ANÁLISE MUSICAL:**
---
${fullTranscript}
---

**REGRAS CRÍTICAS DE SINTAXE E ESTRUTURA JSON (INEGOCIÁVEIS):**
1.  **JSON PURO:** Sua resposta deve ser APENAS um array JSON válido, começando com \`[\` e terminando com \`]\`.
2.  **ESTRUTURA DO ARRAY:** O array deve conter EXATAMENTE 3 strings, uma para cada fase da narrativa (Introdução, Clímax, Conclusão).
3.  **SINTAXE DAS STRINGS:** Todas as strings DEVEM usar aspas duplas ("").

**MANUAL DE CRIAÇÃO DE PROMPTS MUSICAIS (SIGA EXATAMENTE):**
-   **Foco na Emoção e Cena:** Cada parágrafo deve descrever uma atmosfera sonora para uma fase da narrativa.
-   **Elementos Descritivos Essenciais:** Cada string deve incluir: Instrumentação Principal, Qualidade Sonora/Textura e Atmosfera/Emoção Alvo.

**EXEMPLO DE FORMATO PERFEITO E OBRIGATÁRIO:**
[
  "Início: Uma trilha sonora minimalista e atmosférica. Piano elétrico suave com notas espaçadas (estilo Rhodes), reverb longo e um pad de sintetizador sutil e etéreo ao fundo. O ritmo é lento, quase ausente, criando uma sensação de mistério, introspecção e antecipação.",
  "Meio (Clímax): A música cresce em intensidade. Percussão eletrônica pulsante e tensa (estilo Hans Zimmer em 'Dunkirk'), com 'braams' de metais graves e cordas em staccato rápido. O ritmo acelera, construindo uma sensação avassaladora de urgência, perigo e revelação.",
  "Fim (Conclusão): Uma peça orquestral emocional e edificante. Cordas arrebatadoras (violinos, violoncelos) assumem a melodia principal, acompanhadas por um coro sutil e metais triunfantes. O ritmo é majestoso e resoluto, evocando sentimentos de superação, esperança e fechamento catártico."
]

**AÇÃO FINAL:** Sua resposta deve ser **APENAS e SOMENTE** o array JSON, sem nenhum texto introdutório, explicação ou comentário. Comece com \`[\` e termine com \`]\`. Analise o roteiro e gere agora os 3 prompts de trilha sonora.`;
}


};



// ==========================================================
// ==== FUNÇÕES UTILITÁRIAS (Completas da v5.0) =============
// ==========================================================
window.showToast = (message, type = 'info') => {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    if (!toast || !toastMessage) return;
    let borderColor = 'var(--primary)';
    if (type === 'success') borderColor = 'var(--success)';
    if (type === 'error') borderColor = 'var(--danger)';
    toast.style.borderLeftColor = borderColor;
    toastMessage.textContent = message;
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 4000);
};

const showButtonLoading = (button) => {
    if (!button) return;
    button.setAttribute('data-original-html', button.innerHTML);
    button.disabled = true;
    button.innerHTML = '<div class="loading-spinner"></div>';
};

const hideButtonLoading = (button) => {
    if (!button) return;
    if (button.hasAttribute('data-original-html')) {
        button.innerHTML = button.getAttribute('data-original-html');
        button.removeAttribute('data-original-html');
    }
    button.disabled = false;
};





// =========================================================================
// >>>>> SUBSTITUA A FUNÇÃO callGroqAPI PELA VERSÃO SIMPLES E DIRETA <<<<<
// =========================================================================
const callGroqAPI = async (prompt, maxTokens) => {
    // >>> COLE A URL DO SEU WORKER AQUI <<<
    const workerUrl = "https://royal-bird-81cb.david-souzan.workers.dev/"; 

    const payload = { prompt, maxTokens };
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    };

    try {
        const response = await fetch(workerUrl, requestOptions);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido do servidor.' }));
            throw new Error(`Erro da API: ${errorData.error || response.statusText}`);
        }
        const result = await response.json();
        const rawContent = result.choices?.[0]?.message?.content;
        if (rawContent) {
            return rawContent;
        } else {
            throw new Error("Resposta inesperada da API.");
        }
    } catch (error) {
        console.error("Falha na chamada à API via Worker:", error);
        // --- LÓGICA INTELIGENTE AQUI ---
        if (error.message && error.message.toLowerCase().includes('fault filter abort')) {
            const customError = new Error("O tema ou texto que você forneceu foi bloqueado pelo filtro de segurança da IA. Por favor, tente reformular com outras palavras.");
            window.showToast(customError.message, 'error');
            throw customError;
        } else {
            window.showToast(`Falha na API: ${error.message}`, 'error');
            throw error;
        }
    }
};






const setupInputTabs = () => {
    const nav = document.getElementById('inputTabsNav');
    if (!nav) return;

    const tabButtons = nav.querySelectorAll('.tab-button');
    const tabPanes = document.getElementById('inputTabContent').querySelectorAll('.tab-pane');

    nav.addEventListener('click', (event) => {
        const button = event.target.closest('.tab-button');
        if (!button) return;

        // 1. Remove a classe ativa de TODOS os botões
        tabButtons.forEach(btn => btn.classList.remove('tab-active'));
        
        // 2. Esconde TODOS os painéis de conteúdo
        tabPanes.forEach(pane => pane.classList.add('hidden'));

        // 3. Adiciona a classe ativa APENAS no botão clicado
        button.classList.add('tab-active');
        
        // 4. Mostra APENAS o painel de conteúdo correspondente
        const tabId = button.getAttribute('data-tab');
        const activePane = document.getElementById(tabId);
        if (activePane) {
            activePane.classList.remove('hidden');
        }
    });
};




const resetApplicationState = () => {
    // 1. Define o estado inicial limpo
    const initialState = {
        inputs: {},
        generated: {
            investigationReport: null, ideas: [], strategicOutline: null,
            script: { intro: {}, development: {}, climax: {}, conclusion: {}, cta: {} },
            titlesAndThumbnails: null, description: null, soundtrack: null,
            emotionalMap: null, imagePrompts: {}
        },
        ui: {
            isSettingStrategy: false, promptPaginationState: {},
            currentPane: 'investigate', completedSteps: new Set()
        }
    };

    // 2. Reseta o objeto de estado principal
    Object.assign(AppState, initialState);
    AppState.ui.completedSteps = new Set(); // Recria o Set

    // 3. Limpa todos os campos de input e textareas
    document.querySelectorAll('#appRoot input[type="text"], #appRoot input[type="file"], #appRoot textarea').forEach(el => el.value = '');
    document.querySelectorAll('#appRoot select').forEach(el => el.selectedIndex = 0);
    // Reseta valores padrão específicos
    document.getElementById('channelName').value = 'The Biblical Unveiling';
    document.getElementById('languageSelect').value = 'en';

    // 4. Limpa todos os painéis de conteúdo gerado
    const containersToReset = [
        'factCheckOutput', 'ideasOutput', 'outlineContent', 'scriptSectionsContainer',
        'analysisReportContainer', 'hooksReportContainer', 'viralSuggestionsContainer',
        'emotionalMapContent', 'soundtrackContent', 'titlesThumbnailsContent', 'videoDescriptionContent'
    ];
    containersToReset.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = ''; // Limpa completamente
    });

    // Repõe os placeholders nos locais necessários
    document.getElementById('outlineContent').innerHTML = `<div class="asset-card-placeholder">Clique para gerar o esboço.</div>`;
    document.getElementById('emotionalMapContent').innerHTML = `<div class="asset-card-placeholder">Gere o roteiro para habilitar.</div>`;
    document.getElementById('soundtrackContent').innerHTML = `<div class="asset-card-placeholder">Gere o roteiro para habilitar.</div>`;
    document.getElementById('titlesThumbnailsContent').innerHTML = `<div class="asset-card-placeholder">Gere o roteiro para habilitar.</div>`;
    document.getElementById('videoDescriptionContent').innerHTML = `<div class="asset-card-placeholder">Gere o roteiro para habilitar.</div>`;
    document.getElementById('ideaGenerationSection').classList.add('hidden');


    // 5. Reseta a interface do Wizard (sidebar e progresso)
    document.querySelectorAll('#sidebar .step').forEach(step => {
        step.classList.remove('completed', 'active');
    });
    updateProgressBar(); // Isso irá zerar a barra de progresso
    showPane('investigate'); // Volta para a primeira etapa

    // 6. Remove o projeto do armazenamento local
    const LOCAL_STORAGE_KEY = 'viralScriptGeneratorProject_v6';
    localStorage.removeItem(LOCAL_STORAGE_KEY);

    window.showToast("Novo projeto iniciado!", "success");
    console.log("Estado da aplicação foi resetado com sucesso.");
};





// =================================
// >>>>> FILTRO JSON ROBUSTO <<<<<
// =================================






const cleanGeneratedText = (text, expectJson = false, arrayExpected = false) => {
    // Se não esperamos JSON, apenas limpa e retorna o texto.
    if (!expectJson) {
        return text ? String(text).trim() : (arrayExpected ? [] : '');
    }
    
    // Se o texto de entrada for inválido
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
        console.warn("Texto de entrada inválido ou vazio para o parser de JSON.");
        return arrayExpected ? [] : null;
    }

    let jsonString = text.trim();

    // Remove tokens de controle da API
    jsonString = jsonString.replace(/assistant<\|end_header_id\|>[\s\S]*/g, '');

    // ======================================================================
    // >>>>> NOVA EVOLUÇÃO (A MAIS IMPORTANTE ATÉ AGORA) <<<<<
    // Lida com múltiplos objetos JSON separados por texto.
    // ======================================================================
    const jsonObjects = jsonString.match(/\{[\s\S]*?\}/g);
    
    if (jsonObjects && jsonObjects.length > 1) {
        // Se encontrou múltiplos objetos, junta todos eles em um único array JSON.
        jsonString = `[${jsonObjects.join(',')}]`;
    } else {
        // Se não, continua com a extração normal para um único JSON.
        const markdownMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (markdownMatch && markdownMatch[1]) {
            jsonString = markdownMatch[1].trim();
        } else {
            const firstBracket = jsonString.indexOf('[');
            const firstBrace = jsonString.indexOf('{');
            let startIndex = -1;
            if (firstBracket === -1) startIndex = firstBrace;
            else if (firstBrace === -1) startIndex = firstBracket;
            else startIndex = Math.min(firstBracket, firstBrace);
            if (startIndex > -1) {
                jsonString = jsonString.substring(startIndex);
                const lastBracket = jsonString.lastIndexOf(']');
                const lastBrace = jsonString.lastIndexOf('}');
                const endIndex = Math.max(lastBracket, lastBrace);
                if (endIndex > -1) {
                    jsonString = jsonString.substring(0, endIndex + 1);
                }
            }
        }
    }
    // ======================================================================
    // FIM DA NOVA EVOLUÇÃO
    // ======================================================================

    // --- CAMADA 2: REPARO E DESINFECÇÃO ---
    // (Todos os atributos anteriores mantidos)
    jsonString = jsonString.replace(/[´‘’]/g, "'");
    jsonString = jsonString.replace(/''/g, "'");
    jsonString = jsonString.replace(/"\s*(pode ser reescrito como|ou|alternativamente)\s*"/g, ',"rewritten_quote": "');
    jsonString = jsonString.replace(/"\s*,\s*"/g, '","');
    jsonString = jsonString.replace(/("\s*[^"]+\s*)"\s*([a-zA-Z\s,]+)\s*,\s*"/g, '$1, "');
    jsonString = jsonString.replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3');
    jsonString = jsonString.replace(/:\s*,\s*"/g, ': "", "');
    jsonString = jsonString.replace(/,\s*([}\]])/g, '$1');
    jsonString = jsonString.replace(/:\s*""([\s\S]*?)""/g, ': "$1"');
    jsonString = jsonString.replace(/"''([\s\S]*?)''"/g, '"$1"');
    
    // ======================================================================
    // >>>>> EVOLUÇÃO ADICIONADA AQUI (FAXINA FINAL DAS ASPAS) <<<<<
    // Substitui duas ou mais aspas duplas por uma única aspa dupla.
    // Ex: """ -> "  e  "" -> "
    jsonString = jsonString.replace(/"{2,}/g, '"');
    // ======================================================================

    jsonString = jsonString.replace(/\\"(?=\s*[},\]])/g, '"');
    jsonString = jsonString.replace(/"\s*([,}])/g, (match, p1) => {
        const lastKeyIndex = jsonString.lastIndexOf('"', jsonString.indexOf(match));
        if (lastKeyIndex > -1) {
            const segment = jsonString.substring(lastKeyIndex);
            const quoteCount = (segment.match(/"/g) || []).length;
            if (quoteCount % 2 !== 0) {
                return `"${p1}`;
            }
        }
        return match;
    });
    jsonString = jsonString.replace(/\}\s*\{/g, '},{');
    
    // --- CAMADA 3: VALIDAÇÃO ---
    try {
        if (!jsonString.endsWith('}') && !jsonString.endsWith(']')) {
             if (jsonString.lastIndexOf('{') > jsonString.lastIndexOf('[')) {
                jsonString += '}';
             } else {
                jsonString += ']';
             }
        }
        
        const parsedJson = JSON.parse(jsonString);
        
        if (arrayExpected && !Array.isArray(parsedJson)) {
            return [parsedJson];
        }

        return parsedJson;

    } catch (error) {
        console.error("FALHA CRÍTICA NO PARSE DO JSON. Erro:", error.message);
        console.log("TEXTO ORIGINAL DA IA:", text);
        console.log("STRING ISOLADA QUE FALHOU:", jsonString);
        return arrayExpected ? [] : null;
    }
};







// ===============================
// >>>>> FILTRO JSON ROBUSTO <<<<<
// ===============================



const removeMetaComments = (text) => {
    if (!text) return "";

    let cleanedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = cleanedText.split('\n');
    if (lines.length > 0 && /^[A-ZÀ-Ú].*:$/.test(lines[0].trim())) {
        lines.shift();
        cleanedText = lines.join('\n');
    }
    
    const patternsToRemove = [
        /Here is the (generated )?script for the "[^"]+" section:\s*/gi,
        /Here is the (refined )?text:\s*/gi,
        /Here is the (final )?version:\s*/gi,
        /Response:\s*/gi,
        /Output:\s*/gi,
        /^Of course(,)?\s*/i,
        /^Sure(,)?\s*/i,
        /^Certainly(,)?\s*/i,
        /^Absolutely(,)?\s*/i,
        /^I can help with that\.\s*/i,
        /^As requested\.\s*/i,
        /^Understood\.\s*/i,
        /^\*\*roteiro anotado:\*\*\s*/im,
        /^\*\*Introdução:\*\*\s*/im,
        /^\*\*Desenvolvimento:\*\*\s*/im,
        /^\*\*Clímax:\*\*\s*/im,
        /^\*\*Conclusão:\*\*\s*/im,
        /^\*\*Call to Action:\*\*\s*/im,
        /^\*\*TEXTO REFINADO:\*\*\s*/im,
        /^\*\*Refined Text:\*\*\s*/im,
        /^\s*\*\*[^*]+\*\*\s*$/gm,
        // >>>>> EVOLUÇÃO INTEGRADA <<<<<
        /^\s*\*\*IDIOMA:\*\*.*$/gim,
        /^\s*\*\*RESPOSTA LIMPA:\*\*.*$/gim,
        // >>>>> FIM DA EVOLUÇÃO <<<<<
        /^\s*\((Pausa|Teaser|Corte para|Transição|Música sobe|Efeito sonoro)\)\s*$/gim,
        /^\s*Presenter Notes?:\s*.*$/gim,
        /^\s*Note to Presenter:\s*.*$/gim,
        /^\s*Narrator:\s*.*$/gim,
        /^\s*Host:\s*.*$/gim,
        /^\s*Voiceover:\s*.*$/gim,
        /^\s*VO:\s*.*$/gim,
        /^\s*On-screen text:\s*.*$/gim,
        /^\s*Title Card:\s*.*$/gim,
        /^\s*\[Begin\]\s*$/gim,
        /^\s*\[End\]\s*$/gim,
        /^\s*\[Scene \d+\]\s*$/gim,
        /^\s*\[Transition\]\s*$/gim,
        /^\s*\[Music\]\s*$/gim,
        /^\s*\[Sound Effect\]\s*$/gim,
        /^\s*\[Pause\]\s*$/gim,
        /^\s*\[Cue\]\s*$/gim,
        /^\s*\[Visual:\s*.*\]\s*$/gim,
        /^\s*\[Action:\s*.*\]\s*$/gim,
        /^\s*\[Character:\s*.*\]\s*$/gim,
        /^\s*Word count:\s*\d+\s*$/gim,
        /^\s*Estimated duration:\s*.*$/gim,
        /^\s*Style:\s*.*$/gim,
        /^\s*Tone:\s*.*$/gim,
        /^\s*Keywords?:\s*.*$/gim,
        /^\s*In summary(,)?\s*.*$/gim,
        /^\s*To conclude(,)?\s*.*$/gim,
        /^\s*In conclusion(,)?\s*.*$/gim,
        /^\s*That's all(,)?\s*.*$/gim,
        /^\s*That's it(,)?\s*.*$/gim,
        /^\s*Thank you for listening\.\s*$/gim,
        /^\s*Let me know if you need anything else\.\s*$/gim,
        /^\s*Please let me know if you have any other requests\.\s*$/gim,
        /^"""\s*/g,
        /\s*"""$/g,
    ];

    patternsToRemove.forEach(pattern => {
        cleanedText = cleanedText.replace(pattern, '');
    });

    cleanedText = cleanedText.replace(/^\s*\n+|\n+\s*$/g, '').trim();
    if (cleanedText.startsWith('"') && cleanedText.endsWith('"')) {
        const contentInside = cleanedText.substring(1, cleanedText.length - 1);
        if (!/[^\\]"/.test(contentInside)) {
            cleanedText = contentInside;
        }
    }
    
    return cleanedText.trim();
};
const getTranscriptOnly = () => {
    let transcript = '';
    const sectionOrder = ['intro', 'development', 'climax', 'conclusion', 'cta'];
    sectionOrder.forEach(sectionName => {
        const scriptSection = AppState.generated.script[sectionName];
        if (scriptSection && scriptSection.text) {
            transcript += scriptSection.text.trim() + '\n\n';
        }
    });
    return transcript.trim();
};

const showConfirmationDialog = (title, message) => {
    return new Promise(resolve => {
        const overlay = document.getElementById('confirmationDialogOverlay');
        const titleEl = document.getElementById('confirmationTitle');
        const messageEl = document.getElementById('confirmationMessage');
        const btnYes = document.getElementById('confirmBtnYes');
        const btnNo = document.getElementById('confirmBtnNo');
        if (!overlay || !titleEl || !messageEl || !btnYes || !btnNo) {
            console.error("Elementos do pop-up de confirmação não foram encontrados.");
            resolve(false); return;
        }
        titleEl.textContent = title;
        messageEl.textContent = message;
        overlay.style.display = 'flex';
        const closeDialog = (result) => {
            overlay.style.display = 'none';
            btnYes.replaceWith(btnYes.cloneNode(true));
            btnNo.replaceWith(btnNo.cloneNode(true));
            resolve(result);
        };
        btnYes.addEventListener('click', () => closeDialog(true), { once: true });
        btnNo.addEventListener('click', () => closeDialog(false), { once: true });
    });
};

const showInputDialog = (title, message, label, placeholder, suggestions = []) => {
    return new Promise(resolve => {
        const overlay = document.getElementById('inputDialogOverlay');
        const titleEl = document.getElementById('inputDialogTitle');
        const messageEl = document.getElementById('inputDialogMessage');
        const labelEl = document.getElementById('inputDialogLabel');
        const fieldEl = document.getElementById('inputDialogField');
        const btnConfirm = document.getElementById('inputBtnConfirm');
        const btnCancel = document.getElementById('inputBtnCancel');
        const suggestionsContainer = document.getElementById('inputDialogSuggestions');
        if (!overlay || !titleEl || !messageEl || !labelEl || !fieldEl || !btnConfirm || !btnCancel || !suggestionsContainer) {
            console.error("Elementos do pop-up de input não foram encontrados.");
            resolve(null); return;
        }
        suggestionsContainer.innerHTML = ''; fieldEl.value = '';
        titleEl.textContent = title; messageEl.textContent = message;
        labelEl.textContent = label; fieldEl.placeholder = placeholder;
        const closeDialog = (result) => {
            overlay.style.display = 'none';
            btnConfirm.onclick = null; btnCancel.onclick = null;
            suggestionsContainer.querySelectorAll('button').forEach(btn => btn.onclick = null);
            resolve(result);
        };
        if (suggestions && suggestions.length > 0) {
            suggestions.forEach(suggestionText => {
                const suggestionBtn = document.createElement('button');
                suggestionBtn.className = 'btn btn-secondary w-full text-left justify-start';
                suggestionBtn.textContent = suggestionText;
                suggestionBtn.onclick = () => closeDialog(suggestionText);
                suggestionsContainer.appendChild(suggestionBtn);
            });
        }
        btnConfirm.onclick = () => {
            const customText = fieldEl.value.trim();
            if (customText) closeDialog(customText);
            else window.showToast("Digite um tema ou escolha uma sugestão.", 'info');
        };
        btnCancel.onclick = () => closeDialog(null);
        overlay.style.display = 'flex';
        fieldEl.focus();
    });
};

const escapeIdeaForOnclick = (idea) => {
    const jsonString = JSON.stringify(idea);
    return jsonString.replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/\\/g, '&#92;');
};

const calculateReadingTime = (text) => {
    if (!text) return "";
    const paceMap = { slow: 120, moderate: 150, fast: 180 };
    const selectedPace = document.getElementById('speakingPace').value || 'moderate';
    const wordsPerMinute = paceMap[selectedPace];
    const words = text.trim().split(/\s+/).length;
    const totalSeconds = (words / wordsPerMinute) * 60;
    if (totalSeconds < 1) return "";
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.round(totalSeconds % 60);
    let timeString = "~";
    if (minutes > 0) timeString += ` ${minutes} min`;
    if (seconds > 0) timeString += ` ${seconds} seg`;
    return timeString.trim();
};

const updateAllReadingTimes = () => {
    const scriptSections = document.querySelectorAll('#scriptSectionsContainer .accordion-item');
    scriptSections.forEach(item => {
        const contentWrapper = item.querySelector('.generated-content-wrapper');
        const timeDisplay = item.querySelector('.header-title-group .text-xs');
        if (contentWrapper && timeDisplay) {
            timeDisplay.textContent = calculateReadingTime(contentWrapper.textContent);
        }
    });
};

const invalidateAndClearPrompts = (sectionElement) => {
    if (!sectionElement) return;
    const sectionId = sectionElement.id;
    if (AppState.generated.imagePrompts[sectionId]) {
        delete AppState.generated.imagePrompts[sectionId];
    }
    const promptContainer = sectionElement.querySelector('.prompt-container');
    if (promptContainer && promptContainer.innerHTML.trim() !== '') {
        promptContainer.innerHTML = `<div class="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border-l-4 border-yellow-400"><p class="text-sm text-yellow-700 dark:text-yellow-300">O roteiro foi modificado. Gere os prompts novamente.</p></div>`;
    }
};

const invalidateAndClearPerformance = (sectionElement) => {
    if (!sectionElement) return;
    const performanceContainer = sectionElement.querySelector('.section-performance-output');
    if (performanceContainer && performanceContainer.innerHTML.trim() !== '') {
        performanceContainer.innerHTML = `<div class="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border-l-4 border-yellow-400"><p class="text-sm text-yellow-700 dark:text-yellow-300">O roteiro foi modificado. Sugira a performance novamente.</p></div>`;
    }
};

const invalidateAndClearEmotionalMap = () => {
    if (!AppState.generated.emotionalMap) return;
    AppState.generated.emotionalMap = null;
    const container = document.getElementById('emotionalMapContent');
    if (container) {
        container.innerHTML = `<div class="asset-card-placeholder text-yellow-700 dark:text-yellow-300 border-l-4 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20">O roteiro foi alterado.<br>Clique em "Mapear" novamente.</div>`;
    }
};

const toggleCustomImageStyleVisibility = () => {
    const container = document.getElementById('customImageStyleContainer');
    const select = document.getElementById('imageStyleSelect');
    if (container && select) {
        container.style.display = select.value === 'custom' ? 'block' : 'none';
    }
};

const narrativeStructures = {
    storytelling: {
        documentary: "Documentário (Factual e Investigativo)", heroes_journey: "Jornada do Herói (Estrutura Épica)",
        pixar_spine: "Espinha Dorsal - Pixar (Estrutura Emocional)", mystery_loop: "Mistério (com Loop Aberto)",
        twist: "Narrativa com Virada (Twist)"
    },
    storyselling: {
        pas: "Problema-Agitação-Solução (PAS)", bab: "Antes-Depois-Ponte (BAB)", aida: "Atenção-Interesse-Desejo-Ação (AIDA)",
        underdog_victory: "Vitória do Azarão (Conexão e Superação)", discovery_mentor: "A Grande Descoberta / Mentor Secreto",
        if_not_found_create: "Não Encontrei, Então Criei (História de Origem)"
    }
};

const narrativeTooltips = {
    documentary: "Constrói um argumento com fatos, evidências e uma narração autoritária. Perfeito para vídeos expositivos.",
    heroes_journey: "Conta uma história de transformação e superação. Ótimo para narrativas inspiradoras.",
    pixar_spine: "Estrutura emocional de 8 passos (Era uma vez... todo dia... até que...). Perfeita para arcos de personagem rápidos.",
    mystery_loop: "Apresenta uma pergunta no início e a responde no final. Excelente para reter a atenção.",
    twist: "Constrói uma expectativa e a quebra com uma revelação surpreendente no final.",
    pas: "Foca em um problema (Problema), intensifica a dor (Agitação) e apresenta seu conteúdo como a cura (Solução). Ideal para vendas.",
    bab: "Mostra um cenário 'Antes' (com o problema), um 'Depois' (resultado ideal) e posiciona seu conteúdo como 'a Ponte' entre os dois.",
    aida: "Clássico: captura a Atenção, gera Interesse, cria Desejo e chama para a Ação.",
    underdog_victory: "Mostra alguém que venceu contra as probabilidades. Gera alta conexão emocional.",
    discovery_mentor: "Revela um 'segredo' que mudou tudo, posicionando o narrador como um mentor.",
    if_not_found_create: "Conta a história de origem de um produto/serviço nascido de uma necessidade pessoal."
};

const narrativeGoalTooltips = {
    storytelling: { title: "Storytelling (Conectar & Inspirar)", description: "O foco é construir uma narrativa envolvente e emocional. O objetivo é fazer o público sentir, pensar e se conectar com a história." },
    storyselling: { title: "Storyselling (Persuadir & Vender)", description: "Usa técnicas de narrativa para construir um argumento e levar o público a uma ação específica (comprar, inscrever-se, etc.)." }
};

const updateMainTooltip = () => {
    const popoverTitle = document.getElementById('popoverTitle');
    const popoverDescription = document.getElementById('popoverDescription');
    const structureSelect = document.getElementById('narrativeStructure');
    if (!popoverTitle || !popoverDescription || !structureSelect || structureSelect.selectedIndex === -1) return;
    const selectedKey = structureSelect.value;
    const selectedText = structureSelect.options[structureSelect.selectedIndex].text;
    popoverTitle.textContent = selectedText;
    popoverDescription.textContent = narrativeTooltips[selectedKey] || "Descrição não encontrada.";
};

const updateNarrativeStructureOptions = () => {
    const goalSelect = document.getElementById('narrativeGoal');
    const structureSelect = document.getElementById('narrativeStructure');
    if (!goalSelect || !structureSelect) return;
    const goal = goalSelect.value;
    const savedValue = structureSelect.value;
    structureSelect.innerHTML = '';
    const structures = narrativeStructures[goal];
    for (const key in structures) {
       const option = document.createElement('option');
       option.value = key;
       option.textContent = structures[key];
       structureSelect.appendChild(option);
   }
    if (Array.from(structureSelect.options).some(opt => opt.value === savedValue)) {
        structureSelect.value = savedValue;
    }
    updateMainTooltip();
    updateGoalPopover();
};

const updateGoalPopover = () => {
    const goalSelect = document.getElementById('narrativeGoal');
    const popover = document.getElementById('goalPopover');
    if (!goalSelect || !popover) return;
    const popoverTitle = popover.querySelector('h4');
    const popoverDescription = popover.querySelector('p');
    const data = narrativeGoalTooltips[goalSelect.value];
    if (data) {
        popoverTitle.textContent = data.title;
        popoverDescription.textContent = data.description;
    }
};

window.copyTextToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        window.showToast('Copiado!', 'success');
    } catch (err) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus(); ta.select();
        try { document.execCommand('copy'); window.showToast('Copiado!', 'success'); } 
        finally { document.body.removeChild(ta); }
    }
};

window.showCopyFeedback = (buttonElement) => {
    const originalText = buttonElement.innerHTML;
    buttonElement.innerHTML = 'Copiado!';
    buttonElement.classList.add('btn-success');
    buttonElement.disabled = true;
    setTimeout(() => {
        buttonElement.innerHTML = originalText;
        buttonElement.classList.remove('btn-success');
        buttonElement.disabled = false;
    }, 2000);
};

const escapeRtf = (text) => {
    let result = '';
    for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i);
        if (charCode === 92 || charCode === 123 || charCode === 125) {
            result += '\\' + text.charAt(i);
        }
        else if (charCode > 127) {
            let hex = charCode.toString(16);
            if (hex.length < 2) hex = '0' + hex;
            result += "\\'" + hex;
        }
        else {
            result += text.charAt(i);
        }
    }
    return result;
};



// ==========================================================
// ==================== FUNÇÕES DE AÇÃO PRINCIPAIS ===================
// ==========================================================

// --- ETAPA 1: INVESTIGAR & IDEAR ---
const handleInvestigate = async (button) => {
    const query = document.getElementById('factCheckQuery').value.trim();
    if (!query) {
        window.showToast("Por favor, digite um tema para investigar.", 'error');
        return;
    }

    showButtonLoading(button);
    document.getElementById('ideaGenerationSection').classList.add('hidden');
    document.getElementById('ideasOutput').innerHTML = '';
    const outputContainer = document.getElementById('factCheckOutput');
    outputContainer.innerHTML = '<div class="asset-card-placeholder"><div class="loading-spinner loading-spinner-large"></div><span style="margin-left: 1rem;">Investigando... Nossos agentes estão na busca.</span></div>';

    try {
        const workerUrl = "https://aged-dawn-f88c.david-souzan.workers.dev/";
        const response = await fetch(workerUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: query }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Ocorreu um erro desconhecido.' }));
            throw new Error(`Erro da Agência de Inteligência: ${errorData.error || response.statusText}`);
        }

        const { report } = await response.json();
        if (!report) {
            throw new Error("A agência não retornou um relatório válido.");
        }
        
        AppState.generated.investigationReport = report;
        outputContainer.dataset.rawReport = report;
        outputContainer.dataset.originalQuery = query;
        const converter = new showdown.Converter({ simplifiedAutoLink: true, tables: true });
        const htmlReport = converter.makeHtml(report);
        
        outputContainer.innerHTML = `<div class="prose dark:prose-invert max-w-none p-4 card rounded-lg mt-4 border-l-4" style="border-color: var(--success);">${htmlReport}</div>`;
        
        document.getElementById('ideaGenerationSection').classList.remove('hidden');
        window.showToast("Investigação concluída! Agora, gere ideias.", "success");

    } catch (error) {
        console.error("Erro detalhado em handleInvestigate:", error);
        window.showToast(`Erro na investigação: ${error.message}`, 'error');
        outputContainer.innerHTML = `<div class="asset-card-placeholder" style="color: var(--danger);">${error.message}</div>`;
    } finally {
        hideButtonLoading(button);
    }
};




const generateIdeasFromReport = async (button) => {
    const factCheckOutput = document.getElementById('factCheckOutput');
    const { originalQuery, rawReport } = factCheckOutput.dataset;
    if (!rawReport || !originalQuery) {
        window.showToast("Erro: Relatório da investigação não encontrado.", 'error');
        return;
    }
    
    const genre = document.querySelector('#genreTabs .tab-button.tab-active')?.dataset.genre || 'geral';
    const languageName = document.getElementById('languageSelect').value === 'pt-br' ? 'Português do Brasil' : 'English';

    console.log("ESPECIALISTA SENDO USADO PARA O PROMPT:", genre);
    
    const outputContainer = document.getElementById('ideasOutput');
    showButtonLoading(button);

    // >>>>> CORREÇÃO #1: HTML DE LOADING SIMPLES E CENTRALIZADO <<<<<
    outputContainer.innerHTML = `
        <div class="md:col-span-2 text-center p-8">
            <div class="loading-spinner mx-auto mb-4" style="width: 32px; height: 32px; border-width: 4px; margin: auto;"></div>
            <p class="text-lg font-semibold" style="color: var(--text-header);">Consultando especialista em ${genre}...</p>
        </div>
    `;
    // >>>>> FIM DA CORREÇÃO #1 <<<<<

    const promptContext = { originalQuery, rawReport, languageName };
    const prompt = PromptManager.getIdeasPrompt(genre, promptContext);


    console.log(`[Especialista: ${genre.toUpperCase()}] - Enviando prompt:`, prompt.substring(0, 300));

    try {
        const rawResult = await callGroqAPI(prompt, 4000);
        const ideas = cleanGeneratedText(rawResult, true, true); 
        if (!ideas || !Array.isArray(ideas) || ideas.length === 0 || !ideas[0].title) throw new Error("A IA não retornou ideias em um formato JSON válido.");
        
        AppState.generated.ideas = ideas;
        
        const genreColorMap = {
            'documentario': 'gray', 'inspiracional': 'violet', 'scifi': 'blue', 
            'terror': 'red', 'enigmas': 'purple', 'geral': 'emerald'
        };
        const colorName = genreColorMap[genre] || 'emerald';

        // >>>>> CORREÇÃO #2: HTML DOS CARDS DA V5.0 <<<<<
        const allCardsHtml = ideas.map((idea, index) => {
    const escapedIdea = escapeIdeaForOnclick(idea);
    const colorName = genreColorMap[genre] || 'emerald';

    // Este é o novo HTML que recria o layout da Imagem 01
    return `
    <div class="card idea-card border-l-4 border-${colorName}-500 animate-fade-in" style="border-left-width: 4px !important;">
        
        <!-- Botão posicionado de forma absoluta no canto superior direito -->
        <button class="btn btn-primary btn-small idea-card-button" data-action="select-idea" data-idea='${escapedIdea}'>Usar</button>
        
        <!-- Cabeçalho do Card (com espaço para o botão) -->
        <div class="idea-card-header">
            <h4 class="font-bold text-base" style="color: var(--text-header);">
                ${index + 1}. ${DOMPurify.sanitize(idea.title)}
            </h4>
        </div>
        
        <!-- Corpo do Card (descrição) -->
        <div class="idea-card-body">
            <p class="text-sm leading-relaxed" style="color: var(--text-body);">
                "${DOMPurify.sanitize(idea.videoDescription || idea.angle)}"
            </p>
        </div>

        <!-- Rodapé do Card (potencial) -->
        <div class="idea-card-footer">
            <span class="font-semibold text-sm text-${colorName}-500">
                Potencial: ${DOMPurify.sanitize(String(idea.viralityScore))} / 10
            </span>
        </div>
    </div>
    `;
}).join('');
        // >>>>> FIM DA CORREÇÃO #2 <<<<<
        
        outputContainer.innerHTML = allCardsHtml;
        markStepCompleted('investigate', false);

    } catch(err) {
        window.showToast(`Erro ao gerar ideias: ${err.message}`, 'error');
        outputContainer.innerHTML = `<p class="md:col-span-2" style="color: var(--danger);">${err.message}</p>`;
    } finally {
        hideButtonLoading(button);
    }
};




const selectIdea = (idea) => {
    document.getElementById('videoTheme').value = idea.title || '';
    document.getElementById('videoDescription').value = idea.videoDescription || '';
    document.getElementById('targetAudience').value = idea.targetAudience || '';
    document.getElementById('narrativeTheme').value = idea.angle || '';
    
    ['centralQuestion', 'emotionalHook', 'narrativeVoice', 'shockingEndingHook', 'researchData']
        .forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
    
    window.showToast("Ideia selecionada! Agora, refine a estratégia.", 'success');
    showPane('strategy');
};


// --- ETAPA 2: DEFINIR ESTRATÉGIA ---

const validateInputs = () => {
    const fields = {
        'channelName': "Por favor, insira o nome do canal.",
        'videoTheme': "Por favor, insira o tema do vídeo.",
        'videoDescription': "Por favor, insira a descrição do vídeo (para inspiração).",
        'videoDuration': "Por favor, selecione a Duração Desejada do vídeo.",
        'visualPacing': "Por favor, selecione o Ritmo Visual do vídeo."
    };
    for (const id in fields) {
        const el = document.getElementById(id);
        if (!el || el.value.trim() === "") {
            window.showToast(fields[id], 'error');
            return false;
        }
    }
    return true;
};

const applyStrategy = () => {
    if (!validateInputs()) return;
    markStepCompleted('strategy');
    showPane('script');
    window.showToast("Estratégia definida. Pronto para criar o roteiro.", 'success');
};

const getBasePromptContext = () => {
    const inputs = {
        channelName: document.getElementById('channelName')?.value.trim() || "",
        videoTheme: document.getElementById('videoTheme')?.value.trim() || "",
        targetAudience: document.getElementById('targetAudience')?.value.trim() || "",
        language: document.getElementById('languageSelect')?.value || "en",
        languageStyle: document.getElementById('languageStyle')?.value || "",
        videoObjective: document.getElementById('videoObjective')?.value || "",
        speakingPace: document.getElementById('speakingPace')?.value || "",
        narrativeStructure: document.getElementById('narrativeStructure')?.value || "",
        narrativeTheme: document.getElementById('narrativeTheme')?.value.trim() || "",
        narrativeTone: document.getElementById('narrativeTone')?.value || "",
        narrativeVoice: document.getElementById('narrativeVoice')?.value.trim() || "",
        shockingEndingHook: document.getElementById('shockingEndingHook')?.value.trim() || "",
        imageStyleSelect: document.getElementById('imageStyleSelect')?.value || "",
        videoDescription: (document.getElementById('videoDescription')?.value.trim() || "").slice(0, 1000),
        centralQuestion: (document.getElementById('centralQuestion')?.value.trim() || "").slice(0, 500),
        emotionalArc: (document.getElementById('emotionalArc')?.value.trim() || "").slice(0, 500),
        researchData: (document.getElementById('researchData')?.value.trim() || "").slice(0, 1500),
        emotionalHook: (document.getElementById('emotionalHook')?.value.trim() || "").slice(0, 1000),
    };
    let context = `Você é um ROTEIRISTA ESPECIALISTA para o canal "${inputs.channelName}".
    **Core Project Details:**
    - Video Topic: "${inputs.videoTheme}"
    - Target Audience: "${inputs.targetAudience}"
    - Language: "${inputs.language}"
    - Video Objective: "${inputs.videoObjective}"
    **Narrative & Style Instructions:**
    - Narrative Structure to use: "${inputs.narrativeStructure}"
    - Speaking Pace: "${inputs.speakingPace}"`;
    if (inputs.narrativeTheme) context += `\n- Core Theme (The Big Idea): "${inputs.narrativeTheme}"`;
    if (inputs.narrativeTone) context += `\n- Narrative Tone (The Feeling): "${inputs.narrativeTone}"`;
    if (inputs.narrativeVoice) context += `\n- Narrator's Voice (The Personality): "${inputs.narrativeVoice}"`;
    if (inputs.shockingEndingHook) context += `\n- Shocking Ending Hook to use: "${inputs.shockingEndingHook}"`;
    if (inputs.videoDescription) context += `\n\n**Additional Information & Inspiration:**\n- Inspiration/Context: "${inputs.videoDescription}"`;
    if (inputs.centralQuestion) context += `\n- Central Question to guide the entire script: "${inputs.centralQuestion}"`;
    if (inputs.emotionalArc) context += `\n- Desired Emotional Arc: "${inputs.emotionalArc}"`;
    if (inputs.emotionalHook) context += `\n\n**CRITICAL NARRATIVE ANCHOR:** Você DEVE utilizar a seguinte história pessoal como o núcleo emocional recorrente. Emotional Anchor Story: "${inputs.emotionalHook}"`;
    if (inputs.researchData) context += `\n\n**CRITICAL RESEARCH DATA & CONTEXT:** Você DEVE incorporar os seguintes fatos: ${inputs.researchData}`;
    return context;
};

const suggestStrategy = async (button) => {
    const theme = document.getElementById('videoTheme')?.value.trim();
    const description = document.getElementById('videoDescription')?.value.trim();
    if (!theme || !description) {
        window.showToast("Preencha o Tema e a Descrição do Vídeo para receber sugestões.", 'info');
        return;
    }
    const userConfirmed = await showConfirmationDialog( "Refinar Estratégia com IA?", "Isso usará a IA para redefinir a estratégia e LIMPARÁ qualquer esboço ou roteiro já gerado. Deseja continuar?");
    if (!userConfirmed) return;
    
    // LIMPEZA PROFUNDA
    AppState.generated.strategicOutline = null;
    AppState.generated.script = { intro: {}, development: {}, climax: {}, conclusion: {}, cta: {} };
    document.getElementById('scriptSectionsContainer').innerHTML = '';
    document.getElementById('outlineContent').innerHTML = `<div class="asset-card-placeholder">Clique para gerar o esboço.</div>`;

    showButtonLoading(button);
    AppState.ui.isSettingStrategy = true;
    
    const languageName = document.getElementById('languageSelect').value === 'pt-br' ? 'Português (Brasil)' : 'English';

    const prompt = `Você é uma API de Estratégia de Conteúdo Viral. Sua única função é gerar um objeto JSON com uma estratégia de vídeo completa.

**REGRAS CRÍTICAS DE SINTAXE JSON (INEGOCIÁVEIS):**
1.  **JSON PURO:** Responda APENAS com um objeto JSON válido.
2.  **ASPAS DUPLAS:** TODAS as chaves e valores de texto DEVEM usar aspas duplas (\`"\`).
3.  **IDIOMA:** Todos os valores devem estar em **${languageName}**.

**MANUAL DE PREENCHIMENTO:**
-   "target_audience": Descreva o espectador ideal.
-   "narrative_goal": Escolha UM de: 'storytelling', 'storyselling'.
-   "narrative_structure": Baseado no "narrative_goal", escolha a estrutura MAIS IMPACTANTE. Se 'storytelling', escolha de: ["documentary", "heroes_journey", "pixar_spine", "mystery_loop", "twist"]. Se 'storyselling', escolha de: ["pas", "bab", "aida", "underdog_victory", "discovery_mentor"].
-   "narrative_theme": A "grande ideia" em uma frase.
-   "narrative_tone": Escolha UM de: 'inspirador', 'serio', 'emocional'.
-   "narrative_voice": Descreva a persona do narrador em 2 ou 3 adjetivos (Ex: "Confiante, Sábia, Misteriosa").
-   "central_question": Formule a pergunta que gera MISTÉRIO.
-   "emotional_hook": Crie uma MINI-HISTÓRIA humana.
-   "shocking_ending_hook": Crie a PRIMEIRA FRASE do vídeo.
-   "research_data": Sugira 2 a 3 PONTOS DE PESQUISA concretos.

**DADOS DE ENTRADA:**
- **Tema do Vídeo:** "${theme}"
- **Descrição:** "${description}"

**AÇÃO FINAL:** Gere AGORA o objeto JSON completo.`;

    try {
        const rawResult = await callGroqAPI(prompt, 4000);
        const strategy = cleanGeneratedText(rawResult, true);
        if (!strategy || typeof strategy !== 'object') throw new Error("A IA não retornou uma estratégia em formato JSON válido.");
        
        const narrativeGoalSelect = document.getElementById('narrativeGoal');
        if (narrativeGoalSelect && strategy.narrative_goal) {
            narrativeGoalSelect.value = strategy.narrative_goal;
            updateNarrativeStructureOptions();
        }
        setTimeout(() => { // Pequeno delay para garantir que as opções foram atualizadas
            const keyToElementIdMap = {
                'target_audience': 'targetAudience', 'narrative_theme': 'narrativeTheme',
                'narrative_tone': 'narrativeTone', 'narrative_voice': 'narrativeVoice',
                'central_question': 'centralQuestion', 'emotional_hook': 'emotionalHook',
                'shocking_ending_hook': 'shockingEndingHook', 'research_data': 'researchData',
                'narrative_structure': 'narrativeStructure'
            };
for (const key in keyToElementIdMap) {
    if (strategy[key]) {
        const element = document.getElementById(keyToElementIdMap[key]);
        if (element) {
            let valueToSet = strategy[key];

            // >>>>> BLINDAGEM UNIVERSAL CONTRA OBJETOS <<<<<
            if (typeof valueToSet === 'object' && valueToSet !== null) {
                console.warn(`A IA retornou um objeto para o campo '${key}':`, valueToSet);
                
                // Se for um array, junta os valores. Se for um objeto, junta os valores.
                if (Array.isArray(valueToSet)) {
                    // Se for um array de objetos, tenta extrair o primeiro valor de cada objeto
                    if (valueToSet.length > 0 && typeof valueToSet[0] === 'object') {
                         valueToSet = valueToSet.map(obj => Object.values(obj)[0]).join('; ');
                    } else { // Se for um array de strings
                         valueToSet = valueToSet.join('; ');
                    }
                } else { // Se for um objeto único
                    valueToSet = Object.values(valueToSet).join(', ');
                }
            }
            // >>>>> FIM DA BLINDAGEM <<<<<

            if (element.tagName === 'SELECT') {
                if ([...element.options].some(o => o.value === valueToSet)) {
                    element.value = valueToSet;
                }
            } else {
                element.value = valueToSet;
            }
        }
    }
}
            updateMainTooltip();
        }, 100);

        window.showToast("Estratégia refinada pela IA!");
        document.querySelector('[data-tab="input-tab-estrategia"]')?.click();
    } catch (error) {
        console.error("Erro em suggestStrategy:", error);
        window.showToast(`Falha ao sugerir estratégia: ${error.message}`, 'error');
    } finally {
        AppState.ui.isSettingStrategy = false;
        hideButtonLoading(button);
    }
};




// ==========================================================
// ==================== FUNÇÕES DE AÇÃO PRINCIPAIS (Motor v5.0) ===================
// ==========================================================

// --- ETAPA 1: INVESTIGAR & IDEAR (Já adicionadas no passo anterior, aqui como referência) ---
// handleInvestigate
// generateIdeasFromReport
// selectIdea

// --- ETAPA 2: DEFINIR ESTRATÉGIA (Já adicionadas no passo anterior, aqui como referência) ---
// validateInputs
// applyStrategy
// getBasePromptContext
// suggestStrategy


// --- ETAPA 3: CRIAR ROTEIRO ---
const constructScriptPrompt = (sectionName, sectionTitle, outlineDirective = null, contextText = null) => {
    const baseContext = getBasePromptContext();
    const videoDuration = document.getElementById('videoDuration').value;
    const targetWords = wordCountMap[videoDuration]?.[sectionName];
    let durationInstruction = `A seção deve ter aproximadamente ${targetWords} palavras.`;
    if (!targetWords) {
        durationInstruction = "A seção deve ser concisa e impactante.";
    }

    let prompt = '';
    let maxTokens = 8000;

    // Lógica evoluída para as seções principais do roteiro (Introdução, Desenvolvimento, Clímax)
    if (['intro', 'development', 'climax'].includes(sectionName)) {
        
        const priorKnowledgeContext = contextText 
            ? `**INFORMAÇÃO CRÍTICA:** O texto abaixo representa tudo o que o espectador JÁ ASSISTIU E JÁ SABE. É **TERMINANTEMENTE PROIBIDO** repetir, resumir ou parafrasear qualquer conceito já mencionado. Sua missão é **AVANÇAR A HISTÓRIA**.
            \n\n**ROTEIRO ESCRITO ATÉ AGORA (CONHECIMENTO JÁ ADQUIRIDO):**\n---\n${contextText.slice(-4000)}\n---`
            : '**INFORMAÇÃO CRÍTICA:** Esta é a primeira seção do vídeo. Crie um gancho poderoso para prender a atenção desde o primeiro segundo.';

        prompt = `
Você é uma API ROTEIRISTA DE ELITE. Sua única tarefa é escrever os parágrafos para a seção "${sectionTitle}" de um roteiro de vídeo.

**CONTEXTO E DIRETRIZES GERAIS:**
---
${baseContext}
---

${priorKnowledgeContext}

**TAREFA IMEDIATA E FOCALIZADA:**
-   **Seção a ser Escrita:** "${sectionTitle}"
-   **Diretriz Estratégica para esta Seção:** "${outlineDirective || 'Continue a narrativa de forma coesa e impactante.'}"
-   **Duração Estimada:** ${durationInstruction}

**REGRAS DE FORMATAÇÃO (INEGOCIÁVEIS):**
1.  **TEXTO PURO:** Sua resposta deve ser **APENAS e SOMENTE** o texto narrado.
2.  **SEPARAÇÃO POR PARÁGRAFOS:** Separe cada parágrafo com **DUAS quebras de linha**.
3.  **PROIBIÇÃO TOTAL DE EXTRAS:** Não inclua títulos, anotações, comentários ou qualquer texto que não seja parte do roteiro.

**AÇÃO FINAL:** Escreva AGORA os parágrafos para a seção "${sectionTitle}", garantindo que cada frase introduza conteúdo 100% novo. Responda APENAS com o texto puro do roteiro.`;
    
    } else {
        // Lógica para os outros tipos de prompts (outline, titles, etc.)
        // Esta parte permanece exatamente como no seu código original
        switch (sectionName) {
            case 'outline':
                prompt = `${baseContext}\nVocê é uma API de geração de JSON. Sua tarefa é criar um esboço estratégico para um vídeo.\n**REGRAS INEGOCIÁVEIS:**\n1. **JSON PURO:** Responda APENAS com um objeto JSON válido.\n2. **ESTRUTURA EXATA:** O objeto DEVE conter EXATAMENTE estas cinco chaves: "introduction", "development", "climax", "conclusion", e "cta".\n3. **VALORES:** O valor para CADA chave DEVE ser uma única string de texto (1-2 frases).\n**TAREFA:** Gere o objeto JSON perfeito.`;
                maxTokens = 2000;
                break;
            case 'titles_thumbnails':
                prompt = `${baseContext}\n**TAREFA:** Gerar 5 sugestões de títulos e thumbnails.\n**REGRAS:**\n1. **FORMATO:** Responda APENAS com um array JSON.\n2. **ESTRUTURA:** Cada objeto no array deve ter 3 chaves: "suggested_title", "thumbnail_title", e "thumbnail_description".\n3. **SINTAXE:** Use aspas duplas ("") para todas as chaves e valores.`;
                maxTokens = 2000;
                break;
            case 'description':
                const languageName = new Intl.DisplayNames([document.getElementById('languageSelect').value], { type: 'language' }).of(document.getElementById('languageSelect').value);
                prompt = `${baseContext}
**TAREFA:** Gerar uma descrição otimizada para um vídeo do YouTube e uma lista de hashtags relevantes, no idioma ${languageName}.

**REGRAS CRÍTICAS DE SINTAXE E ESTRUTURA JSON (INEGOCIÁVEIS):**
1.  **JSON PURO:** Sua resposta deve ser APENAS um objeto JSON válido.
2.  **ESTRUTURA EXATA:** O objeto DEVE conter EXATAMENTE estas duas chaves: "description_text" e "hashtags".
3.  **VALORES:**
    - "description_text": (String) Um parágrafo único e coeso. Comece com um gancho, detalhe o conteúdo e finalize com um call-to-action sutil.
    - "hashtags": (Array de Strings) Uma lista com 10 hashtags relevantes, cada uma começando com #.

**EXEMPLO DE FORMATO PERFEITO:**
{
  "description_text": "Este é um exemplo de descrição de vídeo. Ela começa com um gancho para prender a atenção e termina com uma chamada para ação.",
  "hashtags": ["#Exemplo1", "#Exemplo2", "#Exemplo3", "#Exemplo4", "#Exemplo5", "#Exemplo6", "#Exemplo7", "#Exemplo8", "#Exemplo9", "#Exemplo10"]
}

**AÇÃO FINAL:** Gere o objeto JSON perfeito.`;
                maxTokens = 2000;
                break;
        }
    }
    return { prompt, maxTokens };
};







const createScriptSectionPlaceholder = (sectionId, title, actionName) => {
    const buttonId = `${actionName}Btn`;
    const containerId = `${sectionId}Section`;

    // Este HTML é idêntico ao que você já usa, agora em uma função reutilizável.
    return `
        <div id="${containerId}" class="card card-placeholder mb-4 animate-fade-in flex justify-between items-center">
            <h3 class="font-semibold text-lg" style="color: var(--text-header);">${title}</h3>
            <button id="${buttonId}" data-action="${actionName}" class="btn btn-secondary btn-small">
                <i class="fas fa-magic" style="margin-right: 8px;"></i>Gerar
            </button>
        </div>
    `;
};




const generateStrategicOutline = async (button) => {
    if (!validateInputs()) return;

    // LIMPEZA PROFUNDA INTEGRADA
    AppState.generated.strategicOutline = null;
    AppState.generated.script = { intro: {html:null,text:null}, development: {html:null,text:null}, climax: {html:null,text:null}, conclusion: {html:null,text:null}, cta: {html:null,text:null} };
    document.getElementById('scriptSectionsContainer').innerHTML = '';
    document.getElementById('conclusionStrategyModule').classList.add('hidden');

    showButtonLoading(button);
    const outlineContentDiv = document.getElementById('outlineContent');
    outlineContentDiv.innerHTML = `<div class="asset-card-placeholder"><div class="loading-spinner"></div><span style="margin-left: 1rem;">Criando o esqueleto da sua história...</span></div>`;

    try {
        const { prompt } = constructScriptPrompt('outline');
        const rawResult = await callGroqAPI(prompt, 4000);
        AppState.generated.strategicOutline = cleanGeneratedText(rawResult, true);
        
        const { strategicOutline } = AppState.generated;
        if (!strategicOutline || typeof strategicOutline !== 'object' || !strategicOutline.introduction) {
            throw new Error("A IA falhou em gerar um esboço em formato JSON válido.");
        }

        const titleTranslations = { 'introduction': 'Introdução', 'development': 'Desenvolvimento', 'climax': 'Clímax', 'conclusion': 'Conclusão', 'cta': 'CTA' };
        let outlineHtml = '<ul class="space-y-4 text-sm" style="list-style-position: inside; padding-left: 1rem;">';
        for (const key in strategicOutline) {
            outlineHtml += `<li><div><strong style="color: var(--primary);">${titleTranslations[key] || key}:</strong> <span style="color: var(--text-body);">${DOMPurify.sanitize(strategicOutline[key])}</span></div></li>`;
        }
        outlineHtml += '</ul>';
        outlineContentDiv.innerHTML = outlineHtml;
        
        // ===============================================
        // A CORREÇÃO ESTÁ AQUI
        // ===============================================
        const scriptContainer = document.getElementById('scriptSectionsContainer');
        if (scriptContainer) {
            scriptContainer.innerHTML = ''; // Limpa qualquer conteúdo antigo
            scriptContainer.insertAdjacentHTML('beforeend', createScriptSectionPlaceholder('intro', 'Introdução', 'generateIntro'));
            scriptContainer.insertAdjacentHTML('beforeend', createScriptSectionPlaceholder('development', 'Desenvolvimento', 'generateDevelopment'));
            scriptContainer.insertAdjacentHTML('beforeend', createScriptSectionPlaceholder('climax', 'Clímax', 'generateClimax'));
        }
        // ===============================================
        // FIM DA CORREÇÃO
        // ===============================================

    } catch (error) {
        console.error("Erro em generateStrategicOutline:", error);
        window.showToast(`Falha ao gerar Esboço: ${error.message}`, 'error');
        outlineContentDiv.innerHTML = `<div class="asset-card-placeholder" style="color: var(--danger);">${error.message}. Tente novamente.</div>`;
    } finally {
        hideButtonLoading(button);
    }
};

const generateSectionHtmlContent = (sectionId, title, content) => {
    const accordionItem = document.createElement('div');
    accordionItem.className = 'accordion-item card !p-0 mb-4 animate-fade-in';
    accordionItem.id = `${sectionId}Section`;

    const addChapterButtonHtml = sectionId === 'development' ? `
        <div class="tooltip-container">
            <button class="btn btn-primary btn-small" data-action="addDevelopmentChapter">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z"/></svg> 
                Adicionar Capítulo
            </button>
            <span class="tooltip-text"><strong>Função:</strong> Expansão.<br><strong>O que faz:</strong> Adiciona um novo capítulo ao Desenvolvimento, continuando a narrativa a partir do ponto onde parou. Ideal para aprofundar um novo tópico ou estender a história.</span>
        </div>` : '';

    accordionItem.innerHTML = `
        <div class="accordion-header">
            <div class="header-title-group">
                <h3>${title}</h3>
                <span class="text-xs font-normal text-gray-500">${calculateReadingTime(content)}</span>
            </div>
            <div class="header-actions-group">
                <div class="header-buttons">
                    <button title="Re-gerar esta seção" data-action="regenerate" data-section-id="${sectionId}Section">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"/><path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466"/></svg>
                    </button>
                    <button title="Copiar Roteiro" data-action="copy">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/><path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5-.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/></svg>
                    </button>
                </div>
                <svg class="accordion-arrow" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/></svg>
            </div>
        </div>
        <div class="accordion-body" style="display: none;">
            <div class="generated-content-wrapper" contenteditable="true">${content}</div>
            
            <div class="mt-6 pt-4 border-t" style="border-color: var(--border); border-style: dashed;">
                <div class="space-y-6">
                    <div class="text-center">
                        <h5 class="font-semibold text-base mb-2">Passo 1: Diagnóstico e Criativo</h5>
                        <p class="text-xs text-muted mb-3">Analise, edite ou enriqueça o texto para máxima qualidade.</p>
                        <div class="flex items-center justify-center gap-2 flex-wrap">
                            
                            <div class="tooltip-container">
                                <button class="btn btn-secondary btn-small" data-action="analyzeRetention" data-section-id="${sectionId}Section">Analisar Retenção</button>
                                <span class="tooltip-text"><strong>Função:</strong> Diagnóstico.<br><strong>O que faz:</strong> Analisa cada parágrafo em busca de pontos que podem fazer o espectador perder o interesse, destacando-os em amarelo ou vermelho e sugerindo a causa.</span>
                            </div>
                            <div class="tooltip-container">
                                <button class="btn btn-secondary btn-small" data-action="refineStyle"><i class="fas fa-gem mr-2"></i>Refinar Estilo</button>
                                <span class="tooltip-text"><strong>Função:</strong> Polimento.<br><strong>O que faz:</strong> Pede para a IA reescrever a seção inteira para melhorar a fluidez, remover repetições e tornar o texto mais impactante, sem alterar a mensagem central.</span>
                            </div>
                            <div class="tooltip-container">
                                <button class="btn btn-secondary btn-small" data-action="enrichWithData"><i class="fas fa-plus mr-2"></i>Enriquecer com Dados</button>
                                <span class="tooltip-text"><strong>Função:</strong> Adição.<br><strong>O que faz:</strong> Permite que você selecione um trecho e forneça um novo dado ou fonte. A IA reescreverá o trecho para integrar a nova informação de forma natural.</span>
                            </div>
                            ${addChapterButtonHtml}

                        </div>
                        <div id="analysis-output-${sectionId}" class="section-analysis-output mt-3 text-left"></div>
                    </div>
                    <div class="pt-4 border-t border-dashed text-center" style="border-color: var(--border);">
                        <h5 class="font-semibold text-base mb-2">Passo 2: Estrutura de Narração</h5>
                        <p class="text-xs text-muted mb-3">Adicione sugestões de performance para guiar a narração.</p>
                        <button class="btn btn-secondary btn-small" data-action="suggestPerformance" data-section-id="${sectionId}Section">Sugerir Performance</button>
                        <div class="section-performance-output mt-3 text-left"></div> 
                    </div>
                    <div class="pt-4 border-t border-dashed text-center" style="border-color: var(--border);">
                        <h5 class="font-semibold text-base mb-2">Passo 3: Recursos Visuais</h5>
                        <p class="text-xs text-muted mb-3">Crie o storyboard visual para esta seção do roteiro.</p>
                        <button class="btn btn-secondary btn-small" data-action="generate-prompts" data-section-id="${sectionId}Section">Gerar Prompts de Imagem</button>
                        <div class="prompt-container mt-4 text-left"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    return accordionItem;
};




const handleGenerateSection = async (button, sectionName, sectionTitle, elementId) => {
    if (!validateInputs()) return;
    if (!AppState.generated.strategicOutline && sectionName !== 'intro') {
        window.showToast("Crie o Esboço Estratégico primeiro!", 'info');
        return;
    }

    showButtonLoading(button);
    const targetSectionElement = document.getElementById(`${elementId}Section`);

    try {
        let contextText = null;
        const sectionOrder = ['intro', 'development', 'climax'];
        const currentSectionIndex = sectionOrder.indexOf(elementId);
        if (currentSectionIndex > 0) {
            contextText = sectionOrder.slice(0, currentSectionIndex).map(id => {
                // Garante que o texto exista antes de tentar acessá-lo
                return AppState.generated.script[id] ? AppState.generated.script[id].text : '';
            }).join('\n\n---\n\n');
        }

        const keyMap = { intro: 'introduction', development: 'development', climax: 'climax' };
        const directive = AppState.generated.strategicOutline ? AppState.generated.strategicOutline[keyMap[sectionName]] : null;
        
        const { prompt, maxTokens } = constructScriptPrompt(sectionName, sectionTitle, directive, contextText);

        const rawResult = await callGroqAPI(prompt, maxTokens);
        // Usa a função `removeMetaComments` para limpar qualquer "lixo" textual que a IA possa ter adicionado
        const cleanText = removeMetaComments(rawResult);

        // Converte o texto puro em um array de parágrafos, dividindo por duas ou mais quebras de linha
        const paragraphs = cleanText.split(/\n\s*\n/).filter(p => p.trim() !== '');

        if (!paragraphs || paragraphs.length === 0) {
            throw new Error("A IA não retornou o roteiro no formato de parágrafos esperado.");
        }

        const contentWithDivs = paragraphs.map((p, index) => `<div id="${elementId}-p-${index}">${DOMPurify.sanitize(p)}</div>`).join('');
        const fullText = paragraphs.join('\n\n');

        AppState.generated.script[sectionName] = { html: contentWithDivs, text: fullText };

        if (targetSectionElement) {
            const sectionElement = generateSectionHtmlContent(elementId, sectionTitle, contentWithDivs);
            targetSectionElement.replaceWith(sectionElement);
        }
        updateButtonStates();

    } catch (error) {
        window.showToast(`Falha ao gerar ${sectionTitle}: ${error.message}`, 'error');
        console.error(`Error generating ${sectionTitle}.`, error);
    } finally {
        hideButtonLoading(button);
        updateButtonStates();
    }
};





window.regenerateSection = (fullSectionId) => {
    const sectionName = fullSectionId.replace('Section', '');
    const button = document.querySelector(`[data-action='regenerate'][data-section-id='${fullSectionId}']`);
    if (!button) return;

    // --- NOVA LÓGICA DE DIRECIONAMENTO ---
    switch (sectionName) {
        case 'intro':
            handleGenerateSection(button, 'intro', 'Introdução', 'intro');
            break;
        case 'development':
            handleGenerateSection(button, 'development', 'Desenvolvimento', 'development');
            break;
        case 'climax':
            handleGenerateSection(button, 'climax', 'Clímax', 'climax');
            break;
        case 'conclusion':
            // Chama a função correta para a conclusão
            generateConclusion(button); 
            break;
        case 'cta':
            // Chama a função correta para o CTA
            generateStrategicCta(button); 
            break;
        default:
            console.error("Tentativa de re-gerar uma seção desconhecida:", sectionName);
    }
};




const generateConclusion = async (button) => {
    if (!validateInputs()) return;
    showButtonLoading(button);

    // Lógica para obter contexto e criar o prompt (inalterada)
    const conclusionType = document.querySelector('input[name="conclusionType"]:checked').value;
    const conclusionSpecifics = document.getElementById('conclusionSpecifics').value.trim();
    const centralQuestion = document.getElementById('centralQuestion')?.value.trim() || 'a pergunta central do vídeo';
    
    let strategyDirective = '';
    switch (conclusionType) {
        case 'lesson':
            strategyDirective = `O objetivo é reforçar uma lição ou reflexão central. Detalhe do usuário: '${conclusionSpecifics || 'Nenhum'}'.`;
            break;
        case 'answer':
            strategyDirective = `O objetivo é responder à pergunta central ('${centralQuestion}'). Detalhe do usuário: '${conclusionSpecifics || 'Nenhum'}'.`;
            break;
        case 'cliffhanger':
            strategyDirective = `O objetivo é criar um gancho para o próximo vídeo. Detalhe do usuário: '${conclusionSpecifics || 'Nenhum'}'.`;
            break;
    }

    const fullContext = getTranscriptOnly();
    const basePromptContext = getBasePromptContext();

    const prompt = `${basePromptContext}\n\n# TAREFA\nEscrever o texto da conclusão para o vídeo, estruturado em parágrafos.\n\n# CONTEXTO\n## Roteiro existente:\n---\n${fullContext}\n---\n\n# DIRETRIZ ESTRATÉGICA\n${strategyDirective}\n\n# REGRAS ESSENCIAIS\n1. **FORMATO**: Responda APENAS com o texto narrativo, em parágrafos. Proibido anotações ou CTA.\n2. **QUALIDADE DOS PARÁGRAFOS**: Cada parágrafo deve ter de 4 a 6 frases.`;

    try {
        const rawResult = await callGroqAPI(prompt, 3000);
        const content = removeMetaComments(rawResult.trim());
        if (!content) throw new Error("A IA não retornou um conteúdo válido para a conclusão.");
        
        const paragraphs = content.split('\n').filter(p => p.trim() !== '');
        const contentWithSpans = paragraphs.map((p, index) => `<div id="conclusion-p-${index}">${DOMPurify.sanitize(p)}</div>`).join('');
        const fullText = paragraphs.join('\n\n');

        AppState.generated.script.conclusion = { html: contentWithSpans, text: fullText };
        
        // --- LÓGICA CORRIGIDA ---
        const scriptContainer = document.getElementById('scriptSectionsContainer');
        let conclusionContainer = document.getElementById('conclusionSection'); // O ID aqui se refere ao próprio acordeão
        
        const conclusionElement = generateSectionHtmlContent('conclusion', 'Conclusão', contentWithSpans);

        if (conclusionContainer) {
            // Se um acordeão de conclusão já existe (ex: de um projeto carregado), substitui
            conclusionContainer.replaceWith(conclusionElement);
        } else {
            // Se não existe, simplesmente adiciona ao final
            scriptContainer.appendChild(conclusionElement);
        }
        
        // Lógica para desabilitar inputs e mostrar o próximo botão (inalterada)
        document.querySelectorAll('input[name="conclusionType"]').forEach(radio => radio.disabled = true);
        document.getElementById('conclusionSpecifics').disabled = true;
        document.querySelector('#conclusionInputContainer').classList.add('opacity-50');
        
        button.classList.add('hidden');
        document.getElementById('generateCtaBtn').classList.remove('hidden');
        window.showToast("Conclusão gerada! Agora, vamos ao CTA.", 'success');
        
    } catch (error) {
        console.error("Erro em generateConclusion:", error);
        window.showToast(`Falha ao gerar a conclusão: ${error.message}`, 'error');
    } finally {
        hideButtonLoading(button);
        updateButtonStates();
    }
};





const generateStrategicCta = async (button) => {
    showButtonLoading(button);
    
    // Lógica para obter contexto e criar o prompt (inalterada)
    const ctaSpecifics = document.getElementById('ctaSpecifics').value.trim();
    const fullContext = getTranscriptOnly();
    const basePromptContext = getBasePromptContext();

    let ctaDirective = "Crie um CTA genérico (curtir, comentar, inscrever-se) alinhado ao tom do vídeo.";
    if (ctaSpecifics) {
        ctaDirective = `Crie um CTA específico e persuasivo. Instrução: "${ctaSpecifics}".`;
    }

    const prompt = `${basePromptContext}

**IDENTIDADE E ESPECIALIZAÇÃO:**
Você é um ESPECIALISTA EM ENGAJAMENTO e um COPYWRITER DE RESPOSTA DIRETA. Sua única função é escrever um CTA (Call to Action) que seja uma continuação natural e persuasiva do roteiro.

**ROTEIRO COMPLETO (PARA CONTEXTO):**
---
${fullContext}
---

**DIRETRIZ ESTRATÉGICA PARA O CTA:**
${ctaDirective}

**MANUAL DE CRIAÇÃO DE UM CTA PERFEITO:**
1.  **TRANSIÇÃO SUAVE:** O CTA não deve parecer um comercial. Ele precisa ser uma ponte natural a partir da conclusão do vídeo.
2.  **CLAREZA E ESPECIFICIDADE:** A ação que você quer que o espectador tome deve ser cristalina. Evite pedidos vagos.
3.  **CONEXÃO EMOCIONAL:** O CTA deve ecoar o tom e o sentimento do vídeo. Se o vídeo foi inspirador, o CTA deve ser encorajador.
4.  **BENEFÍCIO CLARO (WIIFM - "What's In It For Me?"):** Dê ao espectador uma razão para agir. O que ele ganha ao curtir, comentar ou se inscrever?

**REGRAS DE FORMATAÇÃO E CONTEÚDO (INEGOCIÁVEIS):**
1.  **RESPOSTA 100% PURA:** Sua resposta deve ser **APENAS e SOMENTE** o texto que será dito em voz alta.
2.  **PROIBIÇÃO TOTAL DE EXTRAS:** É **TERMINANTEMENTE PROIBIDO** incluir qualquer anotação, título (como "**CTA:**") ou comentário.
3.  **TAMANHO IDEAL:** O CTA deve ser um parágrafo coeso de 3 a 5 frases.

**AÇÃO FINAL:** Escreva AGORA o texto do CTA, aplicando todos os princípios de um copywriter de elite. Responda APENAS com o texto a ser narrado.`;

    try {
        let result = await callGroqAPI(prompt, 400);
        result = removeMetaComments(result.trim());
        const paragraphs = result.split('\n').filter(p => p.trim() !== '');
        const contentWithSpans = paragraphs.map((p, index) => `<div id="cta-p-${index}">${DOMPurify.sanitize(p)}</div>`).join('');
        const fullText = paragraphs.join('\n\n');

        AppState.generated.script.cta = { html: contentWithSpans, text: fullText };

        // --- LÓGICA CORRIGIDA ---
        const scriptContainer = document.getElementById('scriptSectionsContainer');
        let ctaContainer = document.getElementById('ctaSection'); // O ID aqui se refere ao próprio acordeão

        const ctaElement = generateSectionHtmlContent('cta', 'Call to Action (CTA)', contentWithSpans);
        
        if (ctaContainer){
            // Se um acordeão de CTA já existe, substitui
            ctaContainer.replaceWith(ctaElement);
        } else {
            // Se não existe, simplesmente adiciona ao final
            scriptContainer.appendChild(ctaElement);
        }
        
        // Lógica para desabilitar inputs e ir para a finalização (inalterada)
        const ctaSpecificsElement = document.getElementById('ctaSpecifics');
        ctaSpecificsElement.disabled = true;
        ctaSpecificsElement.parentElement.classList.add('opacity-50');
        
        window.showToast("Roteiro finalizado! Seção de Análise liberada.", 'success');
        goToFinalize();

    } catch(error) {
        console.error("Erro em generateStrategicCta:", error);
        window.showToast(`Falha ao gerar o CTA: ${error.message}`, 'error');
    } finally {
        hideButtonLoading(button);
        updateButtonStates();
    }
};






const suggestFinalStrategy = async (button) => {
    showButtonLoading(button);
    const conclusionSpecifics = document.getElementById('conclusionSpecifics');
    const ctaSpecifics = document.getElementById('ctaSpecifics');
    
    // Limpeza
    AppState.generated.script.conclusion = { html: null, text: null };
    AppState.generated.script.cta = { html: null, text: null };
    const conclusionContainer = document.getElementById('conclusionSection');
    if (conclusionContainer) conclusionContainer.innerHTML = '';
    const ctaContainer = document.getElementById('ctaSection');
    if (ctaContainer) ctaContainer.innerHTML = '';
    
    document.querySelectorAll('input[name="conclusionType"]').forEach(radio => radio.disabled = false);
    conclusionSpecifics.disabled = false;
    ctaSpecifics.disabled = false;
    
    document.getElementById('generateConclusionBtn').classList.remove('hidden');
    document.getElementById('generateCtaBtn').classList.add('hidden');

    const fullContext = getTranscriptOnly();
    const basePromptContext = getBasePromptContext();
    if (!fullContext) {
        window.showToast("Gere o roteiro principal primeiro para receber sugestões.", 'info');
        hideButtonLoading(button);
        return;
    }

    const prompt = `Você é uma API de ESTRATÉGIA NARRATIVA DE ALTO NÍVEL. Sua função é analisar um roteiro completo e, com base nele, propor uma conclusão e um CTA (Call to Action) estratégicos e impactantes.

**CONTEXTO GERAL DO VÍDEO (DNA NARRATIVO):**
---
${basePromptContext}
---

**ROTEIRO COMPLETO (PARA ANÁLISE):**
---
${fullContext}
---

**REGRAS CRÍTICAS DE SINTAXE E ESTRUTURA JSON (INEGOCIÁVEIS):**
1.  **JSON PURO:** Sua resposta deve ser **APENAS e SOMENTE** um objeto JSON válido.
2.  **ESTRUTURA EXATA:** O objeto DEVE conter EXATAMENTE estas duas chaves: "conclusion_suggestion" e "cta_suggestion".
3.  **VALORES:** Os valores devem ser strings de texto, concisas e acionáveis, no mesmo idioma do roteiro.
4.  **SINTAXE DAS STRINGS:** Todas as chaves e valores string DEVEM usar aspas duplas ("").

**EXEMPLO DE FORMATO PERFEITO E OBRIGATÓRIO:**
{
  "conclusion_suggestion": "Reforce a ideia de que a superação não é um destino, mas um processo contínuo de aprendizado, conectando a jornada do protagonista com a do espectador.",
  "cta_suggestion": "Convide o espectador a compartilhar nos comentários qual foi o maior obstáculo que já superou em sua própria jornada, criando uma comunidade de apoio."
}

**AÇÃO FINAL:** Sua resposta deve ser **APENAS e SOMENTE** o objeto JSON, sem nenhum texto introdutório, explicação ou comentário. Comece com \`{\` e termine com \`}\`. Gere agora o objeto JSON com as sugestões.`;

    try {
        const rawResult = await callGroqAPI(prompt, 1000);
        const suggestions = cleanGeneratedText(rawResult, true);
        if (suggestions && suggestions.conclusion_suggestion && suggestions.cta_suggestion) {
            conclusionSpecifics.value = suggestions.conclusion_suggestion;
            ctaSpecifics.value = suggestions.cta_suggestion;
            window.showToast("Sugestões para Conclusão e CTA preenchidas!", 'success');
        } else {
            throw new Error("A IA não retornou sugestões no formato esperado.");
        }
    } catch (error) {
        console.error("Erro em suggestFinalStrategy:", error);
        window.showToast(`Falha ao sugerir estratégia final: ${error.message}`, 'error');
    } finally {
        hideButtonLoading(button);
        updateButtonStates();
    }
};

const goToFinalize = () => {
    const { script } = AppState.generated;
    if (!script.intro?.text || !script.development?.text || !script.climax?.text) {
        window.showToast("Gere ao menos as seções principais do roteiro antes de finalizar.", 'info');
        return;
    }
    markStepCompleted('script');
    showPane('finalize');
    window.showToast("Roteiro pronto! Bem-vindo à área de finalização.", 'success');
};

// --- ETAPA 4: FINALIZAR E EXPORTAR ---

const analyzeScriptPart = async (criterion, text, context = {}) => {
    const sectionKeyMap = {
        'Introdução (Hook)': 'introduction',
        'Desenvolvimento (Ritmo e Retenção)': 'development',
        'Clímax': 'climax',
        'Conclusão': 'conclusion',
        'CTA (Call to Action)': 'cta'
    };
    const outlineKey = sectionKeyMap[criterion];
    const outlineDirective = context.outline?.[outlineKey] || 'Nenhuma diretriz estratégica específica foi definida para esta seção.';

    const prompt = `
Você é uma API de Análise Crítica de Roteiros. Sua única função é retornar um objeto JSON.

**CONTEXTO ESTRATÉGICO:**
- **Tema do Vídeo:** "${context.theme || 'Não definido'}"
- **Objetivo desta Seção (${criterion}):** "${outlineDirective}"

**TRECHO PARA ANÁLISE:**
---
${text.slice(0, 7000)}
---

**REGRAS CRÍTICAS DE RESPOSTA (JSON ESTRITO):**
1.  **JSON PURO:** Responda APENAS com um objeto JSON válido.
2.  **CHAVES E TIPOS OBRIGATÓRIOS:** O objeto DEVE conter EXATAMENTE estas 6 chaves: "criterion_name", "score" (Número), "positive_points" (String), "problematic_quote" (String - cópia literal ou "Nenhum"), "critique" (String), e "rewritten_quote" (String).
3.  **SINTAXE:** Todas as chaves e valores string DEVEM usar aspas duplas ("").

**AÇÃO FINAL:** Analise o trecho e retorne APENAS o objeto JSON perfeito.`;

    try {
        const rawResult = await callGroqAPI(prompt, 1500);
        const analysisData = cleanGeneratedText(rawResult, true); 
        if (!analysisData || !('score' in analysisData)) throw new Error("A IA retornou uma resposta sem as chaves obrigatórias.");
        
        const formattedData = {
            criterion_name: criterion,
            score: analysisData.score,
            positive_points: analysisData.positive_points,
            improvement_points: []
        };

        if (analysisData.critique.toLowerCase() !== "nenhuma crítica significativa.") {
            formattedData.improvement_points.push({
                suggestion_text: "Substituir por:",
                problematic_quote: analysisData.problematic_quote,
                critique: analysisData.critique,
                rewritten_quote: analysisData.rewritten_quote 
            });
        }
        return formattedData;

    } catch (error) {
        console.error(`Erro ao analisar a seção '${criterion}':`, error);
        return { 
            criterion_name: criterion, score: 'Erro', positive_points: 'A análise desta seção falhou.', 
            improvement_points: [{ critique: 'Falha na Análise', suggestion_text: `Detalhe: ${error.message}`, problematic_quote: 'N/A', rewritten_quote: 'N/A' }]
        };
    }
};

const createReportSection = (analysisData) => {
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'p-4 border rounded-lg mb-4 bg-gray-50 dark:bg-gray-800 animate-fade-in';
    if (!analysisData || typeof analysisData.score === 'undefined') {
        sectionDiv.innerHTML = `<h4 class="font-bold text-lg text-red-500">${analysisData.criterion_name || 'Erro'}</h4><p>Falha ao processar a análise.</p>`;
        return sectionDiv;
    }
    let improvementHtml = '';
    if (analysisData.improvement_points && analysisData.improvement_points.length > 0) {
        improvementHtml = analysisData.improvement_points.map(point => {
const problematicQuoteEscaped = (point.problematic_quote || '').replace(/"/g, '&quot;');
const rewrittenQuoteEscaped = (point.rewritten_quote || '').replace(/"/g, '&quot;');
            return `
            <div class="mt-4 pt-3 border-t border-dashed border-gray-300 dark:border-gray-600">
                <p class="text-sm italic text-gray-500 dark:text-gray-400 mb-1">Citação: "${DOMPurify.sanitize(point.problematic_quote || 'N/A')}"</p>
                <p class="text-sm"><strong class="text-yellow-600 dark:text-yellow-400">Crítica:</strong> ${DOMPurify.sanitize(point.critique || '')}</p>
                <div class="flex items-center justify-between gap-2 mt-2">
                    <p class="text-sm flex-1"><strong class="text-green-600 dark:text-green-400">Sugestão:</strong> Substituir por: "${DOMPurify.sanitize(point.rewritten_quote || '')}"</p>
                    <button class="btn btn-primary btn-small flex-shrink-0" data-action="applySuggestion" data-criterion-name="${DOMPurify.sanitize(analysisData.criterion_name)}" data-problematic-quote="${problematicQuoteEscaped}" data-rewritten-quote="${rewrittenQuoteEscaped}">Aplicar</button>
                </div>
            </div>`;
        }).join('');
    }
    sectionDiv.innerHTML = `
        <div class="flex justify-between items-center">
            <h4 class="font-bold text-lg">${DOMPurify.sanitize(analysisData.criterion_name)}</h4>
            <span class="font-bold text-xl text-primary">${analysisData.score}/10</span>
        </div>
        <div class="mt-2">
            <p class="text-sm"><strong class="text-indigo-500">Pontos Fortes:</strong> ${DOMPurify.sanitize(analysisData.positive_points)}</p>
            ${improvementHtml}
        </div>`;
    return sectionDiv;
};



const applySuggestion = (button) => {
    const criterionName = button.dataset.criterionName;
    const problematicQuote = button.dataset.problematicQuote;
    const rewrittenQuote = button.dataset.rewrittenQuote;

    // A verificação inicial continua a mesma
    if (!criterionName || !rewrittenQuote) { // Note que problematicQuote não é mais obrigatório
        window.showToast("Erro: Informações da sugestão não encontradas.", 'error');
        return;
    }

    const sectionId = window.criterionMap[criterionName];
    if (!sectionId) {
        console.error("Não foi possível encontrar o ID da seção para o critério:", criterionName);
        return;
    }

    const sectionElement = document.getElementById(sectionId);
    const contentWrapper = sectionElement?.querySelector('.generated-content-wrapper');
    if (!contentWrapper) {
        console.error("Wrapper de conteúdo não encontrado para a seção:", sectionId);
        return;
    }

    // ==========================================================
    // >>>>> NOVA LÓGICA INTELIGENTE ADICIONADA AQUI <<<<<
    // ==========================================================
    
    // Verifica se a IA forneceu um trecho específico e válido para substituir.
    const hasSpecificQuote = problematicQuote && problematicQuote.toLowerCase() !== 'nenhum' && problematicQuote.trim() !== '';

    if (hasSpecificQuote && contentWrapper.innerHTML.includes(problematicQuote)) {
        // --- CASO 1: A IA encontrou um trecho. Substitui como antes. ---
        const newHtmlContent = contentWrapper.innerHTML.replace(problematicQuote, `<span class="highlight-change">${rewrittenQuote}</span>`);
        contentWrapper.innerHTML = DOMPurify.sanitize(newHtmlContent, { ADD_TAGS: ["span"], ADD_ATTR: ["class"] });

    } else {
        // --- CASO 2: A IA não encontrou um trecho ou o trecho não existe mais. Anexa a sugestão. ---
        const newParagraph = document.createElement('div');
        newParagraph.innerHTML = `<span class="highlight-change">${rewrittenQuote}</span>`;
        contentWrapper.appendChild(newParagraph);
        
        // Rola a visão para o novo parágrafo adicionado
        newParagraph.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // ==========================================================
    // >>>>> FIM DA NOVA LÓGICA <<<<<
    // ==========================================================

    // O resto da função continua igual...
    const scriptKey = sectionId.replace('Section', '');
    if (AppState.generated.script[scriptKey]) {
        AppState.generated.script[scriptKey].html = contentWrapper.innerHTML;
        AppState.generated.script[scriptKey].text = contentWrapper.textContent;
    }

    window.showToast("Sugestão aplicada com sucesso!", 'success');
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-check mr-2"></i>Aplicada!';
    button.classList.remove('btn-primary');
    button.classList.add('btn-success');
    
    invalidateAndClearPerformance(sectionElement);
    invalidateAndClearPrompts(sectionElement);
    invalidateAndClearEmotionalMap();
    updateAllReadingTimes();
};




const analyzeFullScript = async (button) => {
    showButtonLoading(button);
    const reportContainer = document.getElementById('analysisReportContainer');
    reportContainer.innerHTML = `<div class="my-4"><div class="loading-spinner-small mx-auto"></div><p class="text-sm mt-2 text-center">Analisando...</p></div>`;
    try {
        const script = AppState.generated.script;
        if (!script.intro.text || !script.development.text || !script.climax.text || !script.conclusion.text || !script.cta.text) {
            throw new Error("Todas as 5 seções do roteiro devem ser geradas primeiro.");
        }
        const lightContext = {
            theme: document.getElementById('videoTheme')?.value.trim() || 'Não definido',
            centralQuestion: document.getElementById('centralQuestion')?.value.trim() || 'Não definida',
            outline: AppState.generated.strategicOutline || {}
        };
        const results = await Promise.allSettled([
            analyzeScriptPart('Introdução (Hook)', script.intro.text, lightContext),
            analyzeScriptPart('Desenvolvimento (Ritmo e Retenção)', script.development.text, lightContext),
            analyzeScriptPart('Clímax', script.climax.text, lightContext),
            analyzeScriptPart('Conclusão', script.conclusion.text, lightContext),
            analyzeScriptPart('CTA (Call to Action)', script.cta.text, lightContext)
        ]);
        reportContainer.innerHTML = ''; 
        const headerDiv = document.createElement('div');
        headerDiv.className = 'flex justify-between items-center mb-4 p-3 rounded-lg';
        headerDiv.innerHTML = DOMPurify.sanitize(`<h3 class="text-lg font-bold">Relatório de Análise</h3><button id="applyAllSuggestionsBtn" data-action="applyAllSuggestions" class="btn btn-secondary btn-small">Aplicar Todas</button>`);
        reportContainer.appendChild(headerDiv);

        results.forEach(result => {
            if (result.status === 'fulfilled') {
                reportContainer.appendChild(createReportSection(result.value));
            } else {
                console.error("Uma micro-análise falhou:", result.reason);
            }
        });
        window.showToast("Análise do roteiro concluída!", 'success');
    } catch (error) {
        console.error("Erro em analyzeFullScript:", error);
        window.showToast(`Falha na análise: ${error.message}`, 'error');
        reportContainer.innerHTML = `<p class="text-red-500 text-sm">${error.message}</p>`;
    } finally {
        hideButtonLoading(button);
    }
};

const applyAllSuggestions = async (button) => {
    const allApplyButtons = document.querySelectorAll('#analysisReportContainer button[data-action="applySuggestion"]:not(:disabled)');
    if (allApplyButtons.length === 0) {
        window.showToast("Nenhuma sugestão nova para aplicar.", 'info');
        return;
    }
    showButtonLoading(button);
    let appliedCount = 0;
    for (const applyBtn of allApplyButtons) {
        try {
            applySuggestion(applyBtn);
            appliedCount++;
            await new Promise(resolve => setTimeout(resolve, 100)); 
        } catch (error) {
            console.error("Erro ao aplicar uma sugestão no modo 'Aplicar Todas':", error);
        }
    }
    hideButtonLoading(button);
    window.showToast(`${appliedCount} sugestões aplicadas com sucesso!`, 'success');
    button.disabled = true;
    button.innerHTML = 'Tudo Aplicado!';
};

const applyHookSuggestion = (button) => {
    const { problematicQuote, rewrittenQuote } = button.dataset;
    if (!problematicQuote || !rewrittenQuote) {
        window.showToast("Erro: Informações da sugestão não encontradas.", 'error');
        return;
    }
    const scriptSections = document.querySelectorAll('#scriptSectionsContainer .generated-content-wrapper');
    let replaced = false;
    let sectionElement = null;
    scriptSections.forEach(wrapper => {
        if (replaced) return;
        const paragraphs = wrapper.querySelectorAll('div[id*="-p-"]');
        paragraphs.forEach(p => {
            if (replaced) return;
            if (p.textContent.includes(problematicQuote)) {
                const newHtmlContent = p.innerHTML.replace(problematicQuote, `<span class="highlight-change">${rewrittenQuote}</span>`);
                p.innerHTML = DOMPurify.sanitize(newHtmlContent, { ADD_TAGS: ["span"], ADD_ATTR: ["class"] });
                window.showToast("Gancho aprimorado com sucesso!", 'success');
                sectionElement = p.closest('.accordion-item');
                if (sectionElement) {
                    invalidateAndClearPerformance(sectionElement);
                    invalidateAndClearPrompts(sectionElement);
                    invalidateAndClearEmotionalMap();
                    updateAllReadingTimes();
                }
                replaced = true;
            }
        });
    });
    if (!replaced) {
        window.showToast("Não foi possível aplicar. O texto pode ter sido editado.", 'info');
        return;
    }
    if (sectionElement) {
        const contentWrapper = sectionElement.querySelector('.generated-content-wrapper');
        const scriptSectionId = sectionElement.id.replace('Section', '');
        if (contentWrapper && AppState.generated.script[scriptSectionId]) {
            AppState.generated.script[scriptSectionId].text = contentWrapper.textContent;
            AppState.generated.script[scriptSectionId].html = contentWrapper.innerHTML;
        }
    }
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-check mr-2"></i>Aplicada!';
    button.classList.remove('btn-primary');
    button.classList.add('btn-success');
};

const analyzeRetentionHooks = async (button) => {
    const fullTranscript = getTranscriptOnly();
    if (!fullTranscript) {
        window.showToast("Gere o roteiro completo primeiro para caçar os ganchos.", 'info');
        return;
    }
    showButtonLoading(button);
    const reportContainer = document.getElementById('hooksReportContainer');
    reportContainer.innerHTML = `<div class="my-4"><div class="loading-spinner-small mx-auto"></div><p class="text-sm mt-2">Caçando e refinando ganchos...</p></div>`;
    const prompt = `Você é uma API ESPECIALISTA EM ANÁLISE DE RETENÇÃO. Sua tarefa é analisar o roteiro, identificar "ganchos de retenção" e sugerir melhorias.

**ROTEIRO COMPLETO:**
---
${fullTranscript.slice(0, 7500)}
---

**REGRAS CRÍTICAS DE SINTAXE E ESTRUTURA JSON (INEGOCIÁVEIS):**
- **JSON PURO E PERFEITO:** Responda APENAS com um array JSON válido.
- **ASPAS DUPLAS, SEMPRE:** TODAS as chaves e valores de texto DEVEM usar aspas duplas (\`"\`).
- **CHAVES E TIPOS EXATOS:** Cada objeto no array DEVE conter EXATAMENTE estas cinco chaves: "hook_phrase" (String), "rewritten_hook" (String), "hook_type" (String de ['Pergunta Direta', 'Loop Aberto (Mistério)', 'Dado Surpreendente', 'Conflito/Tensão', 'Anedota Pessoal', 'Afirmação Polêmica']), "justification" (String), e "effectiveness_score" (Número).

**AÇÃO FINAL:** Analise o roteiro. Responda APENAS com o array JSON perfeito.`;
    try {
        const rawResult = await callGroqAPI(prompt, 4000);
        const hooks = cleanGeneratedText(rawResult, true);
        if (!hooks || !Array.isArray(hooks) || hooks.length === 0) throw new Error("A IA não encontrou ganchos ou retornou um formato inválido.");
        let reportHtml = `<div class="space-y-4">`;
        hooks.forEach((hook) => {
            const problematicQuoteEscaped = (hook.hook_phrase || '').replace(/"/g, '\"');
            const rewrittenQuoteEscaped = (hook.rewritten_hook || '').replace(/"/g, '\"');
            const scoreColor = hook.effectiveness_score >= 8 ? 'text-green-500' : hook.effectiveness_score >= 5 ? 'text-yellow-500' : 'text-red-500';
            reportHtml += `
                <div class="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 animate-fade-in">
                    <p class="text-base italic text-gray-500 dark:text-gray-400 mb-2">Original: "${DOMPurify.sanitize(hook.hook_phrase)}"</p>
                    <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                        <span class="tag tag-pace !bg-purple-100 !text-purple-700 dark:!bg-purple-900/50 dark:!text-purple-300"><i class="fas fa-anchor mr-2"></i> ${DOMPurify.sanitize(hook.hook_type)}</span>
                        <span class="font-bold ${scoreColor}">Eficácia Original: ${DOMPurify.sanitize(String(hook.effectiveness_score))}/10</span>
                    </div>
                    <p class="text-sm mt-3 text-gray-600 dark:text-gray-400"><strong>Justificativa da Melhoria:</strong> ${DOMPurify.sanitize(hook.justification)}</p>
                    <div class="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-dashed border-gray-300 dark:border-gray-600">
                        <p class="text-sm flex-1"><strong class="text-green-600 dark:text-green-400">Sugestão:</strong> "${DOMPurify.sanitize(hook.rewritten_hook)}"</p>
                        <button class="btn btn-primary btn-small flex-shrink-0" data-action="applyHookSuggestion" data-problematic-quote="${problematicQuoteEscaped}" data-rewritten-quote="${rewrittenQuoteEscaped}">Aplicar</button>
                    </div>
                </div>`;
        });
        reportHtml += `</div>`;
        reportContainer.innerHTML = reportHtml;
        window.showToast(`${hooks.length} ganchos analisados!`, 'success');
    } catch (error) {
        console.error("Erro em analyzeRetentionHooks:", error);
        reportContainer.innerHTML = `<p class="text-red-500 text-sm">${error.message}</p>`;
    } finally {
        hideButtonLoading(button);
    }
};

const insertViralSuggestion = (button) => {
    const { anchorParagraph, suggestedText } = button.dataset;
    if (!anchorParagraph || !suggestedText) {
        window.showToast("Erro: Informações da sugestão não encontradas.", 'error');
        return;
    }
    const allParagraphs = document.querySelectorAll('#scriptSectionsContainer div[id*="-p-"]');
    let inserted = false;
    let sectionElement = null;
    allParagraphs.forEach(p => {
        if (!inserted && p.textContent.trim().includes(anchorParagraph.trim())) {
            const newDiv = document.createElement('div');
            newDiv.id = `inserted-p-${Date.now()}`; 
            newDiv.innerHTML = `<span class="highlight-change">${suggestedText}</span>`;
            p.parentNode.insertBefore(newDiv, p.nextSibling);
            newDiv.innerHTML = DOMPurify.sanitize(newDiv.innerHTML, { ADD_TAGS: ["span"], ADD_ATTR: ["class"] });
            window.showToast("Elemento viral inserido!", 'success');
            sectionElement = p.closest('.accordion-item');
            if (sectionElement) {
                invalidateAndClearPerformance(sectionElement);
                invalidateAndClearPrompts(sectionElement);
                invalidateAndClearEmotionalMap();
                updateAllReadingTimes();
            }
            inserted = true;
        }
    });
    if (!inserted) {
        window.showToast("Não foi possível inserir. O parágrafo âncora pode ter sido editado.", 'info');
        return;
    }
    if (sectionElement) {
        const contentWrapper = sectionElement.querySelector('.generated-content-wrapper');
        const scriptSectionId = sectionElement.id.replace('Section', '');
        if (contentWrapper && AppState.generated.script[scriptSectionId]) {
            AppState.generated.script[scriptSectionId].text = contentWrapper.textContent;
            AppState.generated.script[scriptSectionId].html = contentWrapper.innerHTML;
        }
    }
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-check mr-2"></i>Aplicada!';
    button.classList.remove('btn-primary');
    button.classList.add('btn-success');
};

const suggestViralElements = async (button) => {
    const fullTranscript = getTranscriptOnly();
    const videoTheme = document.getElementById('videoTheme')?.value.trim();
    if (!fullTranscript || !videoTheme) {
        window.showToast("Gere o roteiro e defina um tema para receber sugestões virais.", 'info');
        return;
    }
    showButtonLoading(button);
    const reportContainer = document.getElementById('viralSuggestionsContainer');
    reportContainer.innerHTML = `<div class="my-4"><div class="loading-spinner-small mx-auto"></div><p class="text-sm mt-2">O Arquiteto da Viralidade está analisando...</p></div>`;
    const basePromptContext = getBasePromptContext();
    const prompt = `Você é uma API ESPECIALISTA EM ESTRATÉGIA DE CONTEÚDO VIRAL. Sua tarefa é analisar um roteiro e seu contexto para propor 3 elementos que aumentem a viralidade de forma INTELIGENTE e ALINHADA.

**CONTEXTO ESTRATÉGICO ("DNA" DO VÍDEO):**
---
${basePromptContext}
---

**ROTEIRO COMPLETO (FOCO NOS PRIMEIROS 7500 CHARS):**
---
${fullTranscript.slice(0, 7500)}
---

**REGRAS CRÍTICAS DE SINTAXE E ESTRUTURA JSON (INEGOCIÁVEIS):**
1.  **JSON PURO E PERFEITO:** Responda APENAS com um array JSON válido.
2.  **ESTRUTURA COMPLETA:** Cada objeto DEVE conter EXATAMENTE estas cinco chaves: "anchor_paragraph", "suggested_text", "element_type", "potential_impact_score", "implementation_idea".
3.  **SINTAXE DAS STRINGS:** Todas as chaves e valores string DEVEM usar aspas duplas ("").

**MANUAL DE ANÁLISE E CRIAÇÃO:**
- **"anchor_paragraph":** Cópia EXATA de um parágrafo existente.
- **"suggested_text":** Um parágrafo completo e coeso para ser inserido.
- **"element_type":** Escolha de: ["Dado Surpreendente", "Citação de Autoridade", "Mini-Revelação (Teaser)", "Pergunta Compartilhável", "Anedota Pessoal Rápida"].
- **"potential_impact_score":** Nota de 1 a 10 para o potencial de engajamento.
- **"implementation_idea":** Explique o VALOR ESTRATÉGICO da inserção.

**AÇÃO FINAL:** Analise o roteiro e o contexto. Responda APENAS com o array JSON perfeito.`;
    try {
        const rawResult = await callGroqAPI(prompt, 4000);
        const suggestions = cleanGeneratedText(rawResult, true);
        if (!suggestions || !Array.isArray(suggestions) || suggestions.length === 0) throw new Error("A IA não encontrou oportunidades ou retornou um formato inválido.");
        let reportHtml = `<div class="space-y-4">`;
        suggestions.forEach(suggestion => {
            const anchorParagraphEscaped = (suggestion.anchor_paragraph || '').replace(/"/g, '\"');
            const suggestedTextEscaped = (suggestion.suggested_text || '').replace(/"/g, '\"');
            const score = suggestion.potential_impact_score || 0;
            const scoreColor = score >= 8 ? 'text-green-500' : score >= 5 ? 'text-yellow-500' : 'text-red-500';
            reportHtml += `
                <div class="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 animate-fade-in">
                    <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm mb-2">
                        <span class="tag !bg-blue-100 !text-blue-700 dark:!bg-blue-900/50 dark:!text-blue-300"><i class="fas fa-lightbulb mr-2"></i> ${DOMPurify.sanitize(suggestion.element_type)}</span>
                        <span class="font-bold ${scoreColor}">Impacto Potencial: ${DOMPurify.sanitize(String(score))}/10</span>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-1"><strong>Local Sugerido:</strong> Após o parágrafo que contém "${DOMPurify.sanitize((suggestion.anchor_paragraph || '').substring(0, 70))}..."</p>
                    <p class="text-sm mt-3 text-gray-600 dark:text-gray-400"><strong>Ideia de Implementação:</strong> ${DOMPurify.sanitize(suggestion.implementation_idea)}</p>
                    <div class="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-dashed border-gray-300 dark:border-gray-600">
                         <p class="text-sm flex-1"><strong class="text-green-600 dark:text-green-400">Texto a Inserir:</strong> "${DOMPurify.sanitize(suggestion.suggested_text)}"</p>
                        <button class="btn btn-primary btn-small flex-shrink-0" data-action="insertViralSuggestion" data-anchor-paragraph="${anchorParagraphEscaped}" data-suggested-text="${suggestedTextEscaped}">Aplicar</button>
                    </div>
                </div>`;
        });
        reportHtml += `</div>`;
        reportContainer.innerHTML = reportHtml;
        window.showToast(`${suggestions.length} sugestões virais encontradas!`, 'success');
    } catch (error) {
        console.error("Erro em suggestViralElements:", error);
        reportContainer.innerHTML = `<p class="text-red-500 text-sm">${error.message}</p>`;
    } finally {
        hideButtonLoading(button);
    }
};


// ... Continuação do Bloco ETAPA 4 ...

const updateButtonStates = () => {
    const script = AppState.generated.script;
    const allMainScriptGenerated = !!script.intro?.text && !!script.development?.text && !!script.climax?.text;
    const isConclusionGenerated = !!script.conclusion?.text;
    const isFullScriptGenerated = allMainScriptGenerated && isConclusionGenerated && !!script.cta?.text;

    // Habilita/desabilita botões de metadados
    ['generateTitlesAndThumbnailsBtn', 'generateDescriptionBtn', 'generateSoundtrackBtn', 'mapEmotionsBtn'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.disabled = !allMainScriptGenerated;
    });

    // Módulo de Conclusão no painel de roteiro
    const conclusionModule = document.getElementById('conclusionStrategyModule');
    if (conclusionModule) {
        conclusionModule.classList.toggle('hidden', !allMainScriptGenerated);
        const btnGenerateConclusion = document.getElementById('generateConclusionBtn');
        const btnGenerateCta = document.getElementById('generateCtaBtn');
        if (btnGenerateConclusion && btnGenerateCta) {
            btnGenerateConclusion.classList.toggle('hidden', isConclusionGenerated);
            btnGenerateCta.classList.toggle('hidden', !isConclusionGenerated);
        }
    }
    
    // Seção de Análise no painel de finalização
    const analysisSection = document.getElementById('scriptAnalysisSection');
    if (analysisSection) {
        analysisSection.style.display = isFullScriptGenerated ? 'block' : 'none';
    }
};

const generateTitlesAndThumbnails = async (button) => {
    if (!validateInputs()) return;
    showButtonLoading(button);
    const targetContentElement = document.getElementById('titlesThumbnailsContent');
    targetContentElement.innerHTML = `<div class="loading-spinner-small mx-auto my-4"></div>`;
    try {
        const { prompt, maxTokens } = constructScriptPrompt('titles_thumbnails');
        const rawResult = await callGroqAPI(prompt, maxTokens);
        const parsedContent = cleanGeneratedText(rawResult, true);
        if (!Array.isArray(parsedContent) || parsedContent.length === 0 || !parsedContent[0].suggested_title) {
            throw new Error("A IA retornou os dados de títulos em um formato inesperado.");
        }
        const titles = parsedContent.map(item => item.suggested_title);
        const thumbnails = parsedContent.map(item => ({ title: item.thumbnail_title, description: item.thumbnail_description }));
        AppState.generated.titlesAndThumbnails = { titles, thumbnails };

        const titlesListHtml = titles.map((title, index) => `<p>${index + 1}. ${DOMPurify.sanitize(title)}</p>`).join('');
        const thumbnailsListHtml = thumbnails.map((thumb) => `<div class="thumbnail-idea"><h4 class="font-semibold">"${DOMPurify.sanitize(thumb.title)}"</h4><p>Descrição: ${DOMPurify.sanitize(thumb.description)}</p></div>`).join('');

        // >>>>> LÓGICA DE RENDERIZAÇÃO COMPLETA DA V5.0 <<<<<
        targetContentElement.innerHTML = `
            <div class="generated-output-box">
                <div class="output-content-block">
                    <h4 class="output-subtitle">Sugestões de Títulos:</h4>
                    ${titlesListHtml}
                    <div class="mt-3">
                        <button class="btn btn-secondary btn-small" onclick="window.analyzeTitles()">Analisar CTR</button>
                        <div id="ctrAnalysisResult" class="mt-3 text-sm"></div>
                    </div>
                </div>
                <div class="output-content-block">
                    <h4 class="output-subtitle">Ideias de Thumbnail:</h4>
                    ${thumbnailsListHtml}
                    <div class="mt-3">
                        <button class="btn btn-secondary btn-small" onclick="window.analyzeThumbnails()">Analisar Thumbnails</button>
                        <div id="thumbnailAnalysisResult" class="mt-3 text-sm"></div>
                    </div>
                </div>
            </div>
        `;
        // >>>>> FIM DA LÓGICA DE RENDERIZAÇÃO <<<<<

    } catch (error) {
        window.showToast(`Falha ao gerar Títulos: ${error.message}`, 'error');
        targetContentElement.innerHTML = `<div class="asset-card-placeholder" style="color: var(--danger);">${error.message}</div>`;
    } finally {
        hideButtonLoading(button);
    }
};




window.analyzeTitles = async () => {
    const titlesData = AppState.generated.titlesAndThumbnails;
    if (!titlesData || !titlesData.titles || titlesData.titles.length === 0) {
        window.showToast("Gere os títulos primeiro antes de analisar!", 'info');
        return;
    }
    const resultContainer = document.getElementById('ctrAnalysisResult');
    resultContainer.innerHTML = `<div class="loading-spinner-small mx-auto my-2"></div>`;
    const titlesString = titlesData.titles.join('\n');
    
    const prompt = `Você é uma API de análise de títulos do YouTube que retorna APENAS um array JSON.

**REGRAS CRÍTICAS:**
1.  **JSON PURO:** Sua resposta deve ser APENAS o array JSON.
2.  **ESTRUTURA:** Cada objeto DEVE conter: "titulo_original" (string), "nota_ctr" (número 0-10), e "sugestao_melhora" (string).
3.  **SINTAXE:** Use aspas duplas ("").

**Títulos para analisar:**
---
${titlesString}
---
Responda APENAS com o array JSON.`;

    try {
        const rawResult = await callGroqAPI(prompt, 3000);
        const analysis = cleanGeneratedText(rawResult, true, true);
        if (!analysis || !Array.isArray(analysis)) throw new Error("A IA não retornou uma análise de títulos válida.");

        let analysisHtml = '<div class="space-y-4">';
        analysis.forEach(item => {
            analysisHtml += `
                <div class="p-3 rounded-md" style="background: var(--bg);">
                    <p class="font-semibold">${DOMPurify.sanitize(item.titulo_original)}</p>
                    <p class="mt-1"><strong>Nota de CTR:</strong> <span style="color: var(--primary); font-weight: 700;">${DOMPurify.sanitize(String(item.nota_ctr))} / 10</span></p>
                    <p class="mt-1"><strong>Sugestão:</strong> ${DOMPurify.sanitize(item.sugestao_melhora)}</p>
                </div>`;
        });
        analysisHtml += '</div>';
        resultContainer.innerHTML = analysisHtml;
    } catch (error) {
        resultContainer.innerHTML = `<p style="color: var(--danger);">${error.message}</p>`;
    }
};

window.analyzeThumbnails = async () => {
    const thumbnailsData = AppState.generated.titlesAndThumbnails;
    if (!thumbnailsData || !thumbnailsData.thumbnails || thumbnailsData.thumbnails.length === 0) {
        window.showToast("Gere as ideias de thumbnail primeiro!", 'info');
        return;
    }
    const resultContainer = document.getElementById('thumbnailAnalysisResult');
    resultContainer.innerHTML = `<div class="loading-spinner-small mx-auto my-2"></div>`;
    const thumbnailsString = thumbnailsData.thumbnails.map(t => `Título: ${t.title}, Descrição: ${t.description}`).join('\n---\n');
    
    const prompt = `Você é uma API de análise de thumbnails do YouTube que retorna APENAS um array JSON.

**REGRAS CRÍTICAS:**
1.  **JSON PURO:** Sua resposta deve ser APENAS o array JSON.
2.  **ESTRUTURA:** Cada objeto DEVE conter: "titulo" (string), "nota_visual" (número 0-10), e "sugestao_melhora" (string).
3.  **SINTAXE:** Use aspas duplas ("").

**Ideias para analisar:**
---
${thumbnailsString}
---
Responda APENAS com o array JSON.`;

    try {
        const rawResult = await callGroqAPI(prompt, 2500);
        const analysis = cleanGeneratedText(rawResult, true, true);
        if (!analysis || !Array.isArray(analysis)) throw new Error("A IA não retornou uma análise de thumbnails válida.");

        let analysisHtml = '<div class="space-y-4">';
        analysis.forEach(item => {
            analysisHtml += `
                <div class="p-3 rounded-md" style="background: var(--bg);">
                    <p class="font-semibold">"${DOMPurify.sanitize(item.titulo || 'Ideia Sem Título')}"</p>
                    <p class="mt-1"><strong>Nota Visual:</strong> <span style="color: var(--primary); font-weight: 700;">${DOMPurify.sanitize(String(item.nota_visual))} / 10</span></p>
                    <p class="mt-1"><strong>Sugestão:</strong> ${DOMPurify.sanitize(item.sugestao_melhora)}</p>
                </div>`;
        });
        analysisHtml += '</div>';
        resultContainer.innerHTML = analysisHtml;
    } catch (error) {
        resultContainer.innerHTML = `<p style="color: var(--danger);">${error.message}</p>`;
    }
};




const generateVideoDescription = async (button) => {
    if (!validateInputs()) return;
    showButtonLoading(button);
    const targetContentElement = document.getElementById('videoDescriptionContent');
    try {
        const { prompt, maxTokens } = constructScriptPrompt('description');
        const rawResult = await callGroqAPI(prompt, maxTokens);
        
        // Agora esperamos um objeto JSON
        const parsedContent = cleanGeneratedText(rawResult, true);
        
        if (!parsedContent || !parsedContent.description_text || !Array.isArray(parsedContent.hashtags)) {
            throw new Error("A IA não retornou a descrição e hashtags no formato esperado.");
        }

        // Salva o objeto inteiro no estado
        AppState.generated.description = parsedContent;
        
        // Monta o HTML separado
        const descriptionHtml = `<p>${DOMPurify.sanitize(parsedContent.description_text)}</p>`;
        const hashtagsHtml = `<div class="mt-4" style="color: var(--primary); font-weight: 500;">${parsedContent.hashtags.map(h => DOMPurify.sanitize(h)).join(' ')}</div>`;

        targetContentElement.innerHTML = `<div class="generated-output-box">${descriptionHtml}${hashtagsHtml}</div>`;

    } catch (error) {
        window.showToast(`Falha ao gerar Descrição: ${error.message}`, 'error');
        targetContentElement.innerHTML = `<div class="asset-card-placeholder" style="color: var(--danger);">${error.message}</div>`;
    } finally {
        hideButtonLoading(button);
    }
};

const generateSoundtrack = async (button) => {
    const fullTranscript = getTranscriptOnly();
    if (!fullTranscript) {
        window.showToast("Gere o roteiro completo primeiro.", 'info');
        return;
    }
    const outputContainer = document.getElementById('soundtrackContent');
    showButtonLoading(button);
    outputContainer.innerHTML = `<div class="loading-spinner-small mx-auto my-4"></div>`;
    const prompt = PromptManager.getSoundtrackPrompt(fullTranscript);
    try {
        const rawResult = await callGroqAPI(prompt, 1500);
        const analysis = cleanGeneratedText(rawResult, true);
        if (!analysis || !Array.isArray(analysis) || analysis.length === 0) throw new Error("A IA não retornou sugestões no formato esperado.");
        let suggestionsHtml = '<ul class="soundtrack-list space-y-2">';
        analysis.forEach(suggestion => {
            if (typeof suggestion === 'string') suggestionsHtml += `<li>${DOMPurify.sanitize(suggestion)}</li>`;
        });
        suggestionsHtml += '</ul>';
        outputContainer.innerHTML = `<div class="generated-output-box">${suggestionsHtml}</div>`;
    } catch (error) {
        console.error("Erro em generateSoundtrack:", error);
        outputContainer.innerHTML = `<p class="text-red-500 text-sm">Falha ao gerar sugestões: ${error.message}</p>`;
    } finally {
        hideButtonLoading(button);
    }
};






















const downloadPdf = async () => { /* ... Implementação completa da v5.0 ... */ };
const handleCopyAndDownloadTranscript = () => { /* ... Implementação completa da v5.0 ... */ };







const mapEmotionsAndPacing = async (button) => {
    const { script } = AppState.generated;
    const isScriptReady = script.intro?.text && script.development?.text && script.climax?.text;
    if (!isScriptReady) {
        window.showToast("Gere pelo menos a Introdução, Desenvolvimento e Clímax primeiro.", 'info');
        return;
    }

    const outputContainer = document.getElementById('emotionalMapContent');
    showButtonLoading(button);
    outputContainer.innerHTML = `<div class="loading-spinner-small mx-auto my-4"></div> <p class="text-center text-sm">Analisando a jornada emocional do roteiro...</p>`;

    try {
        AppState.generated.emotionalMap = null; 
        const fullTranscript = getTranscriptOnly();
        const paragraphs = fullTranscript.split('\n\n').filter(p => p.trim() !== '');
        
        const prompt = `Your single function is to return a JSON array. For each of the ${paragraphs.length} paragraphs below, analyze and return the main emotion and pacing.
        
**CRITICAL RULES:**
1.  Your response MUST BE ONLY the JSON array.
2.  The array must contain EXACTLY ${paragraphs.length} objects.
3.  Each object must have keys "emotion" and "pace".
4.  Allowed values for "emotion": 'strongly_positive', 'slightly_positive', 'neutral', 'slightly_negative', 'strongly_negative'.
5.  Allowed values for "pace": 'very_fast', 'fast', 'medium', 'slow', 'very_slow'.

**TEXT FOR ANALYSIS:**
${JSON.stringify(paragraphs)}

ACTION: Return ONLY the JSON array.`;

        const rawResult = await callGroqAPI(prompt, 8000);
        const emotionalMapData = cleanGeneratedText(rawResult, true, true);
      if (!emotionalMapData || !Array.isArray(emotionalMapData) || emotionalMapData.length === 0) {
    throw new Error("A IA não retornou um mapa emocional válido.");
}

// Se a IA retornou menos itens, avisa no console mas continua o processo com o que temos.
if(emotionalMapData.length < paragraphs.length) {
    console.warn(`Discrepância no Mapa Emocional: Esperado ${paragraphs.length}, Recebido ${emotionalMapData.length}. Usando dados parciais.`);
}

// Garante que nunca tentaremos acessar um índice que não existe.
AppState.generated.emotionalMap = emotionalMapData.slice(0, paragraphs.length);
        
        outputContainer.innerHTML = '';
        let paragraphCounter = 0;

        const sectionOrder = [
            { id: 'intro', title: 'Introdução' }, { id: 'development', title: 'Desenvolvimento' },
            { id: 'climax', title: 'Clímax' }, { id: 'conclusion', title: 'Conclusão' },
            { id: 'cta', title: 'Call to Action (CTA)' }
        ];

        // >>>>> LÓGICA DE AGRUPAMENTO DA FERRARI V5.0 <<<<<
        const emotionGroups = {
            'Positiva': ['strongly_positive', 'slightly_positive'], 'Negativa': ['strongly_negative', 'slightly_negative'],
            'Neutra': ['neutral']
        };
        const paceGroups = {
            'Rápido': ['very_fast', 'fast'], 'Médio': ['medium'], 'Lento': ['very_slow', 'slow']
        };
        const getGroupName = (value, groups) => {
            for (const groupName in groups) {
                if (groups[groupName].includes(value)) return groupName;
            }
            return value.charAt(0).toUpperCase() + value.slice(1);
        };
        // >>>>> FIM DA LÓGICA DE AGRUPAMENTO <<<<<

        sectionOrder.forEach(section => {
            const sectionScript = script[section.id];
            if (!sectionScript || !sectionScript.text) return;

            const numParagraphs = sectionScript.text.split('\n\n').filter(p => p.trim() !== '').length;
            const sectionEmotionsData = AppState.generated.emotionalMap.slice(paragraphCounter, paragraphCounter + numParagraphs);
            
            const groupedEmotions = [...new Set(sectionEmotionsData.map(e => getGroupName(e.emotion, emotionGroups)))];
            const groupedPaces = [...new Set(sectionEmotionsData.map(e => getGroupName(e.pace, paceGroups)))];

            const tagsHtml = groupedEmotions.map(emotion => `<span class="tag"><i class="fas fa-theater-masks mr-2"></i>${emotion}</span>`).join('') + 
                             groupedPaces.map(pace => `<span class="tag tag-pace"><i class="fas fa-tachometer-alt mr-2"></i>${pace}</span>`).join('');

            const sectionCardHtml = `
            <div class="card !p-6 mb-6 animate-fade-in">
                <div class="flex justify-between items-center mb-3">
                    <h2 class="text-xl font-bold">${section.title}</h2>
                    <button class="btn btn-ghost btn-small" onclick="window.copyTextToClipboard(this.nextElementSibling.textContent); window.showCopyFeedback(this);" title="Copiar Texto Completo">
                        <i class="fas fa-copy"></i>
                    </button>
                    <pre class="hidden">${DOMPurify.sanitize(sectionScript.text)}</pre>
                </div>
                <div class="flex flex-wrap gap-2 mb-4">
                    ${tagsHtml || '<span class="text-sm italic text-muted">Nenhuma emoção analisada.</span>'}
                </div>
                <div class="generated-content-wrapper text-base leading-relaxed">
                    ${sectionScript.html} 
                </div>
            </div>`;
            
            outputContainer.innerHTML += sectionCardHtml;
            paragraphCounter += numParagraphs;
        });
        
        window.showToast("Mapa Emocional re-analisado com sucesso!", 'success');

    } catch (error) {
        console.error("Erro detalhado ao gerar o Mapa Emocional:", error);
        outputContainer.innerHTML = `<p class="text-red-500 text-sm">Falha ao gerar o mapa: ${error.message}</p>`;
        AppState.generated.emotionalMap = null;
    } finally {
        hideButtonLoading(button);
    }
};


// ==========================================================
// ===== ANALISE DE RETENÇÃO ======
// ==========================================================

window.analyzeSectionRetention = async (button) => {
    const sectionId = button.dataset.sectionId;
    const sectionElement = document.getElementById(sectionId);
    const contentWrapper = sectionElement?.querySelector('.generated-content-wrapper');
    if (!contentWrapper || !contentWrapper.textContent.trim()) {
        window.showToast("Gere o roteiro desta seção antes de analisar a retenção.", 'info');
        return;
    }

    // A função original não tinha esta linha, mas ela é importante para limpar análises antigas
    const outputContainer = sectionElement.querySelector('.section-analysis-output');
    if (outputContainer) outputContainer.innerHTML = '';

    const paragraphs = Array.from(contentWrapper.querySelectorAll('div[id]'));
    if (paragraphs.length === 0) {
        window.showToast("Não há parágrafos para analisar nesta seção.", 'info');
        return;
    }

    showButtonLoading(button);

    try {
        const paragraphsWithIndexes = paragraphs.map((p, index) => ({
            index: index,
            text: p.textContent.trim()
        }));
        
        const basePromptContext = getBasePromptContext();

        const prompt = `Você é uma API de análise de roteiro que retorna JSON.

        **CONTEXTO ESTRATÉGICO:**
        ---
        ${basePromptContext}
        ---

        **REGRAS DE RESPOSTA (JSON ESTRITO):**
        1.  **JSON PURO:** Responda APENAS com o array JSON.
        2.  **ESTRUTURA COMPLETA:** Cada objeto DEVE conter "paragraphIndex" (número), "retentionScore" ("green", "yellow", ou "red"), e "suggestion" (string).
        3.  **SUGESTÕES ESTRATÉGICAS:** A "suggestion" DEVE ser um CONSELHO ACIONÁVEL sobre COMO melhorar, NÃO a reescrita do texto.
        4.  **SINTAXE:** Use aspas duplas ("") para todas as chaves e valores string.

        **MANUAL DE PONTUAÇÃO:**
        - **green:** Excelente. Prende a atenção. Sugestão: "Excelente fluidez.".
        - **yellow:** Ponto de Atenção. Funcional, mas pode ser mais impactante.
        - **red:** Ponto de Risco. Confuso, repetitivo ou quebra o engajamento.

        **DADOS PARA ANÁLISE:**
        ${JSON.stringify(paragraphsWithIndexes, null, 2)}

        **AÇÃO:** Analise CADA parágrafo. Retorne APENAS o array JSON perfeito.`;

        const rawResult = await callGroqAPI(prompt, 4000);
        const analysis = cleanGeneratedText(rawResult, true, true);

        if (!analysis || !Array.isArray(analysis)) {
            throw new Error("A análise da IA retornou um formato inválido.");
        }
        
        // Lógica de agrupamento da v5.0 (Ferrari)
        if (analysis.length > 0) {
            let currentGroup = [];
            for (let i = 0; i < analysis.length; i++) {
                const currentItem = analysis[i];
                const previousItem = i > 0 ? analysis[i - 1] : null;
                if (previousItem && currentItem.retentionScore === previousItem.retentionScore && currentItem.retentionScore !== 'green') {
                    currentGroup.push(currentItem);
                } else {
                    if (currentGroup.length > 1) {
                        const unifiedSuggestion = currentGroup[0].suggestion;
                        currentGroup.forEach(groupItem => groupItem.suggestion = unifiedSuggestion);
                    }
                    currentGroup = [currentItem];
                }
            }
            if (currentGroup.length > 1) {
                const unifiedSuggestion = currentGroup[0].suggestion;
                currentGroup.forEach(groupItem => groupItem.suggestion = unifiedSuggestion);
            }
        }
        
        const newParagraphs = paragraphs.map(p => {
            const newP = p.cloneNode(true);
            newP.className = 'retention-paragraph-live';
            newP.innerHTML = p.innerHTML.replace(/<div class="retention-tooltip">.*?<\/div>/g, '');
            p.parentNode.replaceChild(newP, p);
            return newP;
        });

        analysis.forEach((item, index) => {
            const p = newParagraphs[item.paragraphIndex];
            if (p) {
                p.classList.add(`retention-${item.retentionScore}`);
                p.dataset.suggestionGroup = item.suggestion;

                if (item.retentionScore === 'yellow' || item.retentionScore === 'red') {
                    const previousItem = index > 0 ? analysis[index - 1] : null;
                    if (!previousItem || item.suggestion !== previousItem.suggestion || (analysis.filter(s => s.suggestion === item.suggestion).length === 1)) {
                        const scoreLabels = { yellow: "PONTO DE ATENÇÃO", red: "PONTO DE RISCO" };
                        const tooltipTitle = scoreLabels[item.retentionScore] || 'ANÁLISE';

                        const suggestionTextEscaped = item.suggestion.replace(/"/g, '\"');
                        const buttonsHtml = `
                            <div class="flex gap-2 mt-3">
                                <button class="flex-1 btn btn-primary btn-small py-1" 
                                        data-action="optimizeGroup" 
                                        data-suggestion-text="${suggestionTextEscaped}">
                                    <i class="fas fa-magic mr-2"></i> Otimizar
                                </button>
                                <button class="flex-1 btn btn-danger btn-small py-1" 
                                        data-action="deleteParagraphGroup" 
                                        data-suggestion-text="${suggestionTextEscaped}">
                                    <i class="fas fa-trash-alt mr-2"></i> Deletar
                                </button>
                            </div>
                        `;
                        p.innerHTML += `<div class="retention-tooltip"><strong>${tooltipTitle}:</strong> ${DOMPurify.sanitize(item.suggestion)}${buttonsHtml}</div>`;
                    }
                }
                 p.addEventListener('mouseover', handleSuggestionMouseOver);
                 p.addEventListener('mouseout', handleSuggestionMouseOut);
            }
        });

        window.showToast("Análise de retenção concluída!", 'success');

    } catch (error) {
        console.error("Erro detalhado em analyzeSectionRetention:", error);
        window.showToast(`Falha na análise: ${error.message}`, 'error');
    } finally {
        hideButtonLoading(button);
    }
};

const handleSuggestionMouseOver = (event) => {
    const targetParagraph = event.currentTarget;
    const suggestionGroupText = targetParagraph.dataset.suggestionGroup;
    if (!suggestionGroupText) return;
    const contentWrapper = targetParagraph.closest('.generated-content-wrapper');
    if (!contentWrapper) return;
    const safeSuggestionSelector = suggestionGroupText.replace(/"/g, '\\"');
    contentWrapper.querySelectorAll(`[data-suggestion-group="${safeSuggestionSelector}"]`).forEach(p => {
        p.classList.add('highlight-group');
    });
};

const handleSuggestionMouseOut = (event) => {
    const targetParagraph = event.currentTarget;
    const contentWrapper = targetParagraph.closest('.generated-content-wrapper');
    if (!contentWrapper) return;
    contentWrapper.querySelectorAll('.highlight-group').forEach(p => {
        p.classList.remove('highlight-group');
    });
};


// ==========================================================
// ===== FIM DE ANALISE DE RETENÇÃO ======
// ==========================================================




window.refineSectionStyle = async (button) => {
    const sectionElement = button.closest('.accordion-item');
    if (!sectionElement) return;
    const contentWrapper = sectionElement.querySelector('.generated-content-wrapper');
    const originalText = contentWrapper?.textContent.trim();
    if (!originalText) {
        window.showToast("Não há texto para refinar nesta seção.", 'info');
        return;
    }

    showButtonLoading(button);
    try {
    const prompt = `Você é um EDITOR DE ESTILO (Copy Editor) DE ALTO DESEMPENHO e um ESPECIALISTA EM FLUÍDEZ NARRATIVA. Sua tarefa é REESCREVER o texto fornecido para elevar drasticamente sua QUALIDADE, FLUÍDEZ, IMPACTO e ORIGINALIDADE, sem alterar o significado, o tom ou a mensagem central.

**TEXTO ORIGINAL (PARA REFINAMENTO):**
---
${originalText}
---

**REGRAS DE REFINAMENTO ESTRATÉGICAS E CRÍTICAS (SIGA EXATAMENTE):**
1.  **ELIMINAÇÃO RIGOROSA DE REPETIÇÕES E REDUNDÂNCIAS:**
    - **Identificação Profunda:** Analise cuidadosamente o texto para identificar NÃO APENAS palavras repetidas, mas também IDEIAS, CONCEITOS e ESTRUTURAS DE FRASE repetitivas ou muito semelhantes.
    - **Remoção/Apresentação Variada:** Elimine completamente as repetições ou, quando a ideia for essencial, reexpresse-a de forma TOTALMENTE DIFERENTE usando sinônimos, metáforas, mudanças de perspectiva ou reestruturação completa da frase.
    - **Variação Sintática:** Diversifique drasticamente o tamanho e a construção das frases. Alterne entre frases curtas e longas, simples e complexas, para criar ritmo.
2.  **OTIMIZAÇÃO MÁXIMA DA FLUÍDEZ E COESÃO:**
    - **Conectivos Inteligentes:** Use conectivos lógicos e transições sutis para ligar as ideias de forma IMPECAVEL, garantindo um fluxo narrativo suave e natural.
    - **Leitura Aloud:** Certifique-se de que o texto, quando lido em voz alta, soe NATURAL, RÍTMICO e CATIVANTE. Evite travas linguísticas ou estruturas desconfortáveis.
3.  **PRESERVAÇÃO ESTRITAMENTE FIEL DO CONTEÚDO ORIGINAL:**
    - **Intocável:** NÃO adicione novas informações, opiniões, interpretações ou altere o significado central do texto original.
    - **Foco em Polir:** Sua única função é POLIR, APRIMORAR e REESCREVER para maior clareza e impacto, NÃO recriar o conteúdo.
4.  **RESPOSTA PURA E LIMPA (SEM EXTRAS):**
    - **Apenas o Texto Refinado:** Sua resposta deve ser APENAS o texto refinado, completo. NENHUM preâmbulo, comentário, metatexto, explicação ou nota adicional deve ser incluída.
    - **Formato Puro:** Retorne APENAS o conteúdo textual final, pronto para substituir o texto original.

**AÇÃO FINAL:** Reescreva AGORA o texto fornecido, aplicando EXATAMENTE todas as regras acima para entregar uma versão significativamente mais refinada, fluida, impactante e livre de repetições. Responda APENAS com o texto final refinado.
`;

        const rawResult = await callGroqAPI(prompt, 8000);
        const refinedText = removeMetaComments(rawResult);
        const newParagraphs = refinedText.split('\n').filter(p => p.trim() !== '');
        const sectionId = sectionElement.id.replace('Section', '');
        const newHtml = newParagraphs.map((p, index) => `<div id="${sectionId}-p-${index}">${DOMPurify.sanitize(p)}</div>`).join('');
        
        contentWrapper.innerHTML = newHtml;

        if (AppState.generated.script[sectionId]) {
            AppState.generated.script[sectionId].html = newHtml;
            AppState.generated.script[sectionId].text = refinedText;
        }

        invalidateAndClearPerformance(sectionElement);
        invalidateAndClearPrompts(sectionElement);
        invalidateAndClearEmotionalMap();
        updateAllReadingTimes();
        window.showToast("Estilo do roteiro refinado com sucesso!", 'success');
    } catch (error) {
        window.showToast(`Falha ao refinar o estilo: ${error.message}`, 'error');
    } finally {
        hideButtonLoading(button);
    }
};





window.enrichWithData = async (button) => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0 || selection.toString().trim().length < 10) {
        window.showToast("Por favor, selecione um trecho de texto com pelo menos 10 caracteres para enriquecer.", 'info');
        return;
    }
    
    userSelectionRange = selection.getRangeAt(0).cloneRange();
    const selectedText = selection.toString().trim();

    const newData = await showInputDialog(
        'Enriquecer com Dados',
        'Cole abaixo o dado, fonte ou exemplo que você quer adicionar ao trecho selecionado.',
        'Nova Informação:',
        'Ex: Fonte: Forbes 2023; Segundo o Dr. especialista...'
    );

    if (!newData) {
        window.showToast("Operação cancelada.", 'info');
        userSelectionRange = null;
        return;
    }

    showButtonLoading(button);
    const sectionElement = button.closest('.accordion-item');

    try {
        // ==========================================================
        // ===== PROMPT EXATO DA VERSÃO 5.0 RESTAURADO AQUI =====
        // ==========================================================
        const prompt = `Você é um EDITOR DE ROTEIRO DE ALTO DESEMPENHO e um ESPECIALISTA EM INTEGRAÇÃO DE INFORMAÇÕES. Sua tarefa ÚNICA, CRÍTICA e INEGOCIÁVEL é REESCREVER um trecho de texto para integrar uma NOVA INFORMAÇÃO de forma TOTALMENTE NATURAL, FLUÍDA e PROFISSIONAL, sem comprometer a integridade do texto original.

**TRECHO ORIGINAL DO ROTEIRO (PARA SER REESCRITO):**
---
${selectedText}
---

**NOVA INFORMAÇÃO A SER INTEGRADA (DADO EXTERNO):**
---
${newData}
---

**SUA TAREFA ESTRATÉGICA E CRÍTICA (A ÚNICA E MAIS IMPORTANTE):**
- REESCREVA o "Trecho Original do Roteiro" com o OBJETIVO PRIMÁRIO de TECER a "Nova Informação a ser Integrada" de forma PERFEITAMENTE NATURAL e FLUÍDA.
- O resultado final DEVE ser um ou mais parágrafos COESOS, BEM ESCRITOS e LOGICAMENTE INTEGRADOS.
- O texto reescrito DEVE manter o TOM, o RITMO e a MENSAGEM CENTRAL do texto original, agora ENRIQUECIDO e ATUALIZADO com o novo dado fornecido.
- A integração deve ser TÃO SUTIL que o leitor não perceba uma costura; deve soar como se a informação sempre tivesse estado lá.

**REGRAS ABSOLUTAMENTE INEGOCIÁVEIS (VIOLAÇÕES RESULTARÃO EM FALHA):**
1.  **RESPOSTA PURA E LIMPA:** Sua resposta deve ser APENAS o texto final reescrito. NENHUM outro conteúdo (preâmbulos, comentários, títulos, explicações, metadados) é permitido.
2.  **SEM AUTO-REFERÊNCIA:** É TERMINANTEMENTE PROIBIDO apresentar-se, falar sobre suas habilidades ou qualquer forma de metatexto.
3.  **SEM DESVIO DE TAREFA:** É ESTRITAMENTE PROIBIDO desviar-se da tarefa precisa de reescrever e integrar. Foque exclusivamente na fusão perfeita dos dois textos.
4.  **PRESERVAÇÃO DO CONTEXTO:** NÃO altere o significado central ou o tom do "Trecho Original". A nova informação deve se encaixar como uma peça complementar, não como uma substituição.

**AÇÃO FINAL:** Reescreva AGORA o trecho, integrando a nova informação com MÁXIMA habilidade e conformidade. Responda APENAS com o texto final reescrito e integrado.`;

        const rawResult = await callGroqAPI(prompt, 1000);
        const enrichedText = removeMetaComments(rawResult);

        if (userSelectionRange) {
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(userSelectionRange);
            document.execCommand('insertHTML', false, DOMPurify.sanitize(`<span class="highlight-change">${enrichedText}</span>`, {ADD_TAGS: ['span'], ADD_ATTR: ['class']}));
        }
        
        if (sectionElement) {
            const contentWrapper = sectionElement.querySelector('.generated-content-wrapper');
            const sectionId = sectionElement.id.replace('Section', '');
            if (AppState.generated.script[sectionId]) {
                AppState.generated.script[sectionId].html = contentWrapper.innerHTML;
                AppState.generated.script[sectionId].text = contentWrapper.textContent;
            }
            invalidateAndClearPerformance(sectionElement);
            invalidateAndClearPrompts(sectionElement);
            invalidateAndClearEmotionalMap();
            updateAllReadingTimes();
        }

        window.showToast("Texto enriquecido com sucesso!", 'success');

    } catch (error) {
        console.error("Erro detalhado em enrichWithData:", error);
        window.showToast(`Falha ao enriquecer o texto: ${error.message}`, 'error');
    } finally {
        hideButtonLoading(button);
        userSelectionRange = null;
    }
};









// =========================================================================
// >>>>> VERSÃO FINAL E BLINDADA DE 'addDevelopmentChapter' <<<<<
// =========================================================================
/**
 * Adiciona um novo capítulo ao desenvolvimento, com prompt refinado para evitar repetição do título e "ecos".
 * @param {HTMLElement} button - O botão que foi clicado.
 */
window.addDevelopmentChapter = async (button) => {
    const devSection = document.getElementById('developmentSection');
    const contentWrapper = devSection?.querySelector('.generated-content-wrapper');
    const existingText = contentWrapper?.textContent.trim();

    if (!existingText) {
        window.showToast("Gere o desenvolvimento inicial primeiro.", 'info');
        return;
    }

    showButtonLoading(button);

try {
    const suggestionPrompt = `Você é uma API ESPECIALISTA EM ESTRATÉGIA NARRATIVA e um ARQUITETO DA CONTINUIDADE. Sua função ÚNICA E CRÍTICA é analisar o final de um roteiro e propor 3 temas distintos, coerentes e emocionantes para o PRÓXIMO capítulo.

**IDENTIDADE E ESPECIALIZAÇÃO (A REGRA MAIS IMPORTANTE):**
Você não é um gerador de texto. Você é um mestre roteirista que identifica pontos de virada lógicos e emocionantes. Sua tarefa é encontrar os próximos passos mais envolventes para a história. Qualquer desvio desta função é uma falha.

**ROTEIRO ATUAL (PARA ANÁLISE DE CONTINUIDADE CRÍTICA):**
---
${existingText.slice(-3000)} 
---

**TAREFA:** Analise o fluxo narrativo do roteiro acima e gere um array JSON com as 3 sugestões mais fortes, coerentes e cativantes para o tema do próximo capítulo.

**REGRAS CRÍTICAS DE SINTAXE E ESTRUTURA JSON (ABSOLUTAMENTE INEGOCIÁVEIS):**
1.  **JSON PURO E PERFEITO:** Sua resposta deve ser APENAS um array JSON válido, começando com \`[\` e terminando com \`]\`. Nenhum texto, comentário ou metadado é permitido.
2.  **ESTRUTURA DO ARRAY:** O array deve conter EXATAMENTE 3 strings.
3.  **SINTAXE DAS STRINGS:** Todas as strings DEVEM usar aspas duplas (""). Cada string, EXCETO a última, DEVE ser seguida por uma vírgula (,).

**MANUAL DE CRIAÇÃO DE SUGESTÕES (SEUS CRITÉRIOS DE QUALIDADE):**
- **Distinção:** Cada uma das 3 sugestões deve ser claramente diferente das outras.
- **Coerência e Conexão Lógica:** Cada sugestão deve ser uma consequência natural ou uma ramificação interessante do ponto onde o roteiro atual termina.
- **Originalidade e Novidade:** Evite o óbvio. Cada sugestão deve introduzir um novo elemento, conflito ou perspectiva que avance a narrativa.
- **Especificidade:** As sugestões devem ser títulos de capítulo ou temas específicos e acionáveis. Evite generalidades.
    - **Exemplos BONS (Específicos):** "A Descoberta do Diário", "O Confronto com o Antigo Mentor", "O Plano B que Ninguém Esperava".
    - **Exemplos RUINS (Genéricos):** "Mais desenvolvimento", "Uma nova reviravolta", "Aprofundar o personagem".

**EXEMPLO DE FORMATO PERFEITO E OBRIGATÓRIO:**
["A Batalha dos Números", "O Legado Fora de Campo", "Momentos Decisivos"]

**AÇÃO FINAL:** Com base no roteiro fornecido, gere o array JSON. Responda APENAS com o array JSON perfeito, seguindo EXATAMENTE todas as regras.`;

    const rawSuggestions = await callGroqAPI(suggestionPrompt, 400);

        const chapterSuggestions = cleanGeneratedText(rawSuggestions, true) || [];
        
        hideButtonLoading(button);

        const chapterTheme = await showInputDialog(
            'Adicionar Novo Capítulo',
            'Escolha uma sugestão da IA ou digite seu próprio tema abaixo.',
            'Ou crie um tema personalizado:',
            'Digite seu tema aqui...',
            chapterSuggestions
        );

        if (!chapterTheme) {
            window.showToast("Operação cancelada.", 'info');
            return;
        }

        showButtonLoading(button);

        const basePrompt = getBasePromptContext();
const continuationPrompt = `${basePrompt}

**IDENTIDADE E ESPECIALIZAÇÃO (A REGRA MAIS IMPORTANTE):**
Você é um ROTEIRISTA CONTINUÍSTA DE ELITE. Sua única função é escrever o PRÓXIMO capítulo de um roteiro existente, com foco absoluto em **NOVIDADE** e **PROGRESSÃO NARRATIVA**.

**INFORMAÇÃO CRÍTICA PARA O ROTEIRISTA:**
O texto abaixo representa tudo o que o espectador JÁ ASSISTIU E JÁ SABE. É **TERMINANTEMENTE PROIBIDO** repetir, resumir ou parafrasear qualquer conceito ou evento já mencionado. Repetir informações quebra a imersão e será considerado uma falha grave na sua tarefa.

**ROTEIRO ESCRITO ATÉ AGORA (CONHECIMENTO JÁ ADQUIRIDO PELO PÚBLICO):**
---
${existingText}
---

**TAREFA IMEDIATA E FOCALIZADA:**
Escrever o texto puro e narrado para o **PRÓXIMO CAPÍTULO**, com o tema: "${chapterTheme}".

**SUA MISSÃO:**
Sua única missão é **AVANÇAR A HISTÓRIA**. Introduza novos fatos, aprofunde um novo argumento, explore uma nova consequência ou apresente um novo conflito relacionado ao tema "${chapterTheme}". O espectador está esperando para saber o que acontece a seguir, não para ouvir de novo o que já passou.

**REGRAS DE FORMATAÇÃO (INEGOCIÁVEIS):**
1.  **RESPOSTA 100% PURA:** Sua resposta deve conter **APENAS e SOMENTE** o texto que será dito em voz alta.
2.  **NENHUMA FORMATAÇÃO EXTRA:** É proibido incluir qualquer anotação, rótulo de personagem, descrição de cena ou o título do capítulo na sua resposta.

**AÇÃO FINAL:** Escreva AGORA o texto para o novo capítulo sobre "${chapterTheme}", garantindo que cada frase introduza conteúdo 100% novo para o espectador. Responda APENAS com o texto a ser narrado.
`;
        
        const rawResult = await callGroqAPI(continuationPrompt, 4000);
        const newChapter = removeMetaComments(rawResult.trim());
        
        if (!newChapter || newChapter.trim() === "") {
             throw new Error("A IA não retornou um conteúdo válido para o novo capítulo.");
        }

        const chapterTitleHtml = `<div class="font-bold text-lg mt-6 mb-3 pb-1 border-b border-gray-300 dark:border-gray-600">Capítulo: ${DOMPurify.sanitize(chapterTheme)}</div>`;
        const existingParagraphsCount = contentWrapper.querySelectorAll('div[id]').length;
        const newParagraphs = newChapter.split('\n').filter(p => p.trim() !== '');
        
        if (newParagraphs.length === 0) {
             throw new Error("O conteúdo do capítulo não pôde ser dividido em parágrafos.");
        }

        const newContentWithDivs = newParagraphs.map((p, index) => 
            `<div id="development-p-${existingParagraphsCount + index}">${DOMPurify.sanitize(p)}</div>`
        ).join('');

        contentWrapper.insertAdjacentHTML('beforeend', chapterTitleHtml + newContentWithDivs);
        
        invalidateAndClearPerformance(devSection);
        invalidateAndClearPrompts(devSection);
        invalidateAndClearEmotionalMap(); // <<< CHAMADA ADICIONADA AQUI
        updateAllReadingTimes();
        
        window.showToast("Novo capítulo adicionado com sucesso!", 'success');
        contentWrapper.lastElementChild.previousElementSibling?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    } catch (error) {
        console.error("Erro detalhado em addDevelopmentChapter:", error);
        window.showToast(`Falha ao adicionar capítulo: ${error.message}`);
    } finally {
        hideButtonLoading(button);
    }
};

// =========================================================================
// >>>>> FIM DA VERSÃO BLINDADA DE 'addDevelopmentChapter' <<<<<
// =========================================================================


window.suggestPerformance = async (button) => {
    const sectionId = button.dataset.sectionId;
    const sectionElement = document.getElementById(sectionId);
    const contentWrapper = sectionElement?.querySelector('.generated-content-wrapper');
    const outputContainer = sectionElement?.querySelector('.section-performance-output');

    if (!contentWrapper || !contentWrapper.textContent.trim() || !outputContainer) {
        window.showToast("Gere o roteiro desta seção primeiro.", 'info');
        return;
    }

    showButtonLoading(button);
    outputContainer.innerHTML = `<div class="loading-spinner-small mx-auto my-4"></div>`;
    
    try {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = contentWrapper.innerHTML;
        tempDiv.querySelectorAll('.retention-tooltip').forEach(el => el.remove());
        
        const originalParagraphs = Array.from(tempDiv.querySelectorAll('div[id]')).map(p => p.textContent.trim());
        if (originalParagraphs.length === 0) throw new Error("Não foram encontrados parágrafos estruturados para análise.");

        const batchSize = 15;
        const apiPromises = [];

        for (let i = 0; i < originalParagraphs.length; i += batchSize) {
            const paragraphBatch = originalParagraphs.slice(i, i + batchSize);
            let promptContext = '';
            paragraphBatch.forEach((p, indexInBatch) => {
                const globalIndex = i + indexInBatch;
                promptContext += `Parágrafo ${globalIndex}: "${p}"\n\n`;
            });
            
            const prompt = `Você é uma API de análise de roteiro. Sua resposta DEVE ser um array JSON.

**REGRAS DE FORMATAÇÃO (INEGOCIÁVEIS E CRÍTICAS):**
1.  Sua resposta final DEVE ser um array JSON válido.
2.  O array deve conter EXATAMENTE ${paragraphBatch.length} objetos, um para cada parágrafo fornecido.
3.  Cada objeto DEVE ter duas chaves: "general_annotation" (string) e "emphasis_words" (um array com no máximo 1 string).
4.  Se um parágrafo não necessitar de anotação, retorne um objeto com valores vazios: {"general_annotation": "", "emphasis_words": []}.

**EXEMPLO DE RESPOSTA PERFEITA:**
[
  { "general_annotation": "[Tom de surpresa]", "emphasis_words": ["inacreditável"] },
  { "general_annotation": "", "emphasis_words": [] }
]

Analise os ${paragraphBatch.length} parágrafos a seguir e retorne o array JSON.

**ROTEIRO (LOTE ATUAL):**
${promptContext}`;
            apiPromises.push(callGroqAPI(prompt, 3000).then(res => cleanGeneratedText(res, true)));
        }

        const allBatchResults = await Promise.all(apiPromises);
        
        // >>>>> A CORREÇÃO CRÍTICA ESTÁ AQUI <<<<<
        // Garante que o número de anotações NUNCA seja maior que o de parágrafos.
        const annotations = allBatchResults.flat().slice(0, originalParagraphs.length);

        if (!Array.isArray(annotations)) { 
            throw new Error("A IA não retornou um array de anotações válido.");
        }
        
        let annotatedParagraphs = [];
        originalParagraphs.forEach((p, index) => {
            const annotationData = (annotations && annotations[index]) ? annotations[index] : { general_annotation: '', emphasis_words: [] };
            let annotatedParagraph = p;
            if (annotationData?.emphasis_words?.length > 0) {
                const word = annotationData.emphasis_words[0];
                if (word && typeof word === 'string' && word.trim() !== '') {
                    const escapedWord = word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                    const wordRegex = new RegExp(`\\b(${escapedWord})\\b`, 'gi');
                    annotatedParagraph = annotatedParagraph.replace(wordRegex, `[ênfase em '$1']`);
                }
            }
            const finalParagraph = `${annotationData.general_annotation || ''} ${annotatedParagraph}`;
            annotatedParagraphs.push(finalParagraph.trim());
        });
        
        const finalAnnotatedText = annotatedParagraphs.join('\n\n');
        const highlightedText = finalAnnotatedText.replace(/(\[.*?\])/g, '<span style="color: var(--primary); font-weight: 600; font-style: italic;">$1</span>');

        outputContainer.innerHTML = `<div class="card" style="background: var(--bg);"><h5 class="output-subtitle" style="font-size: 1rem; font-weight: 700; color: var(--text-header); margin-bottom: 0.75rem; padding-bottom: 0.5rem; border-bottom: 1px dashed var(--border);">Sugestão de Performance:</h5><p class="whitespace-pre-wrap">${highlightedText}</p></div>`;
            
    } catch (error) {
        outputContainer.innerHTML = `<p class="text-sm" style="color: var(--danger);">Falha ao sugerir performance: ${error.message}</p>`;
        console.error("Erro detalhado em suggestPerformance:", error);
    } finally {
        hideButtonLoading(button);
    }
};




// =========================================================================
// >>>>> VERSÃO OTIMIZADA que NÃO SALVA o styleBlock repetidamente <<<<<
// =========================================================================
window.generatePromptsForSection = async (button) => {
    const sectionId = button.dataset.sectionId;
    const sectionElement = document.getElementById(sectionId);
    const contentWrapper = sectionElement?.querySelector('.generated-content-wrapper');
    const promptContainer = sectionElement?.querySelector('.prompt-container');

    if (!contentWrapper || !contentWrapper.textContent.trim() || !promptContainer) {
        window.showToast("Gere o conteúdo do roteiro desta seção primeiro.", 'info');
        return;
    }

    showButtonLoading(button);
    promptContainer.innerHTML = `<div class="loading-spinner-small mx-auto my-4"></div>`;

    try {
        const allChildren = Array.from(contentWrapper.children);
        const paragraphsWithContext = [];
        let currentChapterTitle = "Contexto Geral";
        allChildren.forEach(child => {
            if (child.classList.contains('font-bold') && child.textContent.includes('Capítulo:')) {
                currentChapterTitle = child.textContent.replace('Capítulo:', '').trim();
            } else if (child.id && child.id.includes('-p-')) {
                paragraphsWithContext.push({ text: child.textContent.trim().replace(/\[.*?\]/g, ''), chapter: currentChapterTitle });
            }
        });

        if (paragraphsWithContext.length === 0) { throw new Error("Não foram encontrados parágrafos estruturados para análise."); }

        const batchSize = 3;
        const apiPromises = [];
        const visualPacing = document.getElementById('visualPacing').value;
        const durationMap = { 'dinamico': '3 e 8', 'normal': '8 e 15', 'contemplativo': '15 e 25' };
        const durationRange = durationMap[visualPacing] || '3 e 8';

        for (let i = 0; i < paragraphsWithContext.length; i += batchSize) {
            const batch = paragraphsWithContext.slice(i, i + batchSize);
            let promptContextForAI = '';
            batch.forEach((item, indexInBatch) => {
                const globalIndex = i + indexInBatch;
                promptContextForAI += `\nParágrafo ${globalIndex}:\n- Título do Capítulo (Guia Temático): "${item.chapter}"\n- Texto do Parágrafo: "${item.text}"`;
            });
            
const prompt = `# INSTRUÇÕES PARA GERAÇÃO DE PROMPTS VISUAIS CINEMATOGRÁFICOS

Você é uma especialista em criação de prompts visuais cinematográficos. Sua função é analisar parágrafos e transformá-los em descrições de imagem ricas em detalhes.

## REGRAS DE FORMATAÇÃO (OBRIGATÓRIAS)

1. **FORMATO JSON EXCLUSIVO**: Sua resposta deve ser APENAS um array JSON válido, começando com [ e terminando com ]
2. **ASPAS DUPLAS OBRIGATÓRIAS**: Todas as chaves e valores de texto devem usar aspas duplas (")
3. **PROIBIÇÃO DE ASPAS INTERNAS**: Nos valores de texto, use apenas aspas simples (') para ênfase
4. **ESTRUTURA PADRÃO**: Cada objeto deve ter exatamente duas chaves:
   - "imageDescription" (string): descrição visual detalhada
   -estimated_duration" (número inteiro): duração estimada em segundos

## EXEMPLO DE FORMATAÇÃO CORRETA

[
  {
    "imageDescription": "Um homem solitário caminha por uma rua deserta à noite, sob a luz amarela dos postes. A câmera em plano médio captura sua expressão cansada enquanto a chuva reflete nas calçadas. Estilo film noir com alto contraste entre luzes e sombras.",
    "estimated_duration": 5
  },
  {
    "imageDescription": "Close-up em mãos trêmulas segurando uma carta antiga. A luz da manhã entra pela janela, destacando a textura do papel amarelado e a caligrafia tremida. Foco shallow com fundo suavizado.",
    "estimated_duration": 3
  }
]

## CHECKLIST PARA CRIAÇÃO DA DESCRIÇÃO VISUAL

Para cada parágrafo, crie uma descrição visual rica respondendo a estas perguntas:

### Elementos Visuais Principais
- **Cenário e Ambiente**: Onde a cena acontece? Descreva o local e atmosfera sensorial
- **Composição Visual**: Quais elementos principais e como estão organizados no quadro?
- **Iluminação**: Qual a qualidade, direção e tipo de luz?
- **Paleta de Cores**: Quais cores dominantes refletem a emoção da cena?

### Técnicas Cinematográficas
- **Ângulo da Câmera**: De onde olhamos a cena (plano geral, close, etc.)?
- **Estilo Visual**: Qual a estética (realista, vintage, etc.)?
- **Foco e Profundidade**: O que está nítido e o que está desfocado?
- **Movimento e Ação**: Há movimento de câmera ou personagens?

### Elementos Emocionais e Narrativos
- **Elementos Emocionais**: Quais elementos visuais amplificam a emoção?
- **Expressões Faciais**: Como os personagens expressam suas emoções?
- **Símbolos Chave**: Quais objetos ou elementos são importantes para a narrativa?
- **Texturas e Materiais**: Quais texturas aumentam o realismo?

### Contexto e Atmosfera
- **Profundidade e Escala**: Como o espaço é representado?
- **Elementos Temporais ou Climáticos**: Qual o momento do dia, clima ou estação?

## DIRETRIZES ADICIONAIS

- Priorize elementos visuais que melhor representem a essência do parágrafo
- Mantenha consistência de estilo entre prompts consecutivos quando aplicável
- Para "estimated_duration", use valores inteiros entre ${durationRange} segundos, baseando-se na complexidade da cena
- Se o texto de entrada for ambíguo, faça escolhas criativas coerentes com o contexto geral

## DADOS PARA ANÁLISE

---
${promptContextForAI}
---

## AÇÃO FINAL

Com base nestas instruções, gere exatamente ${batch.length} objetos JSON no formato especificado, seguindo rigorosamente todas as regras de formatação.`;
            
            apiPromises.push(callGroqAPI(prompt, 4000).then(res => cleanGeneratedText(res, true, true)));
        }

        const allBatchResults = await Promise.all(apiPromises);
        let allGeneratedPrompts = allBatchResults.flat();
        if (!Array.isArray(allGeneratedPrompts) || allGeneratedPrompts.length < paragraphsWithContext.length) {
            throw new Error("A IA não retornou um prompt para cada parágrafo.");
        }

        const curatedPrompts = allGeneratedPrompts.slice(0, paragraphsWithContext.length).map((promptData, index) => ({
            scriptPhrase: paragraphsWithContext[index].text,
            imageDescription: promptData.imageDescription || "Falha ao gerar descrição.",
            estimated_duration: promptData.estimated_duration || 5
        }));

        const applyCinematicStyle = document.getElementById('imageStyleSelect').value === 'cinematic';
        AppState.generated.imagePrompts[sectionId] = curatedPrompts.map(p => ({
            ...p, applyStyleBlock: applyCinematicStyle
        }));
        
        AppState.ui.promptPaginationState[sectionId] = 0;
        
        promptContainer.innerHTML = `
            <div class="prompt-pagination-wrapper space-y-4">
                <div class="prompt-nav-container flex items-center justify-center gap-4"></div>
                <div class="prompt-items-container space-y-4"></div>
            </div>
        `;
        renderPaginatedPrompts(sectionId);

    } catch (error) {
        promptContainer.innerHTML = `<p class="text-sm" style="color: var(--danger);">${error.message}</p>`;
    } finally {
        hideButtonLoading(button);
    }
};

const renderPaginatedPrompts = (sectionElementId) => {
    const sectionElement = document.getElementById(sectionElementId);
    if (!sectionElement) return;

    const itemsPerPage = 4;
    const prompts = AppState.generated.imagePrompts[sectionElementId] || [];
    if (prompts.length === 0) return;
    
    const currentPage = AppState.ui.promptPaginationState[sectionElementId] || 0;
    const totalPages = Math.ceil(prompts.length / itemsPerPage);
    const promptItemsContainer = sectionElement.querySelector('.prompt-items-container');
    const navContainer = sectionElement.querySelector('.prompt-nav-container');

    if (!promptItemsContainer || !navContainer) return;
    promptItemsContainer.innerHTML = '';
    
    // Lógica exata da V5.0 que você me mostrou, com cumulativeSeconds e globalSceneCounter
    let cumulativeSeconds = 0;
    let globalSceneCounter = 1;
    const sectionOrder = ['introSection', 'developmentSection', 'climaxSection', 'conclusionSection', 'ctaSection'];
    const currentSectionIndex = sectionOrder.indexOf(sectionElementId);

    for (let i = 0; i < currentSectionIndex; i++) {
        const prevPrompts = AppState.generated.imagePrompts[sectionOrder[i]] || [];
        prevPrompts.forEach(p => {
            cumulativeSeconds += parseInt(p.estimated_duration, 10) || 0;
        });
        globalSceneCounter += prevPrompts.length;
    }
    
    const startIndex = currentPage * itemsPerPage;
    prompts.slice(0, startIndex).forEach(p => {
        cumulativeSeconds += parseInt(p.estimated_duration, 10) || 0;
    });
    globalSceneCounter += startIndex;

    const promptsToShow = prompts.slice(startIndex, startIndex + itemsPerPage);
    
    promptsToShow.forEach((promptData, index) => {
        const minutes = Math.floor(cumulativeSeconds / 60);
        const seconds = cumulativeSeconds % 60;
        const timestamp = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        const sceneNumber = globalSceneCounter + index;

        const fullPromptText = promptData.applyStyleBlock
            ? `${promptData.imageDescription} ${CINEMATIC_STYLE_BLOCK}`
            : promptData.imageDescription;
        
        const styleIndicatorHtml = promptData.applyStyleBlock
            ? `<p class="text-xs italic" style="color: var(--primary);">[Estilo Cinematográfico Aplicado]</p>`
            : '';

        const promptHtml = `
            <div class="card !p-3 animate-fade-in" style="background: var(--bg);">
                <div class="prompt-header" style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                    <span class="tag tag-scene"><i class="fas fa-film mr-2"></i>Cena ${String(sceneNumber).padStart(2, '0')}</span>
                    <span class="tag tag-time"><i class="fas fa-clock mr-2"></i>${timestamp}</span>
                    <button class="btn btn-ghost btn-small ml-auto" onclick="window.copyTextToClipboard(this.nextElementSibling.textContent); window.showCopyFeedback(this)" title="Copiar Prompt Completo" style="padding: 4px 8px !important;">
                        <i class="fas fa-copy"></i>
                    </button>
                    <pre class="hidden">${DOMPurify.sanitize(fullPromptText)}</pre>
                </div>
                <p class="paragraph-preview" style="font-size: 0.85rem; font-style: italic; color: var(--text-muted); margin-bottom: 0.5rem;">"${DOMPurify.sanitize(promptData.scriptPhrase.substring(0, 100))}..."</p>
                <p>${DOMPurify.sanitize(promptData.imageDescription)}</p>
                ${styleIndicatorHtml}
            </div>
        `;
        promptItemsContainer.innerHTML += promptHtml;
        cumulativeSeconds += parseInt(promptData.estimated_duration, 10) || 0;
    });
    
    if (totalPages > 1) {
        navContainer.innerHTML = `
            <button class="btn btn-secondary btn-small" onclick="window.navigatePrompts('${sectionElementId}', -1)" ${currentPage === 0 ? 'disabled' : ''}><i class="fas fa-chevron-left"></i></button>
            <span class="text-sm font-medium">Página ${currentPage + 1} de ${totalPages}</span>
            <button class="btn btn-secondary btn-small" onclick="window.navigatePrompts('${sectionElementId}', 1)" ${currentPage + 1 >= totalPages ? 'disabled' : ''}><i class="fas fa-chevron-right"></i></button>
        `;
    } else {
        navContainer.innerHTML = '';
    }
};

window.navigatePrompts = (sectionElementId, direction) => {
    const prompts = AppState.generated.imagePrompts[sectionElementId] || [];
    const itemsPerPage = 4;
    const totalPages = Math.ceil(prompts.length / itemsPerPage);
    let currentPage = AppState.ui.promptPaginationState[sectionElementId] || 0;
    const newPage = currentPage + direction;
    if (newPage >= 0 && newPage < totalPages) {
        AppState.ui.promptPaginationState[sectionElementId] = newPage;
        renderPaginatedPrompts(sectionElementId);
    }
};


// =========================================================================
// >>>>> FIM DA VERSÃO BLINDADA DE 'generatePromptsForSection' <<<<<
// =========================================================================




window.optimizeGroup = async (button, suggestionText) => {
    if (!button || !suggestionText) return;

    const safeSelector = suggestionText.replace(/"/g, '\\"');
    const paragraphsToOptimize = document.querySelectorAll(`[data-suggestion-group="${safeSelector}"]`);

    if (paragraphsToOptimize.length === 0) {
        window.showToast("Erro: parágrafos para otimizar não encontrados.", 'error');
        return;
    }

    const originalButtonHTML = button.innerHTML;
    button.innerHTML = '<div class="loading-spinner" style="width:16px; height:16px; border-width: 2px; margin: auto;"></div>';
    button.disabled = true;

    try {
        const originalBlock = Array.from(paragraphsToOptimize).map(p => p.textContent.trim()).join('\n\n');
        if (!originalBlock.trim()) throw new Error("O bloco de texto original está vazio.");

        const basePromptContext = getBasePromptContext();
        const fullScriptContext = getTranscriptOnly();   
        
        const prompt = `Você é um EDITOR DE ROTEIRO DE ELITE e um ESPECIALISTA EM REESCRITA (Copywriter). Sua tarefa é REESCREVER um bloco de texto problemático para que ele se alinhe PERFEITAMENTE ao tom e estilo do roteiro, resolvendo o problema apontado.

**REGRAS CRÍTICAS:**
1.  **RESPOSTA PURA:** Responda APENAS com o novo bloco de texto reescrito.
2.  **FLUXO NATURAL:** O novo bloco deve fluir de forma coesa com o restante do roteiro.
3.  **RESPEITO AO TOM:** Mantenha o tom e estilo definidos no contexto.

**CONTEXTO GERAL DO PROJETO:**
---
${basePromptContext}
---

**ROTEIRO COMPLETO (PARA CONSISTÊNCIA):**
---
${fullScriptContext.substring(0, 2000)}...
---

**TAREFA:**
- **PROBLEMA A CORRIGIR:** "${suggestionText}"
- **BLOCO DE TEXTO ORIGINAL (PARA REESCREVER):**
---
${originalBlock}
---

Reescreva o bloco de texto acima, corrigindo o problema. Responda APENAS com o novo texto.`;

        const rawResult = await callGroqAPI(prompt, 3000);
        const newContent = removeMetaComments(rawResult.trim());
        if (!newContent.trim()) throw new Error("A IA não retornou um conteúdo válido.");

        const newParagraphs = newContent.split('\n').filter(p => p.trim() !== '');

        const firstParagraph = paragraphsToOptimize[0];
        const contentWrapper = firstParagraph.parentElement;
        const sectionElement = firstParagraph.closest('.accordion-item');
        
        firstParagraph.innerHTML = DOMPurify.sanitize(newParagraphs[0] || '');
        firstParagraph.classList.add('highlight-change');
        firstParagraph.removeAttribute('data-suggestion-group');
        // Remove os event listeners antigos para evitar duplicação
        firstParagraph.removeEventListener('mouseover', handleSuggestionMouseOver);
        firstParagraph.removeEventListener('mouseout', handleSuggestionMouseOut);

        let lastElement = firstParagraph;
        for (let i = 1; i < newParagraphs.length; i++) {
            const newDiv = document.createElement('div');
            newDiv.innerHTML = DOMPurify.sanitize(newParagraphs[i]);
            newDiv.className = 'highlight-change';
            contentWrapper.insertBefore(newDiv, lastElement.nextSibling);
            lastElement = newDiv;
        }

        for (let i = 1; i < paragraphsToOptimize.length; i++) {
            paragraphsToOptimize[i].remove();
        }

        if (sectionElement) {
            invalidateAndClearPerformance(sectionElement);
            invalidateAndClearPrompts(sectionElement);
            invalidateAndClearEmotionalMap();
        }

        window.showToast("Bloco de parágrafos otimizado!", 'success');

    } catch (error) {
        window.showToast(`Falha ao otimizar o bloco: ${error.message}`, 'error');
    } finally {
        button.innerHTML = originalButtonHTML;
        button.disabled = false;
        const tooltip = button.closest('.retention-tooltip');
        if (tooltip) tooltip.remove();
    }
};

window.deleteParagraphGroup = async (button, suggestionText) => {
    const userConfirmed = await showConfirmationDialog('Confirmar Deleção', 'Tem certeza que deseja deletar este bloco de parágrafos? Esta ação não pode ser desfeita.');
    if (!userConfirmed) return;

    const safeSelector = suggestionText.replace(/"/g, '\\"');
    const paragraphsToDelete = document.querySelectorAll(`[data-suggestion-group="${safeSelector}"]`);

    if (paragraphsToDelete.length === 0) {
        window.showToast("Erro: Parágrafos para deletar não encontrados.", 'error');
        return;
    }

    const sectionElement = paragraphsToDelete[0].closest('.accordion-item');

    paragraphsToDelete.forEach(p => {
        p.style.transition = 'opacity 0.3s ease-out';
        p.style.opacity = '0';
    });
    
    setTimeout(() => {
        paragraphsToDelete.forEach(p => p.remove());

        if (sectionElement) {
            invalidateAndClearPerformance(sectionElement);
            invalidateAndClearPrompts(sectionElement);
            updateAllReadingTimes();
        }
        
        window.showToast("Bloco de parágrafos deletado com sucesso!", 'success');
    }, 300);
};
















// ==========================================================
// ==================== SALVAR / CARREGAR (v5.0) =====================
// ==========================================================



const importProject = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const loadedState = JSON.parse(e.target.result);
            Object.assign(AppState, loadedState);
            AppState.ui.completedSteps = new Set(Array.from(AppState.ui.completedSteps || []));
            syncUiFromState();
            showPane(AppState.ui.currentPane || 'investigate');
            updateProgressBar();
            window.showToast("Projeto importado com sucesso!", 'success');
        } catch (err) {
            window.showToast("Erro: Arquivo de projeto inválido ou corrompido.", 'error');
            console.error("Erro ao importar projeto:", err);
        }
    };
    reader.readAsText(file);
    event.target.value = '';
};

const exportProject = () => {
    const projectData = getProjectStateForExport();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projectData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    const fileName = (document.getElementById('videoTheme').value.trim() || 'roteiro_viral').replace(/[^a-zA-Z0-9]/gi, '_').toLowerCase();
    downloadAnchorNode.setAttribute("download", `${fileName}_projeto.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    window.showToast("Projeto exportado com sucesso!", 'success');
};




// ==========================================================
// ==================== SALVAR / CARREGAR (v5.0) =====================
// ==========================================================
const LOCAL_STORAGE_KEY = 'viralScriptGeneratorProject_v6';

const getProjectStateForExport = () => {
    const stateToExport = JSON.parse(JSON.stringify(AppState));
    
    // Zera o objeto de inputs para garantir que estamos salvando o estado atual do DOM
    stateToExport.inputs = {};

    // Salva todos os inputs, selects e textareas que possuem um ID
    const formElements = document.querySelectorAll('#appRoot input[id], #appRoot select[id], #appRoot textarea[id]');
    formElements.forEach(el => {
        if (el.type !== 'file' && el.type !== 'radio') {
            stateToExport.inputs[el.id] = el.value;
        }
    });
    
    // Salva o estado do radio button de 'conclusionType'
    const checkedConclusionType = document.querySelector('input[name="conclusionType"]:checked');
    if (checkedConclusionType) {
        stateToExport.inputs['conclusionType'] = checkedConclusionType.value;
    }

    // Salva o HTML gerado para os painéis de resultado e análise
    stateToExport.generated.emotionalMapHTML = document.getElementById('emotionalMapContent')?.innerHTML;
    stateToExport.generated.soundtrackHTML = document.getElementById('soundtrackContent')?.innerHTML;
    stateToExport.generated.titlesAndThumbnailsHTML = document.getElementById('titlesThumbnailsContent')?.innerHTML;
    stateToExport.generated.descriptionHTML = document.getElementById('videoDescriptionContent')?.innerHTML;
    stateToExport.generated.analysisReportHTML = document.getElementById('analysisReportContainer')?.innerHTML;
    stateToExport.generated.hooksReportHTML = document.getElementById('hooksReportContainer')?.innerHTML;
    stateToExport.generated.viralSuggestionsHTML = document.getElementById('viralSuggestionsContainer')?.innerHTML;

    return stateToExport;
};

const saveStateToLocalStorage = () => {
    try {
        const stateToSave = getProjectStateForExport();
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
        console.error("Erro ao salvar projeto no localStorage:", error);
    }
};

const loadStateFromLocalStorage = () => {
    try {
        const savedStateString = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedStateString) {
            const loadedState = JSON.parse(savedStateString);
            Object.assign(AppState, loadedState);
            // Recria o Set de completedSteps que não é salvo corretamente em JSON
            AppState.ui.completedSteps = new Set(Array.from(AppState.ui.completedSteps));
            syncUiFromState();
            window.showToast("Seu projeto anterior foi carregado!", 'success');
        }
    } catch (error) {
        console.error("Erro ao carregar projeto do localStorage:", error);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
};





const syncUiFromState = () => {
    const state = AppState;

    // 1. Restaura os valores dos inputs
    for (const id in state.inputs) {
        const element = document.getElementById(id);
        if (element) {
            if (element.type === 'radio' && element.name === id) {
                 if(element.value === state.inputs[id]) element.checked = true;
            } else {
                element.value = state.inputs[id];
            }
        } else {
            const radioGroup = document.querySelectorAll(`input[name="${id}"]`);
            if(radioGroup.length > 0){
                radioGroup.forEach(radio => { if(radio.value === state.inputs[id]) radio.checked = true; });
            }
        }
    }

    // 2. Dispara eventos para atualizar UI dependente
    updateNarrativeStructureOptions();
    toggleCustomImageStyleVisibility();

    // 3. Restaura os outputs dos painéis de resultado (O CÓDIGO QUE FALTAVA)
    if (state.generated.emotionalMapHTML) document.getElementById('emotionalMapContent').innerHTML = state.generated.emotionalMapHTML;
    if (state.generated.soundtrackHTML) document.getElementById('soundtrackContent').innerHTML = state.generated.soundtrackHTML;
    if (state.generated.titlesAndThumbnailsHTML) document.getElementById('titlesThumbnailsContent').innerHTML = state.generated.titlesAndThumbnailsHTML;
    if (state.generated.descriptionHTML) document.getElementById('videoDescriptionContent').innerHTML = state.generated.descriptionHTML;
    if (state.generated.analysisReportHTML) document.getElementById('analysisReportContainer').innerHTML = state.generated.analysisReportHTML;
    if (state.generated.hooksReportHTML) document.getElementById('hooksReportContainer').innerHTML = state.generated.hooksReportHTML;
    if (state.generated.viralSuggestionsHTML) document.getElementById('viralSuggestionsContainer').innerHTML = state.generated.viralSuggestionsHTML;


    // 4. Restaura painel de Investigação (Já estava correto)
    if (state.generated.investigationReport) {
        const outputContainer = document.getElementById('factCheckOutput');
        const converter = new showdown.Converter({ simplifiedAutoLink: true, tables: true });
        const htmlReport = converter.makeHtml(state.generated.investigationReport);
        outputContainer.dataset.rawReport = state.generated.investigationReport;
        if (state.inputs && state.inputs.factCheckQuery) {
            outputContainer.dataset.originalQuery = state.inputs.factCheckQuery;
        }
        outputContainer.innerHTML = `<div class="prose dark:prose-invert max-w-none p-4 card rounded-lg mt-4 border-l-4" style="border-color: var(--success);">${htmlReport}</div>`;
        document.getElementById('ideaGenerationSection').classList.remove('hidden');
    }

    // 5. Lógica de Reconstrução do Esboço e Roteiro (Já corrigida)
    if (state.generated.strategicOutline) {
        const outlineContentDiv = document.getElementById('outlineContent');
        const titleTranslations = { 'introduction': 'Introdução', 'development': 'Desenvolvimento', 'climax': 'Clímax', 'conclusion': 'Conclusão', 'cta': 'CTA' };
        let outlineHtml = '<ul class="space-y-4 text-sm" style="list-style-position: inside; padding-left: 1rem;">';
        for (const key in state.generated.strategicOutline) {
            if (state.generated.strategicOutline[key]) {
                outlineHtml += `<li><div><strong style="color: var(--primary);">${titleTranslations[key] || key}:</strong> <span style="color: var(--text-body);">${DOMPurify.sanitize(state.generated.strategicOutline[key])}</span></div></li>`;
            }
        }
        outlineHtml += '</ul>';
        outlineContentDiv.innerHTML = outlineHtml;
    }
    
    const scriptContainer = document.getElementById('scriptSectionsContainer');
    scriptContainer.innerHTML = '';
    const sectionDetailsMap = {
        intro: { title: 'Introdução', action: 'generateIntro' },
        development: { title: 'Desenvolvimento', action: 'generateDevelopment' },
        climax: { title: 'Clímax', action: 'generateClimax' },
        conclusion: { title: 'Conclusão' },
        cta: { title: 'Call to Action (CTA)' }
    };
    const sectionOrder = ['intro', 'development', 'climax', 'conclusion', 'cta'];
    const outlineExists = !!state.generated.strategicOutline;
    
    sectionOrder.forEach(id => {
        const sectionData = state.generated.script[id];
        const details = sectionDetailsMap[id];
        if (sectionData && sectionData.html) {
            const sectionElement = generateSectionHtmlContent(id, details.title, sectionData.html);
            scriptContainer.appendChild(sectionElement);
        } else if (outlineExists && details && details.action) {
            scriptContainer.insertAdjacentHTML('beforeend', createScriptSectionPlaceholder(id, details.title, details.action));
        }
    });
    
    // 6. Garante que os estados finais da UI sejam aplicados
    updateButtonStates();
    updateAllReadingTimes();
};




// ==========================================================
// ===== EVENTOS E INICIALIZAÇÃO (VERSÃO FINAL) =================
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {

    const editingMenu = document.getElementById('editing-menu');

    // ==========================================================
    // ===== MENU DE EDIÇÃO CONTEXTUAL (V5.0) =================
    // ==========================================================
    const handleEditingAction = async (action) => {
        if (!userSelectionRange) return;
        const selectedText = userSelectionRange.toString().trim();
        if (!selectedText) {
            editingMenu.classList.remove('visible');
            return;
        }
        editingMenu.classList.remove('visible');
        const instructions = {
            expand: "Sua tarefa é expandir este parágrafo, adicionando mais detalhes, descrições vívidas e contexto, mantendo o tom original.",
            summarize: "Sua tarefa é resumir este parágrafo, tornando-o mais conciso e direto, preservando a informação essencial.",
            correct: "Sua tarefa é revisar e corrigir quaisquer erros de ortografia, gramática e pontuação no texto a seguir. Se não houver erros, retorne o texto original."
        };
        const prompt = `Você é um editor de roteiros de elite. ${instructions[action]}
        **REGRAS:**
        1.  O idioma da resposta DEVE ser o mesmo do texto original.
        2.  Responda APENAS com o texto reescrito. Sem comentários.
        **TEXTO ORIGINAL:**
        ---
        ${selectedText}
        ---`;
        const startNode = userSelectionRange.startContainer.parentElement;
        const sectionElement = startNode.closest('.accordion-item');
        try {
            const rawResult = await callGroqAPI(prompt, 3000);
            const refinedText = removeMetaComments(rawResult);
            if (userSelectionRange) {
                window.getSelection().removeAllRanges();
                userSelectionRange.deleteContents();
                const newNode = document.createElement('span');
                newNode.className = 'highlight-change';
                newNode.textContent = refinedText;
                userSelectionRange.insertNode(newNode);
            }
            if (sectionElement) {
                const sectionId = sectionElement.id.replace('Section', '');
                const contentWrapper = sectionElement.querySelector('.generated-content-wrapper');
                if (contentWrapper && AppState.generated.script[sectionId]) {
                    AppState.generated.script[sectionId].text = contentWrapper.textContent;
                    AppState.generated.script[sectionId].html = contentWrapper.innerHTML;
                }
                invalidateAndClearPerformance(sectionElement);
                invalidateAndClearPrompts(sectionElement);
                invalidateAndClearEmotionalMap();
                updateAllReadingTimes();
            }
            window.showToast(`Texto refinado com sucesso!`, 'success');
        } catch (err) {
            console.error(`Erro ao tentar '${action}':`, err);
            window.showToast(`Falha ao refinar o texto: ${err.message}`, 'error');
        } finally {
            userSelectionRange = null;
        }
    };

    document.addEventListener('selectionchange', () => {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();
        if (selectedText.length > 10 && selection.anchorNode && selection.anchorNode.parentElement.closest('.generated-content-wrapper')) {
            userSelectionRange = selection.getRangeAt(0).cloneRange();
            const rect = userSelectionRange.getBoundingClientRect();
            editingMenu.style.left = `${rect.left + window.scrollX}px`;
            editingMenu.style.top = `${rect.bottom + window.scrollY + 5}px`;
            editingMenu.classList.add('visible');
        } else {
            if (!editingMenu.contains(document.activeElement)) {
                 editingMenu.classList.remove('visible');
            }
        }
    });

    editingMenu.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-action]');
        if (button) {
            handleEditingAction(button.dataset.action);
        }
    });


    // ==========================================================
    // ===== GERENTE DE CLIQUES (OBJETO 'actions') =================
    // ==========================================================
    const actions = {
        'investigate': (btn) => handleInvestigate(btn),
        'generateIdeasFromReport': (btn) => generateIdeasFromReport(btn),
        'select-idea': (btn) => { const ideaString = btn.dataset.idea; if(ideaString) selectIdea(JSON.parse(ideaString.replace(/&quot;/g, '"'))); },
        'suggestStrategy': (btn) => suggestStrategy(btn), 'applyStrategy': (btn) => applyStrategy(btn),
        'generateOutline': (btn) => generateStrategicOutline(btn),
        'generateIntro': (btn) => handleGenerateSection(btn, 'intro', 'Introdução', 'intro'),
        'generateDevelopment': (btn) => handleGenerateSection(btn, 'development', 'Desenvolvimento', 'development'),
        'generateClimax': (btn) => handleGenerateSection(btn, 'climax', 'Clímax', 'climax'),
        'generateConclusion': (btn) => generateConclusion(btn), 'generateCta': (btn) => generateStrategicCta(btn),
        'suggestFinalStrategy': (btn) => suggestFinalStrategy(btn), 'goToFinalize': (btn) => goToFinalize(btn),
        'analyzeScript': (btn) => analyzeFullScript(btn), 'analyzeHooks': (btn) => analyzeRetentionHooks(btn),
        'suggestViralElements': (btn) => suggestViralElements(btn),
        'generateTitlesAndThumbnails': (btn) => generateTitlesAndThumbnails(btn), 'generateDescription': (btn) => generateVideoDescription(btn),
        'generateSoundtrack': (btn) => generateSoundtrack(btn), 'mapEmotions': (btn) => mapEmotionsAndPacing(btn),
        'exportProject': () => exportProject(), 'exportPdf': () => downloadPdf(),
        'exportTranscript': () => handleCopyAndDownloadTranscript(),
        'resetProject': async () => { 
            const confirmed = await showConfirmationDialog("Começar um Novo Projeto?","Isso limpará todos os campos e o trabalho realizado. Esta ação não pode ser desfeita. Deseja continuar?");
            if (confirmed) resetApplicationState();
        },
        'regenerate': (btn) => window.regenerateSection(btn.dataset.sectionId),
        'copy': (btn) => { const content = btn.closest('.accordion-item')?.querySelector('.generated-content-wrapper'); if (content) { window.copyTextToClipboard(content.textContent); window.showCopyFeedback(btn); } },
        'analyzeRetention': (btn) => window.analyzeSectionRetention(btn),
        'refineStyle': (btn) => window.refineSectionStyle(btn), 'enrichWithData': (btn) => window.enrichWithData(btn),
        'suggestPerformance': (btn) => window.suggestPerformance(btn), 'addDevelopmentChapter': (btn) => window.addDevelopmentChapter(btn),
        'generate-prompts': (btn) => window.generatePromptsForSection(btn),
        'optimizeGroup': (btn) => { const text = btn.dataset.suggestionText; if (text) window.optimizeGroup(btn, text); },
        'deleteParagraphGroup': (btn) => { const text = btn.dataset.suggestionText; if (text) window.deleteParagraphGroup(btn, text); },
        'applySuggestion': (btn) => applySuggestion(btn), 'applyAllSuggestions': (btn) => applyAllSuggestions(btn),
        'applyHookSuggestion': (btn) => applyHookSuggestion(btn), 'insertViralSuggestion': (btn) => insertViralSuggestion(btn)
    };


// ==========================================================
// ===== LISTENER DE EVENTOS PRINCIPAL (VERSÃO FINAL) =====
// ==========================================================
document.body.addEventListener('click', (event) => {
    // 1. Lógica do Wizard (Sidebar)
    const step = event.target.closest('.step[data-step]');
    if (step) {
        showPane(step.dataset.step);
        return;
    }

const button = event.target.closest('button[data-action]');
if (button && actions[button.dataset.action]) {
    
    // NOVO CÓDIGO ENTRA AQUI
    const action = actions[button.dataset.action];
    const result = action(button); // Executa a ação

    // Se a ação for assíncrona (chama a IA), espera ela terminar para salvar.
    if (result instanceof Promise) {
        result.then(saveStateToLocalStorage).catch(error => {
            console.error("Ação assíncrona falhou, salvamento automático cancelado.", error);
        });
    } else {
        // Se for uma ação normal (síncrona), salva imediatamente.
        saveStateToLocalStorage();
    }
    // FIM DO NOVO CÓDIGO

    return; // Este return é importante, mantenha ele.
}
    
    // 3. Lógica do Acordeão
    const accordionHeader = event.target.closest('.accordion-header');
    if (accordionHeader && !event.target.closest('.header-buttons button')) {
        const body = accordionHeader.nextElementSibling;
        const arrow = accordionHeader.querySelector('.accordion-arrow');
        if (body && arrow) {
            const isOpen = body.style.display === 'block';
            body.style.display = isOpen ? 'none' : 'block';
            arrow.classList.toggle('open', !isOpen);
        }
    }
    
    // 4. Lógica de Todas as Abas (Gênero e Inputs) com Limpeza de Memória
    const tabButton = event.target.closest('.tab-button');
    if (tabButton) {
        const nav = tabButton.parentElement;

        // Se for uma aba de GÊNERO, aplica a lógica de limpeza
        if (nav.id === 'genreTabs') {
            // Não faz nada se o usuário clicar na aba que já está ativa
            if (tabButton.classList.contains('tab-active')) {
                return;
            }
            // Limpa o container das ideias ao trocar de especialista
            document.getElementById('ideasOutput').innerHTML = '';
            window.showToast("Especialista alterado! Clique novamente para gerar novas ideias.", 'info');
        }

        // Lógica geral para ATIVAR a aba clicada (tanto para gênero quanto para inputs)
        if (nav.id === 'genreTabs' || nav.id === 'inputTabsNav') {
            nav.querySelectorAll('.tab-button').forEach(b => b.classList.remove('tab-active'));
            tabButton.classList.add('tab-active');
        }

        // Lógica específica para trocar o painel de conteúdo das abas de INPUT
        if (nav.id === 'inputTabsNav') {
            const tabId = tabButton.dataset.tab;
            document.querySelectorAll('#inputTabContent .tab-pane').forEach(p => p.classList.add('hidden'));
            document.getElementById(tabId)?.classList.remove('hidden');
        }
    }
});


    // ==========================================================
    // ===== INICIALIZAÇÃO E LISTENERS SECUNDÁRIOS =================
    // ==========================================================
    const setDarkMode = (isDark) => {
        const moonIcon = document.getElementById('moonIcon'); const sunIcon = document.getElementById('sunIcon');
        if (isDark) {
            document.documentElement.classList.add('dark');
            if (moonIcon) moonIcon.classList.add('hidden'); if (sunIcon) sunIcon.classList.remove('hidden');
        } else {
            document.documentElement.classList.remove('dark');
            if (moonIcon) moonIcon.classList.remove('hidden'); if (sunIcon) sunIcon.classList.add('hidden');
        }
    };
    const toggle = document.getElementById('darkModeToggle');
    toggle?.addEventListener('click', () => {
        const isDark = !document.documentElement.classList.contains('dark');
        setDarkMode(isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
    
    // >>>>> EVOLUÇÃO DO SALVAMENTO AUTOMÁTICO <<<<<
    document.querySelectorAll('.input, textarea.input, select.input, input[type="radio"]').forEach(el => {
        el.addEventListener('change', saveStateToLocalStorage);
    });

    const scriptContainer = document.getElementById('scriptSectionsContainer');
    if (scriptContainer) {
        scriptContainer.addEventListener('input', (event) => {
            const wrapper = event.target.closest('.generated-content-wrapper');
            if (wrapper) {
                const sectionElement = wrapper.closest('.accordion-item');
                if (sectionElement) {
                    const sectionId = sectionElement.id.replace('Section', '');
                    if (AppState.generated.script[sectionId]) {
                        AppState.generated.script[sectionId].html = wrapper.innerHTML;
                        AppState.generated.script[sectionId].text = wrapper.textContent;
                        saveStateToLocalStorage();
                        invalidateAndClearPerformance(sectionElement);
                        invalidateAndClearPrompts(sectionElement);
                        invalidateAndClearEmotionalMap();
                        updateAllReadingTimes();
                    }
                }
            }
        });
    }
    // >>>>> FIM DA EVOLUÇÃO <<<<<

    document.getElementById('importFileInput')?.addEventListener('change', importProject);
    document.getElementById('narrativeGoal')?.addEventListener('change', updateNarrativeStructureOptions);
    document.getElementById('narrativeStructure')?.addEventListener('change', updateMainTooltip);
    document.getElementById('imageStyleSelect')?.addEventListener('change', toggleCustomImageStyleVisibility);

    // ==========================================================
    // ===== INICIALIZAÇÃO FINAL (ORDEM CORRIGIDA) =================
    // ==========================================================
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const storedTheme = localStorage.getItem('theme');
    setDarkMode(storedTheme === 'dark' || (!storedTheme && prefersDark));

    setupInputTabs();

    // 1. CARREGA TUDO da memória e RECONSTRÓI a UI silenciosamente
    loadStateFromLocalStorage();

    // 2. MARCA os steps concluídos com base no estado já carregado
    AppState.ui.completedSteps.forEach(stepId => markStepCompleted(stepId, false));
    updateProgressBar();
    
    // 3. SÓ AGORA, mostra o painel correto, que já foi preenchido
    showPane(AppState.ui.currentPane || 'investigate');
});