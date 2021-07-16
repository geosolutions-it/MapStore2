FROM postgis/postgis as mother

RUN apt update && apt install wget -y

WORKDIR /code

RUN wget https://raw.githubusercontent.com/geosolutions-it/geostore/master/doc/sql/002_create_schema_postgres.sql

COPY ./01-init-user.sh /docker-entrypoint-initdb.d/

