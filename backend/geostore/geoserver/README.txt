The following files allow to bind geostore user groups and roles with GeoServer.

**Important Note**
The current implementation of this integration dosn't allow user changes from the GeoServer's UI. Any attempt to change users, groups or roles from the GeoServer's UI may cause errors. 
You should use MapStore 2 or GeoStore's REST API to apply these changes.

====================================
Binding GeoStore and GeoServer users
====================================

Create the empty GeoStore database using scripts as described in GeoStore WIKI 
(https://github.com/geosolutions-it/geostore/wiki/Building-instructions#building-geostore-with-postgres-support).
In order to intergrate GeoServer with GeoStore's users you need GeoStore v1.2.
For the old GeoStore DBs migration's scripts must be used, you can find these scripts at your-path/geostore/doc/sql/migration directory.

GeoServer Settings
==================

^^^^^^^^^^^^^^^^^^^^^
User Groups and Roles
^^^^^^^^^^^^^^^^^^^^^
 
Setup User Group
^^^^^^^^^^^^^^^^

1. in GeoServer and add a new User Group Service
    * Setup the User Group Service
    * Select JDBC
    * name: geostore
    * Password encryption : Digest
    * password policy default 
    * Driver org.postgresql (or JNDI)
    * connection url jdbc:postgresql://localhost:5432/geostore (or the one for your setup)
    * JNDI only: the JNDI resource name should look like this java:comp/env/jdbc/geostore
    * set username and password for the db (user 'geostore' with password 'geostore')
	* Save
    * set DDL and DML file urls.
        To do This you can save, and place the provided files in the created directory under <gs_datadir>/security/usergroup/geostore . Then go back to geostore user group service and save again.

Setup Role Service 
^^^^^^^^^^^^^^^^^^
    * Add a new Role Service 
    * select JDBC
    * name geostore
    * db org.postgresql
    * connection url: jdbc:postgresql://localhost:5432/geostore (or JNDI, same as above) 
    * set user and password (user 'geostore' with password 'geostore')
    * save, add the provided files to the geostore directory under /<gs_datadir>/security/role/geostore and save again
    * Go Again in JDBC Role Service 'geostore' and select Administrator role to ADMIN and Group Administrator Role to ADMIN 
    
Use these services as default
=============================
    * Go To Security Settings and set the 'Active role service' to “geostore”
    * Go to Authentication Section, scroll to Authentication Providers and Add a new one.
    * select 'Username Password' 
    * name it “geostore”
    * select “geostore” from the select box
    * Save.
    * Go to Provider chain and move geostore in the right list, on top 
    * save


Use symmetric Encoding
======================
The default crittografy will use a “digest”. If you want to  use simmetric password encoding you have to set up properly geostore and geoserver
    * configure geoserver usergroup to use weakPBE password encryption (or strong,not thested on geostore) 
    * delete all users from gs_users table (user and admin)
    * edit geostore.properties and set it to passwordEncoder=pbePasswordEncoder
    * edit geostore-ovr.properties setting
    * keyStoreProvider.keyStoreFilePath=/path/to/gs/datadir/security/geoserver.jceks
    * passwordProvider.URL=<datadir-path>/security/masterpw/default/passwd (or the masterpassword provider password (is encoded by default)
    
Use the auth key Module for with GeoStore/GeoServer
===================================================
    * Install the auth key module in GeoServer. 
    * Go to the authentication page and scroll into the 'Authentication Filters' section
	* Click 'Add new'.
	* Inside the 'New authentication Filter' page click on authkey module.
	* Insert the name (i.e. 'geostore').
	* Leave authkey as parameter name.
	* Select the 'User Property' as 'Authentication key user mapper'.
	* Select the created geostore's 'User/Group Service'.
	* Click on 'Syncronize user/group service'.
	* Save.
    * Go into the authentication page and open default filter chain.
    * Add 'geostore' into the 'Selected' filters and put it on top, and save.

