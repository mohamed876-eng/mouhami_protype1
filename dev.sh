#!/bin/bash
# Tue les anciens serveurs Next.js puis démarre sur le port 3000
# Usage: bash dev.sh  (ou ./dev.sh)

pkill -f 'next-server' 2>/dev/null
sleep 1

exec npx next dev -p 3000
