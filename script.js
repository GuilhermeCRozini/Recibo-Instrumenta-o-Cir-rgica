// Detecção de dispositivo
function detectDevice() {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /iphone|ipod|android|blackberry|opera mini|windows phone|mobile/i.test(userAgent);
    const isTablet = /ipad|android(?!.*mobile)|tablet/i.test(userAgent);
    
    // Também verifica largura da tela
    const screenWidth = window.innerWidth;
    
    let deviceType = 'desktop';
    let deviceIcon = '💻';
    
    if (isMobile || screenWidth < 768) {
        deviceType = 'mobile';
        deviceIcon = '📱';
    } else if (isTablet || (screenWidth >= 768 && screenWidth <= 1024)) {
        deviceType = 'tablet';
        deviceIcon = '📱';
    }
    
    return { type: deviceType, icon: deviceIcon };
}

/*
  ================================
  Detalhes do dispositivo (marca/modelo)
  ================================

  Observação para iniciantes:
  - "Tipo" (mobile/tablet/desktop) conseguimos detectar bem.
  - "Marca/Modelo" depende do que o navegador expõe. Em muitos Android (Chrome),
    dá para pegar o "model" via User-Agent Client Hints (userAgentData).
    Em iPhone/iPad, o Safari normalmente NÃO informa o modelo exato (ex.: iPhone 14),
    então mostramos apenas "Apple iPhone" / "Apple iPad".

  Importante:
  - Isso serve só para exibir no badge da tela.
  - Não interfere na geração do PDF nem muda comportamento em Android/Desktop.
*/

// Pequeno "mapa" opcional para transformar códigos em nomes comerciais.
// Se quiser, você pode completar com o seu caso.
// Ex.: { "SM-S711B": "Samsung Galaxy S23 FE" }
const DEVICE_MODEL_MAP = {
    /*
      COMO USAR ESTE MAPA (bem simples):
      - A chave é o "código do aparelho" que aparece no Android (ex.: SM-S711B).
      - O valor é o nome comercial que você quer mostrar no badge (ex.: Galaxy S23 FE).
      - Você pode adicionar/remover linhas à vontade.

      DICA: deixe as chaves em MAIÚSCULAS.
    */

    // Samsung (exemplos comuns no Brasil)
    "SM-S711B": "Galaxy S23 FE",

    // Galaxy S25 Series
    "SM-S931": "Galaxy S25",
    "SM-S931B": "Galaxy S25",
    "SM-S936": "Galaxy S25+",
    "SM-S936B": "Galaxy S25+",
    "SM-S937": "Galaxy S25 Edge",
    "SM-S937B": "Galaxy S25 Edge",
    "SM-S938": "Galaxy S25 Ultra",
    "SM-S938B": "Galaxy S25 Ultra"
};

/**
 * Converte um código de modelo (ex.: "SM-S711B") em um nome comercial (ex.: "Galaxy S23 FE")
 * usando o DEVICE_MODEL_MAP.
 *
 * Por que isso existe?
 * - Alguns navegadores devolvem o modelo com pequenas variações (ex.: "SM-S931B/DS").
 * - Aqui normalizamos para tentar encontrar no mapa sem você precisar duplicar chaves.
 */
function mapModelToCommercialName(modelRaw) {
    if (!modelRaw) return "";

    // Normalização básica (iniciante-friendly):
    // - transforma em maiúsculo
    // - remove espaços
    let normalized = String(modelRaw).toUpperCase().trim().replace(/\s+/g, "");

    // Tenta direto
    if (DEVICE_MODEL_MAP[normalized]) return DEVICE_MODEL_MAP[normalized];

    // Remove variações comuns (Dual SIM costuma aparecer como "/DS")
    normalized = normalized.replace(/\/DS$/i, "");
    if (DEVICE_MODEL_MAP[normalized]) return DEVICE_MODEL_MAP[normalized];

    // Às vezes aparece com sufixos longos (ex.: códigos de cor/mercado). Pegamos só o começo.
    // Ex.: "SM-S936BLBJZTO" -> tentamos "SM-S936B" primeiro.
    const maybeShort = normalized.match(/^SM-[A-Z0-9]+/i)?.[0] || normalized;
    if (DEVICE_MODEL_MAP[maybeShort]) return DEVICE_MODEL_MAP[maybeShort];

    // Se não achou no mapa, devolve o que veio do aparelho (melhor do que ficar vazio)
    return modelRaw;
}


/** Tenta extrair uma marca a partir do User-Agent (melhor esforço). */
function guessBrandFromUA(uaLower) {
    if (/iphone|ipad|ipod/.test(uaLower)) return 'Apple';
    // iPadOS às vezes se identifica como "Macintosh" no User-Agent
    if (/macintosh/.test(uaLower) && (navigator.maxTouchPoints || 0) > 1) return 'Apple';
    if (/samsung/.test(uaLower) || /\bsm-[a-z0-9]+\b/.test(uaLower)) return 'Samsung';
    if (/pixel/.test(uaLower)) return 'Google';
    if (/huawei|honor/.test(uaLower)) return 'Huawei';
    if (/xiaomi|redmi|poco/.test(uaLower)) return 'Xiaomi';
    if (/motorola|moto /.test(uaLower)) return 'Motorola';
    if (/oneplus/.test(uaLower)) return 'OnePlus';
    if (/asus/.test(uaLower)) return 'ASUS';
    if (/sony/.test(uaLower)) return 'Sony';
    if (/lg/.test(uaLower)) return 'LG';
    return '';
}

