#!/bin/bash
pm2 start ./scripts/run-api-server.sh --name api-server --watch --restart-delay 100
pm2 save
