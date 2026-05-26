#!/bin/bash
cd /home/z/my-project/siyah-beyaz-fc
while true; do
  echo "[$(date)] Starting Next.js server..."
  NODE_OPTIONS='--max-old-space-size=2048' npx next start -p 3000 2>&1
  EXIT_CODE=$?
  echo "[$(date)] Server exited with code $EXIT_CODE, restarting in 3s..."
  sleep 3
done
