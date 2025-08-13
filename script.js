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

const criterionMap = {
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
    pas: "Foca em um problema que o público tem (Problema), intensifica a dor que ele causa (Agitação) e apresenta o seu conteúdo/produto como a cura (Solução). Ideal para vendas diretas.",
    bab: "Mostra um cenário 'Antes' (o mundo com o problema), um 'Depois' (o resultado ideal) e posiciona seu conteúdo como 'a Ponte' que leva de um ao outro.",
    aida: "Clássico do marketing: primeiro captura a Atenção, depois gera Interesse, cria o Desejo pela solução e, finalmente, chama para a Ação.",
    underdog_victory: "Mostra alguém (ou uma empresa) com limitações que venceu contra tudo e todos. Gera alta conexão emocional e inspira confiança.",
    discovery_mentor: "Revela um grande segredo ou uma 'descoberta' que mudou tudo, posicionando o narrador como um mentor que guia o espectador.",
    if_not_found_create: "Conta a história de origem de um produto ou serviço, nascido de uma necessidade pessoal. 'Eu tinha esse problema, não achei solução, então criei uma'."
};

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
// ==================== FUNÇÕES UTILITÁRIAS ===================
// ==========================================================

const showButtonLoading = (button) => {
    if (!button) return;
    button.setAttribute('data-original-html', button.innerHTML);
    button.disabled = true;
    button.innerHTML = '<div class="spinner"></div>';
};

const hideButtonLoading = (button) => {
    if (!button) return;
    if (button.hasAttribute('data-original-html')) {
        button.innerHTML = button.getAttribute('data-original-html');
        button.removeAttribute('data-original-html');
    }
    button.disabled = false;
};

const callGroqAPI = async (prompt, maxTokens = 4000) => {
    const workerUrl = "https://royal-bird-81cb.david-souzan.workers.dev/";
    const response = await fetch(workerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, maxTokens })
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(`Erro da API: ${errorData.error || response.statusText}`);
    }
    const result = await response.json();
    return result.choices?.[0]?.message?.content || "";
};

