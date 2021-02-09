#!/usr/bin/env bash
set -e

psql -v ON_ERROR_STOP=1 --username postgres --dbname postgres <<-EOSQL
    CREATE USER geostore;
    CREATE DATABASE geostore;
    GRANT ALL PRIVILEGES ON DATABASE geostore TO geostore;
EOSQL
