/**
 * Custom server wrapper that modifies response headers for preview compatibility.
 * Removes X-Frame-Options and sets permissive CSP so the preview iframe
 * (chatglm.site / space-z.ai) can embed pages and load assets.
 */
const http = require('http');
const { createServer } = http;

const PORT = 3000;
const APP_PORT = 3001;

// Start the Next.js standalone server on a different port
const nextServer = require('child_process').fork(
  require('path').join(__dirname, '.next/standalone/server.js'),
  [],
  { env: { ...process.env, PORT: APP_PORT, HOSTNAME: '0.0.0.0' }, silent: true }
);

nextServer.on('error', (err) => {
  console.error('Next.js server error:', err);
});

// Give Next.js time to start
setTimeout(() => {
  const proxy = createServer((req, res) => {
    const options = {
      hostname: '127.0.0.1',
      port: APP_PORT,
      path: req.url,
      method: req.method,
      headers: req.headers,
    };

    const proxyReq = http.request(options, (proxyRes) => {
      // 1. Remove X-Frame-Options header completely
      delete proxyRes.headers['x-frame-options'];

      // 2. Set a permissive CSP that allows the preview iframe to work
      // Only set frame-ancestors - don't restrict other directives
      proxyRes.headers['content-security-policy'] = "frame-ancestors *";

      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (err) => {
      console.error('Proxy request error:', err.message);
      res.writeHead(502);
      res.end('Bad Gateway');
    });

    req.pipe(proxyReq, { end: true });
  });

  proxy.listen(PORT, '0.0.0.0', () => {
    console.log(`Custom server running on port ${PORT}, proxying to Next.js on port ${APP_PORT}`);
  });
}, 3000);
