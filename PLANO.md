# 📋 Plano do projeto: Assistente-Juridico-modular-16-10-a

_Gerado em 16/10/2026, 18:02:09 — sem IA, lendo os arquivos._

## 📊 Visão geral
| Item | Valor |
|---|---|
| Arquivos | 51 |
| Linhas | 6.228 |
| Telas/páginas | 7 |
| Rotas do backend | 0 |
| Chamadas do app | 0 |
| Tabelas do banco | 0 |
| Variáveis de ambiente | 2 |

**Linguagens:** JavaScript (19), Imagem (15), HTML (7), Markdown (3), Imagem SVG (2), JSON (2), YAML (1), CSS (1), Ícone (1)

## 💡 O que fazer (em ordem)
1. 🧹 Tirar a Replit de 1 arquivo(s) (🏗️ Preparar → Fazer tudo)
2. 🔐 Criar um .env.example com: LOCALAPPDATA, TESTE_SAIR (os valores você coloca no servidor, nunca no código)
3. 📝 Criar um README.md explicando como rodar
4. 🚫 Criar .gitignore (não mandar node_modules ao GitHub)

## 🚀 Por onde começa
- `index.html`

## 📱 Telas e páginas
| Endereço | Arquivo |
|---|---|
| `ferramentas/comunicacoes.html` | ferramentas/comunicacoes.html |
| `ferramentas/extrator.html` | ferramentas/extrator.html |
| `ferramentas/juntador.html` | ferramentas/juntador.html |
| `ferramentas/limpador.html` | ferramentas/limpador.html |
| `ferramentas/organizador.html` | ferramentas/organizador.html |
| `ferramentas/perito.html` | ferramentas/perito.html |
| `index.html` | index.html |

## 🖥️ Rotas do backend
_Nenhum encontrado._

## 📡 O que o app pede ao servidor
_Nenhum encontrado._

## 🔌 O que falta no backend
✅ Tudo que o app chama tem rota no projeto (ou o app não usa servidor).

## 🗄️ Banco de dados
_Nenhuma tabela encontrada._

## 🔐 Variáveis de ambiente (configurar no servidor)
- `LOCALAPPDATA`
- `TESTE_SAIR`

_Só os nomes. Os valores (chaves, senhas) nunca vão no código nem no GitHub._

## 🤖 IA usada
- generativelanguage.googleapis.com
- api.groq.com
- console.groq.com

## 🌐 Serviços de fora que ele acessa
- aistudio.google.com
- api.groq.com
- cdnjs.cloudflare.com
- console.groq.com
- generativelanguage.googleapis.com
- github.com
- purl.org
- raw.github.com
- stuartk.com
- stuk.github.io

## 🧹 Arquivos com coisa da Replit
- service-worker.js

## 🔁 Roteiro para recriar fora da Replit
1. Importar o projeto no Mini SK e tocar em 🏗️ Preparar → ✅ Fazer tudo (tira a Replit, cria os arquivos que faltam).
2. Não tem backend: o site sozinho basta (Netlify ou GitHub Pages).
3. Variáveis: cadastrar 2 variável(is) no servidor (lista acima).
4. Testar a prévia; se der erro, 🤖 Mandar os erros para a IA.
5. App: 📲 Instalável (PWA), 📦 APK ou 🖥️ Desktop (.exe) pelo 🏗️ Preparar.

## 🌳 Árvore de arquivos
```
├─ 📁 .github/
│  └─ 📁 workflows/
│     └─ programa-exe.yml
├─ 📁 css/
│  └─ app.css
├─ 📁 electron/
│  └─ main.cjs
├─ 📁 ferramentas/
│  ├─ comunicacoes.html
│  ├─ extrator.html
│  ├─ juntador.html
│  ├─ limpador.html
│  ├─ organizador.html
│  └─ perito.html
├─ 📁 icons/
│  ├─ apple-touch-icon.png
│  ├─ icon-128.png
│  ├─ icon-144.png
│  ├─ icon-152.png
│  ├─ icon-16.png
│  ├─ icon-180.png
│  ├─ icon-192.png
│  ├─ icon-32.png
│  ├─ icon-384.png
│  ├─ icon-48.png
│  ├─ icon-512.png
│  ├─ icon-72.png
│  ├─ icon-96.png
│  ├─ icon.svg
│  ├─ maskable-192.png
│  ├─ maskable-512.png
│  └─ maskable.svg
├─ 📁 js/
│  ├─ 00-core.js
│  ├─ 10-ia.js
│  ├─ 12-voz.js
│  ├─ 15-importar.js
│  ├─ 18-texto.js
│  ├─ 20-processar.js
│  ├─ 25-regras.js
│  ├─ 30-editor.js
│  ├─ 35-docx.js
│  ├─ 40-conversa.js
│  ├─ 50-documentos.js
│  ├─ 55-biblioteca.js
│  ├─ 70-ferramentas.js
│  ├─ 80-config.js
│  └─ 99-app.js
├─ 📁 lib/
│  ├─ jszip-LICENSE.md
│  └─ jszip.min.js
├─ favicon.ico
├─ index.html
├─ LEIA-ME.md
├─ manifest.json
├─ package.json
├─ PLANO.md
├─ service-worker.js
└─ sw.js
```