/** Tenta extrair o "modelo" a partir do User-Agent (melhor esforço). */
function guessModelFromUA(userAgent) {
    // Muitos Android têm o padrão: "Android 14; SM-S711B Build/...."
    const m1 = userAgent.match(/Android\s[\d\.]+;\s*([^;]+)\s*Build/i);
    if (m1 && m1[1]) return m1[1].trim();

    // Samsung: SM-XXXX explícito em vários UAs
    const m2 = userAgent.match(/\bSM-[A-Z0-9]+\b/i);
    if (m2 && m2[0]) return m2[0].toLocaleUpperCase('pt-BR');

    // Google Pixel costuma vir como "Pixel 8" etc.
    const m3 = userAgent.match(/\bPixel\s[\w\s]+?\b/i);
    if (m3 && m3[0]) return m3[0].trim();

    // iOS: não dá para saber o modelo (14/15/...) pelo UA
    if (/iPhone/i.test(userAgent)) return 'iPhone';
    if (/iPad/i.test(userAgent)) return 'iPad';
    // iPadOS pode aparecer como Macintosh
    if (/Macintosh/i.test(userAgent) && (navigator.maxTouchPoints || 0) > 1) return 'iPad';

    return '';
}

/**
 * Retorna uma string com "Marca Modelo" quando disponível.
 * Ex.: "Samsung SM-S711B" ou "Google Pixel 8".
 * Pode retornar "" se não houver dados confiáveis.
 */
async function getDeviceBrandModelLabel() {
    const ua = navigator.userAgent || '';
    const uaLower = ua.toLowerCase();

    // 1) Tenta pegar model via User-Agent Client Hints (Chrome/Edge modernos)
    // Isso funciona bem em Android Chrome. No Safari iOS, geralmente não existe.
    let modelFromHints = '';
    try {
        if (navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) {
            const data = await navigator.userAgentData.getHighEntropyValues(['model', 'platform']);
            if (data && data.model) modelFromHints = String(data.model).trim();
        }
    } catch (e) {
        // Ignora: navegador não suporta ou bloqueou.
    }

    const brand = guessBrandFromUA(uaLower);
    const modelRaw = modelFromHints || guessModelFromUA(ua);

    if (!brand && !modelRaw) return '';

    // Se existir um nome "bonito" no mapa, usamos.
    const modelPretty = mapModelToCommercialName(modelRaw);

    // Monta texto final
    if (brand && modelPretty) return `${brand} ${modelPretty}`.trim();
    if (brand) return brand;
    return modelPretty;
}

// Exibe informação do dispositivo
async function displayDeviceInfo() {
    const device = detectDevice();
    const deviceBadge = document.getElementById('device-info');
    if (!deviceBadge) return;

    // Ex.: "Mobile - Samsung SM-S711B"
    const tipo = device.type.charAt(0).toLocaleUpperCase('pt-BR') + device.type.slice(1);

    // Busca marca/modelo (melhor esforço). Pode ser "" em alguns navegadores.
    const brandModel = await getDeviceBrandModelLabel();

    deviceBadge.textContent = `${device.icon} ${brandModel ? `${tipo} - ${brandModel}` : tipo}`;
    deviceBadge.className = `device-badge ${device.type}`;
}

// Detecta iOS
function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

// Detecta Android
function isAndroid() {
    return /Android/i.test(navigator.userAgent);
}

// Vibração para feedback em dispositivos móveis
function vibrateDevice(duration = 50) {
    if ('vibrate' in navigator && detectDevice().type === 'mobile') {
        navigator.vibrate(duration);
    }
}

// Formatar CPF
function formatCPF(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 11) {
        value = value.slice(0, 11);
    }
    
    if (value.length > 9) {
        value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    } else if (value.length > 6) {
        value = value.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (value.length > 3) {
        value = value.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    }
    
    input.value = value;
}

// Formatar Valor
function formatValor(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value === '') {
        input.value = '';
        return;
    }
    
    value = parseInt(value).toString();
    
    const length = value.length;
    
    if (length === 1) {
        value = '0,0' + value;
    } else if (length === 2) {
        value = '0,' + value;
    } else {
        value = value.slice(0, -2) + ',' + value.slice(-2);
    }
    
    value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    input.value = value;
}

// Alternar campos de responsável
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

