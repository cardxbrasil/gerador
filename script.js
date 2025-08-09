

// ==========================================================
// ==================== ESTADO CENTRALIZADO =================
// ==========================================================
const AppState = {
    inputs: {},
    generated: {
        investigationReport: null,
        ideas: [],
        strategicOutline: null,
        script: {
            intro: { html: null, text: null },
            development: { html: null, text: null },
            climax: { html: null, text: null },
            conclusion: { html: null, text: null },
            cta: { html: null, text: null }
        },
        titlesAndThumbnails: null,
        description: null,
        soundtrack: null,
        emotionalMap: null,
        imagePrompts: {}
    },
    ui: {
        isSettingStrategy: false,
        promptPaginationState: {}
    }
};


let elements = {};
let buttons = {};
let totalScriptSeconds = 0;
let userSelectionRange = null; 

window.criterionMap = {
    'Introdução (Hook)': 'introSection',
    'Desenvolvimento (Ritmo e Retenção)': 'developmentSection',
    'Clímax': 'climaxSection',
    'Conclusão': 'conclusionSection',
    'CTA (Call to Action)': 'ctaSection'
};




// ==========================================================
// =================== GERENCIADOR DE PROMPTS =================
// ==========================================================
const PromptManager = {

    /**
     * Retorna o prompt para gerar ideias, selecionando o especialista correto.
     * @param {string} genre - O gênero selecionado (ex: 'documentario').
     * @param {object} context - Contém { originalQuery, rawReport, languageName }.
     * @returns {string} O prompt completo para a IA.
     */
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
          
            'enigmas': `Você são TRÊS ESPECIALISTAS TRABALHANDHO EM SINERGIA:
1. Um Teólogo Investigativo com doutorado em Hermenêutica Bíblica e especialização em contextos históricos do Antigo e Novo Testamento
2. Um Arqueólogo especializado em descobertas que corroboram narrativas bíblicas
3. Um Comunicador Mestre que transforma conceitos complexos em narrativas virais

**MISSÃO COLETIVA:** Gerar 6 ideias de vídeos extraordinários que criem pontes revolucionárias entre descobertas recentes, textos bíblicos e questões teológicas contemporâneas, produzindo conteúdo que seja ao mesmo tempo academicamente respeitável e viralmente compartilhável.

**IDENTIDADE E ESPECIALIZAÇÃO:** Vocês formam o "COLETIVO HERMENÊUTICO", um grupo renomado por desvendar camadas profundas das Escrituras através de lentes multidisciplinares, sempre mantendo a integridade do texto bíblico enquanto exploram interpretações inovadoras.

**MATERIAL DE INTELIGÊNCIA (A BASE PARA A INVESTIGAÇÃO):**
- **PERGUNTA ORIGINAL DA INVESTIGAÇÃO:** "__ORIGINAL_QUERY__"
- **RELATÓRIO DA PESQUISA FACTUAL (CONTEXTO HISTÓRICO/CIENTÍFICO/ARQUEOLÓGICO):**
---
__RAW_REPORT__
---
- **CONTEXTUALIZAÇÃO TEOLÓGICA:** Considerem as seguintes dimensões teológicas que podem dialogar com o relatório: 
  * Cristologia: Como a descoberta dialoga com o entendimento de Cristo, sua mensagem e ministério?
  * Escatologia: A descoberta lança nova luz sobre profecias ou expectativas escatológicas?
  * Hermenêutica: Como isso afeta nossa interpretação de passagens-chave?
  * Eclesiologia: Quais implicações para a compreensão da Igreja e sua missão?
  * Soteriologia: A descoberta traz novos insights sobre a natureza da salvação?

**TAREFA CRÍTICA:** Sua missão é gerar 6 ideias de vídeos que transcendam conexões superficiais, criando pontes teológicas profundas entre os DADOS do relatório e as Escrituras. Cada ideia deve representar uma perspectiva teológica distinta e complementar.

**REGRAS CRÍTICAS DE SINTAXE E ESTRUTURA JSON (INEGOCIÁVEIS):**
1. **JSON PURO E PERFEITO:** Sua resposta deve ser APENAS um array JSON válido.
2. **ESTRUTURA AMPLIADA:** Cada objeto no array deve conter EXATAMENTE estas 8 chaves: "title", "angle", "targetAudience", "viralityScore", "theologicalDepth", "scripturalFoundation", "videoDescription", e "discussionQuestions".
3. **SINTAXE DAS STRINGS:** Todas as chaves e todos os valores do tipo string DEVEM usar aspas duplas (""). Se precisar usar aspas duplas dentro de uma string, elas DEVEM ser escapadas com uma barra invertida (por exemplo, \\"uma citação\\").
4. **IDIOMA OBRIGATÓRIO:** Todos os valores de texto DEVEM estar no idioma __LANGUAGE_NAME__.

**MANUAL DE CRIAÇÃO DETALHADO (SIGA EXATAMENTE PARA CADA IDEIA):**

- **"title" (Título Cativante e Teológico):** Deve prometer uma revelação transformadora que conecte a descoberta com uma verdade bíblica profunda. Use linguagem que desperte curiosidade intelectual e espiritual simultaneamente.

- **"angle" (O Enigma Central):** Uma frase complexa que apresente uma conexão inovadora entre um FATO do relatório, uma PASSAGEM BÍBLICA e uma IMPLICAÇÃO TEOLÓGICA. Ex: "Como a descoberta de [DADO DO RELATÓRIO] em [LOCAL] desafia nossa compreensão tradicional de [PASSAGEM BÍBLICA] e sugere uma nova perspectiva sobre [CONCEITO TEOLÓGICO]?"

- **"targetAudience" (Público-Alvo Específico):** Descreva com precisão o nicho de espectador. Ex: "Pastores e líderes cristãos buscando conteúdo teologicamente sólido", "Estudantes de teologia interessados em diálogo fé-ciência", "Cristãos leigos com interesse em arqueologia bíblica".

- **"viralityScore" (Nota de Revelação):** Uma nota de 1 a 10 para o potencial da ideia de gerar DEBATE TEOLÓGICO e compartilhamento, considerando tanto o aspecto acadêmico quanto o emocional.

- **"theologicalDepth" (Profundidade Teológica):** Uma nota de 1 a 10 que avalia a profundidade e originalidade das conexões teológicas estabelecidas.

- **"scripturalFoundation" (Fundamentação Bíblica):** Liste 3-5 referências bíblicas-chave que sustentam a exploração teológica proposta, incluindo pelo menos uma do Antigo Testamento e uma do Novo Testamento.

- **"videoDescription" (DESCRIÇÃO INVESTIGATIVA RICA):** Escreva uma sinopse de **pelo menos 7 frases** que construa uma narrativa intelectualmente estimulante. A descrição deve:
    1. Apresentar o mistério central, citando a passagem bíblica principal.
    2. Contextualizar a descoberta arqueológica/científica relevante.
    3. Explorar as implicações teológicas preliminares dessa conexão.
    4. Apresentar uma perspectiva teológica inovadora que desafia entendimentos convencionais.
    5. Discutir como essa nova compreensão afeta a aplicação prática da fé.
    6. Sugerir possíveis objeções e como seriam abordadas.
    7. Terminar com uma pergunta provocativa que incentive tanto a reflexão teológica quanto a discussão prática.

- **"discussionQuestions" (Questões para Diálogo):** Formule 3 perguntas profundas que estimulem o engajamento do espectador, incluindo:
    * Uma questão teológica acadêmica
    * Uma questão de aplicação prática
    * Uma questão que convida à reflexão espiritual pessoal

**FRAMEWORK CRIATIVO ADICIONAL:**
Para cada ideia, considerem estas quatro dimensões:
1. **DIMENSÃO HISTÓRICA:** Como a descoberta lança nova luz sobre o contexto histórico original?
2. **DIMENSÃO EXEGÉTICA:** Como isso afeta nossa compreensão do texto em seu contexto original?
3. **DIMENSÃO TEOLÓGICA:** Quais implicações doutrinárias surgem desta conexão?
4. **DIMENSÃO CONTEMPORÂNEA:** Como isso se aplica à experiência de fé hoje?

**AÇÃO FINAL:** Como Coletivo Hermenêutico, desvende conexões teológicas ousadas e gere as 6 ideias. Busquem o equilíbrio entre rigor acadêmico e acessibilidade popular. Responda APENAS com o array JSON perfeito.`,

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

    getOutlinePrompt: (context) => {
        return `${context.basePrompt}
Você é uma API de geração de JSON que segue regras com precisão cirúrgica. Sua única tarefa é criar um esboço estratégico para um vídeo.
**REGRAS INEGOCIÁVEIS:**
1.  **JSON PURO:** Responda APENAS com um objeto JSON válido.
2.  **ESTRUTURA EXATA:** O objeto DEVE conter EXATAMENTE estas cinco chaves: "introduction", "development", "climax", "conclusion", e "cta".
3.  **VALORES:** O valor para CADA chave DEVE ser uma única string de texto (1-2 frases).
**TAREFA:** Gere o objeto JSON perfeito.`;
    },

    getScriptSectionPrompt: (context) => {
        let prompt = `${context.basePrompt}
Você é um ARQUITETO DE ROTEIROS DE ALTA PERFORMANCE. Sua missão é escrever o texto para a seção **"${context.sectionTitle}"** do roteiro.
${context.durationInstruction}`;

        if (context.contextText) {
            prompt += `\n\n**CONTEXTO DO ROTEIRO EXISTENTE (PARA GARANTIR CONTINUIDADE):**\n---\n${context.contextText}\n---`;
        }
        if (context.outlineDirective) {
            prompt += `\n\n**DIRETRIZ ESTRATÉGICA OBRIGATÓRIA:** Siga este plano: "${context.outlineDirective}"`;
        }
        prompt += `
\n**REGRAS CRÍTICAS DE FORMATAÇÃO (INEGOCIÁVEIS):**
1.  **RESPOSTA EM JSON:** Sua resposta DEVE ser um array JSON válido, onde cada item do array é uma string representando um parágrafo do roteiro.
2.  **ESTRUTURA OBRIGATÓRIA DOS PARÁGRAFOS:** CADA parágrafo (cada string no array) DEVE OBRIGATORIAMENTE conter **NO MÍNIMO 4 FRASES** e agrupar uma ideia coesa. Parágrafos com 1 ou 2 frases são inaceitáveis e serão considerados uma falha na execução da tarefa.
3.  **CONTEÚDO PURO:** As strings devem conter APENAS o texto a ser narrado. É PROIBIDO incluir anotações como 'Narrador:', '(Cena: ...)', etc.
4.  **SINTAXE:** Use aspas duplas ("") para todas as strings.

**AÇÃO FINAL:** Escreva agora a seção "${context.sectionTitle}", seguindo TODAS as diretrizes. Responda APENAS com o array JSON.`;
        return prompt;
    },

    getTitlesAndThumbnailsPrompt: (context) => {
        return `${context.basePrompt}\n\n**TAREFA:** Gerar 5 sugestões de títulos e thumbnails.\n**REGRAS:**\n1. **FORMATO:** Responda APENAS com um array JSON.\n2. **ESTRUTURA:** Cada objeto no array deve ter 3 chaves: "suggested_title", "thumbnail_title", e "thumbnail_description".\n3. **SINTAXE:** Use aspas duplas ("") para todas as chaves e valores.`;
    },

    getVideoDescriptionPrompt: (context) => {
        return `${context.basePrompt}\n\n**TAREFA:** Gerar uma descrição otimizada e hashtags no idioma ${context.languageName}.\n**REGRAS:** Comece com um gancho, detalhe o conteúdo, finalize com CTA e liste 10 hashtags.\n**AÇÃO:** Responda APENAS com a descrição e hashtags.`;
    }
};




// ===================================================================
// =================== FIM DE GERENCIADOR DE PROMPTS =================
// ===================================================================



    
        // Bloco de estilo cinematográfico para prompts de imagem
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


        // Labels para descrição de imagem em diferentes idiomas
        const imageDescriptionLabels = { 'pt-br': 'Descrição da Imagem:', 'pt-pt': 'Descrição da Imagem:', 'en': 'Image Description:' };

// ==========================================================
        // NOVO: MAPA DE CONTAGEM DE PALAVRAS PARA CONTROLAR DURAÇÃO
        // ==========================================================
        const wordCountMap = {
            // ~2.5 min @ 150 WPM = ~375 palavras
            'short': {
                intro: 60,
                development: 190,
                climax: 75,
                conclusion: 50
            },
            // ~5.5 min @ 150 WPM = ~825 palavras
            'medium': {
                intro: 120,
                development: 420,
                climax: 165,
                conclusion: 120
            },
            // ~10 min @ 150 WPM = ~1500 palavras
            'long': {
                intro: 225,
                development: 750,
                climax: 300,
                conclusion: 225
            },
            // ~16 min @ 150 WPM = ~2400 palavras
            'extra-long': {
                intro: 360,
                development: 1200,
                climax: 480,
                conclusion: 360
            },
            // ~30 min @ 150 WPM = ~4500 palavras
            'documentary': {
                intro: 450,
                development: 2700,
                climax: 900,
                conclusion: 450
            }
        };


        // ==========================================================
        // ================== FUNÇÕES DE UTILIDADE ==================
        // ==========================================================
        /**
  * Exibe uma notificação toast na parte inferior da tela com cores contextuais.
 * @param {string} message - A mensagem a ser exibida.
 * @param {'info'|'success'|'error'} [type='info'] - O tipo de notificação.
 */
window.showToast = (message, type = 'info') => {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    if (!toast || !toastMessage) return;

    // Aplica a nova cor da borda com base no tipo, usando suas variáveis CSS
    switch (type) {
        case 'success':
            toast.style.borderLeftColor = 'var(--success)';
            break;
        case 'error':
            toast.style.borderLeftColor = 'var(--danger)';
            break;
        default: // 'info' ou qualquer outro
            toast.style.borderLeftColor = 'var(--primary)';
    }

    toastMessage.textContent = message;
    toast.classList.add('show');
    // Aumentamos o tempo para 5 segundos para dar tempo de ler
    setTimeout(() => { toast.classList.remove('show'); }, 5000);
};



const toggleCustomImageStyleVisibility = () => {
    const container = document.getElementById('customImageStyleContainer');
    const select = document.getElementById('imageStyleSelect');
    // Adiciona uma verificação para garantir que os elementos existem
    if (container && select) {
        container.style.display = select.value === 'custom' ? 'block' : 'none';
    }
};


// =========================================================================
// >>>>> EVOLUÇÃO 1: MEMÓRIA AUTOMÁTICA (LocalStorage) <<<<<
// =========================================================================

/**
 * Salva o estado atual completo da aplicação no localStorage do navegador.
 */
const saveStateToLocalStorage = () => {
    try {
        const stateToSave = getProjectStateForExport();
        const stateString = JSON.stringify(stateToSave);

        if (stateString.length > 4 * 1024 * 1024) { // 4MB limit
            console.warn("Projeto muito grande para salvamento automático.");
            return;
        }

        localStorage.setItem('viralScriptGeneratorProject', stateString);
        console.log("Projeto salvo automaticamente no navegador.");

    } catch (error) {
        console.error("Erro ao salvar o projeto no localStorage:", error);
        window.showToast("Não foi possível salvar o projeto automaticamente.", 'error');
    }
};

// >>>>> ADICIONE ESTA FUNÇÃO QUE FALTOU AQUI <<<<<
/**
 * Verifica se existe um projeto salvo no localStorage e o carrega.
 */
const loadStateFromLocalStorage = () => {
    try {
        const savedStateString = localStorage.getItem('viralScriptGeneratorProject');
        if (savedStateString) {
            console.log("Projeto anterior encontrado. Carregando...");
            const loadedState = JSON.parse(savedStateString);
            
            Object.assign(AppState, loadedState);
            syncUiFromState();
            
            window.showToast("Seu projeto anterior foi carregado!", 'success');
        }
    } catch (error) {
        console.error("Erro ao carregar o projeto do localStorage:", error);
        localStorage.removeItem('viralScriptGeneratorProject');
    }
};
// >>>>> FIM DA ADIÇÃO <<<<<


// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// GERENTE GERAL
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

/**
 * Função "Mestre" que comanda a geração de ideias, agora como um painel de controle.
 * Ela pode receber dados de uma investigação ou funcionar de forma independente.
 * @param {string} genre - O gênero selecionado (ex: 'documentario', 'scifi').
 * @param {HTMLElement} button - O botão que iniciou a ação.
 * @param {object | null} [investigationData=null] - Dados opcionais da investigação.
 * @param {string} [investigationData.rawReport] - O relatório da pesquisa.
 * @param {string} [investigationData.originalQuery] - A pergunta original da pesquisa.
 */
const generateIdeasWithExpert = async (genre, button, investigationData = null) => {
    // Esta função agora atua como o painel de controle central que direciona para a função especialista correta.
    // Ela passa os dados da investigação (se existirem) para que cada especialista possa usá-los.
    switch (genre) {
        case 'documentario':
            await generateIdeasDocumentary(button, investigationData);
            break;
        case 'inspiracional':
             await generateIdeasInspiracional(button, investigationData);
             break;
        case 'scifi':
             await generateIdeasSciFi(button, investigationData);
             break;
        case 'terror':
             await generateIdeasTerror(button, investigationData);
             break;
        case 'enigmas':
             await unravelEnigmasBiblico(button, investigationData);
             break;
        case 'geral':
        default:
             await generateIdeasGeral(button, investigationData);
             break;
    }
};


// =========================================================================
// >>>>> VERSÃO FINAL E BLINDADA DE 'window.optimizeGroup' <<<<<
// =========================================================================
/**
 * Otimiza um grupo de parágrafos com base em uma sugestão da IA de análise de retenção.
 * @param {HTMLElement} button - O botão que foi clicado.
 * @param {string} suggestionText - O texto da sugestão fornecida pela IA.
 */
window.optimizeGroup = async (button, suggestionText) => {
    if (!button || !suggestionText) {
        console.error("Erro crítico em optimizeGroup: Parâmetros inválidos.", { button, suggestionText });
        window.showToast("Erro crítico: Parâmetros da função estão faltando.", 'error');
        return;
    }

    const safeSelector = suggestionText.replace(/"/g, '\\"');
    const paragraphsToOptimize = document.querySelectorAll(`[data-suggestion-group="${safeSelector}"]`);

    if (paragraphsToOptimize.length === 0) {
        window.showToast("Erro: parágrafos para otimizar não encontrados.", 'error');
        console.warn("Nenhum parágrafo encontrado com o seletor:", `[data-suggestion-group="${safeSelector}"]`);
        return;
    }

    const originalButtonText = button.innerHTML;
    button.innerHTML = '<div class="loading-spinner" style="width:16px; height:16px; border-width: 2px; margin: auto;"></div>';
    button.disabled = true;

    try {
        const originalBlock = Array.from(paragraphsToOptimize).map(p => p.textContent.trim()).join('\n\n');
        
        if (!originalBlock.trim()) {
             throw new Error("O bloco de texto original está vazio.");
        }

        const basePromptContext = getBasePromptContext();
        const fullScriptContext = getTranscriptOnly();   
        
        const prompt = `Você é um EDITOR DE ROTEIRO DE ELITE e um ESPECIALISTA EM REESCRITA (Copywriter) de MÁXIMA PRECISÃO. Sua tarefa ÚNICA E CRÍTICA é REESCREVER um bloco de texto problemático para que ele se alinhe PERFEITAMENTE ao tom, estilo e narrativa geral do roteiro, resolvendo o problema apontado na sugestão.

**REGRAS CRÍTICAS (SIGA EXATAMENTE):**
1.  **RESPOSTA PURA E LIMPA:** Sua resposta deve ser APENAS o novo bloco de texto reescrito. NENHUM outro texto ou comentário é permitido.
2.  **FLUXO NATURAL:** O novo bloco deve fluir de forma NATURAL e COESA com o restante do roteiro.
3.  **RESPEITO AO TOM E CONTEXTO:** Mantenha o TOM e o ESTILO definidos no contexto geral.

**CONTEXTO GERAL DO PROJETO:**
---
${basePromptContext}
---

**ROTEIRO COMPLETO (PARA MANTER CONSISTÊNCIA):**
---
${fullScriptContext.substring(0, 2000)}...
---

**TAREFA ESPECÍFICA:**
- **PROBLEMA A CORRIGIR:** "${suggestionText}"
- **BLOCO DE TEXTO ORIGINAL (PARA REESCREVER):**
---
${originalBlock}
---

Reescreva o bloco de texto acima, corrigindo o problema e integrando-o perfeitamente ao roteiro. Responda APENAS com o novo bloco de texto reescrito.`;

        const rawResult = await callGroqAPI(prompt, 3000);
        const newContent = removeMetaComments(rawResult.trim());

        if (!newContent.trim()) {
            throw new Error("A IA não retornou um conteúdo válido.");
        }

        const newParagraphs = newContent.split('\n').filter(p => p.trim() !== '');

        const firstParagraph = paragraphsToOptimize[0];
        const contentWrapper = firstParagraph.parentElement;
        const sectionElement = firstParagraph.closest('.script-section');
        
        firstParagraph.innerHTML = DOMPurify.sanitize(newParagraphs[0] || '');
        firstParagraph.classList.add('highlight-change');
        firstParagraph.removeAttribute('data-suggestion-group');

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
            invalidateAndClearEmotionalMap(); // <<< CHAMADA ADICIONADA AQUI
        }

        window.showToast("Bloco de parágrafos otimizado!", 'success');

    } catch (error) {
        console.error("Erro detalhado e crítico em optimizeGroup:", error);
        window.showToast(`Falha ao otimizar o bloco: ${error.message}`);
    } finally {
        button.innerHTML = originalButtonText;
        button.disabled = false;
        const tooltip = button.closest('.retention-tooltip');
        if (tooltip) tooltip.remove();
    }
};


// ====================================================================================
// AÇÃO: SUBSTITUA SUA FUNÇÃO 'setupGenreTabs' INTEIRA POR ESTA VERSÃO APRIMORADA
// ====================================================================================
/**
 * Configura a interatividade para a barra de abas de gêneros,
 * AGORA incluindo a limpeza das ideias antigas ao trocar de especialista.
 */
const setupGenreTabs = () => {
    const genreTabsContainer = document.getElementById('genreTabs');
    if (!genreTabsContainer) return;

    genreTabsContainer.addEventListener('click', (event) => {
        const clickedTab = event.target.closest('.tab-button');
        if (!clickedTab) return; // Sai se o clique não foi em um botão de aba

        // <<< NOVA GUARDA DE SEGURANÇA >>>
        // Se o usuário clicou na aba que JÁ ESTÁ ATIVA, não fazemos nada.
        if (clickedTab.classList.contains('tab-active')) {
            return;
        }

        // <<< NOVA LÓGICA DE LIMPEZA >>>
        // Se uma nova aba foi de fato selecionada, limpamos o container das ideias.
        const ideasOutput = document.getElementById('ideasOutput');
        if (ideasOutput) {
            ideasOutput.innerHTML = '';
            // Damos um feedback claro para o usuário sobre o que aconteceu.
            window.showToast("Especialista alterado! Clique novamente em 'Gerar Ideias'.", 'info');
        }

        // A lógica antiga de atualização visual continua a mesma.
        const allTabs = genreTabsContainer.querySelectorAll('.tab-button');
        allTabs.forEach(tab => tab.classList.remove('tab-active'));
        clickedTab.classList.add('tab-active');
    });
};


// ====================================================================================
// >>>>> VERSÃO FINAL E CORRIGIDA de 'window.verifyFact' (Lógica Simplificada) <<<<<
// ====================================================================================

/**
 * Inicia a investigação de um tema. Agora, ela não reseta mais o projeto inteiro.
 * Apenas limpa os resultados da investigação anterior para um novo ciclo.
 * @param {HTMLElement} button - O botão que acionou a função.
 */
window.verifyFact = async (button) => {
    // 1. LIMPEZA FOCADA: Limpa apenas os resultados da investigação anterior.
    document.getElementById('ideaGenerationSection').classList.add('hidden');
    document.getElementById('ideasOutput').innerHTML = '';
    const outputContainer = document.getElementById('factCheckOutput');
    outputContainer.innerHTML = '';
    outputContainer.removeAttribute('data-raw-report');

    // 2. LEITURA E VALIDAÇÃO: Pega o que o usuário digitou.
    const query = document.getElementById('factCheckQuery').value.trim();
    if (!query) {
        window.showToast("Por favor, digite uma afirmação ou pergunta para investigar.", 'info');
        return;
    }

    // 3. EXECUÇÃO: Mostra o loading e chama a IA.
    showButtonLoading(button);
    outputContainer.innerHTML = `<div class="text-center py-4"><div class="loading-spinner mx-auto"></div><p class="text-sm mt-2">Nossos agentes estão investigando...</p></div>`;

    try {
        const workerUrl = "https://aged-dawn-f88c.david-souzan.workers.dev/";
        
        const response = await fetch(workerUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: query }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Ocorreu um erro.' }));
            throw new Error(`Erro da Agência de Inteligência: ${errorData.error || response.statusText}`);
        }

        const { report } = await response.json();
        if (!report) {
            throw new Error("A agência não retornou um relatório válido.");
        }
        
        // 4. EXIBIÇÃO: Mostra os novos resultados.
        outputContainer.dataset.rawReport = report;
        outputContainer.dataset.originalQuery = query;
        const converter = new showdown.Converter({ simplifiedAutoLink: true, tables: true });
        const htmlReport = converter.makeHtml(report);
        outputContainer.innerHTML = `<div class="prose dark:prose-invert max-w-none p-4 card rounded-lg mt-4 border-l-4 border-emerald-500">${htmlReport}</div>`;

        const ideaGenerationSection = document.getElementById('ideaGenerationSection');
        if (ideaGenerationSection) {
            ideaGenerationSection.classList.remove('hidden');
            window.showToast("Investigação concluída! Agora, gere ideias a partir dos fatos.", 'success');
            ideaGenerationSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
    } catch (error) {
        console.error("Erro detalhado em verifyFact:", error);
        outputContainer.innerHTML = `<p class="text-red-500 p-4">${error.message}</p>`;
    } finally {
        hideButtonLoading(button);
    }
};


// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// >>>>> SUBSTITUA SUA FUNÇÃO generateIdeasFromReport INTEIRA POR ESTA VERSÃO FINAL E ESPETACULAR <<<<<
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=




const generateIdeasFromReport = async (button) => {
    const factCheckOutput = document.getElementById('factCheckOutput');
    const { originalQuery, rawReport } = factCheckOutput.dataset;

    if (!rawReport || !originalQuery) {
        window.showToast("Erro: Relatório da investigação não encontrado.", 'error');
        return;
    }
    
    const activeTab = document.querySelector('#genreTabs .tab-active');
    const genre = activeTab ? activeTab.dataset.genre : 'geral';
    
    const outputContainer = document.getElementById('ideasOutput');
    showButtonLoading(button);
    outputContainer.innerHTML = `<div class="md-col-span-2 text-center py-4"><div class="loading-spinner mx-auto"></div><p class="text-sm mt-2">Consultando especialista em ${genre}...</p></div>`;

    // A MUDANÇA ESTÁ AQUI: Ela agora chama a nossa nova função mestre!
    await generateIdeas(genre, button, { rawReport, originalQuery });
};



