/* =========================================================================
   Assistente Jurídico — 80-config.js
   ⚙️ Chave da IA (Gemini grátis + Groq de reserva), voz, seus dados e regras
   do escritório (a IA segue sempre). Tudo fica só neste aparelho.
   ========================================================================= */
(function (J) {
  'use strict';
  let painel;
  const $ = (s) => J.$(s, painel);

  function montar(el) {
    painel = el;
    const c = J.ia.cfg(), v = J.voz.cfg(), p = J.pref.get('perfil', {});
    el.innerHTML =
      '<div class="cartao"><h2>🤖 Qual IA usar</h2><select id="cf-provedor"><option value="gemini">Gemini (pela internet — grátis com chave; faz 🌐 pesquisa)</option><option value="ollama">Ollama (no seu computador — grátis, sem chave, sem internet)</option></select>' +
      '<div id="cf-ollama" hidden style="margin-top:10px"><p class="peq mut">Precisa do Ollama instalado e ligado no computador (a lhama 🦙 perto do relógio). Funciona no programa .exe; pelo site/celular ele costuma bloquear.</p>' +
      '<label class="campo" for="cf-ol-modelo">Modelo (o "cérebro")</label><div class="linha"><select id="cf-ol-modelo" class="cresce"></select><button class="bt mini" id="cf-ol-ver">🔄 Ver os do computador</button></div>' +
      '<div class="linha" style="margin-top:8px"><button class="bt forte" id="cf-ol-testar">🧪 Testar o Ollama</button></div><div id="cf-ol-msg" class="peq" style="margin-top:6px"></div>' +
      '<details style="margin-top:8px"><summary class="peq">📚 Baixar um modelo (já explicado)</summary><div id="cf-ol-cat" class="lista" style="margin-top:6px"></div></details></div></div>' +
      '<div class="cartao" id="cf-cartao-chave"><h2>🔑 Chave da IA (Gemini)</h2>' +
      '<p class="peq mut">Gemini: grátis em <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">aistudio.google.com/apikey</a> (começa com AIza… ou AQ.…). A chave fica só neste aparelho. Nunca mande a chave para ninguém.</p>' +
      '<label class="campo" for="cf-chave">Chave do Gemini</label><div class="linha"><input type="password" id="cf-chave" class="cresce" autocomplete="off" spellcheck="false" placeholder="AIza… ou AQ.…"><button class="bt mini" id="cf-ver">👁</button></div>' +
      '<label class="campo" for="cf-modelo">Modelo</label><div class="linha"><select id="cf-modelo" class="cresce"><option value="">Automático (o melhor que estiver ligado)</option></select><button class="bt mini" id="cf-buscar">↻ Buscar modelos</button></div>' +
      '<details style="margin-top:10px"><summary class="peq">Reserva: Groq (grátis) — usada quando o Gemini estiver no limite</summary>' +
      '<p class="peq mut">Chave grátis em <a href="https://console.groq.com/keys" target="_blank" rel="noopener">console.groq.com/keys</a> (começa com gsk_).</p><input type="password" id="cf-groq" autocomplete="off" spellcheck="false" placeholder="gsk_…">' +
      '<label class="peq"><input type="checkbox" id="cf-reserva"> trocar sozinho para a Groq quando o Gemini falhar</label></details>' +
      '<div class="linha" style="margin-top:10px"><button class="bt forte" id="cf-salvar">💾 Salvar chave</button><button class="bt" id="cf-testar">🧪 Testar</button><span id="cf-teste" class="peq"></span></div></div>' +

      '<div class="cartao"><h2>🔊 Voz</h2><p class="peq mut">A voz do Gemini é natural (gente de verdade) e usa a mesma chave. Voz de robô do aparelho não é usada.</p>' +
      '<label class="campo" for="cf-motor">De onde vem a voz</label><select id="cf-motor"><option value="gemini">Gemini (natural — recomendado)</option><option value="navegador">Voz "Natural" do navegador (só no Edge: Francisca, Antonio…)</option></select>' +
      '<div id="cf-vz-gemini"><label class="campo" for="cf-voz">Voz do Gemini</label><select id="cf-voz">' + J.voz.VOZES.map((x) => '<option value="' + x.id + '">' + x.nome + '</option>').join('') + '</select></div>' +
      '<div id="cf-vz-nav" hidden><label class="campo" for="cf-voz-nav">Voz natural do navegador</label><select id="cf-voz-nav"></select><p class="peq mut" id="cf-sem-nat"></p></div>' +
      '<div class="linha" style="margin-top:10px"><button class="bt" id="cf-ouvir">▶ Ouvir um exemplo</button></div></div>' +

      '<div class="cartao"><h2>👤 Seus dados (vão nas peças)</h2>' +
      '<div class="linha"><div class="cresce"><label class="campo" for="cf-nome">Nome do advogado</label><input type="text" id="cf-nome"></div><div style="width:130px"><label class="campo" for="cf-oab">OAB nº</label><input type="text" id="cf-oab"></div><div style="width:80px"><label class="campo" for="cf-uf">UF</label><input type="text" id="cf-uf" maxlength="2"></div></div>' +
      '<label class="campo" for="cf-regras">Regras do escritório (a IA segue sempre)</label><textarea id="cf-regras" style="min-height:110px" placeholder="Ex.: sempre pedir justiça gratuita; usar &quot;Excelentíssimo&quot; por extenso; citar a Lei 8.213/91 pelo número do artigo…"></textarea>' +
      '<button class="bt forte" id="cf-perfil" style="margin-top:8px">💾 Salvar meus dados</button></div>' +

      '<div class="cartao"><h2>📲 Instalar e levar para outro aparelho</h2><ul class="peq">' +
      '<li><b>Celular (Chrome):</b> abra o endereço do site → menu ⋮ → <b>Instalar app</b>.</li>' +
      '<li><b>APK:</b> no Mini SK, importe o zip deste app → 📦 APK.</li>' +
      '<li><b>Passar tudo para outro aparelho:</b> 📁 Documentos → 💾 Backup de tudo → no outro aparelho, 📥 Restaurar.</li></ul>' +
      '<p class="peq mut">Versão ' + J.versao + '</p><button class="bt mini perigo" id="cf-zerar">🗑 Apagar tudo deste aparelho</button></div>';

    // ── qual IA ──
    const CAT = [['phi4-mini', '2,5 GB', 'Da Microsoft. Fala português bem. O melhor para começar.'], ['qwen2.5:3b', '1,9 GB', 'Muito bom em português e rápido.'], ['gemma3:4b', '3,3 GB', 'Do Google. Bom em português; precisa de 8 GB de memória.'], ['gemma3:1b', '0,8 GB', 'Bem leve, para PC fraco. Respostas simples.']];
    $('#cf-provedor').value = c.provedor || 'gemini';
    const pintarProv = () => { const ol = $('#cf-provedor').value === 'ollama'; $('#cf-ollama').hidden = !ol; };
    $('#cf-provedor').onchange = () => { const n = J.ia.cfg(); n.provedor = $('#cf-provedor').value; J.ia.salvar(n); pintarProv(); J.aviso(n.provedor === 'ollama' ? '🦙 Agora a IA é o Ollama do computador.' : '✨ Agora a IA é o Gemini.', 'ok'); };
    pintarProv();
    const selOl = $('#cf-ol-modelo');
    const preencherOl = (lista) => { const atual = J.ia.cfg().ollamaModelo || 'phi4-mini'; const nomes = Array.from(new Set([atual].concat(lista || []))); selOl.innerHTML = nomes.map((m) => '<option>' + J.esc(m) + '</option>').join(''); selOl.value = atual; };
    preencherOl([]);
    selOl.onchange = () => { const n = J.ia.cfg(); n.ollamaModelo = selOl.value; J.ia.salvar(n); };
    const olMsg = (t) => ($('#cf-ol-msg').innerHTML = t);
    $('#cf-ol-ver').onclick = async () => { try { const i = await J.ia.ollamaInfo(); preencherOl(i.modelos); olMsg('✅ Ollama ligado. ' + i.modelos.length + ' modelo(s) no computador.'); pintarCat(i.modelos); } catch { olMsg('❌ O Ollama está desligado. Abra <b>Ollama</b> no menu Iniciar do Windows e tente de novo.'); } };
    $('#cf-ol-testar').onclick = async () => {
      let i; try { i = await J.ia.ollamaInfo(); } catch { return olMsg('❌ 1/2 · O Ollama está desligado (ou não instalado). Abra <b>Ollama</b> no menu Iniciar (a lhama 🦙 aparece perto do relógio) e teste de novo.'); }
      preencherOl(i.modelos); pintarCat(i.modelos);
      if (!i.modelos.length) return olMsg('✅ Ollama ligado, mas sem nenhum modelo. Abra 📚 Baixar um modelo, logo abaixo.');
      let m = J.ia.cfg().ollamaModelo; if (!i.modelos.some((x) => x === m || x === m + ':latest')) { m = i.modelos.find((x) => /phi4|qwen|gemma/.test(x)) || i.modelos[0]; const n = J.ia.cfg(); n.ollamaModelo = m; J.ia.salvar(n); preencherOl(i.modelos); }
      const t0 = Date.now(); const rel = setInterval(() => olMsg('✅ 1/2 · Ollama ligado. ⏳ 2/2 · Perguntando ao ' + J.esc(m) + '… ' + Math.round((Date.now() - t0) / 1000) + ' s (a 1ª vez demora: ele carrega na memória)'), 1000);
      try { const n0 = J.ia.cfg(); const prov = n0.provedor; n0.provedor = 'ollama'; J.pref.set('ia', n0); const r = await J.ia.gerar({ mensagens: [{ role: 'user', content: 'Em uma frase curta, em português: você está funcionando?' }], sistema: 'Responda em português do Brasil, curto.' }); n0.provedor = prov; J.pref.set('ia', n0); clearInterval(rel); olMsg('✅ Respondeu em ' + Math.round((Date.now() - t0) / 1000) + ' s: <i>"' + J.esc(r.trim().slice(0, 160)) + '"</i>' + (prov !== 'ollama' ? '<br>Para usar sempre: em "Qual IA usar", escolha <b>Ollama</b>.' : '')); }
      catch (e) { clearInterval(rel); const n0 = J.ia.cfg(); olMsg('❌ ' + J.esc(e.message)); }
    };
    function pintarCat(tem) {
      tem = tem || [];
      $('#cf-ol-cat').innerHTML = CAT.map(([n, t, d]) => { const ok = tem.some((x) => x === n || x === n + ':latest'); return '<div class="item"><div class="info"><b>' + n + '</b><small>' + t + ' · ' + d + '</small></div><div class="bts">' + (ok ? '<button class="bt mini forte" data-ol-usar="' + n + '">Usar</button>' : '<button class="bt mini" data-ol-baixar="' + n + '">⬇ Baixar</button>') + '</div></div>'; }).join('');
    }
    pintarCat([]);
    $('#cf-ol-cat').onclick = async (e) => {
      const u = e.target.closest('[data-ol-usar]'); if (u) { const n = J.ia.cfg(); n.ollamaModelo = u.dataset.olUsar; J.ia.salvar(n); preencherOl([]); J.aviso('Agora o Ollama usa ' + u.dataset.olUsar + '.', 'ok'); return; }
      const b = e.target.closest('[data-ol-baixar]'); if (!b) return; const m = b.dataset.olBaixar; b.disabled = true;
      try {
        const r = await fetch(J.ia.OLLAMA + '/api/pull', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: m, stream: true }) });
        const leitor = r.body.getReader(); const dec = new TextDecoder(); let resto = '';
        for (;;) { const { value, done } = await leitor.read(); if (done) break; resto += dec.decode(value, { stream: true }); const ls = resto.split('\n'); resto = ls.pop(); for (const l of ls) { let j = {}; try { j = JSON.parse(l); } catch { continue; } if (j.error) throw new Error(j.error); b.textContent = j.total ? Math.round((j.completed || 0) * 100 / j.total) + '%' : '…'; } }
        const n = J.ia.cfg(); n.ollamaModelo = m; J.ia.salvar(n); J.aviso('✅ ' + m + ' baixado e escolhido.', 'ok'); $('#cf-ol-ver').click();
      } catch (er) { J.aviso('Não baixou: ' + er.message + ' (o Ollama está ligado? tem espaço no disco?)', 'erro'); b.disabled = false; b.textContent = '⬇ Baixar'; }
    };
    $('#cf-chave').value = c.chave; $('#cf-groq').value = c.groqChave; $('#cf-reserva').checked = c.reserva !== false;
    if (c.modelo) $('#cf-modelo').innerHTML += '<option value="' + J.esc(c.modelo) + '">' + J.esc(c.modelo) + '</option>';
    $('#cf-modelo').value = c.modelo || '';
    $('#cf-ver').onclick = () => { const i = $('#cf-chave'); i.type = i.type === 'password' ? 'text' : 'password'; };
    const guardarChave = () => { const n = J.ia.cfg(); const nova = $('#cf-chave').value.trim(); if (nova !== n.chave) n.gAuth = ''; n.chave = nova; n.groqChave = $('#cf-groq').value.trim(); n.reserva = $('#cf-reserva').checked; n.modelo = $('#cf-modelo').value; J.ia.salvar(n); };
    $('#cf-salvar').onclick = () => { guardarChave(); J.aviso('💾 Chave salva neste aparelho.', 'ok'); };
    $('#cf-modelo').onchange = guardarChave;
    $('#cf-testar').onclick = async () => { guardarChave(); $('#cf-teste').innerHTML = '<span class="carregando"></span>'; try { const r = await J.ia.testar(); $('#cf-teste').textContent = '✅ Funcionando (' + (J.ia.cfg().modelo || 'ok') + '): ' + r.slice(0, 20); } catch (e) { $('#cf-teste').textContent = '❌ ' + e.message; } };
    $('#cf-buscar').onclick = async () => {
      guardarChave();
      try { const ms = await J.ia.modelos(); const atual = $('#cf-modelo').value; $('#cf-modelo').innerHTML = '<option value="">Automático (o melhor que estiver ligado)</option>' + ms.map((m) => '<option>' + J.esc(m) + '</option>').join(''); $('#cf-modelo').value = ms.includes(atual) ? atual : ''; J.aviso(ms.length + ' modelos encontrados.', 'ok'); }
      catch (e) { J.aviso(e.message, 'erro'); }
    };
    // voz
    $('#cf-motor').value = v.motor; $('#cf-voz').value = v.voz;
    const pintarVoz = () => {
      const nav = $('#cf-motor').value === 'navegador';
      $('#cf-vz-gemini').hidden = nav; $('#cf-vz-nav').hidden = !nav;
      const nat = J.voz.vozesNaturais();
      $('#cf-voz-nav').innerHTML = nat.map((x) => '<option>' + J.esc(x.name) + '</option>').join('');
      $('#cf-voz-nav').value = J.voz.cfg().vozNavegador || (nat[0] && nat[0].name) || '';
      $('#cf-sem-nat').textContent = nat.length ? '' : 'Este navegador não tem voz natural em português. Use a do Gemini.';
    };
    const guardarVoz = () => { J.pref.set('voz', { motor: $('#cf-motor').value, voz: $('#cf-voz').value, vozNavegador: $('#cf-voz-nav').value }); pintarVoz(); };
    ['#cf-motor', '#cf-voz', '#cf-voz-nav'].forEach((s) => ($(s).onchange = guardarVoz));
    J.on('vozes-navegador', pintarVoz); pintarVoz();
    $('#cf-ouvir').onclick = () => { if (J.voz.falando) return J.voz.parar(); J.voz.falar('Olá! Esta é a voz do seu assistente jurídico. Posso ler resumos, decisões e as respostas da conversa para você.'); };
    J.on('voz', (f) => { $('#cf-ouvir').textContent = f ? '⏹ Parar' : '▶ Ouvir um exemplo'; });
    // perfil
    $('#cf-nome').value = p.nome || ''; $('#cf-oab').value = p.oab || ''; $('#cf-uf').value = p.uf || ''; $('#cf-regras').value = p.regras || '';
    $('#cf-perfil').onclick = () => { J.pref.set('perfil', { nome: $('#cf-nome').value.trim(), oab: $('#cf-oab').value.trim(), uf: $('#cf-uf').value.trim().toUpperCase(), regras: $('#cf-regras').value.trim() }); J.aviso('💾 Seus dados foram salvos.', 'ok'); };
    $('#cf-zerar').onclick = async () => {
      if (!confirm('Apagar TODOS os documentos, modelos, ementas, conversas e chaves deste aparelho? Faça um backup antes.')) return;
      for (const l of J.db.LOJAS) await J.db.limpar(l);
      Object.keys(localStorage).filter((k) => k.startsWith('jur:')).forEach((k) => localStorage.removeItem(k));
      location.reload();
    };
  }
  J.registrar({ aba: 'config', montar });
})(window.J);
