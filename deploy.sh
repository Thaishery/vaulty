#!/bin/bash

#deploiment script for shorten
#scp the diff of the folder shorten to raspi:/home/ras/shorten/
scp -r * raspi:~/shorturl/

#docker compose build --no-cache --progress=plain
ssh raspi "cd ~/shorturl && docker compose up -d --build"
