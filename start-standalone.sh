#!/bin/bash
cd /home/z/my-project/siyah-beyaz-fc
export HOSTNAME=localhost
export PORT=3000
while true; do
  echo "[$(date)] Starting standalone server..."
  node .next/standalone/siyah-beyaz-fc/server.js 2>&1
  echo "[$(date)] Server exited with code $?, restarting in 2s..."
  sleep 2
done
