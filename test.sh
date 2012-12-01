#!/bin/bash

while true; do
	echo $((RANDOM%256)).$((RANDOM%256)).$((RANDOM%256)).$((RANDOM%256)) >> test.log
	sleep 1
done