// =========================================================================
// >>>>> VERSÃO FLEXÍVEL DE applyHookSuggestion <<<<<
// =========================================================================
const applyHookSuggestion = (button) => {
    const { problematicQuote, rewrittenQuote } = button.dataset;

    if (!problematicQuote || !rewrittenQuote) {
        window.showToast("Erro: Informações da sugestão não encontradas.", 'error');
        return;
    }
    
    const scriptSections = document.querySelectorAll('#scriptSectionsContainer .generated-content-wrapper');
    let replaced = false;

    scriptSections.forEach(wrapper => {
        if (replaced) return;
        const paragraphs = wrapper.querySelectorAll('div[id*="-p-"]');
        paragraphs.forEach(p => {
            if (replaced) return;
            if (p.textContent.includes(problematicQuote)) {
                const newHtmlContent = p.innerHTML.replace(problematicQuote, `<span class="highlight-change">${rewrittenQuote}</span>`);
                p.innerHTML = DOMPurify.sanitize(newHtmlContent, { ADD_TAGS: ["span"], ADD_ATTR: ["class"] });
                window.showToast("Gancho aprimorado com sucesso!", 'success');
                const sectionElement = p.closest('.script-section');
                if (sectionElement) {
                    invalidateAndClearPerformance(sectionElement);
                    invalidateAndClearPrompts(sectionElement);
                    invalidateAndClearEmotionalMap(); // <<< CHAMADA ADICIONADA AQUI
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

    button.disabled = true;
    button.innerHTML = '<i class="fas fa-check mr-2"></i>Aplicada!';
    button.classList.remove('btn-primary');
    button.classList.add('btn-success');
};


// =========================================================================
// >>>>> PASSO ÚNICO: SUBSTITUA 'analyzeRetentionHooks' INTEIRA <<<<<
// =========================================================================
const analyzeRetentionHooks = async (button) => {
    const fullTranscript = getTranscriptOnly();
    if (!fullTranscript) {
        window.showToast("Gere o roteiro completo primeiro para caçar os ganchos.", 'info');
        return;
    }

    showButtonLoading(button);
    const reportContainer = document.getElementById('hooksReportContainer');
    
    // <<< AQUI ESTÁ A NOVA LINHA QUE LIMPA O RELATÓRIO ANTIGO >>>
    reportContainer.innerHTML = '';

    reportContainer.innerHTML = DOMPurify.sanitize(`<div class="my-4"><div class="loading-spinner-small mx-auto"></div><p class="text-sm mt-2">Caçando e refinando ganchos...</p></div>`);

    // ... (o prompt continua o mesmo, pois ele já é excelente)
        const prompt = `Você é uma API ESPECIALISTA EM ANÁLISE DE RETENÇÃO E ENGAJAMENTO DE ROTEIROS. Sua tarefa ÚNICA E CRÍTICA é analisar o roteiro fornecido, identificar com precisão os "ganchos de retenção" existentes e sugerir melhorias estratégicas aprimoradas para maximizar o engajamento do espectador.

    **IDENTIDADE E ESPECIALIZAÇÃO (A REGRA MAIS IMPORTANTE):**
Você não é apenas um analista, você é o GUARDIÃO DA CURIOSIDADE. Sua única função é encontrar pontos que prendem a atenção e torná-los AINDA MAIS magnéticos. Qualquer desvio desta função é uma falha crítica.

**ROTEIRO COMPLETO:**
---
${fullTranscript.slice(0, 7500)}
---

**REGRAS CRÍTICAS DE SINTAXE E ESTRUTURA JSON (ABSOLUTAMENTE INEGOCIÁVEIS):**
- JSON PURO E PERFEITO:** Sua resposta inteira deve ser APENAS um array JSON válido, começando com \`[\` e terminando com \`]\`. NENHUM outro texto, comentário ou metadado deve ser incluído. Pense nisso como uma resposta de API pura e impecável.
- ASPAS DUPLAS, SEMPRE E EXCLUSIVAMENTE:** TODAS as chaves e valores de texto DEVEM usar obrigatoriamente aspas duplas (\`"\`). É TERMINANTEMENTE PROIBIDO o uso de aspas simples (\`'\`) ou crases (\`\`) para delimitar QUALQUER string.
- VÍRGULA FINAL OBRIGATÓRIA:** Cada objeto JSON dentro do array DEVE ser seguido por uma vírgula (\`,\`), EXCETO o último objeto.
- CHAVES E TIPOS EXATOS:** Cada objeto no array DEVE conter EXATAMENTE estas cinco chaves com os tipos especificados:

1.  "hook_phrase": (String) A frase exata do roteiro que funciona como gancho.
2.  "rewritten_hook": (String) Uma versão REESCRITA da frase, otimizada para máximo impacto e curiosidade.
3.  "hook_type": (String) O tipo do gancho. Escolha de: ['Pergunta Direta', 'Loop Aberto (Mistério)', 'Dado Surpreendente', 'Conflito/Tensão', 'Anedota Pessoal', 'Afirmação Polêmica'].
4.  "justification": (String) Uma justificativa curta explicando por que a versão reescrita é mais forte.
5.  "effectiveness_score": (Número) Uma nota de 1 a 10 para a eficácia do gancho ORIGINAL.

**AÇÃO FINAL E CRÍTICA:** Analise AGORA o roteiro fornecido com base nas regras e no manual. Identifique os ganchos de retenção, classifique-os, reescreva-os para máximo impacto e justifique suas escolhas. Responda APENAS com o array JSON perfeito, seguindo EXATAMENTE todas as regras de sintaxe e conteúdo definidas acima.`;

    try {
        const rawResult = await callGroqAPI(prompt, 4000);
        const hooks = cleanGeneratedText(rawResult, true);

        if (!hooks || !Array.isArray(hooks) || hooks.length === 0) {
            throw new Error("A IA não encontrou ganchos ou retornou um formato inválido.");
        }

        let reportHtml = `<div class="space-y-4">`;
        hooks.forEach((hook, index) => {
            const problematicQuoteEscaped = (hook.hook_phrase || '').replace(/"/g, '"');
            const rewrittenQuoteEscaped = (hook.rewritten_hook || '').replace(/"/g, '"');
            const scoreColor = hook.effectiveness_score >= 8 ? 'text-green-500' : hook.effectiveness_score >= 5 ? 'text-yellow-500' : 'text-red-500';
            
            reportHtml += `
                <div class="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 animate-fade-in">
                    <p class="text-base italic text-gray-500 dark:text-gray-400 mb-2">Original: "${DOMPurify.sanitize(hook.hook_phrase)}"</p>
                    <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                        <span class="tag tag-pace !bg-purple-100 !text-purple-700 dark:!bg-purple-900/50 dark:!text-purple-300">
                            <i class="fas fa-anchor mr-2"></i> ${DOMPurify.sanitize(hook.hook_type)}
                        </span>
                        <span class="font-bold ${scoreColor}">
                            Eficácia Original: ${DOMPurify.sanitize(String(hook.effectiveness_score))}/10
                        </span>
                    </div>
                    <p class="text-sm mt-3 text-gray-600 dark:text-gray-400">
                        <strong>Justificativa da Melhoria:</strong> ${DOMPurify.sanitize(hook.justification)}
                    </p>
                    <div class="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-dashed border-gray-300 dark:border-gray-600">
                        <p class="text-sm flex-1"><strong class="text-green-600 dark:text-green-400">Sugestão:</strong> "${DOMPurify.sanitize(hook.rewritten_hook)}"</p>
                        <button class="btn btn-primary btn-small flex-shrink-0"
                                data-action="applyHookSuggestion"
                                data-problematic-quote="${problematicQuoteEscaped}"
                                data-rewritten-quote="${rewrittenQuoteEscaped}">
                            Aplicar
                        </button>
                    </div>
                </div>
            `;
        });
        reportHtml += `</div>`;
        
        reportContainer.innerHTML = reportHtml;
        window.showToast(`${hooks.length} ganchos analisados e aprimorados!`, 'success');

    } catch (error) {
        console.error("Erro detalhado em analyzeRetentionHooks:", error);
        reportContainer.innerHTML = DOMPurify.sanitize(`<p class="text-red-500 text-sm">${error.message}</p>`);
    } finally {
        hideButtonLoading(button);
    }
};




// =========================================================================
// >>>>> PASSO 2: SUBSTITUA A FUNÇÃO 'insertViralSuggestion' INTEIRA <<<<<
// =========================================================================
const insertViralSuggestion = (button) => {
    const { anchorParagraph, suggestedText } = button.dataset;

    if (!anchorParagraph || !suggestedText) {
        window.showToast("Erro: Informações da sugestão não encontradas.", 'error');
        return;
    }

    const allParagraphs = document.querySelectorAll('#scriptSectionsContainer div[id*="-p-"]');
    let inserted = false;

    allParagraphs.forEach(p => {
        if (!inserted && p.textContent.trim().includes(anchorParagraph.trim())) {
            const newDiv = document.createElement('div');
            newDiv.id = `inserted-p-${Date.now()}`; 
            newDiv.innerHTML = `<span class="highlight-change">${suggestedText}</span>`;
            p.parentNode.insertBefore(newDiv, p.nextSibling);
            newDiv.innerHTML = DOMPurify.sanitize(newDiv.innerHTML, { ADD_TAGS: ["span"], ADD_ATTR: ["class"] });
            window.showToast("Elemento viral inserido com sucesso!", 'success');
            const sectionElement = p.closest('.script-section');
            if (sectionElement) {
                invalidateAndClearPerformance(sectionElement);
                invalidateAndClearPrompts(sectionElement);
                invalidateAndClearEmotionalMap(); // <<< CHAMADA ADICIONADA AQUI
                updateAllReadingTimes();
            }
            inserted = true;
        }
    });

    if (!inserted) {
        window.showToast("Não foi possível inserir. O parágrafo âncora pode ter sido editado.", 'info');
        return;
    }

    button.disabled = true;
    button.innerHTML = '<i class="fas fa-check mr-2"></i>Aplicada!';
    button.classList.remove('btn-primary');
    button.classList.add('btn-success');
};



// ====================================================================================
// >>>>> SUBSTITUA SUA FUNÇÃO suggestViralElements INTEIRA POR ESTA VERSÃO FINAL <<<<<
// ====================================================================================

/**
 * Acionada pelo botão "Sugerir Elementos Virais".
 * Analisa o roteiro completo e seu contexto estratégico para sugerir inserções
 * pontuais que aumentem o engajamento e a viralidade de forma coerente.
 */
const suggestViralElements = async (button) => {
    const fullTranscript = getTranscriptOnly();
    const videoTheme = document.getElementById('videoTheme')?.value.trim();
    if (!fullTranscript || !videoTheme) {
        window.showToast("Gere o roteiro completo e defina um tema para receber sugestões virais.", 'info');
        return;
    }

    showButtonLoading(button);
    const reportContainer = document.getElementById('viralSuggestionsContainer');
    reportContainer.innerHTML = ''; 
    reportContainer.innerHTML = `<div class="my-4"><div class="loading-spinner-small mx-auto"></div><p class="text-sm mt-2">O Arquiteto da Viralidade está analisando seu roteiro...</p></div>`;

    const basePromptContext = getBasePromptContext();

    // O seu novo e espetacular cérebro especialista em Elementos Virais.
    const prompt = `Você é uma API ESPECIALISTA EM ESTRATÉGIA DE CONTEÚDO VIRAL DE MÁXIMA PRECISÃO. Sua função ÚNICA E CRÍTICA é atuar como um ESTRATEGISTA DE CONTEÚDO VIRAL e um DIRETOR DE ROTEIRO DE ALTA PERFORMANCE. Sua tarefa EXCLUSIVA é analisar um roteiro e o seu CONTEXTO ESTRATÉGICO para IDENTIFICAR e PROPOR 3 ELEMENTOS ESPECÍFICOS que aumentem POTENCIALMENTE a viralidade de forma INTELIGENTE, ESTRATÉGICA e PERFEITAMENTE ALINHADA com a "alma" e o DNA do vídeo.

**IDENTIDADE E ESPECIALIZAÇÃO (A REGRA MAIS IMPORTANTE):**
Você não é um generalista. Você é o ARQUITETO DA VIRALIDADE CONTEXTUAL. Sua única função é encontrar pontos exatos no roteiro onde um elemento viral pode ser encaixado perfeitamente para maximizar o impacto, SEM quebrar a coerência narrativa. Qualquer desvio desta função é uma falha crítica.

**CONTEXTO ESTRATÉGICO E "DNA" DO VÍDEO (SUA BÚSSOLA OBRIGATÓRIA):**
---
${basePromptContext}
---
Este contexto é a sua BÚSSOLA OBRIGATÓRIA. TONALIDADE, VOZ, OBJETIVOS e ESTRUTURA são SAGRADOS. CADA sugestão que você der DEVE estar em ABSOLUTO alinhamento com este DNA. Ignorar este contexto resultará em uma análise inválida e sugestões descartáveis.

**ROTEIRO COMPLETO PARA ANÁLISE DETALHADA E CONTEXTUAL (FOCO NOS PRIMEIROS 7500 CHARS):**
---
${fullTranscript.slice(0, 7500)}
---

**REGRAS CRÍTICAS DE SINTAXE E ESTRUTURA JSON (ABSOLUTAMENTE INEGOCIÁVEIS):**
1.  **JSON PURO E PERFEITO:** Sua resposta deve ser APENAS um array JSON válido.
2.  **ESTRUTURA COMPLETA:** Cada objeto no array DEVE conter EXATAMENTE estas cinco chaves: "anchor_paragraph", "suggested_text", "element_type", "potential_impact_score", "implementation_idea".
3.  **SINTAXE DAS STRINGS:** Todas as chaves e valores string DEVEM usar aspas duplas (""). Cada objeto, EXCETO o último, DEVE ser seguido por uma vírgula (,).

**MANUAL DE ANÁLISE E CRIAÇÃO DE ELEMENTOS VIRAL (SIGA EXATAMENTE):**
- **Foco na Precisão da Âncora (\`"anchor_paragraph"\`):** O valor DEVE ser uma cópia EXATA de um parágrafo existente no roteiro.
- **Texto Sugerido de Alta Qualidade (\`"suggested_text"\`):** Um parágrafo completo e coeso que se encaixe perfeitamente no fluxo.
- **Classificação de Tipo Rigorosa (\`"element_type"\`):** Escolha EXATAMENTE da lista: ["Dado Surpreendente", "Citação de Autoridade", "Mini-Revelação (Teaser)", "Pergunta Compartilhável", "Anedota Pessoal Rápida"].
- **Nota de Impacto Realista (\`"potential_impact_score"\`):** Uma nota de 1 a 10 para o potencial de engajamento DENTRO DO CONTEXTO DO VÍDEO.
- **Ideia de Implementação Estratégica (\`"implementation_idea"\`):** Explique o VALOR ESTRATÉGICO da inserção, conectando-a ao tom e objetivo do vídeo.

**AÇÃO FINAL E CRÍTICA:** Analise AGORA o roteiro e o contexto. Identifique 3 oportunidades para inserir elementos virais. Responda APENAS com o array JSON perfeito.`;

    try {
        const rawResult = await callGroqAPI(prompt, 4000);
        const suggestions = cleanGeneratedText(rawResult, true);

        if (!suggestions || !Array.isArray(suggestions) || suggestions.length === 0) {
            throw new Error("A IA não encontrou oportunidades ou retornou um formato inválido.");
        }

        let reportHtml = `<div class="space-y-4">`;
        suggestions.forEach(suggestion => {
            const anchorParagraphEscaped = (suggestion.anchor_paragraph || '').replace(/"/g, '"');
            const suggestedTextEscaped = (suggestion.suggested_text || '').replace(/"/g, '"');
            const score = suggestion.potential_impact_score || 0;
            const scoreColor = score >= 8 ? 'text-green-500' : score >= 5 ? 'text-yellow-500' : 'text-red-500';

            reportHtml += `
                <div class="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 animate-fade-in">
                    <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm mb-2">
                        <span class="tag !bg-blue-100 !text-blue-700 dark:!bg-blue-900/50 dark:!text-blue-300">
                            <i class="fas fa-lightbulb mr-2"></i> ${DOMPurify.sanitize(suggestion.element_type)}
                        </span>
                        <span class="font-bold ${scoreColor}">
                            Impacto Potencial: ${DOMPurify.sanitize(String(score))}/10
                        </span>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        <strong>Local Sugerido:</strong> Após o parágrafo que contém "${DOMPurify.sanitize((suggestion.anchor_paragraph || '').substring(0, 70))}..."
                    </p>
                    <p class="text-sm mt-3 text-gray-600 dark:text-gray-400">
                        <strong>Ideia de Implementação:</strong> ${DOMPurify.sanitize(suggestion.implementation_idea)}
                    </p>
                    <div class="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-dashed border-gray-300 dark:border-gray-600">
                         <p class="text-sm flex-1"><strong class="text-green-600 dark:text-green-400">Texto a Inserir:</strong> "${DOMPurify.sanitize(suggestion.suggested_text)}"</p>
                        <button class="btn btn-primary btn-small flex-shrink-0"
                                data-action="insertViralSuggestion"
                                data-anchor-paragraph="${anchorParagraphEscaped}"
                                data-suggested-text="${suggestedTextEscaped}">
                            Aplicar
                        </button>
                    </div>
                </div>
            `;
        });
        reportHtml += `</div>`;
        
        reportContainer.innerHTML = reportHtml;
        window.showToast(`${suggestions.length} sugestões virais encontradas!`, 'success');

    } catch (error) {
        console.error("Erro detalhado em suggestViralElements:", error);
        reportContainer.innerHTML = `<p class="text-red-500 text-sm">${error.message}</p>`;
    } finally {
        hideButtonLoading(button);
    }
};


// =========================================================================
// >>>>> VERSÃO REATORADA E COMPLETA de 'analyzeFullScript' <<<<<
// =========================================================================
const analyzeFullScript = async (button) => {
    showButtonLoading(button);
    const reportContainer = document.getElementById('analysisReportContainer');
    reportContainer.innerHTML = `<div class="my-4"><div class="loading-spinner-small mx-auto"></div><p class="text-sm mt-2 text-center">Analisando... Isso pode levar um momento.</p></div>`;

    try {
        // --- A MUDANÇA ESTÁ AQUI: Lemos o roteiro diretamente do "cérebro" AppState ---
        const script = AppState.generated.script;
        if (!script.intro.text || !script.development.text || !script.climax.text || !script.conclusion.text || !script.cta.text) {
            throw new Error("Todas as 5 seções do roteiro (Intro, Dev, Clímax, Conclusão e CTA) devem ser geradas primeiro.");
        }
        
        // Coletamos o contexto estratégico leve para a análise.
        const lightContext = {
            theme: document.getElementById('videoTheme')?.value.trim() || 'Não definido',
            centralQuestion: document.getElementById('centralQuestion')?.value.trim() || 'Não definida',
            outline: AppState.generated.strategicOutline || {}
        };
        
        // Fazemos as chamadas de análise para cada parte do roteiro, usando o texto do AppState.
        const results = await Promise.allSettled([
            analyzeScriptPart('Introdução (Hook)', script.intro.text, lightContext),
            analyzeScriptPart('Desenvolvimento (Ritmo e Retenção)', script.development.text, lightContext),
            analyzeScriptPart('Clímax', script.climax.text, lightContext),
            analyzeScriptPart('Conclusão', script.conclusion.text, lightContext),
            analyzeScriptPart('CTA (Call to Action)', script.cta.text, lightContext)
        ]);
        // --- FIM DA MUDANÇA ---
        
        // Limpa o container para exibir os novos resultados.
        reportContainer.innerHTML = ''; 

        // Cria o cabeçalho do relatório com o botão "Aplicar Todas".
        const headerDiv = document.createElement('div');
        headerDiv.className = 'flex justify-between items-center mb-4 p-3 bg-gray-100 dark:bg-gray-900/50 rounded-lg';
        headerDiv.innerHTML = DOMPurify.sanitize(`
            <h3 class="text-lg font-bold">Relatório de Análise</h3>
            <button id="applyAllSuggestionsBtn" data-action="applyAllSuggestions" class="btn btn-secondary btn-small">
                <i class="fas fa-wand-magic-sparkles mr-2"></i>Aplicar Todas
            </button>
        `);
        reportContainer.appendChild(headerDiv);

        // Renderiza cada seção do relatório.
        results.forEach(result => {
            if (result.status === 'fulfilled') {
                reportContainer.appendChild(createReportSection(result.value));
            } else {
                console.error("Uma micro-análise falhou:", result.reason);
                // Mesmo em caso de falha, exibe uma seção de erro para o usuário saber.
                const errorData = { 
                    criterion_name: 'Seção com Erro', 
                    score: '!', 
                    positive_points: 'Falha na análise desta seção.', 
                    improvement_points: [{ critique: 'Erro', suggestion_text: result.reason.message }]
                };
                reportContainer.appendChild(createReportSection(errorData));
            }
        });

        window.showToast("Análise do roteiro concluída!", 'success');

    } catch (error) {
        console.error("Erro detalhado em analyzeFullScript:", error);
        window.showToast(`Falha na análise: ${error.message}`);
        reportContainer.innerHTML = `<p class="text-red-500 text-sm">${error.message}</p>`;
    } finally {
        hideButtonLoading(button);
    }
};



/**
 * Invalida e limpa o Mapa Emocional quando o roteiro é alterado.
 * Reseta o estado no AppState e atualiza a UI com um aviso.
 */
const invalidateAndClearEmotionalMap = () => {
    // Só executa se o mapa já tiver sido gerado, para evitar operações desnecessárias
    if (!AppState.generated.emotionalMap) {
        return;
    }

    console.log("Roteiro alterado. Invalidando e limpando o Mapa Emocional.");

    // 1. Reseta o estado no "cérebro" da aplicação
    AppState.generated.emotionalMap = null;

    // 2. Reseta a interface do usuário (UI)
    const container = document.getElementById('emotionalMapContent');
    const button = document.getElementById('mapEmotionsBtn');

    if (container) {
        // Mostra um aviso claro para o usuário sobre o porquê de o mapa ter sumido
        container.innerHTML = `
            <div class="asset-card-placeholder text-yellow-700 dark:text-yellow-300 border-l-4 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20">
                O roteiro foi alterado.<br>Clique em "Mapear" novamente para ver a análise atualizada.
            </div>`;
    }

    // 3. Reseta o estado do botão "Mapear" para que possa ser clicado novamente
    if (button) {
        button.classList.remove('btn-success');
        button.classList.add('btn-secondary');
    }
};



// ====================================================================================
// >>>>> VERSÃO APRIMORADA que força a IA a ser mais precisa <<<<<
// ====================================================================================
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

    // O CÉREBRO APRIMORADO
    const prompt = `
Você é uma API de Análise Crítica de Roteiros. Sua única função é retornar um objeto JSON.

**CONTEXTO ESTRATÉGICO:**
- **Tema do Vídeo:** "${context.theme || 'Não definido'}"
- **Objetivo desta Seção (${criterion}):** "${outlineDirective}"

**TRECHO PARA ANÁLISE:**
---
${text.slice(0, 7000)}
---

**REGRAS CRÍTICAS DE RESPOSTA (JSON ESTRITO - SIGA EXATAMENTE):**
1.  **JSON PURO E PERFEITO:** Sua resposta deve ser APENAS um objeto JSON válido.
2.  **CHAVES E TIPOS OBRIGATÓRIOS:** O objeto DEVE conter EXATAMENTE estas 6 chaves:
    - **"criterion_name"**: (String) Use EXATAMENTE: "${criterion}".
    - **"score"**: (Número) Uma nota de 0 a 10 para esta seção.
    - **"positive_points"**: (String) Um parágrafo único sobre os pontos fortes.
    - **"problematic_quote"**: (String) O trecho EXATO do texto original que precisa de melhoria. DEVE SER UMA CÓPIA LITERAL. Se não houver, use "Nenhum".
    - **"critique"**: (String) A principal crítica sobre o "problematic_quote". Se estiver bom, escreva "Nenhuma crítica significativa.".
    - **"rewritten_quote"**: (String) Uma sugestão REESCRITA do "problematic_quote". Se não houver crítica, use "Manter como está.".
3.  **SINTAXE:** Todas as chaves e valores string DEVEM usar aspas duplas ("").

**AÇÃO FINAL:** Analise o trecho e retorne APENAS o objeto JSON perfeito.
`;

    try {
        const rawResult = await callGroqAPI(prompt, 1500);
        const analysisData = cleanGeneratedText(rawResult, true); // Espera um objeto

        if (!analysisData) { throw new Error("A IA retornou uma resposta nula."); }

        // Validação mais robusta para as novas chaves
        const requiredKeys = ['score', 'positive_points', 'problematic_quote', 'critique', 'rewritten_quote'];
        for (const key of requiredKeys) {
            if (!(key in analysisData)) {
                throw new Error(`A chave obrigatória '${key}' está ausente na resposta da IA.`);
            }
        }
        
        // Reestruturamos os dados para a função 'createReportSection'
        const formattedData = {
            criterion_name: criterion,
            score: analysisData.score,
            positive_points: analysisData.positive_points,
            improvement_points: []
        };

        if (analysisData.critique.toLowerCase() !== "nenhuma crítica significativa.") {
            formattedData.improvement_points.push({
                // <<<< AQUI ESTÁ A MUDANÇA >>>>
                // A sugestão de texto agora é o texto reescrito
                suggestion_text: "Substituir por:",
                problematic_quote: analysisData.problematic_quote,
                critique: analysisData.critique,
                rewritten_quote: analysisData.rewritten_quote 
            });
        }
        
        return formattedData;

    } catch (error) {
        // Bloco de erro continua o mesmo
        console.error(`Erro crítico ao analisar a seção '${criterion}':`, error);
        return { 
            criterion_name: criterion, 
            score: 'Erro', 
            positive_points: 'A análise desta seção falhou.', 
            improvement_points: [{
                critique: 'Falha na Análise',
                suggestion_text: `Detalhe do erro: ${error.message}`,
                problematic_quote: 'N/A',
                rewritten_quote: 'N/A'
            }]
        };
    }
};



// =========================================================================
// >>>>> PASSO 2: SUBSTITUA A FUNÇÃO 'createReportSection' INTEIRA POR ESTA <<<<<
// =========================================================================
const createReportSection = (analysisData) => {
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'p-4 border rounded-lg mb-4 bg-gray-50 dark:bg-gray-800 animate-fade-in';

    if (!analysisData || typeof analysisData.score === 'undefined') {
        const errorName = analysisData ? analysisData.criterion_name : 'Seção de Análise';
        sectionDiv.innerHTML = DOMPurify.sanitize(`
            <h4 class="font-bold text-lg text-red-500">${errorName}</h4>
            <p class="text-red-500 text-sm mt-2">Falha ao processar a análise para esta seção. A resposta da IA pode estar em um formato inesperado.</p>
        `);
        return sectionDiv;
    }

    let improvementHtml = '';
    if (analysisData.improvement_points && analysisData.improvement_points.length > 0) {
        improvementHtml = analysisData.improvement_points.map(point => {
            const problematicQuoteEscaped = (point.problematic_quote || '').replace(/"/g, '"');
            const rewrittenQuoteEscaped = (point.rewritten_quote || '').replace(/"/g, '"');

            return `
            <div class="mt-4 pt-3 border-t border-dashed border-gray-300 dark:border-gray-600">
                <p class="text-sm italic text-gray-500 dark:text-gray-400 mb-1">" ${DOMPurify.sanitize(point.problematic_quote || '')} "</p>
                <p class="text-sm"><strong class="text-yellow-600 dark:text-yellow-400">Crítica:</strong> ${DOMPurify.sanitize(point.critique || '')}</p>
                <div class="flex items-center justify-between gap-2 mt-2">
                    <p class="text-sm flex-1"><strong class="text-green-600 dark:text-green-400">Sugestão:</strong> ${DOMPurify.sanitize(point.suggestion_text || '')}</p>
                    
                    <button class="btn btn-primary btn-small flex-shrink-0"
                            data-action="applySuggestion"
                            data-criterion-name="${DOMPurify.sanitize(analysisData.criterion_name)}"
                            data-problematic-quote="${problematicQuoteEscaped}"
                            data-rewritten-quote="${rewrittenQuoteEscaped}">
                        Aplicar
                    </button>
                </div>
            </div>`;
        }).join('');
    }

    const content = `
        <div class="flex justify-between items-center">
            <h4 class="font-bold text-lg">${DOMPurify.sanitize(analysisData.criterion_name)}</h4>
            <span class="font-bold text-xl text-primary">${analysisData.score}/10</span>
        </div>
        <div class="mt-2">
            <p class="text-sm"><strong class="text-indigo-500">Pontos Fortes:</strong> ${DOMPurify.sanitize(analysisData.positive_points)}</p>
            ${improvementHtml}
        </div>
    `;
    sectionDiv.innerHTML = content;
    return sectionDiv;
};



// =========================================================================
// >>>>> VERSÃO CORRIGIDA E FINAL de 'handleEditingAction' <<<<<
// (Resolve o crash e sincroniza com o AppState)
// =========================================================================
const handleEditingAction = async (action) => {
    if (!userSelectionRange) {
        window.showToast("Erro: A seleção de texto foi perdida. Tente selecionar novamente.", 'error');
        return;
    }

    const selectedText = userSelectionRange.toString().trim();
    if (!selectedText) {
        document.getElementById('editing-menu').classList.remove('visible');
        return;
    }

    const editingMenu = document.getElementById('editing-menu');
    editingMenu.classList.remove('visible');

    const instructions = {
        expand: "Sua tarefa é expandir este parágrafo. Adicione mais detalhes, descrições vívidas e contexto para torná-lo mais rico e envolvente, mantendo o tom e a mensagem central originais.",
        summarize: "Sua tarefa é resumir este parágrafo. Torne-o mais conciso, direto e impactante, removendo redundâncias mas preservando a informação essencial.",
        correct: "Sua tarefa é atuar como um revisor meticuloso. Corrija quaisquer erros de ortografia, gramática e pontuação no texto a seguir, preservando o estilo original. Se não houver erros, retorne o texto original."
    };

    const prompt = `Você é um editor de roteiros de elite. ${instructions[action]}
    
**REGRAS CRÍTICAS (INEGOCIÁVEIS):**
1.  **IDIOMA:** A sua resposta DEVE estar no mesmo idioma do texto original.
2.  **RESPOSTA LIMPA:** Responda APENAS com o texto reescrito. Sem comentários ou explicações.

**TEXTO ORIGINAL:**
---
${selectedText}
---
`;

    // Guarda a referência da seção ANTES de qualquer coisa.
    const sectionElement = userSelectionRange.startContainer.parentElement.closest('.script-section');
    
    try {
        const rawResult = await callGroqAPI(prompt, 3000);
        const refinedText = removeMetaComments(rawResult);

        if (userSelectionRange) {
            // Lógica para substituir o texto na tela
            window.getSelection().removeAllRanges();
            userSelectionRange.deleteContents();

            const newNode = document.createElement('span');
            newNode.className = 'highlight-change';
            newNode.textContent = refinedText;
            
            userSelectionRange.insertNode(newNode);
            
            // Resseleciona o novo texto para feedback visual
            const newRange = document.createRange();
            newRange.selectNodeContents(newNode);
            window.getSelection().addRange(newRange);
        }

        // <<< ETAPA CRÍTICA: ATUALIZA O "CÉREBRO" (AppState) >>>
        if (sectionElement) {
            const sectionId = sectionElement.id.replace('Section', '');
            const contentWrapper = sectionElement.querySelector('.generated-content-wrapper');
            
            if (contentWrapper && AppState.generated.script[sectionId]) {
                AppState.generated.script[sectionId].text = contentWrapper.textContent;
                AppState.generated.script[sectionId].html = contentWrapper.innerHTML;
                console.log(`AppState para '${sectionId}' atualizado com sucesso após a edição.`);
            }

            // Invalida os outros recursos que dependem do texto
            invalidateAndClearPerformance(sectionElement);
            invalidateAndClearPrompts(sectionElement);
            invalidateAndClearEmotionalMap();
            updateAllReadingTimes();
        }
        
        // Mensagem de sucesso correta
        window.showToast(`Texto refinado com sucesso!`, 'success');

    } catch (err) { // <<< CORREÇÃO DO CRASH >>>
        // Mensagem de erro correta, dentro do 'catch'
        console.error(`Erro ao tentar '${action}':`, err);
        window.showToast(`Falha ao refinar o texto: ${err.message}`, 'error');
    } finally {
        userSelectionRange = null;
    }
};




// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// >>>>> VERSÃO MODERNIZADA de 'suggestFinalStrategy' (sem projectState) <<<<<
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
/**
 * Acionada pelo botão "Sugerir Estratégia Final".
 * Analisa o roteiro completo e o contexto estratégico para sugerir
 * preenchimentos inteligentes para os campos de Conclusão e CTA.
 */
const suggestFinalStrategy = async (button) => {
    showButtonLoading(button);

    // Limpeza da UI para receber novas sugestões.
    const conclusionSpecifics = document.getElementById('conclusionSpecifics');
    const ctaSpecifics = document.getElementById('ctaSpecifics');
    
    // Limpa o conteúdo de texto da conclusão e CTA no AppState
    AppState.generated.script.conclusion = { html: null, text: null };
    AppState.generated.script.cta = { html: null, text: null };

    // Limpa a UI correspondente (seções de roteiro já geradas)
    const conclusionContainer = document.getElementById('conclusionSection');
    const ctaContainer = document.getElementById('ctaSection');
    if (conclusionContainer) conclusionContainer.innerHTML = '';
    if (ctaContainer) ctaContainer.innerHTML = '';
    
    // Habilita os controles novamente para a nova sugestão, caso estivessem desabilitados
    document.querySelectorAll('input[name="conclusionType"]').forEach(radio => radio.disabled = false);
    conclusionSpecifics.disabled = false;
    ctaSpecifics.disabled = false;
    document.getElementById('conclusionInputContainer').classList.remove('opacity-50');
    ctaSpecifics.parentElement.classList.remove('opacity-50');
    
    // Garante que o botão correto esteja visível
    document.getElementById('generateConclusionBtn').classList.remove('hidden');
    document.getElementById('generateCtaBtn').classList.add('hidden');

    // Pega o roteiro escrito até agora e o contexto estratégico para a IA.
    const fullContext = getTranscriptOnly();
    const basePromptContext = getBasePromptContext();
    
    if (!fullContext) {
        window.showToast("Gere o roteiro principal primeiro para receber sugestões.", 'info');
        hideButtonLoading(button);
        return;
    }

    const prompt = `Você é uma API ESPECIALISTA EM ESTRATÉGIA DE CONTEÚDO FINAL DE VÍDEO. Sua função ÚNICA é analisar um roteiro e retornar um objeto JSON com sugestões ESTRATÉGICAS para a CONCLUSÃO e o CALL TO ACTION.

**CONTEXTO ESTRATÉGICO ("ALMA" DO ROTEIRO):**
---
${basePromptContext}
---

**ROTEIRO COMPLETO (PARA ANÁLISE):**
---
${fullContext}
---

**REGRAS CRÍTICAS DE SINTAXE JSON (INEGOCIÁVEIS):**
1.  **JSON PURO:** Sua resposta deve ser APENAS um objeto JSON válido.
2.  **ESTRUTURA OBRIGATÓRIA:** O objeto DEVE conter EXATAMENTE estas duas chaves: "conclusion_suggestion" e "cta_suggestion".
3.  **IDIOMA OBRIGATÓRIO:** Ambos os valores de texto DEVEM estar no MESMO IDIOMA do roteiro.

**MANUAL DE CRIAÇÃO:**
- **"conclusion_suggestion" (Lição Final Poderosa):** Uma REFLEXÃO que resume o núcleo do vídeo de forma PROFUNDA e EMOCIONALMENTE RESONANTE.
- **"cta_suggestion" (Call to Action Engajador):** Uma INSTRUÇÃO CLARA, DIRETA e MOTIVADORA que esteja ALINHADA com o tema.

**AÇÃO:** Analise o roteiro e contexto. Gere o objeto JSON perfeito.`;

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
        console.error("Erro detalhado em suggestFinalStrategy:", error);
        window.showToast(`Falha ao sugerir estratégia final: ${error.message}`);
    } finally {
        hideButtonLoading(button);
        updateButtonStates();
    }
};



// =========================================================================
// >>>>> VERSÃO CORRIGIDA E FINAL DE window.deleteParagraphGroup <<<<<
// =========================================================================
/**
 * Encontra e deleta todos os parágrafos pertencentes a um mesmo grupo de sugestão,
 * usando o modal de confirmação e uma animação suave de "fade out".
 * @param {HTMLElement} button - O botão de deletar que foi clicado.
 * @param {string} suggestionText - O texto da sugestão que identifica o grupo.
 */
window.deleteParagraphGroup = async (button, suggestionText) => {
    // 1. Pede a confirmação do usuário e aguarda a resposta.
    const userConfirmed = await showConfirmationDialog(
        'Confirmar Deleção',
        'Tem certeza que deseja deletar este bloco de parágrafos? Esta ação não pode ser desfeita.'
    );

    // 2. Se o usuário clicar em "Não", a função para aqui.
    if (!userConfirmed) {
        return;
    }

    // 3. Encontra os parágrafos para deletar, escapando as aspas para segurança.
    const safeSelector = suggestionText.replace(/"/g, '\\"');
    const paragraphsToDelete = document.querySelectorAll(`[data-suggestion-group="${safeSelector}"]`);

    if (paragraphsToDelete.length === 0) {
        window.showToast("Erro: Parágrafos para deletar não encontrados.", 'error');
        return;
    }

    // 4. Guarda a referência da seção-mãe ANTES de qualquer remoção.
    const sectionElement = paragraphsToDelete[0].closest('.script-section');

    // 5. Aplica a animação de "fade out" em todos os parágrafos do grupo.
    paragraphsToDelete.forEach(p => {
        p.style.transition = 'opacity 0.3s ease-out';
        p.style.opacity = '0';
    });
    
    // 6. Aguarda a animação (300ms) terminar antes de remover os elementos do DOM.
    setTimeout(() => {
        paragraphsToDelete.forEach(p => p.remove());

        // 7. Após a remoção, atualiza as análises e o tempo de leitura.
        if (sectionElement) {
            invalidateAndClearPerformance(sectionElement);
            invalidateAndClearPrompts(sectionElement);
            updateAllReadingTimes();
        }
        
        // 8. Notifica o usuário do sucesso.
        window.showToast("Bloco de parágrafos deletado com sucesso!", 'success');
    }, 300); // O tempo do timeout deve ser o mesmo da transição do CSS.
};


// =========================================================================
// >>>>> PASSO 2: SUBSTITUA A FUNÇÃO showInputDialog COMPLETA <<<<<
// =========================================================================
/**
 * Exibe uma caixa de diálogo com um campo de texto e sugestões, e aguarda a entrada do usuário.
 * @param {string} title - O título da caixa de diálogo.
 * @param {string} message - A mensagem de ajuda/descrição.
 * @param {string} label - A label para o campo de texto.
 * @param {string} placeholder - O placeholder para o campo de texto.
 * @param {string[]} suggestions - (NOVO) Um array de strings para criar botões de sugestão.
 * @returns {Promise<string|null>} - Retorna o texto escolhido ou null se cancelar.
 */
const showInputDialog = (title, message, label, placeholder, suggestions = []) => {
    return new Promise(resolve => {
        // Mapeia todos os elementos do DOM necessários para o diálogo
        const overlay = document.getElementById('inputDialogOverlay');
        const titleEl = document.getElementById('inputDialogTitle');
        const messageEl = document.getElementById('inputDialogMessage');
        const labelEl = document.getElementById('inputDialogLabel');
        const fieldEl = document.getElementById('inputDialogField');
        const btnConfirm = document.getElementById('inputBtnConfirm');
        const btnCancel = document.getElementById('inputBtnCancel');
        const suggestionsContainer = document.getElementById('inputDialogSuggestions');

        // Garante que todos os elementos existem antes de continuar para evitar erros
        if (!overlay || !titleEl || !messageEl || !labelEl || !fieldEl || !btnConfirm || !btnCancel || !suggestionsContainer) {
            console.error("Elementos do pop-up de input não foram encontrados no HTML.");
            resolve(null); // Resolve como nulo para não travar a aplicação
            return;
        }

        // Limpa o conteúdo de interações anteriores
        suggestionsContainer.innerHTML = '';
        fieldEl.value = '';

        // Preenche os textos do diálogo com os parâmetros recebidos
        titleEl.textContent = title;
        messageEl.textContent = message;
        labelEl.textContent = label;
        fieldEl.placeholder = placeholder;
        
        // Função centralizada para fechar o diálogo e resolver a Promise
        const closeDialog = (result) => {
            overlay.style.display = 'none';
            // Remove os event listeners para evitar chamadas duplicadas em futuras aberturas
            btnConfirm.onclick = null;
            btnCancel.onclick = null;
            resolve(result);
        };

        // Cria e adiciona os botões de sugestão, se houver sugestões
        if (suggestions && suggestions.length > 0) {
            suggestions.forEach(suggestionText => {
                const suggestionBtn = document.createElement('button');
                suggestionBtn.className = 'btn btn-secondary hover:bg-purple-600 dark:hover:bg-purple-700 w-full text-left justify-start';
                suggestionBtn.textContent = suggestionText;
                // Ao clicar em um botão de sugestão, fecha o diálogo e retorna o texto da sugestão
                suggestionBtn.onclick = () => {
                    closeDialog(suggestionText);
                };
                suggestionsContainer.appendChild(suggestionBtn);
            });
        }

        // Configura o botão de confirmação (para o texto personalizado)
        btnConfirm.onclick = () => {
            const customText = fieldEl.value.trim();
            if (customText) {
                // Se o usuário digitou algo, fecha o diálogo e retorna o texto digitado
                closeDialog(customText);
            } else {
                // Se o campo estiver vazio, avisa o usuário
                window.showToast("Por favor, digite um tema ou escolha uma das sugestões.", 'info');
            }
        };

        // Configura o botão de cancelar
        btnCancel.onclick = () => closeDialog(null);

        // Exibe o diálogo
        overlay.style.display = 'flex';
        fieldEl.focus(); // Coloca o foco no campo de texto para facilitar a digitação
    });
};



// =========================================================================
// >>>>> VERSÃO FINAL DE updateAllReadingTimes COM O SELETOR CORRIGIDO <<<<<
// =========================================================================
/**
 * Percorre todas as seções de roteiro geradas e atualiza o tempo de leitura exibido.
 */
const updateAllReadingTimes = () => {
    // Pega todas as seções de roteiro que já foram geradas
    const scriptSections = document.querySelectorAll('#scriptSectionsContainer .accordion-item');
    
    scriptSections.forEach(item => {
        const contentWrapper = item.querySelector('.generated-content-wrapper');
        
        // >>>>> A CORREÇÃO ESTÁ AQUI: Trocamos '.header-content' por '.header-title-group' <<<<<
        const timeDisplay = item.querySelector('.header-title-group .text-xs');

        if (contentWrapper && timeDisplay) {
            // Recalcula o tempo de leitura com base no conteúdo atualizado
            const newTime = calculateReadingTime(contentWrapper.textContent);
            // Atualiza o texto do elemento span com o novo tempo
            timeDisplay.textContent = newTime;
        }
    });
}


    // ==========================================================
// >>>>> SUBSTITUA A FUNÇÃO validateInputs INTEIRA POR ESTA <<<<<
// ==========================================================
const validateInputs = () => {
    const channelName = document.getElementById('channelName')?.value.trim();
    const videoTheme = document.getElementById('videoTheme')?.value.trim();
    const videoDescription = document.getElementById('videoDescription')?.value.trim();
    const videoDuration = document.getElementById('videoDuration')?.value;
    // Adicionamos a leitura do novo campo
    const visualPacing = document.getElementById('visualPacing')?.value;

    if (!channelName) {
        window.showToast("Por favor, insira o nome do canal.", 'error');
        return false;
    }
    if (!videoTheme) {
        window.showToast("Por favor, insira o tema do vídeo.", 'error');
        return false;
    }
    if (!videoDescription) {
        window.showToast("Por favor, insira a descrição do vídeo (para inspiração).", 'error');
        return false;
    }
    if (!videoDuration || videoDuration === "") {
        window.showToast("Por favor, selecione a Duração Desejada do vídeo.", 'error');
        return false;
    }
    
    if (!visualPacing || visualPacing === "") {
        window.showToast("Por favor, selecione o Ritmo Visual do vídeo.", 'error');
        return false;
    }
    
    return true;
};




        /**
         * Exibe uma caixa de diálogo de confirmação e aguarda a resposta do usuário.
         * @param {string} title - O título da caixa de diálogo.
         * @param {string} message - A mensagem de confirmação.
         * @returns {Promise<boolean>} - Retorna true se o usuário clicar "Sim", false caso contrário.
         */
        const showConfirmationDialog = (title, message) => {
            return new Promise(resolve => {
                const overlay = document.getElementById('confirmationDialogOverlay');
                const titleEl = document.getElementById('confirmationTitle');
                const messageEl = document.getElementById('confirmationMessage');
                const btnYes = document.getElementById('confirmBtnYes');
                const btnNo = document.getElementById('confirmBtnNo');

                // Garante que todos os elementos existem antes de continuar
                if (!overlay || !titleEl || !messageEl || !btnYes || !btnNo) {
                    console.error("Elementos do pop-up de confirmação não foram encontrados no HTML.");
                    resolve(false); // Resolve como 'false' para não travar a aplicação
                    return;
                }

                titleEl.textContent = title;
                messageEl.textContent = message;
                overlay.style.display = 'flex';

                // Função para limpar e fechar o diálogo
                const closeDialog = (result) => {
                    overlay.style.display = 'none';
                    // Remove os listeners para evitar chamadas duplicadas
                    clonedBtnYes.replaceWith(btnYes);
                    clonedBtnNo.replaceWith(btnNo);
                    resolve(result);
                };

                // TRUQUE PARA GARANTIR LISTENERS LIMPOS:
                // Clonamos os botões para remover quaisquer event listeners antigos
                const clonedBtnYes = btnYes.cloneNode(true);
                const clonedBtnNo = btnNo.cloneNode(true);

                // Adicionamos os novos listeners aos clones
                clonedBtnYes.addEventListener('click', () => closeDialog(true));
                clonedBtnNo.addEventListener('click', () => closeDialog(false));

                // Substituímos os botões originais pelos clones com os novos listeners
                btnYes.replaceWith(clonedBtnYes);
                btnNo.replaceWith(clonedBtnNo);
            });
        };

        /**
         * Compara um texto gerado pela IA (com anotações) com o texto original
         * para garantir que o conteúdo não foi alterado.
         * @param {string} originalText - O texto base.
         * @param {string} annotatedText - O texto com anotações gerado pela IA.
         * @returns {{isValid: boolean, cleanTextFromAI: string}} - Retorna se é válido e o texto da IA sem anotações.
         */
        const auditGeneratedText = (originalText, annotatedText) => {
            // Remove todas as anotações [em colchetes] do texto da IA
            const cleanTextFromAI = annotatedText.replace(/\[.*?\]/g, '').trim();
            
            // Remove múltiplos espaços e quebras de linha para uma comparação mais justa
            const normalizedOriginal = originalText.replace(/\s+/g, ' ').trim();
            const normalizedCleanAI = cleanTextFromAI.replace(/\s+/g, ' ').trim();

            // Compara os dois textos normalizados
            const isValid = normalizedOriginal === normalizedCleanAI;
            
            return { isValid, cleanTextFromAI };
        };


        /**
         * Copia um texto para a área de transferência.
         * @param {string} text - O texto a ser copiado.
         */
        window.copyTextToClipboard = async (text) => {
            try {
                await navigator.clipboard.writeText(text);
                window.showToast('Copiado!', 'success');
            } catch (err) {
                // Fallback para navegadores mais antigos ou contextos restritos (ex: iframes)
                const ta = document.createElement('textarea');
                ta.value = text;
                ta.style.position = 'fixed';
                ta.style.opacity = '0';
                document.body.appendChild(ta);
                ta.focus();
                ta.select();
                try {
                    document.execCommand('copy');
                    window.showToast('Copiado!', 'success');
                } finally {
                    document.body.removeChild(ta);
                }
            }
        };

        /**
         * Fornece feedback visual em um botão após uma ação de cópia.
         * @param {HTMLElement} buttonElement - O elemento do botão que foi clicado.
         */
        window.showCopyFeedback = (buttonElement) => {
            const originalText = buttonElement.innerHTML;
            buttonElement.innerHTML = 'Copiado!';
            buttonElement.classList.add('btn-success');
            buttonElement.disabled = true; // Desabilita o botão temporariamente

            setTimeout(() => {
                buttonElement.innerHTML = originalText;
                buttonElement.classList.remove('btn-success');
                buttonElement.disabled = false;
            }, 2000); // Reverte após 2 segundos
        };



        // ==========================================================
        // >>>>> ADICIONE ESTE NOVO BLOCO <<<<<
        // ==========================================================
        /**
         * Mostra um spinner de carregamento em QUALQUER botão, salvando seu conteúdo original.
         * @param {HTMLElement} button - O elemento do botão a ser modificado.
         */
        const showButtonLoading = (button) => {
            if (!button) return;
            // Salva o HTML original do botão (incluindo ícones e texto)
            button.setAttribute('data-original-html', button.innerHTML);
            button.disabled = true;
            // Define o spinner como o novo conteúdo.
            button.innerHTML = '<div class="loading-spinner" style="width:18px; height:18px; border-width: 2px;"></div>';
        };

        /**
         * Esconde o spinner de carregamento de um botão, restaurando seu conteúdo original.
         * @param {HTMLElement} button - O elemento do botão a ser restaurado.
         */
        const hideButtonLoading = (button) => {
            if (!button) return;
            // Restaura o HTML original que salvamos
            if (button.hasAttribute('data-original-html')) {
                button.innerHTML = button.getAttribute('data-original-html');
                button.removeAttribute('data-original-html');
            }
            button.disabled = false;
        };

        /**
         * Marca um botão (original e flutuante) como concluído (cor verde).
         * @param {string} originalId - O ID do botão original.
         */
        const markButtonAsCompleted = (originalId) => {
            const originalButton = document.getElementById(originalId);
            const floatButton = document.getElementById(`float_${originalId}`);

            [originalButton, floatButton].forEach(btn => {
                if (btn) {
                    btn.classList.remove('btn-primary', 'btn-secondary');
                    btn.classList.add('btn-success');
                }
            });
            updateProgressBar(); 
        };



        /**
         * Reseta os ícones de conclusão de todos os botões (original e flutuante) para suas cores padrão.
         */
        const resetCompletionIcons = () => {
            const passo1_buttons_ids = ['generateIntroBtn', 'generateDevelopmentBtn', 'climaxBtn', 'conclusionBtn', 'generateCTABtn'];
            
            for (const buttonId in buttons) { // Iterar sobre todos os botões
                const isPasso1 = passo1_buttons_ids.includes(buttonId);
                const originalButton = document.getElementById(buttonId);
                const floatButton = document.getElementById(`float_${buttonId}`);

                // Remove a classe de sucesso e adiciona a classe correta (primary/secondary)
                [originalButton, floatButton].forEach(btn => {
                    if (btn) {
                        btn.classList.remove('btn-success');
                        if (isPasso1) {
                            btn.classList.remove('btn-secondary');
                            btn.classList.add('btn-primary');
                        } else {
                            btn.classList.remove('btn-primary');
                            btn.classList.add('btn-secondary');
                        }
                    }
                });
            }
        };
        
/**
 * Verifica se as seções principais do roteiro foram geradas.
 * @returns {boolean} True se todas as seções principais foram geradas, caso contrário, false.
 */
const isScriptComplete = () => {
    // Esta versão lê diretamente do nosso "painel de controle" de estado,
    // que é muito mais confiável do que verificar o HTML.
    return projectState.intro && projectState.development && projectState.climax && projectState.conclusion && projectState.cta;
};




// =========================================================================
// >>>>> VERSÃO FINAL E CORRIGIDA de 'updateButtonStates' (lógica estável) <<<<<
// =========================================================================
const updateButtonStates = () => {
    const script = AppState.generated.script;

    // Define os estados chave da geração do roteiro
    const allMainScriptGenerated = !!script.intro.text && !!script.development.text && !!script.climax.text;
    const isConclusionGenerated = !!script.conclusion.text;
    const isCtaGenerated = !!script.cta.text;
    const isFullScriptGenerated = allMainScriptGenerated && isConclusionGenerated && isCtaGenerated;

    // Habilita/desabilita botões de metadados
    const metadataButtons = ['generateTitlesAndThumbnailsBtn', 'generateDescriptionBtn', 'generateSoundtrackBtn', 'mapEmotionsBtn'];
    metadataButtons.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.disabled = !allMainScriptGenerated;
        }
    });

    // <<< A CORREÇÃO CRÍTICA ESTÁ AQUI >>>
    const conclusionModule = document.getElementById('conclusionStrategyModule');
    if (conclusionModule) {
        // A NOVA REGRA: O módulo aparece assim que o roteiro principal estiver pronto e FICA LÁ.
        const shouldShowConclusionModule = allMainScriptGenerated;
        conclusionModule.classList.toggle('hidden', !shouldShowConclusionModule);

        // A lógica interna de qual botão (Conclusão ou CTA) aparece continua a mesma.
        const btnGenerateConclusion = document.getElementById('generateConclusionBtn');
        const btnGenerateCta = document.getElementById('generateCtaBtn');
        if (btnGenerateConclusion && btnGenerateCta) {
            btnGenerateConclusion.classList.toggle('hidden', isConclusionGenerated);
            btnGenerateCta.classList.toggle('hidden', !isConclusionGenerated);
        }
    }
    
    // Mostra/esconde a seção de análise quando TUDO estiver pronto
    const analysisSection = document.getElementById('scriptAnalysisSection');
    if (analysisSection) {
        analysisSection.classList.toggle('hidden', !isFullScriptGenerated);
    }

  
};



// =========================================================================
// >>>>> VERSÃO REATORADA E EFICIENTE de 'getTranscriptOnly' <<<<<
// =========================================================================
/**
 * Coleta e concatena o texto puro de todas as seções do roteiro na ordem correta,
 * lendo diretamente do estado centralizado (AppState).
 * @returns {string} A transcrição completa e limpa.
 */
const getTranscriptOnly = () => {
    let transcript = '';
    const sectionOrder = ['intro', 'development', 'climax', 'conclusion', 'cta'];
    
    sectionOrder.forEach(sectionName => {
        // Lê o texto da seção diretamente do "cérebro" da aplicação
        const scriptSection = AppState.generated.script[sectionName];
        if (scriptSection && scriptSection.text) {
            transcript += scriptSection.text.trim() + '\n\n';
        }
    });
    
    return transcript.trim();
};



    
        /**
         * Calcula o tempo de leitura estimado de um texto, considerando o ritmo de fala.
         */
        const calculateReadingTime = (text) => {
            if (!text) return "";

            const paceMap = {
                slow: 120,
                moderate: 150,
                fast: 180
            };
            
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

    // ==========================================================
        // ==================== LÓGICA DAS ABAS =====================
        // ==========================================================
        const setupTabs = () => {
            const tabButtons = document.querySelectorAll('#tabs .tab-button');
            const tabPanes = document.querySelectorAll('#tab-content .tab-pane');

            tabButtons.forEach(button => {
                button.addEventListener('click', () => {
                    tabButtons.forEach(btn => btn.classList.remove('active-tab'));
                    tabPanes.forEach(pane => pane.classList.remove('active-pane'));

                    button.classList.add('active-tab');
                    const tabId = button.getAttribute('data-tab');
                    const activePane = document.getElementById(tabId);
                    if (activePane) {
                        activePane.classList.add('active-pane');
                    }
                });
            });
        };



// ==========================================================
// >>>>> NOVA FUNÇÃO AUXILIAR PARA GERAR PROMPTS SILENCIOSAMENTE <<<<<
// ==========================================================
/**
 * Gera prompts para uma seção em segundo plano, sem atualizar a UI do acordeão.
 * Apenas chama a API e atualiza o AppState.
 * @param {string} sectionElementId - O ID da seção (ex: 'introSection').
 * @returns {Promise<void>}
 */
const generatePromptsForSectionInBackground = async (sectionElementId) => {
    const sectionId = sectionElementId.replace('Section', '');
    const sectionScript = AppState.generated.script[sectionId];
    if (!sectionScript || !sectionScript.text) return;

    console.log(`Gerando prompts em segundo plano para: ${sectionElementId}`);
    
    // A lógica interna é uma cópia simplificada da função principal
    const paragraphsWithContext = sectionScript.text.split('\n\n')
        .filter(p => p.trim() !== '')
        .map(p => ({ text: p.trim().replace(/\[.*?\]/g, ''), chapter: "Contexto Geral" }));

    if (paragraphsWithContext.length === 0) return;

    const visualPacing = document.getElementById('visualPacing').value;
    const durationMap = { 'dinamico': '3 e 8', 'normal': '8 e 15', 'contemplativo': '15 e 25' };
    const durationRange = durationMap[visualPacing] || '3 e 8';
    
    let promptContextForAI = '';
    paragraphsWithContext.forEach((item, index) => {
        promptContextForAI += `\nParágrafo ${index}:\n- Texto do Parágrafo: "${item.text}"`;
    });

    const prompt = `# INSTRUÇÕES... (seu prompt de geração de imagem continua aqui, sem alterações)... ## AÇÃO FINAL... gere ${paragraphsWithContext.length} objetos JSON...`;
    
    const rawResult = await callGroqAPI(prompt, 4000);
    const generatedPrompts = cleanGeneratedText(rawResult, true, true);
    
    if (!Array.isArray(generatedPrompts) || generatedPrompts.length < paragraphsWithContext.length) {
        console.error(`Falha ao gerar prompts em segundo plano para ${sectionElementId}`);
        return;
    }

    const curatedPrompts = generatedPrompts.map((promptData, index) => ({
        scriptPhrase: paragraphsWithContext[index].text,
        imageDescription: promptData.imageDescription || "Falha ao gerar descrição.",
        estimated_duration: promptData.estimated_duration || 5
    }));

    const applyCinematicStyle = document.getElementById('imageStyleSelect').value === 'cinematic';
    AppState.generated.imagePrompts[sectionElementId] = curatedPrompts.map(p => ({
        ...p,
        applyStyleBlock: applyCinematicStyle
    }));
};



// ====================================================================================
// >>>>> VERSÃO FINAL 5.1: BLINDADA CONTRA ESTADOS ANTIGOS E COM PROMPT REFORÇADO <<<<<
// ====================================================================================
const mapEmotionsAndPacing = async (button) => {
    const { script } = AppState.generated;

    const isScriptReady = script.intro.text && script.development.text && script.climax.text;
    if (!isScriptReady) {
        window.showToast("Gere pelo menos a Introdução, Desenvolvimento e Clímax primeiro.", 'info');
        return;
    }

    const outputContainer = document.getElementById('emotionalMapContent');
    showButtonLoading(button);
    outputContainer.innerHTML = `<div class="loading-spinner-small mx-auto my-4"></div> <p class="text-center text-sm">Analisando a jornada emocional do roteiro...</p>`;

    try {
        // Força a re-geração do mapa emocional sempre que o botão é clicado.
        // Isso garante que ele sempre use o texto mais recente e evite erros de estado antigo.
        AppState.generated.emotionalMap = null; 
        
        const fullTranscript = getTranscriptOnly();
        const paragraphs = fullTranscript.split('\n\n').filter(p => p.trim() !== '');


// ==========================================================
// >>>>> PROMPT TRADUZIDO PARA PORTUGUÊS-BRASIL <<<<<
// ==========================================================
const prompt = `Sua única função é retornar um array JSON. Para cada um dos ${paragraphs.length} parágrafos a seguir, analise e retorne a emoção principal e o ritmo.
        
**REGRAS CRÍTICAS E INEGOCIÁVEIS:**
1.  Sua resposta deve ser APENAS o array JSON, começando com \`[\` e terminando com \`]\`. NENHUM outro texto é permitido.
2.  O array deve conter EXATAMENTE ${paragraphs.length} objetos.
3.  Cada objeto deve ter EXATAMENTE duas chaves: "emotion" e "pace".
4.  Valores permitidos para "emotion": 'Positiva Forte', 'Positiva Leve', 'Neutra', 'Negativa Leve', 'Negativa Forte'.
5.  Valores permitidos para "pace": 'Muito Rápido', 'Rápido', 'Médio', 'Lento', 'Muito Lento'.

**TEXTO PARA ANÁLISE:**
---
${JSON.stringify(paragraphs)}
---

AÇÃO: Retorne APENAS o array JSON, usando os termos em Português do Brasil para os valores.`;

        const rawResult = await callGroqAPI(prompt, 4000);
        const emotionalMapData = cleanGeneratedText(rawResult, true, true); // Espera um array

        if (!emotionalMapData || !Array.isArray(emotionalMapData) || emotionalMapData.length === 0) {
            throw new Error("A IA não retornou um mapa emocional válido.");
        }
        AppState.generated.emotionalMap = emotionalMapData;
        
        // O resto da lógica de renderização continua a mesma, pois já está correta.
        outputContainer.innerHTML = '';
        let paragraphCounter = 0;

        const sectionOrder = [
            { id: 'intro', title: 'Introdução' },
            { id: 'development', title: 'Desenvolvimento' },
            { id: 'climax', title: 'Clímax' },
            { id: 'conclusion', title: 'Conclusão' },
            { id: 'cta', title: 'Call to Action (CTA)' }
        ];

const emotionGroups = {
    'Positiva': ['Positiva Forte', 'Positiva Leve', 'strongly_positive', 'slightly_positive', 'happy', 'excited'],
    'Negativa': ['Negativa Forte', 'Negativa Leve', 'strongly_negative', 'slightly_negative', 'sad', 'angry', 'fearful'],
    'Neutra': ['Neutra', 'neutral', 'surprised']
};

const paceGroups = {
    'Rápido': ['Muito Rápido', 'Rápido', 'very_fast', 'fast'],
    'Médio': ['Médio', 'medium', 'moderate'],
    'Lento': ['Muito Lento', 'Lento', 'very_slow', 'slow']
};

const getGroupName = (value, groups) => {
    // Primeiro, tentamos encontrar o valor nos grupos.
    for (const groupName in groups) {
        if (groups[groupName].includes(value)) {
            return groupName;
        }
    }
    // Se não encontrar (caso raro), apenas capitaliza a primeira letra e retorna.
    return value.charAt(0).toUpperCase() + value.slice(1);
};

        sectionOrder.forEach(section => {
            const sectionScript = script[section.id];
            if (!sectionScript || !sectionScript.text) return;

            const numParagraphs = sectionScript.text.split('\n\n').filter(p => p.trim() !== '').length;
            const sectionEmotionsData = AppState.generated.emotionalMap.slice(paragraphCounter, paragraphCounter + numParagraphs);
            
            const groupedEmotions = [...new Set(sectionEmotionsData.map(e => getGroupName(e.emotion, emotionGroups)))];
            const groupedPaces = [...new Set(sectionEmotionsData.map(e => getGroupName(e.pace, paceGroups)))];

            const tagsHtml = groupedEmotions.map(emotion => 
                `<span class="tag tag-emotion"><i class="fas fa-theater-masks mr-2"></i>${DOMPurify.sanitize(emotion)}</span>`
            ).join('') + groupedPaces.map(pace => 
                `<span class="tag tag-pace"><i class="fas fa-tachometer-alt mr-2"></i>${DOMPurify.sanitize(pace)}</span>`
            ).join('');

            const sectionCardHtml = `
            <div class="emotional-map-item card !p-6 mb-6 animate-fade-in">
                <div class="flex justify-between items-center mb-3">
                    <h2 class="text-xl font-bold">${section.title}</h2>
                    <button class="text-gray-400 hover:text-primary transition-colors"
                            onclick="window.copyTextToClipboard(this.nextElementSibling.textContent); window.showCopyFeedback(this);"
                            title="Copiar Texto Completo da Seção">
                        <i class="fas fa-copy fa-lg"></i>
                    </button>
                    <pre class="full-prompt-hidden hidden">${DOMPurify.sanitize(sectionScript.text)}</pre>
                </div>
                <div class="prompt-header mb-4">
                    ${tagsHtml || '<span class="text-sm italic text-gray-500">Nenhuma emoção analisada.</span>'}
                </div>
                <div class="text-base leading-relaxed">
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




// ====================================================================================
// >>>>> SUBSTITUA SUA FUNÇÃO generateSoundtrack INTEIRA POR ESTA VERSÃO FINAL <<<<<
// ====================================================================================

/**
 * Acionada pelo botão "Gerar Trilha Sonora".
 * Analisa o roteiro completo e usa um prompt especialista para gerar 3 sugestões
 * de prompts musicais detalhados para IAs de geração de áudio.
 */
const generateSoundtrack = async (button) => {
    const fullTranscript = getTranscriptOnly();
    if (!fullTranscript) {
        window.showToast("Gere o roteiro completo primeiro para sugerir uma trilha sonora coerente.");
        return;
    }

    const outputContainer = document.getElementById('soundtrackContent');
    showButtonLoading(button);
    outputContainer.innerHTML = `<div class="loading-spinner-small mx-auto my-4"></div>`;

    // O seu novo e espetacular cérebro especialista em Trilha Sonora.
    const prompt = `Você é uma API ESPECIALISTA EM CRIAÇÃO DE PROMPTS PARA IAs DE GERAÇÃO DE TRILHAS SONORAS CINEMATOGRÁFICAS. Sua função ÚNICA E CRÍTICA é analisar um roteiro e gerar 3 PARÁGRAFOS DESCRITIVOS que sirvam como prompts ricos para a criação de uma trilha sonora que complemente perfeitamente o tom e a emoção do vídeo.

**IDENTIDADE E ESPECIALIZAÇÃO (A REGRA MAIS IMPORTANTE):**
Você é o ESPECIALISTA ABSOLUTO em traduzir narrativa em descrições sonoras precisas e evocativas. Sua função é ser a PONTE entre o roteiro e a composição musical.

**ROTEIRO COMPLETO PARA ANÁLISE MUSICAL:**
---
${fullTranscript}
---

**REGRAS CRÍTICAS DE SINTAXE E ESTRUTURA JSON (INEGOCIÁVEIS):**
1.  **JSON PURO E PERFEITO:** Sua resposta deve ser APENAS um array JSON válido, começando com \`[\` e terminando com \`]\`.
2.  **ESTRUTURA DO ARRAY:** O array deve conter EXATAMENTE 3 strings.
3.  **SINTAXE DAS STRINGS:** Todas as strings DEVEM usar aspas duplas (""). Cada string, EXCETO a última, DEVE ser seguida por uma vírgula (,).

**MANUAL DE CRIAÇÃO DE PROMPTS MUSICAIS (SIGA EXATAMENTE):**
- **Foco na Emoção e Cena:** Cada parágrafo deve descrever uma atmosfera sonora para uma fase da narrativa (ex: introdução, clímax, conclusão).
- **Elementos Descritivos Essenciais:** Cada string deve incluir:
    1.  **Instrumentação Principal:** (Ex: "piano solo", "orquestra completa").
    2.  **Qualidade Sonora/Textura:** (Ex: "melodia suave", "ritmo acelerado").
    3.  **Atmosfera/Emoção Alvo:** (Ex: "atmosfera de mistério", "senso de urgência").
- **Conectividade:** Juntos, os 3 prompts devem cobrir um arco sonoro coerente com a jornada do roteiro.

**EXEMPLO DE FORMATO PERFEITO E OBRIGATÓRIO:**
[
  "Uma melodia suave e contemplativa tocada por um piano minimalista, criando uma atmosfera de introspecção.",
  "Ritmo acelerado e pulsante com percussão eletrônica, construindo tensão crescente.",
  "Uma orquestração épica e emocional com cordas expansivas, evocando realização e alívio."
]

**RESTRIÇÕES ESTRATÉGICAS ABSOLUTAS:**
- **NENHUMA DESCRIÇÃO GENÉRICA:** Seja específico sobre instrumentos, texturas e emoções.
- **NENHUMA MENÇÃO A NOMES DE MÚSICAS OU ARTISTAS.**
- **RESPEITO AO CONTEXTO NARRATIVO:** As sugestões DEVEM estar alinhadas com o tom do roteiro.

**AÇÃO FINAL:** Analise AGORA o roteiro. Gere o array JSON com os 3 prompts de trilha sonora mais descritivos e alinhados com a narrativa. Responda APENAS com o array JSON perfeito.`;

    try {
        const rawResult = await callGroqAPI(prompt, 1500);
        const analysis = cleanGeneratedText(rawResult, true);

        if (!analysis || !Array.isArray(analysis) || analysis.length === 0) {
            throw new Error("A IA não retornou sugestões no formato esperado.");
        }

        let suggestionsHtml = '<ul class="soundtrack-list space-y-2">';
        analysis.forEach(suggestion => {
            // Garante que a sugestão seja uma string antes de tentar sanitizar
            if(typeof suggestion === 'string') {
                suggestionsHtml += `<li>${DOMPurify.sanitize(suggestion)}</li>`;
            }
        });
        suggestionsHtml += '</ul>';
        
        outputContainer.innerHTML = `<div class="generated-output-box">${suggestionsHtml}</div>`;
        markButtonAsCompleted(button.id);

    } catch (error) {
        console.error("Erro detalhado em generateSoundtrack:", error);
        outputContainer.innerHTML = `<p class="text-red-500 text-sm">Falha ao gerar sugestões: ${error.message}</p>`;
    } finally {
        hideButtonLoading(button);
    }
};


// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// >>>>> VERSÃO FINAL E MODERNIZADA de 'generateConclusion' (Usa AppState) <<<<<
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

const generateConclusion = async (button) => {
    // Validação inicial
    if (!validateInputs()) return;
    showButtonLoading(button);

    // Garante que o container da seção exista no DOM
    const scriptContainer = document.getElementById('scriptSectionsContainer');
    let conclusionContainer = document.getElementById('conclusionSection');
    if (scriptContainer && !conclusionContainer) {
        conclusionContainer = document.createElement('div');
        conclusionContainer.id = 'conclusionSection';
        conclusionContainer.classList.add('script-section');
        scriptContainer.appendChild(conclusionContainer);
    }

    // Coleta as diretrizes da UI
    const conclusionType = document.querySelector('input[name="conclusionType"]:checked').value;
    const conclusionSpecifics = document.getElementById('conclusionSpecifics').value.trim();
    const centralQuestion = document.getElementById('centralQuestion')?.value.trim() || 'a pergunta central do vídeo';
    
    // Monta a diretiva estratégica para o prompt
    let strategyDirective = '';
    switch (conclusionType) {
        case 'lesson':
            strategyDirective = `O objetivo é reforçar uma lição ou reflexão central e memorável. Detalhe do usuário: '${conclusionSpecifics || 'Nenhum'}'. A lição deve soar como a conclusão natural e impactante da jornada.`;
            break;
        case 'answer':
            strategyDirective = `O objetivo é responder de forma clara e satisfatória à pergunta central ('${centralQuestion}'). Detalhe do usuário: '${conclusionSpecifics || 'Nenhum'}'. A resposta deve ser a revelação que o espectador aguardava.`;
            break;
        case 'cliffhanger':
            strategyDirective = `O objetivo é criar um gancho ou mistério que justifique o próximo vídeo. Detalhe do usuário: '${conclusionSpecifics || 'Nenhum'}'. O final deve deixar o espectador ansioso pelo que vem a seguir.`;
            break;
    }

    const fullContext = getTranscriptOnly(); // Esta função já usa AppState
    const basePromptContext = getBasePromptContext();

    // O prompt foi refinado para ser mais claro e direto
    const prompt = `${basePromptContext}

# TAREFA
Você é um especialista em conclusões narrativas impactantes. Sua missão é escrever o texto da conclusão para o vídeo, estruturado em parágrafos coesos e bem desenvolvidos.

# CONTEXTO
## Roteiro existente:
---
${fullContext}
---

# DIRETRIZ ESTRATÉGICA
${strategyDirective}

# REGRAS ESSENCIAIS
1. **FORMATO**: Responda APENAS com o texto narrativo. Separe os parágrafos com uma quebra de linha dupla.
   - Proibido: títulos, cabeçalhos, anotações como "Narrador:", "(Cena: ...)", etc.
   - Proibido: incluir qualquer Call to Action (CTA).
2. **QUALIDADE DOS PARÁGRAFOS**: Cada parágrafo deve agrupar uma ideia completa (idealmente de 4 a 6 frases). Evite a fragmentação excessiva.
3. **CONTINUIDADE**: A conclusão deve fluir naturalmente do conteúdo anterior.
4. **IMPACTO**: A conclusão deve ser memorável e alinhada com a estratégia.

Escreva agora o texto puro da conclusão, seguindo a estrutura de parágrafos bem desenvolvidos.`;

    try {
        const rawResult = await callGroqAPI(prompt, 3000);
        const content = removeMetaComments(rawResult.trim());

        if (!content) {
            throw new Error("A IA não retornou um conteúdo válido para a conclusão.");
        }
        
        const paragraphs = content.split('\n').filter(p => p.trim() !== '');
        const contentWithSpans = paragraphs.map((p, index) => `<div id="conclusion-p-${index}">${DOMPurify.sanitize(p)}</div>`).join('');
        const fullText = paragraphs.join('\n\n');

        // <<< CORREÇÃO CRÍTICA AQUI: Atualiza o AppState, não o projectState >>>
        AppState.generated.script.conclusion = {
            html: contentWithSpans,
            text: fullText
        };
        console.log("Estado para 'conclusion' atualizado no AppState.");
        
        const conclusionElement = generateSectionHtmlContent('conclusion', 'Conclusão', contentWithSpans);
        
        conclusionContainer.innerHTML = '';
        conclusionContainer.appendChild(conclusionElement);
        
        // Atualiza a UI para refletir o estado de "concluído"
        document.querySelectorAll('input[name="conclusionType"]').forEach(radio => radio.disabled = true);
        document.getElementById('conclusionSpecifics').disabled = true;
        document.querySelector('#conclusionInputContainer').classList.add('opacity-50');
        
        button.classList.add('hidden');
        document.getElementById('generateCtaBtn').classList.remove('hidden');

        window.showToast("Conclusão gerada! Agora, vamos ao CTA.", 'success');
        
    } catch (error) {
        console.error("Erro detalhado em generateConclusion:", error);
        window.showToast(`Falha ao gerar a conclusão: ${error.message}`);
    } finally {
        hideButtonLoading(button);
        updateButtonStates(); // Atualiza a UI geral
    }
};



// =================================================================================
// >>>>> VERSÃO FINAL E PADRONIZADA de 'generateStrategicCta' <<<<<
// =================================================================================
const generateStrategicCta = async (button) => {
    showButtonLoading(button);

    const scriptContainer = document.getElementById('scriptSectionsContainer');
    let ctaSection = document.getElementById('ctaSection');
    if (scriptContainer && !ctaSection) {
        ctaSection = document.createElement('div');
        ctaSection.id = 'ctaSection';
        ctaSection.classList.add('script-section');
        scriptContainer.appendChild(ctaSection);
    }

    const ctaSpecifics = document.getElementById('ctaSpecifics').value.trim();
    const fullContext = getTranscriptOnly();
    const basePromptContext = getBasePromptContext();

    let ctaDirective = "Crie um Call to Action (CTA) genérico, convidando o espectador a curtir, comentar e se inscrever, mas que seja perfeitamente alinhado ao tom do vídeo.";
    if (ctaSpecifics) {
        ctaDirective = `Crie um Call to Action (CTA) altamente específico e persuasivo. Instrução do usuário: "${ctaSpecifics}". Conecte esta instrução ao tema geral do vídeo de forma natural e convincente.`;
    }

    // <<< A EVOLUÇÃO ESTÁ AQUI, NO PROMPT >>>
    const prompt = `${basePromptContext}

# TAREFA
Você é um especialista em criar Call to Action (CTA) estratégicos e persuasivos. Sua missão é escrever o texto do CTA para o final do vídeo, estruturado em um ou mais parágrafos coesos.

# CONTEXTO
## Roteiro completo:
---
${fullContext}
---

# DIRETRIZ ESTRATÉGICA
${ctaDirective}

# REGRAS ESSENCIAIS
1. **FORMATO**: Responda APENAS com o texto narrativo. Separe os parágrafos com uma quebra de linha dupla, se houver mais de um.
   - Proibido: rótulos como "Narrador:", descrições de cena, títulos, etc.
2. **QUALIDADE DO PARÁGRAFO**: O CTA deve ser um parágrafo coeso e bem formulado, contendo idealmente de 3 a 5 frases claras e motivadoras. O objetivo é ser direto e impactante, **evitando fragmentos de uma única linha.**
3. **CONTINUIDADE**: O CTA deve soar como uma conclusão natural e integrada ao vídeo.
4. **CONSISTÊNCIA**: Mantenha o mesmo tom e estilo do roteiro.

Escreva agora o texto puro para o Call to Action, garantindo que seja bem estruturado.`;

    try {
        let result = await callGroqAPI(prompt, 400);
        result = removeMetaComments(result.trim());
        const paragraphs = result.split('\n').filter(p => p.trim() !== '');
        const contentWithSpans = paragraphs.map((p, index) => `<div id="cta-p-${index}">${DOMPurify.sanitize(p)}</div>`).join('');
        const fullText = paragraphs.join('\n\n');

        AppState.generated.script.cta = {
            html: contentWithSpans,
            text: fullText
        };
        console.log("Estado para 'cta' atualizado no AppState.");

        const ctaElement = generateSectionHtmlContent('cta', 'Call to Action (CTA)', contentWithSpans);
        ctaSection.innerHTML = '';
        ctaSection.appendChild(ctaElement);
        ctaSection.classList.remove('hidden');
        
        const ctaSpecificsElement = document.getElementById('ctaSpecifics');
        ctaSpecificsElement.disabled = true;
        ctaSpecificsElement.parentElement.classList.add('opacity-50');
        
        window.showToast("Roteiro finalizado! Seção de Análise liberada.", 'success');
        
        const analysisSection = document.getElementById('scriptAnalysisSection');
        if (analysisSection) {
            analysisSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

    } catch(error) {
        console.error("Erro detalhado em generateStrategicCta:", error);
        window.showToast(`Falha ao gerar o CTA: ${error.message}`);
    } finally {
        hideButtonLoading(button);
        updateButtonStates();
    }
};



    // ==========================================================
        // NOVA FUNÇÃO PARA ATUALIZAR A BARRA DE PROGRESO
        // ==========================================================
            const updateProgressBar = () => {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    if (!progressFill || !progressText) return;

    const taskButtonIds = [
        'analyzeStrategyBtn',
        'generateOutlineBtn',
        'generateIntroBtn',
        'generateDevelopmentBtn',
        'climaxBtn',
        'generateConclusionAndCtaBtn', // Corrigido para o botão correto da conclusão
        'generateTitlesAndThumbnailsBtn',
        'mapEmotionsBtn',
        'generateDescriptionBtn',
        'generateSoundtrackBtn'
    ];
    const totalTasks = taskButtonIds.length;
    let completedTasks = 0;
    
    taskButtonIds.forEach(id => {
        const button = document.getElementById(id);
        if (button && button.classList.contains('btn-success')) {
            completedTasks++;
        }
    });

    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // >>>>> INÍCIO DA CORREÇÃO <<<<<
    // Usamos as variáveis corretas (progressFill e progressText) e as cores corretas do CSS.
    progressFill.style.width = `${percentage}%`;
    progressText.textContent = `${percentage}%`;

    if (percentage === 100) {
        progressFill.textContent = "Projeto Pronto!"; 
        progressFill.style.color = '#ffffff';
        progressFill.style.textAlign = 'center';
        progressFill.style.backgroundColor = 'var(--success)'; // Corrigido
    } else {
        progressFill.textContent = '';
        progressFill.style.backgroundColor = 'var(--primary)'; // Corrigido
    }
    // >>>>> FIM DA CORREÇÃO <<<<<
};

        // ==========================================================
        // >>>>> SUBSTITUA SUA FUNÇÃO setupInputTabs POR ESTA <<<<<
        // ==========================================================
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

        const handleConclusionStrategyChange = () => {
            const conclusionSpecificsContainer = document.getElementById('conclusionInputContainer');
            const answerRadioButtonLabel = document.querySelector('input[value="answer"]').parentElement;
            const answerRadioButton = document.querySelector('input[value="answer"]');

            // 1. Lógica para desabilitar a opção "Responder Pergunta" se não houver pergunta
            const centralQuestionText = document.getElementById('centralQuestion').value.trim();
            if (!centralQuestionText) {
                answerRadioButton.disabled = true;
                answerRadioButtonLabel.classList.add('opacity-50', 'cursor-not-allowed');
                answerRadioButtonLabel.title = "Defina a 'Pergunta Central' nos campos principais para usar esta opção.";
                // Se a opção desabilitada estava selecionada, muda para a primeira
                if(answerRadioButton.checked) {
                    document.querySelector('input[value="lesson"]').checked = true;
                }
            } else {
                answerRadioButton.disabled = false;
                answerRadioButtonLabel.classList.remove('opacity-50', 'cursor-not-allowed');
                answerRadioButtonLabel.title = "";
            }
            
            const selectedValue = document.querySelector('input[name="conclusionType"]:checked').value;
            
            // 2. Lógica para mostrar/esconder o textarea e mudar o placeholder
            if (conclusionSpecificsContainer) {
                conclusionSpecificsContainer.classList.toggle('hidden', !['lesson', 'answer', 'cliffhanger'].includes(selectedValue));
            }
            
            const textarea = document.getElementById('conclusionSpecifics');
            if (textarea) {
                const placeholders = {
                    lesson: "Ex: A lição é que a resiliência é a nossa maior força...",
                    answer: "Ex: A resposta é que a Arca foi levada para a Etiópia, mas o verdadeiro segredo é...",
                    cliffhanger: "Ex: ...mas se a Arca foi encontrada, o que aconteceu com o que estava DENTRO dela?"
                };
                textarea.placeholder = placeholders[selectedValue] || "";
            }
        };

        /**
         * Alterna a visibilidade de um corpo de acordeão e a rotação de sua seta. (VERSÃO CORRIGIDA E ROBUSTA)
         * @param {string} bodyId - O ID do elemento do corpo do acordeão.
         * @param {string} arrowId - O ID do elemento da seta do acordeão.
         */
        window.toggleAccordion = (bodyId, arrowId) => {
            const body = document.getElementById(bodyId);
            const arrow = document.getElementById(arrowId);
            // CORREÇÃO: Encontra o cabeçalho subindo na árvore DOM
            const header = body ? body.closest('.accordion-item').querySelector('.accordion-header') : null;

            if (body && arrow && header) {
                const isOpen = body.classList.toggle('open');
                arrow.classList.toggle('open', isOpen);
                header.classList.toggle('active', isOpen);
            }
        };

        /**
 * Renderiza a página correta de prompts para uma determinada seção. (VERSÃO CORRIGIDA)
 * @param {string} sectionElementId - O ID da seção (ex: 'introSection').
 */
// ====================================================================================
// >>>>> VERSÃO FINAL DE renderPaginatedPrompts (COM CENA E TEMPO CORRIGIDOS) <<<<<
// ====================================================================================
const renderPaginatedPrompts = (sectionElementId) => {
    const sectionElement = document.getElementById(sectionElementId);
    if (!sectionElement) return;

    const itemsPerPage = 4;
    const prompts = (window.allImagePrompts && window.allImagePrompts[sectionElementId]) || [];
    if (prompts.length === 0) return;
    
    const currentPage = (window.promptPaginationState && window.promptPaginationState[sectionElementId]) || 0;
    const totalPages = Math.ceil(prompts.length / itemsPerPage);
    const promptItemsContainer = sectionElement.querySelector('.prompt-items-container');
    const navContainer = sectionElement.querySelector('.prompt-nav-container');

    if (!promptItemsContainer || !navContainer) return;
    promptItemsContainer.innerHTML = '';

    // Lógica para memória de tempo e numeração de cena (mantida)
    let cumulativeSeconds = 0;
    let globalSceneCounter = 1;
    const sectionOrder = ['introSection', 'developmentSection', 'climaxSection', 'conclusionSection', 'ctaSection'];
    const currentSectionIndex = sectionOrder.indexOf(sectionElementId);

    for (let i = 0; i < currentSectionIndex; i++) {
        const prevPrompts = (window.allImagePrompts && window.allImagePrompts[sectionOrder[i]]) || [];
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

        // <<<< AQUI ESTÁ A MUDANÇA-CHAVE >>>>
        // 1. Montamos o prompt completo para a cópia APENAS se o sinalizador for true.
        const fullPromptText = promptData.applyStyleBlock
            ? `${promptData.imageDescription} ${CINEMATIC_STYLE_BLOCK}`
            : promptData.imageDescription;
        
        // 2. Verificamos o sinalizador para decidir se mostramos o texto na tela.
        const styleIndicatorHtml = promptData.applyStyleBlock
            ? `<p class="style-block-indicator">[Estilo Cinematográfico Aplicado]</p>`
            : '';
        // <<<< FIM DA MUDANÇA >>>>

        const promptHtml = `
            <div class="prompt-item card !p-3 animate-fade-in">
                <div class="prompt-header">
                    <span class="tag tag-scene"><i class="fas fa-film mr-2"></i>Cena ${String(sceneNumber).padStart(2, '0')}</span>
                    <span class="tag tag-time"><i class="fas fa-clock mr-2"></i>${timestamp}</span>
                    <button class="copy-btn-small" 
                            onclick="window.copyTextToClipboard(this.closest('.prompt-item').querySelector('.full-prompt-hidden').textContent); window.showCopyFeedback(this)" 
                            title="Copiar Prompt Completo">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
                <p class="paragraph-preview">"${DOMPurify.sanitize(promptData.scriptPhrase)}"</p>
                <div class="prompt-details">
                    <p class="prompt-label">${imageDescriptionLabels[elements.languageSelect.value] || 'Image Description:'}</p>
                    <p>${DOMPurify.sanitize(promptData.imageDescription)}</p>
                    ${styleIndicatorHtml}
                    <pre class="full-prompt-hidden hidden">${DOMPurify.sanitize(fullPromptText)}</pre>
                </div>
            </div>
        `;
        promptItemsContainer.innerHTML += promptHtml;

        cumulativeSeconds += parseInt(promptData.estimated_duration, 10) || 0;
    });
    
    // Renderização da Navegação (mantida)
    navContainer.innerHTML = `
        <button class="btn btn-secondary btn-small" onclick="window.navigatePrompts('${sectionElementId}', -1)" ${currentPage === 0 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
        <span class="text-sm font-medium">Página ${currentPage + 1} de ${totalPages}</span>
        <button class="btn btn-secondary btn-small" onclick="window.navigatePrompts('${sectionElementId}', 1)" ${currentPage + 1 >= totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
};

/**
 * Valida se o array de prompts recebido da IA tem a estrutura correta.
 * @param {any} data - O dado parseado do JSON.
 * @returns {boolean} - True se for um array válido de prompts, false caso contrário.
 */
const validatePromptsArray = (data) => {
    // É um array? Ele não está vazio? O primeiro item é um objeto com as chaves que precisamos?
    return Array.isArray(data) && data.length > 0 && data.every(item => 
        item && typeof item === 'object' && 'scriptPhrase' in item && 'imageDescription' in item
    );
};




// =========================================================================
// >>>>> VERSÃO REATORADA E CORRIGIDA de 'resetGeneratedScriptContent' <<<<<
// =========================================================================
/**
 * Reseta o conteúdo do roteiro gerado quando um input estratégico é alterado.
 * @param {string} sourceId - O ID do elemento que causou a mudança.
 */
const resetGeneratedScriptContent = (sourceId) => {
    // 1. LÊ DO AppState: Verifica se já existe um esboço gerado.
    if (!AppState.generated.strategicOutline && !document.querySelector('#scriptSectionsContainer .accordion-item')) {
        return; // Só reseta se já houver conteúdo gerado
    }

    console.log(`Input estratégico '${sourceId}' alterado. Resetando conteúdo do roteiro.`);

    // 2. LIMPA O AppState: Apaga os dados gerados que dependem da estratégia.
    AppState.generated.strategicOutline = null;
    AppState.generated.imagePrompts = {};
    AppState.ui.promptPaginationState = {};
    
    // Zera o script, mas mantém a estrutura de objeto
    Object.assign(AppState.generated.script, {
        intro: { html: null, text: null },
        development: { html: null, text: null },
        climax: { html: null, text: null },
        conclusion: { html: null, text: null },
        cta: { html: null, text: null }
    });


    // 3. LIMPA A UI: Atualiza a interface para refletir o estado limpo.
    const outlineContent = document.getElementById('outlineContent');
    if (outlineContent) {
        outlineContent.innerHTML = `<div class="asset-card-placeholder">A estratégia mudou. Clique em 'Criar Esboço' novamente.</div>`;
    }

    const scriptContainer = document.getElementById('scriptSectionsContainer');
    if (scriptContainer) {
        scriptContainer.innerHTML = ''; // Limpa completamente. O esboço vai recriar os placeholders.
    }
    
    // 4. ATUALIZA A UI GERAL: Garante que a barra de progresso e botões estejam corretos.
    updateProgressBar();
    updateButtonStates();
    
    const sourceLabel = document.querySelector(`label[for='${sourceId}']`)?.textContent.replace(':', '') || sourceId;
    window.showToast(`'${sourceLabel}' mudou. O roteiro foi resetado.`, 'info');

};




// =========================================================================
// >>>>> VERSÃO REATORADA E CORRIGIDA de 'invalidateAndClearPrompts' <<<<<
// =========================================================================
/**
 * Invalida e limpa os prompts de imagem de uma seção quando seu texto é alterado.
 * Agora, opera diretamente no AppState.
 * @param {HTMLElement} sectionElement - O elemento da seção (ex: o div com id="introSection").
 */
const invalidateAndClearPrompts = (sectionElement) => {
    if (!sectionElement) return;

    const sectionId = sectionElement.id;
    const promptContainer = sectionElement.querySelector('.prompt-container');

    // 1. ATUALIZA O AppState: Remove os prompts da memória.
    if (AppState.generated.imagePrompts[sectionId]) {
        delete AppState.generated.imagePrompts[sectionId];
        console.log(`Prompts para a seção '${sectionId}' invalidados e removidos do AppState.`);
    }
    
    // 2. ATUALIZA A UI: Limpa a interface do usuário, se os prompts já foram renderizados.
    if (promptContainer && promptContainer.innerHTML.trim() !== '') {
        promptContainer.innerHTML = `
            <div class="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border-l-4 border-yellow-400">
                <p class="text-sm text-yellow-700 dark:text-yellow-300 font-semibold">
                    Atenção: O roteiro foi modificado.
                </p>
                <p class="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                    Por favor, clique em "Gerar Prompts de Imagem" novamente para criar novos recursos visuais com base no texto atualizado.
                </p>
            </div>
        `;
    }
};





/**
         * Invalida e limpa a sugestão de performance, exibindo um aviso.
         */
        const invalidateAndClearPerformance = (sectionElement) => {
            if (!sectionElement) return;

            const performanceContainer = sectionElement.querySelector('.section-performance-output');
            if (performanceContainer && performanceContainer.innerHTML.trim() !== '') {
                performanceContainer.innerHTML = `
                    <div class="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border-l-4 border-yellow-400">
                        <p class="text-sm text-yellow-700 dark:text-yellow-300 font-semibold">
                            Atenção: O roteiro foi modificado.
                        </p>
                        <p class="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                            Por favor, clique em "Sugerir Performance" novamente para criar novas anotações com base no texto atualizado.
                        </p>
                    </div>
                `;
            }
        };

        /**
         * Lida com os cliques nas setas de navegação dos prompts.
         * @param {string} sectionElementId - O ID da seção.
         * @param {number} direction - -1 para a esquerda, 1 para a direita.
         */
        window.navigatePrompts = (sectionElementId, direction) => {
            const prompts = allImagePrompts[sectionElementId] || [];
            const itemsPerPage = 4;
            const totalPages = Math.ceil(prompts.length / itemsPerPage);
            let currentPage = promptPaginationState[sectionElementId] || 0;

            const newPage = currentPage + direction;

            // Validação dos limites
            if (newPage >= 0 && newPage < totalPages) {
                promptPaginationState[sectionElementId] = newPage;
                renderPaginatedPrompts(sectionElementId);
            }
        };
    
// =========================================================================
// >>>>> SUBSTITUA A FUNÇÃO 'generateSectionHtmlContent' INTEIRA POR ESTA <<<<<
// =========================================================================
const generateSectionHtmlContent = (sectionId, title, content) => {
    const accordionItem = document.createElement('div');
    accordionItem.className = 'accordion-item card !p-0 mb-4 animate-fade-in';

    const accordionHeader = document.createElement('div');
    accordionHeader.className = 'accordion-header';

    const accordionBody = document.createElement('div');
    accordionBody.id = `${sectionId}Body`;
    accordionBody.className = 'accordion-body';

    const headerTitleGroup = document.createElement('div');
    headerTitleGroup.className = 'header-title-group';
    const h3 = document.createElement('h3');
    h3.textContent = title;
    const timeSpan = document.createElement('span');
    timeSpan.className = 'text-xs font-normal text-gray-500';
    timeSpan.textContent = calculateReadingTime(content);
    headerTitleGroup.appendChild(h3);
    headerTitleGroup.appendChild(timeSpan);

    const headerActionsGroup = document.createElement('div');
    headerActionsGroup.className = 'header-actions-group';
    const headerButtons = document.createElement('div');
    headerButtons.className = 'header-buttons';

    const regenerateBtn = document.createElement('button');
    regenerateBtn.className = 'regenerate-btn';
    regenerateBtn.title = 'Re-gerar esta seção';
    regenerateBtn.dataset.action = 'regenerate';
    regenerateBtn.dataset.sectionId = `${sectionId}Section`;
    regenerateBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"/><path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466"/></svg>`;

    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.title = 'Copiar Roteiro';
    copyBtn.dataset.action = 'copy';
    copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/><path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5-.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/></svg>`;
    headerButtons.appendChild(regenerateBtn);
    headerButtons.appendChild(copyBtn);

    const arrowSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    arrowSvg.id = `${sectionId}Arrow`;
    arrowSvg.setAttribute('class', 'accordion-arrow');
    arrowSvg.setAttribute('width', '16');
    arrowSvg.setAttribute('height', '16');
    arrowSvg.setAttribute('fill', 'currentColor');
    arrowSvg.setAttribute('viewBox', '0 0 16 16');
    arrowSvg.innerHTML = `<path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>`;
    
    headerActionsGroup.appendChild(headerButtons);
    headerActionsGroup.appendChild(arrowSvg);
    accordionHeader.appendChild(headerTitleGroup);
    accordionHeader.appendChild(headerActionsGroup);

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'generated-content-wrapper';
    contentWrapper.setAttribute('contenteditable', 'true');
    contentWrapper.innerHTML = content;

    const analysisTools = document.createElement('div');
    const addChapterButtonHtml = sectionId === 'development' ? `
        <div class="tooltip-container">
            <button class="btn btn-primary btn-small" data-action="addDevelopmentChapter">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z"/></svg> 
                Adicionar Capítulo
            </button>
        </div>
    ` : '';
    
    // <<< AQUI ESTÁ A GRANDE MUDANÇA COM OS TOOLTIPS >>>
    const toolsHtml = `
        <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-6">
            <div class="text-center">
                <h5 class="font-semibold text-base mb-2 text-gray-800 dark:text-gray-200">Passo 1: Diagnóstico e Criativo</h5>
                <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">Analise, edite ou enriqueça o texto para máxima qualidade.</p>
                <div class="flex items-center justify-center gap-2 flex-wrap">
                    
                    <div class="tooltip-container">
                        <button class="btn btn-secondary btn-small" data-action="analyzeRetention" data-section-id="${sectionId}Section">Analisar Retenção</button>
                        <span class="tooltip-text">
                            <strong>Função:</strong> Diagnóstico.<br>
                            <strong>O que faz:</strong> Age como um "médico". Ele escaneia o texto e te diz: "Aqui está bom, aqui tem um ponto de atenção, e aqui tem um ponto de risco". Ele te dá o diagnóstico, mas não a cura.
                        </span>
                    </div>

                    <div class="tooltip-container">
                        <button class="btn btn-secondary btn-small" data-action="refineStyle">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-gem" viewBox="0 0 16 16"><path d="M3.1.7a.5.5 0 0 1 .4-.2h9a.5.5 0 0 1 .4.2l2.976 3.974c.149.199.224.458.224.726v1.2a.5.5 0 0 1-.5.5H.5a.5.5 0 0 1-.5-.5v-1.2c0-.268.075-.527.224-.726L3.1.7zM1.49 4.107l-1.18-1.575a.5.5 0 0 1 .4-.8h13.56a.5.5 0 0 1 .4.8L14.51 4.107H1.49zM.5 5.5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5H.5a.5.5 0 0 1 0-1H1v-1H.5a.5.5 0 0 1 0-1H1v-1H.5a.5.5 0 0 1 0-1H1v-1H.5a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v7a.5.5 0 0 1 0 1h-.5a.5.5 0 0 1 0-1H15v-1h-.5a.5.5 0 0 1 0-1H15v-1h-.5a.5.5 0 0 1 0-1H15v-1h.5a.5.5 0 0 1 .5-.5v-1a.5.5 0 0 1-.5.5zM2 13.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/></svg>
                            Refinar Estilo
                        </button>
                        <span class="tooltip-text">
                            <strong>Função:</strong> Polimento.<br>
                            <strong>O que faz:</strong> Age como um "polidor de carros". Ele pega o texto inteiro, remove repetições e melhora a fluidez. Ele deixa o texto mais bonito e brilhante, mas não muda a sua essência.
                        </span>
                    </div>

                    <div class="tooltip-container">
                        <button class="btn btn-secondary btn-small" data-action="enrichWithData">
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8.5 2a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-1 0v-11a.5.5 0 0 1 .5-.5z"/><path d="M2 7.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/></svg>
                            Enriquecer com Dados
                        </button>
                        <span class="tooltip-text">
                            <strong>Função:</strong> Adição.<br>
                            <strong>O que faz:</strong> Age como um "engenheiro de reforço". Você seleciona um trecho e lhe dá uma nova informação (um dado, uma fonte). Ele reforça aquele trecho com mais credibilidade.
                        </span>
                    </div>
                    ${addChapterButtonHtml}
                </div>
                <div id="analysis-output-${sectionId}" class="section-analysis-output mt-3 text-left"></div>
            </div>
            <div class="pt-4 border-t border-dashed border-gray-200 dark:border-gray-700 text-center">
                 <h5 class="font-semibold text-base mb-2 text-gray-800 dark:text-gray-200">Passo 2: Estrutura de Narração</h5>
                <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">Adicione sugestões de performance para guiar a narração.</p>
                <div class="flex items-center justify-center gap-2"><button class="btn btn-secondary btn-small" data-action="suggestPerformance" data-section-id="${sectionId}Section">Sugerir Performance</button></div>
                <div class="section-performance-output mt-3 text-left"></div> 
            </div>
            <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
                <h5 class="font-semibold text-base mb-2 text-gray-800 dark:text-gray-200">Passo 3: Recursos Visuais</h5>
                <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">Crie o storyboard visual para esta seção do roteiro.</p>
                <button class="btn btn-secondary btn-small" data-action="generate-prompts" data-section-id="${sectionId}Section">Gerar Prompts de Imagem</button>
                <div class="prompt-container mt-4 text-left"></div>
            </div>
        </div>
    `;
    analysisTools.innerHTML = DOMPurify.sanitize(toolsHtml, { ADD_TAGS: ["svg", "path", "span", "br", "strong"], ADD_ATTR: ["d", "fill", "viewBox", "xmlns", "width", "height", "class"] });
    
    accordionBody.appendChild(contentWrapper);
    accordionBody.appendChild(analysisTools);
    accordionItem.appendChild(accordionHeader);
    accordionItem.appendChild(accordionBody);

    return accordionItem;
};

    
// ============================
// >>>>> FILTRO JSON <<<<<
// ============================
const cleanGeneratedText = (text, expectJson = false, arrayExpected = false) => {
    if (!text || typeof text !== 'string') {
        return expectJson ? (arrayExpected ? [] : null) : '';
    }

    if (!expectJson) {
        return text.trim();
    }

    let jsonString;
    const trimmedText = text.trim();

    // ETAPA 0: O DETETIVE DE INTENÇÃO 2.0 (Mantido 100%)
    const markdownMatch = trimmedText.match(/```(json)?\s*([\s\S]*?)\s*```/);
    if (markdownMatch && markdownMatch[2]) {
        jsonString = markdownMatch[2].trim();
    } else {
        const startIndex = trimmedText.search(/[\{\[]/);
        if (startIndex === -1) {
            console.error("FALHA DE DETECÇÃO: Nenhum início de JSON ('{' ou '[') encontrado no texto da IA.", text);
            throw new Error("A IA não retornou um formato JSON reconhecível.");
        }
        const lastBraceIndex = trimmedText.lastIndexOf('}');
        const lastBracketIndex = trimmedText.lastIndexOf(']');
        const endIndex = Math.max(lastBraceIndex, lastBracketIndex);
        if (endIndex === -1 || endIndex < startIndex) {
            console.error("FALHA DE DETECÇÃO: JSON parece estar incompleto (sem '}' ou ']' de fechamento).", text);
            throw new Error("O JSON retornado pela IA parece estar incompleto.");
        }
        jsonString = trimmedText.substring(startIndex, endIndex + 1);
    }
    
    // ETAPA 1: PRÉ-CIRURGIA (NORMALIZAÇÃO) - Adicionada para maior robustez
    try {
        // Corrige os erros mais comuns ANTES da primeira tentativa de parse.
        // 1. Garante que as chaves dos objetos JSON estejam entre aspas duplas. Ex: { key: "value" } => { "key": "value" }
        jsonString = jsonString.replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3');
        // 2. Converte aspas simples em aspas duplas para os valores. Ex: { "key": 'value' } => { "key": "value" }
        jsonString = jsonString.replace(/:\s*'((?:[^'\\]|\\.)*?)'/g, ': "$1"');
        // 3. Remove vírgulas extras antes de fechar colchetes ou chaves. Ex: [ "a", "b", ] => [ "a", "b" ]
        jsonString = jsonString.replace(/,\s*([}\]])/g, '$1');
    } catch (preSurgeryError) {
        console.warn("Erro durante a pré-cirurgia. O JSON pode estar muito malformado.", preSurgeryError);
    }

    // ETAPA 2: CIRURGIA PREVENTIVA DE FECHAMENTO (Sua lógica, mantida 100%)
    let openBrackets = (jsonString.match(/\[/g) || []).length;
    let closeBrackets = (jsonString.match(/\]/g) || []).length;
    let openBraces = (jsonString.match(/\{/g) || []).length;
    let closeBraces = (jsonString.match(/\}/g) || []).length;
    while (openBraces > closeBraces) { jsonString += '}'; closeBraces++; }
    while (openBrackets > closeBrackets) { jsonString += ']'; closeBrackets++; }

    // ETAPA 3: TENTATIVA INICIAL
    try {
        let parsedResult = JSON.parse(jsonString);
        if (arrayExpected && !Array.isArray(parsedResult)) {
            console.warn("Correção Semântica: A IA retornou um objeto, mas um array era esperado.", parsedResult);
            return [parsedResult];
        }
        return parsedResult;

    } catch (initialError) {
        console.warn("Parse inicial falhou. O JSON extraído ainda tem erros. Iniciando reparos...", initialError.message);
        
        // ETAPA 4: CIRURGIAS AVANÇADAS (Sua lógica, mantida 100%)
        let repairedString = jsonString; 
        try {
            // Todas as suas regras de substituição permanecem intactas.
            repairedString = repairedString.replace(/(?<=")\s*[\r\n]+\s*(?=")/g, ',');
            repairedString = repairedString.replace(/([{,]\s*)'([^']+)'(\s*:)/g, '$1"$2"$3');
            repairedString = repairedString.replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3');
            repairedString = repairedString.replace(/:\s*'((?:[^'\\]|\\.)*?)'/g, ': "$1"');
            repairedString = repairedString.replace(/,\s*([}\]])/g, '$1');
            repairedString = repairedString.replace(/"\s*[;.,]\s*([,}\]])/g, '"$1');
            repairedString = repairedString.replace(/:\s*"([^"]*)"/g, (match, content) => {
                if (content.includes('"') && !content.includes('\\"')) {
                    const escapedContent = content.replace(/(?<!\\)"/g, '\\"');
                    return `: "${escapedContent}"`;
                }
                return match;
            });
            repairedString = repairedString.replace(/}\s*"/g, '},"');
            repairedString = repairedString.replace(/(?<!\\)\n/g, "\\n");
            repairedString = repairedString.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");

            // ETAPA 5: TENTATIVA FINAL
            let finalParsedResult = JSON.parse(repairedString);

            if (arrayExpected && !Array.isArray(finalParsedResult)) {
                console.warn("Correção Semântica Pós-Reparo: A IA retornou um objeto, mas um array era esperado.", finalParsedResult);
                return [finalParsedResult];
            }

            console.log("Cirurgia no JSON bem-sucedida!");
            return finalParsedResult;

        } catch (surgeryError) {
            console.error("FALHA CRÍTICA: A cirurgia no JSON não foi bem-sucedida.", surgeryError.message);
            console.error("JSON Problemático (Original):", text);
            console.error("JSON Pós-Cirurgia (Falhou):", repairedString);
            throw new Error(`A IA retornou um JSON com sintaxe inválida que não pôde ser corrigido.`);
        }
    }
};


// ============================
// >>>>> FILTRO JSON <<<<<
// ============================



/**
 * Analisa o texto bruto da IA, separando a narrativa principal
 * das descrições de cena que estão entre parênteses.
 * @param {string} rawText - O texto completo retornado pela IA.
 * @returns {{narrative: string, scenes: string[]}} Um objeto com o texto narrativo limpo e um array com as descrições de cena capturadas.
 */
const parseNarrativeAndScenes = (rawText) => {
    if (!rawText) {
        return { narrative: '', scenes: [] };
    }

    const scenes = [];
    // Esta Regex procura por parênteses que contenham palavras-chave como "cena", "visual", "lembre-se"
    // e captura o conteúdo dentro deles. A flag 'gi' garante que ela procure por todo o texto.
    const sceneRegex = /\(\s*(?:Lembre-se de uma cena vívida|Uma cena vívida|Cena|Visual|Imagem):?\s*([^)]+)\s*\)/gi;

    // 1. Primeiro, extraímos todas as cenas para o nosso array.
    let match;
    while ((match = sceneRegex.exec(rawText)) !== null) {
        scenes.push(match[1].trim());
    }

    // 2. Depois, removemos todas essas anotações do texto para ter a narrativa limpa.
    //    Substituímos a anotação inteira (incluindo parênteses) por um espaço, e depois limpamos espaços duplos.
    const narrative = rawText.replace(sceneRegex, ' ').replace(/\s{2,}/g, ' ').trim();

    return { narrative, scenes };
};



// =========================================================================
// >>>>> VERSÃO FINAL E BLINDADA DE 'removeMetaComments' <<<<<
// =========================================================================
/**
 * Remove comentários meta, instruções e formatações indesejadas injetadas pela IA.
 * @param {string} text - O texto gerado pela IA.
 * @returns {string} O texto limpo.
 */
const removeMetaComments = (text) => {
    if (!text) return "";

    let cleanedText = text;

    // CAMADA 0: Normalização inicial de quebras de linha
    // Substitui diferentes tipos de quebras de linha por \n para consistência
    cleanedText = cleanedText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // CAMADA 1: Remove preâmbulos comuns que terminam com ":" (agora mais robusta)
    const lines = cleanedText.split('\n');
    if (lines.length > 0) {
        const firstLine = lines[0].trim();
        // Verifica se a primeira linha parece um preâmbulo (começa com letra maiúscula e termina com :)
        if (firstLine.length > 0 && /^[A-ZÀ-Ú].*:$/.test(firstLine)) {
            lines.shift();
            cleanedText = lines.join('\n');
        }
    }
    cleanedText = cleanedText.trim();

    // CAMADA 2: Usa regex para remover padrões específicos e indesejados (EXPANDIDA)
    const patternsToRemove = [
        // --- Padrões de Início/Contexto ---
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

        // --- Cabeçalhos e Títulos Automáticos ---
        /^\*\*roteiro anotado:\*\*\s*/im,
        /^\*\*Introdução:\*\*\s*/im,
        /^\*\*Desenvolvimento:\*\*\s*/im,
        /^\*\*Clímax:\*\*\s*/im,
        /^\*\*Conclusão:\*\*\s*/im,
        /^\*\*Call to Action:\*\*\s*/im,
        /^\*\*TEXTO REFINADO:\*\*\s*/im,
        /^\*\*Refined Text:\*\*\s*/im,
        /^\s*\*\*[^*]+\*\*\s*$/gm, // "Caçador de Títulos" genérico

        // >>>>> INÍCIO DA CORREÇÃO CIRÚRGICA <<<<<
        // Padrão para caçar e remover anotações como (Pausa), (Teaser), (Corte para), etc., que estejam em sua própria linha.
        /^\s*\((Pausa|Teaser|Corte para|Transição|Música sobe|Efeito sonoro)\)\s*$/gim,
        // >>>>> FIM DA CORREÇÃO CIRÚRGICA <<<<<

        // --- Anotações de Roteiro/Apresentação (EXPANDIDO) ---
        /^\s*Presenter Notes?:\s*.*$/gim,
        /^\s*Note to Presenter:\s*.*$/gim,
        /^\s*Narrator:\s*.*$/gim,
        /^\s*Host:\s*.*$/gim,
        /^\s*Voiceover:\s*.*$/gim,
        /^\s*VO:\s*.*$/gim,
        /^\s*On-screen text:\s*.*$/gim,
        /^\s*Title Card:\s*.*$/gim,
        
        // --- Diretrizes de Formatação (EXPANDIDO) ---
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
        
        // --- Anotações Técnicas ---
        /^\s*Word count:\s*\d+\s*$/gim,
        /^\s*Estimated duration:\s*.*$/gim,
        /^\s*Style:\s*.*$/gim,
        /^\s*Tone:\s*.*$/gim,
        /^\s*Keywords?:\s*.*$/gim,
        
        // --- Frases de Transição e Finalização ---
        /^\s*In summary(,)?\s*.*$/gim,
        /^\s*To conclude(,)?\s*.*$/gim,
        /^\s*In conclusion(,)?\s*.*$/gim,
        /^\s*That's all(,)?\s*.*$/gim,
        /^\s*That's it(,)?\s*.*$/gim,
        /^\s*Thank you for listening\.\s*$/gim,
        /^\s*Let me know if you need anything else\.\s*$/gim,
        /^\s*Please let me know if you have any other requests\.\s*$/gim,
        
        // --- Padrões de Aspas (para casos onde a IA envolve o conteúdo em aspas) ---
        // Este padrão é mais seletivo para evitar remover aspas legítimas no meio do texto
        /^"""\s*/g, // Aspas triplas no início
        /\s*"""$/g, // Aspas triplas no final
    ];

    patternsToRemove.forEach(pattern => {
        cleanedText = cleanedText.replace(pattern, '');
    });

    // CAMADA 3: Limpeza Profunda Final
    // Remove quebras de linha múltiplas no início e no final
    cleanedText = cleanedText.replace(/^\s*\n+|\n+\s*$/g, '');
    
    // Remove espaços em branco extras no início e no final
    cleanedText = cleanedText.trim();

    // CAMADA 4: Proteção contra string vazia acidental
    // Se o texto foi completamente limpo, retorna uma string vazia explícita
    if (cleanedText === "") {
        return "";
    }

    // CAMADA 5: Remoção de Aspas Envolventes (caso ainda persistam após outras limpezas)
    // Apenas se a string inteira (ou quase) estiver entre aspas
    const trimmedForQuotes = cleanedText.trim();
    if (trimmedForQuotes.startsWith('"') && trimmedForQuotes.endsWith('"') && trimmedForQuotes.length > 1) {
        // Verificação adicional para evitar remover aspas no meio de uma frase válida
        const contentInside = trimmedForQuotes.substring(1, trimmedForQuotes.length - 1);
        // Se não houver aspas duplas não escapadas no meio, é seguro remover
        if (!/[^\\]"/.test(contentInside)) {
             cleanedText = contentInside;
        }
    }
    // Repetir para aspas simples, se necessário, mas com mais cautela
    // (Geralmente menos comum da IA, mas possível)
    // if (cleanedText.startsWith("'") && cleanedText.endsWith("'") && cleanedText.length > 1) {
    //     cleanedText = cleanedText.substring(1, cleanedText.length - 1);
    // }

    return cleanedText.trim();
};
// =========================================================================
// >>>>> FIM DA VERSÃO BLINDADA DE 'removeMetaComments' <<<<<
// =========================================================================




// --- INÍCIO DO NOVO MÓDULO DE NARRATIVA ---

const narrativeStructures = {
    storytelling: {
        documentary: "Documentário (Factual e Investigativo)",
        heroes_journey: "Jornada do Herói (Estrutura Épica)",
        pixar_spine: "Espinha Dorsal - Pixar (Estrutura Emocional)",
        mystery_loop: "Mistério (com Loop Aberto)",
        twist: "Narrativa com Virada (Twist)"
    },
    storyselling: {
        // --- NOVAS ESTRUTURAS ADICIONADAS AQUI ---
        pas: "Problema-Agitação-Solução (PAS)",
        bab: "Antes-Depois-Ponte (BAB)",
        aida: "Atenção-Interesse-Desejo-Ação (AIDA)",
        underdog_victory: "Vitória do Azarão (Conexão e Superação)",
        discovery_mentor: "A Grande Descoberta / Mentor Secreto",
        if_not_found_create: "Não Encontrei, Então Criei (História de Origem)"
    }
};

const narrativeTooltips = {
    // Storytelling
    documentary: "Constrói um argumento com fatos, evidências e uma narração autoritária. Perfeito para vídeos expositivos.",
    heroes_journey: "Conta uma história de transformação e superação. Ótimo para narrativas inspiradoras.",
    pixar_spine: "Estrutura emocional de 8 passos (Era uma vez... todo dia... até que...). Perfeita para arcos de personagem rápidos.",
    mystery_loop: "Apresenta uma pergunta no início e a responde no final. Excelente para reter a atenção.",
    twist: "Constrói uma expectativa e a quebra com uma revelação surpreendente no final.",
    
    // Storyselling
    pas: "Foca em um problema que o público tem (Problema), intensifica a dor que ele causa (Agitação) e apresenta o seu conteúdo/produto como a cura (Solução). Ideal para vendas diretas.",
    bab: "Mostra um cenário 'Antes' (o mundo com o problema), um 'Depois' (o resultado ideal) e posiciona seu conteúdo como 'a Ponte' que leva de um ao outro.",
    aida: "Clássico do marketing: primeiro captura a Atenção, depois gera Interesse, cria o Desejo pela solução e, finalmente, chama para a Ação.",
    underdog_victory: "Mostra alguém (ou uma empresa) com limitações que venceu contra tudo e todos. Gera alta conexão emocional e inspira confiança.",
    discovery_mentor: "Revela um grande segredo ou uma 'descoberta' que mudou tudo, posicionando o narrador como um mentor que guia o espectador.",
    if_not_found_create: "Conta a história de origem de um produto ou serviço, nascido de uma necessidade pessoal. 'Eu tinha esse problema, não achei solução, então criei uma'."
};

// Objeto para o popover do "Objetivo da Narrativa" (permanece o mesmo)
const narrativeGoalTooltips = {
    storytelling: {
        title: "Storytelling (Conectar & Inspirar)",
        description: "O foco é construir uma narrativa envolvente e emocional. O objetivo é fazer o público sentir, pensar e se conectar com a história. Ideal para documentários, lições de vida e conteúdo inspirador."
    },
    storyselling: {
        title: "Storyselling (Persuadir & Vender)",
        description: "Usa técnicas de narrativa para construir um argumento e levar o público a uma ação específica (comprar, inscrever-se, etc.). O foco é resolver um problema claro para o espectador. Ideal para marketing, lançamento de produtos e vídeos de vendas."
    }
};


   // ==========================================================
// >>>>> AÇÃO 1: SUBSTITUA A FUNÇÃO updateMainTooltip INTEIRA <<<<<
// ==========================================================
const updateMainTooltip = () => {
    const popoverTitle = document.getElementById('popoverTitle');
    const popoverDescription = document.getElementById('popoverDescription');
    const structureSelect = document.getElementById('narrativeStructure');

    if (!popoverTitle || !popoverDescription || !structureSelect) return;

    // AQUI ESTÁ A CORREÇÃO:
    // Se nenhuma opção estiver selecionada (selectedIndex === -1), a função para aqui.
    if (structureSelect.selectedIndex === -1) {
        // Opcional: Limpa o popover para não mostrar informação antiga.
        popoverTitle.textContent = "Selecione uma Estrutura";
        popoverDescription.textContent = "Passe o mouse sobre uma opção para ver sua descrição.";
        return; 
    }

    const selectedKey = structureSelect.value;
    const selectedText = structureSelect.options[structureSelect.selectedIndex].text;
    const descriptionText = narrativeTooltips[selectedKey] || "Descrição não encontrada.";
    
    popoverTitle.textContent = selectedText;
    popoverDescription.textContent = descriptionText;
};

        const updateNarrativeStructureOptions = () => {
    const goalSelect = document.getElementById('narrativeGoal');
    const structureSelect = document.getElementById('narrativeStructure');
    if (!goalSelect || !structureSelect) return;

    const goal = goalSelect.value;
    const savedValue = structureSelect.value; // Salva o valor atual, se houver
    structureSelect.innerHTML = ''; 

    const structures = narrativeStructures[goal];
    for (const key in structures) {
       const option = document.createElement('option');
        option.value = key;
       option.textContent = structures[key];
       structureSelect.appendChild(option);
   }
    
 // Tenta restaurar o valor que estava selecionado
    if (Array.from(structureSelect.options).some(opt => opt.value === savedValue)) {
        structureSelect.value = savedValue;
    }
    
    // Chama a nossa nova função para atualizar o texto do tooltip!
   updateMainTooltip();
   updateGoalPopover();
 };


 const updateGoalPopover = () => {
    const goalSelect = document.getElementById('narrativeGoal');
    const popover = document.getElementById('goalPopover');
    const popoverTitle = popover.querySelector('h4');
    const popoverDescription = popover.querySelector('p');

    if (!goalSelect || !popover || !popoverTitle || !popoverDescription) return;

    const selectedKey = goalSelect.value;
    const data = narrativeGoalTooltips[selectedKey];
    
    if (data) {
        popoverTitle.textContent = data.title;
        popoverDescription.textContent = data.description;
    }
};



// =========================================================================
// CÉREBRO ESTRATÉGICO - ÉPICO
// =========================================================================
const getBasePromptContext = () => {
    // Coleta todos os valores dos campos do formulário
    const channelName = document.getElementById('channelName')?.value.trim() || "";
    const videoTheme = document.getElementById('videoTheme')?.value.trim() || "";
    const targetAudience = document.getElementById('targetAudience')?.value.trim() || "";
    const language = document.getElementById('languageSelect')?.value || "en";
    const languageStyle = document.getElementById('languageStyle')?.value || "";
    const videoObjective = document.getElementById('videoObjective')?.value || "";
    const speakingPace = document.getElementById('speakingPace')?.value || "";
    const narrativeStructure = document.getElementById('narrativeStructure')?.value || "";
    const narrativeTheme = document.getElementById('narrativeTheme')?.value.trim() || "";
    const narrativeTone = document.getElementById('narrativeTone')?.value || "";
    const narrativeVoice = document.getElementById('narrativeVoice')?.value.trim() || "";
    const shockingEndingHook = document.getElementById('shockingEndingHook')?.value.trim() || "";
    const imageStyleSelect = document.getElementById('imageStyleSelect')?.value || "";
    const customImageStyle = document.getElementById('customImageStyle')?.value.trim() || "";

    // DIETA DOS INPUTS: Limita o tamanho dos campos de texto livre para evitar sobrecarga.
    const videoDescription = (document.getElementById('videoDescription')?.value.trim() || "").slice(0, 1000);
    const centralQuestion = (document.getElementById('centralQuestion')?.value.trim() || "").slice(0, 500);
    const emotionalArc = (document.getElementById('emotionalArc')?.value.trim() || "").slice(0, 500);
    const imageDescriptionEngine = (document.getElementById('imageDescriptionEngine')?.value.trim() || "").slice(0, 500);
    const researchData = (document.getElementById('researchData')?.value.trim() || "").slice(0, 1500);
    const emotionalHook = (document.getElementById('emotionalHook')?.value.trim() || "").slice(0, 1000);

    // Monta o prompt base
    let context = `
    Você é um ROTEIRISTA ESPECIALISTA e PESQUISADOR DE MÁXIMO DESEMPENHO para o canal "${channelName}". Sua única função é criar conteúdo de vídeo altamente envolvente, crível e ressonante emocionalmente, baseado nas instruções detalhadas fornecidas.
    
    **Core Project Details:**
    - Video Topic: "${videoTheme}"
    - Target Audience: "${targetAudience}"
    - Language: "${language}"
    - Video Objective: "${videoObjective}"
                        
    **Narrative & Style Instructions:**
    - Narrative Structure to use: "${narrativeStructure}"
    - Speaking Pace: "${speakingPace}"
    `;

    if (narrativeTheme) { context += `\n- Core Theme (The Big Idea): "${narrativeTheme}"`; }
    if (narrativeTone) { context += `\n- Narrative Tone (The Feeling): "${narrativeTone}"`; }
    if (narrativeVoice) { context += `\n- Narrator's Voice (The Personality): "${narrativeVoice}"`; }
    if (shockingEndingHook) { context += `\n- Shocking Ending Hook to use: "${shockingEndingHook}"`; }
    if (videoDescription) { context += `\n\n**Additional Information & Inspiration:**\n- Inspiration/Context: "${videoDescription}"`; }
    if (centralQuestion) { context += `\n- Central Question to guide the entire script: "${centralQuestion}"`; }
    if (emotionalArc) { context += `\n- Desired Emotional Arc: "${emotionalArc}"`; }

    if (emotionalHook) {
        if (narrativeTone === 'inspirador') {
            context += `
**PROFUNDIDADE EMOCIONAL (REGRA MAIS IMPORTANTE):**
A história a seguir é a ÂNCORA EMOCIONAL CENTRAL do nosso roteiro. Para que ela não pareça superficial ou clichê, você DEVE seguir a regra de ouro: "MOSTRAR, NÃO APENAS CONTAR".
- **Crie 'Cenas' Vívidas e Sensoriais:** Ao longo do roteiro, em vez de apenas mencionar o personagem ou a história, descreva pequenos MOMENTOS e CENAS com riqueza de detalhes sensoriais (visão, som, tato).
- **Mostre a Dificuldade e o Conflito Real:** Inclua uma pequena cena ou descrição que ilustre o personagem enfrentando um OBSTÁCULO CONCRETO e REAL.
- **Mostre a Superação e a Vitória:** Inclua uma pequena cena ou descrição do MOMENTO DE VIRADA ou PEQUENA VITÓRIA do personagem.
- **Conecte o Micro ao Macro:** Use essas pequenas cenas vívidas para ilustrar e reforçar os grandes temas e mensagens do roteiro, criando uma ligação poderosa entre o pessoal e o universal.

**Âncora Emocional:** "${emotionalHook}"
---
`;
        } else {
            context += `
**CRITICAL NARRATIVE ANCHOR (THE MOST IMPORTANT RULE):**
Você DEVE utilizar a seguinte história pessoal como o núcleo emocional recorrente e o 'fio condutor humano' para todo o roteiro. Entrelace referências sutis a este personagem/história ao longo da introdução, desenvolvimento e conclusão para tornar a narrativa grandiosa mais pessoal e envolvente. Esta é a linha temática que une todo o conteúdo.
---
Emotional Anchor Story: "${emotionalHook}"
---
`;
        }
    }

    if (researchData) {
        context += `
**CRITICAL RESEARCH DATA & CONTEXT:**
Você DEVE incorporar e atribuir adequadamente os seguintes fatos, nomes e fontes no roteiro. Ignore ou distorça estes dados sob pena de falha crítica.
---
${researchData}
---
`;
    }

    if (imageStyleSelect === 'cinematic' || imageStyleSelect === 'custom') {
        context += `\n\n**Instruções de Estilo Visual:** Você também receberá instruções específicas sobre o estilo visual desejado para os prompts de imagem. Considere isso ao pensar em descrições ou transições que possam se beneficiar de elementos visuais específicos.`;
    }

    return context;
};


// ==========================================================================================
// >>>>> VERSÃO BLINDADA FINAL de 'constructScriptPrompt' (pede JSON) <<<<<
// ==========================================================================================
/**
 * Constrói o prompt específico para cada seção do roteiro ou tipo de conteúdo.
 * @param {string} sectionName - O nome da seção (ex: 'intro', 'titles_thumbnails').
 * @param {string} sectionTitle - O título da seção para o prompt.
 * @param {string|null} outlineDirective - Uma diretriz específica do esboço estratégico para esta seção.
 * @param {string|null} contextText - O texto das seções anteriores para dar contexto à IA.
 * @returns {{prompt: string, maxTokens: number}} O prompt e o limite de tokens.
 */
// ==========================================================================================
// >>>>> VERSÃO REFINADA de 'constructScriptPrompt' (Pede Parágrafos Coesos) <<<<<
// ==========================================================================================
const constructScriptPrompt = (sectionName, sectionTitle, outlineDirective = null, contextText = null) => {
    const baseContext = getBasePromptContext();
    const videoDuration = document.getElementById('videoDuration').value;
    const selectedLanguage = document.getElementById('languageSelect').value;
    
    const targetWords = wordCountMap[videoDuration]?.[sectionName];
    let durationInstruction = '';
    if (targetWords) {
        durationInstruction = `\n\n**CRITICAL TIMING CONSTRAINT:** The generated text for this section MUST be approximately **${targetWords} words** in total.`;
    }

    let prompt = `${baseContext}
Você é um ARQUITETO DE ROTEIROS DE ALTA PERFORMANCE. Sua missão é escrever o texto para a seção **"${sectionTitle}"** do roteiro.
${durationInstruction}`;

    if (contextText) {
        prompt += `
\n**CONTEXTO DO ROTEIRO EXISTENTE (PARA GARANTIR CONTINUIDADE):**
---
${contextText.slice(-4000)} 
---
Sua tarefa é continuar a narrativa a partir daqui, sem repetições.`;
    }

    if (outlineDirective) {
        prompt += `\n\n**DIRETRIZ ESTRATÉGICA OBRIGATÓRIA:** Siga este plano: "${outlineDirective}"`;
    }
    
    // <<< A EVOLUÇÃO ESTÁ AQUI >>>
    prompt += `
\n**REGRAS CRÍTICAS DE FORMATAÇÃO (INEGOCIÁVEIS):**
1.  **RESPOSTA EM JSON:** Sua resposta DEVE ser um array JSON válido, onde cada item do array é uma string representando um parágrafo do roteiro.
2.  **ESTRUTURA OBRIGATÓRIA DOS PARÁGRAFOS:** CADA parágrafo (cada string no array) DEVE OBRIGATORIAMENTE conter **NO MÍNIMO 4 FRASES** e agrupar uma ideia coesa. Parágrafos com 1 ou 2 frases são inaceitáveis e serão considerados uma falha na execução da tarefa.
3.  **CONTEÚDO PURO:** As strings devem conter APENAS o texto a ser narrado. É PROIBIDO incluir anotações como 'Narrador:', '(Cena: ...)', etc.
4.  **SINTAXE:** Use aspas duplas ("") para todas as strings.

**EXEMPLO DE FORMATO DE RESPOSTA PERFEITO:**
[
  "Este é o primeiro parágrafo, que introduz a ideia principal de forma completa. Ele contém múltiplas frases que se conectam para formar um pensamento coeso. Esta é a terceira frase para cumprir a regra.",
  "O segundo parágrafo desenvolve essa ideia com mais detalhes, fornecendo exemplos ou aprofundando o argumento. Ele também é substancial e segue a regra das três frases. Sua estrutura é fundamental para o sucesso."
]

**AÇÃO FINAL:** Escreva agora a seção "${sectionTitle}", seguindo TODAS as diretrizes. Responda APENAS com o array JSON, garantindo que CADA parágrafo tenha no mínimo 4 frases.`;

    let maxTokens = 4000;

    // A lógica para 'outline', 'titles_thumbnails' e 'description' permanece a mesma.
    switch (sectionName) {
        case 'outline':
            prompt = `${baseContext}
Você é uma API de geração de JSON que segue regras com precisão cirúrgica. Sua única tarefa é criar um esboço estratégico para um vídeo.
**REGRAS INEGOCIÁVEIS:**
1.  **JSON PURO:** Responda APENAS com um objeto JSON válido.
2.  **ESTRUTURA EXATA:** O objeto DEVE conter EXATAMENTE estas cinco chaves: "introduction", "development", "climax", "conclusion", e "cta".
3.  **VALORES:** O valor para CADA chave DEVE ser uma única string de texto (1-2 frases).
**TAREFA:** Gere o objeto JSON perfeito.`;
            maxTokens = 2000;
            break;
            
        case 'titles_thumbnails':
            prompt = `${baseContext}
**TAREFA:** Gerar 5 sugestões de títulos e thumbnails.
**REGRAS:**
1. **FORMATO:** Responda APENAS com um array JSON.
2. **ESTRUTURA:** Cada objeto no array deve ter 3 chaves: "suggested_title", "thumbnail_title", e "thumbnail_description".
3. **SINTAXE:** Use aspas duplas ("") para todas as chaves e valores.`;
            maxTokens = 2000;
            break;
            
        case 'description':
            const languageName = new Intl.DisplayNames([selectedLanguage], { type: 'language' }).of(selectedLanguage);
            prompt = `${baseContext}
**TAREFA:** Gerar uma descrição otimizada e hashtags no idioma ${languageName}.
**REGRAS:** Comece com um gancho, detalhe o conteúdo, finalize com CTA e liste 10 hashtags.
**AÇÃO:** Responda APENAS com a descrição e hashtags.`;
            maxTokens = 1000;
            break;
    }
    
    return { prompt, maxTokens };
};

// ==========================================================================================
// SUBSTITUA SUA FUNÇÃO 'constructScriptPrompt' INTEIRA PELA VERSÃO FINAL E BLINDADA
// ==========================================================================================



        /**
         * Faz uma chamada à API Groq através de uma função Netlify.
         * @param {string} prompt - O prompt a ser enviado para a IA.
         * @param {number} maxTokens - O número máximo de tokens para a resposta.
         * @returns {Promise<string>} A resposta bruta da IA.
         * @throws {Error} Se a chamada à API falhar.
         */

// =========================================================================
// >>>>> SUBSTITUA A FUNÇÃO callGroqAPI PELA VERSÃO SIMPLES E DIRETA <<<<<
// =========================================================================
// index.html - Versão final com Cloudflare Worker
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
        window.showToast(customError.message);
        throw customError;
    } else {
        window.showToast(`Falha na API: ${error.message}`);
        throw error;
    }
}
};

        /**
         * Valida os inputs essenciais antes de gerar conteúdo.
         * @returns {boolean} True se os inputs são válidos, caso contrário, false.
         */
             
        /**
         * Itera sobre todas as seções do roteiro na ordem correta,
         * renumera globalmente todas as cenas E recalcula o timestamp
         * com base na duração estimada pela IA para cada cena.
         */
        
    
        /**
         * Escapa um objeto JSON para ser usado com segurança dentro de um atributo onclick.
         * @param {object} idea - O objeto da ideia a ser escapado.
         * @returns {string} Uma string JSON segura para HTML.
         */
        const escapeIdeaForOnclick = (idea) => {
            // Primeiro, converte o objeto para uma string JSON
            const jsonString = JSON.stringify(idea);
            // Em seguida, substitui os caracteres que quebram o HTML
            // Escapa aspas duplas, aspas simples e barras invertidas
            return jsonString.replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/\\/g, '&#92;');
        };

        // ==========================================================
        // ===== COLE ESTA FUNÇÃO FALTANTE NO SEU JAVASCRIPT =====
        // ==========================================================
        /**
         * Lida com a visibilidade da barra de ação flutuante com base na posição de rolagem.
         */
        window.handleFloatingActionBar = () => {
            const bar = document.getElementById('floatingActionBar');
            // O gatilho para a barra aparecer será a grade de inputs principais
            const triggerElement = document.getElementById('mainInputsTabs'); 

            if (!bar || !triggerElement) {
                return; // Sai da função se os elementos não existirem
            }

            // Ponto de gatilho: quando o final do 'mainInputsGrid' passar pelo topo da tela
            const triggerPoint = triggerElement.offsetTop + triggerElement.offsetHeight;

            if (window.scrollY > triggerPoint) {
                bar.classList.add('visible');
            } else {
                bar.classList.remove('visible');
            }
        };





        // =========================================================================
// >>>>> AÇÃO 1: SUBSTITUA A FUNÇÃO createScriptSectionPlaceholder COMPLETA <<<<<
// =========================================================================
/**
 * Cria e retorna o HTML de um placeholder para uma seção do roteiro.
 * @param {string} sectionId - O ID base da seção (ex: 'intro').
 * @param {string} title - O título da seção (ex: 'Introdução').
 * @param {string} buttonId - O ID do botão principal que gera esta seção (ex: 'generateIntroBtn').
 * @returns {string} O HTML do placeholder da seção.
 */


const createScriptSectionPlaceholder = (sectionId, title, buttonId, actionName) => {
    const containerId = `${sectionId}Section`;
    
    return `
        <div id="${containerId}" class="script-section card card-placeholder mb-4 animate-fade-in flex justify-between items-center">
            <h3 class="font-semibold text-lg text-gray-700 dark:text-gray-300">${title}</h3>
            <button id="${buttonId}" data-action="${actionName}" class="btn btn-primary">
                <i class="fas fa-magic mr-2"></i>Gerar
            </button>
        </div>
    `;
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

**AÇÃO FINAL:** Com base no roteiro fornecido, gere o array JSON. Responda APENAS com o array JSON perfeito, seguindo EXATAMENTE todas as regras.
`;
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
Você é um ROTEIRISTA CONTINUÍSTA DE ELITE. Sua única função é escrever o PRÓXIMO capítulo de um roteiro existente, garantindo uma transição PERFEITA e a introdução de NOVAS informações. Você NUNCA repete o que já foi dito.

**TAREFA CRÍTICA E FOCALIZADA:**
Escrever o texto puro e narrado para o novo capítulo com o tema: "${chapterTheme}".

**ROTEIRO ESCRITO ATÉ AGORA (PARA CONTEXTO CRÍTICO DE CONTINUIDADE):**
---
${existingText}
---

**REGRAS DE FORMATAÇÃO E CONTEÚDO (INEGOCIÁVEIS E ABSOLUTAS):**
1.  **RESPOSTA 100% PURA E LIMPA:** Sua resposta deve conter **APENAS e SOMENTE** o texto que será dito em voz alta.
2.  **PROIBIÇÃO TOTAL DE FORMATAÇÃO EXTRA:** É **TERMINANTEMENTE PROIBIDO** incluir qualquer tipo de anotação, rótulo ou formatação. A violação desta regra resultará em falha. Isso inclui:
    -   **NENHUM** rótulo de personagem (Ex: 'Narrador:', 'Júlia:')
    -   **NENHUMA** descrição de cena (Ex: '(Cena: ...)')
    -   **NENHUMA** indicação de áudio (Ex: '(O som de ...)')
    -   **NENHUM** título de capítulo (Ex: 'Capítulo: ${chapterTheme}')
3.  **FOCO ABSOLUTO NA CONTINUIDADE E NOVIDADE:**
    -   O novo capítulo deve começar **EXATAMENTE** de onde o roteiro anterior parou, como se fosse a página seguinte de um livro.
    -   É **PROIBIDO** repetir ou parafrasear ideias, conceitos ou frases do roteiro existente. O espectador já viu isso.
    -   Sua missão é **AVANÇAR A NARRATIVA**, introduzindo novas informações, aprofundando um argumento ou explorando novas nuances do tema "${chapterTheme}".

**AÇÃO FINAL E CRÍTICA:** Escreva AGORA o texto puro para o próximo capítulo sobre "${chapterTheme}", seguindo todas as regras com máxima precisão. Responda APENAS com o texto a ser narrado.
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



        /**
         * Escapa uma string de texto plano para ser usada em um documento RTF,
         * lidando corretamente com caracteres non-ASCII e especiais.
         * @param {string} text - O texto a ser escapado.
         * @returns {string} O texto formatado para RTF.
         */
        const escapeRtf = (text) => {
            let result = '';
            for (let i = 0; i < text.length; i++) {
                const charCode = text.charCodeAt(i);
                // Escapa caracteres especiais do RTF
                if (charCode === 92 || charCode === 123 || charCode === 125) { // Backslash, {, }
                    result += '\\' + text.charAt(i);
                }
                // Converte caracteres non-ASCII para o formato hexadecimal do RTF
                else if (charCode > 127) {
                    let hex = charCode.toString(16);
                    if (hex.length < 2) {
                        hex = '0' + hex;
                    }
                    result += "\\'" + hex;
                }
                // Mantém caracteres ASCII padrão
                else {
                    result += text.charAt(i);
                }
            }
            return result;
        };

        // ==========================================================
        // ================== FUNÇÕES PRINCIPAIS ====================
        // ==========================================================
        
            const handleSuggestionMouseOver = (event) => {
            const targetParagraph = event.currentTarget;
            const suggestionGroupText = targetParagraph.dataset.suggestionGroup;
            if (!suggestionGroupText) return;

            const contentWrapper = targetParagraph.closest('.generated-content-wrapper');
            if (!contentWrapper) return;
            
            // >>>>> AQUI ESTÁ A CORREÇÃO CRÍTICA <<<<<
            // Escapa as aspas duplas no texto da sugestão antes de usá-lo no seletor
            const safeSuggestionSelector = suggestionGroupText.replace(/"/g, '\\"');

            // Encontra todos os parágrafos com a mesma sugestão (usando o seletor seguro) e os destaca
            contentWrapper.querySelectorAll(`[data-suggestion-group="${safeSuggestionSelector}"]`).forEach(p => {
                p.classList.add('highlight-group');
            });
        };

        const handleSuggestionMouseOut = (event) => {
            const targetParagraph = event.currentTarget;
            const contentWrapper = targetParagraph.closest('.generated-content-wrapper');
            if (!contentWrapper) return;
            
            // Remove o destaque de todos os parágrafos
            contentWrapper.querySelectorAll('.highlight-group').forEach(p => {
                p.classList.remove('highlight-group');
            });
        };

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// >>>>> ANALISE DE RETENÇÃO <<<<<
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
window.analyzeSectionRetention = async (button, sectionId) => {
    const sectionElement = document.getElementById(sectionId);
    const contentWrapper = sectionElement?.querySelector('.generated-content-wrapper');

    if (!contentWrapper || !contentWrapper.textContent.trim()) {
        window.showToast("Gere o roteiro desta seção antes de analisar a retenção.", 'info');
        return;
    }

    // Limpa os resultados de outras análises para evitar confusão na UI
    invalidateAndClearPerformance(sectionElement);
    const analysisOutput = sectionElement.querySelector('.section-analysis-output');
    if(analysisOutput) analysisOutput.innerHTML = '';


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

        // O NOVO PROMPT BLINDADO
        const prompt = `Você é uma API de análise de roteiro que retorna JSON.

**CONTEXTO ESTRATÉGICO (A "ALMA" DO ROTEIRO):**
---
${basePromptContext}
---
Este contexto é sua ÚNICA bússola. TODAS as sugestões DEVEM estar alinhadas a ele.

**REGRAS DE RESPOSTA (JSON ESTRITO E INEGOCIÁVEL):**
1.  **JSON PURO:** Responda APENAS com o array JSON.
2.  **ESTRUTURA COMPLETA:** Cada objeto no array DEVE conter EXATAMENTE três chaves: "paragraphIndex" (número), "retentionScore" ("green", "yellow", ou "red"), e "suggestion" (string).
3.  **SUGESTÕES ESTRATÉGICAS, NÃO REESCRITAS:** O valor de "suggestion" DEVE ser um CONSELHO ACIONÁVEL sobre COMO melhorar o parágrafo, respeitando a "alma" do roteiro. NÃO reescreva o texto.
    - **BOM:** "Este parágrafo é denso. Quebre-o com uma pergunta que conecte com a 'Pergunta Central' do vídeo para reengajar."
    - **RUIM:** "Reescreva para: 'Mas o que isso significa?'"
4.  **SINTAXE:** Use aspas duplas ("") para todas as chaves e valores string.

**MANUAL DE PONTUAÇÃO (FOCO EM ENGAJAMENTO):**
- **green:** Excelente. O parágrafo prende a atenção, avança a narrativa e está alinhado com a estratégia. Sugestão: "Excelente fluidez e alinhamento estratégico.".
- **yellow:** Ponto de Atenção. O parágrafo é funcional, mas poderia ser mais impactante ou claro. O ritmo pode estar quebrando.
- **red:** Ponto de Risco. O parágrafo é confuso, repetitivo ou quebra o engajamento. Corre o risco de fazer o espectador sair do vídeo.

**DADOS PARA ANÁLISE:**
${JSON.stringify(paragraphsWithIndexes, null, 2)}

**AÇÃO:** Analise CADA parágrafo. Retorne APENAS o array JSON perfeito.`;

        const rawResult = await callGroqAPI(prompt, 4000);
        const analysis = cleanGeneratedText(rawResult, true);

        if (!analysis || !Array.isArray(analysis)) {
            throw new Error("A análise da IA retornou um formato inválido.");
        }
        
        // A lógica de agrupamento e renderização continua a mesma, pois é robusta.
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
                                <button class="flex-1 btn bg-red-600 hover:bg-red-700 text-white btn-small py-1" 
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
        window.showToast(`Falha na análise: ${error.message}`);
    } finally {
        hideButtonLoading(button);
    }
};

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// >>>>> ANALISE DE RETENÇÃO <<<<<
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

/**
         * Pega um parágrafo, otimiza com IA e substitui seu conteúdo.
         * (VERSÃO CORRIGIDA E ANEXADA AO 'WINDOW')
         */
        window.optimizeParagraph = async (paragraphId, suggestion) => {
            const paragraphElement = document.getElementById(paragraphId);
            if (!paragraphElement) return;

            const button = paragraphElement.querySelector('.retention-action-btn');
            if (button) {
                button.disabled = true;
                button.innerHTML = `<div class="loading-spinner" style="width:16px; height:16px; border-width: 2px;"></div>`;
            }

            const originalText = paragraphElement.firstChild.textContent.trim();
            const languageName = document.getElementById('languageSelect').options[document.getElementById('languageSelect').selectedIndex].text;
            const prompt = `You are an expert copywriter. Rewrite the "Original Paragraph" below based on the "Improvement Suggestion".
        
            **CRITICAL RULE: You MUST respond in ${languageName}.** Do not change the language.

             **Original Paragraph:**
             "${originalText}"

              **Improvement Suggestion:**
               "${suggestion}"

           Respond ONLY with the rewritten paragraph, in ${languageName}.`;

            try {
                const rewrittenText = await callGroqAPI(prompt, 1000);
                paragraphElement.firstChild.textContent = removeMetaComments(rewrittenText);
                
                // Feedback visual
                paragraphElement.classList.remove('retention-yellow', 'retention-red');
                paragraphElement.classList.add('retention-green');
                paragraphElement.querySelector('.retention-tooltip')?.remove();
                button?.remove();
                
                invalidateAndClearPrompts(paragraphElement.closest('.script-section'));
                invalidateAndClearPerformance(paragraphElement.closest('.script-section'));

                window.showToast("Parágrafo otimizado!", 'success');
            } catch (error) {
                window.showToast(`Falha ao gerar Títulos: ${error.message}`, 'error');
                console.error("Erro detalhado em optimizeParagraph:", error);
                if (button) button.innerHTML = '⚠️'; // Ícone de erro
            }
        };
    
         // ==========================================================
        // >>>>> SUGERIR PERFORMANCE <<<<<
        // ==========================================================
window.suggestPerformance = async (button, sectionId) => {
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

        if (originalParagraphs.length === 0) {
            throw new Error("Não foram encontrados parágrafos estruturados para análise.");
        }

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
        const annotations = allBatchResults.flat();

        // --- A CORREÇÃO ESTÁ AQUI ---
        // Nós não lançamos mais um erro. Apenas avisamos no console se houver uma discrepância.
        if (!Array.isArray(annotations) || annotations.length !== originalParagraphs.length) { 
            console.warn(`Discrepância no número de anotações: Esperado ${originalParagraphs.length}, Recebido ${annotations?.length || 0}. O processo continuará.`);
        }
        // -----------------------------
        
        let annotatedParagraphs = [];
        originalParagraphs.forEach((p, index) => {
            // Se a anotação para este parágrafo existir, use-a. Se não, use um objeto vazio.
            const annotationData = (annotations && annotations[index]) ? annotations[index] : { general_annotation: '', emphasis_words: [] };
            let annotatedParagraph = p;

            if (annotationData && annotationData.emphasis_words && Array.isArray(annotationData.emphasis_words) && annotationData.emphasis_words.length > 0) {
                annotationData.emphasis_words.forEach(word => {
                    if (word && typeof word === 'string' && word.trim() !== '') {
                        const escapedWord = word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                        const wordRegex = new RegExp(`\\b(${escapedWord})\\b`, 'gi');
                        annotatedParagraph = annotatedParagraph.replace(wordRegex, `[ênfase em '$1']$1`);
                    }
                });
            }
            const finalParagraph = `${annotationData.general_annotation || ''} ${annotatedParagraph}`;
            annotatedParagraphs.push(finalParagraph.trim());
        });
        
        const finalAnnotatedText = annotatedParagraphs.join('\n\n');
        const highlightedText = finalAnnotatedText.replace(/(\[.*?\])/g, '<span class="text-indigo-500 dark:text-indigo-400 font-semibold italic">$1</span>');

        outputContainer.innerHTML = `
            <div class="generated-output-box !border-l-indigo-500">
                <h5 class="output-subtitle !border-b-indigo-500/50">Sugestão de Performance:</h5>
                <p class="whitespace-pre-wrap">${highlightedText}</p>
            </div>`;
            
    } catch (error) {
        outputContainer.innerHTML = `<p class="text-red-500 text-sm">Falha ao sugerir performance: ${error.message}</p>`;
        console.error("Erro detalhado em suggestPerformance:", error);
    } finally {
        hideButtonLoading(button);
    }
};


// =========================================================================
// >>>>> SUBSTITUA A FUNÇÃO 'window.refineSectionStyle' INTEIRA POR ESTA VERSÃO SEGURA <<<<<
// =========================================================================

/**
 * Pega o texto de uma seção, pede para a IA refinar o estilo (remover repetições, melhorar fluidez)
 * e substitui o conteúdo original pelo texto refinado.
 * @param {HTMLElement} buttonElement - O botão "Refinar Estilo" que foi clicado.
 */
window.refineSectionStyle = async (buttonElement) => {
    showButtonLoading(buttonElement);

    const sectionElement = buttonElement.closest('.script-section');
    if (!sectionElement) {
        window.showToast("Erro: Seção do roteiro não encontrada.", 'error');
        hideButtonLoading(buttonElement);
        return;
    }

    const contentWrapper = sectionElement.querySelector('.generated-content-wrapper');
    const originalText = contentWrapper?.textContent.trim();

    if (!originalText) {
        window.showToast("Não há texto para refinar nesta seção.", 'info');
        hideButtonLoading(buttonElement);
        return;
    }

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

    try {
        const rawResult = await callGroqAPI(prompt, 4000);
        const refinedText = removeMetaComments(rawResult);

        const newParagraphs = refinedText.split('\n').filter(p => p.trim() !== '');
        const sectionId = sectionElement.id.replace('Section', '');
        
        const newHtml = newParagraphs.map((p, index) => 
            `<div id="${sectionId}-p-${index}">${p}</div>`
        ).join('');

        contentWrapper.innerHTML = DOMPurify.sanitize(newHtml);

        invalidateAndClearPerformance(sectionElement);
        invalidateAndClearPrompts(sectionElement);
        invalidateAndClearEmotionalMap(); // <<< CHAMADA ADICIONADA AQUI
        
        const analysisOutput = sectionElement.querySelector('.section-analysis-output');
        if (analysisOutput) {
            analysisOutput.innerHTML = '';
        }

        updateAllReadingTimes();
        window.showToast("Estilo do roteiro refinado com sucesso!", 'success');

    } catch (error) {
        console.error("Erro detalhado em refineSectionStyle:", error);
        window.showToast(`Falha ao refinar o estilo: ${error.message}`);
    } finally {
        hideButtonLoading(buttonElement);
    }
};



// ==========================================================
// =================== FUNÇÕES DE RENDERIZAÇÃO =================
// ==========================================================

/**
 * Recebe os dados de uma ideia e retorna o HTML completo do card.
 * É como uma "fábrica" de cards.
 * @param {object} idea - O objeto da ideia vindo da API.
 * @param {number} index - O número do card (para o "1.", "2.", etc.).
 * @param {string} colorClass - A classe de cor da borda (ex: 'border-emerald-500').
 * @returns {string} Uma string contendo o HTML do card.
 */
const renderIdeaCard = (idea, index, colorClass) => {
    const escapedIdea = escapeIdeaForOnclick(idea);
    const borderColorName = colorClass.split('-')[1]; // Pega 'emerald' de 'border-emerald-500'

    return `
        <div class="card p-4 flex flex-col justify-between border-l-4 ${colorClass}">
            <div>
                <div class="flex justify-between items-start gap-4">
                    <h4 class="font-bold text-base flex-grow">${index + 1}. ${DOMPurify.sanitize(idea.title)}</h4>
                    <button class="btn btn-primary btn-small" data-action="select-idea" data-idea='${escapedIdea}'>Usar</button>
                </div>
                <p class="text-sm mt-2">"${DOMPurify.sanitize(idea.videoDescription || idea.angle)}"</p>
            </div>
            <span class="font-bold text-sm text-${borderColorName}-500 bg-${borderColorName}-100 dark:bg-${borderColorName}-900/50 dark:text-${borderColorName}-300 py-1 px-2 rounded-lg self-start mt-3">
                Potencial: ${DOMPurify.sanitize(String(idea.viralityScore))} / 10
            </span>
        </div>
    `;
};



// =========================================================================
// >>>>> SUBSTITUA A FUNÇÃO 'applySuggestion' INTEIRA POR ESTA VERSÃO <<<<<
// =========================================================================
window.applySuggestion = (button) => {
    const { criterionName, problematicQuote, rewrittenQuote } = button.dataset;
    const cleanCriterionName = criterionName.trim();
    const sectionId = (window.criterionMap || {})[cleanCriterionName];
    
    if (!sectionId) {
        window.showToast(`Erro fatal: Seção alvo para o critério '${cleanCriterionName}' não foi encontrada no mapa.`);
        return;
    }

    const sectionElement = document.getElementById(sectionId);
    const contentWrapper = sectionElement?.querySelector('.generated-content-wrapper');

    if (!contentWrapper) {
        window.showToast("Erro: Container de conteúdo do roteiro não encontrado.");
        return;
    }

    let replaced = false;
    const paragraphs = contentWrapper.querySelectorAll('div[id^="' + sectionId.replace('Section','') + '-p-"]');

    paragraphs.forEach(p => {
        if (replaced) return;
        const childNodes = Array.from(p.childNodes);
        for (const node of childNodes) {
            if (node.nodeType === Node.TEXT_NODE && node.textContent.includes(problematicQuote)) {
                if (node.parentElement.classList.contains('highlight-change')) {
                    replaced = true;
                    break;
                }
                const originalTextNode = node;
                const text = originalTextNode.textContent;
                const startIndex = text.indexOf(problematicQuote);
                const textBefore = text.substring(0, startIndex);
                const textAfter = text.substring(startIndex + problematicQuote.length);
                const highlightSpan = document.createElement('span');
                highlightSpan.textContent = rewrittenQuote;
                highlightSpan.className = 'highlight-change'; 
                const nodeBefore = document.createTextNode(textBefore);
                const nodeAfter = document.createTextNode(textAfter);
                const parent = originalTextNode.parentNode;
                parent.replaceChild(nodeAfter, originalTextNode);
                parent.insertBefore(highlightSpan, nodeAfter);
                parent.insertBefore(nodeBefore, highlightSpan);
                replaced = true;
                break;
            }
        }
    });

    if (!replaced) {
        window.showToast("Não foi possível aplicar a sugestão. O texto pode ter sido muito alterado.");
        return;
    }
    
    window.showToast("Sugestão aplicada com sucesso!");
    
    invalidateAndClearPerformance(sectionElement);
    invalidateAndClearPrompts(sectionElement);
    invalidateAndClearEmotionalMap(); // <<< CHAMADA ADICIONADA AQUI
    updateAllReadingTimes();

    button.disabled = true;
    button.innerHTML = '<i class="fas fa-check mr-2"></i>Aplicada!';
    button.classList.remove('btn-primary');
    button.classList.add('btn-success');

    setTimeout(() => {
        button.disabled = false;
        button.innerHTML = 'Aplicar';
        button.classList.remove('btn-success');
        button.classList.add('btn-primary');
    }, 20000);
};



// =========================================================================
// >>>>> PASSO 2: ADICIONE ESTA NOVA FUNÇÃO AO SEU SCRIPT <<<<<
// =========================================================================
const applyAllSuggestions = async (button) => {
    // Encontra todos os botões "Aplicar" que ainda não foram clicados (não estão desabilitados)
    const allApplyButtons = document.querySelectorAll('#analysisReportContainer button[data-action="applySuggestion"]:not(:disabled)');

    if (allApplyButtons.length === 0) {
        window.showToast("Nenhuma sugestão nova para aplicar.", 'info');
        return;
    }
    
    showButtonLoading(button);
    
    let appliedCount = 0;
    
    // Usamos um loop 'for...of' para poder usar 'await' e garantir que as aplicações não se sobreponham
    for (const applyBtn of allApplyButtons) {
        try {
            // Chama a nossa função já existente e robusta
            window.applySuggestion(applyBtn);
            appliedCount++;
            
            // Uma pequena pausa para o navegador respirar entre as aplicações
            await new Promise(resolve => setTimeout(resolve, 100)); 
        } catch (error) {
            console.error("Erro ao aplicar uma sugestão no modo 'Aplicar Todas':", error);
        }
    }
    
    hideButtonLoading(button);
    window.showToast(`${appliedCount} sugest${appliedCount > 1 ? 'ões' : 'ão'} aplicad${appliedCount > 1 ? 'as' : 'a'} com sucesso!`);
    
    // Desabilita o botão "Aplicar Todas" após o uso
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-check mr-2"></i>Tudo Aplicado!';
};



// =========================================================================
// >>>>> PASSO 2: SUBSTITUA A FUNÇÃO 'window.enrichWithData' INTEIRA POR ESTA <<<<<
// =========================================================================

window.enrichWithData = async (buttonElement) => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0 || selection.toString().trim() === '') {
        window.showToast("Por favor, selecione primeiro o trecho de texto que deseja enriquecer.", 'info');
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

    showButtonLoading(buttonElement);
    const sectionElement = buttonElement.closest('.script-section');

    try {
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

**AÇÃO FINAL:** Reescreva AGORA o trecho, integrando a nova informação com MÁXIMA habilidade e conformidade. Responda APENAS com o texto final reescrito e integrado.
`;

        const rawResult = await callGroqAPI(prompt, 1000);
        const enrichedText = removeMetaComments(rawResult);

        if (userSelectionRange) {
            selection.removeAllRanges();
            selection.addRange(userSelectionRange);
            document.execCommand('insertHTML', false, DOMPurify.sanitize(`<span class="highlight-change">${enrichedText}</span>`));
        }
        
        if (sectionElement) {
            invalidateAndClearPerformance(sectionElement);
            invalidateAndClearPrompts(sectionElement);
            invalidateAndClearEmotionalMap(); // <<< CHAMADA ADICIONADA AQUI
        }

        window.showToast("Texto enriquecido com sucesso!", 'success');

    } catch (error) {
        console.error("Erro detalhado em enrichWithData:", error);
        window.showToast(`Falha ao enriquecer o texto: ${error.message}`);
    } finally {
        hideButtonLoading(buttonElement);
        userSelectionRange = null;
    }
};

     
// Esta UMA função substitui as SEIS antigas
const generateIdeas = async (genre, button, investigationData) => {
    const outputContainer = document.getElementById('ideasOutput');
    const langSelect = document.getElementById('languageSelect');
    const languageName = langSelect?.value === 'pt-br' ? 'Português do Brasil' : 'English';
    const { rawReport, originalQuery } = investigationData;

    // Apenas UMA linha para pegar o prompt correto do nosso gerenciador!
    const promptContext = { originalQuery, rawReport, languageName };
    const prompt = PromptManager.getIdeasPrompt(genre, promptContext);

    try {
        const rawResult = await callGroqAPI(prompt, 4000);
        const ideas = cleanGeneratedText(rawResult, true);

        if (!ideas || !Array.isArray(ideas) || ideas.length === 0) {
            throw new Error(`O especialista em ${genre} não retornou ideias no formato esperado.`);
        }
        
        // Esta parte de renderização será refatorada depois (Pilar 4), por enquanto mantemos aqui
       outputContainer.innerHTML = ''; 
        const genreColorMap = {
            'documentario': 'border-gray-500', 'inspiracional': 'border-violet-500',
            'scifi': 'border-blue-500', 'terror': 'border-red-500',
            'enigmas': 'border-purple-500', 'geral': 'border-emerald-500'
        };
        const colorClass = genreColorMap[genre] || 'border-emerald-500';

        // Veja como ficou mais limpo:
        // 1. Usa .map para transformar cada 'idea' em um HTML de card.
        // 2. Usa .join('') para juntar todos os HTMLs em uma única string.
        const allCardsHtml = ideas.map((idea, index) => renderIdeaCard(idea, index, colorClass)).join('');
        
        // 3. Insere tudo na tela de uma só vez.
        outputContainer.innerHTML = allCardsHtml;

    } catch (error) {
        console.error(`Erro no especialista de ${genre}:`, error);
        outputContainer.innerHTML = `<p class="md-col-span-2 text-red-500">${error.message}</p>`;
    } finally {
        hideButtonLoading(button);
    }
};







// =========================================================================
// >>>>> AÇÃO 1: ADICIONE A FUNÇÃO `selectIdea` QUE ESTAVA FALTANDO <<<<<
// =========================================================================
/**
 * Preenche os campos do formulário principal com a ideia de vídeo selecionada.
 * @param {object} idea - O objeto da ideia contendo título, descrição, etc.
 */
const selectIdea = (idea) => {
    // --- 1. PREENCHIMENTO DOS CAMPOS ---
    document.getElementById('videoTheme').value = idea.title || '';
    document.getElementById('videoDescription').value = idea.videoDescription || '';
    document.getElementById('targetAudience').value = idea.targetAudience || '';
    document.getElementById('narrativeTheme').value = idea.angle || '';

    // --- 2. LIMPEZA ESTRATÉGICA ---
    document.getElementById('centralQuestion').value = '';
    document.getElementById('emotionalHook').value = '';
    document.getElementById('narrativeVoice').value = '';
    document.getElementById('emotionalArc').value = '';
    document.getElementById('shockingEndingHook').value = '';

    // --- 3. MELHORIA DA EXPERIÊNCIA DO USUÁRIO (UX) ---
    const targetElement = document.getElementById('inputTabsNav');
    if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    window.showToast("Ideia selecionada! Estratégia pré-preenchida. Revise e ajuste.", 'success');
};


// =========================================================================
// >>>>> VERSÃO FINAL de 'handleGenerateSection' (Processa Array JSON) <<<<<
// =========================================================================
const handleGenerateSection = async (button, sectionName, sectionTitle, elementId) => {
    if (!validateInputs()) return;

    if (!AppState.generated.strategicOutline && sectionName !== 'intro') {
        window.showToast("Crie o Esboço Estratégico primeiro!", 'info');
        return;
    }

    showButtonLoading(button);
    const targetSectionElement = document.getElementById(`${elementId}Section`);

    try {
        // Lógica para montar contexto (sem mudanças)
        let contextText = null;
        const sectionOrder = ['intro', 'development', 'climax'];
        const currentSectionIndex = sectionOrder.indexOf(elementId);
        if (currentSectionIndex > 0) {
            const prevSectionsContent = sectionOrder.slice(0, currentSectionIndex).map(id => {
                const section = AppState.generated.script[id];
                if (!section || !section.text) throw new Error(`Seção anterior '${id}' não gerada.`);
                return section.text;
            });
            contextText = prevSectionsContent.join('\n\n---\n\n');
        }

        const keyMap = { intro: 'introduction', development: 'development', climax: 'climax' };
        const directive = AppState.generated.strategicOutline ? AppState.generated.strategicOutline[keyMap[sectionName]] : null;
        const { prompt, maxTokens } = constructScriptPrompt(sectionName, sectionTitle, directive, contextText);

        const rawResult = await callGroqAPI(prompt, maxTokens);
        
        // <<< A GRANDE MUDANÇA: PROCESSANDO O ARRAY JSON >>>
        const paragraphs = cleanGeneratedText(rawResult, true);

        if (!Array.isArray(paragraphs) || paragraphs.length === 0) {
            console.error("Resposta da IA não foi um array de parágrafos válido:", rawResult);
            throw new Error("A IA não retornou o roteiro no formato de parágrafos esperado. Tente novamente.");
        }

        const contentWithDivs = paragraphs.map((p, index) =>
            `<div id="${elementId}-p-${index}">${DOMPurify.sanitize(p)}</div>`
        ).join('');
        
        const fullText = paragraphs.join('\n\n');

        // Atualiza o estado central
        if (AppState.generated.script.hasOwnProperty(sectionName)) {
            AppState.generated.script[sectionName] = {
                html: contentWithDivs,
                text: fullText
            };
            console.log(`Estado para '${sectionName}' atualizado no AppState.`);
        }

        // Renderiza na UI
        if (targetSectionElement) {
            const sectionElement = generateSectionHtmlContent(elementId, sectionTitle, contentWithDivs);
            targetSectionElement.innerHTML = '';
            targetSectionElement.appendChild(sectionElement);
            targetSectionElement.classList.remove('card', 'card-placeholder', 'flex', 'justify-between', 'items-center');
        }

        markButtonAsCompleted(button.id);

    } catch (error) {
        window.showToast(`Falha ao gerar ${sectionTitle}: ${error.message}`);
        console.error(`Error generating ${sectionTitle}.`, error);
        if (targetSectionElement) {
             const actionName = button.dataset.action;
             targetSectionElement.innerHTML = createScriptSectionPlaceholder(elementId, sectionTitle, button.id, actionName);
        }
    } finally {
        hideButtonLoading(button);
        updateButtonStates();
    }
};





        /**
         * Re-gera o conteúdo de uma secção específica do roteiro.
         * @param {string} sectionName - O nome da secção (ex: 'intro').
         * @param {string} sectionTitle - O título da secção.
         * @param {string} elementId - O ID do elemento HTML da secção.
         */
        // ==========================================================
// FUNÇÃO DE RE-GERAÇÃO CORRIGIDA
// ==========================================================
window.regenerateSection = (fullSectionId) => {
            const sectionName = fullSectionId.replace('Section', '');
            
            const sectionMap = {
    'intro': { title: 'Introdução', elementId: 'intro' },
    'development': { title: 'Desenvolvimento', elementId: 'development' },
    'climax': { title: 'Clímax', elementId: 'climax' },
    'conclusion': { title: 'Conclusão', elementId: 'conclusion' }, // Título corrigido
    'cta': { title: 'Call to Action (CTA)', elementId: 'cta' } // <<< ADICIONADO
};

            const sectionInfo = sectionMap[sectionName];
            
            if (sectionInfo) {
                // Encontra o botão de re-gerar que foi clicado, em vez de um botão antigo
                const button = document.querySelector(`[data-action='regenerate'][data-section-id='${fullSectionId}']`);
                if (button) {
                     handleGenerateSection(button, sectionName, sectionInfo.title, sectionInfo.elementId);
                } else {
                    console.error(`Botão de re-gerar não encontrado para a seção: ${fullSectionId}`);
                }
            } else {
                console.error(`Informações da seção não encontradas para: ${sectionName}`);
            }
        };


// =========================================================================
// >>>>> VERSÃO OTIMIZADA que NÃO SALVA o styleBlock repetidamente <<<<<
// =========================================================================
window.generatePromptsForSection = async (button, sectionElementId) => {
    const sectionElement = document.getElementById(sectionElementId);
    const contentWrapper = sectionElement?.querySelector('.generated-content-wrapper');
    const promptContainer = sectionElement?.querySelector('.prompt-container');

    if (!contentWrapper || !contentWrapper.textContent.trim() || !promptContainer) {
        window.showToast("Gere o conteúdo do roteiro desta seção primeiro.");
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
                paragraphsWithContext.push({ text: child.textContent.trim().replace(/\[.*?\]/g, ''), chapter: currentChapterTitle, originalId: child.id });
            }
        });

        if (paragraphsWithContext.length === 0) { throw new Error("Não foram encontrados parágrafos estruturados para análise."); }

        // A lógica de chamada da IA em lotes permanece a mesma
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
            
            // Usamos a versão evoluída do filtro, esperando um array
            apiPromises.push(callGroqAPI(prompt, 4000).then(res => cleanGeneratedText(res, true, true)));
        }

        const allBatchResults = await Promise.all(apiPromises);
        let allGeneratedPrompts = allBatchResults.flat();

        if (!Array.isArray(allGeneratedPrompts) || allGeneratedPrompts.length < paragraphsWithContext.length) {
            throw new Error("A IA não retornou um prompt para cada parágrafo.");
        }

        const curatedPrompts = allGeneratedPrompts.map((promptData, index) => ({
            scriptPhrase: paragraphsWithContext[index].text,
            imageDescription: promptData.imageDescription || "Falha ao gerar descrição.",
            estimated_duration: promptData.estimated_duration || 5
        }));

        // <<<< AQUI ESTÁ A MUDANÇA-CHAVE >>>>
        // 1. Verificamos se o estilo cinematográfico deve ser aplicado.
        const applyCinematicStyle = document.getElementById('imageStyleSelect').value === 'cinematic';

        // 2. Salvamos no AppState APENAS a informação e o SINALIZADOR, não o bloco de texto.
        AppState.generated.imagePrompts[sectionElementId] = curatedPrompts.map(p => ({
            ...p,
            applyStyleBlock: applyCinematicStyle // Salva 'true' ou 'false'
        }));
        // <<<< FIM DA MUDANÇA >>>>

        // O resto da função para preparar a renderização continua igual
        AppState.ui.promptPaginationState[sectionElementId] = 0;
        if (typeof window.allImagePrompts === 'undefined') window.allImagePrompts = {};
        if (typeof window.promptPaginationState === 'undefined') window.promptPaginationState = {};
        window.allImagePrompts[sectionElementId] = AppState.generated.imagePrompts[sectionElementId];
        window.promptPaginationState[sectionElementId] = AppState.ui.promptPaginationState[sectionElementId];

        promptContainer.innerHTML = `
            <div class="prompt-pagination-wrapper space-y-4">
                <div class="prompt-nav-container flex items-center justify-center gap-4"></div>
                <div class="prompt-items-container space-y-4"></div>
            </div>
        `;
        renderPaginatedPrompts(sectionElementId);

    } catch (error) {
        promptContainer.innerHTML = `<p class="text-red-500 text-sm">Falha ao gerar prompts: ${error.message}</p>`;
        console.error("Erro detalhado em generatePromptsForSection:", error);
    } finally {
        hideButtonLoading(button);
        updateButtonStates();
    }
};


// =========================================================================
// >>>>> FIM DA VERSÃO BLINDADA DE 'generatePromptsForSection' <<<<<
// =========================================================================



    
        /**
         * Sugere trilhas sonoras para uma secção específica do roteiro.
         * @param {string} sectionId - O ID do elemento HTML da secção (ex: 'introSection').
         */
        window.suggestSoundtrack = async (sectionId) => {
            const sectionElement = document.getElementById(sectionId);
            const scriptContent = sectionElement.querySelector('.generated-content-wrapper').textContent; 
            const soundtrackContainer = sectionElement.querySelector('.soundtrack-container');
            
            if (!scriptContent) {
                window.showToast("Gere o roteiro para esta secção primeiro.");
                return;
            }

            soundtrackContainer.innerHTML = `<div class="loading-spinner-small"></div>`; 

            const prompt = `Você é um especialista em prompts para IAs de geração de música (como Suno/Udio). Sua tarefa é analisar o seguinte trecho de roteiro e criar 3 prompts de texto distintos e detalhados.

            **REGRAS DE FORMATAÇÃO (NÃO NEGOCIÁVEIS):**1.  Sua resposta DEVE SER um array JSON válido.2.  O array deve conter EXATAMENTE 3 strings.3.  CADA string deve ser um parágrafo único, bem escrito e descritivo, pronto para ser colado em uma IA de música. NÃO use chaves, colchetes ou qualquer outra sintaxe de objeto DENTRO da string do prompt.

            **EXEMPLO DE RESPOSTA PERFEITA:**
            ["Generate an epic, cinematic orchestral piece in the style of Hans Zimmer... No vocals or percussion, focus on the emotional intensity of the strings and piano.","Create a contemplative, melancholic ambient track with a slow, mournful tempo... No bright or cheerful notes, focus on the darker, more introspective tones.","Craft an uplifting, inspirational electronic piece with a moderate tempo... avoid any jarring or harsh sounds, focusing on the soaring, inspirational quality of the melody."
            ]

                Agora, use o roteiro abaixo como inspiração para criar 3 prompts seguindo EXATAMENTE este formato.

            Trecho do roteiro para analisar:
                    ---
                ${scriptContent}

                ---`;
            
            try {
                const rawResult = await callGroqAPI(prompt, 500);
                const cleanedResult = cleanGeneratedText(rawResult, true);
                const suggestions = JSON.parse(cleanedResult);

                // Adiciona tratamento de erro para garantir que suggestions é um array de strings
                if (!Array.isArray(suggestions) || !suggestions.every(s => typeof s === 'string')) {
                    throw new Error("A IA retornou um formato de trilha sonora inesperado. Esperava um array de strings.");
                }

                soundtrackContainer.innerHTML = ''; // Limpa o spinner
                if (suggestions && suggestions.length > 0) {
                    // Agora envolvemos a lista em um div com as classes corretas para ter um fundo e padding.
                    let suggestionsHtml = '<div class="card-background p-4 rounded-lg shadow-inner">';
                    suggestionsHtml += '<ul class="soundtrack-list">';
                    suggestions.forEach(suggestion => {
                        suggestionsHtml += `<li>${suggestion}</li>`;
                    });
                    suggestionsHtml += '</ul>';
                    suggestionsHtml += '</div>'; 

                    soundtrackContainer.innerHTML = suggestionsHtml;
                } else {
                    soundtrackContainer.innerHTML = '<p class="text-gray-500 text-sm">Nenhuma sugestão de trilha sonora foi gerada.</p>';
                }
            } catch (error) {
                soundtrackContainer.innerHTML = `<p class="text-red-500 text-sm">Falha ao gerar sugestões: ${error.message}</p>`;
                console.error("Erro detalhado em suggestSoundtrack:", error);
            }
        };

        /**
         * Copia a transcrição para a área de transferência e
         * inicia o download de um arquivo .rtf limpo e com a codificação correta.
         */
        const handleCopyAndDownloadTranscript = () => {
            const transcriptText = getTranscriptOnly();

            if (!transcriptText) {
                window.showToast("Nenhum roteiro para copiar. Gere as seções primeiro.", 'info');
                return;
            }

            copyTextToClipboard(transcriptText);
            window.showToast("Transcrição copiada! Download do arquivo .rtf iniciado.", 'success');

            const fileName = (document.getElementById('videoTheme').value.trim().replace(/[^a-zA-Z0-9]/gi, '_').toLowerCase() || 'roteiro') + '_transcricao.rtf';
            
            // **A CORREÇÃO ESTÁ AQUI:**
            // 1. Escapa o texto para o formato RTF.
            // 2. Substitui as quebras de linha pelo comando de parágrafo do RTF.
            const safeText = escapeRtf(transcriptText);
            const rtfContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl{\\f0 Arial;}}\\f0\\fs24 ${safeText.replace(/\n/g, '\\par\r\n')}}`;
            
            const blob = new Blob([rtfContent], { type: 'application/rtf' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        };


    
// =========================================================================
// >>>>> VERSÃO REATORADA de 'generateTitlesAndThumbnails' <<<<<
// =========================================================================
const generateTitlesAndThumbnails = async (button) => {
    if (!validateInputs()) return;
    showButtonLoading(button);

    try {
        const { prompt, maxTokens } = constructScriptPrompt('titles_thumbnails');
        
        const rawResult = await callGroqAPI(prompt, maxTokens);
        const parsedContent = cleanGeneratedText(rawResult, true);
        
        if (!Array.isArray(parsedContent) || parsedContent.length === 0 || !parsedContent[0].suggested_title) {
            throw new Error("A IA retornou os dados de títulos em um formato inesperado.");
        }

        const titles = parsedContent.map(item => item.suggested_title);
        const thumbnails = parsedContent.map(item => ({
            title: item.thumbnail_title,
            description: item.thumbnail_description
        }));
        
        // --- A MUDANÇA ESTÁ AQUI ---
        // Gravamos o resultado no nosso "cérebro" central.
        AppState.generated.titlesAndThumbnails = { titles, thumbnails };
        // --- FIM DA MUDANÇA ---

        const targetContentElement = document.getElementById('titlesThumbnailsContent');
        if (targetContentElement) {
            // A lógica de renderização do HTML continua a mesma
            const titlesListHtml = titles.map((title, index) => `<p>${index + 1}. ${DOMPurify.sanitize(title)}</p>`).join('');
            const thumbnailsListHtml = thumbnails.map((thumb, index) => `
                <div class="thumbnail-idea"> 
                    <h4 class="font-semibold">"${DOMPurify.sanitize(thumb.title)}"</h4>
                    <p>Descrição: ${DOMPurify.sanitize(thumb.description)}</p>
                </div>
            `).join('');

            targetContentElement.innerHTML = `
                <div class="generated-output-box">
                    <div class="output-content-block">
                        <h4 class="output-subtitle">Sugestões de Títulos:</h4>
                        ${titlesListHtml}
                        <div class="mt-3">
                            <button class="btn btn-secondary btn-small" onclick="window.analyzeTitles()">Analisar CTR</button>
                            <div id="ctrAnalysisResult" class="mt-3"></div>
                        </div>
                    </div>
                    <div class="output-content-block">
                        <h4 class="output-subtitle">Ideias de Thumbnail:</h4>
                        ${thumbnailsListHtml}
                        <div class="mt-3">
                            <button class="btn btn-secondary btn-small" onclick="window.analyzeThumbnails()">Analisar Thumbnails</button>
                            <div id="thumbnailAnalysisResult" class="mt-3"></div>
                        </div>
                    </div>
                </div>
            `;
            markButtonAsCompleted(button.id);
        }
    } catch (error) {
        window.showToast(`Erro: Arquivo de projeto inválido ou corrompido.`, 'error');
        console.error("Error generating Titles/Thumbnails.", error);
    } finally {
        hideButtonLoading(button);
        // updateButtonStates(); // Precisará ser refatorado
    }
};






// =========================================================================
// >>>>> VERSÃO CORRIGIDA que lê os dados do AppState <<<<<
// =========================================================================
window.analyzeTitles = async () => {
    // <<<< AQUI ESTÁ A CORREÇÃO >>>>
    // Pega os dados diretamente do "cérebro" da aplicação
    const titlesData = AppState.generated.titlesAndThumbnails;

    if (!titlesData || !titlesData.titles || titlesData.titles.length === 0) {
        window.showToast("Gere os títulos primeiro antes de analisar!", 'info');
        return;
    }

    const resultContainer = document.getElementById('ctrAnalysisResult');
    resultContainer.innerHTML = `<div class="loading-spinner-small mx-auto my-2"></div>`;

    // Usa os títulos do objeto que acabamos de pegar
    const titlesString = titlesData.titles.join('\n');
    
    const prompt = `Você é uma API de análise de títulos do YouTube que retorna APENAS um array JSON.

**REGRAS CRÍTICAS DE SINTAXE E ESTRUTURA (INEGOCIÁVEIS):**
1.  **JSON PURO:** Sua resposta inteira deve ser APENAS o código JSON, começando com \`[\` e terminando com \`]\`.
2.  **ASPAS DUPLAS, SEMPRE:** TODAS as chaves e valores de texto DEVEM usar aspas duplas (\`"\`).
3.  **VÍRGULA FINAL:** Cada objeto JSON dentro do array DEVE ser seguido por uma vírgula, EXCETO o último objeto.
4.  **ESTRUTURA DO OBJETO:** Cada objeto no array DEVE conter EXATAMENTE estas três chaves: "titulo_original" (string), "nota_ctr" (um número de 0 a 10), e "sugestao_melhora" (string).

**EXEMPLO DE FORMATO PERFEITO E OBRIGATÓRIO:**
[
  {
    "titulo_original": "Título Exemplo 1",
    "nota_ctr": 8,
    "sugestao_melhora": "Adicionar um número ou um gatilho de curiosidade."
  },
  {
    "titulo_original": "Título Exemplo 2",
    "nota_ctr": 6,
    "sugestao_melhora": "Encurtar para ser mais direto e impactante."
  }
]

**Títulos para analisar:**
---
${titlesString}
---

Responda APENAS com o array JSON completo e sintaticamente PERFEITO, seguindo EXATAMENTE as regras acima.`;

    try {
        const rawResult = await callGroqAPI(prompt, 3000);
        const analysis = cleanGeneratedText(rawResult, true, true);

        if (!analysis || !Array.isArray(analysis)) {
            throw new Error("A IA não retornou uma análise de títulos em formato válido.");
        }

        let analysisHtml = '<div class="space-y-4">';
        analysis.forEach(item => {
            analysisHtml += `
                <div class="p-3 bg-gray-100 dark:bg-gray-800 rounded-md shadow-sm">
                    <p class="font-semibold">${DOMPurify.sanitize(item.titulo_original)}</p>
                    <p class="text-sm mt-1"><strong>Nota de CTR:</strong> <span class="text-indigo-500 font-bold">${DOMPurify.sanitize(String(item.nota_ctr))} / 10</span></p>
                    <p class="text-sm mt-1"><strong>Sugestão:</strong> ${DOMPurify.sanitize(item.sugestao_melhora)}</p>
                </div>
            `;
        });
        analysisHtml += '</div>';
        resultContainer.innerHTML = analysisHtml;

    } catch (error) {
        console.error("Erro detalhado em analyzeTitles:", error);
        resultContainer.innerHTML = `<p class="text-red-500 text-sm">Falha ao analisar os títulos: ${error.message}</p>`;
    }
};

// =========================================================================
// >>>>> VERSÃO CORRIGIDA que lê os dados do AppState <<<<<
// =========================================================================
window.analyzeThumbnails = async () => {
    // <<<< AQUI ESTÁ A CORREÇÃO >>>>
    const thumbnailsData = AppState.generated.titlesAndThumbnails;

    if (!thumbnailsData || !thumbnailsData.thumbnails || thumbnailsData.thumbnails.length === 0) {
        window.showToast("Gere as ideias de thumbnail primeiro antes de analisar!", 'info');
        return;
    }

    const resultContainer = document.getElementById('thumbnailAnalysisResult');
    resultContainer.innerHTML = `<div class="loading-spinner-small mx-auto my-2"></div>`;
    
    // Usa as thumbnails do objeto que acabamos de pegar
    const thumbnailsString = thumbnailsData.thumbnails.map(t => `Título: ${t.title}, Descrição: ${t.description}`).join('\n---\n');
    
    const prompt = `Você é uma API de análise de thumbnails do YouTube que retorna APENAS um array JSON.

**REGRAS CRÍTICAS DE SINTAXE E ESTRUTURA (INEGOCIÁVEIS):**
1.  **JSON PURO:** Sua resposta inteira deve ser APENAS o código JSON, começando com \`[\` e terminando com \`]\`.
2.  **ASPAS DUPLAS, SEMPRE:** TODAS as chaves e valores de texto DEVEM usar aspas duplas (\`"\`).
3.  **VÍRGULA FINAL:** Cada objeto JSON dentro do array DEVE ser seguido por uma vírgula, EXCETO o último objeto.
4.  **ESTRUTURA DO OBJETO:** Cada objeto no array DEVE conter EXATAMENTE estas três chaves: "titulo" (string, contendo o título original da ideia analisada), "nota_visual" (um número de 0 a 10), e "sugestao_melhora" (string).

**EXEMPLO DE FORMATO PERFEITO E OBRIGATÓRIO:**
[
  {
    "titulo": "Ideia de Thumbnail 1",
    "nota_visual": 7,
    "sugestao_melhora": "Aumentar o contraste e usar uma fonte mais legível no texto."
  },
  {
    "titulo": "Ideia de Thumbnail 2",
    "nota_visual": 9,
    "sugestao_melhora": "Adicionar um contorno brilhante ao redor da pessoa para destacá-la do fundo."
  }
]

**Ideias para analisar:**
---
${thumbnailsString}
---

Responda APENAS com o array JSON completo e sintaticamente PERFEITO, seguindo EXATAMENTE as regras acima.`;

    try {
        const rawResult = await callGroqAPI(prompt, 2500);
        const analysis = cleanGeneratedText(rawResult, true, true);

        if (!analysis || !Array.isArray(analysis)) {
            throw new Error("A IA não retornou uma análise de thumbnails em formato válido.");
        }

        let analysisHtml = '<div class="space-y-4">';
        analysis.forEach(item => {
            analysisHtml += `
                <div class="p-3 bg-gray-100 dark:bg-gray-800 rounded-md shadow-sm">
                    <p class="font-semibold">"${DOMPurify.sanitize(item.titulo || 'Ideia Sem Título')}"</p>
                    <p class="text-sm mt-1"><strong>Nota de Potencial Visual:</strong> <span class="text-indigo-500 font-bold">${DOMPurify.sanitize(String(item.nota_visual))} / 10</span></p>
                    <p class="text-sm mt-1"><strong>Sugestão:</strong> ${DOMPurify.sanitize(item.sugestao_melhora)}</p>
                </div>
            `;
        });
        analysisHtml += '</div>';
        resultContainer.innerHTML = analysisHtml;

    } catch (error) {
        console.error("Erro detalhado em analyzeThumbnails:", error);
        resultContainer.innerHTML = `<p class="text-red-500 text-sm">Falha ao analisar as thumbnails: ${error.message}</p>`;
    }
};



// =========================================================================
// >>>>> VERSÃO REATORADA de 'generateVideoDescription' <<<<<
// =========================================================================
const generateVideoDescription = async (button) => {
    if (!validateInputs()) return;
    showButtonLoading(button);

    try {
        const { prompt, maxTokens } = constructScriptPrompt('description');
        let result = await callGroqAPI(prompt, maxTokens);
        result = cleanGeneratedText(result, false);
        result = removeMetaComments(result);
        
        // --- A MUDANÇA ESTÁ AQUI ---
        // Gravamos a descrição gerada no nosso "cérebro" central.
        AppState.generated.description = result;
        // --- FIM DA MUDANÇA ---
        
        const targetContentElement = document.getElementById('videoDescriptionContent');
        if (targetContentElement) {
            const sanitizedResult = DOMPurify.sanitize(`<div class="generated-output-box whitespace-pre-wrap">${result}</div>`);
            targetContentElement.innerHTML = sanitizedResult;
            markButtonAsCompleted(button.id);
        }
    } catch (error) {
        window.showToast(`Falha ao sugerir estratégia: ${error.message}`, 'error');
        console.error("Error generating Video Description.", error);
    } finally {
        hideButtonLoading(button);
        // updateButtonStates(); // Precisará ser refatorado
    }
};





// =========================================================================================
// >>>>> VERSÃO FINAL E AUTÔNOMA de 'generateStrategicOutline' (com Limpeza Integrada) <<<<<
// =========================================================================================
const generateStrategicOutline = async (button) => {
    if (!validateInputs()) return;

    // --- ETAPA 1: LIMPEZA PROFUNDA INTEGRADA ---
    console.log("Iniciando limpeza profunda para novo esboço...");

    // Limpa o roteiro e o esboço da memória (AppState)
    AppState.generated.strategicOutline = null;
    AppState.generated.script = {
        intro: { html: null, text: null },
        development: { html: null, text: null },
        climax: { html: null, text: null },
        conclusion: { html: null, text: null },
        cta: { html: null, text: null }
    };

    // Limpa TODOS os recursos derivados da memória (AppState)
    AppState.generated.emotionalMap = null;
    AppState.generated.titlesAndThumbnails = null;
    AppState.generated.description = null;
    AppState.generated.soundtrack = null;
    AppState.generated.imagePrompts = {};

    // Limpa os containers da UI para refletir a memória limpa
    const scriptContainer = document.getElementById('scriptSectionsContainer');
    if (scriptContainer) scriptContainer.innerHTML = '';

    const outlineContent = document.getElementById('outlineContent');
    if(outlineContent) outlineContent.innerHTML = `<div class="asset-card-placeholder">Clique para gerar o esboço.</div>`;

    const placeholdersToReset = {
        'emotionalMapContent': 'Gere o roteiro completo para habilitar.',
        'titlesThumbnailsContent': 'Gere o roteiro para habilitar.',
        'videoDescriptionContent': 'Gere o roteiro para habilitar.',
        'soundtrackContent': 'Gere o roteiro para habilitar.'
    };

    for (const id in placeholdersToReset) {
        const element = document.getElementById(id);
        if (element) {
            element.innerHTML = `<div class="asset-card-placeholder">${placeholdersToReset[id]}</div>`;
        }
    }
    
    const analysisContainers = ['analysisReportContainer', 'hooksReportContainer', 'viralSuggestionsContainer'];
    analysisContainers.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.innerHTML = '';
    });
    console.log("Limpeza profunda concluída.");
    // --- FIM DA LIMPEZA ---
    
    showButtonLoading(button);
    
    const outlineContentDiv = document.getElementById('outlineContent');
    outlineContentDiv.innerHTML = `<div class="loading-spinner-small mx-auto"></div>`;

    try {
        const { prompt } = constructScriptPrompt('outline');
        const rawResult = await callGroqAPI(prompt, 4000);
        
        AppState.generated.strategicOutline = cleanGeneratedText(rawResult, true);
        
        const strategicOutline = AppState.generated.strategicOutline;

        if (!strategicOutline || typeof strategicOutline !== 'object' || !strategicOutline.introduction) {
            throw new Error("A IA falhou em gerar um esboço válido.");
        }

        const titleTranslations = {
            'introduction': 'Introdução', 'development': 'Desenvolvimento',
            'climax': 'Clímax', 'conclusion': 'Conclusão', 'cta': 'CTA'
        };
        
        let outlineHtml = '<ul class="space-y-4 text-sm">';
        for (const key in strategicOutline) {
            if (Object.hasOwnProperty.call(strategicOutline, key)) {
                const translatedTitle = titleTranslations[key] || key;
                outlineHtml += `<li><div><strong class="text-indigo-600 dark:text-indigo-400">${translatedTitle}:</strong> <span class="text-gray-600 dark:text-gray-300">${DOMPurify.sanitize(strategicOutline[key])}</span></div></li>`;
            }
        }
        outlineHtml += '</ul>';
        
        outlineContentDiv.innerHTML = outlineHtml;
        markButtonAsCompleted(button.id);

        // Cria os novos placeholders para as seções do roteiro
        if(scriptContainer) {
            scriptContainer.innerHTML = ''; 
            scriptContainer.innerHTML += createScriptSectionPlaceholder('intro', 'Introdução', 'generateIntroBtn', 'generateIntro');
            scriptContainer.innerHTML += createScriptSectionPlaceholder('development', 'Desenvolvimento', 'generateDevelopmentBtn', 'generateDevelopment');
            scriptContainer.innerHTML += createScriptSectionPlaceholder('climax', 'Clímax', 'climaxBtn', 'generateClimax');
        }

    } catch (error) {
        console.error("Erro detalhado em generateStrategicOutline:", error);
        window.showToast(`Falha ao gerar Esboço: ${error.message}`);
        if(outlineContentDiv) outlineContentDiv.innerHTML = `<div class="asset-card-placeholder text-red-500">Ocorreu um erro. Tente novamente.</div>`;
    } finally {
        hideButtonLoading(button);
        updateButtonStates();
    }
};





        /**
         * Realiza o download do roteiro como PDF.
         */
        const downloadPdf = async () => {
            // 1. Criar um container temporário para a impressão
            let printContainer = document.createElement('div');
            printContainer.id = 'print-container';

            // 2. Coletar e formatar TODO o conteúdo que queremos imprimir
            let htmlToPrint = `<h1 style="text-align: center; font-size: 22pt; margin-bottom: 24px;">${elements.videoTheme.value}</h1>`;

            // Adicionar o esboço estratégico
            if (strategicOutline) {
                const titleTranslations = {
                    'introduction': 'Introdução',
                    'development': 'Desenvolvimento',
                    'climax': 'Clímax',
                    'conclusion': 'Conclusão',
                    'cta': 'CTA'
                };
                htmlToPrint += `
                    <div class="print-section">
                        <div class="print-section-title">Esboço Estratégico</div>
                        <div class="print-section-content">
                            <ul style="list-style-type: disc; padding-left: 20px;">`;
                for (const key in strategicOutline) {
                    const translatedTitle = titleTranslations[key] || (key.charAt(0).toUpperCase() + key.slice(1));
                    htmlToPrint += `<li><strong>${translatedTitle}:</strong> ${strategicOutline[key]}</li>`;
                }
                htmlToPrint += `</ul></div></div>`;
            }

            // Adicionar o roteiro principal
            document.querySelectorAll('#scriptSectionsContainer .accordion-item').forEach(item => {
                const title = item.querySelector('h3')?.textContent;
                const content = item.querySelector('.generated-content-wrapper')?.textContent;
                if (title && content) {
                    htmlToPrint += `
                        <div class="print-section">
                            <div class="print-section-title">${title}</div>
                            <div class="print-section-content"><pre>${content}</pre></div>
                        </div>`;
                }
            });
            
            // Adicionar Descrição e Hashtags
            const videoDescriptionContent = document.getElementById('videoDescriptionContent');
            if (videoDescriptionContent && videoDescriptionContent.textContent.trim() !== 'Clique em \'Gerar\' para ver a descrição') {
                htmlToPrint += `
                    <div class="print-section">
                        <div class="print-section-title">Descrição & Hashtags</div>
                        <div class="print-section-content">${videoDescriptionContent.innerHTML}</div>
                    </div>`;
            }

            // Adicionar Títulos e Thumbnails
            const titlesThumbnailsContent = document.getElementById('titlesThumbnailsContent');
            if (titlesThumbnailsContent && titlesThumbnailsContent.textContent.trim() !== 'Clique em \'Gerar\' para ver as sugestões') {
                htmlToPrint += `
                    <div class="print-section">
                        <div class="print-section-title">Títulos & Thumbnails</div>
                        <div class="print-section-content">${titlesThumbnailsContent.innerHTML}</div>
                    </div>`;
            }

            // 3. Injetar o HTML no container e adicioná-lo ao body
            printContainer.innerHTML = htmlToPrint;
            document.body.appendChild(printContainer);

            // 4. Chamar a impressão
            window.print();

            // 5. Remover o container temporário após a impressão (com um pequeno atraso para garantir a renderização)
            setTimeout(() => {
                document.body.removeChild(printContainer);
            }, 500); // 500ms de atraso
        };



