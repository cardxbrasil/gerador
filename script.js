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

// ==========================================================
// ==================== LÓGICA DO WIZARD UI ===================
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
        if (AppState.ui.currentPane) { // Evita o scroll na carga inicial
           activeStep.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    AppState.ui.currentPane = paneId;
    saveStateToLocalStorage();
};

const markStepCompleted = (stepId) => {
    const stepElement = document.getElementById(`step-${stepId}`);
    if (stepElement) {
        stepElement.classList.add('completed');
    }
    AppState.ui.completedSteps.add(stepId);
    updateProgressBar();
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
// ==================== FUNÇÕES UTILITÁRIAS ===================
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
    if (!text || typeof text !== 'string') return expectJson ? (arrayExpected ? [] : null) : '';
    if (!expectJson) return text.trim();
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
        let parsedResult = JSON.parse(jsonString);
        if (arrayExpected && !Array.isArray(parsedResult)) return [parsedResult];
        return parsedResult;
    } catch (initialError) {
        try {
            let repairedString = jsonString.replace(/,\s*([}\]])/g, '$1');
            let finalParsedResult = JSON.parse(repairedString);
            if (arrayExpected && !Array.isArray(finalParsedResult)) return [finalParsedResult];
            console.log("Cirurgia no JSON bem-sucedida!");
            return finalParsedResult;
        } catch (surgeryError) {
            console.error("FALHA CRÍTICA: Cirurgia no JSON falhou.", surgeryError.message, "JSON problemático:", jsonString);
            throw new Error(`A IA retornou um JSON com sintaxe inválida que não pôde ser corrigido.`);
        }
    }
};

const removeMetaComments = (text) => {
    if (!text) return "";
    return text
        .replace(/^\s*Here is the (generated|refined|final) text:[\s\n]*/i, '')
        .replace(/^\s*\*\*.*\*\*[\s\n]*/i, '')
        .replace(/^"""\s*/, '').replace(/\s*"""$/, '')
        .replace(/^```(json)?\s*/, '').replace(/\s*```$/, '')
        .trim();
};

