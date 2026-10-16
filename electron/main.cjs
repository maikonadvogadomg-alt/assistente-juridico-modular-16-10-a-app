// Assistente Jurídico como programa do Windows: abre o index.html numa janela própria
// e liga o Ollama (IA grátis do computador) se ele estiver instalado.
const { app, BrowserWindow, shell, session, dialog } = require('electron');
const { spawn } = require('child_process');
const path = require('path'), fs = require('fs'), http = require('http');
if (!app.requestSingleInstanceLock()) { app.quit(); return; }
const RAIZ = path.join(__dirname, '..');
const PORTA = Number(require('../package.json').portaDoPrograma || 7700); // fixa: os dados ficam guardados "por endereço"
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webp': 'image/webp', '.webmanifest': 'application/manifest+json', '.wasm': 'application/wasm', '.mp3': 'audio/mpeg', '.mp4': 'video/mp4', '.woff2': 'font/woff2', '.pdf': 'application/pdf', '.txt': 'text/plain; charset=utf-8', '.md': 'text/markdown; charset=utf-8' };
function servir() {
  return new Promise((ok) => {
    const s = http.createServer((req, res) => {
      let u = decodeURIComponent(new URL(req.url, 'http://x').pathname); if (u.endsWith('/')) u += 'index.html';
      const f = path.join(RAIZ, path.normalize(u).replace(/^([\\/])+/, ''));
      if (!f.startsWith(RAIZ) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('não existe'); }
      res.writeHead(200, { 'Content-Type': TIPOS[path.extname(f).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' }); fs.createReadStream(f).pipe(res);
    });
    s.once('error', () => { dialog.showErrorBox('Programa', 'A porta ' + PORTA + ' está ocupada. Feche o outro programa e abra de novo.'); app.exit(1); });
    s.listen(PORTA, '127.0.0.1', () => ok('http://127.0.0.1:' + PORTA));
  });
}
// 🦙 se o Ollama estiver instalado e desligado, liga escondido (sem janela preta)
function ollamaLigado() { return new Promise((ok) => { const q = http.get('http://127.0.0.1:11434/api/version', (r) => { r.resume(); ok(r.statusCode === 200); }); q.on('error', () => ok(false)); q.setTimeout(2500, () => { q.destroy(); ok(false); }); }); }
async function ligarOllama() {
  if (await ollamaLigado()) return;
  const cmds = [['ollama', ['serve']]];
  if (process.platform === 'win32' && process.env.LOCALAPPDATA) cmds.push([path.join(process.env.LOCALAPPDATA, 'Programs', 'Ollama', 'ollama.exe'), ['serve']]);
  for (const [c, a] of cmds) { try { const p = spawn(c, a, { detached: true, stdio: 'ignore', windowsHide: true }); p.on('error', () => {}); p.unref(); } catch { continue; } await new Promise((r) => setTimeout(r, 3000)); if (await ollamaLigado()) return; }
}
let janela = null;
app.whenReady().then(async () => {
  const base = await servir();
  if (process.env.TESTE_SAIR === '1') { http.get(base + '/', (r) => app.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => app.exit(1)); return; }
  session.defaultSession.setPermissionRequestHandler((_w, p, cb) => cb(['media', 'clipboard-read', 'clipboard-sanitized-write', 'fullscreen', 'notifications'].includes(p)));
  janela = new BrowserWindow({ width: 1280, height: 860, autoHideMenuBar: true });
  janela.webContents.setWindowOpenHandler(({ url }) => { if (url.startsWith(base) || url.startsWith('blob:') || url === 'about:blank') return { action: 'allow' }; shell.openExternal(url); return { action: 'deny' }; });
  janela.loadURL(base + '/');
  ligarOllama().catch(() => {});
});
app.on('second-instance', () => { if (janela) { if (janela.isMinimized()) janela.restore(); janela.focus(); } });
app.on('window-all-closed', () => app.quit());
