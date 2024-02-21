#!/bin/bash

# IP
server="34.125.163.151"

# Node.js program path
node_program="/root/start.js"

while true; do
    # Ping the server
    if ping -c 1 $server &> /dev/null; then
        # If the ping is successful and the Node.js program is running, stop it
        if [ ! -z "$node_pid" ] && ps -p $node_pid > /dev/null; then
            kill $node_pid
            unset node_pid
        fi
    else
        # If the ping fails and the Node.js program is not running, start it
        if [ -z "$node_pid" ] || ! ps -p $node_pid > /dev/null; then
            node $node_program &
            node_pid=$!
        fi
    fi

    # Wait for 30 seconds before the next ping
    sleep 30
done