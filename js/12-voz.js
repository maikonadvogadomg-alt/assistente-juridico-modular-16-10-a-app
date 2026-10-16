/* =========================================================================
   Assistente Jurídico — 12-voz.js
   🎤 Ditado (falar e virar texto) e 🔊 leitura em voz NATURAL.
   A voz é a do Gemini (gente de verdade, não robô) — usa a mesma chave grátis.
   Voz "de robô" do aparelho NUNCA é usada. No navegador Edge, as vozes
   "Natural" da Microsoft (ex.: Francisca, Antonio) podem ser escolhidas.
   ========================================================================= */
(function (J) {
  'use strict';
  const MODELO_TTS = 'gemini-2.5-flash-preview-tts';
  const VOZES = [
    { id: 'Charon', nome: 'Charon — masculina, calma (padrão)' },
    { id: 'Orus', nome: 'Orus — masculina, firme' },
    { id: 'Fenrir', nome: 'Fenrir — masculina, animada' },
    { id: 'Puck', nome: 'Puck — masculina, leve' },
    { id: 'Kore', nome: 'Kore — feminina, firme' },
    { id: 'Aoede', nome: 'Aoede — feminina, suave' },
    { id: 'Leda', nome: 'Leda — feminina, jovem' },
    { id: 'Zephyr', nome: 'Zephyr — feminina, clara' },
  ];
  const cfg = () => Object.assign({ motor: 'gemini', voz: 'Charon', vozNavegador: '' }, J.pref.get('voz', {}));

  // ── texto limpo para ler (sem #, *, links…) ────────────────────────────────
  function limpar(t) {
    return String(t || '').replace(/```[\s\S]*?```/g, ' ').replace(/[#*_`>|]+/g, ' ').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\bart\.\s/gi, 'artigo ').replace(/\bfls?\.\s/gi, 'folhas ').replace(/\bn[ºo°]\s?/gi, 'número ').replace(/§\s?/g, 'parágrafo ')
      .replace(/[ \t]+/g, ' ').replace(/\n{2,}/g, '\n').trim();
  }
  function pedacos(t, max) {
    max = max || 1100; const out = []; let atual = '';
    for (const frase of t.split(/(?<=[.!?;:\n])\s+/)) {
      if ((atual + ' ' + frase).length > max && atual) { out.push(atual.trim()); atual = ''; }
      if (frase.length > max) { for (let i = 0; i < frase.length; i += max) out.push(frase.slice(i, i + max)); continue; }
      atual += ' ' + frase;
    }
    if (atual.trim()) out.push(atual.trim());
    return out;
  }
  function wav(pcm, taxa) {
    const h = new ArrayBuffer(44), v = new DataView(h); const w = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    w(0, 'RIFF'); v.setUint32(4, 36 + pcm.length, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, taxa, true); v.setUint32(28, taxa * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, pcm.length, true);
    return new Blob([h, pcm], { type: 'audio/wav' });
  }
  async function audioGemini(texto, sinal) {
    const c = cfg();
    const r = await J.ia.gFetch('https://generativelanguage.googleapis.com/v1beta/models/' + MODELO_TTS + ':generateContent', {
      method: 'POST', signal: sinal, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: texto }] }], generationConfig: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: c.voz || 'Charon' } } } } }),
    });
    const d = await r.json();
    const parte = d.candidates && d.candidates[0] && d.candidates[0].content && (d.candidates[0].content.parts || []).find((p) => p.inlineData);
    if (!parte) throw new Error('A voz do Gemini não veio. Tente de novo em 1 minuto.');
    const taxa = Number((/rate=(\d+)/.exec(parte.inlineData.mimeType || '') || [])[1] || 24000);
    const bin = atob(parte.inlineData.data); const u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    return wav(u8, taxa);
  }

  // ── tocar ──────────────────────────────────────────────────────────────────
  let sessao = 0, audio = null, controle = null;
  const estado = { falando: false };
  function parar() {
    sessao++; estado.falando = false;
    if (controle) { try { controle.abort(); } catch {} controle = null; }
    if (audio) { try { audio.pause(); } catch {} audio = null; }
    try { window.speechSynthesis && speechSynthesis.cancel(); } catch {}
    J.emit('voz', false);
  }
  function vozesNaturais() {
    if (!window.speechSynthesis) return [];
    return speechSynthesis.getVoices().filter((v) => /^pt/i.test(v.lang) && /natural|online|neural/i.test(v.name));
  }
  async function falar(texto, opcoes) {
    opcoes = opcoes || {};
    parar();
    const minha = ++sessao; estado.falando = true; J.emit('voz', true);
    const partes = pedacos(limpar(texto));
    const fim = () => { if (minha === sessao) { estado.falando = false; J.emit('voz', false); if (opcoes.aoTerminar) opcoes.aoTerminar(); } };
    if (!partes.length) return fim();
    const c = cfg();
    try {
      if (c.motor === 'navegador') {
        const v = vozesNaturais().find((x) => x.name === c.vozNavegador) || vozesNaturais()[0];
        if (!v) throw new Error('Este navegador não tem voz natural. Use a voz do Gemini (⚙️ Config).');
        for (const p of partes) {
          if (minha !== sessao) return;
          await new Promise((ok) => { const u = new SpeechSynthesisUtterance(p); u.voice = v; u.lang = v.lang; u.onend = ok; u.onerror = ok; speechSynthesis.speak(u); });
        }
        return fim();
      }
      controle = new AbortController();
      let proximo = audioGemini(partes[0], controle.signal);
      for (let i = 0; i < partes.length; i++) {
        const blob = await proximo;
        if (minha !== sessao) return;
        if (i + 1 < partes.length) proximo = audioGemini(partes[i + 1], controle.signal); // já pede o próximo enquanto este toca
        await new Promise((ok, erro) => {
          audio = new Audio(URL.createObjectURL(blob));
          audio.onended = ok; audio.onerror = () => erro(new Error('Não consegui tocar o áudio.'));
          audio.play().catch(erro);
        });
      }
      fim();
    } catch (e) {
      if (minha !== sessao || e.name === 'AbortError') return;
      estado.falando = false; J.emit('voz', false);
      J.aviso('🔊 ' + e.message, 'erro');
      if (opcoes.aoTerminar) opcoes.aoTerminar(e);
    }
  }

  // ── ditado ─────────────────────────────────────────────────────────────────
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  function ditar(opcoes) {
    if (!SR) { J.aviso('Ditado não funciona aqui (no APK ou fora do Chrome). Use o 🎤 do teclado do celular.', 'erro', 7000); return null; }
    let ativo = true; const rec = new SR();
    rec.lang = 'pt-BR'; rec.continuous = true; rec.interimResults = true;
    rec.onresult = (ev) => {
      let final = '', parcial = '';
      for (let i = ev.resultIndex; i < ev.results.length; i++) { const t = ev.results[i][0].transcript; if (ev.results[i].isFinal) final += t; else parcial += t; }
      if (opcoes.aoTexto) opcoes.aoTexto(final, parcial);
    };
    rec.onerror = (e) => { if (e.error === 'not-allowed') { ativo = false; J.aviso('O microfone foi bloqueado. Libere nas permissões do navegador.', 'erro'); } };
    rec.onend = () => { if (ativo && !opcoes.umaVez) { try { rec.start(); } catch {} } else if (opcoes.aoFim) opcoes.aoFim(); };
    try { rec.start(); } catch (e) { J.aviso('Não consegui ligar o microfone: ' + e.message, 'erro'); return null; }
    return { parar() { ativo = false; try { rec.stop(); } catch {} } };
  }
  // botão de ditado pronto: escreve no campo (textarea/input) ou chama aoTexto
  function botaoDitado(botao, campo, aoTexto) {
    let ctl = null, base = '';
    botao.addEventListener('click', () => {
      if (ctl) { ctl.parar(); ctl = null; botao.classList.remove('gravando'); return; }
      base = campo ? campo.value : '';
      ctl = ditar({
        aoTexto(final, parcial) {
          if (final) base = (base && !/\s$/.test(base) ? base + ' ' : base) + final.trim();
          if (campo) { campo.value = base + (parcial ? ' ' + parcial : ''); campo.dispatchEvent(new Event('input')); }
          if (aoTexto && final) aoTexto(final.trim());
        },
        aoFim() { botao.classList.remove('gravando'); ctl = null; },
      });
      if (ctl) botao.classList.add('gravando');
    });
  }

  if (window.speechSynthesis) { try { speechSynthesis.getVoices(); speechSynthesis.onvoiceschanged = () => J.emit('vozes-navegador'); } catch {} }
  J.voz = { falar, parar, ditar, botaoDitado, VOZES, vozesNaturais, cfg, temDitado: !!SR, get falando() { return estado.falando; } };
})(window.J);
