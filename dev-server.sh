#!/bin/bash
cd /home/z/my-project/siyah-beyaz-fc
while true; do
  node --max-old-space-size=1024 node_modules/.bin/next dev -H 0.0.0.0 -p 3000 2>&1
  echo "[$(date)] Server crashed, restarting in 5s..." >> /tmp/next-restarts.log
  sleep 5
done
