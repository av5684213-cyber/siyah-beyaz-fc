#!/bin/bash
# Keep Next.js dev server alive
while true; do
  cd /home/z/my-project/siyah-beyaz-fc
  if ! curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 2>/dev/null | grep -q "200\|301"; then
    echo "[$(date)] Server down, restarting..."
    kill $(lsof -t -i:3000) 2>/dev/null
    sleep 2
    npx next dev -p 3000 > /tmp/next-alive.log 2>&1 &
    sleep 10
    echo "[$(date)] Server restarted"
  fi
  sleep 30
done
