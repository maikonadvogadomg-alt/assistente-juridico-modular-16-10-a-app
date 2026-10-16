/* =========================================================================
   Assistente Jurídico — 40-conversa.js
   💬 Conversa com a IA sobre o caso — por texto ou por VOZ.
   📎 Contexto: o documento do Editor, o texto do Processar ou um arquivo.
   🔁 Modo voz: você fala → a IA responde em voz natural → escuta de novo.
   As conversas ficam salvas no aparelho.
   ========================================================================= */
(function (J) {
  'use strict';
  let painel, conv = null, controle = null, modoVoz = false, escutando = null;
  const $ = (s) => J.$(s, painel);
  const nova = () => ({ id: J.uid(), titulo: 'Conversa de ' + J.data(), msgs: [], contexto: null, criado: Date.now() });

  function montar(el) {
    painel = el;
    el.innerHTML =
      '<div class="cartao">' +
      '  <div class="linha"><select id="cv-lista" class="cresce" aria-label="Conversas salvas"></select><button class="bt" id="cv-nova">＋ Nova</button><button class="bt mini perigo" id="cv-apagar" title="Apagar esta conversa">🗑</button></div>' +
      '  <div class="linha" style="margin-top:8px"><span class="peq mut">📎 Sobre o quê:</span><span id="cv-ctx" class="peq"><i>nada anexado (conversa livre)</i></span></div>' +
      '  <div class="linha" style="margin-top:6px"><button class="bt mini" id="cv-ctx-editor">✏️ Documento do Editor</button><button class="bt mini" id="cv-ctx-proc">⚡ Texto do Processar</button><button class="bt mini" id="cv-ctx-arq">📂 Arquivo</button><button class="bt mini" id="cv-ctx-tirar" hidden>✕ Tirar</button></div>' +
      '  <div class="linha" style="margin-top:8px"><label class="peq"><input type="checkbox" id="cv-ler"> 🔊 ler as respostas em voz alta</label><label class="peq"><input type="checkbox" id="cv-internet"> 🌐 pesquisar na internet</label><button class="bt mini" id="cv-modo-voz">🔁 Modo conversa por voz</button></div>' +
      '</div>' +
      '<div class="chat" id="cv-chat"></div>' +
      '<div class="entrada-chat"><textarea id="cv-texto" placeholder="Pergunte sobre o caso… (Enter manda; Shift+Enter pula linha)"></textarea>' +
      '<button class="bt" id="cv-mic" title="Ditar">🎤</button><button class="bt forte" id="cv-enviar">➤</button></div>';
    $('#cv-ler').checked = J.pref.get('lerRespostas', false);
    $('#cv-internet').checked = J.pref.get('internetConversa', false); $('#cv-internet').onchange = (e) => J.pref.set('internetConversa', e.target.checked);
    $('#cv-ler').onchange = (e) => J.pref.set('lerRespostas', e.target.checked);
    $('#cv-nova').onclick = () => { conv = nova(); pintar(); };
    $('#cv-apagar').onclick = async () => { if (!conv || !confirm('Apagar esta conversa?')) return; await J.db.apagar('conversas', conv.id); conv = nova(); await listar(); pintar(); };
    $('#cv-lista').onchange = async (e) => { const c = await J.db.pegar('conversas', e.target.value); if (c) { conv = c; pintar(); } };
    $('#cv-ctx-editor').onclick = () => { const t = J.editor.texto(); if (!t) return J.aviso('O Editor está vazio.'); definirContexto(J.editor.atual.titulo || 'Documento do Editor', t); };
    $('#cv-ctx-proc').onclick = () => { const t = (J.$('#pr-texto') || {}).value || ''; if (!t.trim()) return J.aviso('O ⚡ Processar está vazio.'); definirContexto('Texto do Processar', t); };
    $('#cv-ctx-arq').onclick = async () => { const [f] = await J.importar.escolher(); if (!f) return; try { J.aviso('Lendo ' + f.name + '…'); const r = await J.importar.lerArquivo(f); definirContexto(f.name, r.texto); } catch (e) { J.aviso(e.message, 'erro'); } };
    $('#cv-ctx-tirar').onclick = () => { conv.contexto = null; pintarContexto(); guardar(); };
    const ta = $('#cv-texto');
    ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey && !/Android|iPhone/i.test(navigator.userAgent)) { e.preventDefault(); enviar(); } });
    $('#cv-enviar').onclick = () => (controle ? controle.abort() : enviar());
    J.voz.botaoDitado($('#cv-mic'), ta);
    $('#cv-modo-voz').onclick = alternarModoVoz;
    $('#cv-chat').addEventListener('click', (e) => {
      const b = e.target.closest('[data-m]'); if (!b) return;
      const m = conv.msgs[+b.dataset.i]; if (!m) return;
      if (b.dataset.m === 'ouvir') { if (J.voz.falando) J.voz.parar(); else J.voz.falar(m.content); }
      if (b.dataset.m === 'copiar') J.copiar(m.content);
      if (b.dataset.m === 'editor') { J.editor.inserirHtml(J.texto.mdParaHtml(m.content)); J.aviso('Colocado no ✏️ Editor (onde estava o cursor).', 'ok'); }
      if (b.dataset.m === 'lembrar') { const t = prompt('Nome para guardar na 🧠 Memória:', (conv.titulo || 'Da conversa').slice(0, 60)); if (t) J.regras.lembrar(t, m.content).then(() => J.aviso('🧠 Guardado na Memória. A IA passa a saber disto (aba 📜).', 'ok')); }
      if (b.dataset.m === 'word') J.docx.baixar('Resposta da IA — ' + new Date().toLocaleDateString('pt-BR'), J.texto.mdParaHtml(m.content));
    });
    conv = nova(); listar(); pintar();
  }

  function definirContexto(nome, texto) {
    if (!conv) conv = nova();
    conv.contexto = { nome, texto: texto.slice(0, 600000) };
    if (texto.length > 600000) J.aviso('Texto muito grande: usei só o começo. Para processos enormes, passe antes no 🧹 Limpador.');
    pintarContexto(); guardar(); J.aviso('📎 Agora a conversa é sobre: ' + nome, 'ok');
  }
  function pintarContexto() {
    const c = conv && conv.contexto;
    $('#cv-ctx').innerHTML = c ? '<b>' + J.esc(c.nome) + '</b> <span class="mut">(' + c.texto.length.toLocaleString('pt-BR') + ' caracteres)</span>' : '<i>nada anexado (conversa livre)</i>';
    $('#cv-ctx-tirar').hidden = !c;
  }
  async function listar() {
    const todas = (await J.db.todos('conversas')).sort((a, b) => b.atualizado - a.atualizado);
    const sel = $('#cv-lista');
    sel.innerHTML = (conv && !todas.some((x) => x.id === conv.id) ? '<option value="' + conv.id + '">' + J.esc(conv.titulo) + ' (nova)</option>' : '') + todas.map((c) => '<option value="' + c.id + '">' + J.esc(c.titulo) + '</option>').join('');
    if (conv) sel.value = conv.id;
  }
  function pintar() {
    pintarContexto();
    const chat = $('#cv-chat');
    chat.innerHTML = conv.msgs.length ? conv.msgs.map((m, i) => m.role === 'user'
      ? '<div class="msg eu">' + J.esc(m.content).replace(/\n/g, '<br>') + '</div>'
      : '<div class="msg ia">' + J.texto.mdParaHtml(m.content) + '<div class="msg-bts"><button class="bt mini" data-m="ouvir" data-i="' + i + '">🔊</button><button class="bt mini" data-m="copiar" data-i="' + i + '">📋</button><button class="bt mini" data-m="editor" data-i="' + i + '">✏️ Editor</button><button class="bt mini" data-m="word" data-i="' + i + '">⬇ Word</button><button class="bt mini" data-m="lembrar" data-i="' + i + '" title="Guardar na 🧠 Memória: a IA passa a saber disto sempre">🧠 Lembrar</button></div></div>').join('')
      : '<p class="mut">Pergunte o que quiser: “quais os pontos fracos?”, “faça a réplica”, “explique a decisão para o cliente”… Se anexar um documento (📎), a IA responde com base nele.</p>';
    listar();
  }
  async function guardar() { if (conv && conv.msgs.length) await J.db.guardar('conversas', conv); }

  async function enviar(textoFalado) {
    const ta = $('#cv-texto');
    const t = (textoFalado || ta.value).trim(); if (!t) return;
    if (!J.ia.temChave()) { J.aviso('Falta a chave da IA (⚙️ Config).', 'erro'); return J.abrirAba('config'); }
    ta.value = '';
    if (!conv.msgs.length) conv.titulo = t.slice(0, 60);
    conv.msgs.push({ role: 'user', content: t, t: Date.now() });
    pintar();
    const chat = $('#cv-chat');
    const esp = document.createElement('div'); esp.className = 'msg ia'; esp.innerHTML = '<span class="carregando"></span> pensando…'; chat.appendChild(esp);
    esp.scrollIntoView({ behavior: 'smooth', block: 'end' });
    $('#cv-enviar').textContent = '⏹';
    controle = new AbortController();
    try {
      const extra = 'Você está CONVERSANDO com o advogado' + (modoVoz ? ' por voz: responda curto (até 6 frases), sem listas longas, como numa conversa falada.' : ': seja direto e útil.') +
        (conv.contexto ? '\n\nDOCUMENTO EM ANÁLISE ("' + conv.contexto.nome + '"):\n' + conv.contexto.texto : '');
      const resp = await J.ia.gerar({ mensagens: conv.msgs.slice(-24).map((m) => ({ role: m.role, content: m.content })), sistema: J.ia.sistemaBase(extra), sinal: controle.signal, opcoes: { internet: $('#cv-internet').checked } });
      conv.msgs.push({ role: 'assistant', content: resp, t: Date.now() });
      pintar(); guardar();
      chat.lastElementChild && chat.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (modoVoz || $('#cv-ler').checked) J.voz.falar(resp, { aoTerminar: () => { if (modoVoz) escutar(); } });
    } catch (e) {
      esp.remove();
      if (e.name !== 'AbortError') { const d = document.createElement('div'); d.className = 'caixa ruim'; d.textContent = '❌ ' + e.message; chat.appendChild(d); }
      if (modoVoz) setTimeout(escutar, 800);
    } finally { controle = null; $('#cv-enviar').textContent = '➤'; }
  }

  // ── modo voz: escuta → manda → fala → escuta de novo ───────────────────────
  function escutar() {
    if (!modoVoz) return;
    let dito = '';
    escutando = J.voz.ditar({ umaVez: true, aoTexto(final, parcial) { if (final) dito += ' ' + final; $('#cv-texto').value = (dito + ' ' + (parcial || '')).trim(); }, aoFim() { escutando = null; if (!modoVoz) return; if (dito.trim()) enviar(dito.trim()); else setTimeout(escutar, 300); } });
    if (!escutando) { modoVoz = false; pintarModo(); }
  }
  function alternarModoVoz() {
    modoVoz = !modoVoz; pintarModo();
    if (modoVoz) { J.aviso('🔁 Modo voz ligado: fale a sua pergunta. Toque de novo para desligar.', 'ok'); J.voz.parar(); escutar(); }
    else { if (escutando) escutando.parar(); J.voz.parar(); }
  }
  function pintarModo() { const b = $('#cv-modo-voz'); b.classList.toggle('gravando', modoVoz); b.textContent = modoVoz ? '⏹ Desligar modo voz' : '🔁 Modo conversa por voz'; }

  J.conversa = {
    comContexto(nome, texto) { conv = nova(); pintar(); definirContexto(nome, texto); },
  };
  J.registrar({ aba: 'conversa', montar });
})(window.J);
