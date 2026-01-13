# 📄 Gerador de Recibos Médicos (Instrumentação Cirúrgica)

Gerador de recibos com **preview em tempo real** e **PDF profissional (A4)**, otimizado para **mobile, tablet e desktop**.  
Funciona **localmente no navegador** e também via **GitHub Pages**.

---

## ✅ Principais recursos

### Formulário e Preview
- ✅ **Modo Acompanhado** (responsável) e **Não acompanhado**
- ✅ Preview do recibo em tempo real
- ✅ **CPF e Valor formatados automaticamente**
- ✅ **Validação de data**: o campo **Dia** respeita o **mês e o ano** (inclui ano bissexto)
- ✅ **Ano do formulário** inicia automaticamente com o **ano atual do dispositivo** (mas você pode alterar)
- ✅ Layout responsivo com melhor leitura (sem “espaços esticados” no preview)

### PDF (A4) – layout e consistência
- ✅ PDF centralizado e padronizado (top/bottom)
- ✅ Campos digitados pelo usuário saem em **CAIXA ALTA** no PDF (independente de como foi digitado)
- ✅ Negrito aplicado **somente** nos valores preenchidos (pontuação do template **não** fica em negrito)
- ✅ Tratamento de quebras de linha para evitar situações como `CPF.:` em uma linha e número em outra
- ✅ Correção de palavras “grudadas” em quebras (ex.: `da instrumentação`, `no hospital`)

### Download / Abrir / Compartilhar
- ✅ Após gerar, você pode escolher:
  - **Apenas abrir** (visualizar o PDF)  
  - **Baixar e abrir** (Android/desktop)  
  - **Compartilhar / Salvar** (iPhone/iPad)
- ✅ **iOS (Safari)**: suporta Share Sheet (Salvar em Arquivos / WhatsApp / AirDrop etc.), com fallback para abrir em nova aba
- ✅ Fallback para casos de popup bloqueado (link “Abrir PDF” aparece na tela)

---

## 📱 Detecção de dispositivo (com marca/modelo)

Mostra no topo um badge do tipo:
- `📱 Mobile - Samsung Galaxy S25` (quando mapeado)
- `📱 Mobile - Samsung SM-S711B` (quando o navegador só informa o código)
- `Apple iPhone/iPad` no iOS (o Safari costuma ocultar o modelo exato por privacidade)

### Mapa opcional de modelos (nomes comerciais)
No `script.js` existe um objeto `DEVICE_MODEL_MAP` para converter códigos em nomes, por exemplo:

- `SM-S931B` → `Galaxy S25`
- `SM-S936B` → `Galaxy S25+`
- `SM-S938B` → `Galaxy S25 Ultra`

Você pode adicionar novos modelos facilmente.

---

## 📁 Estrutura do projeto

```
/
├── index.html
├── style.css
├── script.js
└── README.md
```

- `index.html` → estrutura do formulário e preview  
- `style.css` → estilo e responsividade  
- `script.js` → lógica (formatação, validações, geração PDF, detecção de dispositivo)

---

## 🚀 Como usar

### Localmente
1. Baixe `index.html`, `style.css` e `script.js`
2. Coloque todos na **mesma pasta**
3. Abra `index.html` no navegador

### GitHub Pages
1. Suba os arquivos no repositório
2. Ative **Pages** em: *Settings → Pages*
3. Acesse pela URL do Pages

---

## 🧾 Campos do formulário

- **Acompanhado**: habilita campos do responsável  
- **Nome do Responsável**: aparece quando “Acompanhado” está marcado  
- **CPF**: vira “CPF do Responsável” no modo acompanhado  
- **Nome do Paciente**  
- **Valor (R$)**  
- **Tipo de cirurgia**  
- **Hospital**  
- **Data (Dia / Mês / Ano)** com validação automática

---

## 🔒 Privacidade

- ✅ Processamento 100% local no navegador
- ✅ Não envia dados para servidores
- ✅ Não salva dados automaticamente (a menos que você implemente isso)

---

## 🧩 Compatibilidade

### Desktop
- Chrome / Edge / Firefox / Safari (versões recentes)

### Mobile
- Android: Chrome / Samsung Internet / Firefox
- iOS: Safari (com compartilhamento quando suportado)

> Observação: em iPhone/iPad, “download tradicional” é limitado pelo iOS. Por isso existe a opção **Compartilhar / Salvar**.

---

## 🐛 Solução de problemas

### “Cliquei em gerar e não aconteceu nada”
- Verifique se o navegador carregou a biblioteca **jsPDF** (precisa de internet no primeiro acesso via CDN)
- Recarregue a página (no mobile, teste em aba anônima para evitar cache)

### Popup bloqueado ao abrir PDF
- O sistema mostra um link “Abrir PDF” na tela como fallback

### iPhone: onde o PDF foi salvo?
- Use **Compartilhar → Salvar em Arquivos** para escolher o local

---

## 🛠️ Dependências
- **jsPDF** (CDN) para gerar PDF

---

## 📄 Licença
Uso privado – Daniela Ramos Oliveira
