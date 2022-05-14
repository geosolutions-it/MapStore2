#!/bin/bash
# wait-for-postgres.sh

set -e

host="$1"
shift
port="$1"
shift
user="$1"
shift
password="$1"
shift
cmd="$@"

export PGPASSWORD="$password"

set -x
until psql -h "$host" -p "$port" -U "$user"  -c '\l'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

>&2 echo "Postgres is up - executing command"
exec $cmd

