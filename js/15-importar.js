/* =========================================================================
   Assistente Jurídico — 15-importar.js
   Lê arquivos: PDF, Word (.docx), TXT, MD, RTF, HTML.
   PDF e Word usam bibliotecas que vêm da internet só na 1ª vez.
   Foto/escaneado (precisa de OCR): use a ferramenta 🧹 Limpador.
   ========================================================================= */
(function (J) {
  'use strict';
  const PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
  const PDFW = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  const MAMMOTH = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js';

  async function pdf(buf, aoProgresso) {
    await J.carregarScript(PDFJS);
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFW;
    const doc = await window.pdfjsLib.getDocument({ data: buf }).promise;
    const paginas = [];
    for (let i = 1; i <= doc.numPages; i++) {
      const p = await doc.getPage(i); const c = await p.getTextContent();
      let linha = '', ultY = null; const linhas = [];
      for (const it of c.items) { const y = it.transform ? Math.round(it.transform[5]) : 0; if (ultY !== null && Math.abs(y - ultY) > 2) { linhas.push(linha); linha = ''; } linha += it.str; ultY = y; }
      if (linha) linhas.push(linha);
      paginas.push(linhas.join('\n'));
      if (aoProgresso) aoProgresso(i, doc.numPages);
    }
    const texto = paginas.join('\n\n');
    if (texto.replace(/\s/g, '').length < 30 * doc.numPages) J.aviso('Este PDF parece ser foto/escaneado (quase sem texto). Use 🧰 Ferramentas → Limpador, que lê foto (OCR).', '', 8000);
    return { texto };
  }
  async function docx(buf) {
    await J.carregarScript(MAMMOTH);
    const html = (await window.mammoth.convertToHtml({ arrayBuffer: buf })).value;
    const texto = (await window.mammoth.extractRawText({ arrayBuffer: buf })).value;
    return { texto, html };
  }
  function rtf(t) {
    return t.replace(/\\par[d]?/g, '\n').replace(/\{\\\*[^{}]*\}/g, '').replace(/\\'([0-9a-f]{2})/gi, (m, h) => String.fromCharCode(parseInt(h, 16))).replace(/\\[a-z]+-?\d* ?/gi, '').replace(/[{}]/g, '').trim();
  }
  function htmlParaTexto(h) { const d = new DOMParser().parseFromString(h, 'text/html'); return (d.body.innerText || d.body.textContent || '').trim(); }

  async function lerArquivo(f, aoProgresso) {
    const n = f.name.toLowerCase();
    if (/\.pdf$/.test(n)) return Object.assign({ nome: f.name }, await pdf(await f.arrayBuffer(), aoProgresso));
    if (/\.docx$/.test(n)) return Object.assign({ nome: f.name }, await docx(await f.arrayBuffer()));
    if (/\.doc$/.test(n)) throw new Error('Arquivo .doc antigo: abra no Word e salve como .docx (ou PDF).');
    if (/\.rtf$/.test(n)) return { nome: f.name, texto: rtf(await f.text()) };
    if (/\.html?$/.test(n)) { const h = await f.text(); return { nome: f.name, texto: htmlParaTexto(h), html: h }; }
    if (/\.(png|jpe?g|webp|gif|bmp|tiff?)$/.test(n)) throw new Error('Foto: use 🧰 Ferramentas → Limpador (ele lê foto com OCR).');
    return { nome: f.name, texto: await f.text() };
  }
  // abre a janela de escolher arquivo e devolve o que leu
  function escolher(aceita, multiplo) {
    return new Promise((ok) => {
      const i = document.createElement('input'); i.type = 'file'; i.accept = aceita || '.pdf,.docx,.txt,.md,.rtf,.html,.htm'; i.multiple = !!multiplo;
      i.onchange = () => ok(Array.from(i.files || [])); i.click();
    });
  }
  J.importar = { lerArquivo, escolher, htmlParaTexto };
})(window.J);
