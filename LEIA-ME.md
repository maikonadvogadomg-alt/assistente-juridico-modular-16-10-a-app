# Assistente Jurídico (modular) — v16/10-a

Feito a partir do "Assistente Jurídico Pro" (Claude 4.6) e das ferramentas que já funcionavam.
Funciona como site (Netlify), app instalado (PWA), APK (Mini SK → 📦 APK) e programa .exe.

## As partes (abas)
- **⚡ Processar** — cole ou abra o processo (PDF, Word) → Resumir, Analisar, O que falta?, Gerar minuta, Redigir peça, Revisar, Só corrigir, Refinar, Linguagem simples, Mensagem ao cliente — ou o seu pedido livre. O resultado vai para o Editor, Word, voz, Documentos ou Conversa.
- **✏️ Editor** — folha A4 padrão ABNT, com negrito, itálico, sublinhado, títulos, citação recuada, alinhamento, recuo da 1ª linha, listas, fonte e tamanho. **⬇ Word de verdade (.docx)**, PDF/imprimir, HTML. 🪄 IA na seleção (melhorar, corrigir, fundamentar, resumir…). 🎤 ditar no cursor, 🔊 ler.
- **💬 Conversa** — converse com a IA sobre o caso (anexe o documento do Editor, o texto do Processar ou um arquivo). 🔁 **Modo voz**: você fala, ela responde em voz natural e escuta de novo.
- **📁 Documentos** — tudo salvo no aparelho + histórico do que a IA fez. Word, 📤 mandar ao Drive, duplicar. 💾 Backup de tudo (e restaurar em outro aparelho).
- **📚 Modelos e ementas** — modelos com [CAMPOS] (3 prontos), 🪄 preencher o modelo com o caso. Ementas que VOCÊ guarda; a IA só usa as marcadas.
- **🧰 Ferramentas** — Perito de Metadados, Comunicações (DJEN), Limpador, Organizador, Juntador, Extrator de Sites.
- **⚙️ Config** — chave do Gemini (grátis), Groq de reserva, voz, seus dados e regras do escritório.

## Por que o antigo não funcionava
- Usava o modelo **gemini-1.5-flash**, que o Google desligou → agora tenta os modelos atuais sozinho.
- O Word dependia de uma biblioteca da internet → agora o Word é feito no próprio aparelho.
- A voz era a "de robô" do aparelho → agora é a voz natural do Gemini.

## Arquivos (modular: um assunto por arquivo)
`index.html` chama os módulos na ordem: `00-core` (primeiro) … `99-app` (último).
Para mudar uma parte, troque só o arquivo dela em `js/`.

## Segurança
A chave da IA fica só no aparelho. Nunca mande a chave para ninguém.
Os documentos dos clientes ficam no aparelho (não vão para servidor nenhum, só para a IA quando você pede).

## Novidades 16/10
- **📜 Regras e memória** (aba nova): cole as regras do seu escritório (quantas quiser, liga/desliga), a **🧠 memória** (o que a IA deve saber) e **⚡ minhas ações** (viram botões no ⚡ Processar). Exporta/importa num arquivo (📤 Drive).
- **🌐 Pesquisar na internet** (Gemini) no ⚡ Processar e na 💬 Conversa — mostra as fontes no fim.
- **🦙 Ollama** (IA grátis do computador): ⚙️ Config → Qual IA usar → Ollama → 🧪 Testar. Tem a lista de modelos para baixar.
- **📥 Importar modelo (Word)** em 📚 Modelos.
- **Programa .exe**: este projeto já vem com a receita. No Mini SK: importar o zip → 📦 APK → repositório novo → 🖥️ Enviar e gerar .exe. O programa liga o Ollama sozinho.
