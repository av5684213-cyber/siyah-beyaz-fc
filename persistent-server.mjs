import { fork } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function startServer() {
  console.log(`[PersistentServer] Starting Next.js standalone server...`);
  
  const child = fork(path.join(__dirname, '.next/standalone/server.js'), [], {
    env: { ...process.env, PORT: '3000' },
    stdio: 'inherit'
  });

  child.on('exit', (code, signal) => {
    console.log(`[PersistentServer] Server exited with code=${code} signal=${signal}`);
    console.log(`[PersistentServer] Restarting in 3 seconds...`);
    setTimeout(startServer, 3000);
  });

  child.on('error', (err) => {
    console.error(`[PersistentServer] Server error:`, err);
    setTimeout(startServer, 3000);
  });
}

startServer();
