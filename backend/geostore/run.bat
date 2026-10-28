@echo off
cd src\server\web\app
mvn jetty:run -Djetty.port=8181
