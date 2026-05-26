import { spawn } from 'child_process';
import http from 'http';
import { URL } from 'url';

const NEXT_PORT = 3001;
const GATEWAY_PORT = 3000;

let nextProcess = null;
let nextReady = false;

function startNext() {
  console.log('[Gateway] Starting Next.js on port', NEXT_PORT);
  nextProcess = spawn('node', ['node_modules/.bin/next', 'dev', '-p', String(NEXT_PORT)], {
    cwd: '/home/z/my-project',
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, PORT: String(NEXT_PORT) }
  });
  
  nextProcess.stdout.on('data', (data) => {
    const msg = data.toString();
    console.log('[Next.js]', msg.trim());
    if (msg.includes('Ready')) {
      nextReady = true;
    }
  });
  
  nextProcess.stderr.on('data', (data) => {
    console.error('[Next.js]', data.toString().trim());
  });
  
  nextProcess.on('exit', (code, signal) => {
    console.log(`[Gateway] Next.js exited code=${code} signal=${signal}`);
    nextReady = false;
    nextProcess = null;
    setTimeout(startNext, 3000);
  });
}

const server = http.createServer((req, res) => {
  if (!nextReady || !nextProcess) {
    res.writeHead(503, { 'Content-Type': 'text/html' });
    res.end('<html><body style="background:#000;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh"><div><h2>Siyah Beyaz FM</h2><p>Server is starting...</p></div></body></html>');
    return;
  }
  
  const options = {
    hostname: 'localhost',
    port: NEXT_PORT,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: `localhost:${NEXT_PORT}` },
  };
  
  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });
  
  proxyReq.on('error', (err) => {
    console.error('[Gateway] Proxy error:', err.message);
    res.writeHead(502, { 'Content-Type': 'text/html' });
    res.end('<html><body><h2>Proxy Error</h2></body></html>');
  });
  
  req.pipe(proxyReq);
});

server.listen(GATEWAY_PORT, '0.0.0.0', () => {
  console.log(`[Gateway] Listening on port ${GATEWAY_PORT}`);
  startNext();
});
