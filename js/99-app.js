/* =========================================================================
   Assistente Jurídico — 99-app.js  (O ÚLTIMO VAGÃO: vem por último)
   Monta cada módulo na sua aba, liga as abas e o indicador da chave.
   ========================================================================= */
(function (J) {
  'use strict';
  J.$('#versao').textContent = 'v' + J.versao;
  for (const m of J.modulos) {
    const el = J.$('#painel-' + m.aba);
    if (!el) continue;
    try { m.montar(el); } catch (e) { console.error(e); el.innerHTML = '<div class="caixa ruim">Esta parte deu erro ao abrir: ' + J.esc(e.message) + '</div>'; }
  }
  J.$('#abas').addEventListener('click', (e) => { const b = e.target.closest('[data-aba]'); if (b) J.abrirAba(b.dataset.aba); });
  document.addEventListener('click', (e) => { const b = e.target.closest('[data-ir]'); if (b) J.abrirAba(b.dataset.ir); });

  function statusChave() {
    const c = J.ia.cfg(); const b = J.$('#chave-status');
    b.classList.toggle('ok', !!(c.chave || c.groqChave));
    if (c.provedor === 'ollama') { b.classList.add('ok'); b.textContent = '🦙 Ollama'; return; }
    b.textContent = c.chave ? '🔑 Gemini' + (c.groqChave ? ' + Groq' : '') : c.groqChave ? '🔑 Groq' : '🔑 sem chave';
  }
  J.on('ia-config', statusChave); statusChave();

  const aba = J.pref.get('aba', 'processar');
  J.abrirAba(J.$('#painel-' + aba) ? aba : 'processar');
  if (!J.ia.temChave()) setTimeout(() => J.aviso('Bem-vindo! Para a IA funcionar, cole a sua chave grátis do Gemini em ⚙️ Config.', '', 6000), 600);

  // funciona sem internet depois da 1ª vez, e instala como app
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(() => {});
})(window.J);