// Atualizar limite de dias baseado no mês
function updateDayLimit() {
    const mes = document.getElementById('mes').value;
    const ano = parseInt(document.getElementById('ano').value);
    const diaInput = document.getElementById('dia');
    const diaAtual = parseInt(diaInput.value);
    
    const diasPorMes = {
        'JANEIRO': 31, 'FEVEREIRO': 28, 'MARÇO': 31, 'ABRIL': 30,
        'MAIO': 31, 'JUNHO': 30, 'JULHO': 31, 'AGOSTO': 31,
        'SETEMBRO': 30, 'OUTUBRO': 31, 'NOVEMBRO': 30, 'DEZEMBRO': 31
    };
    
    let maxDias = 31;
    
    if (mes && diasPorMes[mes]) {
        maxDias = diasPorMes[mes];
        
        if (mes === 'FEVEREIRO' && ano) {
            const bissexto = (ano % 4 === 0 && ano % 100 !== 0) || (ano % 400 === 0);
            maxDias = bissexto ? 29 : 28;
        }
    }
    
    diaInput.max = maxDias;
    
    if (diaAtual > maxDias) {
        diaInput.value = maxDias;
    }
}

// Atualizar preview
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

    // Usamos versões "limpas" dos campos para evitar que vírgula/ponto FINAL do usuário
    // entre no <strong> (negrito). A pontuação do template fica fora do negrito.
    const nomeResponsavelClean = stripTrailingTemplatePunctuation(nomeResponsavel);
    const nomeClean = stripTrailingTemplatePunctuation(nome);
    const cpfClean = stripTrailingTemplatePunctuation(cpf);
    const cirurgiaClean = stripTrailingTemplatePunctuation(cirurgia);
    const hospitalClean = stripTrailingTemplatePunctuation(hospital);

    
    let textoRecibo = 'Recebi de ';
    
    if (acompanhado && nomeResponsavel) {
        textoRecibo += '<strong>' + nomeResponsavelClean.toLocaleUpperCase('pt-BR') + '</strong>, responsável por <strong>' + 
                      (nomeClean || '********************************') + '</strong>';
    } else {
        textoRecibo += '<strong>' + (nomeClean || '********************************') + '</strong>';
    }
    
        // CPF: deixa o LABEL fora do negrito e coloca em negrito apenas o NÚMERO.
    // A vírgula depois do CPF também fica fora do negrito (pedido seu).
    textoRecibo += ', CPF.: <strong>' + (cpfClean || '***.***.***-**') + '</strong>,';
    textoRecibo += ' o valor de <strong>R$ ' + (valor || '***,**') + '</strong>';
    textoRecibo += ' referente ao serviço prestado da instrumentação cirúrgica para cirurgia de ';
    textoRecibo += '<strong>' + (cirurgiaClean || '*******************') + '</strong>';
    textoRecibo += ', realizada no hospital <strong>' + (hospitalClean || '**********') + '</strong>.';
    
    document.getElementById('receipt-text').innerHTML = textoRecibo;
    
    const dataCompleta = dia && mes && ano 
        ? dia + ' de ' + mes.charAt(0) + mes.slice(1).toLowerCase() + ' de ' + ano
        : '** de ********** de ****';
    
    document.querySelector('.receipt-location').textContent = 'Juiz de Fora, ' + dataCompleta;
}

// Mostrar modal
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
    
    // Validação
    if (!nome || !cpf || !valor || !cirurgia || !hospital || !dia || !mes || !ano) {
        alert('Por favor, preencha todos os campos obrigatórios!');
        vibrateDevice(200);
        return;
    }
    
    if (acompanhado && !nomeResponsavel) {
        alert('Por favor, preencha o nome do responsável!');
        vibrateDevice(200);
        return;
    }
    
    if (cpf.length !== 14) {
        alert('Por favor, preencha o CPF completo!');
        vibrateDevice(200);
        return;
    }
    
    // Montar preview do modal
        // Para evitar erro no modo "Acompanhado":
    // O preview do modal usa uma versão "limpa" do nome do responsável
    // (sem vírgula/ponto FINAL caso o usuário digite). Isso NÃO muda o que você digitou,
    // apenas controla como exibimos no preview.
    const nomeResponsavelClean = stripTrailingTemplatePunctuation(nomeResponsavel);

let previewHTML = '<p><strong>Paciente:</strong> ' + nome.toLocaleUpperCase('pt-BR') + '</p>';
    
    if (acompanhado) {
        previewHTML += '<p><strong>Responsável:</strong> ' + nomeResponsavelClean.toLocaleUpperCase('pt-BR') + '</p>';
        previewHTML += '<p><strong>CPF do Responsável:</strong> ' + cpf + '</p>';
    } else {
        previewHTML += '<p><strong>CPF:</strong> ' + cpf + '</p>';
    }
    
    previewHTML += '<p><strong>Valor:</strong> R$ ' + valor + '</p>';
    previewHTML += '<p><strong>Tipo de Cirurgia:</strong> ' + cirurgia.toLocaleUpperCase('pt-BR') + '</p>';
    previewHTML += '<p><strong>Hospital:</strong> ' + hospital.toLocaleUpperCase('pt-BR') + '</p>';
    previewHTML += '<p><strong>Data:</strong> ' + dia + ' de ' + mes.charAt(0) + mes.slice(1).toLowerCase() + ' de ' + ano + '</p>';
    
    document.getElementById('modal-preview').innerHTML = previewHTML;
    document.getElementById('confirmModal').style.display = 'block';
    
    vibrateDevice();
}

// Fechar modal
function closeModal() {
    document.getElementById('confirmModal').style.display = 'none';
    vibrateDevice();
}

