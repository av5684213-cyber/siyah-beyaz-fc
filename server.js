const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  server.listen(3000, '0.0.0.0', () => {
    console.log('> Custom server ready on http://0.0.0.0:3000');
  });

  setInterval(() => {
    console.log('Heartbeat:', new Date().toISOString());
  }, 30000);
});
