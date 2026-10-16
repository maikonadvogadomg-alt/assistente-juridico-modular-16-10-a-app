/* =========================================================================
   Assistente Jurídico — 10-ia.js
   Fala com a IA. Principal: Google Gemini (chave grátis, AIza… ou AQ.…).
   Reserva: Groq (grátis, chave gsk_…) — se o Gemini der "limite", troca sozinho.
   O modelo antigo (gemini-1.5-flash) foi desligado pelo Google: era um dos
   motivos do app antigo não responder. Aqui ele tenta os modelos atuais.
   ========================================================================= */
(function (J) {
  'use strict';
  const GEMINI = 'https://generativelanguage.googleapis.com/v1beta';
  const MODELOS_GEMINI = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest', 'gemini-2.5-flash-lite'];
  const GROQ = 'https://api.groq.com/openai/v1';

  const cfg = () => Object.assign({ provedor: 'gemini', chave: '', modelo: '', gAuth: '', groqChave: '', groqModelo: 'llama-3.3-70b-versatile', reserva: true, ollamaModelo: 'phi4-mini' }, J.pref.get('ia', {}));
  const OLLAMA = 'http://127.0.0.1:11434';
  const salvar = (c) => { J.pref.set('ia', c); J.emit('ia-config', c); };

  function sistemaBase(extra) {
    const p = J.pref.get('perfil', {});
    let s = 'Você é um advogado brasileiro experiente' + (p.uf ? ' de ' + p.uf : ' de Minas Gerais') + ', especialista em direito previdenciário e processo civil. ' +
      'Escreva em português do Brasil, de forma formal, técnica e direta, sem introduções desnecessárias. Não invente fatos, números de processo, datas ou jurisprudência: ' +
      'quando faltar informação, deixe um campo [ENTRE COLCHETES] para o advogado preencher. Formate com títulos (##), parágrafos e listas quando ajudar.';
    if (p.nome) s += '\nO advogado é ' + p.nome + (p.oab ? ' (OAB ' + p.oab + ')' : '') + '.';
    if (p.regras) s += '\n\nREGRAS DO ESCRITÓRIO (siga sempre):\n' + p.regras;
    const extras = (J.regras && J.regras.paraIA) ? J.regras.paraIA() : '';
    if (extras) s += '\n\n' + extras;
    if (extra) s += '\n\n' + extra;
    return s;
  }

  async function textoDeErro(r) {
    let t = ''; try { t = await r.text(); } catch {}
    let m = ''; try { const j = JSON.parse(t); m = (j.error && (j.error.message || j.error)) || j.message || ''; } catch { m = t.slice(0, 200); }
    return 'Erro ' + r.status + (m ? ': ' + m : '');
  }

  // A chave do Gemini pode ir de 3 jeitos; tentamos um por um e guardamos o que funcionou.
  async function gFetch(url, init) {
    const c = cfg();
    if (!c.chave) throw new Error('Sem chave do Gemini. Toque em 🔑 lá em cima e cole a sua chave (é grátis em aistudio.google.com/apikey).');
    const modos = ['header', 'query', 'bearer'];
    if (c.gAuth && modos.includes(c.gAuth)) { modos.splice(modos.indexOf(c.gAuth), 1); modos.unshift(c.gAuth); }
    let ultimo;
    for (const m of modos) {
      const h = Object.assign({}, init.headers || {}); let u = url;
      if (m === 'header') h['x-goog-api-key'] = c.chave; else if (m === 'query') u += (u.includes('?') ? '&' : '?') + 'key=' + encodeURIComponent(c.chave); else h.Authorization = 'Bearer ' + c.chave;
      let r;
      try { r = await fetch(u, Object.assign({}, init, { headers: h })); } catch (e) { if (e.name === 'AbortError') throw e; ultimo = new Error('Sem internet (ou a conexão caiu).'); continue; }
      if (r.ok) { if (c.gAuth !== m) { c.gAuth = m; salvar(c); } return r; }
      const txt = await r.clone().text().catch(() => '');
      ultimo = new Error(await textoDeErro(r)); ultimo.status = r.status;
      if (!(r.status === 401 || r.status === 403 || /api[ _-]?key|credential|unauthenticated/i.test(txt))) throw ultimo;
    }
    throw new Error((ultimo ? ultimo.message : 'falhou') + ' — confira a chave do Gemini.');
  }

  function corpoGemini(mensagens, sistema, opcoes) {
    const juntas = [];
    mensagens.forEach((m) => { const role = m.role === 'assistant' ? 'model' : 'user'; const ult = juntas[juntas.length - 1]; if (ult && ult.role === role) ult.parts[0].text += '\n\n' + m.content; else juntas.push({ role, parts: [{ text: m.content }] }); });
    if (juntas.length && juntas[0].role !== 'user') juntas.unshift({ role: 'user', parts: [{ text: '(continuação)' }] });
    const corpo = { contents: juntas, systemInstruction: { parts: [{ text: sistema || sistemaBase() }] }, generationConfig: { temperature: (opcoes && opcoes.temperatura) != null ? opcoes.temperatura : 0.4, maxOutputTokens: 16384 } };
    if (opcoes && opcoes.internet) corpo.tools = [{ google_search: {} }]; // 🌐 pesquisa no Google antes de responder
    return corpo;
  }

  async function gemini(mensagens, sistema, sinal, opcoes) {
    const c = cfg();
    const lista = [c.modelo].concat(MODELOS_GEMINI).filter((m, i, a) => m && a.indexOf(m) === i);
    let ultimo;
    for (const modelo of lista) {
      try {
        const r = await gFetch(GEMINI + '/models/' + encodeURIComponent(modelo) + ':generateContent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpoGemini(mensagens, sistema, opcoes)), signal: sinal });
        const d = await r.json();
        const cand = d.candidates && d.candidates[0];
        let texto = cand && cand.content && (cand.content.parts || []).map((p) => p.text || '').join('');
        const fontes = ((cand && cand.groundingMetadata && cand.groundingMetadata.groundingChunks) || []).map((g) => g.web).filter(Boolean);
        if (texto && fontes.length) texto += '\n\n**Fontes pesquisadas na internet:**\n' + fontes.slice(0, 8).map((f) => '- ' + (f.title || 'site') + ' — ' + (f.uri || '')).join('\n');
        if (!texto) throw new Error(cand && cand.finishReason === 'SAFETY' ? 'O Gemini bloqueou a resposta (filtro de segurança). Reformule o pedido.' : 'O Gemini respondeu vazio. Tente de novo.');
        if (c.modelo !== modelo) { const n = cfg(); n.modelo = modelo; salvar(n); }
        return texto;
      } catch (e) {
        if (e.name === 'AbortError') throw e;
        ultimo = e;
        if (e.status === 404 || /not found|not supported|is not found/i.test(e.message)) continue; // modelo desligado: tenta o próximo
        throw e;
      }
    }
    throw ultimo || new Error('Nenhum modelo do Gemini respondeu.');
  }

  async function groq(mensagens, sistema, sinal) {
    const c = cfg();
    if (!c.groqChave) throw new Error('Sem chave da Groq.');
    const r = await fetch(GROQ + '/chat/completions', {
      method: 'POST', signal: sinal,
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + c.groqChave },
      body: JSON.stringify({ model: c.groqModelo || 'llama-3.3-70b-versatile', temperature: 0.4, messages: [{ role: 'system', content: sistema || sistemaBase() }].concat(mensagens) }),
    });
    if (!r.ok) throw new Error('Groq: ' + (await textoDeErro(r)));
    const d = await r.json();
    return (d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content) || '';
  }

  // 🦙 Ollama: IA grátis rodando no próprio computador (sem chave, sem internet)
  async function ollama(mensagens, sistema, sinal) {
    const c = cfg();
    let r;
    try {
      r = await fetch(OLLAMA + '/v1/chat/completions', { method: 'POST', signal: sinal, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: c.ollamaModelo || 'phi4-mini', temperature: 0.4, messages: [{ role: 'system', content: sistema || sistemaBase() }].concat(mensagens) }) });
    } catch (e) { if (e.name === 'AbortError') throw e; throw new Error('O Ollama não respondeu. Ele está ligado no computador (a lhama 🦙 perto do relógio)? Pelo site/celular ele costuma bloquear: use o programa .exe.'); }
    if (!r.ok) throw new Error('Ollama: ' + (await textoDeErro(r)) + (r.status === 404 ? ' — esse modelo não está baixado. Veja ⚙️ Config → Ollama.' : ''));
    const d = await r.json();
    return (d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content) || '';
  }
  async function ollamaInfo() {
    const v = await fetch(OLLAMA + '/api/version', { signal: AbortSignal.timeout(4000) }).then((r) => r.json());
    const t = await fetch(OLLAMA + '/api/tags').then((r) => r.json());
    return { versao: v.version, modelos: (t.models || []).map((m) => m.name) };
  }

  /** Pergunta para a IA. mensagens = [{role:'user'|'assistant', content}] */
  async function gerar({ mensagens, sistema, sinal, opcoes }) {
    const c = cfg();
    if (c.provedor === 'ollama') { if (opcoes && opcoes.internet) J.aviso('🌐 A pesquisa na internet só funciona com o Gemini. O Ollama responde com o que já sabe.'); return ollama(mensagens, sistema, sinal); }
    if (!c.chave && c.groqChave) return groq(mensagens, sistema, sinal);
    try { return await gemini(mensagens, sistema, sinal, opcoes); }
    catch (e) {
      if (e.name === 'AbortError') throw e;
      const limite = e.status === 429 || /quota|rate|exhausted|limit/i.test(e.message);
      if (c.reserva && c.groqChave) { J.aviso(limite ? 'Gemini no limite: usei a Groq.' : 'Gemini falhou: usei a Groq.'); return groq(mensagens, sistema, sinal); }
      if (limite) throw new Error('O limite grátis do Gemini acabou por agora. Espere 1 minuto e tente de novo (ou cole uma chave da Groq em ⚙️ Config, que ele usa de reserva).');
      throw e;
    }
  }

  async function modelos() {
    const r = await gFetch(GEMINI + '/models?pageSize=1000', { method: 'GET' });
    const d = await r.json();
    return (d.models || []).filter((m) => (m.supportedGenerationMethods || []).includes('generateContent')).map((m) => m.name.replace(/^models\//, '')).filter((n) => /gemini/.test(n) && !/tts|image|embedding|vision|aqa/.test(n));
  }

  J.ia = {
    gerar, modelos, sistemaBase, cfg, salvar, gFetch,
    temChave: () => { const c = cfg(); return c.provedor === 'ollama' || !!(c.chave || c.groqChave); },
    ollamaInfo, OLLAMA,
    async testar() { const t = await gerar({ mensagens: [{ role: 'user', content: 'Responda só: OK' }], sistema: 'Responda apenas OK.' }); return t.trim(); },
  };
})(window.J);
