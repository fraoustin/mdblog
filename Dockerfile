FROM nginx:1.22
LABEL maintainer="fraoustin@gmail.com"

ENV SET_CONTAINER_TIMEZONE=false 
ENV CONTAINER_TIMEZONE="" 

# manage user www-data
RUN usermod -u 1000 www-data

# manage start container
COPY ./src/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

RUN mkdir /usr/share/docker-entrypoint.pre
RUN mkdir /usr/share/docker-entrypoint.post
COPY ./src/00_init.sh /usr/share/docker-entrypoint.pre/00_init.sh
RUN chmod +x -R /usr/share/docker-entrypoint.pre

# install extra nginx
RUN apt-get update && apt-get install -y \
#        apache2-utils \
        nginx-extras \
    && rm -rf /var/lib/apt/lists/* 

COPY ./src/default.conf /etc/nginx/conf.d/default.conf
RUN rm /etc/nginx/sites-enabled/default

# add theme
RUN mkdir /theme
RUN mkdir /theme/blog
WORKDIR /theme/blog
COPY ./blog/ /theme/blog/

RUN mkdir /share
VOLUME /share

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
CMD ["app"]
