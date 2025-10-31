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

// Exibe informação do dispositivo
function displayDeviceInfo() {
    const device = detectDevice();
    const deviceBadge = document.getElementById('device-info');
    
    deviceBadge.textContent = `${device.icon} ${device.type.charAt(0).toUpperCase() + device.type.slice(1)}`;
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
    
    let textoRecibo = 'Recebi de ';
    
    if (acompanhado && nomeResponsavel) {
        textoRecibo += '<strong>' + nomeResponsavel.toUpperCase() + '</strong>, responsável por <strong>' + 
                      (nome || '********************************') + '</strong>';
    } else {
        textoRecibo += '<strong>' + (nome || '********************************') + '</strong>';
    }
    
    textoRecibo += ', <strong>CPF.: ' + (cpf || '***.***.***-**') + '</strong>';
    textoRecibo += ' o valor de <strong>R$ ' + (valor || '***,**') + '</strong>';
    textoRecibo += ' referente ao serviço prestado da instrumentação cirúrgica para cirurgia de ';
    textoRecibo += '<strong>' + (cirurgia || '*******************') + '</strong>';
    textoRecibo += ', realizada no hospital <strong>' + (hospital || '**********') + '</strong>.';
    
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
    let previewHTML = '<p><strong>Paciente:</strong> ' + nome.toUpperCase() + '</p>';
    
    if (acompanhado) {
        previewHTML += '<p><strong>Responsável:</strong> ' + nomeResponsavel.toUpperCase() + '</p>';
        previewHTML += '<p><strong>CPF do Responsável:</strong> ' + cpf + '</p>';
    } else {
        previewHTML += '<p><strong>CPF:</strong> ' + cpf + '</p>';
    }
    
    previewHTML += '<p><strong>Valor:</strong> R$ ' + valor + '</p>';
    previewHTML += '<p><strong>Tipo de Cirurgia:</strong> ' + cirurgia.toUpperCase() + '</p>';
    previewHTML += '<p><strong>Hospital:</strong> ' + hospital.toUpperCase() + '</p>';
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
function generatePDF() {
    vibrateDevice(100);
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
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
    
    // Configurar fonte
    doc.setFont("times", "normal");
    
    // Título
    doc.setFontSize(18);
    doc.setFont("times", "bold");
    doc.text("RECIBO", 105, 40, { align: "center" });
    
    // Corpo do texto
    doc.setFontSize(12);
    doc.setFont("times", "normal");
    
    let textoRecibo = 'Recebi de ';
    
    if (acompanhado && nomeResponsavel) {
        textoRecibo += nomeResponsavel.toUpperCase() + ', responsável por ' + nome.toUpperCase();
    } else {
        textoRecibo += nome.toUpperCase();
    }
    
    textoRecibo += ', CPF.: ' + cpf + ' o valor de R$ ' + valor;
    textoRecibo += ' referente ao serviço prestado da instrumentação cirúrgica para cirurgia de ';
    textoRecibo += cirurgia.toUpperCase() + ', realizada no hospital ' + hospital.toUpperCase() + '.';
    
    const linhasTexto = doc.splitTextToSize(textoRecibo, 170);
    doc.text(linhasTexto, 20, 70);
    
    // Data
    const dataCompleta = 'Juiz de Fora, ' + dia + ' de ' + mes.charAt(0) + mes.slice(1).toLowerCase() + ' de ' + ano;
    const posicaoData = 70 + (linhasTexto.length * 10) + 30;
    doc.text(dataCompleta, 190, posicaoData, { align: "right" });
    
    // Assinatura
    const posicaoAssinatura = posicaoData + 50;
    doc.line(55, posicaoAssinatura, 155, posicaoAssinatura);
    
    doc.setFont("times", "bold");
    doc.text("Daniela Ramos Oliveira", 105, posicaoAssinatura + 7, { align: "center" });
    
    doc.setFont("times", "normal");
    doc.text("CPF.: 088.959.546-10", 105, posicaoAssinatura + 14, { align: "center" });
    
    // Salvar com comportamento específico para mobile
    const device = detectDevice();
    const nomeArquivo = 'Recibo_' + nome.replace(/\s+/g, '_') + '_' + dia + '-' + mes + '-' + ano + '.pdf';
    
    if (device.type === 'mobile') {
        if (isIOS()) {
            // iOS: Abre em nova aba
            const pdfBlob = doc.output('blob');
            const url = URL.createObjectURL(pdfBlob);
            window.open(url, '_blank');
            
            // Feedback visual
            setTimeout(() => {
                alert('PDF gerado! Verifique a nova aba para visualizar ou salvar.');
            }, 500);
        } else if (isAndroid()) {
            // Android: Download direto
            doc.save(nomeArquivo);
            
            // Feedback visual
            setTimeout(() => {
                alert('PDF baixado! Verifique sua pasta de Downloads.');
            }, 500);
        } else {
            // Outros mobile: fallback
            doc.save(nomeArquivo);
        }
    } else {
        // Desktop/Tablet: download normal
        doc.save(nomeArquivo);
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