// =========================================================================
// >>>>> VERSÃO FINAL E DEFINITIVA de 'resetApplicationState' <<<<<
// =========================================================================
const resetApplicationState = async () => {
    console.log("--- Executando Reset Completo da Aplicação ---");

    // ----- ETAPA 1: Resetar o "Cérebro" AppState para o estado inicial -----
    Object.assign(AppState, {
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
        ui: { isSettingStrategy: false, promptPaginationState: {} }
    });
    
    // Zera variáveis globais legadas por segurança
    window.emotionalMap = [];
    window.allImagePrompts = {};
    window.promptPaginationState = {};

    // ----- ETAPA 2: Limpar TODOS os Outputs da UI -----
    const outputContainers = [
        'factCheckOutput', 'ideasOutput', 'scriptSectionsContainer', 'outlineContent',
        'titlesThumbnailsContent', 'videoDescriptionContent', 'soundtrackContent',
        'emotionalMapContent', 'analysisReportContainer', 'hooksReportContainer',
        'viralSuggestionsContainer'
    ];
    outputContainers.forEach(id => {
        const container = document.getElementById(id);
        if (container) container.innerHTML = '';
    });

    // ----- ETAPA 3: Resetar Placeholders e Estruturas Iniciais -----
    document.getElementById('outlineContent').innerHTML = '<div class="asset-card-placeholder">Clique para gerar o esboço.</div>';
    document.getElementById('emotionalMapContent').innerHTML = '<div class="asset-card-placeholder">Gere o roteiro completo para habilitar.</div>';
    // ... (adicione os outros placeholders aqui)

    // ----- ETAPA 4: Limpar TODOS os Inputs do Formulário -----
    const inputIdsToReset = [
        'factCheckQuery', 'videoTheme', 'videoDescription', 'targetAudience', 'narrativeTheme', 
        'centralQuestion', 'emotionalHook', 'narrativeVoice', 'emotionalArc', 'shockingEndingHook', 
        'researchData', 'imageDescriptionEngine', 'customImageStyle', 'conclusionSpecifics', 'ctaSpecifics'
    ];
    inputIdsToReset.forEach(id => {
        const input = document.getElementById(id);
        if (input) input.value = '';
    });
    document.getElementById('channelName').value = 'The Biblical Unveiling'; // Valor padrão

    // ----- ETAPA 5: Resetar Selects e Rádios para o Padrão -----
    document.getElementById('languageSelect').value = 'en';
    document.getElementById('videoDuration').value = '';
    // ... (resete os outros selects para seus valores padrão)
    const lessonRadio = document.querySelector('input[name="conclusionType"][value="lesson"]');
    if (lessonRadio) lessonRadio.checked = true;

    // ----- ETAPA 6: GARANTE que a UI volte ao estado inicial visual -----
    updateNarrativeStructureOptions();
    toggleCustomImageStyleVisibility();
    document.getElementById('projectDashboard').classList.add('hidden');
    // ... (esconda as outras seções dinâmicas)

    // ----- ETAPA 7: Atualiza o resto da UI -----
    updateProgressBar();
    localStorage.removeItem('viralScriptGeneratorProject');
    window.showToast("Pronto para um novo projeto!", 'success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
};



// =========================================================================
// >>>>> VERSÃO FINAL E COMPLETA de 'getProjectStateForExport' (Salva Rádios) <<<<<
// =========================================================================
/**
 * Reúne todos os dados relevantes da aplicação (inputs e estado gerado) em um único objeto para ser salvo.
 * @returns {object} Um objeto contendo o estado completo do projeto.
 */
const getProjectStateForExport = () => {
    // 1. Cria uma cópia profunda do AppState para não modificar o original.
    const stateToExport = JSON.parse(JSON.stringify(AppState));

    // 2. Itera sobre todos os campos de formulário e salva seus valores atuais
    // ESTA LINHA FOI ATUALIZADA para incluir os textareas do módulo de conclusão
    const formElements = document.querySelectorAll('#inputTabContent input, #inputTabContent select, #inputTabContent textarea, #factCheckQuery, #languageSelect, #conclusionStrategyModule textarea');
    formElements.forEach(el => {
        if (el.type !== 'radio') { // Ignora os rádios por enquanto
            stateToExport.inputs[el.id] = el.value;
        }
    });

    // <<< A EVOLUÇÃO CRÍTICA ESTÁ AQUI: LÓGICA ESPECIAL PARA SALVAR O RÁDIO SELECIONADO >>>
    const checkedConclusionType = document.querySelector('input[name="conclusionType"]:checked');
    if (checkedConclusionType) {
        stateToExport.inputs['conclusionType'] = checkedConclusionType.value;
    }
    
    // 3. Salva o HTML gerado para cada seção do roteiro.
    const sectionIds = ['intro', 'development', 'climax', 'conclusion', 'cta'];
    sectionIds.forEach(id => {
        const wrapper = document.querySelector(`#${id}Section .generated-content-wrapper`);
        if (wrapper) {
            stateToExport.generated.script[id].html = wrapper.innerHTML;
            stateToExport.generated.script[id].text = wrapper.textContent.trim();
        }
    });

    // 4. Salva o HTML de outros painéis gerados.
    stateToExport.generated.strategicOutlineHTML = document.getElementById('outlineContent')?.innerHTML;
    stateToExport.generated.titlesAndThumbnailsHTML = document.getElementById('titlesThumbnailsContent')?.innerHTML;
    stateToExport.generated.descriptionHTML = document.getElementById('videoDescriptionContent')?.innerHTML;
    stateToExport.generated.soundtrackHTML = document.getElementById('soundtrackContent')?.innerHTML;
    stateToExport.generated.emotionalMapHTML = document.getElementById('emotionalMapContent')?.innerHTML;

    return stateToExport;
};




// =========================================================================
// >>>>> VERSÃO EVOLUÍDA de 'syncUiFromState' (Carrega Rádios) <<<<<
// =========================================================================
const syncUiFromState = () => {
    const state = AppState;

    // 1. Restaura os valores dos inputs de texto, selects, textareas
    for (const id in state.inputs) {
        const element = document.getElementById(id);
        if (element && element.type !== 'radio') {
            element.value = state.inputs[id];
        }
    }

    // <<< A CORREÇÃO ESTÁ AQUI: LÓGICA ESPECIAL PARA CARREGAR O RÁDIO CORRETO >>>
    if (state.inputs && state.inputs.conclusionType) {
        const radioToSelect = document.querySelector(`input[name="conclusionType"][value="${state.inputs.conclusionType}"]`);
        if (radioToSelect) {
            radioToSelect.checked = true;
        }
    } else {
        // Se não houver estado salvo para o rádio, garante que o padrão "lesson" esteja marcado
        const defaultRadio = document.querySelector('input[name="conclusionType"][value="lesson"]');
        if (defaultRadio) defaultRadio.checked = true;
    }

    // O resto da função continua o mesmo...
    updateNarrativeStructureOptions();
    toggleCustomImageStyleVisibility();

    if (state.generated.strategicOutlineHTML) document.getElementById('outlineContent').innerHTML = state.generated.strategicOutlineHTML;
    if (state.generated.titlesAndThumbnailsHTML) document.getElementById('titlesThumbnailsContent').innerHTML = state.generated.titlesAndThumbnailsHTML;
    if (state.generated.descriptionHTML) document.getElementById('videoDescriptionContent').innerHTML = state.generated.descriptionHTML;
    if (state.generated.soundtrackHTML) document.getElementById('soundtrackContent').innerHTML = state.generated.soundtrackHTML;
    if (state.generated.emotionalMapHTML) document.getElementById('emotionalMapContent').innerHTML = state.generated.emotionalMapHTML;
    
    const scriptContainer = document.getElementById('scriptSectionsContainer');
    scriptContainer.innerHTML = '';
    const sectionOrder = ['intro', 'development', 'climax', 'conclusion', 'cta'];
    const sectionTitles = { intro: 'Introdução', development: 'Desenvolvimento', climax: 'Clímax', conclusion: 'Conclusão', cta: 'Call to Action (CTA)' };
    let hasAnyScriptContent = false;

    sectionOrder.forEach(id => {
        const sectionData = state.generated.script[id];
        const sectionDiv = document.createElement('div');
        sectionDiv.id = `${id}Section`;
        sectionDiv.className = 'script-section';
        
        if (sectionData && sectionData.html) {
            hasAnyScriptContent = true;
            const sectionElement = generateSectionHtmlContent(id, sectionTitles[id], sectionData.html);
            sectionDiv.appendChild(sectionElement);
            sectionDiv.classList.remove('card', 'card-placeholder', 'flex', 'justify-between', 'items-center');
        }
        scriptContainer.appendChild(sectionDiv);
    });

    if (state.generated.strategicOutline || hasAnyScriptContent) {
        document.getElementById('projectDashboard').classList.remove('hidden');
    }

    if (AppState.generated.emotionalMap) {
        window.emotionalMap = AppState.generated.emotionalMap;
    }

    if (AppState.generated.imagePrompts) {
        window.allImagePrompts = AppState.generated.imagePrompts;
    }
    if (AppState.ui.promptPaginationState) {
        window.promptPaginationState = AppState.ui.promptPaginationState;
    }
    
    setTimeout(() => {
        updateProgressBar();
        updateButtonStates();
        updateAllReadingTimes();
    }, 100);
};




/**
 * Exporta o estado atual do projeto para um arquivo JSON.
 */
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

/**
 * Importa um projeto de um arquivo JSON e sincroniza a UI.
 */
const importProject = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const loadedState = JSON.parse(e.target.result);
            // Funde o estado carregado com o estado padrão, para garantir compatibilidade com versões futuras.
            Object.assign(AppState, loadedState);
            // Manda a UI se sincronizar com os novos dados do AppState.
            syncUiFromState();
            window.showToast("Projeto importado com sucesso!", 'success');
        } catch (err) {
            window.showToast("Erro: Arquivo de projeto inválido ou corrompido.", 'error');
            console.error("Erro ao importar projeto:", err);
        }
    };
    reader.readAsText(file);
    event.target.value = ''; // Limpa o input.
};







