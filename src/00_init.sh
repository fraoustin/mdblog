#!/bin/bash

if [ ! -z "$DAVUSER" ]; then
    addauth $DAVUSER $DAVPASSWORD
fi    

if [ ! -f /share/_header.md ]; then
    cp /theme/blog/_header.md /share/_header.md
fi

if [ ! -f /share/_footer.md ]; then
    cp /theme/blog/_footer.md /share/_footer.md
fi

if [ ! -f /share/_sidebar.md ]; then
    cp /theme/blog/_sidebar.md /share/_sidebar.md
fi

