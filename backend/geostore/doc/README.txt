==================================================================================
======= DB creation
==================================================================================

The system is configured to use a PostgreSQL DBMS.

You have to create the "geostore" DB.
Log in as user postgres.
Create the geostore DB:
   createdb geostore
Create users and schemas:
   psql geostore < 001_setup_db.sql

There will be created 2 schemas: 
   geostore
   geostore-test

All configuration files are referring to geostore-test, in order not to perform destructive tests on production DBs.

The Spring based configuration will look for two prop files:
- geostore-datasource.properties      is required. It contains default data, so please do not change it.
- geostore-datasource-ovr.properties  is optional. It will overwrite default data with your own. You'll have to edit this file to perform customizations.


