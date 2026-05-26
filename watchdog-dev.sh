#!/bin/bash
while true; do
  if ! ss -tlnp | grep -q ":3000"; then
    cd /home/z/my-project
    node node_modules/.bin/next dev -p 3000 &
    NEXT_PID=$!
    echo "[$(date)] Started Next.js PID=$NEXT_PID" >> /tmp/watchdog.log
    # Wait for it to start
    for i in $(seq 1 30); do
      if ss -tlnp | grep -q ":3000"; then
        break
      fi
      sleep 1
    done
  fi
  sleep 5
done
