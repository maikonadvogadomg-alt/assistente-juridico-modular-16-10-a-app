/* =========================================================================
   Assistente Jurídico — 00-core.js  (A LOCOMOTIVA: vem primeiro)
   Cria o "caixa comum" J que todos os módulos usam:
   J.$ / J.esc / J.aviso / J.pref (preferências) / J.db (banco do aparelho)
   J.baixar / J.compartilhar (Drive, WhatsApp…) / J.abrirAba / J.on / J.emit
   ========================================================================= */
(function () {
  'use strict';
  const J = (window.J = {});
  J.versao = '16/10-a';

  J.$ = (s, el) => (el || document).querySelector(s);
  J.$$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  J.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  J.uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  J.data = (t) => new Date(t || Date.now()).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  // ── eventos entre módulos ──────────────────────────────────────────────────
  const ouvintes = {};
  J.on = (nome, fn) => { (ouvintes[nome] = ouvintes[nome] || []).push(fn); };
  J.emit = (nome, dado) => { (ouvintes[nome] || []).forEach((fn) => { try { fn(dado); } catch (e) { console.error(e); } }); };

  // ── avisos ─────────────────────────────────────────────────────────────────
  J.aviso = (texto, tipo, ms) => {
    const el = document.createElement('div');
    el.className = 'aviso ' + (tipo || '');
    el.textContent = texto;
    J.$('#avisos').appendChild(el);
    setTimeout(() => el.remove(), ms || (tipo === 'erro' ? 6000 : 3200));
  };

  // ── preferências (pequenas: chave, modelo, voz…) ───────────────────────────
  J.pref = {
    get(k, d) { try { const v = localStorage.getItem('jur:' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem('jur:' + k, JSON.stringify(v)); } catch {} },
  };

  // ── banco do aparelho (IndexedDB): documentos, modelos, ementas, conversas ──
  const LOJAS = ['documentos', 'modelos', 'ementas', 'historico', 'conversas', 'regras'];
  let dbp = null;
  function abrir() {
    if (dbp) return dbp;
    dbp = new Promise((ok, erro) => {
      const r = indexedDB.open('assistente-juridico', 2);
      r.onupgradeneeded = () => { LOJAS.forEach((n) => { if (!r.result.objectStoreNames.contains(n)) r.result.createObjectStore(n, { keyPath: 'id' }); }); };
      r.onsuccess = () => ok(r.result);
      r.onerror = () => erro(r.error);
    });
    return dbp;
  }
  async function tx(loja, modo, fn) {
    const db = await abrir();
    return new Promise((ok, erro) => {
      const t = db.transaction(loja, modo); const s = t.objectStore(loja); let res;
      Promise.resolve(fn(s)).then((v) => { res = v; });
      t.oncomplete = () => ok(res && res.result !== undefined && res instanceof IDBRequest ? res.result : res);
      t.onerror = () => erro(t.error);
    });
  }
  J.db = {
    async todos(loja) { const db = await abrir(); return new Promise((ok, erro) => { const r = db.transaction(loja).objectStore(loja).getAll(); r.onsuccess = () => ok(r.result || []); r.onerror = () => erro(r.error); }); },
    async pegar(loja, id) { const db = await abrir(); return new Promise((ok, erro) => { const r = db.transaction(loja).objectStore(loja).get(id); r.onsuccess = () => ok(r.result || null); r.onerror = () => erro(r.error); }); },
    async guardar(loja, obj) { obj.id = obj.id || J.uid(); obj.atualizado = Date.now(); await tx(loja, 'readwrite', (s) => s.put(obj)); J.emit('db', { loja, id: obj.id }); return obj; },
    async apagar(loja, id) { await tx(loja, 'readwrite', (s) => s.delete(id)); J.emit('db', { loja, id }); },
    async limpar(loja) { await tx(loja, 'readwrite', (s) => s.clear()); J.emit('db', { loja }); },
    LOJAS,
  };
  // pede ao navegador para não apagar os dados deste app
  try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch {}

  // ── baixar e compartilhar ──────────────────────────────────────────────────
  // nome de arquivo seguro (o Chrome troca nomes com "—" por "download")
  J.nomeArquivo = (n) => String(n || 'arquivo').replace(/[\u2012-\u2015]/g, '-').replace(/[\\/:*?"<>|\u0000-\u001f]+/g, '-').replace(/\s+/g, ' ').trim().slice(0, 120) || 'arquivo';
  J.baixar = (nome, dados, tipo) => {
    nome = J.nomeArquivo(nome);
    const blob = dados instanceof Blob ? dados : new Blob([dados], { type: tipo || 'text/plain;charset=utf-8' });
    // dentro do APK do Mini SK: o app Android salva em Downloads
    if (window.AndroidBridge && window.AndroidBridge.salvar) {
      const r = new FileReader();
      r.onload = () => { const res = window.AndroidBridge.salvar(nome, String(r.result).split(',')[1] || '', blob.type || ''); if (res !== 'ok') J.aviso('Não consegui salvar: ' + res, 'erro'); else J.aviso('Salvo em Downloads: ' + nome, 'ok'); };
      r.readAsDataURL(blob); return;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = nome;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  };
  // "Compartilhar" do celular: escolha Drive, WhatsApp, e-mail. Sem cadastro no Google.
  J.compartilhar = async (nome, dados, tipo) => {
    nome = J.nomeArquivo(nome);
    const blob = dados instanceof Blob ? dados : new Blob([dados], { type: tipo || 'text/plain;charset=utf-8' });
    try {
      const f = new File([blob], nome, { type: blob.type });
      if (navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], title: nome }); return true; }
    } catch (e) { if (e && e.name === 'AbortError') return false; }
    J.baixar(nome, blob);
    J.aviso('Este aparelho não abriu o "Compartilhar": o arquivo foi baixado. Mande para o Drive pelo app do Drive (＋ → Enviar).');
    return false;
  };
  J.copiar = async (texto) => {
    try { await navigator.clipboard.writeText(texto); J.aviso('Copiado.', 'ok'); }
    catch { const t = document.createElement('textarea'); t.value = texto; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); J.aviso('Copiado.', 'ok'); } catch { J.aviso('Não consegui copiar.', 'erro'); } t.remove(); }
  };

  // ── carregar biblioteca de fora só quando precisar (PDF, Word…) ─────────────
  const carregados = {};
  J.carregarScript = (src) => carregados[src] || (carregados[src] = new Promise((ok, erro) => {
    const s = document.createElement('script'); s.src = src; s.onload = ok;
    s.onerror = () => { delete carregados[src]; erro(new Error('Precisa de internet para abrir esse tipo de arquivo na 1ª vez.')); };
    document.head.appendChild(s);
  }));

  // ── abas ───────────────────────────────────────────────────────────────────
  J.abrirAba = (nome) => {
    J.$$('#abas button').forEach((b) => b.classList.toggle('ativa', b.dataset.aba === nome));
    J.$$('.painel').forEach((p) => p.classList.toggle('ativo', p.id === 'painel-' + nome));
    J.pref.set('aba', nome);
    J.emit('aba', nome);
    window.scrollTo(0, 0);
  };

  // ── módulos se registram aqui; o 99-app monta todos na ordem ────────────────
  J.modulos = [];
  J.registrar = (m) => J.modulos.push(m);
})();
