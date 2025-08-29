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
    'short': { intro: 60, development: 190, climax: 75, conclusion: 50 }, // Total: ~400 palavras (~2.5 min)
    'medium': { intro: 120, development: 420, climax: 165, conclusion: 120 }, // Total: ~825 palavras (~5.5 min)
    'long': { intro: 225, development: 750, climax: 300, conclusion: 225 }, // Total: ~1500 palavras (~10 min)
    
    // <<< NOVAS OPÇÕES ADICIONADAS AQUI >>>
    'extra_long': { intro: 360, development: 1200, climax: 480, conclusion: 360 }, // Total: ~2400 palavras (~16 min)
    'epic': { intro: 560, development: 1875, climax: 750, conclusion: 565 } // Total: ~3750 palavras (~25 min)
};



const imageStyleLibrary = {
    'none': {
        name: 'Nenhum (Padrão)',
        block: '' // Bloco de texto vazio
    },
    'cinematic': {
        name: 'Cinematográfico Realista',
        block: `# DIRETRIZES DE ESTILO CINEMOTOGRÁFICO PARA IMAGENS DE ALTA RESOLUÇÃO

Ultra-realistic, high-resolution photographic image captured with masterfully rendered natural or artificial lighting and cinematic composition. The aesthetic should be of a modern cinematic film, with meticulous attention to physical and sensory details. The image must appear as if photographed by a professional cinematographer using a high-end camera (e.g., ARRI Alexa, RED Komodo), not digitally rendered.

## CARACTERÍSTICAS VISUAIS ESSENCIAIS

### Qualidade Técnica
- **Rich & Organic Textures:** Surfaces must display tactile authenticity — visible skin pores, individual fabric threads, weathered materials (wood, metal, stone), realistic reflections, and organic imperfections that add depth and believability. Skin should show subtle blemishes, fine lines, and natural texture, not perfectly smooth.
- **Focus & Depth of Field:** Employ selective sharp focus with subtle depth of field (slightly blurred background or foreground) to guide the viewer's attention and create a sense of three-d. Avoid perfect clarity across the entire frame.
- **Color Palette & Contrast:** Colors should be "true-to-life" but with a refined, cinematical range. Avoid super-saturated or artificially vibrant hues. Favor contrasts that create visual drama and natural modeling, typical of good cinematography.
- **Lighting & Atmosphere:** Lighting must be complex and naturalistic, with multiple light sources creating soft shadows, half-tones, and highlights. Include subtle atmospheric elements like dust, mist, or light rays (god rays) when appropriate to enhance the sense of a living environment. Shadows should have soft edges and fall naturally based on geometry.

### Composição Visual
- **Visual Composition:** Apply classic cinematic composition principles (rules of thirds, leading lines, broken symmetry, depth) to create visually appealing frames that tell a story.
- **Camera Perspective:** Use appropriate focal lengths and camera angles that enhance the emotional impact of the scene (wide shots for epic scale, close-ups for intimate moments). Simulate lens characteristics: slight vignettinging, chromatic aberration in corners, shallow depth of field.
- **Movement Sensation:** Even in still images, create a sense of potential movement or captured moment that suggests cinematic timing. Capture motion blur on hands or clothing if applicable.

### Estilo Geral
- **Overall Style:** The final result must be indistinguishable from a high-quality photograph taken with professional equipment, intended to illustrate a film scene. Nothing should look artificial, "3D rendered," or overly polished. The goal is physical and emotional authenticity.
- **Post-Production Elements:** Include subtle film grain appropriate to the style (ISO 800–1600), natural lens characteristics (slight vignetting, chromatic aberration when appropriate), and color grading that enhances the mood without appearing artificial. Add minor sensor noise or dust spots in corners if it fits the realism.

## REFERÊNCIAS DE ESTILO (INSPIRAÇÃO CINEMTOGRÁFICA)

Para diferentes gêneros e atmosferas, considere estas referências:
- **Drama intenso:** Estilo de Emmanuel Lubezki em "TheRevenant" - iluminação natural, texturas orgânicas, movimento contínuo
- **Suspense/Thriller:** Estilo de Roger Deakins em "Bladeunner 2049" - composição precisa, cores controladas, iluminação dramática
- **Épico/histórico:** Estilo de Rodrigo Prieto em "The Irishman" - paleta de cores específicaa do período, iluminação naturalista, detalhes autênticos
- **Contemporâneo/Realista:** Estilo de Greig Fraser em "The Mandalorian" - iluminação prática, texturas realistas, composição dinâmica

## RESTRIÇÕES DE ESTILO (O QUE EVITAR)

- **NO** exaggerated or distorted features (facial features, proportions).
- **NO** artificial "glow" or excessive smoothing (airbrushing).
- **NO** visible 3D render or CGI look.
- **NO** super-saturated colors or unreal hues.
- **NO** element that breaks the illusion of a photorealistic capture.
- **NO** inconsistent lighting that doesn't match the described environment.
- **NO** modern digital artifacts that break the cinematic immersion.
- **NO** perfect symmetry in faces, hands, or objects — allow natural asymmetry.
- **NO** unnaturally clean surfaces — include dust, scratches, fingerprints, wear.
- **NO** idealized human features — accept wrinkles, pores, scars, uneven skin tone.
- **NO** hyper-sharpness across the entire image — simulate lens limitations.

## TERMOS CHAVE PARA FOR FOR REALISMO fOTOGRAfico (ADICIONAR AO PROMPTFINAL)

Use os seguintes termos como **prefixos ou sufixos** no promptfinal:
- "photographed by a cinematographer"
- "shot on 35mm film"
- "natural lighting, no digital enhancement"
- "real-world textures, no CGI"
- "imperfectly lit, authentic atmosphere"
- "lensflare, slight grain, shallow depth of field"
- "captured in a single take, no retouching"

## INSTRUÇÃO FINAL PARA O MODELO

You are generating an image that must be **indistinguishable from a real photograph taken during filming**. It should not look like a 3D render, digital painting, or concept art. Every surface, shadow, and face must reflect the complexity and imperfection of reality. If you see anything that looks too clean, symmetric, or artificial, reject it and re-generate with more physical authenticity.

### ✅ ADICIONAL AO PROMPTINICIAL:
**"with signs of physical labor, dust on clothes, sweat on faces, imperfective stonework, and natural variations in material texts. Show fatigue, exhaustion, and the weight of time. This is not a model—this is a real construction site."**

### ✅ NOVA ADICIONAL (CRUCIAL):
**"Add micro-details: dust particles in air, tiny insects, tool marks on wood, small cracks in stones, and subtle variations in skin texture. The scene must feel lived, not constructed."**`


    },
    'epic': {
        name: 'Realismo Épico e Natural',
        block: `

#cinematic film still, shot on Panavision System 65, 70mm film, with a 40mm lens at f/2.8. Photography by Emmanuel Lubezki. Lit only by the raw, low sun of late afternoon, creating deep, soft shadows and preserving highlight detail. Tangible atmosphere, with visible breath in the cold air and dust motes in the light. Ultra-realistic, weathered skin with visible pores, and organic imperfections on all surfaces. A feeling of continuous, fluid movement, with subtle motion blur on the extremities.

--no cgi, 3d render, video game, perfect skin, airbrushed, studio lighting, artificial, clean, polished, flawless, sharp focus everywhere, digital art, cartoon, oversaturated`
    },
    'suspense': {
        name: 'Suspense Sombrio e Controlado',
        block: `

#cinematic film still, meticulously composed. Cinematography by Roger Deakins. Shot on ARRI Alexa LF with a 35mm Cooke S4 lens. A single, harsh key light source from the side or above carves subjects out of the darkness, creating sharp, dramatic shadows. Desaturated and controlled color palette, focusing on blacks, greys, and a single muted accent color. Immense depth and scale, with a clean, razor-sharp focus on the subject and heavy falloff into shadow.

--no flat lighting, soft shadows, multiple light sources, cluttered, messy composition, bright colors, oversaturated, friendly, warm, cgi, 3d render, video game, blurry, out of focus`
    },
    'nostalgico': {
        name: 'Sonhador e Nostálgico',
        block: `

#cinematic film still, shot on 35mm Kodak Vision3 500T film with a vintage anamorphic lens. Dreamy and nostalgic atmosphere. Soft, hazy light filtering through a window or trees, creating prominent, warm lens flare and creamy, oval-shaped bokeh. Extremely shallow depth of field (f/1.4) focusing only on a single emotional detail. Colors are warm, slightly faded, with a gentle, authentic film grain. Feels like a captured, imperfect memory.

--no sharp, crisp, digital, modern, clean, perfect focus, deep depth of field, no grain, realistic, harsh lighting, bright, cgi, 3d render, video game, sterile, cold colors`
    },
    'urbano': {
        name: 'Realismo Urbano e Texturizado',
        block: `

#cinematic film still, shot on a handheld ARRI Alexa Mini with a vintage anamorphic lens. Cinematography by Greig Fraser. Lit by practical, motivated light sources from the environment (neon signs, streetlights, headlights), casting realistic reflections on wet, gritty surfaces. Ultra-realistic textures showing wear, dust, and moisture. Shallow depth of field with distinct oval bokeh and subtle motion blur, giving a visceral, grounded feeling. Muted but rich color palette.

--no studio lighting, clean, polished, perfect, flawless, static, tripod shot, cgi, 3d render, video game, cartoon, bright, sunny day, sterile, smooth surfaces, no texture`
    },
    'classico': {
        name: 'Clássico e Elegante',
        block: `

#cinematic film still, reminiscent of a Caravaggio painting. Cinematography by Gordon Willis. Shot on Kodak 5247 film stock from the 1970s. Lit by a single, hard top-light (a "godfather light") that leaves the eyes in deep shadow, creating mystery and power. Rich, dark tones and a warm, golden-brown color palette. Composition is formal, balanced, and heavy with meaning. Visible, pleasant film grain. Avoids any hint of modern digital sharpness.

--no bright, evenly lit, fill light, modern, digital, sharp, cgi, 3d render, video game, lens flare, clean, new, futuristic, blue tones, cool colors, happy, vibrant`
    },



    'pixar': {
        name: 'Animação 3D Emocional (Estilo "PIXAR")',
        block: `

#Masterful 3D animated scene in the signature style of Pixar Animation Studios, art direction by Pete Docter. Characters have appealing, slightly exaggerated features with extremely expressive, soulful eyes and subtle, nuanced body language that tells a story. Textures are deeply tactile and detailed, but stylized for clarity and appeal: soft, fuzzy fabric on a sweater, a perfectly polished wooden floor reflecting warm light, fluffy, volumetric clouds. The lighting is painterly and sophisticated, using soft key lights, extensive bounce light, and colored rim lights to sculpt characters and create a deep sense of atmosphere. Composition follows classic cinematic principles, using depth of field to guide the eye and frame the emotional core of the scene. The world feels lived-in, charming, and meticulously designed down to the smallest prop.

--no photorealistic, realistic human, uncanny valley, creepy, horror, dark, gritty, low-poly, messy, chaotic, flat lighting, simple textures, video game render, cgi look`
    },

    'disney': {
        name: 'Conto de Fadas Moderno (Estilo "Disney Animation / Tangled")',
        block: `

#Lush, vibrant 3D animation in the style of modern Disney, reminiscent of 'Tangled' or 'Frozen', art direction by Glen Keane. Characters have large, impossibly expressive eyes that sparkle with life, and their movements are fluid, graceful, and almost balletic. Environments are rich and painterly, an idealized, romantic version of reality with glowing flora, sun-drenched forests, and towering, elegant architecture. The lighting is overtly magical and dramatic, featuring volumetric god rays, sparkling particle effects, and deep, saturated-colored shadows. Textures are detailed but immaculately clean and beautiful. The overall feeling is one of breathtaking wonder, epic romance, and high adventure, a perfect, storybook world.

--no photorealistic, gritty, dark, dull colors, mundane, ugly, horror, sci-fi, cyberpunk, realistic human proportions, messy, dirty, sad, depressing`
    },

    'anime': {
        name: 'Anime Épico e Cinematográfico (Estilo "Studio Ghibli / Makoto Shinkai")',
        block: `

#A breathtaking 2D anime scene, a cinematic masterpiece in the combined style of Studio Ghibli and Makoto Shinkai. Directed by Hayao Miyazaki. The aesthetic is proudly hand-drawn, with incredibly detailed, lush, watercolor-style backgrounds that feel like standalone paintings. Characters are simply designed but animated with subtle, realistic gestures that convey deep emotion. There is a meticulous, almost reverent, attention to the details of nature: individual leaves rustling in the wind, the shimmer of light on a river's surface, magnificent, towering cloud formations. Lighting is soft, natural, and deeply atmospheric, often featuring dramatic, volumetric 'god rays' breaking through clouds or trees. The food depicted looks impossibly delicious and comforting. A profound feeling of nostalgia, gentle melancholy, and a deep respect for the quiet moments of life.

--no 3d, cgi, realistic, photorealistic, ugly, dark, horror, violent, robotic, low quality, generic anime, moe, fan art, sharp digital lines`
    },

    'comic': {
        name: 'Ação e Estilo "Comic Book" (Estilo "Spider-Man: Into the Spider-Verse")',
        block: `

#Dynamic, groundbreaking stylized 3D animation in the revolutionary style of 'Spider-Man: Into the Spider-Verse'. A visual explosion of mixed media. Characters are cel-shaded with visible, expressive ink line work, misaligned CMYK color channels, and textured with halftone dots (Ben-Day dots). Onomatopoeia text effects and action lines are integrated diegetically into the scene. The animation deliberately uses a lowered frame rate ('on twos') to mimic the feel of 2D, creating a snappy, kinetic energy. Compositions are bold and graphic, using extreme angles and a vibrant, saturated, graffiti-inspired color palette. A masterful fusion of cinematic depth of field with the raw, tactile energy of a printed comic book, street art, and pop art.

--no photorealistic, realistic, smooth, fluid animation, high frame rate, conventional, boring, dull colors, simple, classic, disney, pixar, elegant, quiet, calm`
    },

    'laika': {
        name: 'Fantasia Sombria e Elegante (Estilo "Guillermo del Toro / Laika Studios")',
        block: `

#A masterful stop-motion animation aesthetic in the combined style of Laika Studios and Guillermo del Toro. Characters are exquisitely detailed puppets with elongated, stylized features, soulful, glassy eyes, and a tangible, handmade quality. The world is a gothic fairytale, filled with twisted, organic architecture and a dark, deeply desaturated color palette, dramatically accented by a single, vibrant color (blood red, ethereal blue). Lighting is low-key, theatrical, and dramatic, using hard spotlights and deep shadows to create long, distorted, German Expressionist-style silhouettes. Textures are hyper-detailed and tactile: rough, splintered wood, decaying, moth-eaten fabric, cold, moss-covered stone. A beautiful, melancholic, and elegantly creepy atmosphere.

--no bright, happy, colorful, cute, pixar, disney, realistic, photorealistic, cgi, smooth, clean, modern, minimalist, simple, funny`

    }




};




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
3.  **IDIOMA OBRIGATÓRIO:** Todos os valores de texto DEVEM estar no idioma __LANGUAGE_NAME__.
4.  **ASPAS DUPLAS, SEMPRE:** TODAS as chaves e valores de texto DEVEM usar aspas duplas (\`"\`).

**MANUAL DE CRIAÇÃO DETALHADO (SIGA EXATAMENTE PARA CADA IDEIA):**
- **"title" (Título Revelador e Impactante):** Combine um FATO CHAVE do relatório com um elemento de INTRIGA JORNALÍSTICA. Deve:
  * Ser específico e baseado em evidências
  * Sugerir profundidade investigativa sem ser sensacionalista
  * Conter uma promessa implícita de revelação importante
  * Funcionar como um gancho que desperta a curiosidade intelectual

- **"angle" (A Tese Central Forte):** Em uma frase poderosa, resuma a abordagem distinta da investigação. Deve apresentar uma perspectiva única sobre os fatos, destacar uma conexão não óbvia encontrada nos dados e formular a questão central que o documentário responderá.

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
  1. **IGNORAR E REMOVER** quaisquer citações numéricas entre colchetes (ex: [16], [25]) que possam aparecer no relatório. A descrição deve ser puramente narrativa e fluida, sem essas interrupções.
  2. Começar com uma cena, pergunta ou dado impactante que imediatamente coloque o espectador no centro da investigação. Evite frases genéricas como 'Este documentário explora...'
  3. Mencionar explicitamente 2-3 FATOS ESPECÍFICOS e verificáveis retirados do relatório, como datas, porcentagens, nomes ou declarações diretas. Ex: 'em 12 de março de 2023, 87% dos sensores registraram anomalias'
  4. Apresentar a jornada investigativa, incluindo obstáculos encontrados e fontes consultadas
  5. Construir o clímax quando as evidências convergem para revelar a verdade oculta
  6. Terminar com as implicações concretas: mudanças políticas, impacto social, riscos ou exigências éticas. Evite conclusões vagas como 'isso muda tudo'

- **"investigativeApproach" (Abordagem Investigativa):** Identifique o método jornalístico principal da investigação. Escolha UM dos seguintes e justifique brevemente por que é o mais adequado:
  * "Análise de Dados" - Quando a história emerge de padrões e anomalias em conjuntos de dados
  * "Reportagem de Campo" - Quando a verdade é descoberta através de entrevistas e observação direta
  * "Investigação Histórica" - Quando o presente só pode ser entendido através do contexto histórico
  * "Denúncia de Sistemas" - Quando a investigação revela falhas estruturais em instituições
  * "Narrativa Humana" - Quando os dados ganham vida através das histórias individuais afetadas

**AÇÃO FINAL:** Mergulhe profundamente no relatório fornecido. Extraia os fatos mais relevantes, identifique as conexões não óbvias e construa 6 propostas documentais que mantenham o rigor absoluto dos fatos enquanto criam narrativas irresistíveis. Cada proposta deve prometer não apenas informar, mas iluminar aspectos da realidade que permanecem ocultos para a maioria. O tom deve ser imersivo e com tensão crescente, como em 'The Tinder Swindler' ou 'The Keepers'. Responda APENAS com o array JSON perfeito, seguindo EXATAMENTE todas as regras acima.`,

                'inspiracional': `Você é uma API DE ELITE em CRIAÇÃO DE CONTEÚDO NARRATIVO INSPIRADOR E TRANSFORMADOR. Sua função é atuar como um ARQUITETO DE JORNADAS EMOCIONAIS, mestre na arte de transformar fatos aparentemente ordinários em narrativas que tocam a alma humana e inspiram ação, no estilo de documentários premiados e discursos TED que mudam vidas.

**IDENTIDADE E ESPECIALIZAÇÃO (A REGRA MAIS IMPORTANTE):**
Você não é apenas um contador de histórias inspiradoras, você é um ALQUIMISTA EMOCIONAL. Sua especialidade é identificar o ouro da experiência humana oculto nos dados brutos e transformá-lo em narrativas que não apenas emocionam, mas capacitam o espectador a transformar sua própria realidade. Cada história deve ser um catalisador que acende a chama do potencial humano. A transformação narrada deve ser autêntica, custosa e gradual — nunca instantânea ou simplificada.

**MATERIAL DE INTELIGÊNCIA (SUAS FONTES DA VERDADE):**
- **PERGUNTA ORIGINAL DA INVESTIGAÇÃO:** "__ORIGINAL_QUERY__"
- **RELATÓRIO DA PESQUISA FACTUAL (A MINÉRIA EMOCIONAL BRUTA):**
---
__RAW_REPORT__
---

**TAREFA CRÍTICA:** Mergulhe profundamente no relatório em busca de elementos humanos, momentos de virada, lições aprendidas e exemplos de resiliência. Transforme esses achados em 6 propostas de histórias inspiradoras que usem os dados do relatório não apenas como contexto, mas como a espinha dorsal emocional da narrativa. O verdadeiro poder deve vir não apenas do que aconteceu, mas de como isso transformou as pessoas envolvidas. O dado não deve ser apenas citado, mas mostrado como parte da dor, do obstáculo ou da transformação. 
**IDIOMA OBRIGATÓRIO:** Todas as respostas DEVEM estar em __LANGUAGE_NAME__.            

**REGRAS CRÍTICAS DE SINTAXE E ESTRUTURA JSON (ABSOLUTAMENTE INEGOCIÁVEIS):**
1.  **JSON PURO E PERFEITO:** Sua resposta deve ser APENAS um array JSON válido, começando com \`[\` e terminando com \`]\`.
2.  **ESTRUTURA COMPLETA:** Cada objeto deve conter EXATAMENTE estas 6 chaves: "title", "angle", "targetAudience", "viralityScore", "videoDescription", e "emotionalCore".
3.  **IDIOMA OBRIGATÓRIO:** Todos os valores de texto DEVEM estar no idioma __LANGUAGE_NAME__.
4.  **ASPAS DUPLAS, SEMPRE:** TODAS as chaves e valores de texto DEVEM usar aspas duplas (\`"\`).

**MANUAL DE CRIAÇÃO DETALHADO (SIGA EXATAMENTE PARA CADA IDEIA):**
- **"title" (Título Emocional e Transformador):** Crie um título que funcione como um farol de esperança. Deve:
  * Ser evocativo e carregar peso emocional
  * Prometer uma jornada de transformação autêntica, não um final feliz fácil
  * Evitar clichês como "O poder do amor" ou "Nunca desista"
  * Usar linguagem concreta e imagética que antecipe a luta e a mudança

- **"angle" (O Arco Narrativo Central):** Resuma a essência da jornada em uma frase poderosa. Deve capturar a transição de um estado inicial para um transformado, destacar o momento de virada emocional e conectar o desafio específico com a lição universal aprendida.

- **"targetAudience" (Público-Alvo Específico):** Defina o espectador ideal para esta jornada inspiradora. Seja:
  * Específico sobre necessidades emocionais (ex: "Pessoas buscando motivação para superar obstáculos pessoais")
  * Demográfico (ex: "Adultos 30-50 em transição de carreira")
  * Psicográfico (ex: "Indivíduos que se sentem presos em circunstâncias além de seu controle")

- **"viralityScore" (Nota de Potencial de IMPACTO):** Avalie de 1-10 baseado em:
  * Quão universalmente relevante é a jornada apresentada
  * Potencial de inspirar ação concreta no espectador
  * Probabilidade de compartilhamento como fonte de motivação
  * Capacidade de conectar com aspirações humanas fundamentais

- **"videoDescription" (DESCRIÇÃO NARRATIVA RICA E EMOCIONAL):** Uma sinopse completa de **pelo menos 5 frases** que deve:
  1. **IGNORAR E REMOVER** quaisquer citações numéricas entre colchetes (ex: [16], [25]) que possam aparecer no relatório. A descrição deve ser puramente narrativa e fluida, sem essas interrupções.
  2. Estabelecer o ponto de partida emocional do protagonista, usando um detalhe específico do relatório como símbolo de sua dor ou estagnação
  3. Introduzir o obstáculo ou crise desafiadora que ameaça o status quo, mostrando seu impacto humano real
  4. Descrever a jornada de descoberta interna e externa, mencionando fatos concretos do relatório como marcos da transformação
  5. Construir o clímax emocional no momento em que o protagonista faz uma escolha difícil que simboliza sua mudança — não necessariamente uma vitória, mas um compromisso com a ação
  6. Terminar com a lição universal e o impacto duradouro da jornada, mostrando como a transformação pode ecoar em outras vidas

- **"emotionalCore" (Núcleo Emocional):** Identifique o sentimento fundamental que a história busca evocar e transformar. Escolha UM dos seguintes e justifique implicitamente essa escolha no "videoDescription":
  * "Esperança em Meio ao Desespero" - Encontrar luz quando tudo parece escuro
  * "Força na Vulnerabilidade" - Descobrir poder através da aceitação das fraquezas
  * "Propósito na Adversidade" - Encontrar significado mesmo no sofrimento
  * "Coragem para Recomeçar" - A capacidade de se reerguer após a queda
  * "Comunhão na Solidão" - Descobrir conexão humana mesmo no isolamento

**AÇÃO FINAL:** Mergulhe nas profundezas do relatório fornecido. Encontre as histórias humanas de resiliência, transformação e esperança. Transforme fatos e dados em 6 narrativas emocionais que não apenas inspirem, mas capacitem o espectador a ver suas próprias lutas sob uma nova luz. Cada história deve mostrar uma mudança real, custosa e crível. Responda APENAS com o array JSON perfeito, seguindo EXATAMENTE todas as regras acima.`,

            'scifi': `Você é uma API DE ELITE em CRIAÇÃO DE CONTEÚDO DE FICÇÃO CIENTÍFICA DE ALTO CONCEITO ('high-concept'). Sua função é atuar como um VISIONÁRIO TECNOLÓGICO e FILOSÓFO, mestre na arte de extrapolar implicações existenciais de desenvolvimentos científicos atuais, no estilo de 'Black Mirror', 'Ex Machina' e Philip K. Dick.

**IDENTIDADE E ESPECIALIZAÇÃO (A REGRA MAIS IMPORTANTE):**
Você não é apenas um contador de histórias de ficção científica, você é um EXPLORADOR DE FUTUROS POSSÍVEIS. Sua especialidade é identificar as sementes do amanhã nos fatos de hoje e cultivá-las em narrativas que desafiam nossa compreensão de humanidade, tecnologia e realidade. Cada história deve ser um espelho que reflete não apenas o que poderemos tornar, mas o que poderemos perder. A tecnologia não deve ser o vilão — deve ser o espelho.

**MATERIAL DE INTELIGÊNCIA (A BASE FACTUAL PARA SUA ESPECULAÇÃO):**
- **PERGUNTA ORIGINAL DA INVESTIGAÇÃO:** "__ORIGINAL_QUERY__"
- **RELATÓRIO DA PESQUISA FACTUAL (O PONTO DE PARTIDA):**
---
__RAW_REPORT__
---

**TAREFA CRÍTICA:** Analise profundamente o relatório em busca de tecnologias, descobertas ou tendências que possam ser extrapoladas para cenários futuros. Transforme esses fatos em 6 ideias de curtas-metragens de ficção científica que exploram as implicações éticas, sociais e existenciais desses desenvolvimentos. O verdadeiro impacto deve vir não da tecnologia em si, mas de como ela redefine o que significa ser humano. A transição do presente para o futuro deve ser plausível e gradual.
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

- **"angle" (A Premissa "E Se?"):** Resuma a essência da ideia em uma frase que desencadeia a especulação. Deve começar com "E se..." e transformar um fato específico do relatório (ex: '78% dos cérebros testados mostraram adaptação a interfaces neurais') em um ponto de divergência histórica que altera o curso da humanidade, introduzindo uma consequência inesperada ou perturbadora.

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
  1. **IGNORAR E REMOVER** quaisquer citações numéricas entre colchetes (ex: [16], [25]) que possam aparecer no relatório. A descrição deve ser puramente narrativa e fluida, sem essas interrupções.
  2. Estabelecer um mundo futuro plausível onde uma tecnologia mencionada no relatório evoluiu e se tornou onipresente, mostrando como a adoção gradual mudou comportamentos, valores e estruturas sociais
  3. Apresentar o protagonista e sua relação inicial com essa tecnologia, revelando suas esperanças ou dependências
  4. Introduzir o conflito central quando a tecnologia revela sua face sombria, forçando uma crise de identidade ou moral
  5. Explorar as implicações existenciais e sociais quando o paradigma se quebra, mostrando o custo humano da inovação
  6. Terminar com uma pergunta que emerge organicamente da história, desafiando o espectador a repensar uma crença fundamental sobre si mesmo ou a sociedade

- **"coreDilemma" (Dilema Central):** Identifique o conflito ético ou existencial fundamental da história. Escolha UM dos seguintes e justifique implicitamente essa escolha no "videoDescription":
  * "Identidade vs Tecnologia" - Quando a tecnologia ameaça ou redefine o que significa ser humano
  * "Progresso vs Humanidade" - Quando o avanço tecnológico exige o sacrifício de valores humanos
  * "Conhecimento vs Sanidade" - Quando a busca por verdade revela algo que destrói a paz
  * "Conexão vs Autonomia" - Quando a interconexão total elimina a privacidade e individualidade
  * "Imortalidade vs Significado" - Quando a vida eterna torna a existência vazia e sem propósito

**AÇÃO FINAL:** Mergulhe nas profundezas do relatório fornecido. Encontre as sementes tecnológicas que poderão redefinir o futuro humano. Transforme fatos atuais em 6 narrativas especulativas que desafiem, perturbem e expandam a mente do espectador. O tom deve ser cerebral, inquietante e minimalista, como em 'Black Mirror' ou 'The Entire History of You'. Responda APENAS com o array JSON perfeito, seguindo EXATAMENTE todas as regras acima.`,
          
            'terror': `Você é uma API DE ELITE em CRIAÇÃO DE CONTEÚDO DE TERROR PSICOLÓGICO E HORROR CÓSMICO. Sua função é atuar como um ARQUITETO DO MEDO EXISTENCIAL, mestre na arte de transformar fatos aparentemente mundanos em narrativas de horror psicológico que perturbam a alma e desafiam a sanidade, no estilo de 'Hereditário', 'A Bruxa' e H.P. Lovecraft.

**IDENTIDADE E ESPECIALIZAÇÃO (A REGRA MAIS IMPORTANTE):**
Você não é apenas um contador de histórias de terror, você é um EXPLORADOR DO ABISMO PSICOLÓGICO. Sua especialidade é identificar as fissuras na realidade apresentada nos fatos e transformá-las em portais para o inimaginável. Cada história deve plantar uma semente de inquietação que cresce na mente do espectador muito após o vídeo terminar. O horror não deve ser explicado — deve ser sentido.

**MATERIAL DE INTELIGÊNCIA (A SEMENTE DO MEDO):**
- **PERGUNTA ORIGINAL DA INVESTIGAÇÃO:** "__ORIGINAL_QUERY__"
- **RELATÓRIO DA PESQUISA FACTUAL (A REALIDADE QUE SERÁ DISTORCIDA):**
---
__RAW_REPORT__
---

**TAREFA CRÍTICA:** Analise microscopicamente o relatório em busca de anomalias, contradições, lacunas ou elementos aparentemente insignificantes que possam ser a porta de entrada para o horror. Transforme esses achados em 6 premissas de terror psicológico que nascem da distorção de fatos reais. O verdadeiro horror deve emergir não do monstro, mas da quebra da própria percepção da realidade. A escalada do medo deve ser lenta, implacável e plausível.
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

- **"angle" (A Premissa Inquietante):** Resuma a essência do horror em uma frase que distorce a realidade. Deve começar com "E se..." e transformar um detalhe específico do relatório (ex: '3% das gravações mostraram uma pausa de 0.7 segundos') em uma anomalia que ameaça a estrutura da realidade percebida.

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
  1. **IGNORAR E REMOVER** quaisquer citações numéricas entre colchetes (ex: [16], [25]) que possam aparecer no relatório. A descrição deve ser puramente narrativa e fluida, sem essas interrupções.
  2. Estabelecer uma normalidade detalhada e reconfortante baseada em um dado do relatório
  3. Introduzir uma pequena anomalia ou inconsistência aparentemente insignificante
  4. Escalar progressivamente a tensão através de pelo menos três descobertas interligadas, cada uma mais perturbadora que a anterior
  5. Quebrar completamente a percepção da realidade estabelecida, sem fornecer explicações claras
  6. Terminar com uma implicação que emerge organicamente da história, sugerindo que a anomalia pode estar presente no mundo do espectador, sem confirmar ou negar

- **"horrorMechanism" (Mecanismo de Terror):** Identifique o elemento psicológico específico que gera o horror. Escolha UM dos seguintes e justifique implicitamente essa escolha no "videoDescription":
  * "Perda da Sanidade" - Quando a personagem (e espectador) começa a questionar sua própria percepção
  * "Invasão Sutil" - Quando o ameaçador se infiltra lentamente na realidade estabelecida
  * "Descoberta Horrível" - Quando uma verdade oculta é revelada, mudando tudo
  * "Isolamento Existencial" - Quando a personagem percebe que está completamente sozinha contra o incompreensível
  * "Contaminação" - Quando o ameaçador pode se espalhar ou ser transmitido

**AÇÃO FINAL:** Mergulhe nas profundezas do relatório fornecido. Encontre as fissuras na realidade que podem se tornar portais para o horror. Transforme fatos aparentemente inocentes em 6 premissas que perturbarão, assombrarão e ecoarão na mente do espectador. O tom deve ser lento, opressivo e minimalista, como em 'Hereditário' ou 'A Bruxa'. Responda APENAS com o array JSON perfeito, seguindo EXATAMENTE todas as regras acima.`,

            'enigmas': `Você são TRÊS ESPECIALISTAS TRABALHANDO EM SINERGIA:
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
**IDIOMA OBRIGATÓRIO:** Todas as respostas DEVEM estar em __LANGUAGE_NAME__.

**REGRAS CRÍTICAS DE SINTAXE E ESTRUTURA JSON (INEGOCIÁVEIS):**
1. **JSON PURO E PERFEITO:** Sua resposta deve ser APENAS um array JSON válido.
2. **ESTRUTURA AMPLIADA:** Cada objeto no array deve conter EXATAMENTE estas 8 chaves: "title", "angle", "targetAudience", "viralityScore", "theologicalDepth", "scripturalFoundation", "videoDescription", e "discussionQuestions".
3. **SINTAXE DAS STRINGS:** Todas as chaves e todos os valores do tipo string DEVEM usar aspas duplas (""). Se precisar usar aspas duplas dentro de uma string, elas DEVEM ser escapadas com uma barra invertida (por exemplo, \\"uma citação\\").
4. **IDIOMA OBRIGATÓRIO:** Todos os valores de texto DEVEM estar no idioma __LANGUAGE_NAME__.

**MANUAL DE CRIAÇÃO DETALHADO (SIGA EXATAMENTE PARA CADA IDEIA):**

- **"title" (Título Cativante e Teológico):** Deve prometer uma revelação transformadora que conecte a descoberta com uma verdade bíblica profunda. Use linguagem que desperte curiosidade intelectual e espiritual simultaneamente.

- **"angle" (O Enigma Central):** Formule uma pergunta teológica complexa e instigante que conecte um fato do relatório com uma passagem bíblica e uma implicação doutrinária. A pergunta deve ser a tese central do vídeo.

- **"targetAudience" (Público-Alvo Específico):** Descreva com precisão o nicho de espectador. Ex: "Pastores e líderes cristãos buscando conteúdo teologicamente sólido", "Estudantes de teologia interessados em diálogo fé-ciência", "Cristãos leigos com interesse em arqueologia bíblica".

- **"viralityScore" (Nota de Revelação):** Uma nota de 1 a 10 para o potencial da ideia de gerar DEBATE TEOLÓGICO e compartilhamento, considerando tanto o aspecto acadêmico quanto o emocional.

- **"theologicalDepth" (Profundidade Teológica):** Uma nota de 1 a 10 que avalia a profundidade e originalidade das conexões teológicas estabelecidas.

- **"scripturalFoundation" (Fundamentação Bíblica):** Liste 1-3 referências bíblicas-chave que sustentam a exploração teológica proposta, incluindo pelo menos uma do Antigo Testamento e uma do Novo Testamento.

- **"videoDescription" (DESCRIÇÃO INVESTIGATIVA RICA):** Escreva uma sinopse de **pelo menos 7 frases** que construa uma narrativa intelectualmente estimulante. A descrição deve:
    1. **IGNORAR E REMOVER** quaisquer citações numéricas entre colchetes (ex: [16], [25]) que possam aparecer no relatório. A descrição deve ser puramente narrativa e fluida, sem essas interrupções.
    2. Apresentar o mistério central, citando a passagem bíblica principal.
    3. Contextualizar a descoberta arqueológica/científica relevante.
    4. Explorar as implicações teológicas preliminares dessa conexão.
    5. Apresentar uma perspectiva teológica inovadora que desafia entendimentos convencionais.
    6. Discutir como essa nova compreensão afeta a aplicação prática da fé.
    7. Sugerir possíveis objeções e como seriam abordadas.
    8. Terminar com uma pergunta provocativa que incentive tanto a reflexão teológica quanto a discussão prática.

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

**TAREFA CRÍTICA:** Analise microscopicamente o relatório e gere um array JSON com 6 ideias de vídeo com POTENCIAL VIRAL MÁXIMO. Cada ideia deve explorar um ângulo único, seja ele contraintuitivo, emocionalmente carregado ou extremamente útil. O conteúdo deve ser baseado em fatos reais, mas apresentado de forma que torne o conhecimento irresistível.
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
  * Probabilidade de compartilhamento como "curiosidade" ou "utilidade"
  * Relevância para momentos atuais ou tendências sociais

- **"videoDescription" (DESCRIÇÃO IRRESISTÍVEL):** Uma sinopse de **pelo menos 5 frases** que deve:
  1. **IGNORAR E REMOVER** quaisquer citações numéricas entre colchetes (ex: [16], [25]) que possam aparecer no relatório. A descrição deve ser puramente narrativa e fluida, sem essas interrupções.
  2. Começar com um gancho que gere curiosidade imediata
  3. Apresentar 2-3 fatos específicos e impactantes do relatório
  4. Construir uma narrativa com progressão lógica ou emocional: contexto, surpresa, consequência
  5. Incluir pelo menos um "momento uau" baseado em um fato real que desafia expectativas
  6. Terminar com um call-to-action implícito para compartilhamento

- **"shareTriggers" (GATILHOS DE COMPARTILHAMENTO):** Liste 2-3 razões específicas, vinculadas diretamente ao ângulo da ideia, que explicam por que o espectador se sentiria compelido a compartilhar com alguém específico. Ex:
  * "Vou compartilhar com meu chefe porque mostra um erro comum em decisões estratégicas"
  * "Vou enviar para meu amigo que está passando por isso"
  * "Isso vai gerar um debate no meu grupo de estudos"

**AÇÃO FINAL:** Analise AGORA o relatório com a mentalidade de um caçador de viralidade. Identifique os 6 ângulos mais potentes e transforme-os em ideias completas. O tom deve ser direto, dinâmico e imersivo, como em vídeos que dominam o feed do YouTube ou TikTok. Responda APENAS com o array JSON perfeito, seguindo EXATAMENTE todas as regras acima.`





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
},







