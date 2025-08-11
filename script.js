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
    const required = [
        { id: 'channelName', name: 'Nome do Canal' },
        { id: 'videoTheme', name: 'Tema do Vídeo' },
        { id: 'videoDescription', name: 'Descrição do Vídeo' },
        { id: 'videoDuration', name: 'Duração Desejada' },
        { id: 'visualPacing', name: 'Ritmo Visual' }
    ];
    for (const field of required) {
        const el = document.getElementById(field.id);
        if (!el || !el.value) {
            window.showToast(`Por favor, preencha o campo: ${field.name}`, 'error');
            return false;
        }
    }
    return true;
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



















const suggestStrategy = async (button) => { console.log("Ação: Sugerir Estratégia"); window.showToast("Função 'Sugerir Estratégia' a ser conectada.", "info"); };
const applyStrategy = () => { console.log("Ação: Aplicar Estratégia"); window.showToast("Função 'Aplicar Estratégia' a ser conectada.", "info"); };
const generateStrategicOutline = async (button) => { console.log("Ação: Gerar Esboço"); window.showToast("Função 'Gerar Esboço' a ser conectada.", "info"); };
const handleGenerateSection = async (button, sectionName, sectionTitle, elementId) => { console.log(`Ação: Gerar Seção ${sectionName}`); window.showToast(`Função 'Gerar Seção ${sectionName}' a ser conectada.`, "info"); };
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
window.analyzeSectionRetention = async (button, sectionId) => { console.log(`Ação: Analisar Retenção ${sectionId}`); window.showToast(`Função 'Analisar Retenção' a ser conectada.`, "info"); };
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
const goToFinalize = () => { markStepCompleted('script'); showPane('finalize'); };

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