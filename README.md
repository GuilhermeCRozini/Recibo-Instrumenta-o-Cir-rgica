# Gerador de Recibos Médicos

Sistema completo para geração de recibos de instrumentação cirúrgica para Daniela Ramos Oliveira.

## 📁 Estrutura dos Arquivos

```
gerador-recibos/
├── index.html          # Estrutura HTML principal
├── style.css           # Estilos e design
├── script.js           # Lógica e funcionalidades
└── README.md           # Este arquivo
```

## 🚀 Como Usar

### Localmente
1. Baixe todos os arquivos (`index.html`, `style.css`, `script.js`)
2. Mantenha todos os arquivos na mesma pasta
3. Abra o arquivo `index.html` em seu navegador

### No GitHub Pages
1. Crie um repositório privado no GitHub
2. Faça upload dos três arquivos
3. Ative o GitHub Pages nas configurações do repositório
4. Acesse via URL: `https://seu-usuario.github.io/nome-do-repo/`

## ✨ Funcionalidades

- ✅ Geração de recibos com/sem responsável (acompanhado)
- ✅ Preview em tempo real
- ✅ Modal de confirmação antes de gerar PDF
- ✅ Formatação automática de CPF e valores
- ✅ Validação de datas por mês (considera anos bissextos)
- ✅ PDF centralizado e profissional
- ✅ Design responsivo para mobile

## 📋 Campos do Formulário

- **Acompanhado** (checkbox): Ativa modo com responsável
- **Nome do Responsável**: Aparece quando "Acompanhado" está marcado
- **CPF**: Muda para "CPF do Responsável" quando acompanhado
- **Nome do Paciente**: Nome da pessoa que recebeu o serviço
- **Valor**: Formatação automática em R$
- **Tipo de Cirurgia**: Ex: ADENOAMIGDALECTOMIA
- **Hospital**: Ex: UNIMED
- **Data**: Dia, mês e ano

## 🎨 Personalização

### Cores
Edite no `style.css`:
```css
/* Gradiente principal */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Dados da Profissional
Edite no `index.html` e `script.js`:
- Nome: Daniela Ramos Oliveira
- CPF: 088.959.546-10
- Cidade: Juiz de Fora

## 🔒 Privacidade

Este gerador:
- ✅ Funciona 100% offline (após carregamento inicial do jsPDF)
- ✅ Não envia dados para nenhum servidor
- ✅ Não armazena informações
- ✅ Processa tudo localmente no navegador

## 📱 Compatibilidade

- ✅ Chrome, Firefox, Safari, Edge
- ✅ Dispositivos móveis (iOS, Android)
- ✅ Tablets
- ✅ Impressão otimizada

## 🛠️ Dependências

- [jsPDF](https://github.com/parallax/jsPDF) - Carregado via CDN para geração de PDFs

## 📄 Licença

Uso privado - Daniela Ramos Oliveira

## 💡 Suporte

Para dúvidas ou problemas, verifique se:
1. Todos os arquivos estão na mesma pasta
2. O navegador está atualizado
3. JavaScript está habilitado
4. Há conexão com internet (para carregar jsPDF na primeira vez)