// ====================================================================================
// >>>>> VERSÃO FINAL E AUTÔNOMA de 'suggestStrategy' (com Limpeza Integrada) <<<<<
// ====================================================================================
const suggestStrategy = async (button) => {
    const themeField = document.getElementById('videoTheme');
    if (themeField && themeField.value.trim()) {
        const userConfirmed = await showConfirmationDialog(
            "Refinar Estratégia com IA?",
            "Isso usará a IA para redefinir a estratégia e LIMPARÁ completamente qualquer esboço ou roteiro já gerado. Deseja continuar?"
        );
        if (!userConfirmed) return;
    }

    // --- ETAPA 1: LIMPEZA PROFUNDA INTEGRADA ---
    console.log("Iniciando limpeza profunda para nova estratégia...");

    // Limpa o roteiro e o esboço da memória (AppState)
    AppState.generated.strategicOutline = null;
    AppState.generated.script = {
        intro: { html: null, text: null },
        development: { html: null, text: null },
        climax: { html: null, text: null },
        conclusion: { html: null, text: null },
        cta: { html: null, text: null }
    };

    // Limpa TODOS os recursos derivados da memória (AppState)
    AppState.generated.emotionalMap = null;
    AppState.generated.titlesAndThumbnails = null;
    AppState.generated.description = null;
    AppState.generated.soundtrack = null;
    AppState.generated.imagePrompts = {};

    // Limpa os containers da UI para refletir a memória limpa
    const scriptContainer = document.getElementById('scriptSectionsContainer');
    if (scriptContainer) scriptContainer.innerHTML = '';

    const outlineContent = document.getElementById('outlineContent');
    if(outlineContent) outlineContent.innerHTML = `<div class="asset-card-placeholder">Clique para gerar o esboço.</div>`;

    const placeholdersToReset = {
        'emotionalMapContent': 'Gere o roteiro completo para habilitar.',
        'titlesThumbnailsContent': 'Gere o roteiro para habilitar.',
        'videoDescriptionContent': 'Gere o roteiro para habilitar.',
        'soundtrackContent': 'Gere o roteiro para habilitar.'
    };

    for (const id in placeholdersToReset) {
        const element = document.getElementById(id);
        if (element) {
            element.innerHTML = `<div class="asset-card-placeholder">${placeholdersToReset[id]}</div>`;
        }
    }
    
    const analysisContainers = ['analysisReportContainer', 'hooksReportContainer', 'viralSuggestionsContainer'];
    analysisContainers.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.innerHTML = '';
    });
    console.log("Limpeza profunda concluída.");
    // --- FIM DA LIMPEZA ---

    const theme = document.getElementById('videoTheme')?.value.trim();
    const description = document.getElementById('videoDescription')?.value.trim();
    if (!theme || !description) {
        window.showToast("Preencha o Tema e a Descrição do Vídeo para receber sugestões.", 'info');
        return;
    }
    
    showButtonLoading(button);
    AppState.ui.isSettingStrategy = true;

    // A lógica de chamada da IA e preenchimento dos campos continua a mesma
    const selectedLangCode = document.getElementById('languageSelect').value;
    const languageName = selectedLangCode === 'pt-br' ? 'Português (Brasil)' : 'English';
    
    const validOptions = {
        narrative_goal: `['${Array.from(document.getElementById('narrativeGoal').options).map(o => o.value).filter(Boolean).join("', '")}']`,
        narrative_tone: `['${Array.from(document.getElementById('narrativeTone').options).map(o => o.value).filter(Boolean).join("', '")}']`,
        language_style: `['${Array.from(document.getElementById('languageStyle').options).map(o => o.value).filter(Boolean).join("', '")}']`,
        video_objective: `['${Array.from(document.getElementById('videoObjective').options).map(o => o.value).filter(Boolean).join("', '")}']`,
        speaking_pace: `['${Array.from(document.getElementById('speakingPace').options).map(o => o.value).filter(Boolean).join("', '")}']`,
    };

    const prompt = `Você é uma API de Estratégia de Conteúdo Viral. Sua única função é gerar um objeto JSON com uma estratégia de vídeo completa com base em um tema e descrição.

**REGRAS CRÍTICAS DE SINTAXE JSON (INEGOCIÁVEIS):**
1.  **JSON PURO:** Responda APENAS com um objeto JSON válido.
2.  **ASPAS DUPLAS:** TODAS as chaves e valores de texto DEVEM usar aspas duplas (\`"\`).
3.  **PREENCHIMENTO OBRIGATÓRIO:** TODOS os campos listados no manual DEVEM ser preenchidos.
4.  **IDIOMA:** Todos os valores devem estar em **${languageName}**.

**MANUAL DE PREENCHIMENTO (PREENCHA TODOS OS CAMPOS):**
-   "target_audience": Descreva o espectador ideal.
-   "narrative_goal": Escolha UM de: ${validOptions.narrative_goal}.
-   "narrative_structure": Baseado no "narrative_goal", escolha a estrutura MAIS IMPACTANTE. Se 'storytelling', escolha de: ["documentary", "heroes_journey", "pixar_spine", "mystery_loop", "twist"]. Se 'storyselling', escolha de: ["pas", "bab", "aida", "underdog_victory", "discovery_mentor"].
-   "narrative_theme": A "grande ideia" em uma frase.
-   "narrative_tone": Escolha UM de: ${validOptions.narrative_tone}.
-   "narrative_voice": Crie uma PERSONA para o narrador.
-   "central_question": Formule a pergunta que gera MISTÉRIO.
-   "emotional_arc": Descreva a jornada de sentimentos.
-   "emotional_hook": Crie uma MINI-HISTÓRIA humana.
-   "shocking_ending_hook": Crie a PRIMEIRA FRASE do vídeo.
-   "language_style": Escolha UM de: ${validOptions.language_style}.
-   "video_objective": Escolha UM de: ${validOptions.video_objective}.
-   "speaking_pace": Escolha UM de: ${validOptions.speaking_pace}.
-   "image_description_engine": Forneça 3 a 5 palavras-chave visuais.
-   "research_data": Sugira 2 a 3 PONTOS DE PESQUISA concretos.

**DADOS DE ENTRADA:**
- **Tema do Vídeo:** "${theme}"
- **Descrição:** "${description}"

**AÇÃO FINAL:** Gere AGORA o objeto JSON completo.`;

    try {
        const rawResult = await callGroqAPI(prompt, 4000);
        const strategy = cleanGeneratedText(rawResult, true);

        if (!strategy || typeof strategy !== 'object') {
            throw new Error("A IA não retornou uma resposta em formato JSON válido.");
        }

        const narrativeGoalSelect = document.getElementById('narrativeGoal');
        const narrativeStructureSelect = document.getElementById('narrativeStructure');
        if (narrativeGoalSelect && strategy.narrative_goal) {
            narrativeGoalSelect.value = strategy.narrative_goal;
            updateNarrativeStructureOptions();
        }
        if (narrativeStructureSelect && strategy.narrative_structure) {
            setTimeout(() => {
                if ([...narrativeStructureSelect.options].some(option => option.value === strategy.narrative_structure)) {
                    narrativeStructureSelect.value = strategy.narrative_structure;
                } else {
                    narrativeStructureSelect.selectedIndex = 0;
                }
                updateMainTooltip();
            }, 50);
        }
        
        const keyToElementIdMap = {
            'target_audience': 'targetAudience', 'narrative_theme': 'narrativeTheme',
            'narrative_tone': 'narrativeTone', 'narrative_voice': 'narrativeVoice',
            'central_question': 'centralQuestion', 'emotional_arc': 'emotionalArc',
            'emotional_hook': 'emotionalHook', 'shocking_ending_hook': 'shockingEndingHook',
            'language_style': 'languageStyle', 'video_objective': 'videoObjective',
            'speaking_pace': 'speakingPace', 'image_description_engine': 'imageDescriptionEngine',
            'research_data': 'researchData'
        };
        for (const key in keyToElementIdMap) {
            if (strategy[key]) {
                const element = document.getElementById(keyToElementIdMap[key]);
                if (element) { element.value = strategy[key]; }
            }
        }

        window.showToast("Estratégia refinada pela IA!");
        document.querySelector('[data-tab="input-tab-estrategia"]')?.click();

    } catch (error) {
        console.error("Erro detalhado em suggestStrategy:", error);
        window.showToast(`Falha ao sugerir estratégia: ${error.message}`);
    } finally {
        AppState.ui.isSettingStrategy = false;
        hideButtonLoading(button);
        updateButtonStates();
    }
};