// Gerar PDF

// ============================================================================
// ✅ NOVO: Toast (mensagem discreta) - melhor que alert() no mobile
// ----------------------------------------------------------------------------
// Por que isso existe?
// - No celular, "alert()" é chato e pode até atrapalhar o fluxo (principalmente no iPhone).
// - Um "toast" é só uma mensagem pequena que some sozinha.
//
// Observação: isso NÃO muda nada no PDF. É só um feedback para o usuário.
// ============================================================================
function showToast(message, duration = 2500) {
    try {
        let toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';

            // Estilos inline para não depender do CSS do projeto.
            toast.style.position = 'fixed';
            toast.style.left = '50%';
            toast.style.bottom = '24px';
            toast.style.transform = 'translateX(-50%)';
            toast.style.background = 'rgba(0,0,0,0.85)';
            toast.style.color = '#fff';
            toast.style.padding = '10px 14px';
            toast.style.borderRadius = '10px';
            toast.style.fontSize = '14px';
            toast.style.zIndex = '9999';
            toast.style.maxWidth = '90vw';
            toast.style.textAlign = 'center';
            toast.style.boxShadow = '0 6px 18px rgba(0,0,0,0.25)';
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 150ms ease';

            document.body.appendChild(toast);
        }

        toast.textContent = message;
        toast.style.opacity = '1';

        clearTimeout(window.__toastTimer);
        window.__toastTimer = setTimeout(() => {
            toast.style.opacity = '0';
        }, duration);
    } catch (e) {
        // Se algo der errado (muito raro), não travamos o app.
        console.log('Toast falhou:', e);
    }
}

// ============================================================================
// ✅ NOVO: Entregar o PDF no iPhone (iOS)
// ----------------------------------------------------------------------------
// Por que precisamos disso?
// - No iPhone (Safari), downloads são "estranhos": às vezes não abre nada, ou o usuário
//   não sabe onde foi parar.
// - A melhor UX no iOS é abrir o menu "Compartilhar" (Salvar em Arquivos, WhatsApp, etc.).
// - Se o dispositivo não suportar isso, abrimos um preview em nova aba.
// - Se o Safari bloquear popup, mostramos um botão "Abrir PDF" na própria tela.
// ============================================================================
async function entregarPDFNoIOS(pdfBlob, filename) {
    try {
        const file = new File([pdfBlob], filename, { type: 'application/pdf' });

        // iOS moderno (e alguns outros navegadores) suportam Web Share com arquivos.
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: 'Recibo',
                text: 'PDF do recibo gerado. Você pode salvar em Arquivos ou compartilhar.'
            });
            return;
        }
    } catch (e) {
        // Se o usuário cancelar, ou se não suportar, seguimos para o fallback.
    }

    // Fallback: abrir preview em outra aba
    const url = URL.createObjectURL(pdfBlob);
    const opened = window.open(url, '_blank');

    // Se o popup foi bloqueado (muito comum no Safari), mostramos um link na tela.
    if (!opened) {
        let box = document.getElementById('pdfLinkBox');
        if (!box) {
            box = document.createElement('div');
            box.id = 'pdfLinkBox';

            box.style.marginTop = '16px';
            box.style.padding = '14px';
            box.style.border = '2px solid #667eea';
            box.style.borderRadius = '10px';
            box.style.background = '#f8f9ff';
            box.style.textAlign = 'center';

            // Coloca o aviso no topo do container (onde fica o formulário)
            const container = document.querySelector('.container');
            if (container) container.prepend(box);
            else document.body.prepend(box);
        }

        box.innerHTML = `
            <strong>📄 PDF gerado!</strong><br><br>
            <a href="${url}" target="_blank" style="font-size:16px; font-weight:bold;">
                👉 Toque aqui para abrir o PDF
            </a>
            <div style="margin-top:10px; font-size:13px; color:#555;">
                No iPhone: após abrir, toque em <strong>Compartilhar</strong> → <strong>Salvar em Arquivos</strong>
            </div>
        `;
    }

    // Limpa a URL depois de um tempo (boa prática).
    setTimeout(() => URL.revokeObjectURL(url), 60000);
}

// ============================================================================
// ✅ NOVO: Preencher automaticamente o ANO com o ano atual do dispositivo
// ----------------------------------------------------------------------------
// Pedido seu: quando abrir a página, o campo "Ano" deve vir com o ano atual,
// mas você ainda pode alterar manualmente (o select continua livre).
// ============================================================================
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

    anoSelect.value = anoAtual;

    // Se o mês já estiver escolhido, isso ajuda a ajustar fevereiro (bissexto).
    updateDayLimit();
}

// Deixa a assinatura do PREVIEW em negrito (somente a assinatura).
// Isso não afeta o PDF (o PDF tem sua própria formatação).
function aplicarNegritoAssinaturaPreview() {
    const nameEl = document.querySelector('.signature-name');
    const cpfEl = document.querySelector('.signature-cpf');
    if (nameEl) nameEl.style.fontWeight = 'bold';
    if (cpfEl) cpfEl.style.fontWeight = 'bold';
}


