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
    const markdownMatch = trimmedText.match(/```(json)?\s*([\s\S]*?)\s*```/);
    if (markdownMatch && markdownMatch[2]) {
        jsonString = markdownMatch[2].trim();
    } else {
        const startIndex = trimmedText.search(/[\{\[]/);
        if (startIndex === -1) {
            throw new Error("A IA não retornou um formato JSON reconhecível.");
        }
        const lastBraceIndex = trimmedText.lastIndexOf('}');
        const lastBracketIndex = trimmedText.lastIndexOf(']');
        const endIndex = Math.max(lastBraceIndex, lastBracketIndex);
        if (endIndex === -1 || endIndex < startIndex) {
            throw new Error("O JSON retornado pela IA parece estar incompleto.");
        }
        jsonString = trimmedText.substring(startIndex, endIndex + 1);
    }
    try {
        jsonString = jsonString.replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3');
        jsonString = jsonString.replace(/:\s*'((?:[^'\\]|\\.)*?)'/g, ': "$1"');
        jsonString = jsonString.replace(/,\s*([}\]])/g, '$1');
    } catch (preSurgeryError) {
        console.warn("Erro durante a pré-cirurgia. O JSON pode estar muito malformado.", preSurgeryError);
    }
    let openBrackets = (jsonString.match(/\[/g) || []).length;
    let closeBrackets = (jsonString.match(/\]/g) || []).length;
    let openBraces = (jsonString.match(/\{/g) || []).length;
    let closeBraces = (jsonString.match(/\}/g) || []).length;
    while (openBraces > closeBraces) { jsonString += '}'; closeBraces++; }
    while (openBrackets > closeBrackets) { jsonString += ']'; closeBrackets++; }
    try {
        let parsedResult = JSON.parse(jsonString);
        if (arrayExpected && !Array.isArray(parsedResult)) {
            return [parsedResult];
        }
        return parsedResult;
    } catch (initialError) {
        console.warn("Parse inicial falhou. O JSON extraído ainda tem erros. Iniciando reparos...", initialError.message);
        let repairedString = jsonString;
        try {
            // ===============================================================
            // >>>>> NOVA EVOLUÇÃO AQUI: A REGRA DE "DESINFECÇÃO" <<<<<
            // ===============================================================
            // Remove crases e outros caracteres de controle inválidos DENTRO das strings.
            repairedString = repairedString.replace(/`/g, "'"); 
            // ===============================================================

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

            let finalParsedResult = JSON.parse(repairedString);
            if (arrayExpected && !Array.isArray(finalParsedResult)) {
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
            console.error("Elementos do pop-up de confirmação não foram encontrados no HTML.");
            resolve(false);
            return;
        }

        titleEl.textContent = title;
        messageEl.textContent = message;
        overlay.style.display = 'flex';

        const closeDialog = (result) => {
            overlay.style.display = 'none';
            // Remove os listeners para evitar chamadas duplicadas
            const newBtnYes = btnYes.cloneNode(true);
            btnYes.parentNode.replaceChild(newBtnYes, btnYes);
            const newBtnNo = btnNo.cloneNode(true);
            btnNo.parentNode.replaceChild(newBtnNo, btnNo);
            resolve(result);
        };

        // TRUQUE PARA GARANTIR LISTENERS LIMPOS:
        // Clonamos os botões para remover quaisquer event listeners antigos
        const clonedBtnYes = btnYes.cloneNode(true);
        const clonedBtnNo = btnNo.cloneNode(true);

        // Adicionamos os novos listeners aos clones
        clonedBtnYes.addEventListener('click', () => closeDialog(true), { once: true });
        clonedBtnNo.addEventListener('click', () => closeDialog(false), { once: true });

        // Substituímos os botões originais pelos clones com os novos listeners
        btnYes.replaceWith(clonedBtnYes);
        btnNo.replaceWith(clonedBtnNo);
    });
};

const auditGeneratedText = (originalText, annotatedText) => {
    const cleanTextFromAI = annotatedText.replace(/\[.*?\]/g, '').trim();
    const normalizedOriginal = originalText.replace(/\s+/g, ' ').trim();
    const normalizedCleanAI = cleanTextFromAI.replace(/\s+/g, ' ').trim();
    const isValid = normalizedOriginal === normalizedCleanAI;
    return { isValid, cleanTextFromAI };
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
        try {
            document.execCommand('copy');
            window.showToast('Copiado!', 'success');
        } finally {
            document.body.removeChild(ta);
        }
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

// As funções showInputDialog e handleEditingAction também fazem parte deste módulo.
// Vamos garantir que elas também estejam aqui.

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
            console.error("Elementos do pop-up de input não foram encontrados no HTML.");
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

const handleEditingAction = async (action) => {
    // Esta função será ativada por um listener de 'selectionchange' que adicionaremos depois.
    // Por enquanto, apenas a transplantamos.
    if (!userSelectionRange) return;
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
        window.showToast(`Texto refinado com sucesso!`, 'success');
    } catch (err) {
        console.error(`Erro ao tentar '${action}':`, err);
        window.showToast(`Falha ao refinar o texto: ${err.message}`, 'error');
    } finally {
        userSelectionRange = null;
    }
};

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




const validateInputs = () => {
    const channelName = document.getElementById('channelName')?.value.trim();
    const videoTheme = document.getElementById('videoTheme')?.value.trim();
    const videoDescription = document.getElementById('videoDescription')?.value.trim();
    const videoDuration = document.getElementById('videoDuration')?.value;
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

    // Limpa a UI de análises anteriores
    const paragraphs = Array.from(contentWrapper.querySelectorAll('div[id]'));
    paragraphs.forEach(p => {
        p.className = ''; // Remove classes de retenção
        const tooltip = p.querySelector('.retention-tooltip');
        if (tooltip) tooltip.remove();
        p.removeEventListener('mouseover', handleSuggestionMouseOver);
        p.removeEventListener('mouseout', handleSuggestionMouseOut);
    });
    
    if (paragraphs.length === 0) {
        window.showToast("Não há parágrafos para analisar nesta seção.", 'info');
        return;
    }

    showButtonLoading(button);

    try {
        const paragraphsWithIndexes = paragraphs.map((p, index) => ({ index: index, text: p.textContent.trim() }));
        const basePromptContext = getBasePromptContext();

        const prompt = `Você é uma API de análise de roteiro que retorna JSON. Analise CADA parágrafo a seguir e retorne um array JSON perfeito.

        **CONTEXTO ESTRATÉGICO:**
        ---
        ${basePromptContext}
        ---

        **REGRAS JSON (INEGOCIÁVEIS):**
        1.  **JSON PURO:** Responda APENAS com o array JSON.
        2.  **ESTRUTURA COMPLETA:** Cada objeto DEVE conter "paragraphIndex" (número), "retentionScore" ("green", "yellow", ou "red"), e "suggestion" (string).
        3.  **SUGESTÕES ACIONÁVEIS:** A "suggestion" DEVE ser um conselho sobre COMO melhorar.
        4.  **SINTAXE:** Use aspas duplas ("") para todas as chaves e valores.

        **MANUAL DE PONTUAÇÃO:**
        - **green:** Excelente. Prende a atenção. Sugestão: "Excelente fluidez.".
        - **yellow:** Ponto de Atenção. Funcional, mas pode ser mais impactante.
        - **red:** Ponto de Risco. Confuso ou quebra o engajamento.

        **DADOS PARA ANÁLISE:**
        ${JSON.stringify(paragraphsWithIndexes, null, 2)}`;

        const rawResult = await callGroqAPI(prompt, 4000);
        const analysis = cleanGeneratedText(rawResult, true, true);

        if (!analysis || !Array.isArray(analysis) || analysis.length < paragraphs.length) {
            throw new Error("A análise da IA retornou um formato inválido ou incompleto.");
        }
        
        // Lógica de agrupamento de sugestões (da v5.0)
        if (analysis.length > 0) {
            let currentGroup = [];
            for (let i = 0; i < analysis.length; i++) {
                const currentItem = analysis[i]; const previousItem = i > 0 ? analysis[i - 1] : null;
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
        
        // Aplica as classes e tooltips nos parágrafos (lógica da v5.0)
        analysis.forEach((item, index) => {
            const p = paragraphs[item.paragraphIndex];
            if (p) {
                p.classList.add('retention-paragraph-live', `retention-${item.retentionScore}`);
                p.dataset.suggestionGroup = item.suggestion;

                if (item.retentionScore === 'yellow' || item.retentionScore === 'red') {
                    const previousItem = index > 0 ? analysis[index - 1] : null;
                    if (!previousItem || item.suggestion !== previousItem.suggestion || (analysis.filter(s => s.suggestion === item.suggestion).length === 1)) {
                        const scoreLabels = { yellow: "PONTO DE ATENÇÃO", red: "PONTO DE RISCO" };
                        const tooltipTitle = scoreLabels[item.retentionScore] || 'ANÁLISE';
                        const suggestionTextEscaped = item.suggestion.replace(/"/g, '\\"');
                        const buttonsHtml = `
                            <div class="flex gap-2 mt-3">
                                <button class="flex-1 btn btn-primary btn-small py-1" data-action="optimizeGroup" data-suggestion-text="${suggestionTextEscaped}"><i class="fas fa-magic mr-2"></i> Otimizar</button>
                                <button class="flex-1 btn btn-danger btn-small py-1" data-action="deleteParagraphGroup" data-suggestion-text="${suggestionTextEscaped}"><i class="fas fa-trash-alt mr-2"></i> Deletar</button>
                            </div>`;
                        p.insertAdjacentHTML('beforeend', `<div class="retention-tooltip"><strong>${tooltipTitle}:</strong> ${DOMPurify.sanitize(item.suggestion)}${buttonsHtml}</div>`);
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
    const safeSelector = suggestionGroupText.replace(/"/g, '\\"');
    contentWrapper.querySelectorAll(`[data-suggestion-group="${safeSelector}"]`).forEach(p => {
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
    const safeSelector = suggestionText.replace(/"/g, '\\"');
    const paragraphsToOptimize = document.querySelectorAll(`[data-suggestion-group="${safeSelector}"]`);
    if (paragraphsToOptimize.length === 0) {
        window.showToast("Erro: parágrafos para otimizar não encontrados.", 'error'); return;
    }
    const originalButtonText = button.innerHTML;
    button.innerHTML = '<div class="loading-spinner" style="width:16px; height:16px; border-width: 2px; margin: auto;"></div>';
    button.disabled = true;

    try {
        const originalBlock = Array.from(paragraphsToOptimize).map(p => p.textContent.trim()).join('\n\n');
        const prompt = `Você é um EDITOR DE ROTEIRO DE ELITE. Reescreva o "BLOCO DE TEXTO ORIGINAL" para resolver o "PROBLEMA" apontado, mantendo o tom e a consistência do roteiro. Retorne APENAS o texto reescrito.

        **PROBLEMA A CORRIGIR:** "${suggestionText}"
        
        **BLOCO DE TEXTO ORIGINAL:**
        ---
        ${originalBlock}
        ---`;

        const rawResult = await callGroqAPI(prompt, 3000);
        const newContent = removeMetaComments(rawResult.trim());
        const newParagraphs = newContent.split('\n').filter(p => p.trim() !== '');

        const firstParagraph = paragraphsToOptimize[0];
        
        firstParagraph.innerHTML = DOMPurify.sanitize(newParagraphs[0] || '');
        firstParagraph.classList.add('highlight-change');
        firstParagraph.removeAttribute('data-suggestion-group');

        let lastElement = firstParagraph;
        for (let i = 1; i < newParagraphs.length; i++) {
            const newDiv = document.createElement('div');
            const originalP = paragraphsToOptimize[i];
            if(originalP) newDiv.id = originalP.id;
            newDiv.innerHTML = DOMPurify.sanitize(newParagraphs[i]);
            newDiv.className = 'highlight-change';
            firstParagraph.parentElement.insertBefore(newDiv, lastElement.nextSibling);
            lastElement = newDiv;
        }

        for (let i = 1; i < paragraphsToOptimize.length; i++) {
            paragraphsToOptimize[i].remove();
        }

        window.showToast("Bloco de parágrafos otimizado!", 'success');
    } catch (error) {
        console.error("Erro em optimizeGroup:", error);
        window.showToast(`Falha ao otimizar o bloco: ${error.message}`, 'error');
    } finally {
        button.innerHTML = originalButtonText;
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

    paragraphsToDelete.forEach(p => {
        p.style.transition = 'opacity 0.3s ease-out';
        p.style.opacity = '0';
    });
    
    setTimeout(() => {
        paragraphsToDelete.forEach(p => p.remove());
        window.showToast("Bloco de parágrafos deletado com sucesso!", 'success');
    }, 300);
};


// =========================================================================
// ====================  ===================
// =========================================================================



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


// ====================================================================================
// >>>>> SUBSTITUA SUA FUNÇÃO generateSoundtrack INTEIRA POR ESTA VERSÃO FINAL <<<<<
// ====================================================================================

/**
 * Acionada pelo botão "Gerar Trilha Sonora".
 * Analisa o roteiro completo e usa o PromptManager para gerar 3 sugestões
 * de prompts musicais detalhados para IAs de geração de áudio.
 */
const generateSoundtrack = async (button) => {
    const fullTranscript = getTranscriptOnly();
    if (!fullTranscript) {
        window.showToast("Gere o roteiro completo primeiro para sugerir uma trilha sonora coerente.", 'info');
        return;
    }

    const outputContainer = document.getElementById('soundtrackContent');
    showButtonLoading(button);
    outputContainer.innerHTML = `<div class="loading-spinner-small mx-auto my-4"></div>`;

    // AQUI ESTÁ A MUDANÇA: A lógica do prompt foi movida para o PromptManager.
    // Agora, apenas chamamos a "biblioteca" para pegar o prompt pronto.
    const prompt = PromptManager.getSoundtrackPrompt(fullTranscript);

    try {
        const rawResult = await callGroqAPI(prompt, 1500);
        const analysis = cleanGeneratedText(rawResult, true); // Espera um array de strings

        if (!analysis || !Array.isArray(analysis) || analysis.length === 0) {
            throw new Error("A IA não retornou sugestões no formato esperado.");
        }

        let suggestionsHtml = '<ul class="soundtrack-list space-y-2">';
        analysis.forEach(suggestion => {
            // Garante que a sugestão seja uma string antes de tentar sanitizar
            if (typeof suggestion === 'string') {
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
// >>>>> FUNÇÃO DE ATUALIZAÇÃO DE TEXTO NO MAPA EMOCIONAL <<<<<
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

    // SUA LÓGICA AVANÇADA DE SUBSTITUIÇÃO (100% MANTIDA)
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
    
    // =================================================================
    // >>>>> AQUI ESTÁ A ÚNICA ADIÇÃO: Sincronização com AppState <<<<<
    // =================================================================
    const scriptSectionId = sectionId.replace('Section', '');
    if (AppState.generated.script[scriptSectionId]) {
        AppState.generated.script[scriptSectionId].text = contentWrapper.textContent;
        AppState.generated.script[scriptSectionId].html = contentWrapper.innerHTML;
        console.log(`AppState para '${scriptSectionId}' foi atualizado após aplicar sugestão.`);
    }
    // =================================================================
    // >>>>> FIM DA ADIÇÃO <<<<<
    // =================================================================

    // O resto da sua função (100% MANTIDO)
    window.showToast("Sugestão aplicada com sucesso!");
    
    invalidateAndClearPerformance(sectionElement);
    invalidateAndClearPrompts(sectionElement);
    invalidateAndClearEmotionalMap();
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
    let sectionElement = null; // Variável para guardar a referência da seção alterada

    scriptSections.forEach(wrapper => {
        if (replaced) return;
        const paragraphs = wrapper.querySelectorAll('div[id*="-p-"]');
        paragraphs.forEach(p => {
            if (replaced) return;
            if (p.textContent.includes(problematicQuote)) {
                // SUA LÓGICA ATUAL DE SUBSTITUIÇÃO (100% MANTIDA)
                const newHtmlContent = p.innerHTML.replace(problematicQuote, `<span class="highlight-change">${rewrittenQuote}</span>`);
                p.innerHTML = DOMPurify.sanitize(newHtmlContent, { ADD_TAGS: ["span"], ADD_ATTR: ["class"] });
                
                window.showToast("Gancho aprimorado com sucesso!", 'success');

                // SUA LÓGICA ATUAL DE INVALIDAÇÃO (100% MANTIDA)
                sectionElement = p.closest('.script-section'); // Guardamos a referência aqui
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

    // =================================================================
    // >>>>> AQUI ESTÁ A ÚNICA ADIÇÃO: Sincronização com AppState <<<<<
    // =================================================================
    if (sectionElement) {
        const contentWrapper = sectionElement.querySelector('.generated-content-wrapper');
        const scriptSectionId = sectionElement.id.replace('Section', '');
        if (contentWrapper && AppState.generated.script[scriptSectionId]) {
            AppState.generated.script[scriptSectionId].text = contentWrapper.textContent;
            AppState.generated.script[scriptSectionId].html = contentWrapper.innerHTML;
            console.log(`AppState para '${scriptSectionId}' foi atualizado após aplicar gancho.`);
        }
    }
    // =================================================================
    // >>>>> FIM DA ADIÇÃO <<<<<
    // =================================================================

    // O RESTO DA SUA FUNÇÃO (100% MANTIDO)
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-check mr-2"></i>Aplicada!';
    button.classList.remove('btn-primary');
    button.classList.add('btn-success');
};




// =========================================================================
// >>>>> FUNÇÃO DE SUGERIR ELEMENTOS VIRAIS <<<<<
// =========================================================================
const insertViralSuggestion = (button) => {
    const { anchorParagraph, suggestedText } = button.dataset;

    if (!anchorParagraph || !suggestedText) {
        window.showToast("Erro: Informações da sugestão não encontradas.", 'error');
        return;
    }

    const allParagraphs = document.querySelectorAll('#scriptSectionsContainer div[id*="-p-"]');
    let inserted = false;
    let sectionElement = null; // Variável para guardar a referência da seção alterada

    allParagraphs.forEach(p => {
        if (!inserted && p.textContent.trim().includes(anchorParagraph.trim())) {
            // SUA LÓGICA ATUAL DE INSERÇÃO (100% MANTIDA)
            const newDiv = document.createElement('div');
            newDiv.id = `inserted-p-${Date.now()}`; 
            newDiv.innerHTML = `<span class="highlight-change">${suggestedText}</span>`;
            p.parentNode.insertBefore(newDiv, p.nextSibling);
            newDiv.innerHTML = DOMPurify.sanitize(newDiv.innerHTML, { ADD_TAGS: ["span"], ADD_ATTR: ["class"] });
            
            window.showToast("Elemento viral inserido com sucesso!", 'success');
            
            // SUA LÓGICA ATUAL DE INVALIDAÇÃO (100% MANTIDA)
            sectionElement = p.closest('.script-section'); // Guardamos a referência aqui
            if (sectionElement) {
                invalidateAndClearPerformance(sectionElement);
                invalidateAndClearPrompts(sectionElement);
                invalidateAndClearEmotionalMap();
                updateAllReadingTimes();
            }
            inserted = true;
        }
    });

    // SUA LÓGICA DE VERIFICAÇÃO (100% MANTIDA)
    if (!inserted) {
        window.showToast("Não foi possível inserir. O parágrafo âncora pode ter sido editado.", 'info');
        return;
    }
    
    // =================================================================
    // >>>>> AQUI ESTÁ A ÚNICA ADIÇÃO: Sincronização com AppState <<<<<
    // =================================================================
    if (sectionElement) {
        const contentWrapper = sectionElement.querySelector('.generated-content-wrapper');
        const scriptSectionId = sectionElement.id.replace('Section', '');
        if (contentWrapper && AppState.generated.script[scriptSectionId]) {
            AppState.generated.script[scriptSectionId].text = contentWrapper.textContent;
            AppState.generated.script[scriptSectionId].html = contentWrapper.innerHTML;
            console.log(`AppState para '${scriptSectionId}' foi atualizado após inserir elemento viral.`);
        }
    }
    // =================================================================
    // >>>>> FIM DA ADIÇÃO <<<<<
    // =================================================================

    // O RESTO DA SUA FUNÇÃO (100% MANTIDO)
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-check mr-2"></i>Aplicada!';
    button.classList.remove('btn-primary');
    button.classList.add('btn-success');
};
















const downloadPdf = () => { console.log("Ação: Baixar PDF"); window.showToast("Função 'Baixar PDF' a ser conectada.", "info"); };



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