#!/bin/sh
# Runs automatically on first container start only (postgres:16-alpine's
# entrypoint executes everything in /docker-entrypoint-initdb.d/ once,
# against a fresh, empty data volume — never re-runs against existing
# data). Creates a second database for Umami (analytics) alongside the
# main "yese" one, so the whole stack still runs on ONE Postgres
# instance/volume rather than a second container just for this.
set -e
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE DATABASE umami;
EOSQL
