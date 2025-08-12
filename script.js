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

// ==========================================================
// ==================== LÓGICA DO WIZARD UI ===================
// ==========================================================
const showPane = (paneId) => {
    document.querySelectorAll('#contentArea > div[id^="pane-"]').forEach(pane => {
        pane.classList.add('hidden');
    });
    document.querySelectorAll('#sidebar .step').forEach(step => {
        step.classList.remove('active');
    });

    const activePane = document.getElementById(`pane-${paneId}`);
    if (activePane) {
        activePane.classList.remove('hidden');
    }
    const activeStep = document.getElementById(`step-${paneId}`);
    if (activeStep) {
        activeStep.classList.add('active');
    }
    AppState.ui.currentPane = paneId;
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

// As funções detalhadas serão coladas nas próximas partes.
// Aqui apenas declaramos para que o mapa de ações não dê erro.
let PromptManager, callGroqAPI, cleanGeneratedText, removeMetaComments, showConfirmationDialog, showInputDialog, handleEditingAction;
let handleInvestigate, generateIdeasFromReport, selectIdea, applyStrategy, suggestStrategy, generateStrategicOutline;
let createScriptSectionPlaceholders, handleGenerateSection, generateConclusion, generateStrategicCta, suggestFinalStrategy, addDevelopmentChapter, goToFinalize;
let mapEmotionsAndPacing, generateTitlesAndThumbnails, generateVideoDescription, generateSoundtrack;
let analyzeFullScript, analyzeRetentionHooks, suggestViralElements, analyzeScriptPart, createReportSection, applySuggestion, applyAllSuggestions, applyHookSuggestion, insertViralSuggestion;
let refineSectionStyle, enrichWithData, suggestPerformance, analyzeSectionRetention, optimizeGroup, deleteParagraphGroup;
let regenerateSection, generatePromptsForSection, renderPaginatedPrompts, navigatePrompts;
let exportProject, downloadPdf, handleCopyAndDownloadTranscript, resetApplicationState;
let saveStateToLocalStorage, loadStateFromLocalStorage, syncUiFromState, getProjectStateForExport;
let updateButtonStates, updateAllReadingTimes, invalidateAndClearEmotionalMap, invalidateAndClearPerformance, invalidateAndClearPrompts;
let escapeRtf, escapeIdeaForOnclick, updateNarrativeStructureOptions, updateMainTooltip, updateGoalPopover, toggleCustomImageStyleVisibility, validateInputs;
let getBasePromptContext, constructScriptPrompt, getTranscriptOnly, generateSectionHtmlContent;

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
    
    // loadStateFromLocalStorage();
    showPane(AppState.ui.currentPane || 'investigate');
});