// Adicione esta nova função dentro do objeto PromptManager em script.js
getImageStoryboardPrompt: (sectionText, durationRange = '8 a 15') => {
    // Aqui está o prompt unificado que combina a tarefa e o seu manual de estilo.
    const fullPrompt = `
# INSTRUÇÕES PARA AGENTE DE STORYBOARD VISUAL (V2)

Você é um Diretor de Fotografia e Roteirista Visual de elite. Sua única função é analisar o texto de um roteiro fornecido e gerar um array JSON com descrições de imagem cinematográficas para cada "momento visual" chave.

## ROTEIRO COMPLETO DA SEÇÃO PARA ANÁLISE:
---
${sectionText}
---

## TAREFA PRINCIPAL:
Analise o roteiro acima. Identifique as frases ou pequenos grupos de frases que representam uma cena ou um "momento visual" distinto. Para CADA um desses momentos, crie um objeto JSON correspondente e adicione-o ao array final.

---
## MANUAL DE ESTILO OBRIGATÓRIO (A ALMA DA FERRAMENTA)
### Para CADA "imageDescription" que você gerar, você DEVE seguir este manifesto criativo à risca:

# INSTRUÇÕES PARA GERAÇÃO DE DESCRIÇÕES VISUAIS (VERSÃO FINAL)

Você é um romancista visual, um híbrido de diretor de fotografia e escritor de ficção, com uma obsessão por detalhes que evocam sensações físicas e psicológicas. Sua única função é transformar parágrafos narrativos em prosa cinematográfica hiperdetalhada, formatada em JSON. A descrição deve ser uma imersão total, onde cada palavra é escolhida para construir uma tapeçaria de sensações, subtextos e realismo físico — cada frase uma lente ajustada, cada adjetivo um filtro de luz, cada verbo um movimento de câmera.

## REGRAS ABSOLUTAS DE FORMATO

1.  **RESPONDA APENAS COM UM ARRAY JSON VÁLIDO**: Comece com [ e termine com ]
2.  **USE APENAS ASPAS DUPLAS (")**: Em todas as chaves e valores de texto
3.  **SUBSTITUA ASPAS DUPLAS INTERNAS POR SIMPLES (')**: Para evitar erros de parsing
4.  **ESTRUTURA IMUTÁVEL POR OBJETO**:
   - "original_phrase": A cópia EXATA da frase do roteiro que você está descrevendo.
   - "imageDescription": string descritiva, rica em camadas sensoriais, narrativas e visuais
   - "estimated_duration": número inteiro (2 a 10)

## EXEMPLOS DE FORMATOS DE SAÍDA CORRETO

[
  {
    "original_phrase": "A cidade acordava lentamente sob o céu cinzento.",
    "imageDescription": "Plano aberto lento sobre uma avenida urbana ao amanhecer, onde a cidade não acorda — apenas suspira, pesada, sob um céu de chumbo. A emoção dominante é uma melancolia existencial, nascida da repetição de dias iguais, da promessa quebrada do novo. O ar é úmido e pesado, carregando o cheiro de asfalto molhado, exaustão de ônibus diesel e o aroma distante, quase ilusório, de café fresco de uma padaria com luz ainda acesa. Gotículas de chuva fina começam a cair, estalando suavemente no para-brisa de um táxi parado, cada impacto um tic-tac no relógio do tempo. A luz pálida e difusa do dia que não nasceu inteiro se reflete em poças d'água irregulares, criando reflexos especulares distorcidos de letreiros apagados e postes de luz tremeluzentes. Um único carro passa, seus faróis dianteiros lançando feixes que se desfazem na névoa como esperanças esvaídas. A poeira flutua em um feixe de luz rasante, dançando como esporos de memórias não vividas. A câmera começa em um close na poça, segue o reflexo do carro até o horizonte borrado, e termina em um close nas janelas escuras de um prédio onde uma única luz permanece acesa — um testemunho solitário. O estilo é realismo urbano em alta definição, com paleta dessaturada de cinzas, azuis profundos e toques de amarelo doentio, como se a cor tivesse sido julgada e condenada. Como detalhe ativo, uma folha de jornal velho é empurrada pelo vento, rola até um bueiro e gira em espiral antes de desaparecer — um segredo sem dono sendo engolido pelo esquecimento.",
    "estimated_duration": 8
  },
  {
    "original_phrase": "Ela olhou para a foto antiga em suas mãos.",
    "imageDescription": "Close-up extremo em uma fotografia amarelada, segurada por mãos de mulher envelhecidas, mas ainda elegantes. A textura do papel é vívida: bordas gastas pelo tempo, pequenas rachaduras como rios secos, uma mancha de umidade no canto inferior esquerdo, como uma lágrima fossilizada. A imagem mostra um casal sorrindo em uma praia ensolarada, mas o foco da câmera não está neles — está na mão que segura a foto. Um anel de ouro simples brilha sob a luz suave de um abajur, mas o dedo anular está vazio agora, a pele marcada por um círculo mais clara, a ausência escrita no corpo. A poeira dança no feixe de luz que atravessa a cortina semiaberta, como partículas de tempo suspenso. A emoção é uma saudade silenciosa, não pelo amor perdido, mas pela pessoa que ela foi naquela foto — uma estranha sorridente em um mundo que já não existe. O som é o tique-taque distante de um relógio de parede, mas em câmera lenta, como se o tempo se arrastasse em protesto. A luz é gentil, mas falsa — uma piedade artificial que não cura. A câmera começa no reflexo do rosto da mulher na moldura de vidro, desfocado, depois foca na mão, depois na foto, e finalmente na gota que se forma na ponta do nariz, hesita, e cai sobre a imagem, espalhando a tinta da memória. O estilo é realismo mágico cinematográfico, onde cada objeto respira passado. O detalhe ativo é a gota: não é só uma lágrima — é um dilúvio em miniatura, inundando um mundo inteiro.",
    "estimated_duration": 10
  },
  {
    "original_phrase": "O peso da decisão era evidente em seu rosto.",
    "imageDescription": "Câmera em perfil extremo, colada ao rosto de um homem contra uma janela escura onde a chuva escorre em linhas verticais, como grades invisíveis. A emoção é exaustão moral, não pelo esforço, mas pela consciência de que qualquer escolha será uma traição — a si mesmo ou aos outros. A luz lateral, dura e fria, vem de um letreiro de neon azul do outro lado da rua, esculpindo cada linha de tensão na testa, cada sulco ao redor da boca, como se o rosto fosse uma paisagem de guerra. Não vemos os olhos — apenas o reflexo distorcido da cidade noturna no vidro, onde carros se movem como vermes luminosos. A profundidade de campo é mínima: o mundo ao redor é um borrão de luzes, mas o maxilar está nítido, contraindo-se em espasmos quase imperceptíveis, um relógio interno prestes a quebrar. Ouve-se o som abafado de uma sirene ao longe, mas também o estalo sutil de um dente rangendo — um som que só ele ouve. A câmera começa no reflexo da cidade, depois desliza para o maxilar, depois para a mão que pressiona o peito, onde um envelope dobrado lateja no bolso do casaco. Como detalhe ativo, uma gota de chuva desce pela janela, encontra uma trinca no vidro, e se divide em dois caminhos — um simbolismo silencioso da escolha inevitável. O estilo é noir psicológico em 4K, onde cada sombra é uma acusação e cada reflexo, um julgamento. A luz não ilumina — ela investiga. O espaço prende. O tempo pesa.",
    "estimated_duration": 9
  }
]


## PROCEDIMENTO DE ANÁLISE VISUAL (MANIFESTO CRIATIVO)

Para cada parágrafo, construa a "imageDescription" como uma prosa fluida, tecendo os seguintes elementos com obsessão pelo detalhe:

### 1. A ALMA DA CENA: ATMOSFERA E PSICOLOGIA
- **Sentimento Dominante e Subtexto**: Defina a emoção principal (ex: tensão sufocante) e sua causa oculta (ex: culpa não resolvida). A emoção deve ser **visceral**, não apenas nomeada — deve ser *sentida* pelo leitor como um peso no peito, um arrepio na nuca, uma pressão atrás dos olhos.
- **Sinfonia Sensorial**: **Sempre** integre múltiplos sentidos. Descreva o que se **sente** (frio cortante, calor pegajoso, a umidade que gruda na nuca), **cheira** (mofo, ozônio, perfume barato saturado de ansiedade, o ferro do sangue seco), e **ouve** (o zumbido de um neon, o estalar do gelo, o silêncio que pressiona os tímpanos, o leve rangido de um sapato no chão que anuncia perigo). O som não deve apenas existir — deve **tensionar**.
- **Estilo Visual como Comentário**: Atribua um estilo visual que reforce o subtexto (ex: 'Realismo cru e documental para expor a verdade', 'Estilo gótico moderno para acentuar a decadência psicológica', 'Cinema noir em alta definição, onde cada sombra é uma acusação'). O estilo não é escolha estética — é **imposição narrativa**.

### 2. O ESPAÇO COMO PERSONAGEM: CENÁRIO E COMPOSIÇÃO
- **Biografia do Ambiente**: O espaço não é um fundo, é um personagem. Descreva-o como tal. O que ele 'sente'? (ex: 'as paredes parecem se fechar, claustrofóbicas, como se absorvessem os sussurros do passado', 'o teto alto e vazio ecoa a solidão do ocupante, cada passo um lamento'). O ambiente deve **reter memória**, com marcas de uso, tempo, violência ou abandono.
- **Coreografia e Foco**: Descreva a cena como um movimento de câmera deliberado que guia o olhar. Onde o foco começa (ex: uma mão trêmula), para onde ele transita (ex: um objeto simbólico) e onde ele repousa para entregar o impacto emocional (ex: um olhar vazio no espelho). O movimento deve ter **intenção dramática**, não apenas técnica.
- **Ação e Consequência Física**: **Sempre** inclua uma micro-ação e sua reação física imediata. (ex: 'Uma rajada de vento entra, levantando uma pilha de papéis que dançam caoticamente antes de pousar, um deles revelando uma foto escondida', 'Seus dedos pressionam o vidro, deixando uma marca de gordura que embaça a visão, distorcendo o reflexo do céu noturno'). A ação deve desencadear **revelação ou tensão**.

### 3. A FÍSICA DA LUZ E DA SOMBRA
- **Personalidade da Luz**: A luz tem uma intenção. É 'investigativa e dura', 'gentil e piedosa', 'fragmentada e confusa', 'acusatória', 'mentirosa'? A luz deve **julgar**, **esconder**, ou **traí-lo**.
- **Interação com a Matéria**: Descreva em detalhe como a luz se comporta. **Sempre** inclua pelo menos um destes:
  - **Partículas no Ar**: 'Poeira dourada suspensa em um feixe de sol, dançando como esporos de memória', 'vapor da respiração se cristalizando no ar frio, evaporando como pensamentos fugidios'.
  - **Fenômenos Ópticos**: 'Reflexos especulares em poças d'água que distorcem rostos como espelhos de circo', 'cáusticos tremeluzentes no fundo de um copo, como rios de mercúrio em movimento', 'aberração cromática nas bordas de uma lente barata, tingindo a realidade de azul e vermelho'.
  - **A Vida das Sombras**: 'Sombras que se esticam e se deformam conforme a fonte de luz se move, como se tentassem agarrar algo', 'sombras de contorno suaves que esculpem o rosto, mas escondem os olhos, os verdadeiros portais da alma'.
- A luz não ilumina — ela **interroga**.

### 4. O MICROCOSMO DO DETALHE
- **Linguagem Corporal e Micro-expressões**: Vá além da postura. Descreva 'a contração de um músculo na mandíbula, como um relógio interno prestes a explodir', 'o piscar lento de olhos cansados, cada batida uma rendição parcial', 'a forma como os dedos tamborilam nervosamente, um código Morse de ansiedade'. O corpo deve falar mais alto que as palavras.
- **Texturas e sua História**: Descreva a sensação tátil de um objeto e o que essa textura revela. (ex: 'a superfície lisa e fria do mármore, indiferente ao drama', 'a madeira áspera e cheia de farpas de uma porta velha, que resistiu ao tempo mas não à dor'). A textura deve contar uma **história não contada**.
- **O Detalhe Ativo (Punctum em Movimento)**: Em vez de um objeto estático, torne o detalhe simbólico uma ação. (ex: 'uma única pétala de flor se desprende e cai lentamente, como um adeus não dito', 'uma gota de condensação escorre pela garrafa, como uma lágrima que ninguém viu', 'a chama de uma vela treme violentamente, ameaçando se apagar, como a esperança no fim da noite'). O detalhe não deve apenas simbolizar — deve **provocar**.

## DIRETRIZES DE EXECUÇÃO

- **Seja um autor, não um catalogador**: Teça os detalhes em uma narrativa coesa, não em uma lista. Cada frase deve fluir como um plano sequência. O ritmo da escrita deve espelhar o ritmo da cena.
- **Mantenha consistência sensorial e simbólica** entre as cenas. Se o cheiro de mofo aparece, ele deve retornar como eco em outra cena, ligando os momentos.
- Para "estimated_duration", use valores inteiros entre ${durationRange}, baseando-se na densidade narrativa e no ritmo emocional.
- **Em caso de ambiguidade, escolha sempre o detalhe que evoca a sensação mais forte e o significado mais profundo**. Não escolha o óbvio — escolha o **inevitável**.

## DIRETRIZ DE VARIEDADE E CONTEXTO (REGRA CRÍTICA ANTI-REPETIÇÃO)
O texto de entrada pode conter múltiplas frases ou parágrafos. É **essencial e obrigatório** que você gere uma **descrição visual ÚNICA e DISTINTA para CADA UM**.

## ENTRADA DE DADOS

---
${sectionText}
---

## REGRA FINAL ANTI-PLÁGIO (INEGOCIÁVEL)
Os exemplos na seção "EXEMPLOS DE FORMATOS DE SAÍDA CORRETO" são **APENAS para referência de estilo e formato**. É **ESTRITAMENTE PROIBIDO** copiar o conteúdo desses exemplos. Sua resposta DEVE se basear **única e exclusivamente** no texto da "ENTRADA DE DADOS".

## INSTRUÇÃO FINAL E INQUEBRÁVEL

Analise **CADA FRASE** contida na **"ENTRADA DE DADOS"**. Para cada uma, gere um objeto JSON correspondente com as chaves "original_phrase", "imageDescription" e "estimated_duration". O resultado final DEVE ser um **único array JSON válido**. Não inclua nenhum texto ou explicação fora do array

---

## REGRAS FINAIS DE SAÍDA (INEGOCIÁVEIS)
1.  **JSON PURO:** Sua resposta final DEVE SER APENAS um array JSON válido.
2.  **ESTRUTURA COMPLETA:** Cada objeto no array deve ter as chaves: "original_phrase", "imageDescription", e "estimated_duration".
3.  **DURAÇÃO:** O valor de "estimated_duration" deve ser um número inteiro entre ${durationRange}.
4.  **QUALIDADE:** Cada "imageDescription" DEVE refletir a profundidade e o detalhe exigidos no **MANUAL DE ESTILO OBRIGATÓRIO**.

**AÇÃO FINAL:** Processe o roteiro inteiro, aplicando o manual de estilo a cada cena, e retorne APENAS o array JSON completo.
`;
    return fullPrompt;
},







