# Externalized Configuration

Most of the MapStore configuration files can be externalized using a **data directory**.

Currently this functionality can only be enabled for projects, not for the main product. For the main product the externalization support is limited to the [Database Setup](../database-setup) )

Externalization of configurations is useful if you have custom configurations that you don't want to overwrite when you deploy a new version of your MapStore project.

This is a list of backend configuration files that can be externalized in the data directory:

* proxy configuration (`proxy.properties`)
* log4j configuration (`log4j.properties`)
* geostore database connection settings (`geostore-datasource-ovr.properties`)

This is a list of frontend configuration files that can be externalized in the data directory:

* app configuration (`localConfig.json`)
* extensions configuration (`extensions.json`)
* context plugins configuration (`pluginsConfig.json`)
* demo map configuration (`config.json`)
* new map template configuration (`new.json`)
* base folder for extensions bundles and assets

## Configuration environment variables

Some of the configuration parameters can be set using JVM environment variables:
This can be done using flags in the JVM start script:

```sh
java -Dsome_setting=some_value ...
```

Flags can also be set using a mapstore.properties file in the JVM classpath. A default one (empty) is included in
the MapStore WEB-INF/classes folder.
All examples will use the JVM flag syntax, but writing the property in the properties file is always possible.

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

### Multiple data directory locations

It is possible to specify more than one datadir location path, separated by commas. This can be useful if you
need to have different places for static configuration and dynamic one.
A dynamic configuration file is one that is updated by MapStore using the UI, while static ones can only updated manually
by an administrator of the server. An example are uploaded extensions, and their configuration files.

MapStore looks for configuration resources in these places in order:

* the first datadir.location path
* other datadir.location paths, if any, in order
* the application root folder

Dynamic files will always be written by the UI in the first location in the list, so the first path is for dynamic stuff.

*Example*:

```sh
-Ddatadir.location=/etc/mapstore_extensions,/etc/mapstore_static_config
```

## Externalize back-end configuration

### Proxy

This must be done in the `WEB-INF/web.xml` file:

```xml
<context-param>
      <param-name>proxyPropPath</param-name>
      <param-value>${datadir.location}/proxy.properties</param-value>
</context-param>
```

### Logging

This must be done in the `WEB-INF/web.xml` file:

```xml
<context-param>
    <param-name>log4jConfigLocation</param-name>
    <param-value>file:${datadir.location}/log4j.properties</param-value>
</context-param>
```

### Database Connection

This must be done in the `geostore-datasource-ovr.properties` file:

```properties
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

## Externalize front-end Configurations

MapStore by default fetches configuration files directly via HTTP, without any needing of any special back-end service in the middle (this simplifies the usage in a no-back-end context, as a framework). The `app.jsx` of the **MapStore project** allows to customize these URLs for these static configuration files (usually relative paths) to use your custom versions.

MapStore back-end provides a configuration service utility (at `/rest/config/load`) to provide the configuration files from the data directory.

So to externalize the configuration files you can simply change their URLs to the ones provided by the configuration service utility. This utility provides also some advanced functionalities to better handle your externalized customizations (see the section about "overriding" or "patching" configuration).

!!! note
    Fallback works only within the deployed application, if you are running `npm start` you need to comment the custom entries in `app.jsx`

!!! note
    The configuration service utility can be used to load only allowed files (this is done for security reasons). Only json files can be allowed, and the extension is automatically appended.
    By default the following resources are allowed:
    `localConfig.json`, `pluginsConfig.json`, `extensions.json`, `config.json`, `new.json`.
    The list of allowed resources can be changed, via the allowed.resources JVM environment variable:
    `java -Dallowed.resources=localConfig,pluginsConfig,extensions,config,new ...`

**You can externalize the following files to the data directory by adding the relative line in the `app.jsx`** :

* Application (`localConfig.json`):

```javascript
ConfigUtils.setLocalConfigurationFile("rest/config/load/localConfig.json");
```

* Static maps (`new.json` and `config.json`):

```javascript
ConfigUtils.setConfigProp("configurationFolder", "rest/config/load/");
```

* Extensions configuration (`extensions.json`):

```javascript
ConfigUtils.setConfigProp("extensionsRegistry", "rest/config/load/extensions.json");
```

* Context Editor (`pluginsConfig.json`):

```javascript
ConfigUtils.setConfigProp("contextPluginsConfiguration", "rest/config/load/pluginsConfig.json");
```

* Assets folder: (setting this will cause assets are loaded using a different service, `/rest/config/loadasset.`):

```javascript
ConfigUtils.setConfigProp("extensionsFolder", "rest/config/loadasset?resource=");
```

!!! note
    Because in this case we are modifying the `app.jsx` file, these changes can be applied only at build time in a custom project. Future improvements will allow to externalize these files also in the main product, without any need to rebuild the application.

## Overriding front-end configuration

Externalizing the whole `localConfig.json` file allows to keep your configurations during the various updates. Anyway keeping this long file in sync can become hard.

For this reason, MapStore gives you the possibility to override only some specific properties of this big file and keep these changes separated from the application,
allowing an easier updates.
This is particularly useful for example when you have to change only a bunch of settings on a specific instance, and use the standard configuration for everything else.

You can override one or more properties in the file using the following JVM flags:

* `overrides.config`: the path of a properties file (relative to the datadir) where override values are stored
* `overrides.mappings`: comma limited list of JSONPath=property values to override

An example of overrides that will replace the default WMS service url:

In `mapstore.properties`:

```properties
overrides.config=env.properties
overrides.mappings=initialState.defaultState.catalog.default.services.WMS Service.url=geoserverUrl
```

In `env.properties`:

```properties
geoserverUrl=https://demo.geo-solutions.it/geoserver/wms
```

This allows to have in `env.properties` a set of variables that can be used in overrides (even in different places). that are indicated by `overrides.mappings`.

## Patching front-end configuration

Another option is to patch the frontend configuration files, instead of overriding them completely, using a patch file
in [json-patch](http://jsonpatch.com/) format.

To patch one of the allowed resources you can put a file with a **.patch** extension in the datadir folder (e.g. localConfig.json.patch) and that file will be merged with the main localConfig.json to produce the final resource.

This allows easier migration to a new MapStore version. Please notice that when you use a patch file, any new configuration from
the newer version will be applied automatically. This can be good or bad: the good part is that new plugins and features will be available without further configuration after the migration, the bad part is that you won't be aware that new plugins and features will be automatically exposed to the final user.

*Example: adding a plugin to the localConfig.json configuration file*:

```json
[{"op": "add", "path": "/plugins/desktop/-", "value": "MyAwesomePlugin"}]
```
