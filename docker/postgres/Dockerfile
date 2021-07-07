FROM postgis/postgis AS mother
LABEL maintainer="Asdrubal Gonzalez<agpenton89@gmail.com>"

WORKDIR /code
RUN apt update && apt install wget -y \
     && wget https://raw.githubusercontent.com/geosolutions-it/geostore/master/doc/sql/002_create_schema_postgres.sql
COPY ./01-init-user.sh /docker-entrypoint-initdb.d/