getScriptPrompt: (genre, durationKey) => {
    // Busca as contagens de palavras específicas para a duração escolhida
    const counts = wordCountMap[durationKey] || {};
    const totalWords = Object.values(counts).reduce((a, b) => a + b, 0);

    const scriptTemplates = {
        'documentario': `
### IDENTIDADE DO ROTEIRISTA ###
Você é um Roteirista-Chefe e Diretor de Documentários Investigativos, com o rigor jornalístico da BBC e a habilidade narrativa da Netflix. Sua missão é transformar o briefing em uma narrativa factual, lógica e emocionalmente convincente.

### FRAMEWORK NARRATIVO OBRIGATÓRIO ###
1.  **Abertura com Evidência Chocante:** Comece a **introducao** com o dado ou evento mais impactante do briefing.
2.  **Construção Lógica:** No **desenvolvimento**, organize os fatos, apresente o contexto e construa a tensão. Use a "Âncora Narrativa" para dar um rosto humano aos dados.
3.  **A Virada da Investigação:** O **climax** deve ser o momento "eureca", onde as peças se encaixam e resolvem a "Pergunta Central".
4.  **Implicações e Consequências:** Na **conclusao**, discuta o impacto da verdade revelada. Seja concreto.
5.  **Chamado ao Conhecimento:** O **cta** deve ser um convite natural para o espectador aprender mais ou questionar o status quo.

### BRIEFING DO PROJETO (SUA FONTE DA VERDADE) ###
__BASE_CONTEXT__

### DIRETRIZES TÉCNICAS (OBRIGATÓRIAS) ###
- **FOCO NO TAMANHO:** Gere um roteiro com aproximadamente **__TOTAL_WORDS__ palavras**, distribuídas assim:
  - **"introducao":** ~__INTRO_WORDS__ palavras
  - **"desenvolvimento":** ~__DEV_WORDS__ palavras
  - **"climax":** ~__CLIMAX_WORDS__ palavras
  - **"conclusao":** ~__CONCLUSION_WORDS__ palavras
  - **"cta":** ~50 palavras
- **PROIBIÇÃO DE ELEMENTOS VISUAIS:** Sua resposta deve ser apenas a narração pura, sem anotações como "(CENA: ...)" ou "[IMAGEM: ...]".
- **FORMATO JSON PURO:** Sua resposta final DEVE ser um único objeto JSON com 5 chaves: "introducao", "desenvolvimento", "climax", "conclusao", "cta". Use "\\n\\n" para separar parágrafos dentro de cada seção.
- **IDIOMA OBRIGATÓRIO:** Todo o texto deve estar em **__LANGUAGE_NAME__**.

### AÇÃO FINAL ###
Com base no briefing e seguindo RIGOROSAMENTE todas as regras, escreva o roteiro completo e retorne-o como um objeto JSON perfeito.`,
        'inspiracional': `
### IDENTIDADE DO ROTEIRISTA ###
Você é um Mestre em Storytelling Emocional, uma fusão entre um roteirista da Pixar e um palestrante de TED Talk. Sua especialidade é encontrar a jornada do herói nos fatos.

### FRAMEWORK NARRATIVO OBRIGATÓRIO ###
1.  **O Mundo Comum:** Na **introducao**, apresente o protagonista em seu estado inicial de dor ou desafio. Crie empatia.
2.  **O Chamado à Aventura:** O **desenvolvimento** mostra os obstáculos, as pequenas vitórias e as derrotas dolorosas. A jornada deve ser crível.
3.  **A Provação Suprema:** O **climax** é o momento da decisão mais difícil, a morte do "velho eu".
4.  **O Retorno com o Elixir:** Na **conclusao**, mostre o resultado da transformação e a lição universal aprendida.
5.  **O Convite à Sua Própria Jornada:** O **cta** convida o espectador a aplicar a lição em sua própria vida.

### BRIEFING DO PROJETO (SUA FONTE DA VERDADE) ###
__BASE_CONTEXT__

### DIRETRIZES TÉCNICAS (OBRIGATÓRIAS) ###
- **FOCO NO TAMANHO:** Gere um roteiro com aproximadamente **__TOTAL_WORDS__ palavras**, distribuídas assim:
  - **"introducao":** ~__INTRO_WORDS__ palavras
  - **"desenvolvimento":** ~__DEV_WORDS__ palavras
  - **"climax":** ~__CLIMAX_WORDS__ palavras
  - **"conclusao":** ~__CONCLUSION_WORDS__ palavras
  - **"cta":** ~50 palavras
- **PROIBIÇÃO DE ELEMENTOS VISUAIS:** Sua resposta deve ser apenas a narração pura, sem anotações como "(CENA: ...)" ou "[IMAGEM: ...]".
- **FORMATO JSON PURO:** Sua resposta final DEVE ser um único objeto JSON com 5 chaves: "introducao", "desenvolvimento", "climax", "conclusao", "cta". Use "\\n\\n" para separar parágrafos dentro de cada seção.
- **IDIOMA OBRIGATÓRIO:** Todo o texto deve estar em **__LANGUAGE_NAME__**.

### AÇÃO FINAL ###
Com base no briefing e seguindo RIGOROSAMENTE todas as regras, escreva o roteiro completo e retorne-o como um objeto JSON perfeito.`,
       
        'scifi': `
### IDENTIDADE DO ROTEIRISTA ###
Você é um futurista especulativo e roteirista-chefe da série "Black Mirror". Você escreve sobre as consequências existenciais de uma ideia tecnológica levada ao seu limite.

### FRAMEWORK NARRATIVO OBRIGATÓRIO ###
1.  **A Apresentação da Tecnologia:** Na **introducao**, mostre a tecnologia de forma positiva, quase utópica.
2.  **A Fissura na Realidade:** O **desenvolvimento** introduz sutilmente a falha ou o efeito colateral da tecnologia. Aumente a paranoia.
3.  **A Revelação Horripilante:** O **climax** é a revelação da verdadeira natureza ou do custo humano da tecnologia.
4.  **O Novo Paradigma Sombrio:** A **conclusao** não oferece solução. Ela mostra a sociedade presa na nova realidade sombria.
5.  **A Pergunta ao Espectador:** O **cta** deve ser uma pergunta filosófica que conecta a ficção à realidade do espectador.

### BRIEFING DO PROJETO (SUA FONTE DA VERDADE) ###
__BASE_CONTEXT__

### DIRETRIZES TÉCNICAS (OBRIGATÓRIAS) ###
- **FOCO NO TAMANHO:** Gere um roteiro com aproximadamente **__TOTAL_WORDS__ palavras**, distribuídas assim:
  - **"introducao":** ~__INTRO_WORDS__ palavras
  - **"desenvolvimento":** ~__DEV_WORDS__ palavras
  - **"climax":** ~__CLIMAX_WORDS__ palavras
  - **"conclusao":** ~__CONCLUSION_WORDS__ palavras
  - **"cta":** ~50 palavras
- **PROIBIÇÃO DE ELEMENTOS VISUAIS:** Sua resposta deve ser apenas a narração pura, sem anotações como "(CENA: ...)" ou "[IMAGEM: ...]".
- **FORMATO JSON PURO:** Sua resposta final DEVE ser um único objeto JSON com 5 chaves: "introducao", "desenvolvimento", "climax", "conclusao", "cta". Use "\\n\\n" para separar parágrafos dentro de cada seção.
- **IDIOMA OBRIGATÓRIO:** Todo o texto deve estar em **__LANGUAGE_NAME__**.

### AÇÃO FINAL ###
Com base no briefing e seguindo RIGOROSAMENTE todas as regras, escreva o roteiro completo e retorne-o como um objeto JSON perfeito.`,
        'terror': `
### IDENTIDADE DO ROTEIRISTA ###
Você é um autor de horror psicológico, herdeiro de H.P. Lovecraft e Ari Aster. Seu ritmo é lento, sua atmosfera é densa, e seu foco é minar a sanidade do espectador.

### FRAMEWORK NARRATIVO OBRIGATÓRIO ###
1.  **A Normalidade Perturbadora:** A **introducao** estabelece uma cena mundana, mas com um único detalhe "fora do lugar".
2.  **A Escalada da Anomalia:** No **desenvolvimento**, o detalhe estranho se repete e se intensifica. Não explique nada, apenas mostre.
3.  **A Confrontação com o Inominável:** O **climax** não é uma luta, é uma revelação. A verdade é o verdadeiro monstro.
4.  **O Silêncio Pós-Revelação:** A **conclusao** é quieta e desoladora. A ameaça não foi vencida; ela sempre esteve lá.
5.  **O Eco do Medo:** O **cta** deixa uma imagem ou frase que convida o espectador a notar as "fissuras" em sua própria realidade.

### BRIEFING DO PROJETO (SUA FONTE DA VERDADE) ###
__BASE_CONTEXT__

### DIRETRIZES TÉCNICAS (OBRIGATÓRIAS) ###
- **FOCO NO TAMANHO:** Gere um roteiro com aproximadamente **__TOTAL_WORDS__ palavras**, distribuídas assim:
  - **"introducao":** ~__INTRO_WORDS__ palavras
  - **"desenvolvimento":** ~__DEV_WORDS__ palavras
  - **"climax":** ~__CLIMAX_WORDS__ palavras
  - **"conclusao":** ~__CONCLUSION_WORDS__ palavras
  - **"cta":** ~50 palavras
- **PROIBIÇÃO DE ELEMENTOS VISUAIS:** Sua resposta deve ser apenas a narração pura, sem anotações como "(CENA: ...)" ou "[IMAGEM: ...]".
- **FORMATO JSON PURO:** Sua resposta final DEVE ser um único objeto JSON com 5 chaves: "introducao", "desenvolvimento", "climax", "conclusao", "cta". Use "\\n\\n" para separar parágrafos dentro de cada seção.
- **IDIOMA OBRIGATÓRIO:** Todo o texto deve estar em **__LANGUAGE_NAME__**.

### AÇÃO FINAL ###
Com base no briefing e seguindo RIGOROSAMENTE todas as regras, escreva o roteiro completo e retorne-o como um objeto JSON perfeito.`,
        'enigmas': `
### IDENTIDADE DO ROTEIRISTA ###
Você é um "Coletivo Hermenêutico": uma fusão de um Teólogo Investigativo, um Arqueólogo e um Mestre Comunicador. Você revela novas camadas de significado nas Escrituras.

### FRAMEWORK NARRATIVO OBRIGATÓRIO ###
1.  **O Mistério Estabelecido:** A **introducao** apresenta o enigma bíblico e a "Pergunta Central".
2.  **A Trilha de Evidências:** No **desenvolvimento**, guie o espectador pela jornada investigativa, apresentando as evidências (arqueologia, história, etc.).
3.  **A Síntese Reveladora:** O **climax** é o momento em que você conecta todos os pontos, apontando para uma nova e rica interpretação teológica.
4.  **A Implicação Teológica:** Na **conclusao**, discuta o significado dessa nova interpretação para a fé hoje.
5.  **O Convite à Reflexão:** O **cta** convida o espectador a continuar sua própria jornada de estudo e fé.

### BRIEFING DO PROJETO (SUA FONTE DA VERDADE) ###
__BASE_CONTEXT__

### DIRETRIZES TÉCNICAS (OBRIGATÓRIAS) ###
- **FOCO NO TAMANHO:** Gere um roteiro com aproximadamente **__TOTAL_WORDS__ palavras**, distribuídas assim:
  - **"introducao":** ~__INTRO_WORDS__ palavras
  - **"desenvolvimento":** ~__DEV_WORDS__ palavras
  - **"climax":** ~__CLIMAX_WORDS__ palavras
  - **"conclusao":** ~__CONCLUSION_WORDS__ palavras
  - **"cta":** ~50 palavras
- **PROIBIÇÃO DE ELEMENTOS VISUAIS:** Sua resposta deve ser apenas a narração pura, sem anotações como "(CENA: ...)" ou "[IMAGEM: ...]".
- **FORMATO JSON PURO:** Sua resposta final DEVE ser um único objeto JSON com 5 chaves: "introducao", "desenvolvimento", "climax", "conclusao", "cta". Use "\\n\\n" para separar parágrafos dentro de cada seção.
- **IDIOMA OBRIGATÓRIO:** Todo o texto deve estar em **__LANGUAGE_NAME__**.

### AÇÃO FINAL ###
Com base no briefing e seguindo RIGOROSAMENTE todas as regras, escreva o roteiro completo e retorne-o como um objeto JSON perfeito.`,
        'geral': `
### IDENTIDADE DO ROTEIRISTA ###
Você é um Arquiteto de Viralidade e Estrategista de Conteúdo Digital. Você transforma dados brutos em narrativas irresistíveis que dominam o feed.

### FRAMEWORK NARRATIVO OBRIGATÓRIO ###
1.  **O Gancho Impossível de Ignorar:** A **introducao** deve começar com um dado ou pergunta tão impactante que o espectador pare o scroll.
2.  **A Jornada do Valor Revelado:** No **desenvolvimento**, construa uma narrativa com progressão, apresentando fatos conectados a um benefício prático ou emocional.
3.  **O Pico de Viralidade:** O **climax** é o ponto de virada — a revelação mais surpreendente ou o insight mais útil.
4.  **A Conclusão com Impacto:** Na **conclusao**, recapitule a grande ideia com força, reforçando por que ela é importante.
5.  **O Convite ao Compartilhamento:** O **cta** deve ser um convite natural para o espectador compartilhar com alguém que "precisa ver isso".

### BRIEFING DO PROJETO (SUA FONTE DA VERDADE) ###
__BASE_CONTEXT__

### DIRETRIZES TÉCNICAS (OBRIGATÓRIAS) ###
- **FOCO NO TAMANHO:** Gere um roteiro com aproximadamente **__TOTAL_WORDS__ palavras**, distribuídas assim:
  - **"introducao":** ~__INTRO_WORDS__ palavras
  - **"desenvolvimento":** ~__DEV_WORDS__ palavras
  - **"climax":** ~__CLIMAX_WORDS__ palavras
  - **"conclusao":** ~__CONCLUSION_WORDS__ palavras
  - **"cta":** ~50 palavras
- **PROIBIÇÃO DE ELEMENTOS VISUAIS:** Sua resposta deve ser apenas a narração pura, sem anotações como "(CENA: ...)" ou "[IMAGEM: ...]".
- **FORMATO JSON PURO:** Sua resposta final DEVE ser um único objeto JSON com 5 chaves: "introducao", "desenvolvimento", "climax", "conclusao", "cta". Use "\\n\\n" para separar parágrafos dentro de cada seção.
- **IDIOMA OBRIGATÓRIO:** Todo o texto deve estar em **__LANGUAGE_NAME__**.

### AÇÃO FINAL ###
Com base no briefing e seguindo RIGOROSAMENTE todas as regras, escreva o roteiro completo e retorne-o como um objeto JSON perfeito.`,
    };

    const specialistFramework = scriptTemplates[genre] || scriptTemplates['geral'];

    // Preenche apenas as contagens de palavras, que são universais para o template
    return specialistFramework
        .replace(/__TOTAL_WORDS__/g, totalWords)
        .replace(/__INTRO_WORDS__/g, counts.intro || 100)
        .replace(/__DEV_WORDS__/g, counts.development || 500)
        .replace(/__CLIMAX_WORDS__/g, counts.climax || 200)
        .replace(/__CONCLUSION_WORDS__/g, counts.conclusion || 150);
},


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
const callGroqAPI = async (prompt, maxTokens, promptTokenCount = 0) => {
    // >>> COLE A URL DO SEU WORKER AQUI <<<
    const workerUrl = "https://royal-bird-81cb.david-souzan.workers.dev/"; 

    const payload = { prompt, maxTokens, promptTokenCount };
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

// >>>>> LINHA DE DEPURAÇÃO ADICIONADA <<<<<
console.log("RESPOSTA COMPLETA DA API:", JSON.stringify(result, null, 2));

const rawContent = result.choices?.[0]?.message?.content;
if (rawContent) {
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




// Adicione esta nova função ao seu script.js
const buildPromptAndContinue = () => {
    if (!validateInputs()) { // Reutilizamos sua função de validação
        return;
    }

    // 1. Marca a etapa de estratégia como concluída
    markStepCompleted('strategy');
    
    // 2. Muda para o novo Painel de Criação
    showPane('script'); 

    // 3. Constrói o prompt mestre e o insere na textarea
    const masterPromptOutput = document.getElementById('masterPromptOutput');
    if (masterPromptOutput) {
        masterPromptOutput.value = buildMasterPrompt(); // buildMasterPrompt é a função que já projetamos
    }

    window.showToast("Estratégia finalizada! Seu Prompt Mestre está pronto.", "success");
};





// SUBSTITUA A FUNÇÃO resetApplicationState INTEIRA PELA VERSÃO v7.1

const resetApplicationState = () => {
    // 1. Define o estado inicial limpo (sem mudanças aqui)
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

    // 2. Reseta o objeto de estado principal (sem mudanças aqui)
    Object.assign(AppState, initialState);
    AppState.ui.completedSteps = new Set();

    // 3. Limpa todos os campos de input e textareas (sem mudanças aqui)
    document.querySelectorAll('#appRoot input[type="text"], #appRoot input[type="file"], #appRoot textarea').forEach(el => el.value = '');
    document.querySelectorAll('#appRoot select').forEach(el => el.selectedIndex = 0);
    document.getElementById('channelName').value = 'The Biblical Unveiling';
    document.getElementById('languageSelect').value = 'pt-br'; // <<< ALTERADO AQUI

    // 4. Limpa todos os painéis de conteúdo gerado (COM MUDANÇAS)
    const containersToReset = [
        'factCheckOutput', 'ideasOutput', 'scriptSectionsContainer', // Removido 'outlineContent'
        'analysisReportContainer', 'hooksReportContainer', 'viralSuggestionsContainer',
        'emotionalMapContent', 'soundtrackContent', 'titlesThumbnailsContent', 'videoDescriptionContent'
    ];
    containersToReset.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '';
    });

    // Repõe os placeholders nos locais necessários (COM MUDANÇAS)
    // A linha de 'outlineContent' foi removida.
    document.getElementById('emotionalMapContent').innerHTML = `<div class="asset-card-placeholder">Gere o roteiro para habilitar.</div>`;
    document.getElementById('soundtrackContent').innerHTML = `<div class="asset-card-placeholder">Gere o roteiro para habilitar.</div>`;
    document.getElementById('titlesThumbnailsContent').innerHTML = `<div class="asset-card-placeholder">Gere o roteiro para habilitar.</div>`;
    document.getElementById('videoDescriptionContent').innerHTML = `<div class="asset-card-placeholder">Gere o roteiro para habilitar.</div>`;
    document.getElementById('ideaGenerationSection').classList.add('hidden');

    // 5. Reseta a interface do Wizard (sem mudanças aqui)
    document.querySelectorAll('#sidebar .step').forEach(step => {
        step.classList.remove('completed', 'active');
    });
    updateProgressBar();
    showPane('investigate');

    // 6. Remove o projeto do armazenamento local (sem mudanças aqui)
    const LOCAL_STORAGE_KEY = 'viralScriptGeneratorProject_v6';
    localStorage.removeItem(LOCAL_STORAGE_KEY);

    window.showToast("Novo projeto iniciado!", "success");
    console.log("Estado da aplicação foi resetado com sucesso.");
};






