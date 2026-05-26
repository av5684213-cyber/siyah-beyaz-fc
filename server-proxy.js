const http = require('http');
const { spawn } = require('child_process');

const PROXY_PORT = 3000;
const BACKEND_PORT = 3001;

// Start Next.js standalone server in background
const nextProc = spawn('node', ['.next/standalone/server.js'], {
  env: { ...process.env, PORT: String(BACKEND_PORT), HOSTNAME: '0.0.0.0' },
  stdio: ['ignore', 'pipe', 'pipe']
});

nextProc.stdout.on('data', (d) => process.stdout.write(`[next] ${d}`));
nextProc.stderr.on('data', (d) => process.stderr.write(`[next-err] ${d}`));
nextProc.on('exit', (code) => console.log(`Next.js exited with code ${code}`));

// Wait for backend to be ready
function waitForBackend(retries = 30) {
  return new Promise((resolve, reject) => {
    function tryConnect() {
      const req = http.get(`http://127.0.0.1:${BACKEND_PORT}/`, (res) => {
        res.resume(); // drain the response
        resolve();
      });
      req.on('error', () => {
        if (retries-- > 0) setTimeout(tryConnect, 500);
        else reject(new Error('Backend never became ready'));
      });
      req.setTimeout(3000, () => { req.destroy(); if (retries-- > 0) setTimeout(tryConnect, 500); else reject(); });
    }
    setTimeout(tryConnect, 1000);
  });
}

waitForBackend().then(() => {
  console.log(`Backend ready on port ${BACKEND_PORT}, starting proxy on port ${PROXY_PORT}`);
  
  const proxy = http.createServer((clientReq, clientRes) => {
    const opts = {
      hostname: '127.0.0.1',
      port: BACKEND_PORT,
      path: clientReq.url,
      method: clientReq.method,
      headers: clientReq.headers,
    };

    const backendReq = http.request(opts, (backendRes) => {
      // Remove X-Frame-Options
      delete backendRes.headers['x-frame-options'];
      
      // Set permissive CSP for iframe embedding
      backendRes.headers['content-security-policy'] = 'frame-ancestors *';
      
      clientRes.writeHead(backendRes.statusCode, backendRes.headers);
      backendRes.pipe(clientRes);
    });

    backendReq.on('error', (err) => {
      console.error('Backend error:', err.message);
      clientRes.writeHead(502, { 'Content-Type': 'text/plain' });
      clientRes.end('Bad Gateway');
    });

    clientReq.pipe(backendReq);
  });

  proxy.listen(PROXY_PORT, '0.0.0.0', () => {
    console.log(`Proxy server listening on port ${PROXY_PORT}`);
  });
}).catch(err => {
  console.error('Failed to start:', err);
  process.exit(1);
});
