/* =========================================================================
   Assistente Jurídico — 50-documentos.js
   📁 Documentos salvos no aparelho + 🕐 histórico do que a IA fez.
   Abrir no Editor, baixar em Word, mandar ao Drive, duplicar, apagar.
   💾 Backup de tudo num arquivo só (e restaurar em outro aparelho).
   ========================================================================= */
(function (J) {
  'use strict';
  let painel, filtro = '';
  const $ = (s) => J.$(s, painel);
  const nomeArq = (t) => (t || 'documento').replace(/[\\/:*?"<>|]+/g, '-').slice(0, 80);

  function montar(el) {
    painel = el;
    el.innerHTML =
      '<div class="linha" style="margin-bottom:10px"><input type="search" id="dc-busca" class="cresce" placeholder="🔍 Procurar pelo nome ou pelo texto…"><button class="bt forte" id="dc-novo">＋ Novo no Editor</button></div>' +
      '<h2>📁 Documentos</h2><div class="lista" id="dc-lista"></div>' +
      '<h2 style="margin-top:22px">🕐 Feitos pela IA (últimos 60)</h2><p class="peq mut">Cada resultado do ⚡ Processar fica aqui sozinho, para você não perder.</p><div class="lista" id="dc-hist"></div>' +
      '<div class="cartao" style="margin-top:22px"><h2>💾 Backup de tudo</h2><p class="peq mut">Documentos, modelos, ementas, conversas e histórico num arquivo só. Guarde no Drive. Serve também para passar tudo do celular para o computador (ou do site para o APK).</p>' +
      '<label class="peq"><input type="checkbox" id="dc-com-chaves"> incluir as chaves da IA (só se o arquivo ficar com você)</label>' +
      '<div class="linha" style="margin-top:8px"><button class="bt" id="dc-bk-baixar">⬇ Baixar backup</button><button class="bt forte" id="dc-bk-drive">📤 Mandar backup ao Drive</button><button class="bt" id="dc-bk-restaurar">📥 Restaurar backup</button></div></div>';
    $('#dc-busca').addEventListener('input', (e) => { filtro = e.target.value.trim().toLowerCase(); pintar(); });
    $('#dc-novo').onclick = () => { J.editor.abrir({ titulo: 'Documento sem título', html: '<p><br></p>' }); J.abrirAba('editor'); };
    el.addEventListener('click', acao);
    $('#dc-bk-baixar').onclick = async () => J.baixar('backup-juridico-' + new Date().toISOString().slice(0, 10) + '.json', await backup(), 'application/json');
    $('#dc-bk-drive').onclick = async () => J.compartilhar('backup-juridico-' + new Date().toISOString().slice(0, 10) + '.json', await backup(), 'application/json');
    $('#dc-bk-restaurar').onclick = async () => { const [f] = await J.importar.escolher('.json,application/json'); if (f) restaurar(f).catch((e) => J.aviso('Backup inválido: ' + e.message, 'erro')); };
    J.on('db', (d) => { if (d.loja === 'documentos' || d.loja === 'historico') pintar(); });
    J.on('aba', (a) => { if (a === 'documentos') pintar(); });
    pintar();
  }
  const casa = (d) => !filtro || ((d.titulo || '') + ' ' + J.texto.htmlParaTexto(d.html || '').slice(0, 20000)).toLowerCase().includes(filtro);
  async function pintar() {
    const docs = (await J.db.todos('documentos')).filter(casa).sort((a, b) => b.atualizado - a.atualizado);
    const hist = (await J.db.todos('historico')).filter(casa).sort((a, b) => b.criado - a.criado);
    const item = (d, loja) => '<div class="item"><div class="info"><b>' + J.esc(d.titulo || 'Sem título') + '</b><small>' + J.esc(d.tipo || d.acao || '') + ' · ' + J.data(d.atualizado || d.criado) + '</small></div><div class="bts">' +
      '<button class="bt mini forte" data-a="abrir" data-l="' + loja + '" data-id="' + d.id + '">Abrir</button><button class="bt mini" data-a="word" data-l="' + loja + '" data-id="' + d.id + '">⬇ Word</button><button class="bt mini" data-a="drive" data-l="' + loja + '" data-id="' + d.id + '" title="Mandar ao Drive, WhatsApp…">📤</button>' +
      (loja === 'documentos' ? '<button class="bt mini" data-a="dup" data-l="' + loja + '" data-id="' + d.id + '" title="Duplicar">⧉</button>' : '') + '<button class="bt mini perigo" data-a="apagar" data-l="' + loja + '" data-id="' + d.id + '" title="Apagar">🗑</button></div></div>';
    $('#dc-lista').innerHTML = docs.length ? docs.map((d) => item(d, 'documentos')).join('') : '<p class="mut">' + (filtro ? 'Nada encontrado.' : 'Nenhum documento ainda. No ✏️ Editor, toque em 💾 Salvar.') + '</p>';
    $('#dc-hist').innerHTML = hist.length ? hist.map((d) => item(d, 'historico')).join('') : '<p class="mut">' + (filtro ? 'Nada encontrado.' : 'Vazio.') + '</p>';
  }
  async function acao(e) {
    const b = e.target.closest('[data-a]'); if (!b) return;
    const d = await J.db.pegar(b.dataset.l, b.dataset.id); if (!d) return;
    const a = b.dataset.a;
    if (a === 'abrir') { J.editor.abrir(b.dataset.l === 'documentos' ? d : { titulo: d.titulo, html: d.html }); J.abrirAba('editor'); }
    if (a === 'word') J.docx.baixar(d.titulo, d.html, { recuo: d.recuo });
    if (a === 'drive') J.compartilhar(nomeArq(d.titulo) + '.docx', await J.docx.gerar(d.titulo, d.html, { recuo: d.recuo }));
    if (a === 'dup') { const c = Object.assign({}, d, { id: undefined, titulo: d.titulo + ' (cópia)', criado: Date.now() }); await J.db.guardar('documentos', c); J.aviso('⧉ Duplicado.', 'ok'); }
    if (a === 'apagar') { if (b.dataset.certeza) { await J.db.apagar(b.dataset.l, d.id); J.aviso('Apagado.'); } else { b.dataset.certeza = '1'; b.textContent = 'Certeza?'; setTimeout(() => { if (b.isConnected) { delete b.dataset.certeza; b.textContent = '🗑'; } }, 3000); } }
  }
  async function backup() {
    const dados = { app: 'assistente-juridico', versao: 1, criado: new Date().toISOString(), lojas: {}, prefs: {} };
    for (const l of J.db.LOJAS) dados.lojas[l] = await J.db.todos(l);
    const comChaves = $('#dc-com-chaves').checked;
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (!k.startsWith('jur:')) continue; if (!comChaves && k === 'jur:ia') continue; dados.prefs[k] = localStorage.getItem(k); }
    return JSON.stringify(dados);
  }
  async function restaurar(f) {
    const d = JSON.parse(await f.text());
    if (d.app !== 'assistente-juridico') throw new Error('este arquivo não é backup do Assistente Jurídico');
    let n = 0;
    for (const [l, itens] of Object.entries(d.lojas || {})) { if (!J.db.LOJAS.includes(l)) continue; for (const it of itens) { await J.db.guardar(l, it); n++; } }
    for (const [k, v] of Object.entries(d.prefs || {})) { if (k.startsWith('jur:')) try { localStorage.setItem(k, v); } catch {} }
    J.aviso('📥 Restaurado: ' + n + ' item(ns). Recarregando…', 'ok');
    setTimeout(() => location.reload(), 1200);
  }
  J.registrar({ aba: 'documentos', montar });
})(window.J);