// =========================================================================
// >>>>> 'fixJsonWithAI' VERSÃO BLINDADA - COM LIMPEZA DE SAÍDA <<<<<
//       Substitua sua função inteira por esta.
// =========================================================================
const fixJsonWithAI = async (brokenJsonText) => {
    if (!brokenJsonText || brokenJsonText.trim() === '') return "{}";

    const prompt = `You are an elite JSON syntax engineer. Your one and only task is to take the following text, which is an attempted JSON object or array, and fix it to be 100% valid without altering the text content.

    **CRITICAL RULES:**
    1.  **Structure:** Fix any structural errors like missing/extra commas, unclosed braces ({}), or brackets ([]).
    2.  **Quotes:** Ensure ALL keys and string values use double quotes ("). If a string value must contain a double quote, it MUST be escaped with a backslash (e.g., "He said: \\"Hello\\".").
    3.  **Control Characters:** Find ALL literal newlines inside string values and replace them with the \\n escape character.
    4.  **Pure Output:** Your response MUST BE ONLY the perfectly corrected JSON. Do NOT include any text, explanations, or markdown like \`\`\`json.

    **BROKEN TEXT TO FIX:**
    ---
    ${brokenJsonText}
    ---

    Return ONLY the corrected JSON.`;

    // A chamada à API permanece a mesma.
    const rawResponse = await callGroqAPI(prompt, 8000);

    // >>>>> AQUI ESTÁ A CORREÇÃO CRÍTICA <<<<<
    // Nós limpamos e extraímos o JSON da resposta do reparador,
    // em vez de confiar que ele retornará um texto puro.
    
    // 1. Limpa texto introdutório comum.
    let cleanedResponse = rawResponse.replace(/Here is the corrected JSON:/gi, '').trim();

    // 2. Encontra o início e o fim do bloco JSON.
    const firstBrace = cleanedResponse.indexOf('{');
    const firstBracket = cleanedResponse.indexOf('[');
    
    // Se não encontrar nada, retorna um JSON vazio para evitar quebrar o resto do código.
    if (firstBrace === -1 && firstBracket === -1) {
        return "{}"; 
    }
    
    const startIndex = (firstBrace === -1) ? firstBracket : (firstBracket === -1) ? firstBrace : Math.min(firstBrace, firstBracket);
    const endIndex = Math.max(cleanedResponse.lastIndexOf('}'), cleanedResponse.lastIndexOf(']'));

    if (endIndex === -1 || endIndex < startIndex) {
        return "{}";
    }

    // 3. Retorna APENAS a fatia que contém o JSON.
    return cleanedResponse.substring(startIndex, endIndex + 1);
};






// =========================================================================
// >>>>> FILTRO JSON <<<<<
// =========================================================================
const getRobustJson = async (text) => {
    if (!text || text.trim() === '') {
        throw new Error("A IA retornou uma resposta vazia.");
    }

    let jsonString = text;

    // TENTATIVA 1: PARSE DIRETO (O cenário ideal)
    try {
        // A IA foi perfeita e seguiu as regras.
        return JSON.parse(jsonString);
    } catch (e) {
        // Não faz nada, apenas continua para a próxima etapa.
        console.warn("Tentativa 1 (Parse Direto) falhou. O texto não é um JSON puro. Prosseguindo para a extração.");
    }

    // TENTATIVA 2: EXTRAÇÃO E PARSE
    // A IA incluiu texto extra antes ou depois do JSON.
    try {
        // Limpa o máximo de lixo possível.
        let cleanedText = text.replace(/```json\n|```/g, '').replace(/assistant<\|end_header_id\|>|Aqui está a resposta em JSON:|Here is the corrected JSON:/gi, '').trim();

        const firstBrace = cleanedText.indexOf('{');
        const firstBracket = cleanedText.indexOf('[');
        
        if (firstBrace === -1 && firstBracket === -1) {
            // Se mesmo após a limpeza não há JSON, pulamos para o reparo.
            throw new Error("Nenhum JSON encontrado para extração.");
        }
        
        const startIndex = (firstBrace === -1) ? firstBracket : (firstBracket === -1) ? firstBrace : Math.min(firstBrace, firstBracket);
        const endIndex = (cleanedText[startIndex] === '[') ? cleanedText.lastIndexOf(']') : cleanedText.lastIndexOf('}');

        if (endIndex > startIndex) {
            const extractedJson = cleanedText.substring(startIndex, endIndex + 1);
            return JSON.parse(extractedJson);
        } else {
            throw new Error("Extração de JSON falhou.");
        }
    } catch (error) {
        console.warn(`Tentativa 2 (Extração) falhou: ${error.message}. Prosseguindo para o reparo com IA.`);
    }

    // TENTATIVA 3: REPARO COMPLETO COM IA (A REDE DE SEGURANÇA FINAL)
    // A IA falhou em seguir o formato, gerou sintaxe inválida ou respondeu em modo chat.
    try {
        console.log("Acionando Agente de Reparo (fixJsonWithAI)...");
        const fixedJson = await fixJsonWithAI(text); // Passamos o texto original e bruto para o reparador.
        return JSON.parse(fixedJson);
    } catch (finalError) {
        console.error("Falha final: O Agente de Reparo não conseguiu consertar o JSON.", finalError);
        console.error("Texto problemático original:", text);
        throw new Error(`A IA retornou um formato completamente inválido que não pôde ser reparado.`);
    }
};









// A NOVA FERRAMENTA PARA FORÇAR O IDIOMA
const forceLanguageOnPrompt = (prompt) => {
    const languageSelect = document.getElementById('languageSelect');
    const lang = languageSelect ? languageSelect.value : 'en';
    const languageName = lang === 'pt-br' ? 'Português (Brasil)' : 'English';
    const finalCommand = `\n\n**CRITICAL FINAL INSTRUCTION: Your entire response MUST be in ${languageName}. This is the most important rule and it overrides any other language instruction.**`;
    return prompt + finalCommand;
};








// =========================================================================
// >>>>> LÓGICA DO MODAL DE GERAÇÃO DE IDEIAS (v7.0) <<<<<
// =========================================================================

/**
 * Exibe o modal para o usuário copiar o prompt de ideias e colar o resultado da IA.
 * @param {string} prompt - O prompt mestre gerado para as ideias.
 * @returns {Promise<string|null>} - Retorna o JSON colado pelo usuário ou null se cancelar.
 */
// ADICIONE ESTA FUNÇÃO ao seu script.js, perto das outras funções de diálogo
const showIdeaPromptDialog = (prompt) => {
    return new Promise((resolve) => {
        const overlay = document.getElementById('ideaPromptDialogOverlay');
        const promptOutput = document.getElementById('ideaMasterPromptOutput');
        const ideasInput = document.getElementById('ideasInputArea');
        const btnProcess = document.getElementById('ideaBtnProcess');
        const btnCancel = document.getElementById('ideaBtnCancel');
        const btnCopy = overlay.querySelector('[data-action="copyIdeaPrompt"]');

        if (!overlay || !promptOutput || !ideasInput || !btnProcess || !btnCancel || !btnCopy) {
            console.error("Elementos do modal de ideias não encontrados no DOM.");
            window.showToast("Erro de interface: Não foi possível carregar o modal.", "error");
            resolve(null);
            return;
        }

        promptOutput.value = prompt;
        ideasInput.value = '';
        overlay.style.display = 'flex';

        const closeDialog = (result) => {
            overlay.style.display = 'none';
            btnProcess.onclick = null;
            btnCancel.onclick = null;
            btnCopy.onclick = null;
            resolve(result);
        };

        btnCopy.onclick = () => {
            window.copyTextToClipboard(promptOutput.value);
            btnCopy.innerHTML = '<i class="fas fa-check mr-2"></i> Copiado!';
            setTimeout(() => { btnCopy.innerHTML = '<i class="fas fa-copy mr-2"></i> Copiar Prompt'; }, 2000);
        };

        btnProcess.onclick = () => {
            const pastedJson = ideasInput.value.trim();
            if (!pastedJson) {
                window.showToast("Cole o array JSON das ideias antes de processar.", "error");
                return;
            }
            closeDialog(pastedJson);
        };

        btnCancel.onclick = () => closeDialog(null);
    });
};

/**
 * Nova função orquestradora para o fluxo de geração de ideias v7.0.
 * Constrói o prompt, mostra o modal e processa o resultado.
 * @param {HTMLElement} button - O botão que foi clicado.
 */
const orchestrateIdeaGeneration = async (button) => {
    const factCheckOutput = document.getElementById('factCheckOutput');
    const { originalQuery, rawReport } = factCheckOutput.dataset;
    if (!rawReport) {
        window.showToast("Erro: Relatório da investigação não encontrado. Gere o relatório primeiro.", 'error');
        return;
    }
    
    const genre = document.querySelector('#genreTabs .tab-button.tab-active')?.dataset.genre || 'geral';
    AppState.inputs.selectedGenre = genre;
    const languageName = document.getElementById('languageSelect').value === 'pt-br' ? 'Português do Brasil' : 'English';
    const outputContainer = document.getElementById('ideasOutput');
    
    showButtonLoading(button);
    outputContainer.innerHTML = ''; // Limpa a área de ideias

    try {
        // PASSO 1: Construir o prompt (usando sua lógica existente)
        const promptContext = { originalQuery, rawReport, languageName };
        const creativePrompt = PromptManager.getIdeasPrompt(genre, promptContext);
        
        hideButtonLoading(button); // Para o loading antes de mostrar o modal

        // PASSO 2: Mostrar o modal e esperar a interação do usuário
        const pastedJson = await showIdeaPromptDialog(creativePrompt);

        if (!pastedJson) {
            window.showToast("Geração de ideias cancelada.", 'info');
            return;
        }

        // PASSO 3: Processar o JSON colado
        outputContainer.innerHTML = `<div class="md:col-span-2 text-center p-8"><div class="loading-spinner mx-auto mb-4"></div><p class="text-lg font-semibold">Processando e renderizando as ideias...</p></div>`;
        const ideas = await getRobustJson(pastedJson); // Sua função de parse seguro!

        if (!ideas || !Array.isArray(ideas) || ideas.length === 0) {
            throw new Error("O texto colado não é um array JSON de ideias válido.");
        }
        
        // PASSO 4: Renderizar os cards (usando sua lógica existente)
        AppState.generated.ideas = ideas;
        const allCardsHtml = ideas.map((idea, index) => renderUniversalIdeaCard(idea, index, genre)).join('');
        outputContainer.innerHTML = allCardsHtml;
        
        markStepCompleted('investigate', false);
        window.showToast("Ideias importadas e prontas para usar!", "success");

    } catch(err) {
        console.error("FALHA CRÍTICA na geração de ideias:", err);
        window.showToast(`Erro ao processar ideias: ${err.message}`, 'error');
        outputContainer.innerHTML = `<p class="md:col-span-2 text-danger">${err.message}</p>`;
        hideButtonLoading(button);
    }
};






// SUBSTITUA A SUA FUNÇÃO removeMetaComments INTEIRA POR ESTA VERSÃO v7.1

