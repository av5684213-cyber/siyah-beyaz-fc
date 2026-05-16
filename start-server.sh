#!/bin/bash
cd /home/z/my-project/siyah-beyaz-fc
export PORT=3000

# Ensure static files are in place
if [ ! -d ".next/standalone/.next/static" ]; then
  cp -r .next/static .next/standalone/.next/
fi
if [ ! -d ".next/standalone/public" ]; then
  cp -r public .next/standalone/
fi

exec node .next/standalone/server.js
