/* =========================================================================
   Assistente Jurídico — 70-ferramentas.js
   🧰 As ferramentas que já funcionam, cada uma no seu arquivo (ferramentas/),
   abertas aqui dentro. Ficam "vivas": trocar de aba não apaga o que estava
   sendo feito nelas.
   ========================================================================= */
(function (J) {
  'use strict';
  const LISTA = [
    { id: 'perito', arq: 'perito.html', nome: '🔬 Perito de Metadados', d: 'Perícia em PDF/foto: autor, datas, programas, sinais de montagem. Gera laudo.' },
    { id: 'comunicacoes', arq: 'comunicacoes.html', nome: '📬 Comunicações (DJEN)', d: 'Intimações e publicações do Diário de Justiça Eletrônico Nacional.' },
    { id: 'limpador', arq: 'limpador.html', nome: '🧹 Limpador de Processos', d: 'Tira a sujeira do PDF do processo, lê foto (OCR) e resume com IA.' },
    { id: 'organizador', arq: 'organizador.html', nome: '📑 Organizador de Documentos', d: 'Importa o PDF, mostra tudo numerado e organizado, e baixa no padrão que você criar.' },
    { id: 'juntador', arq: 'juntador.html', nome: '🧩 Juntador de Arquivos', d: 'Junta vários arquivos (Word, texto, até .zip) num texto só — bom para mandar tudo à IA de uma vez.' },
    { id: 'extrator', arq: 'extrator.html', nome: '🌐 Extrator de Sites', d: 'Cole o endereço de uma página pública e puxe o texto inteiro (ex.: uma decisão publicada).' },
  ];
  let painel, quadro;
  const vivos = new Map();

  function montar(el) {
    painel = el;
    el.innerHTML = '<h2>🧰 Ferramentas</h2><p class="peq mut">Abrem aqui dentro, em tela cheia. Toque em ← Voltar para voltar ao Assistente — a ferramenta continua aberta do jeito que você deixou.</p>' +
      '<div class="grade">' + LISTA.map((f) => '<button class="ferr" data-f="' + f.id + '"><b>' + f.nome + '</b><span>' + f.d + '</span></button>').join('') + '</div>' +
      '<div class="caixa" style="margin-top:14px">A chave do Gemini que você colocou em ⚙️ Config já vai junto para o 🧹 Limpador.</div>';
    quadro = document.createElement('div'); quadro.className = 'quadro-ferr'; quadro.hidden = true;
    quadro.innerHTML = '<div class="barra"><button class="bt mini" id="fr-voltar">← Voltar</button><b id="fr-nome"></b><button class="bt mini" id="fr-recarregar" title="Recarregar">⟳</button><button class="bt mini" id="fr-fora" title="Abrir fora">↗</button></div>';
    document.body.appendChild(quadro);
    el.addEventListener('click', (e) => { const b = e.target.closest('[data-f]'); if (b) abrir(b.dataset.f); });
    J.$('#fr-voltar').onclick = () => { quadro.hidden = true; document.body.style.overflow = ''; };
    J.$('#fr-recarregar').onclick = () => { const f = vivos.get(quadro.dataset.atual); if (f) f.src = f.src; };
    J.$('#fr-fora').onclick = () => { const it = LISTA.find((x) => x.id === quadro.dataset.atual); if (it) window.open('ferramentas/' + it.arq, '_blank'); };
  }
  function passarChave() {
    const c = J.ia.cfg(); if (!c.chave) return;
    try { const k = 'limpador:chaves'; const ch = JSON.parse(localStorage.getItem(k) || '{}'); if (!ch.gemini) { ch.gemini = c.chave; localStorage.setItem(k, JSON.stringify(ch)); } } catch {}
  }
  function abrir(id) {
    const it = LISTA.find((x) => x.id === id); if (!it) return;
    passarChave();
    quadro.dataset.atual = id; J.$('#fr-nome').textContent = it.nome;
    vivos.forEach((f, k) => (f.hidden = k !== id));
    if (!vivos.has(id)) {
      const f = document.createElement('iframe');
      f.src = 'ferramentas/' + it.arq; f.title = it.nome;
      f.setAttribute('allow', 'clipboard-read; clipboard-write; microphone; camera; fullscreen');
      quadro.appendChild(f); vivos.set(id, f);
    }
    quadro.hidden = false; document.body.style.overflow = 'hidden';
  }
  J.ferramentas = { LISTA, abrir };
  J.registrar({ aba: 'ferramentas', montar });
})(window.J);
