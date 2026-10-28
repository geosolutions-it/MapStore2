GeoFence geoStore integration
=================================

This folder contains the DDL scripts to create a common database shared between **GeoFence** and **GeoStore** that allow **GeoFence** to use the *Users and Groups* stored on **GeoStore** that could also be shared with **GeoServer**.
These scripts require an empty postgres database spatially enabled.
The script will create all the tables and views in 2 schemas called `geostore` and `geofence` plus it will create other 2 empty schemas called `geostore_test` and `geofence_test` for testing pourposes.
All the schemas and all the objects will be owned by the script-created user called `geostore`

Instructions
==================================================

* Create a new database, the admin can freely choose the db-name
* Enable the postgres geospatial extensions, postGIS: run the query `CREATE EXTENSION postgis;` (Please note that the CREATE EXTENSION statement is available only with postgres version >= 2.0)
* Run the DDL scripts you can find in this directory in the order indicated by the files suffixes (001, 002, 003) Please note that the db **should be empty** because if the user, schemas or tables that the scripts try to create are already/partially present the script will fail.
* Install on two different tomcat instances GeoStore and Geofence and configure both to use the created database: configure properly the schema names: *geofence* must work on **geofence** schema and *geostore* on **geostore** schema
* Run the applications, the startup order is not important.
* Enjoy!