/**
 * Valida os inputs essenciais e avança para o painel de criação do roteiro.
 * Não utiliza a IA, apenas libera a próxima etapa.
 */
const startCrafting = () => {
    // 1. Valida se os campos essenciais estão preenchidos.
    if (!validateInputs()) {
        return;
    }
    
    // 2. Encontra o painel e o torna visível.
    const dashboard = document.getElementById('projectDashboard');
    if (dashboard) {
        dashboard.classList.remove('hidden');
        dashboard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.showToast("Estratégia definida! Pronto para criar o esboço.", 'success');
    }
};

// =========================================================================
// >>>>> SUBSTITUA O SEU LISTENER DOMContentLoaded INTEIRO POR ESTE <<<<<
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {

    // <<<< CÓDIGO DO DARK MODE COLADO AQUI >>>>
    const toggle = document.getElementById('darkModeToggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
        document.documentElement.classList.add('dark');
        // Sincroniza os ícones no carregamento
        document.getElementById('moonIcon')?.classList.add('hidden');
        document.getElementById('sunIcon')?.classList.remove('hidden');
    }
    toggle?.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        localStorage.setItem('theme', theme);
        // Sincroniza os ícones no clique
        const moonIcon = document.getElementById('moonIcon');
        const sunIcon = document.getElementById('sunIcon');
        if (moonIcon) moonIcon.classList.toggle('hidden');
        if (sunIcon) sunIcon.classList.toggle('hidden');
    });

    // --- 1. MAPEAMENTO INICIAL DE ELEMENTOS ---
    document.querySelectorAll('[id]').forEach(el => {
        if (el.tagName === 'BUTTON') { buttons[el.id] = el; } 
        else { elements[el.id] = el; }
    });

    // --- 2. INICIALIZAÇÃO DE FUNÇÕES DA INTERFACE ---
    setupInputTabs();
    setupGenreTabs();
    updateProgressBar();
    updateButtonStates();
    updateNarrativeStructureOptions();
    updateGoalPopover();
    loadStateFromLocalStorage();

    // --- 3. EVENT LISTENERS ESPECÍFICOS ---
    const goalSelect = document.getElementById('narrativeGoal');
    if (goalSelect) { goalSelect.addEventListener('change', updateNarrativeStructureOptions); }

    const structureSelect = document.getElementById('narrativeStructure');
    if (structureSelect) { structureSelect.addEventListener('change', updateMainTooltip); }
    
    const imageStyleSelect = document.getElementById('imageStyleSelect');
    if (imageStyleSelect) { imageStyleSelect.addEventListener('change', toggleCustomImageStyleVisibility); }
    
    const importInput = document.getElementById('importFileInput');
    if (importInput) { importInput.addEventListener('change', importProject); }
    
    const speakingPaceSelect = document.getElementById('speakingPace');
    if (speakingPaceSelect) { speakingPaceSelect.addEventListener('change', updateAllReadingTimes); }
    
    // --- 4. O "GERENTE DE CLIQUES" (OBJETO 'actions') ---
    const actions = {
        'investigate': (btn) => window.verifyFact(btn),
        'generateIdeasFromReport': (btn) => generateIdeasFromReport(btn),
        'select-idea': (btn) => { 
            const ideaString = btn.dataset.idea;
            if(ideaString) selectIdea(JSON.parse(ideaString.replace(/&quot;/g, '"')));
        },
        'suggestStrategy': (btn) => suggestStrategy(btn),
        'startCrafting': (btn) => startCrafting(),
        'generateOutline': (btn) => generateStrategicOutline(btn),
        'generateIntro': (btn) => handleGenerateSection(btn, 'intro', 'Introdução', 'intro'),
        'generateDevelopment': (btn) => handleGenerateSection(btn, 'development', 'Desenvolvimento', 'development'),
        'generateClimax': (btn) => handleGenerateSection(btn, 'climax', 'Clímax', 'climax'),
        'generateConclusion': (btn) => generateConclusion(btn),
        'generateCta': (btn) => generateStrategicCta(btn),
        'suggestFinalStrategy': (btn) => suggestFinalStrategy(btn),
        'addDevelopmentChapter': (btn) => window.addDevelopmentChapter(btn),
        'mapEmotions': (btn) => mapEmotionsAndPacing(btn),
        'generateTitlesAndThumbnails': (btn) => generateTitlesAndThumbnails(btn),
        'generateDescription': (btn) => generateVideoDescription(btn),
        'generateSoundtrack': (btn) => generateSoundtrack(btn),
        'analyzeScript': (btn) => analyzeFullScript(btn),
        'analyzeHooks': (btn) => analyzeRetentionHooks(btn),
        'suggestViralElements': (btn) => suggestViralElements(btn),
        'exportProject': () => exportProject(),
        'exportPdf': () => downloadPdf(),
        'exportTranscript': () => handleCopyAndDownloadTranscript(),
        'resetProject': async () => { 
            const confirmed = await showConfirmationDialog("Começar um Novo Projeto?","Isso limpará todos os campos e o trabalho realizado. Esta ação não pode ser desfeita. Deseja continuar?");
            if (confirmed) { resetApplicationState(); }
        },
        'regenerate': (btn) => window.regenerateSection(btn.dataset.sectionId),
        'copy': (btn) => {
            const content = btn.closest('.accordion-item')?.querySelector('.generated-content-wrapper');
            if (content) {
                window.copyTextToClipboard(content.textContent);
                window.showCopyFeedback(btn);
            }
        },
        'generate-prompts': (btn) => window.generatePromptsForSection(btn, btn.dataset.sectionId),
        'analyzeRetention': (btn) => window.analyzeSectionRetention(btn, btn.dataset.sectionId),
        'refineStyle': (btn) => window.refineSectionStyle(btn),
        'enrichWithData': (btn) => window.enrichWithData(btn),
        'suggestPerformance': (btn) => window.suggestPerformance(btn, btn.dataset.sectionId),
        'optimizeGroup': (btn) => {
            const suggestionText = btn.dataset.suggestionText;
            if (suggestionText) window.optimizeGroup(btn, suggestionText);
        },
        'deleteParagraphGroup': (btn) => {
            const suggestionText = btn.dataset.suggestionText;
            if (suggestionText) window.deleteParagraphGroup(btn, suggestionText);
        },
        'applySuggestion': (btn) => window.applySuggestion(btn),
        'applyAllSuggestions': (btn) => applyAllSuggestions(btn),
        'applyHookSuggestion': (btn) => applyHookSuggestion(btn),
        'insertViralSuggestion': (btn) => insertViralSuggestion(btn)
    };