const cleanGeneratedText = (text, expectJson = false, arrayExpected = false) => {
    if (!text || typeof text !== 'string') {
        return expectJson ? (arrayExpected ? [] : null) : '';
    }
    if (!expectJson) {
        return text.trim();
    }
    let jsonString;
    const trimmedText = text.trim();
    const markdownMatch = trimmedText.match(/```(json)?\s*([\s\S]*?)\s*```/);
    if (markdownMatch && markdownMatch[2]) {
        jsonString = markdownMatch[2].trim();
    } else {
        const startIndex = trimmedText.search(/[\{\[]/);
        if (startIndex === -1) { throw new Error("A IA não retornou um formato JSON reconhecível."); }
        const lastBraceIndex = trimmedText.lastIndexOf('}');
        const lastBracketIndex = trimmedText.lastIndexOf(']');
        const endIndex = Math.max(lastBraceIndex, lastBracketIndex);
        if (endIndex === -1 || endIndex < startIndex) { throw new Error("O JSON retornado pela IA parece estar incompleto."); }
        jsonString = trimmedText.substring(startIndex, endIndex + 1);
    }
    try {
        jsonString = jsonString.replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3').replace(/:\s*'((?:[^'\\]|\\.)*?)'/g, ': "$1"').replace(/,\s*([}\]])/g, '$1');
    } catch (e) { console.warn("Erro na pré-formatação do JSON.", e); }
    let openBrackets = (jsonString.match(/\[/g) || []).length;
    let closeBrackets = (jsonString.match(/\]/g) || []).length;
    let openBraces = (jsonString.match(/\{/g) || []).length;
    let closeBraces = (jsonString.match(/\}/g) || []).length;
    while (openBraces > closeBraces) { jsonString += '}'; closeBraces++; }
    while (openBrackets > closeBrackets) { jsonString += ']'; closeBrackets++; }
    try {
        let parsedResult = JSON.parse(jsonString);
        if (arrayExpected && !Array.isArray(parsedResult)) return [parsedResult];
        return parsedResult;
    } catch (initialError) {
        let repairedString = jsonString;
        try {
            repairedString = repairedString.replace(/`/g, "'").replace(/(?<=")\s*[\r\n]+\s*(?=")/g, ',').replace(/([{,]\s*)'([^']+)'(\s*:)/g, '$1"$2"$3').replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3').replace(/:\s*'((?:[^'\\]|\\.)*?)'/g, ': "$1"').replace(/,\s*([}\]])/g, '$1').replace(/"\s*[;.,]\s*([,}\]])/g, '"$1').replace(/:\s*"([^"]*)"/g, (match, content) => { if (content.includes('"') && !content.includes('\\"')) { const escapedContent = content.replace(/(?<!\\)"/g, '\\"'); return `: "${escapedContent}"`; } return match; }).replace(/}\s*"/g, '},"').replace(/(?<!\\)\n/g, "\\n").replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
            let finalParsedResult = JSON.parse(repairedString);
            if (arrayExpected && !Array.isArray(finalParsedResult)) return [finalParsedResult];
            return finalParsedResult;
        } catch (surgeryError) {
            console.error("FALHA CRÍTICA: A cirurgia no JSON não foi bem-sucedida.", surgeryError.message, "JSON Problemático:", text, "JSON Pós-Cirurgia:", repairedString);
            throw new Error(`A IA retornou um JSON com sintaxe inválida que não pôde ser corrigido.`);
        }
    }
};

const removeMetaComments = (text) => {
    if (!text) return "";
    let cleanedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = cleanedText.split('\n');
    if (lines.length > 0 && /^[A-ZÀ-Ú].*:$/.test(lines[0].trim())) {
        lines.shift();
        cleanedText = lines.join('\n');
    }
    const patternsToRemove = [ /Here is the (generated|refined|final)?\s?script for the "[^"]+" section:\s*/gi, /Here is the (refined|final)?\s?text:\s*/gi, /Response:\s*/gi, /Output:\s*/gi, /^Of course,?/i, /^Sure,?/i, /^Certainly,?/i, /^\*\*roteiro anotado:\*\*\s*/im, /^\*\*[^\*]+\*\*\s*$/gm, /^\s*\((Pausa|Teaser|Corte para|Transição|Música sobe|Efeito sonoro)\)\s*$/gim, /^\s*Narrator:\s*.*$/gim, /^\s*\[(Begin|End|Scene \d+|Transition|Music|Sound Effect|Pause|Cue|Visual:|Action:|Character:)[^\]]*\]\s*$/gim, /^"""\s*/g, /\s*"""$/g, ];
    patternsToRemove.forEach(pattern => { cleanedText = cleanedText.replace(pattern, ''); });
    cleanedText = cleanedText.replace(/^\s*\n+|\n+\s*$/g, '').trim();
    const trimmedForQuotes = cleanedText.trim();
    if (trimmedForQuotes.startsWith('"') && trimmedForQuotes.endsWith('"') && trimmedForQuotes.length > 1) {
        const contentInside = trimmedForQuotes.substring(1, trimmedForQuotes.length - 1);
        if (!/[^\\]"/.test(contentInside)) { cleanedText = contentInside; }
    }
    return cleanedText.trim();
};

const showConfirmationDialog = (title, message) => {
    return new Promise(resolve => {
        const overlay = document.getElementById('confirmationDialogOverlay');
        const titleEl = document.getElementById('confirmationTitle');
        const messageEl = document.getElementById('confirmationMessage');
        const btnYes = document.getElementById('confirmBtnYes');
        const btnNo = document.getElementById('confirmBtnNo');
        if (!overlay || !titleEl || !messageEl || !btnYes || !btnNo) { resolve(false); return; }
        titleEl.textContent = title;
        messageEl.textContent = message;
        overlay.style.display = 'flex';
        overlay.classList.add('visible');
        const closeDialog = (result) => {
            overlay.classList.remove('visible');
            overlay.style.display = 'none';
            btnYes.replaceWith(btnYes.cloneNode(true));
            btnNo.replaceWith(btnNo.cloneNode(true));
            resolve(result);
        };
        const newBtnYes = btnYes.cloneNode(true);
        const newBtnNo = btnNo.cloneNode(true);
        newBtnYes.addEventListener('click', () => closeDialog(true));
        newBtnNo.addEventListener('click', () => closeDialog(false));
        btnYes.parentNode.replaceChild(newBtnYes, btnYes);
        btnNo.parentNode.replaceChild(newBtnNo, btnNo);
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
        if (!overlay || !titleEl || !messageEl || !labelEl || !fieldEl || !btnConfirm || !btnCancel || !suggestionsContainer) { resolve(null); return; }
        suggestionsContainer.innerHTML = ''; fieldEl.value = '';
        titleEl.textContent = title; messageEl.textContent = message;
        labelEl.textContent = label; fieldEl.placeholder = placeholder;
        const closeDialog = (result) => {
            overlay.classList.remove('visible');
            overlay.style.display = 'none';
            btnConfirm.onclick = null; btnCancel.onclick = null;
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
            else showToast("Digite um tema ou escolha uma sugestão.", 'info');
        };
        btnCancel.onclick = () => closeDialog(null);
        overlay.style.display = 'flex';
        overlay.classList.add('visible');
        fieldEl.focus();
    });
};

const handleEditingAction = async (action) => {
    if (!userSelectionRange) { showToast("Erro: A seleção de texto foi perdida.", 'error'); return; }
    const selectedText = userSelectionRange.toString().trim();
    if (!selectedText) return;
    const editingMenu = document.getElementById('editing-menu');
    editingMenu.classList.remove('visible');
    const instructions = {
        expand: "Sua tarefa é expandir este parágrafo, adicionando mais detalhes e contexto.",
        summarize: "Sua tarefa é resumir este parágrafo, tornando-o mais conciso.",
        correct: "Sua tarefa é corrigir a ortografia e gramática do texto a seguir."
    };
    const prompt = `Você é um editor de roteiros. ${instructions[action]} Responda APENAS com o texto reescrito. TEXTO ORIGINAL: "${selectedText}"`;
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
        showToast(`Texto refinado com sucesso!`, 'success');
    } catch (err) {
        console.error(`Erro ao tentar '${action}':`, err);
        showToast(`Falha ao refinar o texto: ${err.message}`, 'error');
    } finally {
        userSelectionRange = null;
    }
};

const copyTextToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copiado!', 'success');
    } catch (err) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus(); ta.select();
        try { document.execCommand('copy'); showToast('Copiado!', 'success'); } 
        finally { document.body.removeChild(ta); }
    }
};

const showCopyFeedback = (buttonElement) => {
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

const updateButtonStates = () => {
    const script = AppState.generated.script;
    const allMainScriptGenerated = !!script.intro?.text && !!script.development?.text && !!script.climax?.text;
    const isConclusionGenerated = !!script.conclusion?.text;
    const isFullScriptGenerated = allMainScriptGenerated && isConclusionGenerated && !!script.cta?.text;
    const metadataButtons = ['generateTitlesAndThumbnailsBtn', 'generateDescriptionBtn', 'generateSoundtrackBtn', 'mapEmotionsBtn'];
    metadataButtons.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.disabled = !allMainScriptGenerated;
    });
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
    const analysisSection = document.getElementById('scriptAnalysisSection');
    if (analysisSection) {
        analysisSection.classList.toggle('hidden', !isFullScriptGenerated);
    }
};

const calculateReadingTime = (text) => {
    if (!text) return "";
    const paceMap = { slow: 120, moderate: 150, fast: 180 };
    const selectedPace = document.getElementById('speakingPace')?.value || 'moderate';
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
            const newTime = calculateReadingTime(contentWrapper.textContent);
            timeDisplay.textContent = newTime;
        }
    });
};

const invalidateAndClearEmotionalMap = () => {
    if (!AppState.generated.emotionalMap) return;
    AppState.generated.emotionalMap = null;
    const container = document.getElementById('emotionalMapContent');
    if (container) {
        container.innerHTML = `<div class="asset-card-placeholder" style="color:var(--warning);">O roteiro foi alterado.<br>Clique em "Mapear" novamente.</div>`;
    }
};

const invalidateAndClearPerformance = (sectionElement) => {
    if (!sectionElement) return;
    const performanceContainer = sectionElement.querySelector('.section-performance-output');
    if (performanceContainer && performanceContainer.innerHTML.trim() !== '') {
        performanceContainer.innerHTML = `<div class="p-3 rounded-md" style="background-color: color-mix(in srgb, var(--warning) 10%, transparent);"><p class="text-sm font-semibold">Atenção: O roteiro foi modificado.</p><p class="text-xs mt-1">Clique em "Sugerir Performance" novamente.</p></div>`;
    }
};

const invalidateAndClearPrompts = (sectionElement) => {
    if (!sectionElement) return;
    const sectionId = sectionElement.id;
    if (AppState.generated.imagePrompts[sectionId]) {
        delete AppState.generated.imagePrompts[sectionId];
    }
    const promptContainer = sectionElement.querySelector('.prompt-container');
    if (promptContainer && promptContainer.innerHTML.trim() !== '') {
        promptContainer.innerHTML = `<div class="p-3 rounded-md" style="background-color: color-mix(in srgb, var(--warning) 10%, transparent);"><p class="text-sm font-semibold">Atenção: O roteiro foi modificado.</p><p class="text-xs mt-1">Clique em "Gerar Prompts de Imagem" novamente.</p></div>`;
    }
};

const escapeRtf = (text) => {
    let result = '';
    for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i);
        if (charCode === 92 || charCode === 123 || charCode === 125) {
            result += '\\' + text.charAt(i);
        } else if (charCode > 127) {
            let hex = charCode.toString(16);
            if (hex.length < 2) hex = '0' + hex;
            result += "\\'" + hex;
        } else {
            result += text.charAt(i);
        }
    }
    return result;
};

const escapeIdeaForOnclick = (idea) => {
    const jsonString = JSON.stringify(idea);
    return jsonString.replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/\\/g, '&#92;');
};





// ==========================================================
// =================== GERENCIADOR DE PROMPTS (A ALMA) =======
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

**FRAMEWORK CRIATIVo ADICIONAL:**
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
        return promptTemplate.replace(/__ORIGINAL_QUERY__/g, context.originalQuery).replace(/__RAW_REPORT__/g, context.rawReport).replace(/__LANGUAGE_NAME__/g, context.languageName);
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
    },
    getSoundtrackPrompt: (fullTranscript) => {
        return `Você é uma API ESPECIALISTA EM CRIAÇÃO DE PROMPTS PARA IAs DE GERAÇÃO DE TRILHAS SONORAS CINEMATOGRÁFICAS. Sua função ÚNICA E CRÍTICA é analisar um roteiro e gerar 4 PARÁGRAFOS DESCRITIVOS que sirvam como prompts ricos para a criação de uma trilha sonora que complemente perfeitamente o tom e a emoção do vídeo.

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

**AÇÃO FINAL:** Analise AGORA o roteiro. Gere o array JSON com os 4 prompts de trilha sonora mais descritivos e alinhados com a narrativa. Responda APENAS com o array JSON perfeito.`;
    }
};




// =========================================================================
// ==================== FUNÇÕES PRINCIPAIS (1/2) ===========================
// =========================================================================

const handleInvestigate = async (button) => {
    document.getElementById('ideaGenerationSection').classList.add('hidden');
    document.getElementById('ideasOutput').innerHTML = '';
    const outputContainer = document.getElementById('factCheckOutput');
    outputContainer.innerHTML = '';
    outputContainer.removeAttribute('data-raw-report');

    const query = document.getElementById('factCheckQuery').value.trim();
    if (!query) {
        showToast("Por favor, digite uma afirmação ou pergunta para investigar.", 'info');
        return;
    }

    showButtonLoading(button);
    outputContainer.innerHTML = `<div class="asset-card-placeholder"><div class="spinner"></div><span style="margin-left: 1rem;">Nossos agentes estão investigando...</span></div>`;

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
        
        AppState.generated.investigationReport = report;
        outputContainer.dataset.rawReport = report;
        outputContainer.dataset.originalQuery = query;
        const converter = new showdown.Converter({ simplifiedAutoLink: true, tables: true });
        const htmlReport = converter.makeHtml(report);
        
        outputContainer.innerHTML = `<div class="prose dark:prose-invert max-w-none p-4 card rounded-lg mt-4 border-l-4" style="border-color: var(--success);">${htmlReport}</div>`;
        
        document.getElementById('ideaGenerationSection').classList.remove('hidden');
        showToast("Investigação concluída! Agora, gere ideias a partir dos fatos.", 'success');
        
    } catch (error) {
        console.error("Erro detalhado em handleInvestigate:", error);
        outputContainer.innerHTML = `<p class="text-red-500 p-4">${error.message}</p>`;
    } finally {
        hideButtonLoading(button);
    }
};

const generateIdeasFromReport = async (button) => {
    const factCheckOutput = document.getElementById('factCheckOutput');
    const { originalQuery, rawReport } = factCheckOutput.dataset;

    if (!rawReport || !originalQuery) {
        showToast("Erro: Relatório da investigação não encontrado.", 'error');
        return;
    }
    
    const activeTab = document.querySelector('#genreTabs .tab-button.tab-active');
    const genre = activeTab ? activeTab.dataset.genre : 'geral';
    const languageName = document.getElementById('languageSelect').value === 'pt-br' ? 'Português do Brasil' : 'English';
    
    const outputContainer = document.getElementById('ideasOutput');
    showButtonLoading(button);
    outputContainer.innerHTML = `<div class="md:col-span-2 flex flex-col items-center p-8"><div class="spinner"></div><p class="mt-4" style="color: var(--text-muted);">Consultando especialista em ${genre}...</p></div>`;

    const promptContext = { originalQuery, rawReport, languageName };
    const prompt = PromptManager.getIdeasPrompt(genre, promptContext);

    try {
        const rawResult = await callGroqAPI(prompt, 4000);
        const ideas = cleanGeneratedText(rawResult, true, true);

        if (!ideas || !Array.isArray(ideas) || ideas.length === 0 || !ideas[0].title) {
            throw new Error("A IA não retornou ideias em um formato JSON válido. Tente novamente.");
        }
        AppState.generated.ideas = ideas;

        const genreColorMap = {
            'documentario': 'border-gray-500', 'inspiracional': 'border-violet-500',
            'scifi': 'border-blue-500', 'terror': 'border-red-500',
            'enigmas': 'border-purple-500', 'geral': 'border-emerald-500'
        };
        const colorClass = genreColorMap[genre] || 'border-emerald-500';

const allCardsHtml = ideas.map((idea, index) => {
             const escapedIdea = escapeIdeaForOnclick(idea);
             return `
                <div class="card p-4 flex flex-col justify-between border-l-4 ${colorClass}" style="animation: fadeIn 0.5s ${index * 0.1}s ease forwards; opacity: 0;">
                    <div>
                        <div class="flex justify-between items-start gap-4">
                            <h4 class="font-bold text-base flex-grow" style="color: var(--text-header);">${index + 1}. ${DOMPurify.sanitize(idea.title)}</h4>
                            
                            <!-- A CORREÇÃO ESTÁ AQUI -->
                            <button class="btn btn-primary btn-small" data-action="select-idea" data-idea='${escapedIdea}'>
                                Usar
                            </button>
                            <!-- FIM DA CORREÇÃO -->

                        </div>
                        <p class="text-sm mt-2">"${DOMPurify.sanitize(idea.videoDescription || idea.angle)}"</p>
                    </div>
                    <span class="font-bold text-sm bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 py-1 px-2 rounded-lg self-start mt-3">
                        Potencial: ${DOMPurify.sanitize(String(idea.viralityScore))} / 10
                    </span>
                </div>
            `;
        }).join('');
        
        outputContainer.innerHTML = allCardsHtml;

    } catch(err) {
        showToast(`Erro ao gerar ideias: ${err.message}`, 'error');
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

    const fieldsToClear = ['centralQuestion', 'emotionalHook', 'narrativeVoice', 'shockingEndingHook', 'researchData'];
    fieldsToClear.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    
    showToast("Ideia selecionada! Agora, refine a estratégia.", 'success');
    markStepCompleted('investigate');
    showPane('strategy');
};

const applyStrategy = () => {
    if (!validateInputs()) return;
    markStepCompleted('strategy');
    showPane('script');
    showToast("Estratégia definida. Pronto para criar o roteiro.", 'success');
};

const suggestStrategy = async (button) => {
    const themeField = document.getElementById('videoTheme');
    if (themeField && themeField.value.trim()) {
        const userConfirmed = await showConfirmationDialog(
            "Refinar Estratégia com IA?",
            "Isso usará a IA para redefinir a estratégia e LIMPARÁ completamente qualquer esboço ou roteiro já gerado. Deseja continuar?"
        );
        if (!userConfirmed) return;
    }

    console.log("Iniciando limpeza profunda para nova estratégia...");
    AppState.generated.strategicOutline = null;
    AppState.generated.script = { intro: { html: null, text: null }, development: { html: null, text: null }, climax: { html: null, text: null }, conclusion: { html: null, text: null }, cta: { html: null, text: null } };
    AppState.generated.emotionalMap = null;
    AppState.generated.titlesAndThumbnails = null;
    AppState.generated.description = null;
    AppState.generated.soundtrack = null;
    AppState.generated.imagePrompts = {};
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
        if (element) { element.innerHTML = `<div class="asset-card-placeholder">${placeholdersToReset[id]}</div>`; }
    }
    const analysisContainers = ['analysisReportContainer', 'hooksReportContainer', 'viralSuggestionsContainer'];
    analysisContainers.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.innerHTML = '';
    });

    const theme = document.getElementById('videoTheme')?.value.trim();
    const description = document.getElementById('videoDescription')?.value.trim();
    if (!theme || !description) {
        showToast("Preencha o Tema e a Descrição do Vídeo para receber sugestões.", 'info');
        return;
    }
    
    showButtonLoading(button);
    AppState.ui.isSettingStrategy = true;

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

        showToast("Estratégia refinada pela IA!");
        document.querySelector('[data-tab="input-tab-estrategia"]')?.click();

    } catch (error) {
        console.error("Erro detalhado em suggestStrategy:", error);
        showToast(`Falha ao sugerir estratégia: ${error.message}`, 'error');
    } finally {
        AppState.ui.isSettingStrategy = false;
        hideButtonLoading(button);
        updateButtonStates();
    }
};




// =========================================================================
// ==================== FUNÇÕES PRINCIPAIS (2/2) ===========================
// =========================================================================

const generateStrategicOutline = async (button) => {
    if (!validateInputs()) return;

    console.log("Iniciando limpeza profunda para novo esboço...");
    AppState.generated.strategicOutline = null;
    AppState.generated.script = { intro: { html: null, text: null }, development: { html: null, text: null }, climax: { html: null, text: null }, conclusion: { html: null, text: null }, cta: { html: null, text: null } };
    AppState.generated.emotionalMap = null;
    AppState.generated.titlesAndThumbnails = null;
    AppState.generated.description = null;
    AppState.generated.soundtrack = null;
    AppState.generated.imagePrompts = {};
    const scriptContainer = document.getElementById('scriptSectionsContainer');
    if (scriptContainer) scriptContainer.innerHTML = '';
    const outlineContent = document.getElementById('outlineContent');
    if(outlineContent) outlineContent.innerHTML = `<div class="asset-card-placeholder">Clique para gerar o esboço.</div>`;
    
    showButtonLoading(button);
    
    const outlineContentDiv = document.getElementById('outlineContent');
    outlineContentDiv.innerHTML = `<div class="asset-card-placeholder"><div class="spinner"></div><span style="margin-left: 1rem;">Criando o esqueleto da história...</span></div>`;

    try {
        const baseContext = getBasePromptContext();
        const prompt = PromptManager.getOutlinePrompt({ basePrompt: baseContext });
        
        const rawResult = await callGroqAPI(prompt, 4000);
        AppState.generated.strategicOutline = cleanGeneratedText(rawResult, true);
        
        const { strategicOutline } = AppState.generated;

        if (!strategicOutline || typeof strategicOutline !== 'object' || !strategicOutline.introduction) {
            throw new Error("A IA falhou em gerar um esboço válido.");
        }

        const titleTranslations = {
            'introduction': 'Introdução', 'development': 'Desenvolvimento',
            'climax': 'Clímax', 'conclusion': 'Conclusão', 'cta': 'CTA'
        };
        
        let outlineHtml = '<ul class="space-y-4 text-sm" style="list-style-position: inside; padding-left: 0;">';
        for (const key in strategicOutline) {
            if (Object.hasOwnProperty.call(strategicOutline, key)) {
                const translatedTitle = titleTranslations[key] || key;
                outlineHtml += `<li><div><strong style="color: var(--primary);">${translatedTitle}:</strong> <span style="color: var(--text-body);">${DOMPurify.sanitize(strategicOutline[key])}</span></div></li>`;
            }
        }
        outlineHtml += '</ul>';
        
        outlineContentDiv.innerHTML = outlineHtml;
        createScriptSectionPlaceholders();

    } catch (error) {
        console.error("Erro detalhado em generateStrategicOutline:", error);
        showToast(`Falha ao gerar Esboço: ${error.message}`, 'error');
        if(outlineContentDiv) outlineContentDiv.innerHTML = `<div class="asset-card-placeholder" style="color: var(--danger);">${error.message}. Tente novamente.</div>`;
    } finally {
        hideButtonLoading(button);
        updateButtonStates();
    }
};

const createScriptSectionPlaceholders = () => {
    const scriptContainer = document.getElementById('scriptSectionsContainer');
    if (!scriptContainer) return;

    const sections = [
        { id: 'intro', title: 'Introdução', action: 'generateIntro' },
        { id: 'development', title: 'Desenvolvimento', action: 'generateDevelopment' },
        { id: 'climax', title: 'Clímax', action: 'generateClimax' },
    ];

    let placeholdersHtml = '';
    sections.forEach(section => {
        placeholdersHtml += `
            <div id="${section.id}Section" class="card card-placeholder mb-4 flex justify-between items-center" style="animation: fadeIn 0.5s ease forwards; opacity: 0;">
                <h3 class="font-semibold text-lg" style="color: var(--text-header);">${section.title}</h3>
                <button id="${section.action}Btn" data-action="${section.action}" class="btn btn-secondary btn-small">
                    <i class="fas fa-magic" style="margin-right: 8px;"></i>Gerar
                </button>
            </div>
        `;
    });
    
    scriptContainer.innerHTML = placeholdersHtml;
};

const handleGenerateSection = async (button, sectionName, sectionTitle, elementId) => {
    if (!validateInputs()) return;
    if (!AppState.generated.strategicOutline && sectionName !== 'intro') {
        showToast("Crie o Esboço Estratégico primeiro!", 'info');
        return;
    }

    showButtonLoading(button);
    const targetSectionElement = document.getElementById(`${elementId}Section`);

    try {
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
        
        const { prompt } = constructScriptPrompt(sectionName, sectionTitle, directive, contextText);
        
        const rawResult = await callGroqAPI(prompt, 4000);
        const paragraphs = cleanGeneratedText(rawResult, true, true); 

        if (!Array.isArray(paragraphs) || paragraphs.length === 0) {
            throw new Error("A IA não retornou o roteiro no formato de parágrafos esperado. Tente novamente.");
        }

        const contentWithDivs = paragraphs.map((p, index) => `<div id="${elementId}-p-${index}">${DOMPurify.sanitize(p)}</div>`).join('');
        const fullText = paragraphs.join('\n\n');

        if (AppState.generated.script.hasOwnProperty(sectionName)) {
            AppState.generated.script[sectionName] = { html: contentWithDivs, text: fullText };
        }

        if (targetSectionElement) {
            const sectionElement = generateSectionHtmlContent(elementId, sectionTitle, contentWithDivs);
            targetSectionElement.innerHTML = '';
            targetSectionElement.appendChild(sectionElement);
            targetSectionElement.classList.remove('card', 'card-placeholder', 'flex', 'justify-between', 'items-center');
        }

    } catch (error) {
        showToast(`Falha ao gerar ${sectionTitle}: ${error.message}`, 'error');
        console.error(`Error generating ${sectionTitle}.`, error);
        if (targetSectionElement) {
            const placeholderHTML = `<h3 class="font-semibold text-lg">${sectionTitle}</h3><button id="${button.id}" data-action="${button.dataset.action}" class="btn btn-secondary btn-small"><i class="fas fa-sync-alt mr-2"></i>Tentar Novamente</button>`;
            targetSectionElement.innerHTML = placeholderHTML;
        }
    } finally {
        hideButtonLoading(button);
        updateButtonStates();
    }
};

const generateConclusion = async (button) => {
    if (!validateInputs()) return;
    showButtonLoading(button);

    let conclusionContainer = document.getElementById('conclusionSection');
    if (!conclusionContainer) {
        conclusionContainer = document.createElement('div');
        conclusionContainer.id = 'conclusionSection';
        conclusionContainer.classList.add('script-section');
        document.getElementById('scriptSectionsContainer').appendChild(conclusionContainer);
    }

    const conclusionType = document.querySelector('input[name="conclusionType"]:checked').value;
    const conclusionSpecifics = document.getElementById('conclusionSpecifics').value.trim();
    const centralQuestion = document.getElementById('centralQuestion')?.value.trim() || 'a pergunta central do vídeo';
    let strategyDirective = '';
    switch (conclusionType) {
        case 'lesson': strategyDirective = `O objetivo é reforçar uma lição ou reflexão central e memorável. Detalhe: '${conclusionSpecifics || 'Nenhum'}'.`; break;
        case 'answer': strategyDirective = `O objetivo é responder de forma clara à pergunta ('${centralQuestion}'). Detalhe: '${conclusionSpecifics || 'Nenhum'}'.`; break;
        case 'cliffhanger': strategyDirective = `O objetivo é criar um gancho ou mistério. Detalhe: '${conclusionSpecifics || 'Nenhum'}'.`; break;
    }

    const { prompt } = constructScriptPrompt('conclusion', 'Conclusão', strategyDirective, getTranscriptOnly());
    
    try {
        const rawResult = await callGroqAPI(prompt, 3000);
        const paragraphs = cleanGeneratedText(rawResult, true, true);
        if (!Array.isArray(paragraphs) || paragraphs.length === 0) { throw new Error("A IA não retornou um conteúdo válido para a conclusão."); }
        
        const contentWithSpans = paragraphs.map((p, index) => `<div id="conclusion-p-${index}">${DOMPurify.sanitize(p)}</div>`).join('');
        const fullText = paragraphs.join('\n\n');
        AppState.generated.script.conclusion = { html: contentWithSpans, text: fullText };
        
        const conclusionElement = generateSectionHtmlContent('conclusion', 'Conclusão', contentWithSpans);
        conclusionContainer.innerHTML = '';
        conclusionContainer.appendChild(conclusionElement);
        
        document.querySelectorAll('input[name="conclusionType"]').forEach(radio => radio.disabled = true);
        document.getElementById('conclusionSpecifics').disabled = true;
        document.querySelector('#conclusionInputContainer').classList.add('opacity-50');
        button.classList.add('hidden');
        document.getElementById('generateCtaBtn').classList.remove('hidden');

        showToast("Conclusão gerada! Agora, vamos ao CTA.", 'success');
    } catch (error) {
        console.error("Erro detalhado em generateConclusion:", error);
        showToast(`Falha ao gerar a conclusão: ${error.message}`, 'error');
    } finally {
        hideButtonLoading(button);
        updateButtonStates();
    }
};

const generateStrategicCta = async (button) => {
    showButtonLoading(button);
    let ctaSection = document.getElementById('ctaSection');
    if (!ctaSection) {
        ctaSection = document.createElement('div');
        ctaSection.id = 'ctaSection';
        ctaSection.classList.add('script-section');
        document.getElementById('scriptSectionsContainer').appendChild(ctaSection);
    }

    const ctaSpecifics = document.getElementById('ctaSpecifics').value.trim();
    let ctaDirective = "Crie um Call to Action (CTA) genérico, convidando a curtir, comentar e se inscrever.";
    if (ctaSpecifics) {
        ctaDirective = `Crie um CTA específico e persuasivo. Instrução: "${ctaSpecifics}".`;
    }

    const { prompt } = constructScriptPrompt('cta', 'Call to Action', ctaDirective, getTranscriptOnly());
    
    try {
        const rawResult = await callGroqAPI(prompt, 400);
        const paragraphs = cleanGeneratedText(rawResult, true, true);
        if (!Array.isArray(paragraphs) || paragraphs.length === 0) { throw new Error("A IA não retornou um conteúdo válido para o CTA."); }

        const contentWithSpans = paragraphs.map((p, index) => `<div id="cta-p-${index}">${DOMPurify.sanitize(p)}</div>`).join('');
        const fullText = paragraphs.join('\n\n');
        AppState.generated.script.cta = { html: contentWithSpans, text: fullText };

        const ctaElement = generateSectionHtmlContent('cta', 'Call to Action (CTA)', contentWithSpans);
        ctaSection.innerHTML = '';
        ctaSection.appendChild(ctaElement);
        ctaSection.classList.remove('hidden');
        
        const ctaSpecificsElement = document.getElementById('ctaSpecifics');
        ctaSpecificsElement.disabled = true;
        ctaSpecificsElement.parentElement.classList.add('opacity-50');
        showToast("Roteiro finalizado! Seção de Análise liberada.", 'success');
        
        const analysisSection = document.getElementById('scriptAnalysisSection');
        if (analysisSection) analysisSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch(error) {
        console.error("Erro detalhado em generateStrategicCta:", error);
        showToast(`Falha ao gerar o CTA: ${error.message}`, 'error');
    } finally {
        hideButtonLoading(button);
        updateButtonStates();
    }
};





const suggestFinalStrategy = async (button) => {
    showButtonLoading(button);

    const conclusionSpecifics = document.getElementById('conclusionSpecifics');
    const ctaSpecifics = document.getElementById('ctaSpecifics');
    
    AppState.generated.script.conclusion = { html: null, text: null };
    AppState.generated.script.cta = { html: null, text: null };

    const conclusionContainer = document.getElementById('conclusionSection');
    const ctaContainer = document.getElementById('ctaSection');
    if (conclusionContainer) conclusionContainer.innerHTML = '';
    if (ctaContainer) ctaContainer.innerHTML = '';
    
    document.querySelectorAll('input[name="conclusionType"]').forEach(radio => radio.disabled = false);
    conclusionSpecifics.disabled = false;
    ctaSpecifics.disabled = false;
    document.getElementById('conclusionInputContainer').classList.remove('opacity-50');
    ctaSpecifics.parentElement.classList.remove('opacity-50');
    
    document.getElementById('generateConclusionBtn').classList.remove('hidden');
    document.getElementById('generateCtaBtn').classList.add('hidden');

    const fullContext = getTranscriptOnly();
    const basePromptContext = getBasePromptContext();
    
    if (!fullContext) {
        showToast("Gere o roteiro principal primeiro para receber sugestões.", 'info');
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
            showToast("Sugestões para Conclusão e CTA preenchidas!", 'success');
        } else {
            throw new Error("A IA não retornou sugestões no formato esperado.");
        }

    } catch (error) {
        console.error("Erro detalhado em suggestFinalStrategy:", error);
        showToast(`Falha ao sugerir estratégia final: ${error.message}`, 'error');
    } finally {
        hideButtonLoading(button);
        updateButtonStates();
    }
};


const addDevelopmentChapter = async (button) => {
    const devSectionAccordion = document.getElementById('developmentSection');
    if (!devSectionAccordion) return;
    const contentWrapper = devSectionAccordion.querySelector('.generated-content-wrapper');
    const existingText = contentWrapper?.textContent.trim();

    if (!existingText) {
        showToast("Gere o desenvolvimento inicial primeiro.", 'info');
        return;
    }

    showButtonLoading(button);

    try {
        const suggestionPrompt = `Você é uma API ESPECIALISTA EM ESTRATÉGIA NARRATIVA e um ARQUITETO DA CONTINUIDADE. Sua função ÚNICA E CRÍTICA é analisar o final de um roteiro e propor 3 temas distintos, coerentes e emocionantes para o PRÓXIMO capítulo.

**ROTEIRO ATUAL (PARA ANÁLISE DE CONTINUIDADE CRÍTICA):**
---
${existingText.slice(-3000)} 
---

**TAREFA:** Analise o fluxo narrativo do roteiro acima e gere um array JSON com as 3 sugestões mais fortes, coerentes e cativantes para o tema do próximo capítulo.

**REGRAS CRÍTICAS DE SINTAXE E ESTRUTURA JSON (ABSOLUTAMENTE INEGOCIÁVEIS):**
1.  **JSON PURO E PERFEITO:** Sua resposta deve ser APENAS um array JSON válido, começando com \`[\` e terminando com \`]\`.
2.  **ESTRUTURA DO ARRAY:** O array deve conter EXATAMENTE 3 strings.
3.  **SINTAXE DAS STRINGS:** Todas as strings DEVEM usar aspas duplas (""). Cada string, EXCETO a última, DEVE ser seguida por uma vírgula (,).

**MANUAL DE CRIAÇÃO DE SUGESTÕES (SEUS CRITÉRIOS DE QUALIDADE):**
- **Coerência e Conexão Lógica:** Cada sugestão deve ser uma consequência natural ou uma ramificação interessante do ponto onde o roteiro atual termina.
- **Originalidade e Novidade:** Evite o óbvio. Cada sugestão deve introduzir um novo elemento, conflito ou perspectiva que avance a narrativa.
- **Especificidade:** As sugestões devem ser títulos de capítulo ou temas específicos e acionáveis. Evite generalidades.`;
        
        const rawSuggestions = await callGroqAPI(suggestionPrompt, 400);
        const chapterSuggestions = cleanGeneratedText(rawResult, true, true) || [];
        
        hideButtonLoading(button);

        const chapterTheme = await showInputDialog(
            'Adicionar Novo Capítulo',
            'Escolha uma sugestão da IA ou digite seu próprio tema abaixo.',
            'Ou crie um tema personalizado:',
            'Digite seu tema aqui...',
            chapterSuggestions
        );

        if (!chapterTheme) {
            showToast("Operação cancelada.", 'info');
            return;
        }

        showButtonLoading(button);

        const basePrompt = getBasePromptContext();
        const continuationPrompt = `${basePrompt}

**IDENTIDADE E ESPECIALIZAÇÃO:** Você é um ROTEIRISTA CONTINUÍSTA DE ELITE. Sua única função é escrever o PRÓXIMO capítulo de um roteiro existente, garantindo uma transição PERFEITA e a introdução de NOVAS informações.

**TAREFA CRÍTICA:** Escrever o texto puro e narrado para o novo capítulo com o tema: "${chapterTheme}".

**ROTEIRO ESCRITO ATÉ AGORA (PARA CONTEXTO):**
---
${existingText}
---

**REGRAS DE FORMATAÇÃO E CONTEÚDO (INEGOCIÁVEIS):**
1.  **RESPOSTA 100% PURA E LIMPA:** Sua resposta deve conter APENAS o texto que será dito em voz alta.
2.  **PROIBIÇÃO TOTAL DE FORMATAÇÃO EXTRA:** É PROIBIDO incluir anotações, rótulos ou formatação como 'Narrador:', '(Cena: ...)', ou o título do capítulo.
3.  **FOCO EM NOVIDADE:** O novo capítulo deve AVANÇAR a narrativa, introduzindo novas informações. É PROIBIDO repetir ou parafrasear ideias do roteiro existente.

**AÇÃO FINAL:** Escreva AGORA o texto puro para o próximo capítulo sobre "${chapterTheme}".`;
        
        const rawResult = await callGroqAPI(continuationPrompt, 4000);
        const newChapterText = removeMetaComments(rawResult.trim());
        
        if (!newChapterText) {
             throw new Error("A IA não retornou um conteúdo válido para o novo capítulo.");
        }

        const chapterTitleHtml = `<div class="font-bold text-lg mt-6 mb-3 pb-1 border-b border-gray-200">Capítulo: ${DOMPurify.sanitize(chapterTheme)}</div>`;
        const existingParagraphsCount = contentWrapper.querySelectorAll('div[id]').length;
        const newParagraphs = newChapterText.split('\n').filter(p => p.trim() !== '');
        
        if (newParagraphs.length === 0) {
             throw new Error("O conteúdo do capítulo não pôde ser dividido em parágrafos.");
        }

        const newContentWithDivs = newParagraphs.map((p, index) => 
            `<div id="development-p-${existingParagraphsCount + index}">${DOMPurify.sanitize(p)}</div>`
        ).join('');

        contentWrapper.insertAdjacentHTML('beforeend', chapterTitleHtml + newContentWithDivs);
        
        // Atualiza o estado global
        AppState.generated.script.development.html = contentWrapper.innerHTML;
        AppState.generated.script.development.text = contentWrapper.textContent;

        invalidateAndClearPerformance(devSectionAccordion);
        invalidateAndClearPrompts(devSectionAccordion);
        invalidateAndClearEmotionalMap();
        updateAllReadingTimes();
        
        showToast("Novo capítulo adicionado com sucesso!", 'success');
        contentWrapper.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'center' });

    } catch (error) {
        console.error("Erro detalhado em addDevelopmentChapter:", error);
        showToast(`Falha ao adicionar capítulo: ${error.message}`, 'error');
    } finally {
        hideButtonLoading(button);
    }
};


const goToFinalize = () => {
    const { script } = AppState.generated;

    if (!script.intro?.text || !script.development?.text || !script.climax?.text) {
        showToast("Gere ao menos as seções principais do roteiro antes de finalizar.", 'info');
        return;
    }

    markStepCompleted('script');
    showPane('finalize');
    showToast("Roteiro pronto! Bem-vindo à área de finalização.", 'success');
};


const mapEmotionsAndPacing = async (button) => {
    const { script } = AppState.generated;
    const isScriptReady = script.intro?.text && script.development?.text && script.climax?.text;
    if (!isScriptReady) {
        showToast("Gere pelo menos a Introdução, Desenvolvimento e Clímax primeiro.", 'info');
        return;
    }

    const outputContainer = document.getElementById('emotionalMapContent');
    showButtonLoading(button);
    outputContainer.innerHTML = `<div class="asset-card-placeholder"><div class="spinner"></div><span style="margin-left: 1rem;">Analisando a jornada emocional...</span></div>`;

    try {
        AppState.generated.emotionalMap = null;
        const fullTranscript = getTranscriptOnly();
        const paragraphs = fullTranscript.split('\n\n').filter(p => p.trim() !== '');

        const prompt = `Your single function is to return a JSON array. For each of the ${paragraphs.length} paragraphs below, analyze and return the main emotion and pacing.
        
**CRITICAL AND UNBREAKABLE RULES:**
1.  Your response MUST BE ONLY the JSON array, starting with \`[\` and ending with \`]\`. NO other text is permitted.
2.  The array must contain EXACTLY ${paragraphs.length} objects.
3.  Each object must have EXACTLY two keys: "emotion" and "pace".
4.  Allowed values for "emotion": 'strongly_positive', 'slightly_positive', 'neutral', 'slightly_negative', 'strongly_negative'.
5.  Allowed values for "pace": 'very_fast', 'fast', 'medium', 'slow', 'very_slow'.

**TEXT FOR ANALYSIS:**
---
${JSON.stringify(paragraphs)}
---

ACTION: Return ONLY the JSON array, using the English terms for the values.`;

        const rawResult = await callGroqAPI(prompt, 4000);
        const emotionalMapData = cleanGeneratedText(rawResult, true, true);

        if (!emotionalMapData || !Array.isArray(emotionalMapData) || emotionalMapData.length < paragraphs.length) {
            throw new Error("A IA não retornou um mapa emocional válido ou completo.");
        }
        AppState.generated.emotionalMap = emotionalMapData.slice(0, paragraphs.length);
        
        outputContainer.innerHTML = '';
        let paragraphCounter = 0;

        const sectionOrder = [ { id: 'intro', title: 'Introdução' }, { id: 'development', title: 'Desenvolvimento' }, { id: 'climax', title: 'Clímax' }, { id: 'conclusion', title: 'Conclusão' }, { id: 'cta', title: 'Call to Action (CTA)' } ];
        const emotionGroups = { 'Positiva': ['strongly_positive', 'slightly_positive'], 'Negativa': ['strongly_negative', 'slightly_negative'], 'Neutra': ['neutral'] };
        const paceGroups = { 'Rápido': ['very_fast', 'fast'], 'Médio': ['medium'], 'Lento': ['very_slow', 'slow'] };
        const getGroupName = (value, groups) => {
            for (const groupName in groups) { if (groups[groupName].includes(value)) return groupName; }
            return value.charAt(0).toUpperCase() + value.slice(1);
        };

        sectionOrder.forEach(section => {
            const sectionScript = script[section.id];
            if (!sectionScript || !sectionScript.text) return;
            const numParagraphs = sectionScript.text.split('\n\n').filter(p => p.trim() !== '').length;
            const sectionEmotionsData = AppState.generated.emotionalMap.slice(paragraphCounter, paragraphCounter + numParagraphs);
            if (sectionEmotionsData.length === 0) return;
            
            const groupedEmotions = [...new Set(sectionEmotionsData.map(e => getGroupName(e.emotion, emotionGroups)))];
            const groupedPaces = [...new Set(sectionEmotionsData.map(e => getGroupName(e.pace, paceGroups)))];

            const tagsHtml = groupedEmotions.map(emotion => 
                `<span class="tag" style="background-color: color-mix(in srgb, var(--primary) 15%, transparent); color: var(--primary);"><i class="fas fa-theater-masks mr-2"></i>${DOMPurify.sanitize(emotion)}</span>`
            ).join('') + groupedPaces.map(pace => 
                `<span class="tag tag-pace"><i class="fas fa-tachometer-alt mr-2"></i>${DOMPurify.sanitize(pace)}</span>`
            ).join('');

            const sectionCardHtml = `
            <div class="card !p-4 mb-4" style="animation: fadeIn 0.5s ease forwards; opacity: 0;">
                <div class="flex justify-between items-center mb-3">
                    <h4 class="font-bold text-lg">${section.title}</h4>
                </div>
                <div class="flex flex-wrap gap-2 mb-4">${tagsHtml || '<span class="text-sm italic text-muted">Nenhuma emoção analisada.</span>'}</div>
                <div class="text-sm leading-relaxed generated-content-wrapper">${sectionScript.html}</div>
            </div>`;
            
            outputContainer.innerHTML += sectionCardHtml;
            paragraphCounter += numParagraphs;
        });
        
        showToast("Mapa Emocional analisado com sucesso!", 'success');
    } catch (error) {
        console.error("Erro detalhado ao gerar o Mapa Emocional:", error);
        outputContainer.innerHTML = `<p class="text-red-500 text-sm p-4">${error.message}</p>`;
        AppState.generated.emotionalMap = null;
    } finally {
        hideButtonLoading(button);
    }
};

const generateTitlesAndThumbnails = async (button) => {
    if (!validateInputs()) return;
    showButtonLoading(button);

    const targetContentElement = document.getElementById('titlesThumbnailsContent');
    targetContentElement.innerHTML = `<div class="asset-card-placeholder"><div class="spinner"></div></div>`;

    try {
        const fullTranscript = getTranscriptOnly();
        const baseContext = getBasePromptContext() + `\n\n**ROTEIRO COMPLETO (PARA CONTEXTO):**\n${fullTranscript}`;
        const prompt = PromptManager.getTitlesAndThumbnailsPrompt({ basePrompt: baseContext });
        
        const rawResult = await callGroqAPI(prompt, 4000);
        const parsedContent = cleanGeneratedText(rawResult, true, true);
        
        if (!Array.isArray(parsedContent) || parsedContent.length === 0 || !parsedContent[0].suggested_title) {
            throw new Error("A IA retornou os dados de títulos em um formato inesperado.");
        }

        const titles = parsedContent.map(item => item.suggested_title);
        const thumbnails = parsedContent.map(item => ({ title: item.thumbnail_title, description: item.thumbnail_description }));
        AppState.generated.titlesAndThumbnails = { titles, thumbnails };

        const titlesListHtml = titles.map((title, index) => `<p>${index + 1}. ${DOMPurify.sanitize(title)}</p>`).join('');
        const thumbnailsListHtml = thumbnails.map((thumb) => `
            <div class="mb-4"> 
                <h4 class="font-semibold text-sm" style="color:var(--text-header); margin-bottom: 4px;">"${DOMPurify.sanitize(thumb.title)}"</h4>
                <p class="text-sm" style="color:var(--text-muted);">Descrição: ${DOMPurify.sanitize(thumb.description)}</p>
            </div>`).join('');

        targetContentElement.innerHTML = `
            <div class="generated-output-box !p-0 !bg-transparent !border-none">
                <div class="output-content-block mb-4">
                    <h4 class="output-subtitle">Sugestões de Títulos:</h4>
                    <div class="p-4 rounded-lg" style="background-color: color-mix(in srgb, var(--border) 20%, transparent);">${titlesListHtml}</div>
                </div>
                <div class="output-content-block">
                    <h4 class="output-subtitle">Ideias de Thumbnail:</h4>
                    <div class="p-4 rounded-lg" style="background-color: color-mix(in srgb, var(--border) 20%, transparent);">${thumbnailsListHtml}</div>
                </div>
            </div>`;
    } catch (error) {
        showToast(`Falha ao gerar Títulos: ${error.message}`, 'error');
        targetContentElement.innerHTML = `<div class="asset-card-placeholder" style="color:var(--danger);">${error.message}</div>`;
    } finally {
        hideButtonLoading(button);
    }
};

const generateVideoDescription = async (button) => {
    if (!validateInputs()) return;
    showButtonLoading(button);

    const targetContentElement = document.getElementById('videoDescriptionContent');
    targetContentElement.innerHTML = `<div class="asset-card-placeholder"><div class="spinner"></div></div>`;

    try {
        const fullTranscript = getTranscriptOnly();
        const baseContext = getBasePromptContext() + `\n\n**ROTEIRO COMPLETO (PARA CONTEXTO):**\n${fullTranscript}`;
        const selectedLanguage = document.getElementById('languageSelect').value;
        const languageName = new Intl.DisplayNames([selectedLanguage], { type: 'language' }).of(selectedLanguage);
        const prompt = PromptManager.getVideoDescriptionPrompt({ basePrompt: baseContext, languageName: languageName });

        let result = await callGroqAPI(prompt, 2000);
        result = cleanGeneratedText(result, false);
        result = removeMetaComments(result);
        
        AppState.generated.description = result;
        
        const sanitizedResult = DOMPurify.sanitize(result);
        targetContentElement.innerHTML = `<div class="generated-output-box whitespace-pre-wrap">${sanitizedResult}</div>`;
    } catch (error) {
        showToast(`Falha ao gerar Descrição: ${error.message}`, 'error');
        targetContentElement.innerHTML = `<div class="asset-card-placeholder" style="color:var(--danger);">${error.message}</div>`;
    } finally {
        hideButtonLoading(button);
    }
};




const generateSoundtrack = async (button) => {
    const fullTranscript = getTranscriptOnly();
    if (!fullTranscript) {
        showToast("Gere o roteiro completo primeiro para sugerir uma trilha sonora coerente.", 'info');
        return;
    }

    const outputContainer = document.getElementById('soundtrackContent');
    showButtonLoading(button);
    outputContainer.innerHTML = `<div class="asset-card-placeholder"><div class="spinner"></div></div>`;

    const prompt = PromptManager.getSoundtrackPrompt(fullTranscript);

    try {
        const rawResult = await callGroqAPI(prompt, 1500);
        const analysis = cleanGeneratedText(rawResult, true, true); 

        if (!analysis || !Array.isArray(analysis) || analysis.length === 0) {
            throw new Error("A IA não retornou sugestões no formato esperado.");
        }

        let suggestionsHtml = '<ul class="space-y-2" style="list-style-position: inside; padding-left: 1rem;">';
        analysis.forEach(suggestion => {
            if (typeof suggestion === 'string') {
                suggestionsHtml += `<li>${DOMPurify.sanitize(suggestion)}</li>`;
            }
        });
        suggestionsHtml += '</ul>';
        
        outputContainer.innerHTML = `<div class="generated-output-box">${suggestionsHtml}</div>`;

    } catch (error) {
        console.error("Erro detalhado em generateSoundtrack:", error);
        outputContainer.innerHTML = `<div class="asset-card-placeholder" style="color:var(--danger);">${error.message}</div>`;
    } finally {
        hideButtonLoading(button);
    }
};

const analyzeFullScript = async (button) => {
    showButtonLoading(button);
    const reportContainer = document.getElementById('analysisReportContainer');
    reportContainer.innerHTML = `<div class="my-4 text-center"><div class="spinner mx-auto"></div><p class="text-sm mt-2 text-center">Analisando... Isso pode levar um momento.</p></div>`;

    try {
        const script = AppState.generated.script;
        if (!script.intro.text || !script.development.text || !script.climax.text || !script.conclusion.text || !script.cta.text) {
            throw new Error("Todas as 5 seções do roteiro (Intro, Dev, Clímax, Conclusão e CTA) devem ser geradas primeiro.");
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
        headerDiv.style.background = 'color-mix(in srgb, var(--border) 20%, transparent)';
        headerDiv.innerHTML = DOMPurify.sanitize(`
            <h3 class="text-lg font-bold">Relatório de Análise</h3>
            <button id="applyAllSuggestionsBtn" data-action="applyAllSuggestions" class="btn btn-secondary btn-small">
                <i class="fas fa-wand-magic-sparkles mr-2"></i>Aplicar Todas
            </button>
        `);
        reportContainer.appendChild(headerDiv);

        results.forEach(result => {
            if (result.status === 'fulfilled') {
                reportContainer.appendChild(createReportSection(result.value));
            } else {
                console.error("Uma micro-análise falhou:", result.reason);
                const errorData = { 
                    criterion_name: 'Seção com Erro', 
                    score: '!', 
                    positive_points: 'Falha na análise desta seção.', 
                    improvement_points: [{ critique: 'Erro', suggestion_text: result.reason.message }]
                };
                reportContainer.appendChild(createReportSection(errorData));
            }
        });

        showToast("Análise do roteiro concluída!", 'success');

    } catch (error) {
        console.error("Erro detalhado em analyzeFullScript:", error);
        showToast(`Falha na análise: ${error.message}`, 'error');
        reportContainer.innerHTML = `<p class="text-red-500 text-sm">${error.message}</p>`;
    } finally {
        hideButtonLoading(button);
    }
};

const analyzeRetentionHooks = async (button) => {
    const fullTranscript = getTranscriptOnly();
    if (!fullTranscript) {
        showToast("Gere o roteiro completo primeiro para caçar os ganchos.", 'info');
        return;
    }

    showButtonLoading(button);
    const reportContainer = document.getElementById('hooksReportContainer');
    reportContainer.innerHTML = '';
    reportContainer.innerHTML = `<div class="my-4 text-center"><div class="spinner mx-auto"></div><p class="text-sm mt-2">Caçando e refinando ganchos...</p></div>`;

    const prompt = `Você é uma API ESPECIALISTA EM ANÁLISE DE RETENÇÃO E ENGAJAMENTO DE ROTEIROS. Sua tarefa ÚNICA E CRÍTICA é analisar o roteiro fornecido, identificar com precisão os "ganchos de retenção" existentes e sugerir melhorias estratégicas aprimoradas para maximizar o engajamento do espectador.

**IDENTIDADE E ESPECIALIZAÇÃO (A REGRA MAIS IMPORTANTE):**
Você não é apenas um analista, você é o GUARDIÃO DA CURIOSIDADE. Sua única função é encontrar pontos que prendem a atenção e torná-los AINDA MAIS magnéticos. Qualquer desvio desta função é uma falha crítica.

**ROTEIRO COMPLETO:**
---
${fullTranscript.slice(0, 7500)}
---

**REGRAS CRÍTICAS DE SINTAXE E ESTRUTURA JSON (ABSOLUTAMENTE INEGOCIÁVEIS):**
- JSON PURO E PERFEITO:** Sua resposta inteira deve ser APENAS um array JSON válido, começando com \`[\` e terminando com \`]\`.
- ASPAS DUPLAS, SEMPRE E EXCLUSIVAMENTE:** TODAS as chaves e valores de texto DEVEM usar obrigatoriamente aspas duplas (\`"\`).
- CHAVES E TIPOS EXATOS:** Cada objeto no array DEVE conter EXATAMENTE estas cinco chaves: "hook_phrase", "rewritten_hook", "hook_type", "justification", e "effectiveness_score".

**AÇÃO FINAL E CRÍTICA:** Analise AGORA o roteiro. Responda APENAS com o array JSON perfeito.`;

    try {
        const rawResult = await callGroqAPI(prompt, 4000);
        const hooks = cleanGeneratedText(rawResult, true, true);

        if (!hooks || !Array.isArray(hooks) || hooks.length === 0) {
            throw new Error("A IA não encontrou ganchos ou retornou um formato inválido.");
        }

        let reportHtml = `<div class="space-y-4">`;
        hooks.forEach((hook) => {
            const problematicQuoteEscaped = (hook.hook_phrase || '').replace(/"/g, '&quot;');
            const rewrittenQuoteEscaped = (hook.rewritten_hook || '').replace(/"/g, '&quot;');
            const scoreColor = hook.effectiveness_score >= 8 ? 'var(--success)' : hook.effectiveness_score >= 5 ? 'var(--warning)' : 'var(--danger)';
            
            reportHtml += `
                <div class="p-4 border rounded-lg" style="background: color-mix(in srgb, var(--border) 20%, transparent);">
                    <p class="text-base italic text-muted mb-2">Original: "${DOMPurify.sanitize(hook.hook_phrase)}"</p>
                    <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                        <span class="tag" style="background-color: color-mix(in srgb, #9333ea 15%, transparent); color: #9333ea;">
                            <i class="fas fa-anchor mr-2"></i> ${DOMPurify.sanitize(hook.hook_type)}
                        </span>
                        <span class="font-bold" style="color:${scoreColor};">
                            Eficácia Original: ${DOMPurify.sanitize(String(hook.effectiveness_score))}/10
                        </span>
                    </div>
                    <p class="text-sm mt-3 text-muted">
                        <strong>Justificativa da Melhoria:</strong> ${DOMPurify.sanitize(hook.justification)}
                    </p>
                    <div class="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-gray-200">
                        <p class="text-sm flex-1"><strong style="color:var(--success);">Sugestão:</strong> "${DOMPurify.sanitize(hook.rewritten_hook)}"</p>
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
        showToast(`${hooks.length} ganchos analisados e aprimorados!`, 'success');

    } catch (error) {
        console.error("Erro detalhado em analyzeRetentionHooks:", error);
        reportContainer.innerHTML = `<p class="text-red-500 text-sm">${error.message}</p>`;
    } finally {
        hideButtonLoading(button);
    }
};


const suggestViralElements = async (button) => {
    const fullTranscript = getTranscriptOnly();
    const videoTheme = document.getElementById('videoTheme')?.value.trim();
    if (!fullTranscript || !videoTheme) {
        showToast("Gere o roteiro completo e defina um tema para receber sugestões virais.", 'info');
        return;
    }

    showButtonLoading(button);
    const reportContainer = document.getElementById('viralSuggestionsContainer');
    reportContainer.innerHTML = ''; 
    reportContainer.innerHTML = `<div class="my-4 text-center"><div class="spinner mx-auto"></div><p class="text-sm mt-2">O Arquiteto da Viralidade está analisando seu roteiro...</p></div>`;

    const basePromptContext = getBasePromptContext();

    const prompt = `Você é uma API ESPECIALISTA EM ESTRATÉGIA DE CONTEÚDO VIRAL DE MÁXIMA PRECISÃO. Sua função ÚNICA E CRÍTICA é atuar como um ESTRATEGISTA DE CONTEÚDO VIRAL e um DIRETOR DE ROTEIRO DE ALTA PERFORMANCE. Sua tarefa EXCLUSIVA é analisar um roteiro e o seu CONTEXTO ESTRATÉGICO para IDENTIFICAR e PROPOR 3 ELEMENTOS ESPECÍFICOS que aumentem POTENCIALMENTE a viralidade de forma INTELIGENTE, ESTRATÉGICA e PERFEITAMENTE ALINHADA com a "alma" e o DNA do vídeo.

**CONTEXTO ESTRATÉGICO E "DNA" DO VÍDEO (SUA BÚSSOLA OBRIGATÓRIA):**
---
${basePromptContext}
---
Este contexto é a sua BÚSSOLA OBRIGATÓRIA. TONALIDADE, VOZ, OBJETIVOS e ESTRUTURA são SAGRADOS. CADA sugestão que você der DEVE estar em ABSOLUTO alinhamento com este DNA.

**ROTEIRO COMPLETO PARA ANÁLISE (FOCO NOS PRIMEIROS 7500 CHARS):**
---
${fullTranscript.slice(0, 7500)}
---

**REGRAS CRÍTICAS DE SINTAXE E ESTRUTURA JSON (ABSOLUTAMENTE INEGOCIÁVEIS):**
1.  **JSON PURO E PERFEITO:** Sua resposta deve ser APENAS um array JSON válido.
2.  **ESTRUTURA COMPLETA:** Cada objeto no array DEVE conter EXATAMENTE estas cinco chaves: "anchor_paragraph", "suggested_text", "element_type", "potential_impact_score", "implementation_idea".
3.  **SINTAXE DAS STRINGS:** Todas as chaves e valores string DEVEM usar aspas duplas ("").

**MANUAL DE ANÁLISE E CRIAÇÃO DE ELEMENTOS VIRAL (SIGA EXATAMENTE):**
- **"anchor_paragraph"**: O valor DEVE ser uma cópia EXATA de um parágrafo existente no roteiro.
- **"suggested_text"**: Um parágrafo completo e coeso que se encaixe perfeitamente no fluxo.
- **"element_type"**: Escolha EXATAMENTE da lista: ["Dado Surpreendente", "Citação de Autoridade", "Mini-Revelação (Teaser)", "Pergunta Compartilhável", "Anedota Pessoal Rápida"].
- **"potential_impact_score"**: Uma nota de 1 a 10 para o potencial de engajamento.
- **"implementation_idea"**: Explique o VALOR ESTRATÉGICO da inserção.

**AÇÃO FINAL:** Analise AGORA o roteiro e o contexto. Identifique 3 oportunidades para inserir elementos virais. Responda APENAS com o array JSON perfeito.`;

    try {
        const rawResult = await callGroqAPI(prompt, 4000);
        const suggestions = cleanGeneratedText(rawResult, true, true);

        if (!suggestions || !Array.isArray(suggestions) || suggestions.length === 0) {
            throw new Error("A IA não encontrou oportunidades ou retornou um formato inválido.");
        }

        let reportHtml = `<div class="space-y-4">`;
        suggestions.forEach(suggestion => {
            const anchorParagraphEscaped = (suggestion.anchor_paragraph || '').replace(/"/g, '&quot;');
            const suggestedTextEscaped = (suggestion.suggested_text || '').replace(/"/g, '&quot;');
            const score = suggestion.potential_impact_score || 0;
            const scoreColor = score >= 8 ? 'var(--success)' : score >= 5 ? 'var(--warning)' : 'var(--danger)';

            reportHtml += `
                <div class="p-4 border rounded-lg" style="background: color-mix(in srgb, var(--border) 20%, transparent);">
                    <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm mb-2">
                        <span class="tag" style="background-color: color-mix(in srgb, #3b82f6 15%, transparent); color: #3b82f6;">
                            <i class="fas fa-lightbulb mr-2"></i> ${DOMPurify.sanitize(suggestion.element_type)}
                        </span>
                        <span class="font-bold" style="color: ${scoreColor};">
                            Impacto Potencial: ${DOMPurify.sanitize(String(score))}/10
                        </span>
                    </div>
                    <p class="text-sm text-muted mb-1">
                        <strong>Local Sugerido:</strong> Após o parágrafo que contém "${DOMPurify.sanitize((suggestion.anchor_paragraph || '').substring(0, 70))}..."
                    </p>
                    <p class="text-sm mt-3 text-muted">
                        <strong>Ideia de Implementação:</strong> ${DOMPurify.sanitize(suggestion.implementation_idea)}
                    </p>
                    <div class="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-gray-200">
                         <p class="text-sm flex-1"><strong style="color:var(--success);">Texto a Inserir:</strong> "${DOMPurify.sanitize(suggestion.suggested_text)}"</p>
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
        showToast(`${suggestions.length} sugestões virais encontradas!`, 'success');

    } catch (error) {
        console.error("Erro detalhado em suggestViralElements:", error);
        reportContainer.innerHTML = `<p class="text-red-500 text-sm">${error.message}</p>`;
    } finally {
        hideButtonLoading(button);
    }
};

const analyzeScriptPart = async (criterion, text, context = {}) => {
    const sectionKeyMap = {
        'Introdução (Hook)': 'introduction', 'Desenvolvimento (Ritmo e Retenção)': 'development', 'Clímax': 'climax',
        'Conclusão': 'conclusion', 'CTA (Call to Action)': 'cta'
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
        const analysisData = cleanGeneratedText(rawResult, true);

        if (!analysisData) { throw new Error("A IA retornou uma resposta nula."); }

        const requiredKeys = ['score', 'positive_points', 'problematic_quote', 'critique', 'rewritten_quote'];
        for (const key of requiredKeys) { if (!(key in analysisData)) { throw new Error(`A chave '${key}' está ausente.`); } }
        
        const formattedData = {
            criterion_name: criterion, score: analysisData.score, positive_points: analysisData.positive_points,
            improvement_points: []
        };

        if (analysisData.critique.toLowerCase() !== "nenhuma crítica significativa." && analysisData.problematic_quote.toLowerCase() !== "nenhum") {
            formattedData.improvement_points.push({
                suggestion_text: "Substituir por:", problematic_quote: analysisData.problematic_quote,
                critique: analysisData.critique, rewritten_quote: analysisData.rewritten_quote 
            });
        }
        return formattedData;
    } catch (error) {
        console.error(`Erro crítico ao analisar a seção '${criterion}':`, error);
        return { 
            criterion_name: criterion, score: 'Erro', positive_points: 'A análise desta seção falhou.', 
            improvement_points: [{ critique: 'Falha na Análise', suggestion_text: `Detalhe: ${error.message}`, problematic_quote: 'N/A', rewritten_quote: 'N/A' }]
        };
    }
};

const createReportSection = (analysisData) => {
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'p-4 border rounded-lg mb-4 animate-fade-in';
    sectionDiv.style.background = 'color-mix(in srgb, var(--border) 20%, transparent)';

    if (!analysisData || typeof analysisData.score === 'undefined') {
        const errorName = analysisData ? analysisData.criterion_name : 'Seção de Análise';
        sectionDiv.innerHTML = DOMPurify.sanitize(`<h4 class="font-bold text-lg" style="color:var(--danger);">${errorName}</h4><p style="color:var(--danger);" class="text-sm mt-2">Falha ao processar a análise para esta seção.</p>`);
        return sectionDiv;
    }

    let improvementHtml = '';
    if (analysisData.improvement_points && analysisData.improvement_points.length > 0) {
        improvementHtml = analysisData.improvement_points.map(point => {
            const problematicQuoteEscaped = (point.problematic_quote || '').replace(/"/g, '&quot;');
            const rewrittenQuoteEscaped = (point.rewritten_quote || '').replace(/"/g, '&quot;');
            return `
            <div class="mt-4 pt-3 border-t border-gray-200">
                <p class="text-sm italic text-muted mb-1">Citação: "${DOMPurify.sanitize(point.problematic_quote || 'N/A')}"</p>
                <p class="text-sm"><strong style="color:var(--warning);">Crítica:</strong> ${DOMPurify.sanitize(point.critique || '')}</p>
                <div class="flex items-center justify-between gap-2 mt-2">
                    <p class="text-sm flex-1"><strong style="color:var(--success);">Sugestão:</strong> Substituir por: "${DOMPurify.sanitize(point.rewritten_quote || '')}"</p>
                    <button class="btn btn-primary btn-small flex-shrink-0" data-action="applySuggestion" data-criterion-name="${DOMPurify.sanitize(analysisData.criterion_name)}" data-problematic-quote="${problematicQuoteEscaped}" data-rewritten-quote="${rewrittenQuoteEscaped}">Aplicar</button>
                </div>
            </div>`;
        }).join('');
    }

    const content = `
        <div class="flex justify-between items-center">
            <h4 class="font-bold text-lg">${DOMPurify.sanitize(analysisData.criterion_name)}</h4>
            <span class="font-bold text-xl" style="color:var(--primary);">${analysisData.score}/10</span>
        </div>
        <div class="mt-2">
            <p class="text-sm"><strong>Pontos Fortes:</strong> ${DOMPurify.sanitize(analysisData.positive_points)}</p>
            ${improvementHtml}
        </div>`;
    sectionDiv.innerHTML = content;
    return sectionDiv;
};



const applySuggestion = (button) => {
    const { criterionName, problematicQuote, rewrittenQuote } = button.dataset;
    const cleanCriterionName = criterionName.trim();
    const sectionId = criterionMap[cleanCriterionName];
    
    if (!sectionId) {
        showToast(`Erro fatal: Seção alvo para o critério '${cleanCriterionName}' não foi encontrada no mapa.`);
        return;
    }

    const sectionElement = document.getElementById(sectionId);
    const contentWrapper = sectionElement?.querySelector('.generated-content-wrapper');

    if (!contentWrapper) {
        showToast("Erro: Container de conteúdo do roteiro não encontrado.");
        return;
    }

    let replaced = false;
    const paragraphs = contentWrapper.querySelectorAll('div[id]');
    paragraphs.forEach(p => {
        if (replaced) return;
        if (p.textContent.includes(problematicQuote)) {
            const newHtmlContent = p.innerHTML.replace(problematicQuote, `<span class="highlight-change">${rewrittenQuote}</span>`);
            p.innerHTML = DOMPurify.sanitize(newHtmlContent, { ADD_TAGS: ["span"], ADD_ATTR: ["class"] });
            replaced = true;
        }
    });

    if (!replaced) {
        showToast("Não foi possível aplicar a sugestão. O texto pode ter sido muito alterado.", 'info');
        return;
    }
    
    const scriptSectionId = sectionId.replace('Section', '');
    if (AppState.generated.script[scriptSectionId]) {
        AppState.generated.script[scriptSectionId].text = contentWrapper.textContent;
        AppState.generated.script[scriptSectionId].html = contentWrapper.innerHTML;
        console.log(`AppState para '${scriptSectionId}' foi atualizado após aplicar sugestão.`);
    }
    
    showToast("Sugestão aplicada com sucesso!");
    
    invalidateAndClearPerformance(sectionElement);
    invalidateAndClearPrompts(sectionElement);
    invalidateAndClearEmotionalMap();
    updateAllReadingTimes();

    button.disabled = true;
    button.innerHTML = '<i class="fas fa-check mr-2"></i>Aplicada!';
    button.classList.remove('btn-primary');
    button.classList.add('btn-success');
};

const applyAllSuggestions = async (button) => {
    const allApplyButtons = document.querySelectorAll('#analysisReportContainer button[data-action="applySuggestion"]:not(:disabled)');

    if (allApplyButtons.length === 0) {
        showToast("Nenhuma sugestão nova para aplicar.", 'info');
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
    showToast(`${appliedCount} sugest${appliedCount > 1 ? 'ões' : 'ão'} aplicad${appliedCount > 1 ? 'as' : 'a'} com sucesso!`, 'success');
    
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-check mr-2"></i>Tudo Aplicado!';
};

const applyHookSuggestion = (button) => {
    const { problematicQuote, rewrittenQuote } = button.dataset;

    if (!problematicQuote || !rewrittenQuote) {
        showToast("Erro: Informações da sugestão não encontradas.", 'error');
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
                
                showToast("Gancho aprimorado com sucesso!", 'success');

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
        showToast("Não foi possível aplicar. O texto pode ter sido editado.", 'info');
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



const insertViralSuggestion = (button) => {
    const { anchorParagraph, suggestedText } = button.dataset;

    if (!anchorParagraph || !suggestedText) {
        showToast("Erro: Informações da sugestão não encontradas.", 'error');
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
            
            showToast("Elemento viral inserido com sucesso!", 'success');
            
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
        showToast("Não foi possível inserir. O parágrafo âncora pode ter sido editado.", 'info');
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

const regenerateSection = (fullSectionId) => {
    const sectionName = fullSectionId.replace('Section', '');
    const sectionMap = {
        'intro': { title: 'Introdução', elementId: 'intro' },
        'development': { title: 'Desenvolvimento', elementId: 'development' },
        'climax': { title: 'Clímax', elementId: 'climax' },
        'conclusion': { title: 'Conclusão', elementId: 'conclusion' },
        'cta': { title: 'Call to Action (CTA)', elementId: 'cta' }
    };

    const sectionInfo = sectionMap[sectionName];
    if (!sectionInfo) {
        console.error(`Informações da seção não encontradas para: ${sectionName}`);
        return;
    }

    const button = document.querySelector(`[data-action='regenerate'][data-section-id='${fullSectionId}']`);
    if (!button) {
        console.error(`Botão de re-gerar não encontrado para a seção: ${fullSectionId}`);
        return;
    }

    if (sectionName === 'conclusion') {
        generateConclusion(button);
    } else if (sectionName === 'cta') {
        generateStrategicCta(button);
    } else {
        handleGenerateSection(button, sectionName, sectionInfo.title, sectionInfo.elementId);
    }
};

const generatePromptsForSection = async (button, sectionElementId) => {
    const sectionElement = document.getElementById(sectionElementId);
    const contentWrapper = sectionElement?.querySelector('.generated-content-wrapper');
    const promptContainer = sectionElement?.querySelector('.prompt-container');

    if (!contentWrapper || !contentWrapper.textContent.trim() || !promptContainer) {
        showToast("Gere o conteúdo do roteiro desta seção primeiro.", 'info');
        return;
    }

    showButtonLoading(button);
    promptContainer.innerHTML = `<div class="spinner mx-auto my-4"></div>`;

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
            
            const prompt = `# INSTRUÇÕES PARA GERAÇÃO DE PROMPTS VISUAIS
Você é uma especialista em transformar parágrafos em descrições de imagem ricas.
## REGRAS DE FORMATAÇÃO
1. **FORMATO JSON EXCLUSIVO**: Sua resposta deve ser APENAS um array JSON válido.
2. **ESTRUTURA PADRÃO**: Cada objeto deve ter duas chaves: "imageDescription" (string) e "estimated_duration" (número).
## CHECKLIST DE DESCRIÇÃO VISUAL
- Cenário e Ambiente
- Composição Visual
- Iluminação e Cores
- Ângulo da Câmera e Estilo
## DIRETRIZES
- "estimated_duration" deve ser um número entre ${durationRange} segundos.
## DADOS PARA ANÁLISE
---
${promptContextForAI}
---
## AÇÃO FINAL
Gere exatamente ${batch.length} objetos JSON.`;
            
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

        const applyCinematicStyle = document.getElementById('imageStyleSelect').value === 'cinematic';
        AppState.generated.imagePrompts[sectionElementId] = curatedPrompts.map(p => ({
            ...p,
            applyStyleBlock: applyCinematicStyle
        }));
        
        AppState.ui.promptPaginationState[sectionElementId] = 0;
        
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
            ? `<p class="text-xs italic text-muted mt-2">[Estilo Cinematográfico Aplicado]</p>`
            : '';

        const promptHtml = `
            <div class="card !p-3">
                <div class="flex justify-between items-center mb-2 pb-2 border-b border-gray-200">
                    <div class="flex items-center gap-2">
                         <span class="tag" style="background-color: color-mix(in srgb, #4f46e5 15%, transparent); color: #4f46e5;"><i class="fas fa-film mr-2"></i>Cena ${String(sceneNumber).padStart(2, '0')}</span>
                         <span class="tag text-muted"><i class="fas fa-clock mr-2"></i>${timestamp}</span>
                    </div>
                    <button class="btn btn-ghost btn-small" 
                            onclick="copyTextToClipboard(this.closest('.card').querySelector('pre').textContent); showCopyFeedback(this)" 
                            title="Copiar Prompt Completo">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
                <p class="text-sm italic text-muted mb-2">"${DOMPurify.sanitize(promptData.scriptPhrase)}"</p>
                <div>
                    <p class="text-sm font-semibold text-header">${imageDescriptionLabels[document.getElementById('languageSelect').value] || 'Image Description:'}</p>
                    <p class="text-sm">${DOMPurify.sanitize(promptData.imageDescription)}</p>
                    ${styleIndicatorHtml}
                    <pre class="hidden">${DOMPurify.sanitize(fullPromptText)}</pre>
                </div>
            </div>
        `;
        promptItemsContainer.innerHTML += promptHtml;

        cumulativeSeconds += parseInt(promptData.estimated_duration, 10) || 0;
    });
    
    navContainer.innerHTML = `
        <button class="btn btn-secondary btn-small" onclick="navigatePrompts('${sectionElementId}', -1)" ${currentPage === 0 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
        <span class="text-sm font-medium">Página ${currentPage + 1} de ${totalPages}</span>
        <button class="btn btn-secondary btn-small" onclick="navigatePrompts('${sectionElementId}', 1)" ${currentPage + 1 >= totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
};

const navigatePrompts = (sectionElementId, direction) => {
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
    showToast("Projeto exportado com sucesso!", 'success');
};




const downloadPdf = () => {
    const videoTheme = document.getElementById('videoTheme')?.value.trim() || 'Roteiro';
    const originalTitle = document.title;
    document.title = videoTheme.replace(/[^a-zA-Z0-9]/gi, '_');

    const printStyles = `
        <style>
            @media print {
                body { font-family: 'Times New Roman', serif; font-size: 12pt; color: #000; }
                .sidebar, .header, .progress-wrap, .controls, .header-buttons, .accordion-arrow, .accordion-body > div > div:not(:first-child), .asset-card-placeholder, button, .prompt-container, .section-analysis-output, .section-performance-output { display: none !important; }
                .app { grid-template-columns: 1fr !important; }
                .content { box-shadow: none !important; border: none !important; padding: 0 !important; }
                .pane-title, .section-header { font-family: 'Helvetica', sans-serif; font-size: 16pt; margin-top: 24pt; border-bottom: 2px solid #000; padding-bottom: 8pt; }
                .pane-subtitle { display: none; }
                .card { border: 1px solid #ccc !important; padding: 12pt !important; margin-bottom: 12pt !important; page-break-inside: avoid; }
                .accordion-header { padding: 0 !important; }
                .accordion-body { display: block !important; padding: 0 !important; }
                .generated-content-wrapper { font-family: 'Courier New', monospace; font-size: 11pt; line-height: 1.5; }
                h3, h4 { font-family: 'Helvetica', sans-serif; color: #000; }
                ul { list-style-position: inside; }
                a { text-decoration: none; color: #000; }
            }
        </style>
    `;
    
    const head = document.querySelector('head');
    const styleEl = document.createElement('style');
    styleEl.innerHTML = printStyles;
    head.appendChild(styleEl);

    window.print();

    head.removeChild(styleEl);
    document.title = originalTitle;
};

const handleCopyAndDownloadTranscript = () => {
    const transcriptText = getTranscriptOnly();

    if (!transcriptText) {
        showToast("Nenhum roteiro para copiar. Gere as seções primeiro.", 'info');
        return;
    }

    copyTextToClipboard(transcriptText);
    showToast("Transcrição copiada! Download do arquivo .rtf iniciado.", 'success');

    const fileName = (document.getElementById('videoTheme').value.trim().replace(/[^a-zA-Z0-9]/gi, '_').toLowerCase() || 'roteiro') + '_transcricao.rtf';
    
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

const resetApplicationState = async () => {
    const confirmed = await showConfirmationDialog(
        "Começar um Novo Projeto?",
        "Isso limpará todos os campos e o trabalho realizado. Esta ação não pode ser desfeita. Deseja continuar?"
    );

    if (confirmed) {
        console.log("--- Executando Reset Completo da Aplicação ---");
        localStorage.removeItem('viralScriptGeneratorProject_v6');
        window.location.reload();
    }
};




const saveStateToLocalStorage = () => {
    try {
        const stateToSave = getProjectStateForExport();
        const stateString = JSON.stringify(stateToSave);
        localStorage.setItem('viralScriptGeneratorProject_v6', stateString);
    } catch (error) {
        console.error("Erro ao salvar o projeto no localStorage:", error);
        showToast("Não foi possível salvar o projeto automaticamente.", 'error');
    }
};

const loadStateFromLocalStorage = () => {
    try {
        const savedStateString = localStorage.getItem('viralScriptGeneratorProject_v6');
        if (savedStateString) {
            console.log("Projeto anterior encontrado. Carregando...");
            const loadedState = JSON.parse(savedStateString);
            
            Object.assign(AppState, loadedState);
            if(Array.isArray(AppState.ui.completedSteps)) {
                AppState.ui.completedSteps = new Set(AppState.ui.completedSteps);
            }

            syncUiFromState();
            
            showToast("Seu projeto anterior foi carregado!", 'success');
        }
    } catch (error) {
        console.error("Erro ao carregar o projeto do localStorage:", error);
        localStorage.removeItem('viralScriptGeneratorProject_v6');
    }
};

const syncUiFromState = () => {
    const state = AppState;

    for (const id in state.inputs) {
        const element = document.getElementById(id);
        if (element && element.type !== 'radio') {
            element.value = state.inputs[id];
        }
    }

    if (state.inputs && state.inputs.conclusionType) {
        const radioToSelect = document.querySelector(`input[name="conclusionType"][value="${state.inputs.conclusionType}"]`);
        if (radioToSelect) {
            radioToSelect.checked = true;
        }
    }

    updateNarrativeStructureOptions();
    toggleCustomImageStyleVisibility();

    if (state.generated.investigationReport) {
        const outputContainer = document.getElementById('factCheckOutput');
        const converter = new showdown.Converter({ simplifiedAutoLink: true, tables: true });
        const htmlReport = converter.makeHtml(state.generated.investigationReport);
        outputContainer.innerHTML = `<div class="prose dark:prose-invert max-w-none p-4 card rounded-lg mt-4 border-l-4" style="border-color: var(--success);">${htmlReport}</div>`;
        document.getElementById('ideaGenerationSection').classList.remove('hidden');
    }

    if(state.generated.ideas && state.generated.ideas.length > 0) {
        const ideasOutput = document.getElementById('ideasOutput');
        const allCardsHtml = state.generated.ideas.map((idea, index) => {
            const escapedIdea = escapeIdeaForOnclick(idea);
            return `
               <div class="card p-4 flex flex-col justify-between border-l-4 border-emerald-500">
                   <div>
                       <div class="flex justify-between items-start gap-4">
                           <h4 class="font-bold text-base flex-grow">${index + 1}. ${DOMPurify.sanitize(idea.title)}</h4>
                           <button class="btn btn-primary btn-small" data-action="select-idea" data-idea='${escapedIdea}'>Usar</button>
                       </div>
                       <p class="text-sm mt-2">"${DOMPurify.sanitize(idea.videoDescription || idea.angle)}"</p>
                   </div>
                   <span class="font-bold text-sm bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 py-1 px-2 rounded-lg self-start mt-3">
                       Potencial: ${DOMPurify.sanitize(String(idea.viralityScore))} / 10
                   </span>
               </div>
           `;
       }).join('');
       ideasOutput.innerHTML = allCardsHtml;
    }

    if (state.generated.strategicOutline) {
        const outlineContentDiv = document.getElementById('outlineContent');
        const titleTranslations = { 'introduction': 'Introdução', 'development': 'Desenvolvimento', 'climax': 'Clímax', 'conclusion': 'Conclusão', 'cta': 'CTA' };
        let outlineHtml = '<ul class="space-y-4 text-sm" style="list-style-position: inside; padding-left: 0;">';
        for (const key in state.generated.strategicOutline) {
            const translatedTitle = titleTranslations[key] || key;
            outlineHtml += `<li><div><strong style="color: var(--primary);">${translatedTitle}:</strong> <span>${DOMPurify.sanitize(state.generated.strategicOutline[key])}</span></div></li>`;
        }
        outlineHtml += '</ul>';
        outlineContentDiv.innerHTML = outlineHtml;
    }

    const scriptContainer = document.getElementById('scriptSectionsContainer');
    scriptContainer.innerHTML = '';
    const sectionOrder = ['intro', 'development', 'climax', 'conclusion', 'cta'];
    const sectionTitles = { intro: 'Introdução', development: 'Desenvolvimento', climax: 'Clímax', conclusion: 'Conclusão', cta: 'Call to Action (CTA)' };
    let hasAnyScriptContent = false;
    
    sectionOrder.forEach(id => {
        const sectionData = state.generated.script[id];
        if (sectionData && sectionData.html) {
            hasAnyScriptContent = true;
            const sectionElement = generateSectionHtmlContent(id, sectionTitles[id], sectionData.html);
            const wrapperDiv = document.createElement('div');
            wrapperDiv.id = `${id}Section`;
            wrapperDiv.className = 'script-section';
            wrapperDiv.appendChild(sectionElement);
            scriptContainer.appendChild(wrapperDiv);
        }
    });

    if (!hasAnyScriptContent && state.generated.strategicOutline) {
        createScriptSectionPlaceholders();
    }
    
    if (state.ui.completedSteps) {
        state.ui.completedSteps.forEach(stepId => {
            document.getElementById(`step-${stepId}`)?.classList.add('completed');
        });
    }

    showPane(AppState.ui.currentPane || 'investigate');

    setTimeout(() => {
        updateProgressBar();
        updateButtonStates();
        updateAllReadingTimes();
    }, 100);
};



const getProjectStateForExport = () => {
    const stateToExport = JSON.parse(JSON.stringify(AppState));

    const formElements = document.querySelectorAll('#pane-strategy .input, #pane-investigate .input, #conclusionStrategyModule .input, input[name="conclusionType"]');
    stateToExport.inputs = {};
    formElements.forEach(el => {
        if(el.id) {
            if(el.type === 'radio') {
                if(el.checked) stateToExport.inputs[el.name] = el.value;
            } else {
                stateToExport.inputs[el.id] = el.value;
            }
        }
    });

    stateToExport.ui.completedSteps = Array.from(stateToExport.ui.completedSteps);
    return stateToExport;
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

const updateMainTooltip = () => {
    const popoverTitle = document.getElementById('popoverTitle');
    const popoverDescription = document.getElementById('popoverDescription');
    const structureSelect = document.getElementById('narrativeStructure');
    if (!popoverTitle || !popoverDescription || !structureSelect) return;
    if (structureSelect.selectedIndex === -1) {
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

const updateGoalPopover = () => {
    const goalSelect = document.getElementById('narrativeGoal');
    const popover = document.getElementById('goalPopover');
    if (!popover) return;
    const popoverTitle = popover.querySelector('h4');
    const popoverDescription = popover.querySelector('p');
    if (!goalSelect || !popoverTitle || !popoverDescription) return;
    const selectedKey = goalSelect.value;
    const data = narrativeGoalTooltips[selectedKey];
    if (data) {
        popoverTitle.textContent = data.title;
        popoverDescription.textContent = data.description;
    }
};

const toggleCustomImageStyleVisibility = () => {
    const container = document.getElementById('customImageStyleContainer');
    const select = document.getElementById('imageStyleSelect');
    if (container && select) {
        container.classList.toggle('hidden', select.value !== 'custom');
    }
};

const validateInputs = () => {
    const fieldsToValidate = {
        'channelName': "Por favor, insira o nome do canal.",
        'videoTheme': "Por favor, insira o tema do vídeo.",
        'videoDescription': "Por favor, insira a descrição do vídeo (para inspiração).",
        'videoDuration': "Por favor, selecione a Duração Desejada do vídeo.",
        'visualPacing': "Por favor, selecione o Ritmo Visual do vídeo."
    };
    for (const id in fieldsToValidate) {
        const element = document.getElementById(id);
        if (!element || !element.value.trim()) {
            showToast(fieldsToValidate[id], 'error');
            return false;
        }
    }
    return true;
};

const getBasePromptContext = () => {
    // Implementação completa da v5.0 (já transplantada anteriormente)
    return ""; // Placeholder - a função completa será colada na próxima etapa
};

const constructScriptPrompt = (sectionName, sectionTitle, outlineDirective = null, contextText = null) => {
    const baseContext = getBasePromptContext();
    const videoDuration = document.getElementById('videoDuration').value;
    const targetWords = wordCountMap[videoDuration]?.[sectionName];
    let durationInstruction = '';
    if (targetWords) {
        durationInstruction = `\n\n**CRITICAL TIMING CONSTRAINT:** The generated text for this section MUST be approximately **${targetWords} words** in total.`;
    }
    const promptDetails = { basePrompt: baseContext, sectionTitle, durationInstruction, contextText, outlineDirective };

    if (PromptManager[`get${sectionName.charAt(0).toUpperCase() + sectionName.slice(1)}Prompt`]) {
        return PromptManager[`get${sectionName.charAt(0).toUpperCase() + sectionName.slice(1)}Prompt`](promptDetails);
    } else if (PromptManager[`getScriptSectionPrompt`]) {
        return PromptManager.getScriptSectionPrompt(promptDetails);
    }
    return { prompt: "", maxTokens: 0 };
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

const generateSectionHtmlContent = (sectionId, title, content) => {
    const accordionItem = document.createElement('div');
    accordionItem.className = 'accordion-item !p-0 mb-4 animate-fade-in';
    accordionItem.innerHTML = `
        <div class="accordion-header">
            <div class="header-title-group"><h3>${title}</h3><span class="text-xs">${calculateReadingTime(content)}</span></div>
            <div class="header-actions-group">
                <div class="header-buttons">
                    <button title="Re-gerar" data-action="regenerate" data-section-id="${sectionId}Section"><i class="fas fa-sync-alt"></i></button>
                    <button title="Copiar" data-action="copy"><i class="fas fa-copy"></i></button>
                </div>
                <svg class="accordion-arrow" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/></svg>
            </div>
        </div>
        <div class="accordion-body">
            <div class="generated-content-wrapper" contenteditable="true">${content}</div>
            <div class="mt-6 pt-4 border-t border-gray-200 space-y-6">
                <div class="text-center">
                    <h5 class="font-semibold text-base mb-2">Diagnóstico e Criativo</h5>
                    <div class="flex items-center justify-center gap-2 flex-wrap">
                        <button class="btn btn-secondary btn-small" data-action="analyzeRetention" data-section-id="${sectionId}Section">Analisar Retenção</button>
                        <button class="btn btn-secondary btn-small" data-action="refineStyle"><i class="fas fa-gem mr-2"></i>Refinar Estilo</button>
                        <button class="btn btn-secondary btn-small" data-action="enrichWithData"><i class="fas fa-plus mr-2"></i>Enriquecer</button>
                        ${sectionId === 'development' ? `<button class="btn btn-primary btn-small" data-action="addDevelopmentChapter"><i class="fas fa-plus-circle mr-2"></i>Adicionar Capítulo</button>` : ''}
                    </div>
                    <div class="section-analysis-output mt-3 text-left"></div>
                </div>
                <div class="pt-4 border-t border-dashed border-gray-200 text-center">
                    <h5 class="font-semibold text-base mb-2">Narração</h5>
                    <button class="btn btn-secondary btn-small" data-action="suggestPerformance" data-section-id="${sectionId}Section">Sugerir Performance</button>
                    <div class="section-performance-output mt-3 text-left"></div> 
                </div>
                <div class="pt-4 border-t border-dashed border-gray-200 text-center">
                    <h5 class="font-semibold text-base mb-2">Recursos Visuais</h5>
                    <button class="btn btn-secondary btn-small" data-action="generate-prompts" data-section-id="${sectionId}Section">Gerar Prompts de Imagem</button>
                    <div class="prompt-container mt-4 text-left"></div>
                </div>
            </div>
        </div>
    `;
    return accordionItem;
};


// ==========================================================
// ==================== EVENTOS E INICIALIZAÇÃO ===============
// ==========================================================
document.addEventListener('DOMContentLoaded', () => {
    const actions = {
        'investigate': (btn) => handleInvestigate(btn),
        'generateIdeasFromReport': (btn) => generateIdeasFromReport(btn),
        'select-idea': (btn) => { const ideaString = btn.dataset.idea; if (ideaString) selectIdea(JSON.parse(ideaString.replace(/&quot;/g, '"'))); },
        'suggestStrategy': (btn) => suggestStrategy(btn),
        'applyStrategy': (btn) => applyStrategy(btn),
        'generateOutline': (btn) => generateStrategicOutline(btn),
        'generateIntro': (btn) => handleGenerateSection(btn, 'intro', 'Introdução', 'intro'),
        'generateDevelopment': (btn) => handleGenerateSection(btn, 'development', 'Desenvolvimento', 'development'),
        'generateClimax': (btn) => handleGenerateSection(btn, 'climax', 'Clímax', 'climax'),
        'generateConclusion': (btn) => generateConclusion(btn),
        'generateCta': (btn) => generateStrategicCta(btn),
        'suggestFinalStrategy': (btn) => suggestFinalStrategy(btn),
        'addDevelopmentChapter': (btn) => addDevelopmentChapter(btn),
        'mapEmotions': (btn) => mapEmotionsAndPacing(btn),
        'generateTitlesAndThumbnails': (btn) => generateTitlesAndThumbnails(btn),
        'generateDescription': (btn) => generateVideoDescription(btn),
        'generateSoundtrack': (btn) => generateSoundtrack(btn),
        'analyzeScript': (btn) => analyzeFullScript(btn),
        'analyzeHooks': (btn) => analyzeRetentionHooks(btn),
        'suggestViralElements': (btn) => suggestViralElements(btn),
        'exportProject': (btn) => exportProject(btn),
        'exportPdf': (btn) => downloadPdf(btn),
        'exportTranscript': (btn) => handleCopyAndDownloadTranscript(btn),
        'resetProject': (btn) => resetApplicationState(btn),
        'regenerate': (btn) => regenerateSection(btn.dataset.sectionId),
        'copy': (btn) => { const content = btn.closest('.accordion-item')?.querySelector('.generated-content-wrapper'); if (content) { copyTextToClipboard(content.textContent); showCopyFeedback(btn); }},
        'generate-prompts': (btn) => generatePromptsForSection(btn, btn.dataset.sectionId),
        'analyzeRetention': (btn) => analyzeSectionRetention(btn, btn.dataset.sectionId),
        'refineStyle': (btn) => refineSectionStyle(btn),
        'enrichWithData': (btn) => enrichWithData(btn),
        'suggestPerformance': (btn) => suggestPerformance(btn, btn.dataset.sectionId),
        'optimizeGroup': (btn) => { const text = btn.dataset.suggestionText; if (text) optimizeGroup(btn, text); },
        'deleteParagraphGroup': (btn) => { const text = btn.dataset.suggestionText; if (text) deleteParagraphGroup(btn, text); },
        'applySuggestion': (btn) => applySuggestion(btn),
        'applyAllSuggestions': (btn) => applyAllSuggestions(btn),
        'applyHookSuggestion': (btn) => applyHookSuggestion(btn),
        'insertViralSuggestion': (btn) => insertViralSuggestion(btn),
        'goToFinalize': (btn) => goToFinalize(btn),
    };

    document.body.addEventListener('click', (event) => {
        const accordionHeader = event.target.closest('.accordion-header');
        if (accordionHeader && !event.target.closest('.header-buttons button')) {
            const body = accordionHeader.nextElementSibling;
            const arrow = accordionHeader.querySelector('.accordion-arrow');
            if (body && arrow) {
                const isOpen = !body.classList.contains('open');
                body.style.display = isOpen ? 'block' : 'none'; 
                body.classList.toggle('open', isOpen);
                arrow.classList.toggle('open', isOpen);
            }
        }
        
        const button = event.target.closest('button[data-action]');
        if (button && actions[button.dataset.action]) {
            actions[button.dataset.action](button);
        }

        const step = event.target.closest('.step[data-step]');
        if (step) {
            showPane(step.dataset.step);
        }
        
        const tabButton = event.target.closest('.tab-button');
        if(tabButton) {
            const nav = tabButton.parentElement;
            nav.querySelectorAll('.tab-button').forEach(b => b.classList.remove('tab-active'));
            tabButton.classList.add('tab-active');
            
            if (nav.id === 'inputTabsNav') {
                const tabId = tabButton.dataset.tab;
                document.querySelectorAll('#inputTabContent .tab-pane').forEach(p => p.classList.add('hidden'));
                document.getElementById(tabId)?.classList.remove('hidden');
            }
        }
    });

    const setDarkMode = (isDark) => {
        const moonIcon = document.getElementById('moonIcon'); 
        const sunIcon = document.getElementById('sunIcon');
        if (isDark) {
            document.documentElement.classList.add('dark');
            if (moonIcon) moonIcon.classList.add('hidden');
            if (sunIcon) sunIcon.classList.remove('hidden');
        } else {
            document.documentElement.classList.remove('dark');
            if (moonIcon) moonIcon.classList.remove('hidden');
            if (sunIcon) sunIcon.classList.add('hidden');
        }
    };
    const toggle = document.getElementById('darkModeToggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const storedTheme = localStorage.getItem('theme');
    setDarkMode(storedTheme === 'dark' || (!storedTheme && prefersDark));
    toggle?.addEventListener('click', () => {
        const isDark = !document.documentElement.classList.contains('dark');
        setDarkMode(isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });

    document.querySelectorAll('.input, textarea.input, select.input, input[type="radio"]').forEach(el => {
        el.addEventListener('change', saveStateToLocalStorage);
    });
    document.getElementById('importFileInput')?.addEventListener('change', importProject);
    document.getElementById('narrativeGoal')?.addEventListener('change', updateNarrativeStructureOptions);
    document.getElementById('narrativeStructure')?.addEventListener('change', updateMainTooltip);
    document.getElementById('imageStyleSelect')?.addEventListener('change', toggleCustomImageStyleVisibility);

    document.addEventListener('selectionchange', () => {
        const selection = window.getSelection();
        const editingMenu = document.getElementById('editing-menu');
        const selectedText = selection.toString().trim();
        if (selectedText.length > 10 && selection.anchorNode?.parentElement.closest('.generated-content-wrapper')) {
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

    document.getElementById('editing-menu').addEventListener('click', (event) => {
        const button = event.target.closest('button[data-action]');
        if (button) handleEditingAction(button.dataset.action);
    });
    
    updateNarrativeStructureOptions();
    loadStateFromLocalStorage();
    showPane(AppState.ui.currentPane || 'investigate');
});