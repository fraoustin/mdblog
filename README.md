# mdblog

generate a nginx server webdav with a blog

write markdown file and view blog 

## Parameter

- SET_CONTAINER_TIMEZONE (false or true) manage time of container
- CONTAINER_TIMEZONE timezone of container

## Volume

- /share

## Port

- 80 


## Usage direct

run image fraoustin/blog-webdav

    docker run -d -v <localpath>:/share --name blog -p 80:80 fraoustin/mdblog

you use http://localhost/ for access ihm

It is necessary to check authorization on localpath (read and write)

You can use in your text (write with markdown)

- add tag 
```markdown
    ![tag](name of tag)
```
- add category  
```markdown
    ![category](name of category)
```
- admonition
```markdown
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
- mermaid
```
    ```mermaid
    sequenceDiagram
        Alice->>+John: Hello John, how are you?
        Alice->>+John: John, can you hear me?
        John-->>-Alice: Hi Alice, I can hear you!
        John-->>-Alice: I feel great!
    ```
```

You can search post by year with *year:XXXX* in search input.

You can search post by tag (or category) with *[tag](mytag)* in search input.

You can add in header a file, a description

```markdown
---
title: Mon document
author: John
tags:
  - IA
  - Markdown
version: 1.0
---

# Mon document

...
```


You can change

- header by _header.md (in your localpath)
- footer by _footer.md (in your localpath)
- sidebar by _sidebar.md (in your localpath)


## Usage by Dockerfile


    docker run -d -e "CONTAINER_TIMEZONE=Europe/Paris" -v <localpath>:/share --name test -p 80:80 myblog

## For developer

    git clone https://github.com/fraoustin/mdblog.git
    docker build -t myblog .
    docker run -d -v c:/users/myhome/workspace/mdblog/blog:/theme/blog -v c:/users/myhome/downloads/blog:/share --name test -p 8080:80 myblog

## External library

- icon from https://feathericons.com/
- marked https://github.com/markedjs/marked
- editor https://github.com/lepture/editor
- mermaid from https://mermaid-js.github.io/
- viz from http://viz-js.com/

## Feature

- use nginx-alpine

