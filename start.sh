#!/bin/sh

trap "killall node" exit INT TERM

node dropup.server.js &

while inotifywait -r -e modify $(pwd); do
    echo "Burn and Die"
    killall node
    node dropup.server.js &
done