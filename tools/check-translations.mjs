// Lists Turkish text that is still visible when the site is shown in Dutch, plus any JavaScript errors.
// Usage: node tools/check-translations.mjs [route ...]   (Node 22+ and Google Chrome; set CHROME=/path/to/chrome if needed)
import {spawn} from 'node:child_process';
import {createServer} from 'node:http';
import {mkdtempSync, readFileSync, existsSync, rmSync} from 'node:fs';
import {join, dirname, extname, normalize} from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const chromePath = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const routes = process.argv.slice(2).length ? process.argv.slice(2) : ['anasayfa', 'umre', 'tavaf', 'raporlar', 'dualar', 'mikat', 'ihram', 'mekke', 'medine', 'harita', 'ziyaret-raporu', 'otel', 'baglantilar', 'kaynaklar'];
const types = {'.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2'};
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// Runs inside the page: the same exclusions as i18n.js, so user data, Arabic and pronunciation texts are ignored.
// Titles of external sources (link labels) and proper names keep their original Turkish spelling on purpose.
const collect = `(() => {
  const turkish = /[çğışÇĞİŞ]/, excluded = excludedTranslation + ',a[href^="http"]', found = new Set();
  const properNames = /Hac İlmihali|Azık Kuyusu/;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let node; (node = walker.nextNode());) {
    const text = node.textContent.replace(/\\s+/g, ' ').trim();
    if (turkish.test(text.replace(new RegExp(properNames.source, 'g'), '')) && !node.parentElement.closest(excluded)) found.add(text);
  }
  for (const el of document.querySelectorAll('[aria-label],[placeholder],[title],[alt]'))
    for (const attr of ['aria-label', 'placeholder', 'title', 'alt']) {
      const value = el.getAttribute(attr);
      if (value && turkish.test(value) && !el.closest(excluded)) found.add(attr + '="' + value + '"');
    }
  return [...found];
})()`;

function serve() {
  const server = createServer((req, res) => {
    const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^([/\\])+/, '');
    const file = join(root, path || 'index.html');
    if (!file.startsWith(root) || !existsSync(file)) { res.writeHead(404).end(); return; }
    res.writeHead(200, {'content-type': types[extname(file)] || 'application/octet-stream'}).end(readFileSync(file));
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)));
}

async function launchChrome() {
  const profile = mkdtempSync(join(tmpdir(), 'sefer-check-'));
  const chrome = spawn(chromePath, ['--headless=new', '--disable-gpu', '--no-first-run', `--user-data-dir=${profile}`, '--remote-debugging-port=0', 'about:blank'], {stdio: 'ignore'});
  const portFile = join(profile, 'DevToolsActivePort');
  for (let i = 0; i < 100 && !existsSync(portFile); i++) await sleep(100);
  const port = readFileSync(portFile, 'utf8').split('\n')[0];
  return {port, close() { chrome.kill('SIGKILL'); rmSync(profile, {recursive: true, force: true}); }};
}

async function openTab(port) {
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, {method: 'PUT'})).json();
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(resolve => socket.addEventListener('open', resolve, {once: true}));
  let id = 0;
  const pending = new Map(), errors = [];
  socket.addEventListener('message', ({data}) => {
    const message = JSON.parse(data);
    if (message.id && pending.has(message.id)) { pending.get(message.id)(message); pending.delete(message.id); }
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
  });
  const send = (method, params = {}) => new Promise(resolve => { pending.set(++id, resolve); socket.send(JSON.stringify({id, method, params})); });
  await send('Runtime.enable');
  return {
    errors,
    async go(url) { await send('Page.navigate', {url}); await sleep(1500); },
    async evaluate(expression) { const {result} = await send('Runtime.evaluate', {expression, returnByValue: true, awaitPromise: true}); return result.exceptionDetails ? Promise.reject(new Error(result.exceptionDetails.exception?.description)) : result.result.value; },
  };
}

const server = await serve();
const chrome = await launchChrome();
let problems = 0;
try {
  const base = `http://127.0.0.1:${server.address().port}/index.html`;
  const tab = await openTab(chrome.port);
  await tab.go(base);
  await tab.evaluate(`localStorage.setItem('sefer.language.v1', 'nl')`);
  for (const route of routes) {
    await tab.go('about:blank');
    await tab.go(`${base}#${route}`);
    for (const text of await tab.evaluate(collect)) { console.log(`#${route}: ${text}`); problems++; }
  }
  for (const error of tab.errors) { console.log(`JavaScript error: ${error}`); problems++; }
} finally {
  chrome.close();
  server.close();
}
console.log(problems ? `${problems} problem(s) found.` : 'All visible texts are translated.');
process.exitCode = problems ? 1 : 0;
