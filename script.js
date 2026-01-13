// ============================================================
// ✅ PDF: opções depois de gerar (Abrir / Baixar e abrir / Compartilhar no iOS)
// Motivo: navegadores (especialmente Safari/iOS) não permitem forçar
// um "prompt do sistema" perguntando onde salvou. Então nós mostramos
// um modal nosso, com botões claros para o usuário escolher.
// ============================================================
let lastGeneratedPDF = null; // { blob: Blob, fileName: string }

/**
 * Faz download do PDF a partir de um Blob.
 * Obs: No iOS/Safari o atributo download pode ser ignorado (limitação do iOS).
 */
function downloadPdfFromBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
}

/**
 * Abre o PDF em uma nova aba (preview).
 * Se o Safari bloquear popup, mostramos um link para o usuário tocar.
 */
function openPdfFromBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const opened = window.open(url, '_blank');

    if (!opened) {
        // Popup bloqueado: mostramos um link visível
        showOpenPdfLink(url, fileName);
    }

    setTimeout(() => URL.revokeObjectURL(url), 60000);
}

/**
 * Mostra um link na tela para o usuário abrir o PDF caso o navegador bloqueie popups.
 */
function showOpenPdfLink(url, fileName) {
    let box = document.getElementById('pdfLinkBox');
    if (!box) {
        box = document.createElement('div');
        box.id = 'pdfLinkBox';
        box.style.marginTop = '20px';
        box.style.padding = '15px';
        box.style.border = '2px solid #667eea';
        box.style.borderRadius = '10px';
        box.style.background = '#f8f9ff';
        box.style.textAlign = 'center';
        box.style.display = 'grid';
        box.style.gap = '10px';
        const container = document.querySelector('.container') || document.body;
        container.prepend(box);
    }

    box.innerHTML = `
        <strong>📄 PDF gerado com sucesso!</strong>
        <a href="${url}" target="_blank" rel="noopener" style="font-size:16px; font-weight:bold;">
            👉 Toque aqui para abrir o PDF (${escapeHtml(fileName)})
        </a>
        <div style="font-size:13px; color:#555;">
            No iPhone/iPad: depois de abrir, toque em <strong>Compartilhar</strong> → <strong>Salvar em Arquivos</strong>.
        </div>
    `;
}

/** Pequena função de escape para evitar quebrar HTML caso o nome do arquivo tenha caracteres especiais */
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * iOS: tenta abrir a Share Sheet (Compartilhar) com o PDF.
 * Retorna true se conseguiu abrir o compartilhar, false se não suportado/falhou.
 */
async function sharePdfIOS(blob, fileName) {
    try {
        const file = new File([blob], fileName, { type: 'application/pdf' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: 'Recibo Médico',
                text: 'PDF do recibo gerado. Você pode salvar em Arquivos ou compartilhar.'
            });
            return true;
        }
    } catch (e) {
        // usuário cancelou ou não suportado
    }
    return false;
}

/**
 * Mostra um modal com as opções após gerar o PDF.
 * - Android/Desktop: "Baixar e abrir" ou "Apenas abrir"
 * - iOS: "Compartilhar/Salvar" ou "Apenas abrir"
 */
