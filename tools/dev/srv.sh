#!/bin/bash
curl -s -o /dev/null --max-time 2 http://localhost:8002/gangho/ && exit 0
cd /home/claude && setsid nohup python3 -m http.server 8002 >/tmp/srv.log 2>&1 < /dev/null & disown; sleep 1.5
