#!/bin/bash

#deploiment script for shorty
rsync -avrz --del --exclude='data' --exclude='.git'  ./ raspi:~/shorty/

#docker compose build --no-cache --progress=plain
ssh raspi "cd ~/shorty && docker compose up -d --build"
