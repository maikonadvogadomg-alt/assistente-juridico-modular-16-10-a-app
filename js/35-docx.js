/* =========================================================================
   Assistente Jurídico — 35-docx.js
   ⬇ Word de VERDADE (.docx), feito aqui no aparelho, sem internet.
   Folha A4, margens ABNT (3/3/2/2 cm), Times 12, espaçamento 1,5,
   recuo de 2,5 cm na 1ª linha, citação recuada 4 cm em 10 pt,
   negrito/itálico/sublinhado, títulos, listas, tabelas e alinhamento.
   (O app antigo dependia de uma biblioteca da internet — por isso falhava.)
   ========================================================================= */
(function (J) {
  'use strict';
  const X = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
  const ALINHA = { left: 'left', start: 'left', center: 'center', right: 'right', end: 'right', justify: 'both' };

  function tamanhoMeioPonto(v) {
    if (!v) return null; v = String(v).trim();
    let m = v.match(/^([\d.]+)pt$/); if (m) return Math.round(parseFloat(m[1]) * 2);
    m = v.match(/^([\d.]+)px$/); if (m) return Math.round(parseFloat(m[1]) * 0.75 * 2);
    const tabela = { 1: 16, 2: 20, 3: 24, 4: 28, 5: 36, 6: 48, 7: 72 }; if (tabela[v]) return tabela[v];
    return null;
  }
  function run(texto, f) {
    let rpr = '';
    if (f.font) rpr += '<w:rFonts w:ascii="' + X(f.font) + '" w:hAnsi="' + X(f.font) + '" w:cs="' + X(f.font) + '"/>';
    if (f.b) rpr += '<w:b/><w:bCs/>';
    if (f.i) rpr += '<w:i/><w:iCs/>';
    if (f.s) rpr += '<w:strike/>';
    if (f.caps) rpr += '<w:caps/>';
    if (f.sz) rpr += '<w:sz w:val="' + f.sz + '"/><w:szCs w:val="' + f.sz + '"/>';
    if (f.u) rpr += '<w:u w:val="single"/>';
    if (f.sup) rpr += '<w:vertAlign w:val="superscript"/>'; else if (f.sub) rpr += '<w:vertAlign w:val="subscript"/>';
    return '<w:r>' + (rpr ? '<w:rPr>' + rpr + '</w:rPr>' : '') + '<w:t xml:space="preserve">' + X(texto) + '</w:t></w:r>';
  }
  // junta os "pedaços" de texto de um parágrafo, levando a formatação herdada
  function runs(no, f, out) {
    for (const c of no.childNodes) {
      if (c.nodeType === 3) { const t = c.nodeValue.replace(/\s+/g, ' '); if (t) out.push(run(t, f)); continue; }
      if (c.nodeType !== 1) continue;
      const tag = c.tagName; const n = Object.assign({}, f);
      if (tag === 'BR') { out.push('<w:r><w:br/></w:r>'); continue; }
      if (/^(B|STRONG)$/.test(tag)) n.b = true;
      if (/^(I|EM|CITE)$/.test(tag)) n.i = true;
      if (tag === 'U' || tag === 'INS') n.u = true;
      if (/^(S|STRIKE|DEL)$/.test(tag)) n.s = true;
      if (tag === 'SUP') n.sup = true; if (tag === 'SUB') n.sub = true;
      if (tag === 'FONT') { if (c.getAttribute('face')) n.font = c.getAttribute('face').split(',')[0].replace(/["']/g, '').trim(); const sz = tamanhoMeioPonto(c.getAttribute('size')); if (sz) n.sz = sz; }
      const st = c.style || {};
      if (st.fontWeight && (st.fontWeight === 'bold' || +st.fontWeight >= 600)) n.b = true;
      if (st.fontStyle === 'italic') n.i = true;
      if (/underline/.test(st.textDecoration || '')) n.u = true;
      if (/line-through/.test(st.textDecoration || '')) n.s = true;
      if (st.fontFamily) n.font = st.fontFamily.split(',')[0].replace(/["']/g, '').trim();
      const sz = tamanhoMeioPonto(st.fontSize); if (sz) n.sz = sz;
      runs(c, n, out);
    }
    return out;
  }
  function paragrafo(conteudo, p) {
    let ppr = '';
    if (p.estilo) ppr += '<w:pStyle w:val="' + p.estilo + '"/>';
    if (p.keep) ppr += '<w:keepNext/>';
    const sp = p.simples ? '<w:spacing w:before="' + (p.antes || 0) + '" w:after="' + (p.depois != null ? p.depois : 120) + '" w:line="240" w:lineRule="auto"/>' : '<w:spacing w:before="' + (p.antes || 0) + '" w:after="' + (p.depois != null ? p.depois : 120) + '" w:line="360" w:lineRule="auto"/>';
    ppr += sp;
    if (p.esq || p.primeira || p.pendurado) ppr += '<w:ind' + (p.esq ? ' w:left="' + p.esq + '"' : '') + (p.primeira ? ' w:firstLine="' + p.primeira + '"' : '') + (p.pendurado ? ' w:hanging="' + p.pendurado + '"' : '') + '/>';
    if (p.alinha) ppr += '<w:jc w:val="' + p.alinha + '"/>';
    return '<w:p><w:pPr>' + ppr + '</w:pPr>' + conteudo + '</w:p>';
  }
  function alinhamento(el, padrao) { const a = el.style && el.style.textAlign; return ALINHA[a] || (el.getAttribute && ALINHA[el.getAttribute('align')]) || padrao; }

  function corpo(html, op) {
    const raiz = new DOMParser().parseFromString('<div>' + html + '</div>', 'text/html').body.firstChild;
    const out = [];
    const recuo = op.recuo !== false ? 1418 : 0;
    function bloco(el, extra) {
      extra = extra || {};
      const tag = el.tagName;
      if (/^(UL|OL)$/.test(tag)) {
        let n = 0;
        for (const li of el.children) { if (li.tagName !== 'LI') continue; n++; const marca = tag === 'OL' ? n + '. ' : '• '; out.push(paragrafo(run(marca, {}) + runs(li, {}, []).join(''), { esq: 720 + (extra.nivel || 0) * 360, pendurado: 360, alinha: 'both', depois: 60 })); li.querySelectorAll(':scope > ul, :scope > ol').forEach((sub) => bloco(sub, { nivel: (extra.nivel || 0) + 1 })); }
        return;
      }
      if (tag === 'TABLE') {
        const linhas = Array.from(el.querySelectorAll('tr'));
        const ncol = Math.max(1, ...linhas.map((tr) => tr.children.length));
        const larg = Math.floor(9071 / ncol);
        let t = '<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblBorders>' + ['top', 'left', 'bottom', 'right', 'insideH', 'insideV'].map((b) => '<w:' + b + ' w:val="single" w:sz="4" w:space="0" w:color="808080"/>').join('') + '</w:tblBorders></w:tblPr><w:tblGrid>' + ('<w:gridCol w:w="' + larg + '"/>').repeat(ncol) + '</w:tblGrid>';
        for (const tr of linhas) {
          t += '<w:tr>';
          for (const td of tr.children) t += '<w:tc><w:tcPr><w:tcW w:w="' + larg + '" w:type="dxa"/></w:tcPr>' + paragrafo(runs(td, { b: td.tagName === 'TH', sz: 22 }, []).join(''), { simples: true, depois: 0 }) + '</w:tc>';
          for (let k = tr.children.length; k < ncol; k++) t += '<w:tc><w:p/></w:tc>';
          t += '</w:tr>';
        }
        out.push(t + '</w:tbl>'); out.push(paragrafo('', { depois: 0 }));
        return;
      }
      if (tag === 'PRE') { el.textContent.split('\n').forEach((l) => out.push(paragrafo(run(l, { font: 'Courier New', sz: 20 }), { simples: true, depois: 0 }))); return; }
      // um bloco que só tem outros blocos dentro (ex.: <div> com <p>): desce
      if (/^(DIV|SECTION|ARTICLE|BODY)$/.test(tag) && Array.from(el.children).some((c) => /^(P|H[1-6]|UL|OL|TABLE|BLOCKQUOTE|DIV|PRE)$/.test(c.tagName))) { filhos(el); return; }
      const r = runs(el, {}, []);
      if (tag === 'H1') return out.push(paragrafo(runs(el, { b: true, sz: 28, caps: true }, []).join(''), { alinha: alinhamento(el, 'center'), antes: 240, depois: 240, keep: true }));
      if (tag === 'H2') return out.push(paragrafo(runs(el, { b: true, caps: true }, []).join(''), { alinha: alinhamento(el, 'left'), antes: 240, depois: 120, keep: true }));
      if (/^H[3-6]$/.test(tag)) return out.push(paragrafo(runs(el, { b: true }, []).join(''), { alinha: alinhamento(el, 'left'), antes: 120, depois: 60, keep: true }));
      if (tag === 'BLOCKQUOTE') return out.push(paragrafo(runs(el, { sz: 20 }, []).join(''), { esq: 2268, alinha: 'both', simples: true, antes: 120, depois: 240 }));
      const vazio = !el.textContent.trim();
      const ind = el.style && el.style.textIndent;
      out.push(paragrafo(vazio ? '' : r.join(''), { alinha: alinhamento(el, 'both'), primeira: ind === '0px' || ind === '0' ? 0 : recuo }));
    }
    function filhos(el) {
      let solto = [];
      const despeja = () => { if (!solto.length) return; const d = document.createElement('p'); solto.forEach((n) => d.appendChild(n.cloneNode(true))); if (d.textContent.trim()) bloco(d); solto = []; };
      for (const c of Array.from(el.childNodes)) {
        if (c.nodeType === 1 && /^(P|H[1-6]|UL|OL|TABLE|BLOCKQUOTE|DIV|PRE|SECTION|ARTICLE)$/.test(c.tagName)) { despeja(); bloco(c); }
        else solto.push(c);
      }
      despeja();
    }
    filhos(raiz);
    return out.join('');
  }

  const ARQUIVOS = {
    '[Content_Types].xml': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>',
    '_rels/.rels': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>',
    'word/_rels/document.xml.rels': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
    'word/styles.xml': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="24"/><w:szCs w:val="24"/><w:lang w:val="pt-BR"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="360" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style></w:styles>',
  };

  async function gerar(titulo, html, op) {
    op = op || {};
    if (!window.JSZip) throw new Error('Falta a peça lib/jszip.min.js.');
    const z = new window.JSZip();
    for (const [n, c] of Object.entries(ARQUIVOS)) z.file(n, c);
    const agora = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
    z.file('docProps/core.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>' + X(titulo || 'Documento') + '</dc:title><dc:creator>' + X((J.pref.get('perfil', {}).nome) || 'Assistente Jurídico') + '</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">' + agora + '</dcterms:created></cp:coreProperties>');
    const doc = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body>' +
      corpo(html, op) +
      '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1701" w:right="1134" w:bottom="1134" w:left="1701" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr></w:body></w:document>';
    z.file('word/document.xml', doc);
    return z.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', compression: 'DEFLATE' });
  }
  async function baixar(titulo, html, op) {
    try { const b = await gerar(titulo, html, op); J.baixar((titulo || 'documento').replace(/[\\/:*?"<>|]+/g, '-').slice(0, 80) + '.docx', b); J.aviso('⬇ Word gerado.', 'ok'); }
    catch (e) { J.aviso('Não consegui gerar o Word: ' + e.message, 'erro'); }
  }
  J.docx = { gerar, baixar };
})(window.J);