const showConfirmationDialog = (title, message) => {
    return new Promise(resolve => {
        const overlay = document.getElementById('confirmationDialogOverlay');
        const titleEl = document.getElementById('confirmationTitle');
        const messageEl = document.getElementById('confirmationMessage');
        const btnYes = document.getElementById('confirmBtnYes');
        const btnNo = document.getElementById('confirmBtnNo');
        if (!overlay || !titleEl || !messageEl || !btnYes || !btnNo) {
            console.error("Elementos do pop-up de confirmação não encontrados.");
            resolve(false); return;
        }
        titleEl.textContent = title;
        messageEl.textContent = message;
        overlay.style.display = 'flex';
        const closeDialog = (result) => {
            overlay.style.display = 'none';
            btnYes.onclick = null; btnNo.onclick = null;
            resolve(result);
        };
        btnYes.onclick = () => closeDialog(true);
        btnNo.onclick = () => closeDialog(false);
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
            console.error("Elementos do pop-up de input não encontrados.");
            resolve(null); return;
        }
        suggestionsContainer.innerHTML = ''; fieldEl.value = '';
        titleEl.textContent = title; messageEl.textContent = message;
        labelEl.textContent = label; fieldEl.placeholder = placeholder;
        const closeDialog = (result) => {
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

const validateInputs = () => {
    // Lista de campos obrigatórios no painel de Estratégia
    const requiredFields = [
        { id: 'channelName', name: 'Nome do Canal' },
        { id: 'videoTheme', name: 'Tema do Vídeo' },
        { id: 'videoDescription', name: 'Descrição do Vídeo' },
        { id: 'videoDuration', name: 'Duração Desejada' },
        { id: 'visualPacing', name: 'Ritmo Visual' }
    ];

    for (const field of requiredFields) {
        const element = document.getElementById(field.id);
        if (!element || !element.value.trim()) {
            // Mostra a aba onde o erro está, se ela estiver escondida
            const pane = element.closest('.tab-pane');
            if(pane && pane.classList.contains('hidden')) {
                const tabButton = document.querySelector(`button[data-tab="${pane.id}"]`);
                if(tabButton) tabButton.click();
            }
            
            window.showToast(`Por favor, preencha o campo obrigatório: ${field.name}`, 'error');
            element.focus(); // Coloca o foco no campo que falta
            return false; // Interrompe a validação
        }
    }
    return true; // Todos os campos estão preenchidos
};

// ...outras funções utilitárias menores (da v5.0) podem ser coladas aqui...

// =========================================================================
// ==================== ESQUELETO DAS FUNÇÕES PRINCIPAIS ===================
// =========================================================================
// O código real de cada uma destas funções será transplantado no Passo 2.




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
    outputContainer.innerHTML = '<div class="asset-card-placeholder"><div class="loading-spinner"></div><span style="margin-left: 1rem;">Investigando... Nossos agentes estão na busca.</span></div>';

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
        
        // Usando as classes do novo layout para o relatório
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
// ====================  ===================
// =========================================================================


const generateIdeasFromReport = async (button) => {
    const factCheckOutput = document.getElementById('factCheckOutput');
    const { originalQuery, rawReport } = factCheckOutput.dataset;

    if (!rawReport || !originalQuery) {
        window.showToast("Erro: Relatório da investigação não encontrado.", 'error');
        return;
    }
    
    const activeTab = document.querySelector('#genreTabs .tab-button.tab-active');
    const genre = activeTab ? activeTab.dataset.genre : 'geral';
    const languageName = document.getElementById('languageSelect').value === 'pt-br' ? 'Português do Brasil' : 'English';
    
    const outputContainer = document.getElementById('ideasOutput');
    showButtonLoading(button);
    outputContainer.innerHTML = `<div class="md:col-span-2 flex flex-col items-center p-8"><div class="loading-spinner"></div><p class="mt-4" style="color: var(--text-muted);">Consultando especialista em ${genre}...</p></div>`;

    // Usaremos um prompt simplificado aqui, mas que exige o formato JSON correto.
    // A versão completa do PromptManager será transplantada depois.
    const prompt = `Baseado estritamente no relatório a seguir, gere um array JSON com 6 ideias para vídeos no gênero "${genre}".
    
    RELATÓRIO: "${rawReport}"
    
    REGRAS INEGOCIÁVEIS:
    1. A resposta DEVE ser APENAS um array JSON válido.
    2. Cada objeto no array deve ter as chaves: "title", "angle", "videoDescription", "targetAudience", e "viralityScore".
    3. TODO o texto DEVE estar em ${languageName}.`;

    try {
        const rawResult = await callGroqAPI(prompt, 4000);
        const ideas = cleanGeneratedText(rawResult, true, true); // Espera um array

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
                <div class="card p-4 flex flex-col justify-between border-l-4 ${colorClass} animate-fade-in" style="border-left-color: var(--${genreColorMap[genre]?.split('-')[1] || 'success'}) !important;">
                    <div>
                        <div class="flex justify-between items-start gap-4">
                            <h4 class="font-bold text-base flex-grow" style="color: var(--text-header);">${index + 1}. ${DOMPurify.sanitize(idea.title)}</h4>
                            <button class="btn btn-primary btn-small" data-action="select-idea" data-idea='${escapedIdea}'>Usar</button>
                        </div>
                        <p class="text-sm mt-2">"${DOMPurify.sanitize(idea.videoDescription || idea.angle)}"</p>
                    </div>
                    <span class="font-bold text-sm bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 py-1 px-2 rounded-lg self-start mt-3">Potencial: ${DOMPurify.sanitize(String(idea.viralityScore))} / 10</span>
                </div>
            `;
        }).join('');
        
        outputContainer.innerHTML = allCardsHtml;

        // Se gerou ideias com sucesso, consideramos a primeira etapa 100% concluída.
        markStepCompleted('investigate');

    } catch(err) {
        window.showToast(`Erro ao gerar ideias: ${err.message}`, 'error');
        outputContainer.innerHTML = `<p class="md:col-span-2" style="color: var(--danger);">${err.message}</p>`;
    } finally {
        hideButtonLoading(button);
    }
};


// =========================================================================
// ====================  ===================
// =========================================================================



const selectIdea = (idea) => {
    // 1. Preenche os campos principais na aba "Estratégia"
    const videoThemeEl = document.getElementById('videoTheme');
    if (videoThemeEl) videoThemeEl.value = idea.title || '';

    const videoDescEl = document.getElementById('videoDescription');
    if (videoDescEl) videoDescEl.value = idea.videoDescription || '';
    
    const targetAudienceEl = document.getElementById('targetAudience');
    if (targetAudienceEl) targetAudienceEl.value = idea.targetAudience || '';

    const narrativeThemeEl = document.getElementById('narrativeTheme');
    if (narrativeThemeEl) narrativeThemeEl.value = idea.angle || '';

    // 2. Limpa campos estratégicos opcionais para evitar confusão de uma ideia anterior
    const fieldsToClear = [
        'centralQuestion', 'emotionalHook', 'narrativeVoice', 
        'shockingEndingHook', 'researchData'
    ];
    fieldsToClear.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    
    // 3. Salva os novos valores no estado global
    AppState.inputs.videoTheme = idea.title || '';
    AppState.inputs.videoDescription = idea.videoDescription || '';
    // ... (poderíamos salvar todos, mas o save automático no 'change' já vai cuidar disso)

    // 4. Navega para a próxima etapa do Wizard
    window.showToast("Ideia selecionada! Agora, refine a estratégia.", 'success');
    showPane('strategy');
};


const applyStrategy = () => {
    if (!validateInputs()) {
        return; // A validação já mostra o toast de erro
    }
    markStepCompleted('strategy');
    showPane('script');
    window.showToast("Estratégia definida. Pronto para criar o roteiro.", 'success');
};

// =========================================================================
// ====================  ===================
// =========================================================================

const generateStrategicOutline = async (button) => {
    if (!validateInputs()) return;

    // --- ETAPA 1: LIMPEZA PROFUNDA INTEGRADA ---
    console.log("Iniciando limpeza profunda para novo esboço...");

    // Limpa o roteiro e o esboço da memória (AppState)
    AppState.generated.strategicOutline = null;
    AppState.generated.script = {
        intro: { html: null, text: null }, development: { html: null, text: null },
        climax: { html: null, text: null }, conclusion: { html: null, text: null },
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
    
    // Limpa os placeholders no painel de finalização que dependem do roteiro
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
    outlineContentDiv.innerHTML = `<div class="asset-card-placeholder"><div class="loading-spinner"></div><span style="margin-left: 1rem;">Criando o esqueleto da sua história...</span></div>`;

    try {
        const baseContext = getBasePromptContext(); // Usa a versão completa que já transplantamos
        const prompt = `${baseContext}
        Você é uma API de geração de JSON. Sua tarefa é criar um esboço estratégico para um vídeo.
        **REGRAS INEGOCIÁVEIS:**
        1.  **JSON PURO:** Responda APENAS com um objeto JSON válido.
        2.  **ESTRUTURA EXATA:** O objeto DEVE conter EXATAMENTE estas cinco chaves: "introduction", "development", "climax", "conclusion", e "cta".
        3.  **VALORES:** O valor para CADA chave DEVE ser uma única string de texto concisa (1-2 frases).
        **TAREFA:** Gere o objeto JSON perfeito.`;

        const rawResult = await callGroqAPI(prompt, 2000);
        AppState.generated.strategicOutline = cleanGeneratedText(rawResult, true);
        
        const { strategicOutline } = AppState.generated;

        if (!strategicOutline || typeof strategicOutline !== 'object' || !strategicOutline.introduction) {
            throw new Error("A IA falhou em gerar um esboço em formato JSON válido.");
        }

        const titleTranslations = {
            'introduction': 'Introdução', 'development': 'Desenvolvimento',
            'climax': 'Clímax', 'conclusion': 'Conclusão', 'cta': 'CTA'
        };
        
        let outlineHtml = '<ul class="space-y-4 text-sm" style="list-style-position: inside; padding-left: 1rem;">';
        for (const key in strategicOutline) {
            if (Object.hasOwnProperty.call(strategicOutline, key)) {
                const translatedTitle = titleTranslations[key] || key;
                outlineHtml += `<li><div><strong style="color: var(--primary);">${translatedTitle}:</strong> <span style="color: var(--text-body);">${DOMPurify.sanitize(strategicOutline[key])}</span></div></li>`;
            }
        }
        outlineHtml += '</ul>';
        
        outlineContentDiv.innerHTML = outlineHtml;
        
        // Cria os novos placeholders para as seções do roteiro
        createScriptSectionPlaceholders();

    } catch (error) {
        console.error("Erro detalhado em generateStrategicOutline:", error);
        window.showToast(`Falha ao gerar Esboço: ${error.message}`, 'error');
        if(outlineContentDiv) outlineContentDiv.innerHTML = `<div class="asset-card-placeholder" style="color: var(--danger);">${error.message}. Tente novamente.</div>`;
    } finally {
        hideButtonLoading(button);
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
            <div id="${section.id}Section" class="card card-placeholder mb-4 animate-fade-in flex justify-between items-center">
                <h3 class="font-semibold text-lg" style="color: var(--text-header);">${section.title}</h3>
                <button id="${section.action}Btn" data-action="${section.action}" class="btn btn-secondary btn-small">
                    <i class="fas fa-magic" style="margin-right: 8px;"></i>Gerar
                </button>
            </div>
        `;
    });
    
    scriptContainer.innerHTML = placeholdersHtml;
};


// =========================================================================
// ====================  ===================
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

// =========================================================================
// ====================  ===================
// =========================================================================



const wordCountMap = {
    'short': { intro: 60, development: 190, climax: 75, conclusion: 50 },
    'medium': { intro: 120, development: 420, climax: 165, conclusion: 120 },
    'long': { intro: 225, development: 750, climax: 300, conclusion: 225 },
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
        const paragraphs = cleanGeneratedText(rawResult, true, true); 

        if (!Array.isArray(paragraphs) || paragraphs.length === 0) {
            throw new Error("A IA não retornou o roteiro no formato de parágrafos esperado. Tente novamente.");
        }

        const contentWithDivs = paragraphs.map((p, index) =>
            `<div id="${elementId}-p-${index}">${DOMPurify.sanitize(p)}</div>`
        ).join('');
        
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
        window.showToast(`Falha ao gerar ${sectionTitle}: ${error.message}`, 'error');
        console.error(`Error generating ${sectionTitle}.`, error);
        if (targetSectionElement) {
            // Recria o placeholder em caso de erro
            targetSectionElement.innerHTML = createScriptSectionPlaceholders(); 
        }
    } finally {
        hideButtonLoading(button);
        updateButtonStates();
    }
};



const updateButtonStates = () => {
    const script = AppState.generated.script;

    // Define os estados chave da geração do roteiro
    const allMainScriptGenerated = !!script.intro?.text && !!script.development?.text && !!script.climax?.text;
    const isConclusionGenerated = !!script.conclusion?.text;
    const isCtaGenerated = !!script.cta?.text;
    const isFullScriptGenerated = allMainScriptGenerated && isConclusionGenerated && isCtaGenerated;

    // Habilita/desabilita botões de metadados no painel de finalização
    const metadataButtons = ['generateTitlesAndThumbnailsBtn', 'generateDescriptionBtn', 'generateSoundtrackBtn', 'mapEmotionsBtn'];
    metadataButtons.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.disabled = !allMainScriptGenerated;
        }
    });

    // Controla a visibilidade do Módulo de Conclusão no painel de roteiro
    const conclusionModule = document.getElementById('conclusionStrategyModule');
    if (conclusionModule) {
        const shouldShowConclusionModule = allMainScriptGenerated;
        conclusionModule.classList.toggle('hidden', !shouldShowConclusionModule);

        // Controla qual botão (Gerar Conclusão ou Gerar CTA) é mostrado dentro do módulo
        const btnGenerateConclusion = document.getElementById('generateConclusionBtn');
        const btnGenerateCta = document.getElementById('generateCtaBtn');
        if (btnGenerateConclusion && btnGenerateCta) {
            btnGenerateConclusion.classList.toggle('hidden', isConclusionGenerated);
            btnGenerateCta.classList.toggle('hidden', !isConclusionGenerated);
        }
    }
    
    // Mostra/esconde a seção de análise no painel de finalização quando TUDO estiver pronto
    const analysisSection = document.getElementById('scriptAnalysisSection');
    if (analysisSection) {
        analysisSection.classList.toggle('hidden', !isFullScriptGenerated);
    }
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


