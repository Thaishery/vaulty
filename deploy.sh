#!/bin/bash

#deploiment script for shorty
rsync -avrz --del --exclude='data' --exclude='.git'  ./ raspi:~/vaulty/

#docker compose build --no-cache --progress=plain
ssh raspi "cd ~/vaulty && docker compose up -d --build"
