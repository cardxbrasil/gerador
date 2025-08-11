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

const handleInvestigate = async (button) => { console.log("Ação: Investigar"); window.showToast("Função 'Investigar' a ser conectada.", "info"); };
const generateIdeasFromReport = async (button) => { console.log("Ação: Gerar Ideias"); window.showToast("Função 'Gerar Ideias' a ser conectada.", "info"); };
const selectIdea = (idea) => { console.log("Ação: Selecionar Ideia"); window.showToast("Função 'Selecionar Ideia' a ser conectada.", "info"); };
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