// =========================================================================
// ====================  ===================
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
    // const time = calculateReadingTime(content); // Será reativado quando a função for transplantada
    // timeSpan.textContent = time;
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
    arrowSvg.setAttribute('width', '16'); arrowSvg.setAttribute('height', '16');
    arrowSvg.setAttribute('fill', 'currentColor'); arrowSvg.setAttribute('viewBox', '0 0 16 16');
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
                            <strong>O que faz:</strong> Age como um "polidor de carros". Ele pega o texto inteiro, remove repetições e melhora a fluidez.
                        </span>
                    </div>

                    <div class="tooltip-container">
                        <button class="btn btn-secondary btn-small" data-action="enrichWithData">
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8.5 2a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-1 0v-11a.5.5 0 0 1 .5-.5z"/><path d="M2 7.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/></svg>
                            Enriquecer com Dados
                        </button>
                        <span class="tooltip-text">
                            <strong>Função:</strong> Adição.<br>
                            <strong>O que faz:</strong> Age como um "engenheiro de reforço". Você seleciona um trecho e ele o reforça com mais credibilidade.
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

    // Adiciona o listener para abrir/fechar
    accordionItem.querySelector('.accordion-header').addEventListener('click', (e) => {
        if(!e.target.closest('.header-buttons')) {
            const body = accordionItem.querySelector('.accordion-body');
            const arrow = accordionItem.querySelector('.accordion-arrow');
            const isOpen = body.classList.toggle('open');
            body.style.display = isOpen ? 'block' : 'none';
        }
    });

    return accordionItem;
};

