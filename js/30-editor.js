/* =========================================================================
   Assistente Jurídico — 30-editor.js
   ✏️ Editor com formatação de verdade (folha A4, padrão ABNT): negrito,
   itálico, sublinhado, títulos, citação recuada, alinhamento, recuo da
   1ª linha, listas, fonte e tamanho. Baixa em Word (.docx) de verdade.
   🪄 IA na seleção: selecione um trecho e peça para melhorar, corrigir…
   ========================================================================= */
(function (J) {
  'use strict';
  let painel, folha, atual = { id: null, titulo: 'Documento sem título' }, faixa = null, mudou = false;
  const $ = (s) => J.$(s, painel);
  const IA_SEL = [
    ['melhorar', 'Melhorar a redação', 'Melhore a redação jurídica do trecho abaixo, mais claro e persuasivo, sem mudar fatos. Devolva só o trecho reescrito.'],
    ['corrigir', 'Só corrigir', 'Corrija gramática, concordância e pontuação do trecho abaixo, sem mudar o conteúdo. Devolva só o trecho corrigido.'],
    ['fundamentar', 'Ampliar fundamentação', 'Amplie a fundamentação jurídica do trecho abaixo, citando dispositivos legais pertinentes (sem inventar jurisprudência). Devolva só o trecho ampliado.'],
    ['resumir', 'Resumir', 'Resuma o trecho abaixo mantendo o essencial. Devolva só o resumo.'],
    ['simples', 'Linguagem simples', 'Reescreva o trecho abaixo em linguagem simples para um cliente leigo. Devolva só o trecho.'],
    ['continuar', 'Continuar o texto', 'Continue o texto jurídico abaixo de forma coerente (1 a 3 parágrafos). Devolva só a continuação.'],
  ];

  function montar(el) {
    painel = el;
    el.innerHTML =
      '<div class="linha so-tela" style="margin-bottom:8px"><input type="text" id="ed-titulo" class="cresce titulo-doc" aria-label="Título do documento">' +
      '<button class="bt" id="ed-novo">📄 Novo</button><button class="bt forte" id="ed-salvar">💾 Salvar</button><button class="bt ouro" id="ed-word">⬇ Word</button></div>' +
      '<div class="linha so-tela" style="margin-bottom:8px">' +
      '<button class="bt mini" id="ed-ouvir">🔊 Ler</button><button class="bt mini" id="ed-ditar">🎤 Ditar aqui</button><button class="bt mini" id="ed-copiar">📋 Copiar texto</button>' +
      '<button class="bt mini" id="ed-drive">📤 Mandar (Drive…)</button><button class="bt mini" id="ed-imprimir">🖨 PDF / Imprimir</button><button class="bt mini" id="ed-html">⬇ HTML</button>' +
      '<button class="bt mini" id="ed-modelo">📐 Usar modelo</button><button class="bt mini" id="ed-guardar-modelo">⭐ Guardar como modelo</button><button class="bt mini" id="ed-abrir">📂 Abrir Word/PDF</button></div>' +
      '<div class="barra-editor so-tela" id="ed-barra">' +
      '<button class="bt" data-cmd="undo" title="Desfazer">↶</button><button class="bt" data-cmd="redo" title="Refazer">↷</button><span class="sep"></span>' +
      '<button class="bt" data-cmd="bold" title="Negrito"><b>N</b></button><button class="bt" data-cmd="italic" title="Itálico"><i>I</i></button><button class="bt" data-cmd="underline" title="Sublinhado"><u>S</u></button><button class="bt" data-cmd="strikeThrough" title="Riscado"><s>R</s></button><span class="sep"></span>' +
      '<select id="ed-bloco" title="Tipo de parágrafo"><option value="p">Parágrafo</option><option value="h1">Título (centro)</option><option value="h2">Seção</option><option value="h3">Subseção</option><option value="blockquote">Citação recuada</option></select>' +
      '<select id="ed-fonte" title="Fonte"><option value="">Fonte</option><option>Times New Roman</option><option>Arial</option><option>Calibri</option><option>Georgia</option></select>' +
      '<select id="ed-tam" title="Tamanho"><option value="">Tam.</option><option>10</option><option>11</option><option>12</option><option>14</option><option>16</option><option>18</option></select><span class="sep"></span>' +
      '<button class="bt" data-cmd="justifyLeft" title="Esquerda">⯇</button><button class="bt" data-cmd="justifyCenter" title="Centro">≡</button><button class="bt" data-cmd="justifyRight" title="Direita">⯈</button><button class="bt" data-cmd="justifyFull" title="Justificado">☰</button><span class="sep"></span>' +
      '<button class="bt" data-cmd="insertUnorderedList" title="Lista">•</button><button class="bt" data-cmd="insertOrderedList" title="Lista numerada">1.</button>' +
      '<button class="bt" id="ed-recuo" title="Recuo da 1ª linha (2,5 cm)">⇥</button><button class="bt" data-cmd="removeFormat" title="Tirar formatação">🧽</button><span class="sep"></span>' +
      '<select id="ed-ia" title="IA no trecho selecionado"><option value="">🪄 IA na seleção…</option>' + IA_SEL.map((x) => '<option value="' + x[0] + '">' + x[1] + '</option>').join('') + '<option value="livre">Pedido livre…</option></select>' +
      '</div>' +
      '<div class="folha-fundo"><div class="folha recuo" id="ed-folha" contenteditable="true" spellcheck="true" lang="pt-BR"></div></div>' +
      '<p class="peq mut so-tela" id="ed-estado"></p>';
    folha = $('#ed-folha');
    document.execCommand('defaultParagraphSeparator', false, 'p');
    // guarda onde estava o cursor (para os menus não perderem a seleção)
    document.addEventListener('selectionchange', () => { const s = getSelection(); if (s.rangeCount && folha.contains(s.anchorNode)) faixa = s.getRangeAt(0).cloneRange(); });
    const voltarSelecao = () => { if (faixa) { const s = getSelection(); s.removeAllRanges(); s.addRange(faixa); } folha.focus(); };
    $('#ed-barra').addEventListener('mousedown', (e) => { if (e.target.closest('button')) e.preventDefault(); });
    $('#ed-barra').addEventListener('click', (e) => { const b = e.target.closest('[data-cmd]'); if (!b) return; voltarSelecao(); document.execCommand(b.dataset.cmd, false, null); marcarMudou(); });
    $('#ed-bloco').onchange = (e) => { voltarSelecao(); document.execCommand('formatBlock', false, e.target.value); e.target.value = 'p'; marcarMudou(); };
    $('#ed-fonte').onchange = (e) => { if (!e.target.value) return; voltarSelecao(); estilizar('fontFamily', e.target.value); e.target.value = ''; };
    $('#ed-tam').onchange = (e) => { if (!e.target.value) return; voltarSelecao(); estilizar('fontSize', e.target.value + 'pt'); e.target.value = ''; };
    $('#ed-recuo').onclick = () => { folha.classList.toggle('recuo'); J.aviso(folha.classList.contains('recuo') ? 'Recuo de 2,5 cm na 1ª linha: ligado' : 'Recuo da 1ª linha: desligado'); marcarMudou(); };
    $('#ed-ia').onchange = (e) => { const v = e.target.value; e.target.value = ''; if (v) iaNaSelecao(v); };
    folha.addEventListener('input', marcarMudou);
    folha.addEventListener('paste', (e) => {
      const h = e.clipboardData && e.clipboardData.getData('text/html'); const t = e.clipboardData && e.clipboardData.getData('text/plain');
      if (!h && !t) return; e.preventDefault();
      document.execCommand('insertHTML', false, h ? J.texto.limparHtml(h) : J.texto.textoParaHtml(t));
    });
    $('#ed-titulo').addEventListener('input', (e) => { atual.titulo = e.target.value; marcarMudou(); });
    $('#ed-novo').onclick = () => { if (mudou && folha.textContent.trim() && !confirm('Começar um documento novo? (o que não foi salvo se perde)')) return; abrir({ titulo: 'Documento sem título', html: '<p><br></p>' }); };
    $('#ed-salvar').onclick = salvar;
    $('#ed-word').onclick = () => J.docx.baixar(atual.titulo, html(), { recuo: folha.classList.contains('recuo') });
    $('#ed-html').onclick = () => J.baixar(nomeArquivo() + '.html', paginaHtml(), 'text/html;charset=utf-8');
    $('#ed-imprimir').onclick = () => window.print();
    $('#ed-copiar').onclick = () => J.copiar(texto());
    $('#ed-drive').onclick = async () => { const blob = await J.docx.gerar(atual.titulo, html(), { recuo: folha.classList.contains('recuo') }); J.compartilhar(nomeArquivo() + '.docx', blob); };
    $('#ed-ouvir').onclick = () => { if (J.voz.falando) return J.voz.parar(); const s = getSelection(); const sel = s && folha.contains(s.anchorNode) ? String(s) : ''; J.voz.falar(sel || texto()); };
    J.on('voz', (f) => { $('#ed-ouvir').textContent = f ? '⏹ Parar' : '🔊 Ler'; });
    J.voz.botaoDitado($('#ed-ditar'), null, (t) => { voltarSelecao(); document.execCommand('insertText', false, (/\s$/.test(folha.textContent) ? '' : ' ') + t); marcarMudou(); });
    $('#ed-modelo').onclick = () => J.abrirAba('biblioteca');
    $('#ed-guardar-modelo').onclick = async () => { const n = prompt('Nome do modelo:', atual.titulo); if (!n) return; await J.db.guardar('modelos', { titulo: n, html: html(), criado: Date.now() }); J.aviso('⭐ Modelo guardado em 📚.', 'ok'); };
    $('#ed-abrir').onclick = async () => {
      const [f] = await J.importar.escolher('.docx,.pdf,.txt,.md,.html,.htm,.rtf'); if (!f) return;
      try { const r = await J.importar.lerArquivo(f); abrir({ titulo: f.name.replace(/\.\w+$/, ''), html: r.html ? J.texto.limparHtml(r.html) : J.texto.textoParaHtml(r.texto) }); } catch (e) { J.aviso(e.message, 'erro'); }
    };
    // volta o que estava aberto
    const r = J.pref.get('editorRascunho', null);
    abrir(r || { titulo: 'Documento sem título', html: '<p><br></p>' }, true);
    setInterval(() => { if (mudou) { try { J.pref.set('editorRascunho', { id: atual.id, titulo: atual.titulo, html: html(), recuo: folha.classList.contains('recuo') }); } catch {} } }, 1500);
    window.addEventListener('beforeunload', (e) => { if (mudou && !atual.id && folha.textContent.trim().length > 20) { e.preventDefault(); e.returnValue = ''; } });
  }

  function estilizar(prop, valor) {
    const s = getSelection(); if (!s.rangeCount || s.isCollapsed) return J.aviso('Selecione o trecho primeiro.');
    const r = s.getRangeAt(0); const span = document.createElement('span'); span.style[prop] = valor;
    try { span.appendChild(r.extractContents()); r.insertNode(span); s.removeAllRanges(); const n = document.createRange(); n.selectNodeContents(span); s.addRange(n); } catch {}
    marcarMudou();
  }
  function marcarMudou() { mudou = true; const e = $('#ed-estado'); if (e) e.textContent = (atual.id ? 'Documento salvo em 📁 — ' : '') + 'alterações ainda não salvas'; }
  function html() { return folha.innerHTML; }
  function texto() { return J.texto.htmlParaTexto(folha.innerHTML); }
  function nomeArquivo() { return (atual.titulo || 'documento').replace(/[\\/:*?"<>|]+/g, '-').slice(0, 80); }
  function paginaHtml() {
    return '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>' + J.esc(atual.titulo) + '</title><style>body{font-family:"Times New Roman",serif;font-size:12pt;line-height:1.5;text-align:justify;max-width:16cm;margin:2cm auto}' + (folha.classList.contains('recuo') ? 'p{text-indent:2.5cm}' : '') + 'h1{font-size:14pt;text-align:center;text-transform:uppercase}h2{font-size:12pt;text-transform:uppercase}blockquote{margin-left:4cm;font-size:10pt;line-height:1}p{margin:0 0 .4em}</style></head><body>' + html() + '</body></html>';
  }
  function abrir(doc, quieto) {
    atual = { id: doc.id || null, titulo: doc.titulo || 'Documento sem título' };
    folha.innerHTML = doc.html || '<p><br></p>';
    folha.classList.toggle('recuo', doc.recuo !== false);
    $('#ed-titulo').value = atual.titulo;
    mudou = !!quieto && !doc.id; $('#ed-estado').textContent = doc.id ? 'Aberto de 📁 Documentos.' : '';
    if (!quieto) J.pref.set('editorRascunho', { id: atual.id, titulo: atual.titulo, html: folha.innerHTML, recuo: folha.classList.contains('recuo') });
  }
  async function salvar() {
    const d = await J.db.guardar('documentos', { id: atual.id || undefined, titulo: atual.titulo || 'Documento', html: html(), recuo: folha.classList.contains('recuo'), tipo: 'Editor', criado: atual.criado || Date.now() });
    atual.id = d.id; mudou = false; $('#ed-estado').textContent = '💾 Salvo em 📁 Documentos às ' + new Date().toLocaleTimeString('pt-BR').slice(0, 5);
    J.aviso('💾 Salvo.', 'ok');
  }
  async function iaNaSelecao(tipo) {
    const s = getSelection();
    if (faixa) { s.removeAllRanges(); s.addRange(faixa); }
    const trecho = s && !s.isCollapsed && folha.contains(s.anchorNode) ? String(s) : '';
    if (!trecho.trim()) return J.aviso('Selecione um trecho do texto primeiro (segure o dedo e arraste).');
    if (!J.ia.temChave()) { J.aviso('Falta a chave da IA (⚙️ Config).', 'erro'); return; }
    let pedido = (IA_SEL.find((x) => x[0] === tipo) || [])[2];
    if (tipo === 'livre') { pedido = prompt('O que a IA deve fazer com o trecho selecionado?'); if (!pedido) return; pedido += '\nDevolva só o trecho pronto, sem comentários.'; }
    const guardada = s.getRangeAt(0).cloneRange();
    J.aviso('🪄 A IA está trabalhando no trecho…', '', 2500);
    try {
      const md = await J.ia.gerar({ mensagens: [{ role: 'user', content: pedido + '\n\nTRECHO:\n' + trecho }] });
      const s2 = getSelection(); s2.removeAllRanges(); s2.addRange(guardada); folha.focus();
      if (tipo === 'continuar') { guardada.collapse(false); s2.removeAllRanges(); s2.addRange(guardada); }
      document.execCommand('insertHTML', false, J.texto.mdParaHtml(md));
      marcarMudou(); J.aviso('✅ Pronto. Se não gostou: ↶ Desfazer.', 'ok');
    } catch (e) { J.aviso(e.message, 'erro'); }
  }

  J.editor = { abrir, html, texto, salvar, inserirHtml(h) { folha.focus(); document.execCommand('insertHTML', false, h); marcarMudou(); }, get atual() { return atual; } };
  J.registrar({ aba: 'editor', montar });
})(window.J);