// ============================================================================
// ✅ NOVO: Texto do recibo com negrito (sem "grudar" palavras)
// ----------------------------------------------------------------------------
// A ideia aqui é desenhar o texto "na mão" porque o jsPDF não faz negrito no meio
// do parágrafo automaticamente.
//
// Também adicionamos 2 melhorias pedidas por você:
// 1) Se "CPF.: 111...-11," não couber no final da primeira linha, jogamos TODO esse
//    bloco para a segunda linha, e centralizamos a primeira linha.
// 2) Evitamos que uma linha termine com palavrinhas "da/de/do/no..." (fica feio),
//    movendo essa palavra para a linha seguinte quando possível.
// ============================================================================
function buildReceiptSegments({ acompanhado, nomeResponsavel, cpf, nome, valor, cirurgia, hospital }) {
    // "Limpeza" para evitar pontuação FINAL entrar no negrito.
    // Ex.: nome digitado como "JOÃO," -> a vírgula não deve ficar em negrito.
    const responsavelClean = stripTrailingTemplatePunctuation(nomeResponsavel);
    const pacienteClean = stripTrailingTemplatePunctuation(nome);
    const cpfClean = stripTrailingTemplatePunctuation(cpf);
    const cirurgiaClean = stripTrailingTemplatePunctuation(cirurgia);
    const hospitalClean = stripTrailingTemplatePunctuation(hospital);

    const responsavel = (responsavelClean || '').toLocaleUpperCase('pt-BR');
    const paciente = (pacienteClean || '').toLocaleUpperCase('pt-BR');
    const cirurgiaUp = (cirurgiaClean || '').toLocaleUpperCase('pt-BR');
    const hospitalUp = (hospitalClean || '').toLocaleUpperCase('pt-BR');

    // "group: 'cpfBlock'" = nosso "bloco não-quebrável" (CPF + número + vírgula).
    // Assim evitamos: "CPF.:" no fim da linha e o número sozinho na linha de baixo.
    const cpfBlock = [
        { text: 'CPF.: ', style: 'normal', group: 'cpfBlock' },
        { text: cpfClean, style: 'bold', group: 'cpfBlock' },
        { text: ',', style: 'normal', group: 'cpfBlock' }
    ];

    if (acompanhado) {
        return [
            { text: 'Recebi de ', style: 'normal' },
            { text: responsavel, style: 'bold' },
            { text: ',', style: 'normal' },
            { text: ' ', style: 'normal' }, // espaço que some automaticamente se cair no início de uma nova linha

            ...cpfBlock,

            { text: ' responsável de ', style: 'normal' },
            { text: paciente, style: 'bold' },

            { text: ' o valor de R$ ', style: 'normal' },
            { text: valor, style: 'bold' },

            { text: ' referente ao serviço prestado da instrumentação cirúrgica para cirurgia de ', style: 'normal' },
            { text: cirurgiaUp, style: 'bold' },

            { text: ' realizada no hospital ', style: 'normal' },
            { text: hospitalUp, style: 'bold' },
            { text: '.', style: 'normal' }
        ];
    }

    // Não acompanhado
    return [
        { text: 'Recebi de ', style: 'normal' },
        { text: paciente, style: 'bold' },
        { text: ',', style: 'normal' },
        { text: ' ', style: 'normal' },

        ...cpfBlock,

        { text: ' o valor de R$ ', style: 'normal' },
        { text: valor, style: 'bold' },

        { text: ' referente ao serviço prestado da instrumentação cirúrgica para cirurgia de ', style: 'normal' },
        { text: cirurgiaUp, style: 'bold' },

        { text: ' realizada no hospital ', style: 'normal' },
        { text: hospitalUp, style: 'bold' },
        { text: '.', style: 'normal' }
    ];
}

// Divide texto preservando espaços (para não acontecer "nohospital" / "dainstrumentação")
function tokenizeSegments(segments) {
    const tokens = [];
    segments.forEach(seg => {
        const style = seg.style || 'normal';
        const group = seg.group || null;
        const parts = String(seg.text || '').split(/(\s+)/).filter(p => p !== '');
        parts.forEach(p => tokens.push({ text: p, style, group }));
    });
    return tokens;
}

function isSpaceToken(t) {
    return /^\s+$/.test(t);
}

// Normaliza uma palavra para comparar com nossa lista de "palavras órfãs"
function normalizeWordForOrphanCheck(text) {
    return String(text || '').replace(/[^A-Za-zÀ-ÿ]/g, '').toLowerCase();
}


// Remove pontuação FINAL (vírgula/ponto) que às vezes o usuário pode digitar sem querer.
// Isso é útil porque nosso template já adiciona ",", "." depois dos campos.
// Ex.: se o usuário digitar "JOÃO," no campo, a vírgula sairia em negrito (por estar dentro do campo).
// Aqui nós removemos essas pontuações finais para que a pontuação do TEMPLATE (fora do negrito) seja usada.
function stripTrailingTemplatePunctuation(value) {
    let s = String(value || '').trim();
    // remove repetidamente vírgulas/pontos apenas no FINAL
    while (s.length && /[,.]/.test(s[s.length - 1])) {
        s = s.slice(0, -1).trimEnd();
    }
    return s;
}