// =========================================================================
// ====================  ===================
// =========================================================================




const goToFinalize = () => {
    const { script } = AppState.generated;

    // Verificação de segurança: garante que o roteiro principal está gerado.
    if (!script.intro?.text && !script.development?.text && !script.climax?.text) {
        window.showToast("Gere ao menos as seções principais do roteiro antes de finalizar.", 'info');
        return;
    }

    // Se a verificação passar, marca a etapa como concluída e avança.
    markStepCompleted('script');
    showPane('finalize');
    window.showToast("Roteiro pronto! Bem-vindo à área de finalização.", 'success');
};

// =========================================================================
// ====================  ===================
// =========================================================================


window.analyzeSectionRetention = async (button, sectionId) => {
    const sectionElement = document.getElementById(sectionId);
    const contentWrapper = sectionElement?.querySelector('.generated-content-wrapper');
    if (!contentWrapper || !contentWrapper.textContent.trim()) {
        window.showToast("Gere o roteiro desta seção antes de analisar a retenção.", 'info');
        return;
    }

    const outputContainer = sectionElement.querySelector('.section-analysis-output');
    if (outputContainer) outputContainer.innerHTML = ''; // Limpa o container antigo, se existir

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
        3.  **SUGESTÕES ESTRATÉGICAS:** A "suggestion" DEVE ser um CONSELHO ACIONÁVEL sobre COMO melhorar.
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
        
        // Lógica de agrupamento para sugestões
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
                        const suggestionTextEscaped = item.suggestion.replace(/"/g, '\\"');
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

window.optimizeGroup = async (button, suggestionText) => {
    // Lógica completa e original de optimizeGroup
    console.log("Ação: Otimizar Grupo"); window.showToast("Função 'Otimizar Grupo' conectada. Lógica completa a ser transplantada.", "info");
};

window.deleteParagraphGroup = async (button, suggestionText) => {
    // Lógica completa e original de deleteParagraphGroup
    const userConfirmed = await showConfirmationDialog('Confirmar Deleção', 'Tem certeza? Esta ação não pode ser desfeita.');
    if (!userConfirmed) return;
    const safeSelector = suggestionText.replace(/"/g, '\\"');
    const paragraphsToDelete = document.querySelectorAll(`[data-suggestion-group="${safeSelector}"]`);
    paragraphsToDelete.forEach(p => p.remove());
    window.showToast("Bloco de parágrafos deletado.", 'success');
};

// =========================================================================
// ====================  ===================
// =========================================================================















const suggestStrategy = async (button) => { console.log("Ação: Sugerir Estratégia"); window.showToast("Função 'Sugerir Estratégia' a ser conectada.", "info"); };
const generateConclusion = async (button) => { console.log("Ação: Gerar Conclusão"); window.showToast("Função 'Gerar Conclusão' a ser conectada.", "info"); };
const generateStrategicCta = async (button) => { console.log("Ação: Gerar CTA"); window.showToast("Função 'Gerar CTA' a ser conectada.", "info"); };
const suggestFinalStrategy = async (button) => { console.log("Ação: Sugerir Estratégia Final"); window.showToast("Função 'Sugerir Estratégia Final' a ser conectada.", "info"); };
window.addDevelopmentChapter = async (button) => { console.log("Ação: Adicionar Capítulo"); window.showToast("Função 'Adicionar Capítulo' a ser conectada.", "info"); };
const mapEmotionsAndPacing = async (button) => { console.log("Ação: Mapear Emoções"); window.showToast("Função 'Mapear Emoções' a ser conectada.", "info"); };
const generateTitlesAndThumbnails = async (button) => { console.log("Ação: Gerar Títulos"); window.showToast("Função 'Gerar Títulos' a ser conectada.", "info"); };
const generateVideoDescription = async (button) => { console.log("Ação: Gerar Descrição"); window.showToast("Função 'Gerar Descrição' a ser conectada.", "info"); };
const generateSoundtrack = async (button) => { console.log("Ação: Gerar Trilha Sonora"); window.showToast("Função 'Gerar Trilha Sonora' a ser conectada.", "info"); };
const analyzeFullScript = async (button) => { console.log("Ação: Analisar Roteiro"); window.showToast("Função 'Analisar Roteiro' a ser conectada.", "info"); };
const analyzeRetentionHooks = async (button) => { console.log("Ação: Caçar Ganchos"); window.showToast("Função 'Caçar Ganchos' a ser conectada.", "info"); };
const suggestViralElements = async (button) => { console.log("Ação: Sugerir Elementos Virais"); window.showToast("Função 'Sugerir Elementos Virais' a ser conectada.", "info"); };
const exportProject = () => { console.log("Ação: Exportar Projeto"); window.showToast("Função 'Exportar Projeto' a ser conectada.", "info"); };
const downloadPdf = () => { console.log("Ação: Baixar PDF"); window.showToast("Função 'Baixar PDF' a ser conectada.", "info"); };
const handleCopyAndDownloadTranscript = () => { console.log("Ação: Exportar Transcrição"); window.showToast("Função 'Exportar Transcrição' a ser conectada.", "info"); };
window.regenerateSection = (fullSectionId) => { console.log(`Ação: Regenerar ${fullSectionId}`); window.showToast(`Função 'Regenerar ${fullSectionId}' a ser conectada.`, "info"); };
window.generatePromptsForSection = async (button, sectionElementId) => { console.log(`Ação: Gerar Prompts para ${sectionElementId}`); window.showToast(`Função 'Gerar Prompts' a ser conectada.`, "info"); };

window.refineSectionStyle = async (buttonElement) => { console.log("Ação: Refinar Estilo"); window.showToast("Função 'Refinar Estilo' a ser conectada.", "info"); };
window.enrichWithData = async (buttonElement) => { console.log("Ação: Enriquecer com Dados"); window.showToast("Função 'Enriquecer com Dados' a ser conectada.", "info"); };
window.suggestPerformance = async (button, sectionId) => { console.log(`Ação: Sugerir Performance ${sectionId}`); window.showToast(`Função 'Sugerir Performance' a ser conectada.`, "info"); };
window.optimizeGroup = async (button, suggestionText) => { console.log("Ação: Otimizar Grupo"); window.showToast("Função 'Otimizar Grupo' a ser conectada.", "info"); };
window.deleteParagraphGroup = async (button, suggestionText) => { console.log("Ação: Deletar Grupo"); window.showToast("Função 'Deletar Grupo' a ser conectada.", "info"); };
window.applySuggestion = (button) => { console.log("Ação: Aplicar Sugestão"); window.showToast("Função 'Aplicar Sugestão' a ser conectada.", "info"); };
const applyAllSuggestions = async (button) => { console.log("Ação: Aplicar Todas"); window.showToast("Função 'Aplicar Todas' a ser conectada.", "info"); };
const applyHookSuggestion = (button) => { console.log("Ação: Aplicar Gancho"); window.showToast("Função 'Aplicar Gancho' a ser conectada.", "info"); };
const insertViralSuggestion = (button) => { console.log("Ação: Inserir Sugestão Viral"); window.showToast("Função 'Inserir Sugestão Viral' a ser conectada.", "info"); };
const handleEditingAction = async (action) => { console.log(`Ação de Edição: ${action}`); window.showToast(`Função 'Edição ${action}' a ser conectada.`, "info"); };


// ==========================================================
// ==================== SALVAR / CARREGAR =====================
// ==========================================================
const LOCAL_STORAGE_KEY = 'viralScriptGeneratorProject_v6';

const getProjectStateForExport = () => { /* LOGIC WILL BE TRANSPLANTED HERE */ return AppState; };
const syncUiFromState = () => { /* LOGIC WILL BE TRANSPLANTED HERE */ };
const saveStateToLocalStorage = () => { /* LOGIC WILL BE TRANSPLANTED HERE */ };
const loadStateFromLocalStorage = () => { /* LOGIC WILL BE TRANSPLANTED HERE */ };
const importProject = (event) => { /* LOGIC WILL BE TRANSPLANTED HERE */ };
const resetApplicationState = async () => {
    const confirmed = await showConfirmationDialog("Começar Novo Projeto?", "Isso limpará todos os campos e o trabalho salvo. Deseja continuar?");
    if (confirmed) {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        window.location.reload();
    }
};

// ==========================================================
// ==================== EVENTOS E INICIALIZAÇÃO ===============
// ==========================================================
document.addEventListener('DOMContentLoaded', () => {
    // Mapa de ações para o listener de clique global
    const actions = {
        'investigate': handleInvestigate, 'generateIdeasFromReport': generateIdeasFromReport,
        'select-idea': (btn) => { const ideaString = btn.dataset.idea; if (ideaString) selectIdea(JSON.parse(ideaString.replace(/&quot;/g, '"'))); },
        'suggestStrategy': suggestStrategy, 'applyStrategy': applyStrategy,
        'generateOutline': generateStrategicOutline,
        'generateIntro': (btn) => handleGenerateSection(btn, 'intro', 'Introdução', 'intro'),
        'generateDevelopment': (btn) => handleGenerateSection(btn, 'development', 'Desenvolvimento', 'development'),
        'generateClimax': (btn) => handleGenerateSection(btn, 'climax', 'Clímax', 'climax'),
        'generateConclusion': generateConclusion, 'generateCta': generateStrategicCta, 'suggestFinalStrategy': suggestFinalStrategy,
        'addDevelopmentChapter': (btn) => window.addDevelopmentChapter(btn), 'mapEmotions': mapEmotionsAndPacing,
        'generateTitlesAndThumbnails': generateTitlesAndThumbnails, 'generateDescription': generateVideoDescription, 'generateSoundtrack': generateSoundtrack,
        'analyzeScript': analyzeFullScript, 'analyzeHooks': analyzeRetentionHooks, 'suggestViralElements': suggestViralElements,
        'exportProject': exportProject, 'exportPdf': downloadPdf, 'exportTranscript': handleCopyAndDownloadTranscript,
        'resetProject': resetApplicationState,
        'regenerate': (btn) => window.regenerateSection(btn.dataset.sectionId),
        'copy': (btn) => { /* Lógica de cópia aqui */ },
        'generate-prompts': (btn) => window.generatePromptsForSection(btn, btn.dataset.sectionId),
        'analyzeRetention': (btn) => window.analyzeSectionRetention(btn, btn.dataset.sectionId),
        'refineStyle': (btn) => window.refineSectionStyle(btn),
        'enrichWithData': (btn) => window.enrichWithData(btn),
        'suggestPerformance': (btn) => window.suggestPerformance(btn, btn.dataset.sectionId),
        'optimizeGroup': (btn) => { const text = btn.dataset.suggestionText; if (text) window.optimizeGroup(btn, text); },
        'deleteParagraphGroup': (btn) => { const text = btn.dataset.suggestionText; if (text) window.deleteParagraphGroup(btn, text); },
        'applySuggestion': (btn) => window.applySuggestion(btn),
        'applyAllSuggestions': applyAllSuggestions,
        'applyHookSuggestion': applyHookSuggestion,
        'insertViralSuggestion': insertViralSuggestion,
        'goToFinalize': goToFinalize,
    };

    document.body.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-action]');
        if (button && actions[button.dataset.action]) {
            actions[button.dataset.action](button);
        }
        const step = event.target.closest('.step[data-step]');
        if (step) {
            showPane(step.dataset.step);
        }
        const genreButton = event.target.closest('#genreTabs .tab-button');
        if (genreButton) {
            document.querySelectorAll('#genreTabs .tab-button').forEach(b => b.classList.remove('tab-active'));
            genreButton.classList.add('tab-active');
        }
    });

    const toggle = document.getElementById('darkModeToggle');
    const setDarkMode = (isDark) => {
        const moonIcon = document.getElementById('moonIcon'); const sunIcon = document.getElementById('sunIcon');
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

    loadStateFromLocalStorage();
    showPane(AppState.ui.currentPane || 'investigate');
});