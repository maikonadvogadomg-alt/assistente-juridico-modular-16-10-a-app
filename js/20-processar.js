/* =========================================================================
   Assistente Jurídico — 20-processar.js
   ⚡ Processar: cole/abra o texto do processo → escolha o que fazer →
   resultado formatado → Editor, Word, ouvir, salvar ou conversar sobre ele.
   As ações vieram do "Assistente Jurídico Pro" antigo (mesmos pedidos).
   ========================================================================= */
(function (J) {
  'use strict';
  const ACOES = [
    { id: 'resumir', nome: '📝 Resumir', dica: 'fatos, partes, pedidos', p: 'Resuma o documento abaixo de forma objetiva, mantendo todos os fatos relevantes, partes, pedidos, datas e fundamentos legais. Elimine repetições e sujeira de formatação. Use tópicos curtos.' },
    { id: 'analisar', nome: '🔎 Analisar', dica: 'pontos fortes, fracos, riscos', p: 'Analise o documento jurídico abaixo, identificando: partes, pedidos, fundamentos, provas, pontos fortes, pontos fracos, riscos processuais, prazos que possam estar correndo e próximos passos recomendados.' },
    { id: 'interativo', nome: '❓ O que falta?', dica: 'lacunas e contradições', p: 'Analise o texto abaixo e liste, em tópicos, as lacunas, informações faltantes, documentos que faltam, contradições e perguntas que o advogado precisa responder antes de redigir a peça.' },
    { id: 'minuta', nome: '📄 Gerar minuta', dica: 'peça cabível, estrutura completa', p: 'Com base no texto abaixo, gere a minuta completa da peça jurídica cabível, com endereçamento, qualificação (use [CAMPOS] para dados que faltarem), fatos, fundamentos jurídicos, pedidos, valor da causa quando couber, local, data e assinatura.' },
    { id: 'redigir', nome: '⚖️ Redigir peça', dica: 'identifica o tipo e redige', p: 'Identifique automaticamente o tipo de peça necessária para o caso abaixo e redija-a completa, com fundamentação legal sólida (cite artigos de lei). Não invente jurisprudência: se citar, marque [CONFERIR] ao lado.' },
    { id: 'revisar', nome: '✅ Revisar', dica: 'gramática e técnica', p: 'Revise o texto jurídico abaixo, corrigindo erros gramaticais, de concordância, de técnica jurídica e de formatação. Mantenha o estilo original. Devolva o texto revisado inteiro.' },
    { id: 'estrito', nome: '✏️ Só corrigir', dica: 'não muda o conteúdo', p: 'Corrija o texto abaixo, mantendo ESTRITAMENTE o conteúdo original. Apenas ajuste gramática, pontuação e grafia. Devolva o texto inteiro corrigido.' },
    { id: 'refinar', nome: '💪 Refinar', dica: 'mais claro e persuasivo', p: 'Refine o texto jurídico abaixo, melhorando a argumentação, a clareza e a força persuasiva, sem alterar fatos ou pedidos. Devolva o texto inteiro.' },
    { id: 'simplificar', nome: '🗣️ Linguagem simples', dica: 'para o cliente entender', p: 'Reescreva o texto abaixo em linguagem simples e acessível para um cliente leigo, sem jargões, mantendo o sentido. Explique o que significa para ele e o que acontece agora.' },
    { id: 'cliente', nome: '📲 Mensagem ao cliente', dica: 'WhatsApp, curta e gentil', p: 'Com base no texto abaixo, escreva uma mensagem curta, gentil e clara para enviar ao cliente pelo WhatsApp, explicando a situação do processo e o próximo passo. Sem juridiquês.' },
  ];
  let painel, controle = null, ultimo = null; // ultimo = {acao, md, html, titulo}
  const $ = (s) => J.$(s, painel);

  function montar(el) {
    painel = el;
    el.innerHTML =
      '<div class="cartao">' +
      '  <h2>1. O texto</h2>' +
      '  <div class="linha" style="margin-bottom:8px"><button class="bt" id="pr-abrir">📂 Abrir arquivo</button><button class="bt" id="pr-ditar">🎤 Ditar</button><button class="bt" id="pr-do-editor">✏️ Pegar do Editor</button><button class="bt mini perigo" id="pr-limpar">🗑 Limpar</button></div>' +
      '  <textarea id="pr-texto" placeholder="Cole aqui o texto do processo, a decisão, a petição ou conte o caso. Ou toque em 📂 Abrir arquivo (PDF, Word)."></textarea>' +
      '  <div class="peq mut" id="pr-conta">0 caracteres</div>' +
      '</div>' +
      '<div class="cartao">' +
      '  <h2>2. O que fazer</h2>' +
      '  <div class="acoes-ia" id="pr-acoes"></div>' +
      '  <label class="campo" for="pr-extra">Seu pedido (opcional — vale junto com o botão, ou sozinho)</label>' +
      '  <div class="linha"><textarea id="pr-extra" class="cresce" style="min-height:60px" placeholder="Ex.: foque no tempo especial; peça tutela de urgência; use o modelo do escritório…"></textarea><button class="bt" id="pr-extra-ditar" title="Ditar o pedido">🎤</button></div>' +
      '  <div class="linha" style="margin-top:8px"><button class="bt forte" id="pr-livre">▶ Fazer só o meu pedido</button>' +
      '  <label class="peq"><input type="checkbox" id="pr-ementas"> usar as ementas marcadas (📚) como apoio</label><label class="peq"><input type="checkbox" id="pr-internet"> 🌐 pesquisar na internet (Gemini)</label></div>' +
      '</div>' +
      '<div class="cartao" id="pr-saida" hidden>' +
      '  <div class="linha"><h2 class="cresce" id="pr-titulo">Resultado</h2><button class="bt mini" id="pr-parar" hidden>⏹ Parar</button></div>' +
      '  <div class="resultado" id="pr-resultado"></div>' +
      '  <div class="linha" style="margin-top:10px" id="pr-bts" hidden>' +
      '    <button class="bt forte" id="pr-editor">✏️ Abrir no Editor</button><button class="bt" id="pr-word">⬇ Word</button><button class="bt" id="pr-copiar">📋 Copiar</button>' +
      '    <button class="bt" id="pr-ouvir">🔊 Ouvir</button><button class="bt" id="pr-salvar">💾 Salvar</button><button class="bt" id="pr-conversar">💬 Conversar sobre isto</button><button class="bt" id="pr-refazer">↻ Refazer</button>' +
      '  </div>' +
      '</div>';
    const pintarAcoes = () => {
      const minhas = (J.regras ? J.regras.acoes() : []).map((a) => ({ id: 'minha:' + a.id, nome: '⭐ ' + a.titulo, dica: 'sua ação', p: a.texto }));
      $('#pr-acoes').innerHTML = ACOES.concat(minhas).map((a) => '<button class="bt" data-acao="' + a.id + '">' + J.esc(a.nome) + '<small>' + J.esc(a.dica) + '</small></button>').join('') +
        '<button class="bt" data-ir="regras" title="Criar um botão com o seu pedido">＋ Criar minha ação<small>vira um botão aqui</small></button>';
    };
    pintarAcoes(); J.on('regras', pintarAcoes);
    $('#pr-internet').checked = J.pref.get('internet', false); $('#pr-internet').onchange = (e) => J.pref.set('internet', e.target.checked);
    const ta = $('#pr-texto');
    ta.value = J.pref.get('rascunhoProcessar', '');
    const conta = () => { $('#pr-conta').textContent = ta.value.length.toLocaleString('pt-BR') + ' caracteres' + (ta.value.length > 400000 ? ' — muito grande: use 🧹 Limpador antes' : ''); };
    let t = 0; ta.addEventListener('input', () => { conta(); clearTimeout(t); t = setTimeout(() => { if (ta.value.length < 900000) J.pref.set('rascunhoProcessar', ta.value); }, 600); });
    conta();
    J.voz.botaoDitado($('#pr-ditar'), ta);
    J.voz.botaoDitado($('#pr-extra-ditar'), $('#pr-extra'));
    $('#pr-abrir').onclick = async () => {
      const fs = await J.importar.escolher(null, true); if (!fs.length) return;
      for (const f of fs) {
        try { J.aviso('Lendo ' + f.name + '…'); const r = await J.importar.lerArquivo(f, (i, n) => { $('#pr-conta').textContent = 'Lendo página ' + i + ' de ' + n + '…'; }); ta.value = (ta.value ? ta.value + '\n\n' : '') + '=== ' + f.name + ' ===\n' + r.texto; ta.dispatchEvent(new Event('input')); }
        catch (e) { J.aviso(f.name + ': ' + e.message, 'erro'); }
      }
    };
    $('#pr-do-editor').onclick = () => { const t2 = J.editor && J.editor.texto(); if (!t2) return J.aviso('O Editor está vazio.'); ta.value = t2; ta.dispatchEvent(new Event('input')); };
    $('#pr-limpar').onclick = () => { if (!ta.value || confirm('Apagar o texto?')) { ta.value = ''; ta.dispatchEvent(new Event('input')); } };
    $('#pr-acoes').onclick = (e) => { const b = e.target.closest('[data-acao]'); if (b) executar(b.dataset.acao); };
    $('#pr-livre').onclick = () => executar(null);
    $('#pr-parar').onclick = () => { if (controle) controle.abort(); };
    $('#pr-editor').onclick = () => { if (ultimo) { J.editor.abrir({ titulo: ultimo.titulo, html: ultimo.html }); J.abrirAba('editor'); } };
    $('#pr-word').onclick = () => { if (ultimo) J.docx.baixar(ultimo.titulo, ultimo.html); };
    $('#pr-copiar').onclick = () => { if (ultimo) J.copiar(ultimo.md); };
    $('#pr-ouvir').onclick = () => { if (!ultimo) return; if (J.voz.falando) J.voz.parar(); else J.voz.falar(ultimo.md); };
    J.on('voz', (f) => { const b = $('#pr-ouvir'); if (b) b.textContent = f ? '⏹ Parar voz' : '🔊 Ouvir'; });
    $('#pr-salvar').onclick = async () => { if (!ultimo) return; await J.db.guardar('documentos', { titulo: ultimo.titulo, html: ultimo.html, tipo: 'IA: ' + ultimo.nomeAcao, criado: Date.now() }); J.aviso('💾 Salvo em 📁 Documentos.', 'ok'); };
    $('#pr-conversar').onclick = () => { if (!ultimo) return; J.conversa.comContexto(ultimo.titulo, ultimo.md); J.abrirAba('conversa'); };
    $('#pr-refazer').onclick = () => { if (ultimo) executar(ultimo.acao); };
  }

  async function executar(acaoId) {
    const texto = $('#pr-texto').value.trim();
    const extra = $('#pr-extra').value.trim();
    let acao = ACOES.find((a) => a.id === acaoId);
    if (!acao && acaoId && acaoId.startsWith('minha:') && J.regras) { const m = J.regras.acoes().find((x) => 'minha:' + x.id === acaoId); if (m) acao = { id: acaoId, nome: '⭐ ' + m.titulo, p: m.texto }; }
    if (!acao && !extra) return J.aviso('Escreva o seu pedido no campo "Seu pedido", ou toque num dos botões.');
    if (!texto && acao) return J.aviso('Cole ou abra o texto primeiro (parte 1).');
    if (!J.ia.temChave()) { J.aviso('Falta a chave da IA. Abrindo ⚙️ Config…', 'erro'); return J.abrirAba('config'); }
    let pedido = (acao ? acao.p : 'Atenda ao pedido do advogado abaixo.') + (extra ? '\n\nPEDIDO DO ADVOGADO: ' + extra : '');
    if ($('#pr-ementas').checked && J.biblioteca) { const em = await J.biblioteca.ementasMarcadas(); if (em.length) pedido += '\n\nEMENTAS DE APOIO (use só se forem pertinentes e cite a fonte como está):\n' + em.map((e, i) => (i + 1) + '. ' + e.titulo + '\n' + e.texto).join('\n\n'); }
    const conteudo = pedido + (texto ? '\n\n=== TEXTO ===\n' + texto : '');
    const nomeAcao = acao ? acao.nome.replace(/^\S+\s/, '') : 'Pedido livre';
    $('#pr-saida').hidden = false; $('#pr-bts').hidden = true; $('#pr-parar').hidden = false;
    $('#pr-titulo').textContent = nomeAcao;
    $('#pr-resultado').innerHTML = '<span class="carregando"></span> A IA está trabalhando… (textos grandes podem levar 1 a 2 minutos)';
    $('#pr-saida').scrollIntoView({ behavior: 'smooth', block: 'start' });
    controle = new AbortController();
    try {
      const md = await J.ia.gerar({ mensagens: [{ role: 'user', content: conteudo }], sinal: controle.signal, opcoes: { internet: $('#pr-internet').checked } });
      const html = J.texto.mdParaHtml(md);
      const titulo = nomeAcao + ' — ' + new Date().toLocaleDateString('pt-BR');
      ultimo = { acao: acaoId, nomeAcao, md, html, titulo };
      $('#pr-resultado').innerHTML = html;
      $('#pr-bts').hidden = false;
      J.db.guardar('historico', { titulo, html, md, acao: nomeAcao, criado: Date.now() }).then(podar).catch(() => {});
    } catch (e) {
      $('#pr-resultado').innerHTML = e.name === 'AbortError' ? '<span class="mut">Parado.</span>' : '<div class="caixa ruim">❌ ' + J.esc(e.message) + '</div>';
    } finally { controle = null; $('#pr-parar').hidden = true; }
  }
  async function podar() { const h = (await J.db.todos('historico')).sort((a, b) => b.criado - a.criado); for (const x of h.slice(60)) await J.db.apagar('historico', x.id); }

  J.processar = { ACOES, colocarTexto(t) { const ta = $('#pr-texto'); ta.value = t; ta.dispatchEvent(new Event('input')); } };
  J.registrar({ aba: 'processar', montar });
})(window.J);
