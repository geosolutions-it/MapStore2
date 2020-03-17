# Externalized Configuration

Most of the MapStore configuration files can be externalized using a **data directory**.

Currently this functionality can only be enabled for projects, not for the main product.

This is useful if you have custom configurations that you don't want to overwrite when you deploy a new version of your MapStore project.

This is a list of backend configuration files that can be externalized in the data directory:
 * proxy configuration (propxy.properties)
 * log4j configuration (log4j.properties)
 * geostore database connection settings (geostore-datasource-ovr.properties)

This is a list of frontend configuration files that can be externalized in the data directory:
 * app configuration (localConfig.json)
 * extensions configuration (extensions.json)
 * context plugins configuration (pluginsConfig.json)
 * base folder for extensions bundles and assets

## Using a data directory
To use a data directory, this must be configured through a specific JVM system property: **datadir.location**

```sh
java -Ddatadir.location=/etc/mapstore ...
```

Temporarily, the geostore properties file must be also configured as a specific JVM system property, **geostore-ovr**, We are going to remove this in a near future.

```sh
java -Dgeostore-ovr=file:<path to the override file> ...
```

But this is not enough. Currently usage of the datadir must be enabled for every configuration file that can be externalized.
We will see how to enable externalization for each of them in the following sections.

## Externalize the proxy configuration
This must be done in the WEB-INF web.xml file:

```xml
<context-param>
      <param-name>proxyPropPath</param-name>
      <param-value>${datadir.location}/proxy.properties</param-value>
</context-param>
```

## Externalize the log4j configuration
This must be done in the WEB-INF web.xml file:

```xml
<context-param>
		<param-name>log4jConfigLocation</param-name>
		<param-value>file:${datadir.location}/log4j.properties</param-value>
</context-param>
```

## Externalize the database connection settings
This must be done in the geostore-datasource-ovr.properties file:

```
geostoreDataSource.driverClassName=org.postgresql.Driver
geostoreDataSource.url=jdbc:postgresql://localhost:5432/geostore
geostoreDataSource.username=geostore
geostoreDataSource.password=geostore
geostoreVendorAdapter.databasePlatform=org.hibernate.dialect.PostgreSQLDialect
geostoreEntityManagerFactory.jpaPropertyMap[hibernate.hbm2ddl.auto]=validate
geostoreEntityManagerFactory.jpaPropertyMap[hibernate.default_schema]=geostore
geostoreVendorAdapter.generateDdl=true
geostoreVendorAdapter.showSql=false
```

## Externalize the frontend configuration
This must be done in the project app.jsx entry point:

```javascript
ConfigUtils.setLocalConfigurationFile("rest/config/load/localConfig.json");
```

## Externalize the extensions configuration
This must be done in the project app.jsx entry point:

```javascript
ConfigUtils.setConfigProp("extensionsRegistry", "rest/config/load/extensions.json");
```

## Externalize the context plugins configuration
This must be done in the project app.jsx entry point:

```javascript
ConfigUtils.setConfigProp("contextPluginsConfiguration", "rest/config/load/pluginsConfig.json");
```

## Externalize the extensions assets folder
This must be done in the project app.jsx entry point:

```javascript
ConfigUtils.setConfigProp("extensionsFolder", "rest/config/loadasset?resource=");
```
