FROM postgis/postgis:12-3.1
WORKDIR /code
COPY ./01-init-user.sh /docker-entrypoint-initdb.d/
RUN apt-get update \
    && apt-get install wget -y \
    && rm -rf /var/cache/apt/*
RUN wget https://raw.githubusercontent.com/geosolutions-it/geostore/master/doc/sql/002_create_schema_postgres.sql
USER postgres