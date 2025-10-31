// Funções de manipulação de formulário
function toggleResponsavel() {
    const checkbox = document.getElementById('acompanhado');
    const responsavelSection = document.getElementById('responsavel-section');
    const cpfLabel = document.getElementById('cpfLabel');
    
    if (checkbox.checked) {
        responsavelSection.style.display = 'block';
        cpfLabel.textContent = 'CPF do Responsável:';
    } else {
        responsavelSection.style.display = 'none';
        cpfLabel.textContent = 'CPF:';
    }
    
    updatePreview();
}

function formatDia(input) {
    let value = parseInt(input.value);
    if (value && value >= 1 && value <= 31) {
        input.value = value.toString().padStart(2, '0');
    }
}

function updateDayLimit() {
    const mes = document.getElementById('mes').value;
    const ano = document.getElementById('ano').value || 2025;
    const diaInput = document.getElementById('dia');
    
    let maxDays = 31;
    
    if (mes === 'FEVEREIRO') {
        const anoNum = parseInt(ano);
        maxDays = (anoNum % 4 === 0 && (anoNum % 100 !== 0 || anoNum % 400 === 0)) ? 29 : 28;
    } else if (['ABRIL', 'JUNHO', 'SETEMBRO', 'NOVEMBRO'].includes(mes)) {
        maxDays = 30;
    }
    
    diaInput.max = maxDays;
    
    if (parseInt(diaInput.value) > maxDays) {
        diaInput.value = maxDays;
    }
}

function formatCPF(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length <= 11) {
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    input.value = value;
}

