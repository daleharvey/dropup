#!/bin/bash

NODESCRIPT="node.dropup.js"
EXCLUDE="upload"

startNode() {
    node $NODESCRIPT &
    echo "New Node $!"
    PID=$! 
}

trap "kill -9 $PID" exit INT TERM

startNode

while inotifywait -r -q -e modify --exclude $EXCLUDE $(pwd); do
    echo "killing $PID" 
    kill -9 $PID
    startNode
done
