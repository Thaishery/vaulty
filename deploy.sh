#!/bin/bash

#deploiment script for shorty
rsync -av --exclude='data' * raspi:~/shorty/

#docker compose build --no-cache --progress=plain
ssh raspi "cd ~/shorty && docker compose up -d --build"