// Faz o "layout" do texto em linhas, considerando:
// - largura máxima (maxWidth)
// - negrito/normal (porque muda o tamanho do texto)
// - blocos não-quebráveis (CPF)
// - evitar "palavras órfãs" no fim da linha
function layoutRichText(doc, segments, maxWidth, options = {}) {
    const indent = Number(options.firstLineIndent || 0);
    const cpfGroupId = options.cpfGroupId || 'cpfBlock';

    // Lista de palavras pequenas que ficam feias no fim da linha
    const orphanWords = options.orphanWords || ['da', 'de', 'do', 'das', 'dos', 'no', 'na', 'nos', 'nas', 'e'];
    const avoidOrphans = options.avoidOrphans !== false; // padrão: true

    const tokens = tokenizeSegments(segments);

    // ====== "Grudar" preposições à próxima palavra (anti "dainstrumentação") ======
    // Em alguns visualizadores de PDF, ao COPIAR o texto, a quebra de linha pode "sumir"
    // e palavras podem aparecer grudadas (ex.: "da" + "instrumentação" -> "dainstrumentação").
    //
    // Para evitar isso, fazemos um mini "bloco não-quebrável" com:
    //   [preposição] + [espaço] + [próxima palavra]
    // Exemplos: "da instrumentação", "no hospital", "de JOÃO", etc.
    //
    // Importante: isso NÃO muda o texto, só evita quebrar linha no meio desses pares.
    for (let k = 0; k < tokens.length - 2; k++) {
        const t0 = tokens[k];
        const t1 = tokens[k + 1];
        const t2 = tokens[k + 2];

        // Não mexe em nada que já tenha grupo (ex.: bloco do CPF)
        if (t0.group || t1.group || t2.group) continue;

        const w0 = normalizeWordForOrphanCheck(t0.text);
        if (!w0 || !orphanWords.includes(w0)) continue;

        // Precisamos do padrão: palavra + espaço + palavra
        if (!isSpaceToken(t1.text)) continue;

        const w2 = normalizeWordForOrphanCheck(t2.text);
        if (!w2) continue;

        // Grupo único só para esse trio
        const gid = `keepNext_${k}`;
        t0.group = gid;
        t1.group = gid;
        t2.group = gid;
    }

    const lines = [];
    let lineTokens = [];
    let lineWidth = 0;
    let lineIndex = 0;

    // Flag para saber se o CPF foi empurrado para a linha de baixo
    let cpfWrapped = false;

    const getWidth = (tok) => {
        doc.setFont('helvetica', tok.style === 'bold' ? 'bold' : 'normal');
        return doc.getTextWidth(tok.text);
    };

    const availableWidthForLine = (idx) => maxWidth - (idx === 0 ? indent : 0);

    const trimEndSpaces = () => {
        while (lineTokens.length && isSpaceToken(lineTokens[lineTokens.length - 1].text)) {
            const t = lineTokens.pop();
            lineWidth -= getWidth(t);
        }
    };

    const pushLine = () => {
        trimEndSpaces();
        // Evita adicionar linha vazia sem necessidade
        if (lineTokens.length) {
            lines.push({ tokens: lineTokens, width: lineWidth });
        }
        lineTokens = [];
        lineWidth = 0;
        lineIndex += 1;
    };

    // Se a linha termina com "da/de/do..." e ainda existe texto depois,
    // movemos essa palavrinha para a próxima linha.
    const moveOrphanToNextLine = (insertAtIndex) => {
        trimEndSpaces();
        if (!lineTokens.length) return;

        const lastTok = lineTokens[lineTokens.length - 1];
        const lastWord = normalizeWordForOrphanCheck(lastTok.text);

        if (!lastWord || !orphanWords.includes(lastWord)) return;

        // Contar quantas palavras existem na linha (para não esvaziar a linha)
        let words = 0;
        lineTokens.forEach(t => {
            if (!isSpaceToken(t.text) && normalizeWordForOrphanCheck(t.text)) words++;
        });
        if (words <= 1) return;

        // Remove a palavra órfã
        const moved = [];
        const wordTok = lineTokens.pop();
        lineWidth -= getWidth(wordTok);
        moved.unshift(wordTok);

        // Se existir um espaço ANTES dela, movemos junto
        if (lineTokens.length && isSpaceToken(lineTokens[lineTokens.length - 1].text)) {
            const spaceTok = lineTokens.pop();
            lineWidth -= getWidth(spaceTok);
            moved.unshift(spaceTok);
        }

        // Coloca de volta na fila para ser processado na próxima linha
        tokens.splice(insertAtIndex, 0, ...moved);
    };

    for (let i = 0; i < tokens.length; ) {
        const tok = tokens[i];

        // Evita começar uma linha com espaço.
        if (lineTokens.length === 0 && isSpaceToken(tok.text)) {
            i++;
            continue;
        }

        const available = availableWidthForLine(lineIndex);

        // ====== Bloco não-quebrável (CPF) ======
        if (tok.group) {
            const gid = tok.group;
            let j = i;
            const groupTokens = [];

            while (j < tokens.length && tokens[j].group === gid) {
                groupTokens.push(tokens[j]);
                j++;
            }

            const groupWidth = groupTokens.reduce((sum, t) => sum + getWidth(t), 0);

            // Se o bloco não cabe no final da linha atual, quebramos ANTES dele.
            // Isso é o que evita "CPF.:" na linha 1 e o número sozinho na linha 2.
            if (groupWidth > (available - lineWidth) && lineTokens.length > 0) {
                if (avoidOrphans) moveOrphanToNextLine(i);

                // Depois de evitar órfãos, talvez a linha tenha mudado.
                if (groupWidth > (available - lineWidth) && lineTokens.length > 0) {
                    // Marca que o CPF foi empurrado para a linha de baixo,
                    // mas SOMENTE se isso ocorreu na primeira linha.
                    if (gid === cpfGroupId && lineIndex === 0) cpfWrapped = true;

                    pushLine();
                    continue; // processa o mesmo bloco novamente na próxima linha
                }
            }

            // Se o bloco for maior que a largura da linha (muito raro),
            // quebramos ele "na marra" (tirando o grupo) para não travar.
            if (lineTokens.length === 0 && groupWidth > available) {
                tokens[i] = { ...tok, group: null };
                continue;
            }

            // Cabe: adiciona o bloco todo
            groupTokens.forEach(t => {
                // Evita começar linha com espaços
                if (lineTokens.length === 0 && isSpaceToken(t.text)) return;
                lineTokens.push(t);
                lineWidth += getWidth(t);
            });

            i = j;
            continue;
        }

        // ====== Token normal ======
        const w = getWidth(tok);

        if (lineWidth + w <= available) {
            lineTokens.push(tok);
            lineWidth += w;
            i++;
            continue;
        }

        // Quebra de linha por falta de espaço
        if (lineTokens.length > 0) {
            if (avoidOrphans) moveOrphanToNextLine(i);
            pushLine();
        } else {
            // Token enorme (quase nunca): força colocar e quebra em seguida.
            lineTokens.push(tok);
            lineWidth += w;
            i++;
            pushLine();
        }
    }

    // Última linha
    pushLine();

    return { lines, cpfWrapped };
}