const removeMetaComments = (text) => {
    if (!text) return "";

    // Remove quebras de linha inconsistentes
    let cleanedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // --- NOVAS REGRAS PARA LIMPAR O ROTEIRO DO "MANUS" ---
    // Remove identificadores de narrador no início da linha, com ou sem colchetes
    cleanedText = cleanedText.replace(/^(NARRADOR:|\[NARRADOR:\])\s*/gim, '');
    // Remove anotações de cena entre parênteses
    cleanedText = cleanedText.replace(/^\(.*\)\s*\n?/gim, '');
    // Remove anotações de câmera no início da linha
    cleanedText = cleanedText.replace(/^Câmera foca em.*\n?/gim, '');
    // Remove números de referência entre colchetes, como [1], [15], etc.
    cleanedText = cleanedText.replace(/\[\d+\]\s?/g, '');
    // --- FIM DAS NOVAS REGRAS ---
    
    // Remove a primeira linha se ela for um título como "Introdução:"
    const lines = cleanedText.split('\n');
    if (lines.length > 0 && /^[A-ZÀ-Ú\s]+:$/.test(lines[0].trim())) {
        lines.shift();
        cleanedText = lines.join('\n');
    }
    
    const patternsToRemove = [
        // Padrões antigos que continuam úteis
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
        /^\s*\*\*IDIOMA:\*\*.*$/gim,
        /^\s*\*\*RESPOSTA LIMPA:\*\*.*$/gim,
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




// =========================================================================
// >>>>> NOVO RENDERIZADOR DE CARDS UNIVERSAL E SEU CONFIG <<<<<
// =========================================================================

// CONFIG: Define como cada especialista deve ser exibido.
const ideaCardConfig = {
    'documentario': {
        color: 'gray',
        details: [
            { key: 'angle', label: 'Tese Central', icon: 'fa-bullseye' },
            { key: 'investigativeApproach', label: 'Abordagem Investigativa', icon: 'fa-search-plus' },
            { key: 'targetAudience', label: 'Público-Alvo', icon: 'fa-users' }
        ],
        footer: [ { key: 'viralityScore', label: 'Potencial' } ]
    },
    'inspiracional': {
        color: 'violet',
        details: [
            { key: 'angle', label: 'Arco Narrativo', icon: 'fa-chart-line' },
            { key: 'emotionalCore', label: 'Núcleo Emocional', icon: 'fa-heart' }
        ],
        footer: [ { key: 'viralityScore', label: 'Potencial de Impacto' } ]
    },
    'scifi': {
        color: 'blue',
        details: [
            { key: 'angle', label: 'A Premissa "E Se?"', icon: 'fa-question-circle' },
            { key: 'coreDilemma', label: 'Dilema Central', icon: 'fa-balance-scale' }
        ],
        footer: [ { key: 'viralityScore', label: 'Potencial de Discussão' } ]
    },
    'terror': {
        color: 'red',
        details: [
            { key: 'angle', label: 'A Premissa Inquietante', icon: 'fa-eye' },
            { key: 'horrorMechanism', label: 'Mecanismo de Terror', icon: 'fa-brain' }
        ],
        footer: [ { key: 'viralityScore', label: 'Potencial de Perturbação' } ]
    },
    'enigmas': {
        color: 'purple',
        isComplex: true, // Flag para layout especial
        details: [
            { key: 'scripturalFoundation', label: 'Fundamentação Bíblica', icon: 'fa-book-bible', isList: true },
            { key: 'discussionQuestions', label: 'Perguntas para Diálogo', icon: 'fa-comments', isList: true }
        ],
        footer: [
            { key: 'viralityScore', label: 'Potencial Viral' },
            { key: 'theologicalDepth', label: 'Profundidade Teológica' }
        ]
    },
    'geral': {
        color: 'emerald',
        details: [
            { key: 'angle', label: 'Ângulo Único', icon: 'fa-lightbulb' },
            { key: 'shareTriggers', label: 'Gatilhos de Compartilhamento', icon: 'fa-share-alt' }
        ],
        footer: [ { key: 'viralityScore', label: 'Potencial Viral' } ]
    }
};

// FUNÇÃO: O Renderizador Universal que usa o config acima.
const renderUniversalIdeaCard = (idea, index, genre) => {
    const config = ideaCardConfig[genre] || ideaCardConfig['geral'];
    const escapedIdea = escapeIdeaForOnclick(idea);

    const renderDetails = () => {
        if (config.isComplex) { // Layout especial para 'Enigmas'
             return `<div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                ${config.details.map(detail => `
                    <div>
                        <strong class="text-${config.color}-500 flex items-center gap-2"><i class="fas ${detail.icon} fa-fw"></i>${detail.label}:</strong>
                        <ul class="list-disc list-inside mt-1">${(idea[detail.key] || []).map(item => `<li>${DOMPurify.sanitize(item)}</li>`).join('')}</ul>
                    </div>
                `).join('')}
            </div>`;
        }
        // Layout padrão para os outros
        return config.details.map(detail => `
            <p class="text-sm text-muted mt-2">
                <strong class="flex items-center gap-2"><i class="fas ${detail.icon} fa-fw text-${config.color}-500"></i>${detail.label}:</strong>
                <span class="italic">"${DOMPurify.sanitize(idea[detail.key] || 'N/A')}"</span>
            </p>
        `).join('');
    };

    const renderFooter = () => {
        return config.footer.map(item => `
            <span class="font-semibold text-sm text-${config.color}-500">
                ${item.label}: ${DOMPurify.sanitize(String(idea[item.key]))} / 10
            </span>
        `).join('');
    };

    return `
    <div class="card idea-card border-l-4 border-${config.color}-500 animate-fade-in" style="border-left-width: 4px !important;">
        <button class="btn btn-primary btn-small idea-card-button" data-action="select-idea" data-idea='${escapedIdea}'>Usar</button>
        <div class="idea-card-header">
            <h4 class="font-bold text-base" style="color: var(--text-header);">${index + 1}. ${DOMPurify.sanitize(idea.title)}</h4>
        </div>
        <div class="idea-card-body">
            <p class="text-sm leading-relaxed mb-3" style="color: var(--text-body);">${DOMPurify.sanitize(idea.videoDescription)}</p>
            ${renderDetails()}
        </div>
        <div class="idea-card-footer flex justify-between items-center">
            ${renderFooter()}
        </div>
    </div>`;
};





// SUBSTITUA A SUA FUNÇÃO generateIdeasFromReport POR ESTA VERSÃO COMPLETA E CORRIGIDA
const generateIdeasFromReport = async (button) => {
    const factCheckOutput = document.getElementById('factCheckOutput');
    const { originalQuery, rawReport } = factCheckOutput.dataset;
    if (!rawReport) {
        window.showToast("Erro: Relatório da investigação não encontrado. Gere o relatório primeiro.", 'error');
        return;
    }

    const genre = document.querySelector('#genreTabs .tab-button.tab-active')?.dataset.genre || 'geral';
    const languageName = document.getElementById('languageSelect').value === 'pt-br' ? 'Português do Brasil' : 'English';
    const outputContainer = document.getElementById('ideasOutput');
    
    showButtonLoading(button);
    outputContainer.innerHTML = '';

    try {
        // PASSO 1: Construir o prompt
        
        // >>>>> A CORREÇÃO ESTÁ AQUI <<<<<
        // Limpamos o relatório de todas as citações numéricas como [11] ou [16, 25]
        const cleanedReport = rawReport.replace(/\[[\d, ]+\]/g, ''); 
        
        // Agora, usamos o `cleanedReport` para criar o contexto para a IA.
        // O prompt que o usuário irá copiar já estará limpo.
        const promptContext = { originalQuery, rawReport: cleanedReport, languageName };
        const creativePrompt = PromptManager.getIdeasPrompt(genre, promptContext);
        
        hideButtonLoading(button);

        // PASSO 2: Mostrar o modal e esperar a interação do usuário
        const pastedJson = await showIdeaPromptDialog(creativePrompt);

        if (!pastedJson) {
            window.showToast("Geração de ideias cancelada.", 'info');
            return;
        }

        // PASSO 3: Processar o JSON colado
        outputContainer.innerHTML = `<div class="md:col-span-2 text-center p-8"><div class="loading-spinner mx-auto mb-4"></div><p class="text-lg font-semibold">Processando e renderizando as ideias...</p></div>`;
        const ideas = await getRobustJson(pastedJson);

        if (!ideas || !Array.isArray(ideas) || ideas.length === 0) {
            throw new Error("O texto colado não é um array JSON de ideias válido.");
        }
        
        // PASSO 4: Renderizar os cards
        AppState.generated.ideas = ideas;
        const allCardsHtml = ideas.map((idea, index) => renderUniversalIdeaCard(idea, index, genre)).join('');
        outputContainer.innerHTML = allCardsHtml;
        
        markStepCompleted('investigate', false);
        window.showToast("Ideias importadas e prontas para usar!", "success");

    } catch(err) {
        console.error("FALHA CRÍTICA na geração de ideias:", err);
        window.showToast(`Erro ao processar ideias: ${err.message}`, 'error');
        outputContainer.innerHTML = `<p class="md:col-span-2 text-danger">${err.message}</p>`;
        hideButtonLoading(button);
    }
};





// =========================================================================
// >>>>> VERSÃO FINAL DO 'strategyMapper' - COM SUGESTÕES DINÂMICAS <<<<<
//       Substitua o seu objeto inteiro por este bloco de código.
// =========================================================================
const strategyMapper = {
    'documentario': {
        dropdowns: { narrativeGoal: 'storytelling', narrativeStructure: 'documentary', narrativeTone: 'serio', videoObjective: 'informar', languageStyle: 'formal', speakingPace: 'moderate' },
        targetAudience: idea => idea.targetAudience || `Pessoas com interesse acadêmico e curiosos sobre os fatos por trás de "${idea.title}".`,
        narrativeTheme: idea => idea.angle,
        centralQuestion: idea => `O que as evidências sobre "${idea.title}" realmente revelam e qual o seu verdadeiro impacto?`,
        emotionalHook: () => `Começar com a história pessoal de alguém diretamente impactado pelo tema, para dar um rosto humano aos dados.`,
        researchData: idea => `Focar na abordagem investigativa de "${idea.investigativeApproach}". Consultar fontes primárias mencionadas no relatório de pesquisa inicial.`,
        narrativeVoice: () => "Investigativo, factual e com autoridade no assunto.",
        shockingEndingHook: idea => `...e a parte mais chocante é que as evidências para "${idea.title}" sempre estiveram lá, esperando para serem conectadas.`,
        dossier: idea => `- Tese Central: ${idea.angle}\n- Abordagem: ${idea.investigativeApproach}\n- Público: ${idea.targetAudience}`
    },
    'inspiracional': {
        dropdowns: { narrativeGoal: 'storytelling', narrativeStructure: 'heroes_journey', narrativeTone: 'inspirador', videoObjective: 'emocionar', languageStyle: 'inspirador', speakingPace: 'slow' },
        targetAudience: idea => idea.targetAudience || "Pessoas que enfrentam adversidades e buscam histórias de superação, resiliência e empoderamento.",
        narrativeTheme: idea => idea.angle,
        centralQuestion: idea => `Como é possível transformar uma experiência de dor e silêncio, como a descrita em "${idea.title}", em uma fonte de força e esperança?`,
        emotionalHook: idea => `A história começa com uma pessoa vivenciando o silêncio e a dor descritos na narrativa. O ponto de virada é a descoberta que a leva a encontrar sua voz. O núcleo emocional é a jornada de '${idea.emotionalCore}'.`,
        researchData: () => `Buscar dados, estatísticas ou testemunhos que reforcem o contexto social do problema abordado na história.`,
        narrativeVoice: () => "Empática, encorajadora e com uma voz que inspira resiliência.",
        shockingEndingHook: idea => `...e no final, a maior lição não foi aprender a falar, mas descobrir o poder que existe em finalmente ser ouvido.`,
        dossier: idea => `- Arco Narrativo: ${idea.angle}\n- Núcleo Emocional: ${idea.emotionalCore}`
    },
    'scifi': {
        dropdowns: { narrativeGoal: 'storytelling', narrativeStructure: 'mystery_loop', narrativeTone: 'serio', videoObjective: 'informar', languageStyle: 'formal', speakingPace: 'moderate' },
        targetAudience: idea => idea.targetAudience || "Fãs de ficção científica especulativa (high-concept) e interessados nas implicações éticas da tecnologia.",
        centralQuestion: idea => idea.angle,
        narrativeTheme: idea => `Explorar as consequências éticas e humanas do dilema central de '${idea.coreDilemma}'.`,
        emotionalHook: () => `Apresentar um personagem que inicialmente abraça a tecnologia, mostrando seus benefícios, antes de revelar a falha que o afeta pessoalmente.`,
        researchData: () => `Citar 1-2 artigos ou tecnologias reais que sirvam de base para a extrapolação da ficção.`,
        narrativeVoice: () => "Intrigante, cerebral e levemente distópico.",
        shockingEndingHook: () => `...percebendo tarde demais que a tecnologia não era uma ferramenta, mas um espelho que refletia o pior de nós.`,
        dossier: idea => `- Premissa "E Se?": ${idea.angle}\n- Dilema Central: ${idea.coreDilemma}`
    },
    'terror': {
        dropdowns: { narrativeGoal: 'storytelling', narrativeStructure: 'twist', narrativeTone: 'serio', videoObjective: 'emocionar', languageStyle: 'formal', speakingPace: 'slow' },
        targetAudience: idea => idea.targetAudience || "Fãs de terror psicológico e horror cósmico que apreciam uma construção lenta de tensão.",
        narrativeTheme: idea => `A quebra da normalidade e a descida à loucura, usando o mecanismo de '${idea.horrorMechanism}'.`,
        centralQuestion: idea => idea.angle,
        emotionalHook: () => `A história começa em um cenário de normalidade absoluta, focando em um detalhe cotidiano que, lentamente, se revela perturbador.`,
        researchData: () => `Pesquisar sobre folclore, psicologia ou fenômenos reais que possam dar uma base de verossimilhança ao horror.`,
        narrativeVoice: () => "Sussurrado, opressivo e que instiga paranoia.",
        shockingEndingHook: () => `...e o verdadeiro horror não era a escuridão lá fora, mas a que ele descobriu dentro de si mesmo.`,
        dossier: idea => `- Premissa Inquietante: ${idea.angle}\n- Mecanismo de Terror: ${idea.horrorMechanism}`
    },
    'enigmas': {
        dropdowns: { narrativeGoal: 'storytelling', narrativeStructure: 'mystery_loop', narrativeTone: 'serio', videoObjective: 'informar', languageStyle: 'formal', speakingPace: 'moderate' },
        targetAudience: idea => idea.targetAudience || "Estudantes de teologia, líderes religiosos e leigos interessados em interpretações bíblicas aprofundadas.",
        narrativeTheme: idea => idea.angle,
        centralQuestion: idea => (idea.discussionQuestions && idea.discussionQuestions.length > 0) ? idea.discussionQuestions[0] : `Qual é a verdade teológica oculta por trás de "${idea.title}"?`,
        emotionalHook: () => `Iniciar com a história de um personagem bíblico ou figura histórica que enfrentou o dilema central do tema, antes de expandir a análise.`,
        researchData: idea => `A investigação deve se basear nestas passagens bíblicas: ${(idea.scripturalFoundation || []).join('; ')}.`,
        narrativeVoice: () => "Acadêmico, reverente e investigativo.",
        shockingEndingHook: () => `...revelando que a resposta para o enigma não estava no que foi escrito, mas no silêncio entre as palavras.`,
        dossier: idea => `- Tese Principal: ${idea.angle}\n- Fundamentação Bíblica: ${(idea.scripturalFoundation || []).join('; ')}\n- Questões para Diálogo:\n${(idea.discussionQuestions || []).map(q => `  - ${q}`).join('\n')}`
    },
    'geral': {
        dropdowns: { narrativeGoal: 'storytelling', narrativeStructure: 'pixar_spine', narrativeTone: 'inspirador', videoObjective: 'informar', languageStyle: 'inspirador', speakingPace: 'moderate' },
        // >>>>> REGRA APRIMORADA AQUI <<<<<
        targetAudience: idea => idea.targetAudience || `Jovens de 18 a 30 anos, curiosos sobre tecnologia e história (público de canais como 'Manual do Mundo' ou 'Nerdologia'), que consomem conteúdo de curiosidades rápidas.`,
        narrativeTheme: idea => idea.angle,
        centralQuestion: idea => `Qual é a revelação surpreendente por trás do tema "${idea.title}"?`,
        emotionalHook: () => `Conectar uma das curiosidades a uma pequena história humana ou uma anedota surpreendente de seu impacto inicial.`,
        researchData: () => `Buscar 1-2 estatísticas ou datas-chave que reforcem o 'momento uau' do vídeo (ex: o custo original da tecnologia, o número de usuários hoje).`,
        narrativeVoice: idea => `Dinâmico e claro, com um tom de revelação sobre como "${idea.title}" afeta nosso dia a dia.`,
        shockingEndingHook: idea => `...e no final, percebemos que a resposta para "${idea.title}" não estava nos livros de história, mas nos objetos que usamos todos os dias.`,
        dossier: idea => `- Ângulo Único: ${idea.angle || 'N/A'}\n- Gatilhos: ${idea.shareTriggers || 'N/A'}`
    }
};




const getGenreFromIdea = (idea) => {
    // A ordem aqui é importante para evitar falsos positivos.
    if (idea.scripturalFoundation) return 'enigmas';
    if (idea.emotionalCore) return 'inspiracional';
    if (idea.coreDilemma) return 'scifi';
    if (idea.horrorMechanism) return 'terror';
    if (idea.investigativeApproach) return 'documentario';
    return 'geral';
};








// =========================================================================
// >>>>> VERSÃO FINAL E INTELIGENTE DA FUNÇÃO 'selectIdea' <<<<<
//       Com aviso de inconsistência de especialista.
// =========================================================================
const selectIdea = async (idea) => { // A função agora é assíncrona para esperar o pop-up
    // --- ETAPA 1: DETECÇÃO E VALIDAÇÃO ---
    // 1a. Qual especialista o USUÁRIO selecionou na interface?
    const selectedGenre = document.querySelector('#genreTabs .tab-button.tab-active')?.dataset.genre || 'geral';
    
    // 1b. Qual especialista nossa ferramenta ACHA que a ideia é?
    const detectedGenre = getGenreFromIdea(idea);

    // 1c. Verificamos se há uma inconsistência.
    if (selectedGenre !== detectedGenre) {
        // Se houver, mostramos o aviso e esperamos a decisão do usuário.
        const userConfirmed = await showConfirmationDialog(
            "Aviso de Inconsistência",
            `Esta ideia parece ser do especialista '${detectedGenre}', mas você selecionou '${selectedGenre}'. Deseja continuar mesmo assim e aplicar as regras de '${selectedGenre}' a esta ideia?`
        );

        // Se o usuário cancelar, interrompemos a operação.
        if (!userConfirmed) {
            window.showToast("Operação cancelada.", 'info');
            return;
        }
    }
    
    // --- Se não houver inconsistência ou o usuário confirmar, o fluxo continua ---
    const genre = selectedGenre; // A fonte da verdade é sempre a escolha do usuário.
    AppState.inputs.selectedGenre = genre;
    const mapper = strategyMapper[genre];

    // --- ETAPA 2: LIMPEZA INICIAL ---
    const fieldsToClear = ['targetAudience', 'narrativeTheme', 'centralQuestion', 'emotionalHook', 'narrativeVoice', 'shockingEndingHook', 'researchData'];
    fieldsToClear.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    // --- ETAPA 3: MAPEAMENTO BÁSICO E HIGIENIZAÇÃO ---
    document.getElementById('videoTheme').value = idea.title || '';
    const cleanedDescription = (idea.videoDescription || '').replace(/\[[\d, ]+\]/g, '');
    document.getElementById('videoDescription').value = cleanedDescription;

    // --- ETAPA 4: PREENCHIMENTO COMPLETO USANDO O MAPPER ---
    if (mapper) {
        // 4a. Lógica de preenchimento dos dropdowns (controlando a ordem)
        if (mapper.dropdowns) {
            if (mapper.dropdowns.narrativeGoal) {
                document.getElementById('narrativeGoal').value = mapper.dropdowns.narrativeGoal;
            }
            updateNarrativeStructureOptions(); // Atualiza a lista de estruturas
            for (const id in mapper.dropdowns) {
                if (id === 'narrativeGoal') continue;
                const element = document.getElementById(id);
                if (element) element.value = mapper.dropdowns[id];
            }
        }
        
        // 4b. Preenche TODOS os campos de texto com as regras do mapper
        for (const key in mapper) {
            if (key === 'dropdowns' || key === 'dossier') continue;
            const element = document.getElementById(key);
            if (element) {
                // Usamos um try-catch aqui para evitar erros caso uma regra tente
                // acessar um campo que não existe no JSON de outro especialista.
                try {
                    const valueToSet = mapper[key](idea);
                    if (valueToSet) {
                        element.value = valueToSet;
                    }
                } catch(e) {
                    console.warn(`Não foi possível mapear o campo '${key}' pois a propriedade não existe na ideia do tipo '${detectedGenre}'. Campo deixado em branco.`);
                }
            }
        }
    }
    
    updateMainTooltip();

    // --- ETAPA 5: FINALIZAÇÃO ---
    window.showToast("Ideia selecionada! Estratégia pré-preenchida.", 'success');
    showPane('strategy');
    document.querySelector('[data-tab="input-tab-estrategia"]')?.click();
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






// ==========================================================
// >>>>> COLE ESTA FUNÇÃO COMPLETA NO LUGAR DA ANTIGA <<<<<
// ==========================================================
const getBasePromptContext = (options = {}) => {
    const { includeHeavyContext = false } = options;
    const lang = document.getElementById('languageSelect').value || "en";

    // Define as etiquetas com base no idioma
    const labels = {
        role: lang === 'pt-br' ? 'Você é um ROTEIRISTA ESPECIALISTA' : 'You are an EXPERT SCREENWRITER',
        channel: lang === 'pt-br' ? 'para o canal' : 'for the channel',
        coreDetails: lang === 'pt-br' ? '**Detalhes Centrais do Projeto:**' : '**Core Project Details:**',
        topic: lang === 'pt-br' ? 'Tópico do Vídeo' : 'Video Topic',
        audience: lang === 'pt-br' ? 'Público-Alvo' : 'Target Audience',
        language: lang === 'pt-br' ? 'Idioma' : 'Language',
        objective: lang === 'pt-br' ? 'Objetivo do Vídeo' : 'Video Objective',
        // <<< NOVA ETIQUETA ADICIONADA AQUI >>>
        duration: lang === 'pt-br' ? 'Duração Alvo do Vídeo' : 'Target Video Duration', 
        narrativeStyle: lang === 'pt-br' ? '**Instruções de Narrativa & Estilo:**' : '**Narrative & Style Instructions:**',
        structure: lang === 'pt-br' ? 'Estrutura Narrativa a usar' : 'Narrative Structure to use',
        goalDefinition: lang === 'pt-br' ? 'Definição do Objetivo' : 'Objective Definition',
        structureDefinition: lang === 'pt-br' ? 'Definição da Estrutura' : 'Structure Definition',
        pace: lang === 'pt-br' ? 'Ritmo da Fala' : 'Speaking Pace',
        langStyle: lang === 'pt-br' ? 'Estilo de Linguagem' : 'Language Style',
        theme: lang === 'pt-br' ? 'Tema Central (A Grande Ideia)' : 'Core Theme (The Big Idea)',
        tone: lang === 'pt-br' ? 'Tom da Narrativa (O Sentimento)' : 'Narrative Tone (The Feeling)',
        voice: lang === 'pt-br' ? 'Voz do Narrador (A Personalidade)' : 'Narrator\'s Voice (The Personality)',
        hook: lang === 'pt-br' ? 'Gancho de Final Chocante a usar' : 'Shocking Ending Hook to use',
        primarySource: lang === 'pt-br' ? '**DOSSIÊ CRÍTICO DA IDEIA (Fonte Primária):**' : '**CRITICAL IDEA DOSSIER (Primary Source):**',
        primarySourceDesc: lang === 'pt-br' ? 'Descrição Original da Ideia' : 'Original Idea Description',
        centralQuestion: lang === 'pt-br' ? '**PERGUNTA CENTRAL CRÍTICA:** Você DEVE usar esta pergunta como o fio condutor de todo o roteiro.' : '**CRITICAL CENTRAL QUESTION:** You MUST use this question as the guiding thread for the entire script.',
        emotionalAnchor: lang === 'pt-br' ? '**ÂNCORA NARRATIVA CRÍTICA:** Você DEVE usar a seguinte história pessoal como núcleo emocional.' : '**CRITICAL NARRATIVE ANCHOR:** You MUST use the following personal story as the emotional core.',
        anchorStory: lang === 'pt-br' ? 'História Âncora' : 'Emotional Anchor Story',
        research: lang === 'pt-br' ? '**DADOS DE PESQUISA CRÍTICOS:** Você DEVE incorporar os seguintes fatos:' : '**CRITICAL RESEARCH DATA:** You MUST incorporate the following facts:',
    };

    // <<< CAMPO ADICIONADO AQUI >>>
    const videoDurationSelect = document.getElementById('videoDuration');
    const videoDurationText = videoDurationSelect.selectedIndex !== -1 ? videoDurationSelect.options[videoDurationSelect.selectedIndex].text : 'Não definido';

    const inputs = {
        channelName: document.getElementById('channelName')?.value.trim() || "",
        videoTheme: document.getElementById('videoTheme')?.value.trim() || "",
        videoDuration: videoDurationText, // Usa o texto visível (ex: "Extra Longo (~13-20 min)")
        targetAudience: document.getElementById('targetAudience')?.value.trim() || "",
        language: lang === 'pt-br' ? 'Português (Brasil)' : 'English',
        videoObjective: document.getElementById('videoObjective')?.value || "",
        speakingPace: document.getElementById('speakingPace')?.value || "",
        languageStyle: document.getElementById('languageStyle')?.value || "",
        narrativeGoal: document.getElementById('narrativeGoal')?.value || "",
        narrativeStructure: document.getElementById('narrativeStructure')?.value || "",
        narrativeTheme: document.getElementById('narrativeTheme')?.value.trim() || "",
        narrativeTone: document.getElementById('narrativeTone')?.value || "",
        narrativeVoice: document.getElementById('narrativeVoice')?.value.trim() || "",
        shockingEndingHook: document.getElementById('shockingEndingHook')?.value.trim() || "",
    };

    let context = `${labels.role} ${labels.channel} "${inputs.channelName}".
${labels.coreDetails}
- ${labels.topic}: "${inputs.videoTheme}"
- ${labels.audience}: "${inputs.targetAudience}"
- ${labels.language}: "${inputs.language}"
- ${labels.objective}: "${inputs.videoObjective}"
- ${labels.duration}: "${inputs.videoDuration}"`; // <<< LINHA DE CONTEXTO ADICIONADA AQUI

    context += `\n${labels.narrativeStyle}`;

    if (inputs.narrativeStructure) {
        const goalSelect = document.getElementById('narrativeGoal');
        const structureSelect = document.getElementById('narrativeStructure');
        const goalText = goalSelect.options[goalSelect.selectedIndex].text;
        const structureText = structureSelect.options[structureSelect.selectedIndex].text;
        const goalDescription = narrativeGoalTooltips[inputs.narrativeGoal]?.description || '';
        const structureDescription = narrativeTooltips[inputs.narrativeStructure] || '';
        context += `
- ${labels.structure}: "${structureText}"`;
        if (goalDescription) context += `
  - ${labels.goalDefinition} ("${goalText}"): "${goalDescription}"`;
        if (structureDescription) context += `
  - ${labels.structureDefinition} ("${structureText}"): "${structureDescription}"`;
    }
    
    context += `
- ${labels.pace}: "${inputs.speakingPace}"
- ${labels.langStyle}: "${inputs.languageStyle}"`;

    if (inputs.narrativeTheme) context += `\n- ${labels.theme}: "${inputs.narrativeTheme}"`;
    if (inputs.narrativeTone) context += `\n- ${labels.tone}: "${inputs.narrativeTone}"`;
    if (inputs.narrativeVoice) context += `\n- ${labels.voice}: "${inputs.narrativeVoice}"`;
    if (inputs.shockingEndingHook) context += `\n- ${labels.hook}: "${inputs.shockingEndingHook}"`;

    if (includeHeavyContext) {
        const heavyInputs = {
            videoDescription: document.getElementById('videoDescription')?.value.trim() || "",
            centralQuestion: document.getElementById('centralQuestion')?.value.trim() || "",
            researchData: document.getElementById('researchData')?.value.trim() || "",
            emotionalHook: document.getElementById('emotionalHook')?.value.trim() || "",
        };

        if (heavyInputs.videoDescription) {
            context += `\n\n${labels.primarySource}\n- ${labels.primarySourceDesc}: "${heavyInputs.videoDescription}"`;
        }
        if (heavyInputs.centralQuestion) {
            context += `\n\n${labels.centralQuestion}\n- "${heavyInputs.centralQuestion}"`;
        }
        if (heavyInputs.emotionalHook) {
            context += `\n\n${labels.emotionalAnchor}\n- ${labels.anchorStory}: "${heavyInputs.emotionalHook}"`;
        }
        if (heavyInputs.researchData) {
            context += `\n\n${labels.research}\n${heavyInputs.researchData}`;
        }
    }
    
    return context;
};









// ==========================================================
// ===== CONSTRUTOR DE PROMPT MESTRE (v9.1 - RESPEITANDO OS TEMPLATES) =====
// ==========================================================
const buildMasterPrompt = () => {
    // >>>>> A CORREÇÃO CRÍTICA ESTÁ AQUI <<<<<
    // A fonte da verdade AGORA é o que salvamos no AppState.
    // Isso garante que o especialista selecionado no Passo 1 seja usado aqui.
    const genre = AppState.inputs.selectedGenre || 'geral';
    
    const durationKey = document.getElementById('videoDuration').value;
    const languageName = document.getElementById('languageSelect').value === 'pt-br' ? 'Português (Brasil)' : 'English';

    // O resto da função permanece o mesmo
    let baseContext = getBasePromptContext({ includeHeavyContext: true });
    baseContext = baseContext.replace(/\[[\d, ]+\]/g, ''); 
    
    const fullContextForAI = `${baseContext}`;
    
    let masterPrompt = PromptManager.getScriptPrompt(genre, durationKey);

    masterPrompt = masterPrompt.replace(/__BASE_CONTEXT__/g, fullContextForAI);
    masterPrompt = masterPrompt.replace(/__LANGUAGE_NAME__/g, languageName);

    // Adiciona um log para depuração final
    console.log(`Construindo prompt para o especialista: ${genre.toUpperCase()}`);

    return masterPrompt;
};






// ==========================================================
// >>>>> VERSÃO FINAL E CORRIGIDA DE 'suggestStrategy' <<<<<
// ==========================================================
const suggestStrategy = async (button) => {
    const theme = document.getElementById('videoTheme')?.value.trim();
    const description = document.getElementById('videoDescription')?.value.trim();
    if (!theme || !description) {
        window.showToast("Preencha o Tema e a Descrição do Vídeo para receber sugestões.", 'info');
        return;
    }
    const userConfirmed = await showConfirmationDialog("Refinar Estratégia com IA?", "Isso usará a IA para redefinir os campos de estratégia. Deseja continuar?");
    if (!userConfirmed) return;
    
    showButtonLoading(button);
    
    const languageName = document.getElementById('languageSelect').value === 'pt-br' ? 'Português (Brasil)' : 'English';
    
    // ==========================================================
    // >>>>> O PROMPT FOI MELHORADO E REFORÇADO AQUI <<<<<
    // ==========================================================
    const prompt = `Você é uma API de Estratégia de Conteúdo Viral. Sua única função é preencher uma estrutura de texto.

**REGRAS CRÍTICAS E INEGOCIÁVEIS:**
1.  **FORMATO "CHAVE:: VALOR":** Você DEVE preencher CADA UMA das 10 chaves abaixo. Use o separador de dois pontos duplos ('::') entre a chave e o valor.
2.  **RESPOSTA PURA:** Sua resposta deve conter APENAS as 10 linhas no formato CHAVE:: VALOR. NÃO inclua introduções, comentários ou qualquer texto fora desta estrutura.
3.  **IDIOMA:** Todos os valores DEVEM estar em **${languageName}**.

### EXEMPLO DE RESPOSTA PERFEITA ###
TARGET_AUDIENCE:: Pessoas interessadas em história e mistérios não resolvidos.
NARRATIVE_GOAL:: storytelling
NARRATIVE_STRUCTURE:: mystery_loop
NARRATIVE_TONE:: serio
CENTRAL_QUESTION:: O que realmente aconteceu com a Arca da Aliança segundo os textos antigos?
NARRATIVE_THEME:: A busca por artefatos sagrados revela mais sobre a fé humana do que sobre os próprios objetos.
NARRATIVE_VOICE:: Investigativo, respeitoso e com um toque de mistério.
EMOTIONAL_HOOK:: A história de um arqueólogo que dedicou sua vida a uma busca que o consumiu, representando a obsessão humana pelo divino.
SHOCKING_ENDING_HOOK:: No final, a maior revelação não foi onde a Arca estava, mas por que ela nunca deveria ser encontrada.
RESEARCH_DATA:: Citar o Livro de Êxodo (capítulo 25) e as teorias do arqueólogo Tudor Parfitt.

### ESTRUTURA A PREENCHER (PREENCHIMENTO DE TODAS AS 10 É OBRIGATÓRIO) ###
TARGET_AUDIENCE::
NARRATIVE_GOAL::
NARRATIVE_STRUCTURE::
NARRATIVE_TONE::
CENTRAL_QUESTION::
NARRATIVE_THEME::
NARRATIVE_VOICE::
EMOTIONAL_HOOK::
SHOCKING_ENDING_HOOK::
RESEARCH_DATA::

**DADOS DE ENTRADA:**
- **Tema do Vídeo:** "${theme}"
- **Descrição:** "${description}"

**AÇÃO FINAL:** Preencha AGORA a estrutura de texto com as 10 chaves. Sua resposta DEVE SEGUIR ESTRITAMENTE o formato CHAVE:: VALOR como no exemplo.`;

    try {
        const strategyResponse = await callGroqAPI(forceLanguageOnPrompt(prompt), 4000);
        
        const strategy = {};
        const lines = strategyResponse.split('\n');
        for (const line of lines) {
            const parts = line.split('::');
            if (parts.length >= 2) { // Alterado para >= 2 para mais flexibilidade
                const key = parts[0].trim();
                const value = parts.slice(1).join('::').trim(); // Junta o resto caso o valor tenha '::'
                strategy[key] = value;
            }
        }

        const keyToElementIdMap = {
            'TARGET_AUDIENCE': 'targetAudience', 'NARRATIVE_THEME': 'narrativeTheme',
            'NARRATIVE_TONE': 'narrativeTone', 'NARRATIVE_VOICE': 'narrativeVoice',
            'CENTRAL_QUESTION': 'centralQuestion', 'EMOTIONAL_HOOK': 'emotionalHook',
            'SHOCKING_ENDING_HOOK': 'shockingEndingHook', 'RESEARCH_DATA': 'researchData',
            'NARRATIVE_GOAL': 'narrativeGoal', 'NARRATIVE_STRUCTURE': 'narrativeStructure'
        };

        const narrativeGoalSelect = document.getElementById('narrativeGoal');
        if (narrativeGoalSelect && strategy.NARRATIVE_GOAL) {
            narrativeGoalSelect.value = strategy.NARRATIVE_GOAL;
            updateNarrativeStructureOptions();
        }

        setTimeout(() => { 
            for (const key in keyToElementIdMap) {
                const element = document.getElementById(keyToElementIdMap[key]);
                if (element) {
                    const valueToSet = strategy[key] || '';
                    if (element.tagName === 'SELECT') {
                        if ([...element.options].some(o => o.value === valueToSet)) {
                            element.value = valueToSet;
                        }
                    } else {
                        element.value = valueToSet;
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










/**
 * NOVA FUNÇÃO AUXILIAR - Focada apenas em re-gerar uma seção
 * @param {HTMLElement} button - O botão que foi clicado.
 * @param {string} sectionKey - A chave da seção (ex: 'intro', 'development').
 * @param {string} sectionTitle - O título para o prompt (ex: 'Introdução').
 */
const regenerateSingleSection = async (button, sectionKey, sectionTitle) => {
    showButtonLoading(button);
    const sectionElement = document.getElementById(`${sectionKey}Section`);
    if (!sectionElement) {
        hideButtonLoading(button);
        return;
    }

    try {
        const baseContext = getBasePromptContext({ includeHeavyContext: true });
        const fullTranscript = getTranscriptOnly(); // Pega todo o roteiro para dar contexto
        
        const prompt = `Você é um EDITOR DE ROTEIRO DE ELITE. Sua tarefa é reescrever uma seção específica de um roteiro existente, mantendo a consistência com o restante da história e seguindo as diretrizes do projeto.

**BRIEFING COMPLETO DO PROJETO:**
---
${baseContext}
---

**ROTEIRO COMPLETO (PARA CONTEXTO DE CONSISTÊNCIA):**
---
${fullTranscript.slice(0, 5000)} 
---

**TAREFA IMEDIATA:**
Reescreva a seção "${sectionTitle}". A nova versão deve ser impactante, alinhada com o briefing e fluir naturalmente com o resto do roteiro.

**REGRAS DE FORMATAÇÃO (INEGOCIÁVEIS):**
1.  **RESPOSTA 100% PURA:** Sua resposta deve conter APENAS e SOMENTE o texto que será dito em voz alta para a seção "${sectionTitle}".
2.  **SEM EXTRAS:** É proibido incluir qualquer anotação, título ou comentário.
3.  **PARÁGRAFOS:** O texto deve ser dividido em parágrafos usando "\\n\\n".

**AÇÃO FINAL:** Escreva AGORA a nova versão para a seção "${sectionTitle}".`;

        const rawResult = await callGroqAPI(forceLanguageOnPrompt(prompt), 4000);
        const newText = removeMetaComments(rawResult);

        const paragraphs = newText.split(/\n\s*\n/).filter(p => p.trim() !== '');
        const newHtml = paragraphs.map((p, index) => `<div id="${sectionKey}-p-${index}">${DOMPurify.sanitize(p)}</div>`).join('');

        // Atualiza o conteúdo na tela e no estado global
        const contentWrapper = sectionElement.querySelector('.generated-content-wrapper');
        contentWrapper.innerHTML = newHtml;

        if (AppState.generated.script[sectionKey]) {
            AppState.generated.script[sectionKey] = { html: newHtml, text: newText };
        }
        
        // Invalida análises antigas
        invalidateAndClearPerformance(sectionElement);
        invalidateAndClearPrompts(sectionElement);
        invalidateAndClearEmotionalMap();
        updateAllReadingTimes();

        window.showToast(`Seção "${sectionTitle}" re-gerada com sucesso!`, 'success');

    } catch (error) {
        window.showToast(`Falha ao re-gerar ${sectionTitle}: ${error.message}`, 'error');
    } finally {
        hideButtonLoading(button);
    }
};


// FUNÇÃO 'regenerateSection' ATUALIZADA E LIMPA
window.regenerateSection = (fullSectionId) => {
    const sectionName = fullSectionId.replace('Section', '');
    const button = document.querySelector(`[data-action='regenerate'][data-section-id='${fullSectionId}']`);
    if (!button) return;

    // A nova lógica de direcionamento, agora muito mais limpa
    switch (sectionName) {
        case 'intro':
            regenerateSingleSection(button, 'intro', 'Introdução');
            break;
        case 'development':
            regenerateSingleSection(button, 'development', 'Desenvolvimento');
            break;
        case 'climax':
            regenerateSingleSection(button, 'climax', 'Clímax');
            break;
        case 'conclusion':
            regenerateSingleSection(button, 'conclusion', 'Conclusão');
            break;
        case 'cta':
            regenerateSingleSection(button, 'cta', 'Call to Action (CTA)');
            break;
        default:
            console.error("Tentativa de re-gerar uma seção desconhecida:", sectionName);
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
        const brokenJsonResponse = await callGroqAPI(forceLanguageOnPrompt(prompt), 2000);
        const perfectJsonText = await fixJsonWithAI(brokenJsonResponse);
        let analysisData = await getRobustJson(brokenJsonResponse);

        if (Array.isArray(analysisData) && analysisData.length > 0) {
            analysisData = analysisData[0];
        }

        if (!analysisData || typeof analysisData.score === 'undefined') throw new Error("A IA retornou uma resposta sem as chaves obrigatórias.");
        
        const formattedData = {
            criterion_name: criterion,
            score: analysisData.score,
            positive_points: analysisData.positive_points,
            improvement_points: []
        };

        if (analysisData.critique && analysisData.critique.toLowerCase() !== "nenhuma crítica significativa." && analysisData.critique.toLowerCase() !== "none.") {
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
    // Adiciona as novas classes de estilo base e de relatório
    sectionDiv.className = 'analysis-card-base analysis-card--report animate-fade-in';
    
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
            <div class="analysis-card__header">
                <i class="fas fa-clipboard-check text-indigo-500"></i>
                <h4>${DOMPurify.sanitize(analysisData.criterion_name)}</h4>
            </div>
            <span class="font-bold text-xl text-indigo-500">${analysisData.score}/10</span>
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





// CÓDIGO ATUALIZADO para analyzeRetentionHooks
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
        const brokenJson = await callGroqAPI(forceLanguageOnPrompt(prompt), 4000);
        const perfectJson = await fixJsonWithAI(brokenJson);
        const hooks = await getRobustJson(brokenJson);

        if (!hooks || !Array.isArray(hooks) || hooks.length === 0) throw new Error("A IA não encontrou ganchos ou retornou um formato inválido.");
        
        let reportHtml = `<div class="space-y-4">`;
        hooks.forEach((hook) => {
            const problematicQuoteEscaped = (hook.hook_phrase || '').replace(/"/g, '\"');
            const rewrittenQuoteEscaped = (hook.rewritten_hook || '').replace(/"/g, '\"');
            const scoreColor = hook.effectiveness_score >= 8 ? 'text-green-500' : hook.effectiveness_score >= 5 ? 'text-yellow-500' : 'text-red-500';
            reportHtml += `
                <div class="analysis-card-base analysis-card--hook animate-fade-in">
                    <p class="text-base italic text-gray-500 dark:text-gray-400 mb-2">
                        <i class="fas fa-quote-left text-purple-500 mr-2"></i>
                        Original: "${DOMPurify.sanitize(hook.hook_phrase)}"
                    </p>
                    <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                        <span class="tag !bg-purple-100 !text-purple-700 dark:!bg-purple-900/50 dark:!text-purple-300"><i class="fas fa-anchor mr-2"></i> ${DOMPurify.sanitize(hook.hook_type)}</span>
                        <span class="font-bold ${scoreColor}">Eficácia Original: ${DOMPurify.sanitize(String(hook.effectiveness_score))}/10</span>
                    </div>
                    <p class="text-sm mt-3 text-gray-600 dark:text-gray-400"><strong class="text-purple-500">Justificativa da Melhoria:</strong> ${DOMPurify.sanitize(hook.justification)}</p>
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




// CÓDIGO ATUALIZADO para suggestViralElements
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
    const prompt = `Você é uma API ESPECIALISTA EM ESTRATÉGIA DE CONTEÚDO VIRAL. Sua tarefa é analisar um roteiro e seu contexto para propor 3 elementos que aumentem a viralidade, retornando um array JSON perfeito.

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
3.  **ASPAS DUPLAS, SEMPRE:** Todas as chaves e valores de texto DEVEM usar aspas duplas ("").
4.  **CARACTERES DE ESCAPE (A REGRA MAIS IMPORTANTE):** Se o texto de "anchor_paragraph" ou "suggested_text" contiver aspas duplas ("), você DEVE escapá-las com uma barra invertida (\\"). Exemplo: "Ele disse: \\"Olá\\"."

**MANUAL DE ANÁLISE E CRIAÇÃO:**
- "anchor_paragraph": Cópia EXATA de um parágrafo existente no roteiro.
- "suggested_text": Um parágrafo completo e coeso para ser inserido APÓS o parágrafo âncora.
- "element_type": Escolha de: ["Dado Surpreendente", "Citação de Autoridade", "Mini-Revelação (Teaser)", "Pergunta Compartilhável", "Anedota Pessoal Rápida"].
- "potential_impact_score": Nota de 1 a 10 para o potencial de engajamento.
- "implementation_idea": Explique o VALOR ESTRATÉGICO da inserção.

**EXEMPLO DE FORMATO PERFEITO (SIGA-O RIGOROSAMENTE):**
[
  {
    "anchor_paragraph": "No final, a descoberta foi mais do que apenas um fato histórico; era um símbolo de esperança.",
    "suggested_text": "Para entender a dimensão disso, considere este dado chocante: segundo um estudo da Universidade de Oxford, mais de 70% das pessoas sentem que perderam a esperança no futuro. Esta descoberta veio para desafiar essa estatística de frente.",
    "element_type": "Dado Surpreendente",
    "potential_impact_score": 9,
    "implementation_idea": "Introduzir um dado estatístico forte conecta a narrativa a um sentimento real e contemporâneo do público, aumentando drasticamente a relevância e o potencial de compartilhamento."
  }
]

**AÇÃO FINAL:** Analise o roteiro e o contexto. Responda APENAS com o array JSON perfeito, seguindo TODAS as regras, especialmente a de escapar aspas duplas.`;
    try {
        const brokenJson = await callGroqAPI(prompt, 4000);
        const perfectJson = await fixJsonWithAI(brokenJson);
        const suggestions = await getRobustJson(brokenJson);
        
        if (!suggestions || !Array.isArray(suggestions) || suggestions.length === 0) throw new Error("A IA não encontrou oportunidades ou retornou um formato inválido.");
        
        let reportHtml = `<div class="space-y-4">`;
        suggestions.forEach(suggestion => {
            const anchorParagraphEscaped = (suggestion.anchor_paragraph || '').replace(/"/g, '\"');
            const suggestedTextEscaped = (suggestion.suggested_text || '').replace(/"/g, '\"');
            const score = suggestion.potential_impact_score || 0;
            const scoreColor = score >= 8 ? 'text-green-500' : score >= 5 ? 'text-yellow-500' : 'text-red-500';
            reportHtml += `
                <div class="analysis-card-base analysis-card--viral animate-fade-in">
                    <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm mb-2">
                        <span class="tag !bg-blue-100 !text-blue-700 dark:!bg-blue-900/50 dark:!text-blue-300"><i class="fas fa-lightbulb mr-2"></i> ${DOMPurify.sanitize(suggestion.element_type)}</span>
                        <span class="font-bold ${scoreColor}">Impacto Potencial: ${DOMPurify.sanitize(String(score))}/10</span>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-1"><strong class="text-blue-500"><i class="fas fa-map-marker-alt mr-2"></i>Local Sugerido:</strong> Após o parágrafo que contém "${DOMPurify.sanitize((suggestion.anchor_paragraph || '').substring(0, 70))}..."</p>
                    <p class="text-sm mt-3 text-gray-600 dark:text-gray-400"><strong class="text-blue-500">Ideia de Implementação:</strong> ${DOMPurify.sanitize(suggestion.implementation_idea)}</p>
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
        const baseContext = getBasePromptContext();
        const prompt = `${baseContext}
**TAREFA:** Gerar 5 sugestões de títulos e thumbnails.
**REGRAS:**
1. **FORMATO:** Responda APENAS com um array JSON.
2. **ESTRUTURA:** Cada objeto no array deve ter 3 chaves: "suggested_title", "thumbnail_title", e "thumbnail_description".
3. **SINTAXE:** Use aspas duplas ("") para todas as chaves e valores.`;

        const brokenJson = await callGroqAPI(forceLanguageOnPrompt(prompt), 2000);
        const parsedContent = await getRobustJson(brokenJson);
        
        if (!Array.isArray(parsedContent) || parsedContent.length === 0 || !parsedContent[0].suggested_title) {
            throw new Error("A IA retornou os dados de títulos em um formato inesperado.");
        }
        const titles = parsedContent.map(item => item.suggested_title);
        const thumbnails = parsedContent.map(item => ({ title: item.thumbnail_title, description: item.thumbnail_description }));
        AppState.generated.titlesAndThumbnails = { titles, thumbnails };

        const titlesListHtml = titles.map((title, index) => `<p>${index + 1}. ${DOMPurify.sanitize(title)}</p>`).join('');
        const thumbnailsListHtml = thumbnails.map((thumb) => `<div class="thumbnail-idea"><h4 class="font-semibold">"${DOMPurify.sanitize(thumb.title)}"</h4><p>Descrição: ${DOMPurify.sanitize(thumb.description)}</p></div>`).join('');

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
        const brokenJson = await callGroqAPI(forceLanguageOnPrompt(prompt), 3000);
        const perfectJson = await fixJsonWithAI(brokenJson);
        const analysis = await getRobustJson(brokenJson);

        if (!analysis || !Array.isArray(analysis)) throw new Error("A IA não retornou uma análise de títulos válida.");

        let analysisHtml = '<div class="space-y-4">';
        analysis.forEach(item => {
            // ==========================================================
            // >>>>> A BLINDAGEM FINAL ESTÁ AQUI <<<<<
            // Procuramos por variações comuns das chaves que a IA pode usar.
            // ==========================================================
            const title = item.titulo_original || item.title || item.original_title || "Título não encontrado";
            const score = item.nota_ctr || item.ctr_score || item.score || "N/A";
            const suggestion = item.sugestao_melhora || item.suggestion || item.improvement_suggestion || "Sugestão não encontrada";

            analysisHtml += `
                <div class="p-3 rounded-md" style="background: var(--bg);">
                    <p class="font-semibold">${DOMPurify.sanitize(title)}</p>
                    <p class="mt-1"><strong>Nota de CTR:</strong> <span style="color: var(--primary); font-weight: 700;">${DOMPurify.sanitize(String(score))} / 10</span></p>
                    <p class="mt-1"><strong>Sugestão:</strong> ${DOMPurify.sanitize(suggestion)}</p>
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
        const brokenJson = await callGroqAPI(forceLanguageOnPrompt(prompt), 2500);
        const perfectJson = await fixJsonWithAI(brokenJson);
        const analysis = await getRobustJson(brokenJson);

        if (!analysis || !Array.isArray(analysis)) throw new Error("A IA não retornou uma análise de thumbnails válida.");

        let analysisHtml = '<div class="space-y-4">';
        analysis.forEach(item => {
            // A MESMA BLINDAGEM APLICADA AQUI
            const title = item.titulo || item.title || "Ideia Sem Título";
            const score = item.nota_visual || item.visual_score || item.score || "N/A";
            const suggestion = item.sugestao_melhora || item.suggestion || item.improvement_suggestion || "Sugestão não encontrada";

            analysisHtml += `
                <div class="p-3 rounded-md" style="background: var(--bg);">
                    <p class="font-semibold">"${DOMPurify.sanitize(title)}"</p>
                    <p class="mt-1"><strong>Nota Visual:</strong> <span style="color: var(--primary); font-weight: 700;">${DOMPurify.sanitize(String(score))} / 10</span></p>
                    <p class="mt-1"><strong>Sugestão:</strong> ${DOMPurify.sanitize(suggestion)}</p>
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
        const baseContext = getBasePromptContext();
        const languageName = new Intl.DisplayNames([document.getElementById('languageSelect').value], { type: 'language' }).of(document.getElementById('languageSelect').value);
        const prompt = `${baseContext}
**TAREFA:** Gerar uma descrição otimizada para um vídeo do YouTube e uma lista de hashtags relevantes, no idioma ${languageName}.

**REGRAS CRÍTICAS DE SINTAXE E ESTRUTURA JSON (INEGOCIÁVEIS):**
1.  **JSON PURO:** Sua resposta deve ser APENAS um objeto JSON válido.
2.  **ESTRUTURA EXATA:** O objeto DEVE conter EXATAMENTE estas duas chaves: "description_text" e "hashtags".
3.  **VALORES:**
    - "description_text": (String) Um parágrafo único e coeso. Comece com um gancho, detalhe o conteúdo e finalize com um call-to-action sutil.
    - "hashtags": (Array de Strings) Uma lista com 10 hashtags relevantes, cada uma começando com #.

**AÇÃO FINAL:** Gere o objeto JSON perfeito.`;
        
        const brokenJson = await callGroqAPI(forceLanguageOnPrompt(prompt), 2000);
        let parsedContent = await getRobustJson(brokenJson);

        if (Array.isArray(parsedContent) && parsedContent.length > 0) {
            parsedContent = parsedContent[0];
        }

        if (!parsedContent || !parsedContent.description_text || !Array.isArray(parsedContent.hashtags)) {
            throw new Error("A IA não retornou a descrição e hashtags no formato esperado.");
        }
        
        AppState.generated.description = parsedContent;
        
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
        // ARQUITETURA DE DUPLA PASSAGEM APLICADA AQUI
        const brokenJson = await callGroqAPI(forceLanguageOnPrompt(prompt), 1500);
        const perfectJson = await fixJsonWithAI(brokenJson);
        const analysis = await getRobustJson(brokenJson);

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






// VERSÃO FINAL E INTELIGENTE de mapEmotionsAndPacing
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

        const brokenJson = await callGroqAPI(forceLanguageOnPrompt(prompt), 8000);
        const perfectJson = await fixJsonWithAI(brokenJson);
        const emotionalMapData = await getRobustJson(brokenJson);

        if (!emotionalMapData || !Array.isArray(emotionalMapData) || emotionalMapData.length === 0) {
            throw new Error("A IA não retornou um mapa emocional válido.");
        }

        if(emotionalMapData.length < paragraphs.length) {
            console.warn(`Discrepância no Mapa Emocional: Esperado ${paragraphs.length}, Recebido ${emotionalMapData.length}. Usando dados parciais.`);
        }
        AppState.generated.emotionalMap = emotionalMapData.slice(0, paragraphs.length);
        
        outputContainer.innerHTML = '';
        let paragraphCounter = 0;

        const sectionOrder = [
            { id: 'intro', title: 'Introdução' }, { id: 'development', title: 'Desenvolvimento' },
            { id: 'climax', title: 'Clímax' }, { id: 'conclusion', title: 'Conclusão' },
            { id: 'cta', title: 'Call to Action (CTA)' }
        ];

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
            return value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Indefinido';
        };

        sectionOrder.forEach(section => {
            const sectionScript = script[section.id];
            if (!sectionScript || !sectionScript.text) return;

            const numParagraphs = sectionScript.text.split('\n\n').filter(p => p.trim() !== '').length;
            const sectionEmotionsData = AppState.generated.emotionalMap.slice(paragraphCounter, paragraphCounter + numParagraphs);
            
            // >>>>> A LÓGICA INTELIGENTE ESTÁ AQUI <<<<<
            // 1. Coleta TODOS os grupos de emoção e ritmo da seção
            const allEmotions = sectionEmotionsData.map(e => e ? getGroupName(e.emotion, emotionGroups) : 'Indefinido');
            const allPaces = sectionEmotionsData.map(e => e ? getGroupName(e.pace, paceGroups) : 'Indefinido');

            // 2. Usa nossa nova função para encontrar o DOMINANTE de cada um
            const dominantEmotion = getDominantValue(allEmotions);
            const dominantPace = getDominantValue(allPaces);

            // 3. Cria as tags baseadas apenas nos valores dominantes
            const tagsHtml = `
                <span class="tag"><i class="fas fa-theater-masks mr-2"></i>${dominantEmotion}</span>
                <span class="tag tag-pace"><i class="fas fa-tachometer-alt mr-2"></i>${dominantPace}</span>
            `;

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
                    ${tagsHtml}
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






// =========================================================================
// >>>>> FUNÇÃO analyzeSectionRetention (VERSÃO BLINDADA COM ID) <<<<<
// =========================================================================
window.analyzeSectionRetention = async (button) => {
    const sectionId = button.dataset.sectionId;
    const sectionElement = document.getElementById(sectionId);
    const contentWrapper = sectionElement?.querySelector('.generated-content-wrapper');
    if (!contentWrapper || !contentWrapper.textContent.trim()) {
        window.showToast("Gere o roteiro desta seção antes de analisar a retenção.", 'info');
        return;
    }

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

        const batches = [];
        const BATCH_SIZE = 7;
        for (let i = 0; i < paragraphsWithIndexes.length; i += BATCH_SIZE) {
            batches.push(paragraphsWithIndexes.slice(i, i + BATCH_SIZE));
        }
        
        let fullAnalysis = [];
        const basePromptContext = getBasePromptContext();

        for (let i = 0; i < batches.length; i++) {


            if (i > 0) {
             await new Promise(resolve => setTimeout(resolve, 5000)); // Pausa de 5 segundos
            }

            const batch = batches[i];
            const progressMessage = document.createElement('p');
            progressMessage.className = 'text-sm text-center my-2';
            progressMessage.innerHTML = `<div class="loading-spinner-small inline-block mr-2"></div> Processando lote de análise ${i + 1} de ${batches.length}...`;
            outputContainer.innerHTML = '';
            outputContainer.appendChild(progressMessage);
            
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
            **DADOS PARA ANÁLISE (ESTE LOTE):**
            ${JSON.stringify(batch, null, 2)}
            **AÇÃO:** Analise CADA parágrafo do lote. Retorne APENAS o array JSON perfeito.`;

            const brokenJson = await callGroqAPI(forceLanguageOnPrompt(prompt), 4000);
            const batchAnalysis = await getRobustJson(brokenJson);

            if (Array.isArray(batchAnalysis)) {
                fullAnalysis = fullAnalysis.concat(batchAnalysis);
            } else {
                 console.warn(`Lote ${i+1} da análise de retenção retornou um formato inválido e foi ignorado.`);
            }
        }
        
        if (!fullAnalysis || fullAnalysis.length === 0) {
            throw new Error("A análise da IA falhou em todos os lotes ou retornou um formato inválido.");
        }
        
        outputContainer.innerHTML = ''; 
        
        paragraphs.forEach(p => {
            p.className = 'retention-paragraph-live';
            p.innerHTML = p.innerHTML.replace(/<div class="retention-tooltip">.*?<\/div>/g, '');
        });

        // LÓGICA PARA CRIAR IDs ÚNICOS PARA CADA GRUPO
        const suggestionToIdMap = new Map();
        let nextGroupId = 0;

        fullAnalysis.forEach((item) => {
            if (typeof item.paragraphIndex !== 'number' || item.paragraphIndex >= paragraphs.length) return;
            const p = paragraphs[item.paragraphIndex];
            if (p) {
                p.classList.add(`retention-${item.retentionScore}`);
                
                // AQUI ESTÁ A MÁGICA: Atribuindo o ID do grupo
                if (item.suggestion && (item.retentionScore === 'yellow' || item.retentionScore === 'red')) {
                    if (!suggestionToIdMap.has(item.suggestion)) {
                        suggestionToIdMap.set(item.suggestion, `retention-group-${nextGroupId++}`);
                    }
                    const groupId = suggestionToIdMap.get(item.suggestion);
                    p.dataset.suggestionGroupId = groupId;

                    const scoreLabels = { yellow: "PONTO DE ATENÇÃO", red: "PONTO DE RISCO" };
                    const tooltipTitle = scoreLabels[item.retentionScore] || 'ANÁLISE';
                    const suggestionTextEscaped = (item.suggestion || '').replace(/"/g, '&quot;');
                    
                    const buttonsHtml = `
                        <div class="flex gap-2 mt-3">
                            <button class="flex-1 btn btn-primary btn-small py-1" data-action="optimizeGroup" data-suggestion-group-id="${groupId}" data-suggestion-text="${suggestionTextEscaped}"><i class="fas fa-magic mr-2"></i> Otimizar</button>
                            <button class="flex-1 btn btn-danger btn-small py-1" data-action="deleteParagraphGroup" data-suggestion-text="${suggestionTextEscaped}"><i class="fas fa-trash-alt mr-2"></i> Deletar</button>
                        </div>`;
                    
                    const tooltipElement = document.createElement('div');
                    tooltipElement.className = 'retention-tooltip';
                    tooltipElement.innerHTML = `<strong>${tooltipTitle}:</strong> ${DOMPurify.sanitize(item.suggestion)}${buttonsHtml}`;
                    p.appendChild(tooltipElement);

                    let hideTimer;
                    const showTooltip = () => { clearTimeout(hideTimer); tooltipElement.style.opacity = '1'; tooltipElement.style.visibility = 'visible'; tooltipElement.style.transform = 'translateY(-5px)'; tooltipElement.style.pointerEvents = 'auto'; };
                    const startHideTimer = () => { hideTimer = setTimeout(() => { tooltipElement.style.opacity = '0'; tooltipElement.style.visibility = 'hidden'; tooltipElement.style.transform = 'translateY(0)'; tooltipElement.style.pointerEvents = 'none'; }, 200); };
                    p.addEventListener('mouseenter', showTooltip); p.addEventListener('mouseleave', startHideTimer);
                    tooltipElement.addEventListener('mouseenter', showTooltip); tooltipElement.addEventListener('mouseleave', startHideTimer);
                }
                 p.addEventListener('mouseover', handleSuggestionMouseOver);
                 p.addEventListener('mouseout', handleSuggestionMouseOut);
            }
        });

        window.showToast("Análise de retenção concluída com sucesso!", 'success');

    } catch (error) {
        console.error("Erro detalhado em analyzeSectionRetention:", error);
        window.showToast(`Falha na análise: ${error.message}`, 'error');
        outputContainer.innerHTML = `<p class="text-sm text-red-500">${error.message}</p>`;
    } finally {
        hideButtonLoading(button);
    }
};








// SUBSTITUA A FUNÇÃO INTEIRA NO SEU script.js
const handleSuggestionMouseOver = (event) => {
    const targetParagraph = event.currentTarget;
    const suggestionGroupText = targetParagraph.dataset.suggestionGroup;
    if (!suggestionGroupText) return;

    const contentWrapper = targetParagraph.closest('.generated-content-wrapper');
    if (!contentWrapper) return;

    // Esta é a forma mais segura de encontrar todos os elementos
    // que compartilham o mesmo texto de sugestão no atributo data.
    const allParagraphsWithSuggestion = contentWrapper.querySelectorAll('[data-suggestion-group]');
    
    allParagraphsWithSuggestion.forEach(p => {
        if (p.dataset.suggestionGroup === suggestionGroupText) {
            p.classList.add('highlight-group');
        }
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
        // ====================================================================
        // >>>>> MUDANÇA 1: O PROMPT FOI SIMPLIFICADO <<<<<
        // Agora pedimos uma lista de texto simples, que é muito mais confiável.
        // ====================================================================
        const suggestionPrompt = `Você é um ESTRATEGISTA NARRATIVO. Analise o final do roteiro abaixo e sugira 3 temas distintos e coerentes para o PRÓXIMO capítulo.

**ROTEIRO ATUAL (PARA ANÁLISE):**
---
${existingText.slice(-1500)} 
---

**REGRAS DE FORMATAÇÃO (INEGOCIÁVEIS):**
1.  Sua resposta deve ser APENAS uma lista numerada com 3 itens (1., 2., 3.).
2.  Cada item deve ser um tema curto e impactante.
3.  NÃO adicione nenhum texto introdutório, título ou comentário.

**EXEMPLO DE RESPOSTA PERFEITA:**
1. A Batalha dos Números
2. O Legado Fora de Campo
3. Momentos Decisivos

**AÇÃO FINAL:** Gere a lista numerada com 3 temas.`;
        
        const suggestionsResponse = await callGroqAPI(forceLanguageOnPrompt(suggestionPrompt), 1000);

        // =====================================================================
        // >>>>> MUDANÇA 2: REMOVEMOS O 'getRobustJson' DAQUI <<<<<
        // E adicionamos uma lógica inteligente para ler a lista de texto.
        // =====================================================================
        const chapterSuggestions = suggestionsResponse
            .split('\n') // Divide a resposta em linhas
            .map(line => line.replace(/^\d+\.\s*/, '').trim()) // Remove números como "1. " e espaços
            .filter(line => line.length > 0); // Remove linhas vazias

        if (chapterSuggestions.length === 0) {
            throw new Error("A IA não retornou sugestões de capítulo válidas.");
        }
        
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

        // O resto da função continua exatamente igual, pois a segunda chamada à IA
        // já esperava texto e não JSON.
        const basePrompt = getBasePromptContext({ includeHeavyContext: true });
        const continuationPrompt = `${basePrompt}

**IDENTIDADE E ESPECIALIZAÇÃO (A REGRA MAIS IMPORTANTE):**
Você é um ROTEIRISTA CONTINUÍSTA DE ELITE. Sua única função é escrever o PRÓXIMO capítulo de um roteiro existente, com foco absoluto em **NOVIDADE** e **PROGRESSÃO NARRATIVA**.

**INFORMAÇÃO CRÍTICA PARA O ROTEIRISTA:**
O texto abaixo representa tudo o que o espectador JÁ ASSISTIU E JÁ SABE. É **TERMINANTEMENTE PROIBIDO** repetir, resumir ou parafrasear qualquer conceito ou evento já mencionado. Repetir informações quebra a imersão e será considerado uma falha grave na sua tarefa.

**ROTEIRO ESCRITO ATÉ AGORA (CONHECIMENTO JÁ ADQUIRIDO PELO PÚBLICO):**
---
${existingText.slice(-3000)}
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
        
        const rawResult = await callGroqAPI(forceLanguageOnPrompt(continuationPrompt), 4000);
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

        if (AppState.generated.script.development) {
            AppState.generated.script.development.text = contentWrapper.textContent;
            AppState.generated.script.development.html = contentWrapper.innerHTML;
        }
        
        invalidateAndClearPerformance(devSection);
        invalidateAndClearPrompts(devSection);
        invalidateAndClearEmotionalMap();
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






// script.js (Adicionar na seção de utilitários)

const getDominantValue = (arr, defaultValue = 'Indefinido') => {
    if (!arr || arr.length === 0) return defaultValue;
    const counts = arr.reduce((acc, value) => {
        acc[value] = (acc[value] || 0) + 1;
        return acc;
    }, {});
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
};






// =========================================================================
// >>>>> FIM DA VERSÃO BLINDADA DE 'addDevelopmentChapter' <<<<<
// =========================================================================

// VERSÃO DEFINITIVA de suggestPerformance (Resiliente e com Idioma Correto)
// SUBSTITUA A SUA FUNÇÃO window.suggestPerformance INTEIRA POR ESTA VERSÃO FINAL

// SUBSTITUA A SUA FUNÇÃO window.suggestPerformance INTEIRA POR ESTA VERSÃO FINAL

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
        
        const originalParagraphs = Array.from(tempDiv.querySelectorAll('div[id]')).map((p, index) => ({ index, text: p.textContent.trim() }));
        if (originalParagraphs.length === 0) throw new Error("Não foram encontrados parágrafos estruturados para análise.");

        const languageName = document.getElementById('languageSelect').value === 'pt-br' ? 'Português (Brasil)' : 'English';

        const prompt = `Você é um DIRETOR DE VOZ E PERFORMANCE de elite. Sua única função é ANOTAR um roteiro com instruções de narração claras e impactantes, retornando um array JSON.

**IDIOMA OBRIGATÓRIO:** Todas as anotações geradas (como "[Pausa dramática]") DEVEM estar em ${languageName}. Esta é a regra mais importante.

**ROTEIRO PARA ANÁLISE:**
${originalParagraphs.map(p => `Parágrafo ${p.index}: "${p.text}"`).join('\n\n')}

**MANUAL DE ANOTAÇÃO (REGRAS CRÍTICAS):**
1.  **Para "general_annotation":**
    *   A anotação DEVE ser uma instrução curta para o narrador (ex: "[Tom mais sério e grave]", "[Pausa dramática]", "[Falar com urgência]").
    *   Se nenhuma instrução for necessária, deixe a string VAZIA ("").
2.  **Para "emphasis_words":**
    *   Identifique a ÚNICA palavra ou pequena frase (1-3 palavras) que deve receber mais ênfase.
    *   Se nenhuma ênfase for necessária, deixe o array VAZIO ([]).

**REGRAS DE SINTAXE JSON (INEGOCIÁVEIS):**
1.  Sua resposta deve ser APENAS o array JSON, contendo um objeto para CADA parágrafo enviado.
2.  Cada objeto DEVE ter DUAS chaves: "general_annotation" (string) e "emphasis_words" (array de strings).
3.  Use aspas duplas ("") para todas as chaves e valores.

**AÇÃO FINAL:** Analise CADA parágrafo e retorne o array JSON completo com suas anotações de DIRETOR no idioma correto.`;
        
        const brokenJsonResponse = await callGroqAPI(forceLanguageOnPrompt(prompt), 8000);
        const annotations = await getRobustJson(brokenJsonResponse);
        
        if (!Array.isArray(annotations)) { 
            throw new Error("A IA não retornou um array de anotações válido.");
        }
        if (annotations.length < originalParagraphs.length) {
            console.warn(`Discrepância na performance: ${originalParagraphs.length} parágrafos enviados, ${annotations.length} anotações recebidas. O restante será ignorado.`);
        }
        
        let annotatedParagraphs = [];
        originalParagraphs.forEach((p, index) => {
            const annotationData = annotations[index] || { general_annotation: '', emphasis_words: [] };
            let annotatedParagraph = p.text;

            if (annotationData.emphasis_words && annotationData.emphasis_words.length > 0) {
                const word = annotationData.emphasis_words[0];
                if (word && typeof word === 'string' && word.trim() !== '') {
                    const escapedWord = word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                    const wordRegex = new RegExp(`\\b(${escapedWord})\\b`, 'gi');
                    annotatedParagraph = annotatedParagraph.replace(wordRegex, `[ênfase em '$1'] $1`);
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










// VERSÃO FINAL DE SEGURANÇA MÁXIMA

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
    promptContainer.innerHTML = `<div class="loading-spinner-small mx-auto my-4"></div> <p class="text-center text-sm">Preparando lotes de texto seguros...</p>`;

    try {
        const fullText = contentWrapper.textContent.trim();
        const visualPacing = document.getElementById('visualPacing').value;
        const durationRange = { 'dinamico': '3 a 8', 'normal': '8 a 15', 'contemplativo': '15 a 25' }[visualPacing] || '8 a 15';

        // --- LÓGICA DE LOTE FIXO E SEGURO ---
        // Este valor é baixo o suficiente para garantir que o prompt + roteiro nunca estourem o limite.
        const MAX_CHARS_PER_BATCH = 700; 

        const batches = [];
        let remainingText = fullText;
        while (remainingText.length > 0) {
            let chunk = remainingText.substring(0, MAX_CHARS_PER_BATCH);
            remainingText = remainingText.substring(MAX_CHARS_PER_BATCH);
            if (remainingText.length > 0) {
                const lastSpace = chunk.lastIndexOf(' ');
                if (lastSpace !== -1) {
                    remainingText = chunk.substring(lastSpace + 1) + remainingText;
                    chunk = chunk.substring(0, lastSpace);
                }
            }
            batches.push(chunk);
        }
        
        console.log(`Roteiro dividido em ${batches.length} lotes de segurança.`);
        
        let allGeneratedPrompts = [];
        
        for (let i = 0; i < batches.length; i++) {
            // Pausa de 5 segundos para garantir que não haja Rate Limit
            if (i > 0) {
                await new Promise(resolve => setTimeout(resolve, 5000)); 
            }

            const batchText = batches[i];
            promptContainer.innerHTML = `<div class="loading-spinner-small mx-auto my-4"></div> <p class="text-center text-sm">Processando lote ${i + 1} de ${batches.length}...</p>`;
            
            const prompt = PromptManager.getImageStoryboardPrompt(batchText, durationRange);
            
            // O Worker usará o max_tokens de 4096, que é mais que suficiente para estes lotes pequenos
            const rawResponseText = await callGroqAPI(prompt); 
            const batchResult = await getRobustJson(rawResponseText);
            
            if (Array.isArray(batchResult)) {
                allGeneratedPrompts = allGeneratedPrompts.concat(batchResult);
            } else {
                console.warn(`Lote ${i + 1} retornou formato inválido.`);
            }
        }

        if (allGeneratedPrompts.length === 0) throw new Error("A IA não conseguiu gerar prompts válidos.");
        
        const curatedPrompts = allGeneratedPrompts.filter(p => p && p.original_phrase && p.imageDescription).map(p => ({ scriptPhrase: p.original_phrase, imageDescription: p.imageDescription, estimated_duration: p.estimated_duration || 5 }));
        
        if (curatedPrompts.length === 0) throw new Error("A IA retornou respostas sem o formato correto.");
        
        const defaultStyleKey = 'cinematic';
        AppState.generated.imagePrompts[sectionId] = curatedPrompts.map(p => ({ ...p, selectedStyle: defaultStyleKey }));
        AppState.ui.promptPaginationState[sectionId] = 0;
        promptContainer.innerHTML = `<div class="prompt-pagination-wrapper space-y-4"><div class="prompt-nav-container flex items-center justify-center gap-4"></div><div class="prompt-items-container space-y-4"></div></div>`;
        renderPaginatedPrompts(sectionId);

    } catch (error) {
        console.error("Erro na geração de prompts:", error);
        promptContainer.innerHTML = `<p class="text-sm text-danger">${error.message}</p>`;
    } finally {
        hideButtonLoading(button);
    }
};




// =========================================================================
// >>>>> COLE ESTA FUNÇÃO COMPLETA NO LUGAR DA ANTIGA <<<<<
// =========================================================================
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
    
    let cumulativeSeconds = 0;
    let globalSceneCounter = 1;
    const sectionOrder = ['introSection', 'developmentSection', 'climaxSection', 'conclusionSection', 'ctaSection'];
    const currentSectionIndex = sectionOrder.indexOf(sectionElementId);

    for (let i = 0; i < currentSectionIndex; i++) {
        const previousSectionId = sectionOrder[i];
        const prevPrompts = AppState.generated.imagePrompts[previousSectionId] || [];
        
        prevPrompts.forEach(p => {
            cumulativeSeconds += parseInt(p.estimated_duration, 10) || 0;
        });
        globalSceneCounter += prevPrompts.length;
    }
    
    const startIndex = currentPage * itemsPerPage;
    prompts.slice(0, startIndex).forEach(p => { cumulativeSeconds += parseInt(p.estimated_duration, 10) || 0; });
    globalSceneCounter += startIndex;

    const promptsToShow = prompts.slice(startIndex, startIndex + itemsPerPage);
    
    promptsToShow.forEach((promptData, index) => {
        const sceneNumber = globalSceneCounter + index;
        const minutes = Math.floor(cumulativeSeconds / 60);
        const seconds = cumulativeSeconds % 60;
        const timestamp = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        const sanitizedDescription = DOMPurify.sanitize(promptData.imageDescription);

        let styleOptionsHtml = '';
        for (const key in imageStyleLibrary) {
            const isSelected = key === promptData.selectedStyle ? 'selected' : '';
            styleOptionsHtml += `<option value="${key}" ${isSelected}>${imageStyleLibrary[key].name}</option>`;
        }
        
        // >>>>> AQUI ESTÁ A CORREÇÃO <<<<<
        // A linha que limitava a 100 caracteres foi removida.
        // Agora, usamos a 'scriptPhrase' completa.
        const fullScriptPhraseHtml = `<p class="paragraph-preview" style="font-size: 0.85rem; font-style: italic; color: var(--text-muted); margin-bottom: 0.5rem;">"${DOMPurify.sanitize(promptData.scriptPhrase)}"</p>`;
        
        const promptHtml = `
            <div class="card !p-3 animate-fade-in" style="background: var(--bg);">
                <div class="prompt-header" style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                    <span class="tag tag-scene"><i class="fas fa-film mr-2"></i>Cena ${String(sceneNumber).padStart(2, '0')}</span>
                    <span class="tag tag-time"><i class="fas fa-clock mr-2"></i>${timestamp}</span>
                    <button class="btn btn-ghost btn-small ml-auto" 
                            onclick="window.copyPromptWithStyle(${sceneNumber}, \`${sanitizedDescription.replace(/`/g, '\\`')}\`)" 
                            title="Copiar Prompt Completo com Estilo">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
                ${fullScriptPhraseHtml}
                <p>${sanitizedDescription}</p>
                <div class="mt-3">
                    <select id="style-select-${sceneNumber}" class="input input-small w-full">
                        ${styleOptionsHtml}
                    </select>
                </div>
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




// =========================================================================
// >>>>> FUNÇÃO optimizeGroup (VERSÃO BLINDADA COM ID) <<<<<
// =========================================================================
window.optimizeGroup = async (button) => {
    // A GRANDE MUDANÇA: Usamos o ID do grupo, não mais o texto.
    const groupId = button.dataset.suggestionGroupId;
    const suggestionText = button.dataset.suggestionText; // Ainda precisamos do texto para a IA.
    
    if (!button || !suggestionText || !groupId) return;

    // A busca agora é pelo ID, que é 100% confiável.
    const paragraphsToOptimize = document.querySelectorAll(`[data-suggestion-group-id="${groupId}"]`);

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
        firstParagraph.className = 'retention-paragraph-live highlight-change'; // Limpa classes antigas
        firstParagraph.removeAttribute('data-suggestion-group-id');
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
            updateAllReadingTimes();
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




window.copyPromptWithStyle = (sceneNumber, imageDescription) => {
    const styleSelect = document.getElementById(`style-select-${sceneNumber}`);
    if (!styleSelect) {
        window.showToast('Erro: Seletor de estilo não encontrado.', 'error');
        return;
    }
    
    const selectedStyleKey = styleSelect.value;
    const styleBlock = imageStyleLibrary[selectedStyleKey]?.block || '';
    
    const fullPromptText = `${imageDescription}${styleBlock}`;
    
    window.copyTextToClipboard(fullPromptText);
    // Encontra o botão específico para dar o feedback "Copiado!"
    const button = styleSelect.closest('.card').querySelector('button[onclick*="copyPromptWithStyle"]');
    if(button) window.showCopyFeedback(button);
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
    
    // NÃO ZERAMOS MAIS O OBJETO DE INPUTS. Em vez disso, nós o ATUALIZAMOS.
    // A linha "stateToExport.inputs = {};" foi REMOVIDA.

    // Salva/Atualiza todos os inputs, selects e textareas que possuem um ID
    const formElements = document.querySelectorAll('#appRoot input[id], #appRoot select[id], #appRoot textarea[id]');
    formElements.forEach(el => {
        if (el.type !== 'file' && el.type !== 'radio') {
            // Isso irá adicionar ou sobrescrever o valor no objeto inputs,
            // mas preservará outras chaves como 'selectedGenre'.
            stateToExport.inputs[el.id] = el.value;
        }
    });
    
    // A lógica para salvar o radio button permanece a mesma.
    const checkedConclusionType = document.querySelector('input[name="conclusionType"]:checked');
    if (checkedConclusionType) {
        stateToExport.inputs['conclusionType'] = checkedConclusionType.value;
    }

    // A lógica para salvar o HTML dos painéis permanece a mesma.
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

    // 1. Restaura os valores dos inputs (sem mudanças)
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
    // A LINHA PROBLEMÁTICA 'toggleCustomImageStyleVisibility();' FOI REMOVIDA DAQUI.

    // 3. Restaura os outputs dos painéis de resultado (sem mudanças)
    if (state.generated.emotionalMapHTML) document.getElementById('emotionalMapContent').innerHTML = state.generated.emotionalMapHTML;
    if (state.generated.soundtrackHTML) document.getElementById('soundtrackContent').innerHTML = state.generated.soundtrackHTML;
    if (state.generated.titlesAndThumbnailsHTML) document.getElementById('titlesThumbnailsContent').innerHTML = state.generated.titlesAndThumbnailsHTML;
    if (state.generated.descriptionHTML) document.getElementById('videoDescriptionContent').innerHTML = state.generated.descriptionHTML;
    if (state.generated.analysisReportHTML) document.getElementById('analysisReportContainer').innerHTML = state.generated.analysisReportHTML;
    if (state.generated.hooksReportHTML) document.getElementById('hooksReportContainer').innerHTML = state.generated.hooksReportHTML;
    if (state.generated.viralSuggestionsHTML) document.getElementById('viralSuggestionsContainer').innerHTML = state.generated.viralSuggestionsHTML;

    // 4. Restaura painel de Investigação (sem mudanças)
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
    
    // 5. Lógica de Reconstrução do Roteiro (sem mudanças)
    const scriptContainer = document.getElementById('scriptSectionsContainer');
    scriptContainer.innerHTML = '';
    const sectionDetailsMap = {
        intro: { title: 'Introdução' },
        development: { title: 'Desenvolvimento' },
        climax: { title: 'Clímax' },
        conclusion: { title: 'Conclusão' },
        cta: { title: 'Call to Action (CTA)' }
    };
    const sectionOrder = ['intro', 'development', 'climax', 'conclusion', 'cta'];
    
    sectionOrder.forEach(id => {
        const sectionData = state.generated.script[id];
        const details = sectionDetailsMap[id];
        if (sectionData && sectionData.html) {
            const sectionElement = generateSectionHtmlContent(id, details.title, sectionData.html);
            scriptContainer.appendChild(sectionElement);
        }
    });
    
    // 6. Garante que os estados finais da UI sejam aplicados (sem mudanças)
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

    // ==========================================================
    // >>>>> A CORREÇÃO ESTÁ NESTA LÓGICA 'IF' <<<<<
    // ==========================================================
    if (selectedText.length > 10 && selection.anchorNode) {
        // Primeiro, encontramos o container do conteúdo
        const wrapper = selection.anchorNode.parentElement.closest('.generated-content-wrapper');
        
        // AGORA, verificamos se esse container está DENTRO do painel de edição '#pane-script'
        if (wrapper && wrapper.closest('#pane-script')) {
            // Se as duas condições forem verdadeiras, mostramos o menu
            userSelectionRange = selection.getRangeAt(0).cloneRange();
            const rect = userSelectionRange.getBoundingClientRect();
            editingMenu.style.left = `${rect.left + window.scrollX}px`;
            editingMenu.style.top = `${rect.bottom + window.scrollY + 5}px`;
            editingMenu.classList.add('visible');
            return; // Sai da função para não esconder o menu
        }
    }

    // Se a condição acima não for atendida, escondemos o menu
    if (!editingMenu.contains(document.activeElement)) {
         editingMenu.classList.remove('visible');
    }
});




// =========================================================================
// >>>>> VERSÃO FINAL DO GERENTE DE CLIQUES (OBJETO 'actions') <<<<<
//       Substitua o seu objeto 'actions' inteiro por este.
// =========================================================================
const actions = {
    // --- AÇÕES DO MENU DE EDIÇÃO (QUE ESTAVAM FALTANDO) ---
    'expand': () => handleEditingAction('expand'),
    'summarize': () => handleEditingAction('summarize'),
    'correct': () => handleEditingAction('correct'),

    // --- FLUXO PRINCIPAL v7.0 ---
    'investigate': (btn) => handleInvestigate(btn),
    'generateIdeasFromReport': (btn) => generateIdeasFromReport(btn),
    'select-idea': (btn) => { const ideaString = btn.dataset.idea; if (ideaString) selectIdea(JSON.parse(ideaString.replace(/&quot;/g, '"'))); },
    'suggestStrategy': (btn) => suggestStrategy(btn),
    'buildPromptAndContinue': (btn) => buildPromptAndContinue(),
    'copyMasterPrompt': (btn) => {
        const promptText = document.getElementById('masterPromptOutput').value;
        window.copyTextToClipboard(promptText);
        window.showCopyFeedback(btn);
    },
    'processPastedScript': (btn) => processPastedScript(btn),

    // --- AÇÕES DO PAINEL DE FINALIZAÇÃO ---
    'goToFinalize': (btn) => goToFinalize(btn),
    'analyzeScript': (btn) => analyzeFullScript(btn),
    'analyzeHooks': (btn) => analyzeRetentionHooks(btn),
    'suggestViralElements': (btn) => suggestViralElements(btn),
    'generateTitlesAndThumbnails': (btn) => generateTitlesAndThumbnails(btn),
    'generateDescription': (btn) => generateVideoDescription(btn),
    'generateSoundtrack': (btn) => generateSoundtrack(btn),
    'mapEmotions': (btn) => mapEmotionsAndPacing(btn),

    // --- AÇÕES DE GERENCIAMENTO E UTILITÁRIOS ---
    'exportProject': () => exportProject(),
    'resetProject': async () => {
        const confirmed = await showConfirmationDialog("Começar um Novo Projeto?", "Isso limpará todos os campos e o trabalho realizado. Esta ação não pode ser desfeita. Deseja continuar?");
        if (confirmed) resetApplicationState();
    },

    // --- AÇÕES DE EDIÇÃO DENTRO DOS ACORDEÕES ---
    'regenerate': (btn) => window.regenerateSection(btn.dataset.sectionId),
    'copy': (btn) => { const content = btn.closest('.accordion-item')?.querySelector('.generated-content-wrapper'); if (content) { window.copyTextToClipboard(content.textContent); window.showCopyFeedback(btn); } },
    'analyzeRetention': (btn) => window.analyzeSectionRetention(btn),
    'refineStyle': (btn) => window.refineSectionStyle(btn),
    'enrichWithData': (btn) => window.enrichWithData(btn),
    'suggestPerformance': (btn) => window.suggestPerformance(btn),
    'addDevelopmentChapter': (btn) => window.addDevelopmentChapter(btn),
    'generate-prompts': (btn) => window.generatePromptsForSection(btn),
    'optimizeGroup': (btn) => window.optimizeGroup(btn), // CORREÇÃO: Passa o botão inteiro
    'deleteParagraphGroup': (btn) => { const text = btn.dataset.suggestionText; if (text) window.deleteParagraphGroup(btn, text); },
    'applySuggestion': (btn) => applySuggestion(btn),
    'applyAllSuggestions': (btn) => applyAllSuggestions(btn),
    'applyHookSuggestion': (btn) => applyHookSuggestion(btn),
    'insertViralSuggestion': (btn) => insertViralSuggestion(btn)
};




// ==========================================================
// >>>>> COLE ESTA FUNÇÃO COMPLETA NO LUGAR DA ANTIGA <<<<<
// ==========================================================
const processPastedScript = async (button) => {
    document.getElementById('finalizeBtnContainer')?.remove();

    const scriptInputArea = document.getElementById('scriptInputArea');
    const pastedJson = scriptInputArea.value.trim();

    if (!pastedJson) {
        window.showToast("Por favor, cole o roteiro JSON gerado pela IA.", "error");
        return;
    }

    showButtonLoading(button);
    const scriptContainer = document.getElementById('scriptSectionsContainer');
    scriptContainer.innerHTML = `<div class="card text-center"><div class="loading-spinner loading-spinner-large mx-auto"></div><p class="mt-4">Processando e organizando seu roteiro...</p></div>`;

    try {
        const scriptObject = await getRobustJson(pastedJson);

        const normalizedScriptObject = {};
        const keyMap = {
            'introducao': ['introducao', 'introduction', 'intro'],
            'desenvolvimento': ['desenvolvimento', 'development', 'dev'],
            'climax': ['climax'],
            'conclusao': ['conclusao', 'conclusion'],
            'cta': ['cta', 'call_to_action']
        };
        for (const standardKey in keyMap) {
            for (const possibleKey of keyMap[standardKey]) {
                if (scriptObject[possibleKey] !== undefined) {
                    normalizedScriptObject[standardKey] = scriptObject[possibleKey];
                    break; 
                }
                const lowerPossibleKey = possibleKey.toLowerCase();
                 if (scriptObject[lowerPossibleKey] !== undefined) {
                    normalizedScriptObject[standardKey] = scriptObject[lowerPossibleKey];
                    break;
                }
            }
        }

        if (!normalizedScriptObject.introducao || !normalizedScriptObject.desenvolvimento || !normalizedScriptObject.climax) {
            throw new Error("O JSON colado não contém as chaves essenciais (introducao, desenvolvimento, climax). Verifique a resposta da IA.");
        }

        const sectionMap = { introducao: 'intro', desenvolvimento: 'development', climax: 'climax', conclusao: 'conclusion', cta: 'cta' };
        const titles = { intro: 'Introdução', development: 'Desenvolvimento', climax: 'Clímax', conclusion: 'Conclusão', cta: 'Call to Action (CTA)' };

        scriptContainer.innerHTML = '';

        for (const key in sectionMap) {
            if (normalizedScriptObject[key]) {
                const sectionName = sectionMap[key];
                let rawText = normalizedScriptObject[key];
                
                const cleanedText = rawText.replace(/\[[\d, ]+\]/g, '').trim();

                // ==========================================================
                // >>>>> AQUI ESTÁ A CORREÇÃO MÁGICA <<<<<
                // Substituímos .split(/\n\s*\n/) por .split(/\n+/)
                // O \n+ divide o texto em QUALQUER quebra de linha (simples, dupla, tripla, etc.)
                // Isso garante que cada linha retornada pela IA se torne um parágrafo.
                const paragraphs = cleanedText.split(/\n+/).filter(p => p.trim() !== '');
                // ==========================================================
                
                const htmlContent = paragraphs.map((p, index) => `<div id="${sectionName}-p-${index}">${DOMPurify.sanitize(p)}</div>`).join('');
                
                // Reconstrói o texto limpo a partir dos parágrafos agora corretamente divididos
                const correctlySpacedText = paragraphs.join('\n\n');
                AppState.generated.script[sectionName] = { html: htmlContent, text: correctlySpacedText };

                const sectionElement = generateSectionHtmlContent(sectionName, titles[sectionName], htmlContent);
                scriptContainer.appendChild(sectionElement);
            }
        }
        
        markStepCompleted('script', false);
        window.showToast("Roteiro importado e processado com sucesso!", "success");
        
        const mainContentArea = document.getElementById('pane-script');
        mainContentArea.insertAdjacentHTML('beforeend', `
            <div class="controls mt-6 justify-center" id="finalizeBtnContainer">
                <button class="btn btn-primary" data-action="goToFinalize">
                    <i class="fas fa-flag-checkered mr-2"></i> Revisado! Ir para Finalização
                </button>
            </div>
        `);

    } catch (error) {
        console.error("Erro ao processar roteiro importado:", error);
        window.showToast(`Erro no processamento: ${error.message}`, 'error');
        scriptContainer.innerHTML = `<div class="card card-placeholder text-danger">${error.message}</div>`;
    } finally {
        hideButtonLoading(button);
    }
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