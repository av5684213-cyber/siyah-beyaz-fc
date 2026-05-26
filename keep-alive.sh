#!/bin/bash
# Auto-restart Next.js dev server
while true; do
  cd /home/z/my-project
  echo "[$(date)] Starting Next.js dev server..."
  NODE_OPTIONS="--max-old-space-size=2048" npx next dev -p 3000 2>&1
  echo "[$(date)] Server exited. Restarting in 3s..."
  sleep 3
done