// Desenha (renderiza) o texto já "quebrado" em linhas
function drawRichText(doc, layout, x, y, maxWidth, lineHeight, options = {}) {
    const indent = Number(options.firstLineIndent || 0);
    const shouldCenterFirstLine = Boolean(options.centerFirstLineIfCpfWrapped && layout.cpfWrapped);

    // Desenha linha por linha
    layout.lines.forEach((line, idx) => {
        let startX = x;

        // Pedido seu: quando o CPF for empurrado para a linha de baixo,
        // centralizamos a PRIMEIRA linha.
        if (idx === 0) {
            if (shouldCenterFirstLine) {
                startX = x + (maxWidth - line.width) / 2;
            } else {
                startX = x + indent; // recuo pequeno só na primeira linha
            }
        }

        let cursorX = startX;
        const cursorY = y + (idx * lineHeight);

        line.tokens.forEach(tok => {
            doc.setFont('helvetica', tok.style === 'bold' ? 'bold' : 'normal');
            const w = doc.getTextWidth(tok.text);

            // Não precisa "desenhar" espaços, basta avançar o cursor.
            if (!isSpaceToken(tok.text)) {
                doc.text(tok.text, cursorX, cursorY);
            }
            cursorX += w;
        });
    });

    // Retorna o Y da última linha (baseline)
    return y + (layout.lines.length - 1) * lineHeight;
}


