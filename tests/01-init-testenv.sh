#!/usr/bin/env bash
set -e

psql -v ON_ERROR_STOP=1 --username postgres --dbname geostore <<-EOSQL
    CREATE user geostore LOGIN PASSWORD 'geostore' NOSUPERUSER INHERIT NOCREATEDB NOCREATEROLE;
    CREATE user geostore_test LOGIN PASSWORD 'geostore_test' NOSUPERUSER INHERIT NOCREATEDB NOCREATEROLE;
    alter user geostore set search_path to geostore , public;
    alter user geostore_test set search_path to geostore_test, public;
    ALTER DATABASE geostore OWNER TO geostore;
EOSQL

PGPASSWORD="geostore" PGOPTIONS="--search_path=geostore" psql -v ON_ERROR_STOP=0 --username postgres --dbname geostore < /code/003_dmpdatabase.sql