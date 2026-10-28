# This is a script to run GeoStore jetty:run
# with persistent h2 database
# Useful for quick mapstore tests

cd src/server/web/app

mvn jetty:run -Djetty.port=8181 -Ph2_disk -o