async function generatePDF() {
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
    const mes = document.getElementById('mes').value; // já vem em caixa alta (ex: JANEIRO)
    const ano = document.getElementById('ano').value;

    // ====== Layout base do PDF (igual ao modelo anexado) ======
    const pageWidth = doc.internal.pageSize.getWidth();   // A4: 210mm
    const pageHeight = doc.internal.pageSize.getHeight(); // A4: 297mm

    const leftMargin = 20;   // margem parecida com o modelo
    const rightMargin = 20;
    const maxWidth = pageWidth - leftMargin - rightMargin;

    const lineHeight = 6.1;   // espaçamento entre linhas do parágrafo
    const firstLineIndent = 5; // "pequeno espaço" no começo do parágrafo

    // Monta os "pedaços" do texto (normal/negrito)
    const segments = buildReceiptSegments({
        acompanhado,
        nomeResponsavel,
        cpf,
        nome,
        valor,
        cirurgia,
        hospital
    });

    // Primeiro: fazemos o layout (quebra em linhas) SEM desenhar ainda.
    // Isso permite calcular o "tamanho total" do conteúdo e centralizar verticalmente.
    doc.setFontSize(14);
    const bodyLayout = layoutRichText(doc, segments, maxWidth, {
        firstLineIndent,
        cpfGroupId: 'cpfBlock',
        avoidOrphans: true
    });

    const linesCount = Math.max(1, bodyLayout.lines.length);

    // ====== Centralização vertical (top/bottom) ======
    // Mantemos as mesmas distâncias do modelo:
    // - título → corpo: 18mm
    // - corpo → data: 24mm
    // - data → assinatura: 36mm
    // - linha do CPF da assinatura: +9mm
    //
    // Total = 87mm + altura do corpo (em função do número de linhas)
const bodyHeight = (linesCount - 1) * lineHeight;

// ====== Centralização vertical (top/bottom) MAIS exata ======
// Antes, nós centralizávamos usando só "87 + bodyHeight" (distâncias entre baselines).
// Isso é quase perfeito, mas NÃO considera que o texto tem "altura" acima/abaixo da baseline.
// Para ficar bem no centro visual (topo e rodapé com o mesmo espaço),
// incluímos uma estimativa da altura do texto do título e do último texto (CPF da assinatura).
const ptToMm = (pt) => pt * 0.3527777778;

// Estimativas simples (boas na prática):
// - ascent: parte do texto acima da baseline (~70%)
// - descent: parte do texto abaixo da baseline (~30%)
const titleAscent = ptToMm(18) * 0.7;      // título usa fontSize 18
const signatureDescent = ptToMm(14) * 0.3; // assinatura usa fontSize 14

// "87" = (título→corpo 18) + (corpo→data 24) + (data→assinatura 36) + (assinatura nome→CPF 9)
const totalHeight = 87 + bodyHeight + titleAscent + signatureDescent;

// y do TÍTULO (baseline) calculado para centralizar o bloco inteiro na página
const titleY = (pageHeight - totalHeight) / 2 + titleAscent;

    const bodyStartY = titleY + 18;
    const endBodyY = bodyStartY + bodyHeight;

    const dateY = endBodyY + 24;
    const signatureNameY = dateY + 36;
    const signatureCpfY = signatureNameY + 9;

    // ====== Desenho do PDF ======

    // Título
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('RECIBO', pageWidth / 2, titleY, { align: 'center' });

    // Corpo do texto (com negrito no meio)
    doc.setFontSize(14);

    // Agora desenha com as regras pedidas:
    // - CPF não quebra no meio (CPF + número + vírgula)
    // - Se precisar quebrar, joga o CPF inteiro para a próxima linha e centraliza a 1ª linha
    const endBodyBaseline = drawRichText(doc, bodyLayout, leftMargin, bodyStartY, maxWidth, lineHeight, {
        firstLineIndent,
        centerFirstLineIfCpfWrapped: true
    });

    // Data (mês em caixa alta; dia com zero à esquerda)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    const diaFmt = String(dia).padStart(2, '0');
    const dataCompleta = `Juiz de Fora, ${diaFmt} de ${String(mes).toLocaleUpperCase('pt-BR')} de ${ano}`;
    doc.text(dataCompleta, leftMargin, dateY);

    // Assinatura (sem linha, como no modelo)
    // Pedido seu: assinatura em NEGRITO ("Daniela Ramos Oliveira" + "CPF 088.959.546-10")
    doc.setFont('helvetica', 'bold');
    doc.text('Daniela Ramos Oliveira', pageWidth / 2, signatureNameY, { align: 'center' });
    doc.text('CPF 088.959.546-10', pageWidth / 2, signatureCpfY, { align: 'center' });
    doc.setFont('helvetica', 'normal');

    // ====== Nome do arquivo (ex: Recibo_DAVI_BONIN_MONTES_05-JANEIRO-2026.pdf) ======
    const safeNome = (nome || 'PACIENTE')
        .trim()
        .toLocaleUpperCase('pt-BR')
        .replace(/\s+/g, '_');

    const nomeArquivo = `Recibo_${safeNome}_${diaFmt}-${String(mes).toLocaleUpperCase('pt-BR')}-${ano}.pdf`;

    // ====== Salvar com comportamento específico para mobile (sem afetar Android/Desktop) ======
    const device = detectDevice();

    if (device.type === 'mobile') {
        // iPhone (iOS): preferimos "Compartilhar" para o usuário escolher onde salvar.
        if (isIOS()) {
            const pdfBlob = doc.output('blob');
            await entregarPDFNoIOS(pdfBlob, nomeArquivo);
            showToast('PDF gerado! Use o menu Compartilhar para salvar.');
        } else if (isAndroid()) {
            // Android: download direto como antes
            doc.save(nomeArquivo);
            showToast('PDF baixado! Verifique sua pasta de Downloads.');
        } else {
            // Outros mobile: fallback
            doc.save(nomeArquivo);
            showToast('Download do PDF iniciado.');
        }
    } else {
        // Desktop/Tablet: download normal
        doc.save(nomeArquivo);
        showToast('Download do PDF iniciado.');
    }

    closeModal();
    vibrateDevice(200);
}

// Fechar modal ao clicar fora
window.onclick = function(event) {
    const modal = document.getElementById('confirmModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Prevenir zoom no double tap em iOS
let lastTouchEnd = 0;
document.addEventListener('touchend', function(event) {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    displayDeviceInfo();
    setAnoPadraoDoDispositivo();
    aplicarNegritoAssinaturaPreview();
    updatePreview();
    
    // Atualizar info do dispositivo em resize (para tablets em rotação)
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            displayDeviceInfo();
        }, 250);
    });
    
    console.log('Gerador de Recibos carregado com sucesso!');
    console.log('Dispositivo detectado:', detectDevice().type);
});
