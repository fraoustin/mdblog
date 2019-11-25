# mdblog

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

    docker run -d -v <localpath>:/share --name blog -p 80:80 fraoustin/mdblog

user default is *user* and password default is *pass*

you use http://localhost/ for access ihm

It is necessary to check authorization on localpath (read and write)

You can use in your text (write with markdown)

- add tag 
```
    ![tag](name of tag)
```
- add category  
```
    ![category](name of category)
```
- admonition
```
    ```note|warning|error
    text
    ```
```
- graphviz
```
    ```graphviz
    digraph G {

        subgraph cluster_0 {
            style=filled;
            color=lightgrey;
            node [style=filled,color=white];
            a0 -> a1 -> a2 -> a3;
            label = "process #1";
        }

        subgraph cluster_1 {
            node [style=filled];
            b0 -> b1 -> b2 -> b3;
            label = "process #2";
            color=blue
        }
        start -> a0;
        start -> b0;
        a1 -> b3;
        b2 -> a3;
        a3 -> a0;
        a3 -> end;
        b3 -> end;

        start [shape=Mdiamond];
        end [shape=Msquare];
    }
    ```
```

You can search post by year with *year:XXXX* in search input.

You can search post by tag (or category) with *[tag](mytag)* in search input.



You can change

- header by _header.md (in your localpath)
- footer by _footer.md (in your localpath)
- sidebar by _sidebar.md (in your localpath)


## Usage by Dockerfile

Sample of Dockerfile

    FROM fraoustin/mdblog
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

    git clone https://github.com/fraoustin/mdblog.git
    docker build -t myblog .
    docker run -d -v c:/users/myhome/workspace/mdblog/blog:/theme/blog -v c:/users/myhome/downloads/blog:/share --name test -p 8080:80 myblog

## External library

- wedav.js on https://github.com/aslakhellesoy/webdavjs
- icon from https://feathericons.com/
- marked https://github.com/markedjs/marked
- editor https://github.com/lepture/editor

## Feature

- use nginx-alpine

