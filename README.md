# blog-webdav

generate a nginx server webdav with a blog

write markdown file and view blog 

## Parameter

- SET_CONTAINER_TIMEZONE (false or true) manage time of container
- CONTAINER_TIMEZONE timezone of container
- DAVUSER (default user)
- DAVPASSWORD (default pass)

## Volume

- /share

## Port

- 80 

## Command

- addauth : add user for git
- rmauth : remove user

## Usage direct

run image fraoustin/blog-webdav

    docker run -d -v <localpath>:/share --name blog -p 80:80 fraoustin/blog-webdav

user default is *user* and password default is *pass*

you use http://localhost/ for access ihm

It is necessary to check authorization on localpath (read and write)

## Usage by Dockerfile

Sample of Dockerfile

    FROM fraoustin/blog-webdav
    COPY ./00_init.sh /usr/share/docker-entrypoint.pre/00_init.sh
    RUN chmod +x -R /usr/share/gitweb/docker-entrypoint.pre

File 00_init.sh

    #!/bin/bash
    if [ ! -z "$DAVUSER" ]; then
        addauth $DAVUSER $DAVPASSWORD
    fi    


build image myblog

    docker build -t myblog .

run image mytodotxt

    docker run -d -e "CONTAINER_TIMEZONE=Europe/Paris" -e DAVUSER=myuser" -e "DAVPASSWORD=mypassword" -v <localpath>:/share --name test -p 80:80 myblog

## For developer

    git clone https://github.com/fraoustin/blog-webdav.git
    docker build -t myblog .
    docker run -d -v c:/users/myhome/workspace/blog-webdav/blog:/theme/blog -v c:/users/myhome/downloads/blog:/share --name test -p 8080:80 myblog

## External library

- wedav.js on https://github.com/aslakhellesoy/webdavjs
- icon from https://feathericons.com/
- marked https://github.com/markedjs/marked

## Feature

- use nginx-alpine
- search global
- ihm and css mardown
- aera edit online (login, edit)
- add highlight.js for aera code
- responsive ihm
- add in mardonw
    - tag
    - aera warning info ...
    - txt2img