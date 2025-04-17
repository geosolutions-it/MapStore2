FROM postgis/postgis:12-3.1
ARG UID=1001
ARG GID=1001
ARG UNAME=postgres
RUN useradd -u $UID -g $GID -m $UNAME
WORKDIR /code
COPY ./01-init-user.sh /docker-entrypoint-initdb.d/
RUN apt-get update \
    && apt-get install wget -y \
    && rm -rf /var/cache/apt/*
USER $UNAME
RUN wget https://raw.githubusercontent.com/geosolutions-it/geostore/master/doc/sql/002_create_schema_postgres.sql
