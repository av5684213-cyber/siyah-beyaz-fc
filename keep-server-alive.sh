#!/bin/bash
while true; do
  cd /home/z/my-project/siyah-beyaz-fc
  CODE=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 2>/dev/null)
  if [ "$CODE" != "200" ]; then
    echo "[$(date)] Server down (HTTP $CODE), restarting..."
    kill $(lsof -t -i:3000) 2>/dev/null
    sleep 2
    PORT=3000 node --max-old-space-size=512 node_modules/.bin/next dev -p 3000 >> /tmp/next-alive2.log 2>&1 &
    sleep 12
    echo "[$(date)] Restarted"
  fi
  sleep 15
done
