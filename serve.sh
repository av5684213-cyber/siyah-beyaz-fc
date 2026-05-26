#!/bin/bash
cd /home/z/my-project/siyah-beyaz-fc
while true; do
  node --max-old-space-size=256 node_modules/.bin/next dev -H 0.0.0.0 -p 3000 2>&1
  echo "[$(date)] Restarting in 3s..." >> /tmp/restarts.log
  sleep 3
done
