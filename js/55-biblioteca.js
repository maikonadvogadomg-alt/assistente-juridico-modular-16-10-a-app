/* =========================================================================
   Assistente Jurídico — 55-biblioteca.js
   📐 Modelos (peças prontas com [CAMPOS]) e 📚 Ementas (jurisprudência que
   VOCÊ guarda — a IA só usa as que você marcar; nada inventado).
   🪄 Preencher modelo com o caso: a IA completa os [CAMPOS] com o texto do ⚡ Processar.
   ========================================================================= */
(function (J) {
  'use strict';
  let painel, filtroEm = '';
  const $ = (s) => J.$(s, painel);
  const PRONTOS = [
    { titulo: 'Procuração ad judicia et extra', html: '<h1>Procuração</h1><p><b>OUTORGANTE:</b> [NOME COMPLETO], [nacionalidade], [estado civil], [profissão], portador(a) do RG nº [RG] e inscrito(a) no CPF sob o nº [CPF], residente e domiciliado(a) em [ENDEREÇO COMPLETO].</p><p><b>OUTORGADO:</b> [NOME DO ADVOGADO], advogado inscrito na OAB/[UF] sob o nº [Nº OAB], com escritório em [ENDEREÇO DO ESCRITÓRIO].</p><p><b>PODERES:</b> pelo presente instrumento, o(a) outorgante nomeia e constitui seu bastante procurador o outorgado, a quem confere os poderes da cláusula <i>ad judicia et extra</i>, para o foro em geral, em qualquer juízo, instância ou tribunal, podendo propor as ações competentes e defendê-lo(a) nas contrárias, seguindo umas e outras até final decisão, usando os recursos legais e acompanhando-os, conferindo-lhe ainda poderes especiais para confessar, desistir, transigir, firmar compromissos ou acordos, receber e dar quitação, requerer e representar perante o INSS e demais órgãos públicos, agindo em conjunto ou separadamente, podendo ainda substabelecer esta em outrem, com ou sem reservas de iguais poderes.</p><p style="text-align:right">[CIDADE], [DATA].</p><p style="text-align:center">_______________________________________<br>[NOME DO OUTORGANTE]</p>' },
    { titulo: 'Declaração de hipossuficiência', html: '<h1>Declaração de hipossuficiência</h1><p>Eu, [NOME COMPLETO], [nacionalidade], [estado civil], [profissão], inscrito(a) no CPF sob o nº [CPF], residente em [ENDEREÇO], DECLARO, para os fins do art. 98 e seguintes do Código de Processo Civil e da Lei nº 1.060/50, que não tenho condições de arcar com as custas processuais e honorários advocatícios sem prejuízo do meu próprio sustento e de minha família.</p><p>Por ser verdade, firmo a presente, ciente das penas da lei.</p><p style="text-align:right">[CIDADE], [DATA].</p><p style="text-align:center">_______________________________________<br>[NOME DO DECLARANTE]</p>' },
    { titulo: 'Petição inicial previdenciária (esqueleto)', html: '<p><b>EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) FEDERAL DA [VARA] DA SUBSEÇÃO JUDICIÁRIA DE [CIDADE]/[UF]</b></p><p><br></p><p>[NOME DO AUTOR], [qualificação completa], por seu advogado que esta subscreve (procuração anexa), vem respeitosamente à presença de Vossa Excelência propor a presente</p><h1>Ação de [concessão/restabelecimento] de [BENEFÍCIO]</h1><p>em face do <b>INSTITUTO NACIONAL DO SEGURO SOCIAL – INSS</b>, autarquia federal, pelos fatos e fundamentos a seguir expostos.</p><h2>I – Da justiça gratuita</h2><p>[texto]</p><h2>II – Dos fatos</h2><p>[DER, NB, motivo do indeferimento, histórico]</p><h2>III – Do direito</h2><p>[fundamentos legais]</p><h2>IV – Da tutela de urgência</h2><p>[se cabível]</p><h2>V – Dos pedidos</h2><p>Diante do exposto, requer:</p><ol><li>[pedido]</li><li>[pedido]</li></ol><p>Dá-se à causa o valor de R$ [VALOR].</p><p>Nestes termos, pede deferimento.</p><p style="text-align:right">[CIDADE], [DATA].</p><p style="text-align:center">[NOME DO ADVOGADO]<br>OAB/[UF] [Nº]</p>' },
  ];

  function montar(el) {
    painel = el;
    el.innerHTML =
      '<div class="cartao"><div class="linha"><h2 class="cresce">📐 Modelos</h2><button class="bt mini" id="bb-prontos">＋ Modelos prontos</button><button class="bt mini" id="bb-importar-modelo">📥 Importar modelo (Word)</button></div>' +
      '<p class="peq mut">Para criar: escreva no ✏️ Editor e toque ⭐ <b>Guardar como modelo</b>. Use [COLCHETES] nos campos a preencher.</p><div class="lista" id="bb-modelos"></div></div>' +
      '<div class="cartao"><div class="linha"><h2 class="cresce">📚 Ementas</h2><button class="bt mini" id="bb-em-novo">＋ Nova</button><button class="bt mini" id="bb-em-importar">📥 Importar</button><button class="bt mini" id="bb-em-exportar">⬇ Exportar</button></div>' +
      '<p class="peq mut">Guarde aqui as ementas que você confia. Marque ☑ as que a IA deve usar no ⚡ Processar ("usar as ementas marcadas").</p>' +
      '<div id="bb-em-form" hidden class="cartao" style="box-shadow:none"><input type="text" id="bb-em-titulo" placeholder="Título / tribunal / processo"><input type="text" id="bb-em-cat" placeholder="Assunto (ex.: aposentadoria especial)" style="margin-top:6px"><textarea id="bb-em-texto" placeholder="Cole a ementa" style="margin-top:6px;min-height:120px"></textarea><div class="linha" style="margin-top:6px"><button class="bt forte" id="bb-em-salvar">💾 Guardar ementa</button><button class="bt" id="bb-em-cancelar">Cancelar</button></div></div>' +
      '<input type="search" id="bb-em-busca" placeholder="🔍 Procurar ementa…" style="margin:8px 0"><div class="lista" id="bb-ementas"></div></div>';
    $('#bb-prontos').onclick = async () => { const tem = (await J.db.todos('modelos')).map((m) => m.titulo); let n = 0; for (const p of PRONTOS) if (!tem.includes(p.titulo)) { await J.db.guardar('modelos', Object.assign({ criado: Date.now(), pronto: true }, p)); n++; } J.aviso(n ? n + ' modelo(s) adicionado(s).' : 'Os modelos prontos já estão aí.', 'ok'); };
    $('#bb-importar-modelo').onclick = async () => {
      const fs = await J.importar.escolher('.docx,.html,.htm,.txt,.md', true); let n = 0;
      for (const f of fs) { try { const r = await J.importar.lerArquivo(f); await J.db.guardar('modelos', { titulo: f.name.replace(/\.\w+$/, ''), html: r.html ? J.texto.limparHtml(r.html) : J.texto.textoParaHtml(r.texto), criado: Date.now() }); n++; } catch (e) { J.aviso(f.name + ': ' + e.message, 'erro'); } }
      if (n) J.aviso('📥 ' + n + ' modelo(s) importado(s). Use [COLCHETES] nos campos a preencher.', 'ok', 5000);
    };
    $('#bb-em-novo').onclick = () => { $('#bb-em-form').hidden = false; $('#bb-em-form').dataset.id = ''; ['titulo', 'cat', 'texto'].forEach((k) => ($('#bb-em-' + k).value = '')); $('#bb-em-titulo').focus(); };
    $('#bb-em-cancelar').onclick = () => ($('#bb-em-form').hidden = true);
    $('#bb-em-salvar').onclick = async () => { const texto = $('#bb-em-texto').value.trim(); if (!texto) return J.aviso('Cole a ementa.'); await J.db.guardar('ementas', { id: $('#bb-em-form').dataset.id || undefined, titulo: $('#bb-em-titulo').value.trim() || texto.slice(0, 60), categoria: $('#bb-em-cat').value.trim(), texto, marcada: false, criado: Date.now() }); $('#bb-em-form').hidden = true; J.aviso('📚 Ementa guardada.', 'ok'); };
    $('#bb-em-busca').addEventListener('input', (e) => { filtroEm = e.target.value.trim().toLowerCase(); pintarEmentas(); });
    $('#bb-em-exportar').onclick = async () => J.baixar('ementas.json', JSON.stringify(await J.db.todos('ementas'), null, 1), 'application/json');
    $('#bb-em-importar').onclick = async () => {
      const [f] = await J.importar.escolher('.json,.txt,.md,.docx,.pdf'); if (!f) return;
      try {
        let itens = [];
        if (/\.json$/i.test(f.name)) itens = JSON.parse(await f.text());
        else { const r = await J.importar.lerArquivo(f); itens = r.texto.split(/\n\s*(?:-{3,}|={3,})\s*\n|\n{3,}/).map((t) => t.trim()).filter((t) => t.length > 40).map((t) => ({ titulo: t.split('\n')[0].slice(0, 90), texto: t })); }
        for (const it of itens) await J.db.guardar('ementas', { titulo: it.titulo || String(it.texto).slice(0, 60), categoria: it.categoria || '', texto: it.texto, marcada: false, criado: Date.now() });
        J.aviso('📥 ' + itens.length + ' ementa(s) importada(s). (No texto, separe cada ementa com uma linha de ---)', 'ok', 6000);
      } catch (e) { J.aviso(e.message, 'erro'); }
    };
    el.addEventListener('click', acao);
    el.addEventListener('change', async (e) => { const c = e.target.closest('[data-marca]'); if (!c) return; const em = await J.db.pegar('ementas', c.dataset.marca); if (em) { em.marcada = c.checked; await J.db.guardar('ementas', em); } });
    J.on('db', (d) => { if (d.loja === 'modelos') pintarModelos(); if (d.loja === 'ementas') pintarEmentas(); });
    pintarModelos(); pintarEmentas();
  }
  async function pintarModelos() {
    const ms = (await J.db.todos('modelos')).sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR'));
    $('#bb-modelos').innerHTML = ms.length ? ms.map((m) => '<div class="item"><div class="info"><b>' + J.esc(m.titulo) + '</b><small>' + J.data(m.atualizado) + '</small></div><div class="bts"><button class="bt mini forte" data-m="usar" data-id="' + m.id + '">Usar</button><button class="bt mini" data-m="preencher" data-id="' + m.id + '" title="A IA preenche os [CAMPOS] com o texto do ⚡ Processar">🪄 Preencher com o caso</button><button class="bt mini" data-m="inserir" data-id="' + m.id + '" title="Colocar onde está o cursor no Editor">⤵ No cursor</button><button class="bt mini perigo" data-m="apagar" data-id="' + m.id + '">🗑</button></div></div>').join('') : '<p class="mut">Nenhum modelo. Toque em ＋ Modelos prontos para começar.</p>';
  }
  async function pintarEmentas() {
    const es = (await J.db.todos('ementas')).filter((e) => !filtroEm || (e.titulo + ' ' + e.categoria + ' ' + e.texto).toLowerCase().includes(filtroEm)).sort((a, b) => b.atualizado - a.atualizado);
    $('#bb-ementas').innerHTML = es.length ? es.map((e) => '<div class="item"><input type="checkbox" data-marca="' + e.id + '"' + (e.marcada ? ' checked' : '') + ' title="Usar no ⚡ Processar" aria-label="Marcar"><div class="info"><b>' + J.esc(e.titulo) + '</b><small>' + J.esc((e.categoria ? e.categoria + ' · ' : '') + e.texto.slice(0, 140)) + '…</small></div><div class="bts"><button class="bt mini" data-e="inserir" data-id="' + e.id + '" title="Colocar no Editor como citação">⤵ Editor</button><button class="bt mini" data-e="editar" data-id="' + e.id + '">✏️</button><button class="bt mini perigo" data-e="apagar" data-id="' + e.id + '">🗑</button></div></div>').join('') : '<p class="mut">' + (filtroEm ? 'Nada encontrado.' : 'Nenhuma ementa guardada.') + '</p>';
  }
  async function acao(ev) {
    const b = ev.target.closest('[data-m],[data-e]'); if (!b) return;
    if (b.dataset.m) {
      const m = await J.db.pegar('modelos', b.dataset.id); if (!m) return;
      if (b.dataset.m === 'usar') { J.editor.abrir({ titulo: m.titulo, html: m.html }); J.abrirAba('editor'); }
      if (b.dataset.m === 'inserir') { J.abrirAba('editor'); J.editor.inserirHtml(m.html); }
      if (b.dataset.m === 'apagar' && confirm('Apagar o modelo "' + m.titulo + '"?')) await J.db.apagar('modelos', m.id);
      if (b.dataset.m === 'preencher') {
        const caso = ((J.$('#pr-texto') || {}).value || '').trim();
        if (!caso) return J.aviso('Primeiro coloque o texto do caso no ⚡ Processar (parte 1).');
        if (!J.ia.temChave()) return J.aviso('Falta a chave da IA (⚙️ Config).', 'erro');
        b.disabled = true; b.textContent = '⏳ Preenchendo…';
        try {
          const md = await J.ia.gerar({ mensagens: [{ role: 'user', content: 'Preencha o MODELO abaixo com os dados do CASO. Substitua cada [CAMPO] pelo dado certo; se o dado não estiver no caso, deixe o [CAMPO] como está. Mantenha a estrutura e os títulos do modelo. Devolva só a peça pronta.\n\n=== MODELO ===\n' + J.texto.htmlParaTexto(m.html) + '\n\n=== CASO ===\n' + caso }] });
          J.editor.abrir({ titulo: m.titulo + ' — preenchido', html: J.texto.mdParaHtml(md) }); J.abrirAba('editor'); J.aviso('🪄 Pronto. Confira os [CAMPOS] que sobraram.', 'ok', 5000);
        } catch (e) { J.aviso(e.message, 'erro'); } finally { b.disabled = false; b.textContent = '🪄 Preencher com o caso'; }
      }
      return;
    }
    const e = await J.db.pegar('ementas', b.dataset.id); if (!e) return;
    if (b.dataset.e === 'inserir') { J.abrirAba('editor'); J.editor.inserirHtml('<blockquote>' + J.esc(e.texto).replace(/\n/g, '<br>') + '</blockquote><p><br></p>'); }
    if (b.dataset.e === 'editar') { $('#bb-em-form').hidden = false; $('#bb-em-form').dataset.id = e.id; $('#bb-em-titulo').value = e.titulo; $('#bb-em-cat').value = e.categoria || ''; $('#bb-em-texto').value = e.texto; $('#bb-em-form').scrollIntoView({ behavior: 'smooth' }); }
    if (b.dataset.e === 'apagar' && confirm('Apagar esta ementa?')) await J.db.apagar('ementas', e.id);
  }
  J.biblioteca = { async ementasMarcadas() { return (await J.db.todos('ementas')).filter((e) => e.marcada); } };
  J.registrar({ aba: 'biblioteca', montar });
})(window.J);
