import { spawn } from 'child_process';
import { createServer } from 'http';

// Lightweight health check server that always responds
// This ensures the sandbox is always "active"
const healthServer = createServer((req, res) => {
  // Proxy to Next.js if available, otherwise return a loading page
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: req.url,
    method: req.method,
    headers: req.headers,
  };
  
  const proxy = require('http').request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });
  
  proxy.on('error', () => {
    res.writeHead(503, { 'Content-Type': 'text/html' });
    res.end('<html><body><h2>Server is starting...</h2></body></html>');
  });
  
  proxy.end();
});

// Actually, let's keep it simpler - just manage the Next.js process
console.log('[Persistent Server] Starting...');

function startNext() {
  console.log('[Persistent Server] Spawning Next.js dev server...');
  const child = spawn('node', ['node_modules/.bin/next', 'dev', '-p', '3000'], {
    cwd: '/home/z/my-project',
    stdio: 'inherit',
    env: { ...process.env }
  });
  
  child.on('exit', (code, signal) => {
    console.log(`[Persistent Server] Next.js exited with code=${code} signal=${signal}`);
    console.log('[Persistent Server] Restarting in 3 seconds...');
    setTimeout(startNext, 3000);
  });
  
  child.on('error', (err) => {
    console.error('[Persistent Server] Error:', err);
    setTimeout(startNext, 3000);
  });
}

startNext();