function showPdfOptionsModal(blob, fileName) {
    // Remove modal antigo se existir
    const old = document.getElementById('pdfOptionsModal');
    if (old) old.remove();

    const isIOSDevice = isIOS();

    const modal = document.createElement('div');
    modal.id = 'pdfOptionsModal';
    modal.className = 'modal';
    modal.style.display = 'block';

    const title = isIOSDevice ? 'O que você quer fazer com o PDF?' : 'Abrir o PDF agora?';
    const primaryText = isIOSDevice ? 'Compartilhar / Salvar' : 'Baixar e abrir';
    const secondaryText = 'Apenas abrir';

    modal.innerHTML = `
        <div class="modal-content">
            <h2>${title}</h2>
            <div style="background:#f8f9ff; padding:14px; border-radius:8px; margin-bottom:16px; line-height:1.5;">
                <p style="margin:0 0 6px 0;"><strong>Arquivo:</strong> ${escapeHtml(fileName)}</p>
                <p style="margin:0; font-size:13px; color:#555;">
                    ${isIOSDevice
                        ? 'No iPhone/iPad, o "download" é feito via Compartilhar → Salvar em Arquivos.'
                        : 'Você pode baixar (salvar) e também abrir para visualizar.'}
                </p>
            </div>
            <div class="modal-buttons">
                <button id="pdfOptCancel" class="btn-cancel">Cancelar</button>
                <button id="pdfOptSecondary" class="btn-cancel">${secondaryText}</button>
                <button id="pdfOptPrimary" class="btn-confirm">${primaryText}</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Ações dos botões:
    modal.querySelector('#pdfOptCancel').onclick = () => modal.remove();

    modal.querySelector('#pdfOptSecondary').onclick = () => {
        // Apenas abrir (preview)
        openPdfFromBlob(blob, fileName);
        modal.remove();
    };

    modal.querySelector('#pdfOptPrimary').onclick = async () => {
        if (isIOSDevice) {
            // iOS: compartilhar/salvar
            const shared = await sharePdfIOS(blob, fileName);
            if (!shared) {
                // fallback: abrir preview se share não suportado
                openPdfFromBlob(blob, fileName);
            }
        } else {
            // Android/Desktop: baixar e abrir
            // 1) Abrir primeiro (para reduzir risco de bloqueio de popup)
            openPdfFromBlob(blob, fileName);
            // 2) Baixar
            downloadPdfFromBlob(blob, fileName);
        }
        modal.remove();
    };

    // Fechar ao clicar fora do conteúdo
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };
}

// Detecção de dispositivo
function detectDevice() {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /iphone|ipod|android|blackberry|opera mini|windows phone|mobile/i.test(userAgent);
    const isTablet = /ipad|android(?!.*mobile)|tablet/i.test(userAgent);

    // Também verifica largura da tela
    const screenWidth = window.innerWidth;

    let type = 'desktop';
    let icon = '💻';

    if (isMobile || screenWidth < 768) {
        type = 'mobile';
        icon = '📱';
    } else if (isTablet || (screenWidth >= 768 && screenWidth < 1024)) {
        type = 'tablet';
        icon = '📱';
    }

    // Marca/modelo (best-effort; iOS normalmente não revela modelo exato)
    const brandModel = getBrandAndModel();

    return { type, icon, brandModel };
}

function isIOS() {
    const ua = navigator.userAgent || '';
    return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function isAndroid() {
    const ua = navigator.userAgent || '';
    return /Android/i.test(ua);
}

// ============================================================
// ✅ Mapa opcional: códigos → nomes comerciais
// Você pode ir adicionando mais modelos aqui.
// ============================================================
const DEVICE_MODEL_MAP = {
    // Samsung (exemplos + famílias)
    "SM-S931B": "Galaxy S25",
    "SM-S936B": "Galaxy S25+",
    "SM-S938B": "Galaxy S25 Ultra",
    // Seu aparelho (exemplo comum)
    "SM-S711B": "Galaxy S23 FE",

    // Pixel (exemplos)
    "Pixel 8": "Pixel 8",
    "Pixel 8 Pro": "Pixel 8 Pro"
};

/**
 * Tenta extrair modelo de Android do user-agent.
 * Em muitos Samsung aparece algo como: "SM-S711B" antes de "Build/".
 */
function extractAndroidModelFromUA() {
    const ua = navigator.userAgent || '';
    const m = ua.match(/;\s*([A-Za-z0-9\-]+)\s+Build\//);
    return m ? m[1] : '';
}

/** Normaliza e tenta mapear códigos como "SM-S931B/DS" → "SM-S931B" */
function mapModelToCommercialName(modelRaw) {
    if (!modelRaw) return '';
    const cleaned = String(modelRaw).trim();

    // tenta direto
    if (DEVICE_MODEL_MAP[cleaned]) return DEVICE_MODEL_MAP[cleaned];

    // remove sufixos comuns (/DS)
    const noSuffix = cleaned.replace(/\/.*/, '');
    if (DEVICE_MODEL_MAP[noSuffix]) return DEVICE_MODEL_MAP[noSuffix];

    // tenta achados diretos (ex.: "Pixel 8" vem como texto no UA)
    for (const key of Object.keys(DEVICE_MODEL_MAP)) {
        if (cleaned.toLowerCase().includes(key.toLowerCase())) {
            return DEVICE_MODEL_MAP[key];
        }
    }

    return '';
}

/**
 * Retorna algo como:
 * - "Samsung Galaxy S25" (se mapear)
 * - "Samsung SM-S711B" (se não mapear)
 * - "Apple iPhone" (iOS)
 * - "Android" (fallback)
 */
function getBrandAndModel() {
    const ua = navigator.userAgent || '';

    if (isIOS()) {
        // Safari iOS não dá o modelo exato por privacidade
        if (/iPad/.test(ua)) return "Apple iPad";
        return "Apple iPhone";
    }

    if (isAndroid()) {
        const rawModel = extractAndroidModelFromUA();

        // Tenta descobrir marca
        let brand = "Android";
        if (/samsung/i.test(ua) || /^SM-/.test(rawModel)) brand = "Samsung";
        else if (/pixel/i.test(ua)) brand = "Google";
        else if (/motorola|moto/i.test(ua)) brand = "Motorola";
        else if (/xiaomi|redmi|poco/i.test(ua)) brand = "Xiaomi";

        // nome comercial via mapa (quando possível)
        const commercial = mapModelToCommercialName(rawModel || ua);
        if (commercial) return `${brand} ${commercial}`;

        // fallback: mostra o código do modelo
        if (rawModel) return `${brand} ${rawModel}`;
        return brand;
    }

    return "Desktop";
}

// Mostrar badge do dispositivo
function updateDeviceBadge() {
    const badge = document.getElementById('device-info');
    if (!badge) return;

    const device = detectDevice();
    badge.textContent = `${device.icon} ${capitalize(device.type)} - ${device.brandModel}`;

    badge.className = `device-badge ${device.type}`;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================================================
// ✅ Feedback (toast) simples para iniciantes
// ============================================================
let toastTimeout = null;

function showToast(message) {
    let toast = document.getElementById('toastMessage');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toastMessage';
        toast.style.position = 'fixed';
        toast.style.left = '50%';
        toast.style.bottom = '20px';
        toast.style.transform = 'translateX(-50%)';
        toast.style.background = 'rgba(0,0,0,0.85)';
        toast.style.color = '#fff';
        toast.style.padding = '12px 16px';
        toast.style.borderRadius = '10px';
        toast.style.fontSize = '14px';
        toast.style.zIndex = '9999';
        toast.style.maxWidth = '92vw';
        toast.style.textAlign = 'center';
        toast.style.lineHeight = '1.4';
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.display = 'block';

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.style.display = 'none';
    }, 3500);
}

// Vibração (mobile) — opcional
function vibrateDevice(duration = 50) {
    try {
        if (navigator.vibrate) navigator.vibrate(duration);
    } catch (e) { /* ignora */ }
}

// ============================================================
// ✅ Formatação e helpers para iniciantes
// ============================================================

/**
 * Remove vírgula/ponto no final de um texto digitado.
 * Isso evita que o usuário digite "UNIMED." e a pontuação fique dentro do negrito no PDF.
 * O template do recibo já coloca as pontuações fora do negrito.
 */
function stripTrailingTemplatePunctuation(value) {
    return String(value || '')
        .replace(/[,\.\s]+$/g, '') // remove vírgula/ponto/espacos no fim
        .trim();
}

/**
 * Em PDF, queremos tudo em MAIÚSCULAS (como você pediu),
 * preservando acentos (pt-BR).
 */
function toUpperPt(value) {
    return String(value || '').toLocaleUpperCase('pt-BR');
}

/**
 * No texto do recibo, queremos evitar quebra feia "prestado da" no fim de linha.
 * Para isso, juntamos preposições pequenas com a palavra seguinte, criando um "token" único:
 * Ex: "da instrumentação" vira "da\u00A0instrumentação" (espaço não-quebrável)
 */
function gluePrepositions(text) {
    const preps = ['da', 'de', 'do', 'das', 'dos', 'na', 'no', 'nas', 'nos', 'ao', 'aos', 'à', 'às'];
    return String(text || '').split(' ').reduce((acc, word, idx, arr) => {
        const prev = acc.length ? acc[acc.length - 1] : '';
        // Se a palavra anterior for preposição, a gente cola com a palavra atual usando NBSP
        if (preps.includes(prev.toLowerCase())) {
            acc[acc.length - 1] = prev + '\u00A0' + word;
            return acc;
        }
        acc.push(word);
        return acc;
    }, []).join(' ');
}

// ============================================================
// ✅ Lógica do formulário + preview
// ============================================================

function toggleResponsavel() {
    const acompanhado = document.getElementById('acompanhado').checked;
    const responsavelGroup = document.getElementById('responsavel-group');
    const cpfLabel = document.getElementById('cpf-label');

    if (acompanhado) {
        responsavelGroup.style.display = 'block';
        cpfLabel.textContent = 'CPF do Responsável:';
        vibrateDevice();
    } else {
        responsavelGroup.style.display = 'none';
        cpfLabel.textContent = 'CPF:';
        document.getElementById('nome-responsavel').value = '';
        vibrateDevice();
    }
    updatePreview();
}

function formatCPF(input) {
    let value = input.value.replace(/\D/g, '');
    value = value.slice(0, 11);

    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');

    input.value = value;
}

function formatValor(input) {
    let value = input.value.replace(/\D/g, '');

    if (!value) {
        input.value = '';
        return;
    }

    value = (parseInt(value, 10) / 100).toFixed(2);
    value = value.replace('.', ',');
    value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    input.value = value;
}

function updateDayLimit() {
    const month = document.getElementById('mes').value;
    const year = parseInt(document.getElementById('ano').value, 10);

    const dayInput = document.getElementById('dia');
    if (!month || !year) return;

    const months31 = ['JANEIRO', 'MARÇO', 'MAIO', 'JULHO', 'AGOSTO', 'OUTUBRO', 'DEZEMBRO'];
    const months30 = ['ABRIL', 'JUNHO', 'SETEMBRO', 'NOVEMBRO'];

    let maxDay = 31;

    if (months30.includes(month)) maxDay = 30;
    if (month === 'FEVEREIRO') {
        const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
        maxDay = isLeap ? 29 : 28;
    }

    dayInput.max = String(maxDay);

    if (parseInt(dayInput.value, 10) > maxDay) {
        dayInput.value = '';
    }
}

function updatePreview() {
    const acompanhado = document.getElementById('acompanhado').checked;
    const nomeResponsavel = document.getElementById('nome-responsavel').value.trim();
    const cpf = document.getElementById('cpf').value.trim();
    const nome = document.getElementById('nome').value.trim();
    const valor = document.getElementById('valor').value.trim();
    const cirurgia = document.getElementById('cirurgia').value.trim();
    const hospital = document.getElementById('hospital').value.trim();

    const dia = document.getElementById('dia').value;
    const mes = document.getElementById('mes').value;
    const ano = document.getElementById('ano').value;

    let recebedor = nome || '********************************';
    let cpfDisplay = cpf || '***.***.***-**';
    let valDisplay = valor ? `R$ ${valor}` : 'R$ ***,**';
    let cirDisplay = cirurgia || '*******************';
    let hosDisplay = hospital || '**********';

    // Remove pontuação final digitada (vírgula/ponto) — template cuida disso
    recebedor = stripTrailingTemplatePunctuation(recebedor);
    hosDisplay = stripTrailingTemplatePunctuation(hosDisplay);

    // Texto do recibo (preview)
    let text = '';

    if (acompanhado && nomeResponsavel) {
        const respClean = stripTrailingTemplatePunctuation(nomeResponsavel);
        text = `Recebi de <strong>${respClean}</strong>, <span>CPF.: </span><strong>${cpfDisplay}</strong>, o valor de <strong>${valDisplay}</strong> referente ao serviço prestado da instrumentação cirúrgica para cirurgia de <strong>${recebedor}</strong>, realizada no hospital <strong>${hosDisplay}</strong>.`;
    } else {
        text = `Recebi de <strong>${recebedor}</strong>, <span>CPF.: </span><strong>${cpfDisplay}</strong>, o valor de <strong>${valDisplay}</strong> referente ao serviço prestado da instrumentação cirúrgica para cirurgia de <strong>${cirDisplay}</strong>, realizada no hospital <strong>${hosDisplay}</strong>.`;
    }

    // Corrige casos de "da instrumentação"/"no hospital" grudarem visualmente (sem mexer no HTML original)
    text = text.replace(/\bda\s+instrumentação\b/gi, 'da&nbsp;instrumentação');
    text = text.replace(/\bno\s+hospital\b/gi, 'no&nbsp;hospital');

    document.getElementById('receipt-text').innerHTML = text;

    // Data no preview
    const location = document.querySelector('.receipt-location');
    if (dia && mes && ano) {
        location.textContent = `Juiz de Fora, ${dia} de ${mes} de ${ano}`;
    } else {
        location.textContent = 'Juiz de Fora, ** de ********** de ****';
    }

    // Assinatura em negrito (preview)
    const sigName = document.querySelector('.signature-name');
    const sigCpf = document.querySelector('.signature-cpf');
    if (sigName) sigName.innerHTML = `<strong>Daniela Ramos Oliveira</strong>`;
    if (sigCpf) sigCpf.innerHTML = `<strong>CPF 088.959.546-10</strong>`;
}

// ============================================================
// ✅ Modal de confirmação (antes de gerar PDF)
// ============================================================

function showModal() {
    const acompanhado = document.getElementById('acompanhado').checked;
    const nomeResponsavel = document.getElementById('nome-responsavel').value.trim();
    const cpf = document.getElementById('cpf').value.trim();
    const nome = document.getElementById('nome').value.trim();
    const valor = document.getElementById('valor').value.trim();
    const cirurgia = document.getElementById('cirurgia').value.trim();
    const hospital = document.getElementById('hospital').value.trim();
    const dia = document.getElementById('dia').value;
    const mes = document.getElementById('mes').value;
    const ano = document.getElementById('ano').value;

    // Validações simples
    if (acompanhado && !nomeResponsavel) {
        showToast('Preencha o nome do responsável.');
        return;
    }
    if (!cpf || cpf.length < 11) {
        showToast('Preencha o CPF corretamente.');
        return;
    }
    if (!nome) {
        showToast('Preencha o nome do paciente.');
        return;
    }
    if (!valor) {
        showToast('Preencha o valor.');
        return;
    }
    if (!cirurgia) {
        showToast('Preencha o tipo de cirurgia.');
        return;
    }
    if (!hospital) {
        showToast('Preencha o hospital.');
        return;
    }
    if (!dia || !mes || !ano) {
        showToast('Preencha a data completa.');
        return;
    }

    // “Limpa” pontuações finais digitadas
    const nomeResponsavelClean = stripTrailingTemplatePunctuation(nomeResponsavel);
    const nomePacienteClean = stripTrailingTemplatePunctuation(nome);

    const modal = document.getElementById('confirmModal');
    const modalPreview = document.getElementById('modal-preview');

    if (acompanhado) {
        modalPreview.innerHTML = `
            <p><strong>Responsável:</strong> ${escapeHtml(nomeResponsavelClean)}</p>
            <p><strong>CPF do Responsável:</strong> ${escapeHtml(cpf)}</p>
            <p><strong>Paciente:</strong> ${escapeHtml(nomePacienteClean)}</p>
            <p><strong>Valor:</strong> R$ ${escapeHtml(valor)}</p>
            <p><strong>Cirurgia:</strong> ${escapeHtml(cirurgia)}</p>
            <p><strong>Hospital:</strong> ${escapeHtml(hospital)}</p>
            <p><strong>Data:</strong> ${escapeHtml(dia)} de ${escapeHtml(mes)} de ${escapeHtml(ano)}</p>
        `;
    } else {
        modalPreview.innerHTML = `
            <p><strong>Paciente:</strong> ${escapeHtml(nomePacienteClean)}</p>
            <p><strong>CPF:</strong> ${escapeHtml(cpf)}</p>
            <p><strong>Valor:</strong> R$ ${escapeHtml(valor)}</p>
            <p><strong>Cirurgia:</strong> ${escapeHtml(cirurgia)}</p>
            <p><strong>Hospital:</strong> ${escapeHtml(hospital)}</p>
            <p><strong>Data:</strong> ${escapeHtml(dia)} de ${escapeHtml(mes)} de ${escapeHtml(ano)}</p>
        `;
    }

    modal.style.display = 'block';
    vibrateDevice(50);
}

function closeModal() {
    const modal = document.getElementById('confirmModal');
    modal.style.display = 'none';
}

// ============================================================
// ✅ PDF (jsPDF) — geração final
// ============================================================

// ---- Funções de quebra/medição de texto no PDF (simplificadas e seguras) ----
function mmToPt(mm) {
    return mm * 2.834645669;
}

function safeGetTextWidth(doc, txt) {
    // jsPDF trabalha com unidades em mm aqui (doc.internal.scaleFactor já ajuda),
    // mas getTextWidth funciona bem se fonte estiver setada.
    return doc.getTextWidth(txt);
}

/**
 * Renderiza texto com "tokens" (partes normais e partes em negrito),
 * quebrando linhas conforme a largura disponível.
 *
 * Também implementa:
 * - “CPF não-quebrável”: o bloco "CPF.: 111...,", se não couber, vai inteiro pra próxima linha.
 * - Anti-órfãos: evita terminar a linha com "da/de/do..." (quando possível).
 */
function drawRichText(doc, tokens, x, y, maxWidth, lineHeight, options = {}) {
    const lines = [];
    let currentLine = [];
    let currentWidth = 0;

    const orphanWords = new Set(['da', 'de', 'do', 'das', 'dos', 'na', 'no', 'nas', 'nos', 'ao', 'aos', 'à', 'às']);

    // Agrupador: tenta colocar tokens que têm group igual juntos
    function measureToken(token) {
        doc.setFont('helvetica', token.bold ? 'bold' : 'normal');
        doc.setFontSize(token.size || 12);
        return safeGetTextWidth(doc, token.text);
    }

    function flushLine() {
        if (currentLine.length) lines.push(currentLine);
        currentLine = [];
        currentWidth = 0;
    }

    function canFit(tokenWidth) {
        return currentWidth + tokenWidth <= maxWidth;
    }

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        // Tokens com group: juntamos todos os tokens do mesmo grupo num “bloco” não-quebrável
        if (token.group) {
            const groupName = token.group;
            const groupTokens = [token];
            let j = i + 1;
            while (j < tokens.length && tokens[j].group === groupName) {
                groupTokens.push(tokens[j]);
                j++;
            }

            const groupWidth = groupTokens.reduce((sum, tk) => sum + measureToken(tk), 0);

            if (!canFit(groupWidth) && currentLine.length > 0) {
                flushLine();
            }

            // Se mesmo na linha vazia não couber, colocamos do mesmo jeito (quebra inevitável)
            groupTokens.forEach(tk => {
                currentLine.push(tk);
                currentWidth += measureToken(tk);
            });

            i = j - 1;
            continue;
        }

        const w = measureToken(token);

        // Anti-órfãos: se a linha ficaria terminando com "da/de/do", tentamos empurrar
        if (token.text.trim().length > 0 && orphanWords.has(token.text.trim().toLowerCase())) {
            const next = tokens[i + 1];
            if (next) {
                const combinedWidth = w + measureToken(next);
                // se a preposição + próxima palavra não cabem, quebra antes da preposição
                if (!canFit(combinedWidth) && currentLine.length > 0) {
                    flushLine();
                }
            }
        }

        if (!canFit(w) && currentLine.length > 0) {
            flushLine();
        }

        currentLine.push(token);
        currentWidth += w;
    }

    flushLine();

    // Desenhar
    let cursorY = y;
    for (let li = 0; li < lines.length; li++) {
        const line = lines[li];

        // Se for a primeira linha e options.centerFirstLine = true, centraliza
        let cursorX = x;
        if (li === 0 && options.centerFirstLine) {
            const lineWidth = line.reduce((sum, tk) => sum + measureToken(tk), 0);
            cursorX = x + (maxWidth - lineWidth) / 2;
        }

        for (const tk of line) {
            doc.setFont('helvetica', tk.bold ? 'bold' : 'normal');
            doc.setFontSize(tk.size || 12);
            doc.text(tk.text, cursorX, cursorY);
            cursorX += measureToken(tk);
        }

        cursorY += lineHeight;
    }

    return { linesCount: lines.length, endY: cursorY };
}

// ----------------- Geração do PDF -----------------
async function generatePDF() {
    
    // ✅ Segurança: garante que a biblioteca jsPDF carregou (em Safari/iOS pode falhar se estiver offline)
    if (!window.jspdf || !window.jspdf.jsPDF) {
        showToast('Erro: a biblioteca jsPDF não carregou. Verifique sua internet e recarregue a página.');
        return;
    }
vibrateDevice(100);

    const { jsPDF } = window.jspdf;

    // ✅ Importante: definimos explicitamente A4 e unidade em mm
    // para a formatação bater com o modelo (independente do dispositivo).
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

    // ====== Coleta dos dados do formulário ======
    const acompanhado = document.getElementById('acompanhado').checked;
    const nomeResponsavel = document.getElementById('nome-responsavel').value.trim();
    const cpf = document.getElementById('cpf').value.trim();
    const nome = document.getElementById('nome').value.trim();
    const valor = document.getElementById('valor').value.trim();
    const cirurgia = document.getElementById('cirurgia').value.trim();
    const hospital = document.getElementById('hospital').value.trim();
    const dia = document.getElementById('dia').value;
    const mes = document.getElementById('mes').value;
    const ano = document.getElementById('ano').value;

    // ====== Sanitização (remove pontuação final digitada) ======
    const nomeRespClean = stripTrailingTemplatePunctuation(nomeResponsavel);
    const nomeClean = stripTrailingTemplatePunctuation(nome);
    const cirurgiaClean = stripTrailingTemplatePunctuation(cirurgia);
    const hospitalClean = stripTrailingTemplatePunctuation(hospital);

    // ====== CAIXA ALTA no PDF (conforme pedido) ======
    const nomeRespUpper = toUpperPt(nomeRespClean);
    const nomeUpper = toUpperPt(nomeClean);
    const cirurgiaUpper = toUpperPt(cirurgiaClean);
    const hospitalUpper = toUpperPt(hospitalClean);

    // ====== Layout base ======
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Margens e medidas
    const marginX = 22;            // margem esquerda/direita
    const maxWidth = pageWidth - (marginX * 2);
    const titleSize = 16;
    const bodySize = 12;
    const lineHeight = 7;          // espaçamento de linha no PDF

    // ====== Tokens do texto (negrito só onde deve) ======
    // Observação importante para iniciantes:
    // - Cada "token" é um pedaço de texto.
    // - Quando token.bold = true, ele sai em negrito.
    // - Pontuações do TEMPLATE (vírgula/ponto fora do campo) ficam em token normal.
    // - Pontuações que fazem parte do valor digitado (ex.: "013.989.296-62") ficam dentro do token em negrito.
    let tokens = [];

    // Recuo (pequeno espaço no início do primeiro parágrafo)
    tokens.push({ text: '   ', bold: false, size: bodySize });

    if (acompanhado && nomeRespUpper) {
        // "Recebi de <RESP>, CPF.: <CPF>, o valor de <R$...> referente ... para cirurgia de <PACIENTE>, ... no hospital <HOSPITAL>."
        tokens.push({ text: 'Recebi de ', bold: false, size: bodySize });
        tokens.push({ text: nomeRespUpper, bold: true, size: bodySize });
        tokens.push({ text: ', ', bold: false, size: bodySize });

        // CPF.: (sem negrito) + número em negrito + vírgula sem negrito
        tokens.push({ text: 'CPF.: ', bold: false, size: bodySize, group: 'cpf' });
        tokens.push({ text: cpf, bold: true, size: bodySize, group: 'cpf' });
        tokens.push({ text: ', ', bold: false, size: bodySize, group: 'cpf' });

        tokens.push({ text: 'o valor de ', bold: false, size: bodySize });
        tokens.push({ text: `R$ ${valor}`, bold: true, size: bodySize });
        tokens.push({ text: ' referente ao serviço prestado ', bold: false, size: bodySize });

        // Evita "da" grudando / quebrando feio
        const trecho = gluePrepositions('da instrumentação cirúrgica para cirurgia de ');
        tokens.push({ text: trecho + ' ', bold: false, size: bodySize });

        tokens.push({ text: nomeUpper, bold: true, size: bodySize });
        tokens.push({ text: ', realizada ', bold: false, size: bodySize });

        const trecho2 = gluePrepositions('no hospital ');
        tokens.push({ text: trecho2 + ' ', bold: false, size: bodySize });

        tokens.push({ text: hospitalUpper, bold: true, size: bodySize });
        tokens.push({ text: '.', bold: false, size: bodySize });
    } else {
        tokens.push({ text: 'Recebi de ', bold: false, size: bodySize });
        tokens.push({ text: nomeUpper, bold: true, size: bodySize });
        tokens.push({ text: ', ', bold: false, size: bodySize });

        tokens.push({ text: 'CPF.: ', bold: false, size: bodySize, group: 'cpf' });
        tokens.push({ text: cpf, bold: true, size: bodySize, group: 'cpf' });
        tokens.push({ text: ', ', bold: false, size: bodySize, group: 'cpf' });

        tokens.push({ text: 'o valor de ', bold: false, size: bodySize });
        tokens.push({ text: `R$ ${valor}`, bold: true, size: bodySize });
        tokens.push({ text: ' referente ao serviço prestado ', bold: false, size: bodySize });

        const trecho = gluePrepositions('da instrumentação cirúrgica para cirurgia de ');
        tokens.push({ text: trecho + ' ', bold: false, size: bodySize });

        tokens.push({ text: cirurgiaUpper, bold: true, size: bodySize });
        tokens.push({ text: ', realizada ', bold: false, size: bodySize });

        const trecho2 = gluePrepositions('no hospital ');
        tokens.push({ text: trecho2 + ' ', bold: false, size: bodySize });

        tokens.push({ text: hospitalUpper, bold: true, size: bodySize });
        tokens.push({ text: '.', bold: false, size: bodySize });
    }

    // ====== Calcula se CPF cabe na primeira linha junto do número e vírgula ======
    // Se NÃO couber, centralizamos a 1ª linha e jogamos o bloco CPF para a 2ª.
    // (Isso acontece só quando o "CPF.: 111..., " não couber inteiro.)
    const cpfGroupText = `CPF.: ${cpf}, `;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(bodySize);

    // Estimativa do começo do texto na primeira linha:
    // "   Recebi de " + nomeUpper + ", "
    const firstLinePrefix = acompanhado ? `   Recebi de ${nomeRespUpper}, ` : `   Recebi de ${nomeUpper}, `;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(bodySize);
    const prefixWidth = doc.getTextWidth(firstLinePrefix);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(bodySize);
    const cpfLabelWidth = doc.getTextWidth('CPF.: ');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(bodySize);
    const cpfNumWidth = doc.getTextWidth(cpf);
    doc.setFont('helvetica', 'normal');
    const cpfCommaWidth = doc.getTextWidth(', ');

    const cpfTotalWidth = cpfLabelWidth + cpfNumWidth + cpfCommaWidth;

    const centerFirstLine = (prefixWidth + cpfTotalWidth) > maxWidth;

    // ====== Construção vertical (centralizar top/bottom) ======
    // Para centralização vertical, calculamos a altura total do bloco:
    // título + espaço + linhas do corpo + espaço + data + espaço + assinatura
    const titleHeight = 10;
    const afterTitleSpace = 10;
    const afterBodySpace = 12;
    const afterDateSpace = 16;
    const signatureLineHeight = 6;

    // Para calcular quantas linhas o corpo vai usar, rodamos o drawRichText em "modo medição":
    // (aqui a gente chama uma vez e usa o retorno de linesCount)
    // Começamos em y=0 só pra medir
    const measurement = drawRichText(doc, tokens, marginX, 0, maxWidth, lineHeight, { centerFirstLine });

    const bodyLines = measurement.linesCount;
    const bodyHeight = bodyLines * lineHeight;

    const dateHeight = 7;
    const signatureHeight = signatureLineHeight * 2;

    const totalContentHeight =
        titleHeight +
        afterTitleSpace +
        bodyHeight +
        afterBodySpace +
        dateHeight +
        afterDateSpace +
        signatureHeight;

    const yStart = Math.max(18, (pageHeight - totalContentHeight) / 2);

    // ====== Desenho final ======

    // Título
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(titleSize);
    doc.text('RECIBO', pageWidth / 2, yStart, { align: 'center' });

    // Corpo
    const bodyY = yStart + titleHeight + afterTitleSpace;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(bodySize);

    const bodyDraw = drawRichText(doc, tokens, marginX, bodyY, maxWidth, lineHeight, { centerFirstLine });

    // Data (à esquerda, como no modelo)
    const dateY = bodyDraw.endY + afterBodySpace;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(bodySize);

    // Mês em CAIXA ALTA já vem do select (JANEIRO, FEVEREIRO, etc.)
    doc.text(`Juiz de Fora, ${dia} de ${mes} de ${ano}`, marginX, dateY);

    // Assinatura (em negrito, como pedido)
    const sigY = dateY + afterDateSpace;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(bodySize);
    doc.text('Daniela Ramos Oliveira', pageWidth / 2, sigY, { align: 'center' });
    doc.text('CPF 088.959.546-10', pageWidth / 2, sigY + signatureLineHeight, { align: 'center' });

    // Nome do arquivo
    const nomeArquivo = (() => {
        const nomeBase = nomeUpper
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove acentos p/ nome de arquivo
            .replace(/[^\w\s-]/g, '')
            .trim()
            .replace(/\s+/g, '_')
            .slice(0, 40) || 'RECIBO';

        const diaPad = String(dia).padStart(2, '0');
        const mesName = String(mes || 'MES').toUpperCase();
        const anoPad = String(ano);

        return `Recibo_${nomeBase}_${diaPad}-${mesName}-${anoPad}.pdf`;
    })();

    // ====== Depois de gerar: mostramos opções (Abrir / Baixar e abrir / Compartilhar no iOS) ======
    const pdfBlob = doc.output('blob');

    // Guardamos o último PDF (útil para debug e possíveis melhorias futuras)
    lastGeneratedPDF = { blob: pdfBlob, fileName: nomeArquivo };

    // Mostra um modal com as opções para o usuário
    showPdfOptionsModal(pdfBlob, nomeArquivo);

    closeModal();
    vibrateDevice(200);
}

// Fechar modal ao clicar fora (modal de confirmação)
window.onclick = function(event) {
    const modal = document.getElementById('confirmModal');
    if (event.target === modal) {
        closeModal();
    }
};

// ============================================================
// ✅ Ano padrão do dispositivo (sem tirar opção de alterar)
// ============================================================
function setAnoPadraoDoDispositivo() {
    const anoSelect = document.getElementById('ano');
    if (!anoSelect) return;

    const anoAtual = String(new Date().getFullYear());

    // Se o ano atual não existir nas opções (ex.: você colocou só 2024–2028),
    // adicionamos ele para evitar ficar "travado" em um ano antigo.
    const existe = Array.from(anoSelect.options).some(opt => opt.value === anoAtual);
    if (!existe) {
        const opt = document.createElement('option');
        opt.value = anoAtual;
        opt.textContent = anoAtual;
        anoSelect.appendChild(opt);
    }

    // Define como selecionado
    anoSelect.value = anoAtual;
}

// ============================================================
// ✅ Inicialização
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    updateDeviceBadge();
    setAnoPadraoDoDispositivo();
    updatePreview();
});