function formatValor(input) {
    let value = input.value.replace(/\D/g, '');
    if (value) {
        value = (parseInt(value) / 100).toFixed(2);
        value = value.replace('.', ',');
        value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
    input.value = value;
}

function updatePreview() {
    const acompanhado = document.getElementById('acompanhado').checked;
    const nome = document.getElementById('nome').value.trim().toUpperCase();
    const cpf = document.getElementById('cpf').value.trim();
    const nomeResponsavel = document.getElementById('nomeResponsavel').value.trim().toUpperCase();
    const valor = document.getElementById('valor').value.trim();
    const cirurgia = document.getElementById('cirurgia').value.trim().toUpperCase();
    const hospital = document.getElementById('hospital').value.trim().toUpperCase();
    const dia = document.getElementById('dia').value;
    const mes = document.getElementById('mes').value;
    const ano = document.getElementById('ano').value;

    let receiptText = '';

    if (acompanhado) {
        const nomeResp = nomeResponsavel || '********************************';
        const cpfText = cpf || '***.***.***-**';
        const nomeText = nome || '********************************';
        const valorText = valor || '***,**';
        const cirurgiaText = cirurgia || '*******************';
        const hospitalText = hospital || '**********';

        receiptText = `Recebi de <strong>${nomeResp}</strong>, <strong>CPF.: ${cpfText}</strong>, responsável de <strong>${nomeText}</strong> o valor de <strong>R$ ${valorText}</strong> referente ao serviço prestado da instrumentação cirúrgica para cirurgia de <strong>${cirurgiaText}</strong>, realizada no hospital <strong>${hospitalText}</strong>.`;
    } else {
        const nomeText = nome || '********************************';
        const cpfText = cpf || '***.***.***-**';
        const valorText = valor || '***,**';
        const cirurgiaText = cirurgia || '*******************';
        const hospitalText = hospital || '**********';

        receiptText = `Recebi de <strong>${nomeText}</strong>, <strong>CPF.: ${cpfText}</strong> o valor de <strong>R$ ${valorText}</strong> referente ao serviço prestado da instrumentação cirúrgica para cirurgia de <strong>${cirurgiaText}</strong>, realizada no hospital <strong>${hospitalText}</strong>.`;
    }

    const diaText = dia || '**';
    const mesText = mes || '**********';
    const anoText = ano || '2025';
    const locationText = `Juiz de Fora, ${diaText} de ${mesText} de ${anoText}`;

    document.getElementById('receipt-text').innerHTML = receiptText;
    document.getElementById('receipt-location').textContent = locationText;
}

// Funções do modal
function showConfirmation() {
    const nome = document.getElementById('nome').value.trim();
    const cpf = document.getElementById('cpf').value.trim();
    const valor = document.getElementById('valor').value.trim();
    const cirurgia = document.getElementById('cirurgia').value.trim();
    const hospital = document.getElementById('hospital').value.trim();
    const dia = document.getElementById('dia').value;
    const mes = document.getElementById('mes').value;
    const ano = document.getElementById('ano').value;

    if (!nome || !cpf || !valor || !cirurgia || !hospital || !dia || !mes || !ano) {
        alert('Por favor, preencha todos os campos obrigatórios!');
        return;
    }

    const acompanhado = document.getElementById('acompanhado').checked;
    const nomeResponsavel = document.getElementById('nomeResponsavel').value.trim();

    if (acompanhado && !nomeResponsavel) {
        alert('Por favor, preencha o nome do responsável!');
        return;
    }

    let previewHTML = '';
    
    if (acompanhado) {
        previewHTML += '<p><strong>Responsável:</strong> ' + nomeResponsavel.toUpperCase() + '</p>';
        previewHTML += '<p><strong>CPF do Responsável:</strong> ' + cpf + '</p>';
        previewHTML += '<p><strong>Paciente:</strong> ' + nome.toUpperCase() + '</p>';
    } else {
        previewHTML += '<p><strong>Nome:</strong> ' + nome.toUpperCase() + '</p>';
        previewHTML += '<p><strong>CPF:</strong> ' + cpf + '</p>';
    }
    
    previewHTML += '<p><strong>Valor:</strong> R$ ' + valor + '</p>';
    previewHTML += '<p><strong>Tipo de Cirurgia:</strong> ' + cirurgia.toUpperCase() + '</p>';
    previewHTML += '<p><strong>Hospital:</strong> ' + hospital.toUpperCase() + '</p>';
    previewHTML += '<p><strong>Data:</strong> ' + dia + ' de ' + mes + ' de ' + ano + '</p>';

    document.getElementById('modalPreview').innerHTML = previewHTML;
    document.getElementById('confirmModal').classList.add('active');
}

function closeModal() {
    document.getElementById('confirmModal').classList.remove('active');
}

function confirmAndGenerate() {
    closeModal();
    generatePDF();
}

function clearForm() {
    document.getElementById('acompanhado').checked = false;
    document.getElementById('nome').value = '';
    document.getElementById('cpf').value = '';
    document.getElementById('nomeResponsavel').value = '';
    document.getElementById('valor').value = '';
    document.getElementById('cirurgia').value = '';
    document.getElementById('hospital').value = '';
    document.getElementById('dia').value = '';
    document.getElementById('mes').value = '';
    document.getElementById('ano').value = '2025';
    toggleResponsavel();
    updatePreview();
}

// Função de geração de PDF
async function generatePDF() {
    const loading = document.getElementById('loading');
    loading.classList.add('active');

    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const acompanhado = document.getElementById('acompanhado').checked;
        const nomeResponsavel = document.getElementById('nomeResponsavel').value.trim().toUpperCase();
        const nome = document.getElementById('nome').value.trim().toUpperCase();
        const cpf = document.getElementById('cpf').value.trim();
        const valor = document.getElementById('valor').value.trim();
        const cirurgia = document.getElementById('cirurgia').value.trim().toUpperCase();
        const hospital = document.getElementById('hospital').value.trim().toUpperCase();
        const dia = document.getElementById('dia').value;
        const mes = document.getElementById('mes').value;
        const ano = document.getElementById('ano').value;

        const nomeFormatado = nome;
        const cirurgiaFormatada = cirurgia;
        const hospitalFormatado = hospital;

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 20;

        let yPosition = pageHeight / 2 - 45;

        pdf.setFont('times', 'bold');
        pdf.setFontSize(16);
        pdf.text('RECIBO', pageWidth / 2, yPosition, { align: 'center' });

        yPosition += 25;

        pdf.setFontSize(12);
        const lineHeight = 8;

        const palavrasNegrito = [
            nomeFormatado,
            nomeResponsavel,
            cpf,
            `R$ ${valor}`,
            cirurgiaFormatada,
            hospitalFormatado
        ].filter(p => p);

        const maxWidth = pageWidth - (margin * 2);

        if (acompanhado && nomeResponsavel) {
            const linha1 = `Recebi de ${nomeResponsavel}, CPF.: ${cpf}, responsável de`;
            const linha2 = `${nomeFormatado} o valor de R$ ${valor} referente ao serviço prestado da instrumentação cirúrgica para cirurgia de ${cirurgiaFormatada}, realizada no hospital ${hospitalFormatado}.`;
            
            renderLinha(linha1, [nomeResponsavel, cpf]);
            yPosition += lineHeight;
            
            const linhas2 = quebrarTexto(linha2, maxWidth);
            linhas2.forEach(linha => {
                renderLinha(linha, palavrasNegrito);
                yPosition += lineHeight;
            });
        } else {
            const textoCompleto = `Recebi de ${nomeFormatado}, CPF.: ${cpf} o valor de R$ ${valor} referente ao serviço prestado da instrumentação cirúrgica para cirurgia de ${cirurgiaFormatada}, realizada no hospital ${hospitalFormatado}.`;
            const linhas = quebrarTexto(textoCompleto, maxWidth);
            
            linhas.forEach(linha => {
                renderLinha(linha, palavrasNegrito);
                yPosition += lineHeight;
            });
        }

        function quebrarTexto(texto, larguraMax) {
            const palavras = texto.split(' ');
            let linhaAtual = '';
            const linhas = [];

            palavras.forEach((palavra) => {
                const testeLinhaAtual = linhaAtual + (linhaAtual ? ' ' : '') + palavra;
                pdf.setFont('times', 'normal');
                const largura = pdf.getTextWidth(testeLinhaAtual);
                
                if (largura > larguraMax && linhaAtual) {
                    linhas.push(linhaAtual);
                    linhaAtual = palavra;
                } else {
                    linhaAtual = testeLinhaAtual;
                }
            });
            
            if (linhaAtual) {
                linhas.push(linhaAtual);
            }
            
            return linhas;
        }

        function renderLinha(linha, palavrasParaNegrito) {
            let fragmentos = [];
            let resto = linha;
            let processadas = [];
            
            const palavrasOrdenadas = [...palavrasParaNegrito].sort((a, b) => b.length - a.length);
            
            palavrasOrdenadas.forEach(pn => {
                const indice = resto.indexOf(pn);
                if (indice !== -1 && !processadas.includes(pn)) {
                    const antes = resto.substring(0, indice);
                    if (antes) fragmentos.push({ text: antes, bold: false });
                    fragmentos.push({ text: pn, bold: true });
                    resto = resto.substring(indice + pn.length);
                    processadas.push(pn);
                }
            });
            
            if (resto) fragmentos.push({ text: resto, bold: false });

            let larguraTotal = 0;
            fragmentos.forEach(frag => {
                pdf.setFont('times', frag.bold ? 'bold' : 'normal');
                larguraTotal += pdf.getTextWidth(frag.text);
            });

            let xPos = (pageWidth - larguraTotal) / 2;

            fragmentos.forEach(frag => {
                pdf.setFont('times', frag.bold ? 'bold' : 'normal');
                pdf.text(frag.text, xPos, yPosition);
                xPos += pdf.getTextWidth(frag.text);
            });
        }

        yPosition += lineHeight * 4;
        pdf.setFont('times', 'normal');
        pdf.text(`Juiz de Fora, ${dia} de ${mes} de ${ano}`, pageWidth / 2, yPosition, { align: 'center' });

        yPosition += lineHeight * 3.5;
        pdf.text('Daniela Ramos Oliveira', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += lineHeight * 1.2;
        pdf.text('CPF 088.959.546-10', pageWidth / 2, yPosition, { align: 'center' });

        const nomeArquivo = `Recibo_${nomeFormatado.replace(/\s+/g, '_')}_${dia}-${mes}-${ano}.pdf`;

        const pdfBlob = pdf.output('blob');
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = nomeArquivo;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setTimeout(() => {
            loading.classList.remove('active');
            alert('PDF gerado com sucesso!');
        }, 500);

    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        loading.classList.remove('active');
        alert('Erro ao gerar PDF. Por favor, tente novamente.');
    }
}

// Inicialização
updatePreview();
updateDayLimit();

// Fechar modal ao clicar fora
window.onclick = function(event) {
    const modal = document.getElementById('confirmModal');
    if (event.target == modal) {
        closeModal();
    }
}