// SUBSTITUA PELO NOVO BLOCO ABAIXO
const scriptContainerForEdits = document.getElementById('scriptSectionsContainer');
if (scriptContainerForEdits) {
    scriptContainerForEdits.addEventListener('input', (event) => {
        const wrapper = event.target.closest('.generated-content-wrapper');
        if (event.target && wrapper) {
            console.log("Edição manual detectada. Sincronizando AppState...");
            const sectionElement = wrapper.closest('.script-section');
            if (sectionElement) {
                const sectionId = sectionElement.id.replace('Section', ''); // Ex: 'intro', 'development'
                
                // <<< AQUI ESTÁ A MÁGICA >>>
                // Atualizamos o cérebro (AppState) com o texto e o HTML novos da tela.
                if (AppState.generated.script[sectionId]) {
                    AppState.generated.script[sectionId].text = wrapper.textContent;
                    AppState.generated.script[sectionId].html = wrapper.innerHTML;
                    console.log(`AppState para '${sectionId}' foi atualizado.`);
                }

                // As invalidações que você já tinha continuam aqui
                invalidateAndClearPerformance(sectionElement);
                invalidateAndClearPrompts(sectionElement);
                invalidateAndClearEmotionalMap();
                updateAllReadingTimes();
            }
        }
    });
}

    document.addEventListener('click', function(event) {
        const accordionHeader = event.target.closest('.accordion-header');
        if (accordionHeader && !event.target.closest('.header-buttons')) {
            const body = accordionHeader.nextElementSibling;
            const arrow = accordionHeader.querySelector('.accordion-arrow');
            if (body && arrow) { body.classList.toggle('open'); arrow.classList.toggle('open'); }
        }

        const button = event.target.closest('button[data-action]');
        if (!button) return;

        const actionName = button.dataset.action;
        const action = actions[actionName];

        if (action) {
            event.preventDefault();
            const result = action(button);
            if (result instanceof Promise) {
                result.then(saveStateToLocalStorage).catch(error => {
                    console.error("Ação assíncrona falhou, salvamento automático cancelado.", error);
                });
            } else {
                saveStateToLocalStorage();
            }
        }
    });
    
    const editingMenu = document.getElementById('editing-menu');
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

    const strategicInputIds = ['videoTheme', 'videoDescription', 'videoDuration', 'speakingPace', 'visualPacing', 'narrativeGoal', 'narrativeStructure', 'narrativeTheme', 'narrativeTone', 'narrativeVoice', 'centralQuestion', 'emotionalArc', 'shockingEndingHook', 'imageDescriptionEngine', 'imageStyleSelect', 'researchData', 'emotionalHook'];
    strategicInputIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            const eventType = (element.tagName === 'SELECT' || element.tagName === 'TEXTAREA') ? 'change' : 'input';
            element.addEventListener(eventType, (e) => {
                if (!AppState.ui.isSettingStrategy) {
                    resetGeneratedScriptContent(e.target.id);
                }
            });
        }
    });

});