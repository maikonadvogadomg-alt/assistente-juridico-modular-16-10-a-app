/* =========================================================================
   Assistente Jurídico — 18-texto.js
   Transforma o texto que a IA devolve (com ##, **negrito**, listas) em
   texto formatado de verdade — para mostrar na tela e para o Editor/Word.
   ========================================================================= */
(function (J) {
  'use strict';
  const esc = J.esc;
  function inline(t) {
    return esc(t)
      .replace(/\*\*\*([^*]+)\*\*\*/g, '<b><i>$1</i></b>')
      .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/__([^_]+)__/g, '<b>$1</b>')
      .replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)/g, '$1<i>$2</i>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
  }
  function mdParaHtml(md) {
    const linhas = String(md || '').replace(/\r\n?/g, '\n').split('\n'); const out = []; let i = 0;
    const cel = (l) => l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
    while (i < linhas.length) {
      const l = linhas[i]; let m;
      if (/^\s*```/.test(l)) { const b = []; i++; while (i < linhas.length && !/^\s*```/.test(linhas[i])) b.push(linhas[i++]); i++; out.push('<pre>' + esc(b.join('\n')) + '</pre>'); continue; }
      if (/^\s*\|.*\|\s*$/.test(l) && i + 1 < linhas.length && /^\s*\|?\s*:?-{2,}/.test(linhas[i + 1])) {
        const cab = cel(l); i += 2; const corpo = [];
        while (i < linhas.length && /^\s*\|.*\|\s*$/.test(linhas[i])) corpo.push(cel(linhas[i++]));
        out.push('<table><thead><tr>' + cab.map((c) => '<th>' + inline(c) + '</th>').join('') + '</tr></thead><tbody>' + corpo.map((r) => '<tr>' + r.map((c) => '<td>' + inline(c) + '</td>').join('') + '</tr>').join('') + '</tbody></table>');
        continue;
      }
      if ((m = l.match(/^(#{1,6})\s+(.*)$/))) { const n = Math.min(3, m[1].length); out.push('<h' + n + '>' + inline(m[2].replace(/\s*#+\s*$/, '')) + '</h' + n + '>'); i++; continue; }
      if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(l)) { i++; continue; }
      if (/^\s*>/.test(l)) { const q = []; while (i < linhas.length && /^\s*>/.test(linhas[i])) q.push(linhas[i++].replace(/^\s*>\s?/, '')); out.push('<blockquote>' + q.map(inline).join('<br>') + '</blockquote>'); continue; }
      if (/^\s*([-*+•]|\d+[.)])\s+/.test(l)) {
        const ord = /^\s*\d/.test(l); const itens = [];
        while (i < linhas.length && /^\s*([-*+•]|\d+[.)])\s+/.test(linhas[i])) itens.push(linhas[i++].replace(/^\s*([-*+•]|\d+[.)])\s+/, ''));
        out.push((ord ? '<ol>' : '<ul>') + itens.map((t) => '<li>' + inline(t) + '</li>').join('') + (ord ? '</ol>' : '</ul>')); continue;
      }
      if (!l.trim()) { i++; continue; }
      const par = [];
      while (i < linhas.length && linhas[i].trim() && !/^(#{1,6}\s|\s*```|\s*\|.*\|\s*$|\s*>|\s*([-*+•]|\d+[.)])\s+)/.test(linhas[i])) par.push(linhas[i++]);
      if (!par.length) { out.push('<p>' + inline(l) + '</p>'); i++; continue; }
      // linha toda em maiúsculas e curta = título de seção da peça
      if (par.length === 1 && par[0].length < 90 && par[0] === par[0].toUpperCase() && /[A-ZÁÉÍÓÚÂÊÔÃÕÇ]{3}/.test(par[0])) { out.push('<h2>' + inline(par[0].replace(/\*\*/g, '')) + '</h2>'); continue; }
      out.push('<p>' + par.map(inline).join('<br>') + '</p>');
    }
    return out.join('\n');
  }
  // HTML → texto simples (para copiar, ler em voz e mandar à IA)
  function htmlParaTexto(html) {
    const d = document.createElement('div'); d.innerHTML = html;
    d.querySelectorAll('br').forEach((b) => b.replaceWith('\n'));
    d.querySelectorAll('p,h1,h2,h3,h4,li,blockquote,tr,div').forEach((b) => b.append('\n'));
    d.querySelectorAll('li').forEach((li) => li.prepend('• '));
    return (d.textContent || '').replace(/\n{3,}/g, '\n\n').trim();
  }
  // limpa HTML colado de fora (Word, sites): deixa só formatação útil
  function limparHtml(html) {
    const d = new DOMParser().parseFromString('<div>' + html + '</div>', 'text/html').body.firstChild;
    const OK = /^(P|BR|B|STRONG|I|EM|U|S|H1|H2|H3|UL|OL|LI|BLOCKQUOTE|TABLE|THEAD|TBODY|TR|TD|TH|SPAN|DIV|SUB|SUP)$/;
    (function andar(n) {
      for (const c of Array.from(n.childNodes)) {
        if (c.nodeType === 8) { c.remove(); continue; }
        if (c.nodeType !== 1) continue;
        if (/^(SCRIPT|STYLE|META|LINK|IFRAME|OBJECT|XML)$/.test(c.tagName) || c.tagName.includes(':')) { c.remove(); continue; }
        andar(c);
        if (!OK.test(c.tagName)) { c.replaceWith(...c.childNodes); continue; }
        const alinhar = c.style && c.style.textAlign;
        for (const a of Array.from(c.attributes)) c.removeAttribute(a.name);
        if (alinhar && /^(left|right|center|justify)$/.test(alinhar)) c.style.textAlign = alinhar;
        if (c.tagName === 'DIV') { const p = document.createElement('p'); p.append(...c.childNodes); if (alinhar) p.style.textAlign = alinhar; c.replaceWith(p); }
        if (c.tagName === 'SPAN' && !c.attributes.length) c.replaceWith(...c.childNodes);
      }
    })(d);
    return d.innerHTML;
  }
  function textoParaHtml(t) { return String(t || '').split(/\n{2,}/).map((p) => '<p>' + esc(p.trim()).replace(/\n/g, '<br>') + '</p>').join(''); }
  J.texto = { mdParaHtml, htmlParaTexto, limparHtml, textoParaHtml };
})(window.J);
