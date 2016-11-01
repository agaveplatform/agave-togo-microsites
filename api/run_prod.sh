#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

export NODE_ENV=production
export PATH=/home/mock/node-v4.4.2-linux-x64/bin:$PATH

mkdir logs

~mock/node/current/bin/forever stopall

~mock/node/current/bin/forever -a -l $DIR/logs/forever.log -o $DIR/logs/stdout.log -e $DIR/logs/stderr.log start $DIR/app/scripts/app.js
