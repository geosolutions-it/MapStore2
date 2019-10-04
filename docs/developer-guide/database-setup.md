# Database Setup

MapStore can use 3 types of database:

- [H2](https://www.h2database.com/html/main.html)
- [PostgreSQL](https://www.postgresql.org/)
- [Oracle](https://www.oracle.com/database)

MapStore uses an H2 in-memory DB as default DBMS for persist the data. This configuration is usefull for develop, test and evaluate the project but it is obviously NOT RECOMMENDED for production usage; moreover the H2 DB cannot be used for the [integration with GeoServer](../integrations/users/geoserver).

In the following guide you will learn how to configure MapStore to use an external database.

## Externalize properties files

MapStore has a file called `geostore-datasource-ovr.properties`. This file is on the repository in the folder `web/src/main/resources`, in the final mapstore.war package it will be copied into `WEB-INF/classes` path. It contains the set-up for the database connection. Anyway if you edit the file in `WEB-INF/classes` this file will be overridden on the next re-deploy. To preserve your configuration on every deploy you can user a environment variable, `geostore-ovr`, to configure the path to an override file in a different, external directory. In this file the user can re-define the default configuration and so set-up the database configuration.

For instance using tomcat on linux you will have to do something like this to add the environment variable to the JAVA_OPTS
> where to add your JAVA_OPTS depends on your operating system. For instance the file could be `/etc/default/tomcat8`, or similar, in linux debian

```properties
# here the path to the ovr file
GEOSTORE_OVR_FILE=file:///var/lib/tomcat/conf/geostore-ovr.properties

# add the env. variable 'geostore-ovr' to JAVA_OPTS
JAVA_OPTS="-Dgeostore-ovr=$GEOSTORE_OVR_FILE [other opts]"
```

So your file `/var/lib/tomcat/conf/geostore-ovr.properties` will contain the overrides to the database set-up.

## Database creation Mode

By default MapStore automatically populates the database on it's own. If you want to disable this functionality (e.g. if you don't want to allow the database user to have permission to create tables) then you have to set-up the following property in the ovr file to 'validate'

```properties
geostoreEntityManagerFactory.jpaPropertyMap[hibernate.hbm2ddl.auto]=validate
```

> Options are:
>
> - `validate`: validate the schema, makes no changes to the database.
> - `update`: update the schema.
> - `create`: creates the schema, destroying previous data.
> - `create-drop`: drop the schema when the SessionFactory is closed explicitly, typically when the > application is stopped.

In this case it is necessary to manually create the required tables using the scripts available [here](https://github.com/geosolutions-it/geostore/tree/master/doc) for the needed DBMS. 

The `update` mode is usually discouraged in production. On production servers you should always use `validate` mode and apply SQL scripts and/or patches manually. Anyway before every update a database backup is strongly suggested. 

## H2

If you download or build mapStore.war, it's default configuration will be this one:

```properties
geostoreDataSource.url=jdbc:h2:./webapps/mapstore/geostore
geostoreEntityManagerFactory.jpaPropertyMap[hibernate.hbm2ddl.auto]=update
```

This configuration creates a file called `geostore` in the webapp folder. You can change the `geostoreDataSource.url` to set the path to the database you want to use. Make you sure that the user of the project that executes Tomcat has write permissions on the folder where you want to create the database.

## PostgreSQL

All the following configurations will use `geostore` as password of the user `geostore`. Of course you can change it according to your needings.

### Database Creation and Setup

To use postgreSQL DBMS as MapStore you have to create the "geostore" DB.

- Log in as user postgres
- Create the geostore DB:

```bash
createdb geostore
```

Create users and schemas:

```bash
psql geostore < 001_setup_db.sql
```

Here below the required part of the file `001_setup_db.sql`, available [here](https://github.com/geosolutions-it/geostore/blob/master/doc/sql/001_setup_db.sql) (creation of test user and schema for `geostore_test` in the original file is not strictly required for MapStore)

> Write the password you prefer instead of 'geostore'

```sql
-- CREATE SCHEMA geostore (set the password you prefer)
CREATE user geostore LOGIN PASSWORD 'geostore' NOSUPERUSER INHERIT NOCREATEDB NOCREATEROLE;

CREATE SCHEMA geostore;

GRANT USAGE ON SCHEMA geostore TO geostore ;
GRANT ALL ON SCHEMA geostore TO geostore ;

alter user geostore set search_path to geostore , public;
```

If you need to create the database schema manually (validate mode), you have also [this script](https://github.com/geosolutions-it/geostore/blob/master/doc/sql/002_create_schema_postgres.sql). 

At the end, **make you sure that the user** `geostore` **has access to the database** from the address of MapStore application. You can give permission by editing [pg_hba.conf](https://www.postgresql.org/docs/9.1/auth-pg-hba-conf.html)

### Connection to the Database

To configure MapStore to connect it to the new created database you have to edit your override file like below (change the connection parameters accordingly):

```properties
# Setup driver and dialect for PostgreSQL database
geostoreDataSource.driverClassName=org.postgresql.Driver
geostoreVendorAdapter.databasePlatform=org.hibernate.dialect.PostgreSQLDialect

# Connection parameters
geostoreDataSource.url=jdbc:postgresql://localhost:5432/geostore
geostoreDataSource.username=geostore
geostoreDataSource.password=geostore
geostoreEntityManagerFactory.jpaPropertyMap[hibernate.default_schema]=geostore

# Automatic create-update database mode
geostoreEntityManagerFactory.jpaPropertyMap[hibernate.hbm2ddl.auto]=update

# Other options
geostoreVendorAdapter.generateDdl=true
geostoreVendorAdapter.showSql=false
```

## Oracle

### Database Creation and Setup

Create a database geostore, a schema called GEOSTORE and a user `geostore` that has write access to them.

Use [this SQL script](https://github.com/geosolutions-it/geostore/blob/master/doc/sql/002_create_schema_oracle.sql) to create the DB schema.

### Connection to the Database

To configure MapStore to connect to the new created database you have to edit your override file like reported below:

```properties
# Setup driver and dialect for Oracle Database
geostoreDataSource.driverClassName=oracle.jdbc.OracleDriver
geostoreVendorAdapter.databasePlatform=org.hibernate.dialect.Oracle10gDialect

# Connection parameters
geostoreDataSource.url=jdbc:oracle:thin:@localhost:1521/ORCL
geostoreEntityManagerFactory.jpaPropertyMap[hibernate.default_schema]=GEOSTORE
geostoreDataSource.username=geostore
geostoreDataSource.password=geostore

# Automatic create-update database mode
geostoreEntityManagerFactory.jpaPropertyMap[hibernate.hbm2ddl.auto]=

# Other options
geostoreVendorAdapter.generateDdl=true
geostoreVendorAdapter.showSql=false
```
