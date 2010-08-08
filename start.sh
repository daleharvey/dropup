#!/bin/sh

trap "killall node" exit INT TERM

node node.dropup.js &

while inotifywait -r -e modify $(pwd); do
    echo "Burn and Die"
    killall node
    node node.dropup.js &
done