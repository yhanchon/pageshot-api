#!/bin/bash
pm2 start ./scripts/run-api-server.sh --name api-server --restart-delay 100 --time --output ./logs/output.log --error ./logs/error.log
pm2 save
