# 📱 Gerador de Recibos Médicos - Mobile Optimized

Sistema completo para geração de recibos de instrumentação cirúrgica com **detecção automática de dispositivo** e otimização para mobile, tablet e desktop.

## ✨ Novidades - Versão Mobile

### 🎯 Detecção Automática de Dispositivo
- Identifica automaticamente se está sendo acessado via:
  - 📱 **Mobile** (smartphones)
  - 📱 **Tablet** 
  - 💻 **Desktop**
- Badge visual mostrando o tipo de dispositivo detectado
- Interface adaptada automaticamente para cada tipo

### 📱 Otimizações para Mobile

#### UX Mobile
- ✅ Inputs com altura mínima de 48px para área de toque confortável
- ✅ Checkboxes maiores (24x24px) para fácil seleção
- ✅ Feedback vibratório ao interagir com elementos (quando disponível)
- ✅ Teclado numérico automático para CPF e valores
- ✅ Teclado decimal para valores monetários
- ✅ Font-size mínimo de 16px para prevenir zoom automático no iOS
- ✅ Prevenção de zoom no double-tap

#### Layout Responsivo
- ✅ Padding reduzido em telas pequenas
- ✅ Campos de data em coluna única no mobile
- ✅ Botões em tela cheia com altura confortável
- ✅ Modal adaptado com scroll em landscape
- ✅ Preview do recibo otimizado para leitura mobile

#### Geração de PDF Mobile
- ✅ **iOS**: Abre PDF em nova aba para visualizar/compartilhar
- ✅ **Android**: Download direto para pasta Downloads
- ✅ Feedback visual após geração
- ✅ Nome de arquivo otimizado

### 🖥️ Experiência Desktop/Tablet
- Layout amplo com melhor aproveitamento de espaço
- Hover effects nos botões
- Grid de data em 3 colunas
- Modal centralizado com animações suaves

## 📁 Estrutura dos Arquivos

```
gerador-recibos/
├── index.html          # Estrutura HTML com meta tags mobile
├── style.css           # Estilos responsivos com media queries
├── script.js           # Lógica + detecção de dispositivo
└── README.md           # Este arquivo
```

## 🚀 Como Usar

### Localmente
1. Baixe todos os arquivos (`index.html`, `style.css`, `script.js`)
2. Mantenha todos os arquivos na mesma pasta
3. Abra o arquivo `index.html` em seu navegador
4. Funciona perfeitamente em qualquer dispositivo!

### No GitHub Pages
1. Crie um repositório privado no GitHub
2. Faça upload dos três arquivos
3. Ative o GitHub Pages nas configurações do repositório
4. Acesse via URL: `https://seu-usuario.github.io/nome-do-repo/`

### No Smartphone
1. Acesse pelo navegador mobile (Chrome, Safari, Firefox)
2. Para acesso rápido: Adicione à tela inicial
   - **iOS**: Toque em "Compartilhar" → "Adicionar à Tela de Início"
   - **Android**: Menu → "Adicionar à tela inicial"

## ✨ Funcionalidades

### Principais
- ✅ Geração de recibos com/sem responsável (acompanhado)
- ✅ Preview em tempo real
- ✅ Modal de confirmação antes de gerar PDF
- ✅ Formatação automática de CPF e valores
- ✅ Validação de datas por mês (considera anos bissextos)
- ✅ PDF centralizado e profissional
- ✅ **Detecção automática de dispositivo**
- ✅ **Design 100% responsivo**

### Mobile Específico
- ✅ Feedback vibratório (quando disponível)
- ✅ Teclados otimizados (numérico, decimal)
- ✅ Prevenção de zoom indesejado
- ✅ Área de toque ampliada
- ✅ Geração de PDF adaptada por plataforma

## 📋 Campos do Formulário

- **Acompanhado** (checkbox): Ativa modo com responsável
- **Nome do Responsável**: Aparece quando "Acompanhado" está marcado
- **CPF**: Muda para "CPF do Responsável" quando acompanhado
- **Nome do Paciente**: Nome da pessoa que recebeu o serviço
- **Valor**: Formatação automática em R$
- **Tipo de Cirurgia**: Ex: ADENOAMIGDALECTOMIA
- **Hospital**: Ex: UNIMED
- **Data**: Dia, mês e ano (validação automática)

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
- ✅ Seguro para uso em qualquer rede

## 📱 Compatibilidade

### Navegadores Desktop
- ✅ Chrome (últimas 2 versões)
- ✅ Firefox (últimas 2 versões)
- ✅ Safari (últimas 2 versões)
- ✅ Edge (últimas 2 versões)

### Navegadores Mobile
- ✅ Chrome Mobile (Android)
- ✅ Safari Mobile (iOS)
- ✅ Firefox Mobile
- ✅ Samsung Internet

### Dispositivos
- ✅ Smartphones (iOS, Android)
- ✅ Tablets (iPad, Android tablets)
- ✅ Desktop (Windows, Mac, Linux)
- ✅ Impressão otimizada

### Orientação
- ✅ Portrait (vertical)
- ✅ Landscape (horizontal)
- ✅ Adaptação automática

## 🛠️ Dependências

- [jsPDF](https://github.com/parallax/jsPDF) - Carregado via CDN para geração de PDFs
- Nenhuma outra dependência externa!

## 🔧 Detecção Técnica

O sistema detecta dispositivos através de:
1. **User Agent**: Identifica navegador e sistema operacional
2. **Largura de tela**: Complementa detecção via JavaScript
3. **Media Queries CSS**: Aplica estilos específicos
4. **Touch Detection**: Identifica dispositivos com tela touch

## 💡 Dicas de Uso Mobile

### iOS
- PDFs abrem em nova aba
- Use "Compartilhar" para salvar ou enviar
- Adicione à tela inicial para acesso rápido

### Android
- PDFs baixam automaticamente
- Verifique pasta Downloads
- Use botão "Adicionar à tela inicial" para acesso rápido

### Todos os Dispositivos
- Mantenha campos preenchidos antes de girar a tela
- Use modo retrato para melhor visualização
- Toque duplo desabilitado para evitar zoom acidental

## 🐛 Solução de Problemas

### Mobile
**PDF não baixa no iPhone:**
- Normal! Abrirá em nova aba. Use botão "Compartilhar" do Safari.

**Teclado cobre campos:**
- O formulário rola automaticamente. Se necessário, feche e reabra o teclado.

**Vibração não funciona:**
- Normal em alguns dispositivos/navegadores. É opcional e não afeta funcionalidade.

### Geral
**Preview não atualiza:**
- Verifique se JavaScript está habilitado

**Campos não formatam:**
- Certifique-se que está digitando apenas números

## 📄 Licença

Uso privado - Daniela Ramos Oliveira

## 💻 Suporte

Para dúvidas ou problemas, verifique se:
1. ✅ Todos os arquivos estão na mesma pasta
2. ✅ O navegador está atualizado
3. ✅ JavaScript está habilitado
4. ✅ Há conexão com internet (para carregar jsPDF na primeira vez)
5. ✅ Está usando navegador compatível

---

**Versão:** 2.0 - Mobile Optimized  
**Última atualização:** Outubro 2025  
**Compatibilidade:** Desktop, Tablet, Mobile
