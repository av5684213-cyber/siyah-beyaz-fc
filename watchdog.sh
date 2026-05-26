#!/bin/bash
cd /home/z/my-project/siyah-beyaz-fc
while true; do
  if ! pgrep -f "node.*server.js" > /dev/null 2>&1; then
    echo "$(date): Restarting server..." >> /tmp/watchdog.log
    PORT=3000 node .next/standalone/server.js >> /tmp/next-standalone.log 2>&1 &
    sleep 3
  fi
  sleep 5
done
