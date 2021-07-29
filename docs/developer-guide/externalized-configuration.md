# Externalized Configuration

The **data directory** is a directory on the file-system, configured for an instance of MapStore, that will be used to externalize configuration of MapStore.

Configuring this directory you will be able to:

- Externalize database configuration
- Externalize proxy configuration
- Externalize JSON configs files for the application (`localConfig.json`, `new.json`)
- Apply patches to default JSON config files (e.g. to store only the differences)
- Store extensions installed

All the configuration stored here will persist across MapSore updates.

## Using a data directory

To use a data directory, this must be configured through a specific JVM system property: `datadir.location`

```sh
java -Ddatadir.location=/etc/mapstore/datadir
```

The data-directory must exist, but all the files inside it are optional. Due to some particular operations (e.g. installation of extensions), some files may be stored in data-dir by the application itself.

The structure of the data-dir is the following:

```text
.
├── configs                  (JSON configs)
│   └── pluginsConfig.json.patch
├── extensions
│   ├── extensions.json      (extensions index)
|   └── SampleExtension      (One directory for each extension installed)
|       ├── index.js
|       ├── assets
|       └── translations
├── geostore-datasource-ovr.properties (database configuration)
├── ldap.properties
├── mapstore-ovr.properties
└── mapstore.properties

```

- `configs`: files in this folder can override the files in `configs` file of the application (`pluginsConfig.json`, `localConfig.json`).
  - If a file with the same name is present, it will be provided instead of the original one
  - If a patch file is present,(e.g. `localConfig.json.patch`) the patch will be applied to the JSON (original or overridden) and provided patched to the client
- `extensions`: this folder contains all the files for the installed extensions, one folder for each installed extension
  - `extensions.json`: the index of the current extensions installed.

### Multiple data directory locations

It is possible to specify more than one datadir location path, separated by commas. This can be useful if you
need to have different places for static configuration and dynamic one.
A dynamic configuration file is one that is updated by MapStore using the UI, while static ones can only updated manually
by an administrator of the server. An example are uploaded extensions, and their configuration files.

MapStore looks for configuration resources in these places in order:

- the first datadir.location path
 other datadir.location paths, if any, in order
- the application root folder

Dynamic files will always be written by the UI in the first location in the list, so the first path is for dynamic stuff.

*Example*:

```sh
-Ddatadir.location=/etc/mapstore_extensions,/etc/mapstore_static_config
```

### Logging

Logging has not been externalized yet, You can manually do this change in `WEB-INF/web.xml` file to externalize also this file:

```xml
<context-param>
    <param-name>log4jConfigLocation</param-name>
    <param-value>file:${datadir.location}/log4j.properties</param-value>
</context-param>
```

### Database Connection

If you create a file in the datadir called `geostore-datasource-ovr.properties` , it will be used and override the current

*Example:*

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

**NOTE: this file simply overrides the values in `geostore-datasource-ovr.properties` in the web-application, it will not replace it** usually it is configured by default to use h2 database, so configuring the database (h2, postgreSQL or oracle) will override all the properties. Anyway if you changed this file in your project, you may need to override more variables to make it work

## Externalize front-end Configurations

From version 2021.02.xx, the externalization of the front-end files is automatic on the back-end. As well as you configure the data-directory.
Anyway for your custom application you can customize the following paths to change the defaults and implement your own services for configuration, extensions, and so on.

You can externalize the following files to the data directory by adding the relative line in the `app.jsx` :

- *Application* (`localConfig.json`):

```javascript
ConfigUtils.setLocalConfigurationFile("configs/localConfig.json");
```

- *Static maps* (`new.json` and `config.json`):

```javascript
ConfigUtils.setConfigProp("configurationFolder", "configs/");
```

- *Extensions configuration* (`extensions.json`):

```javascript
ConfigUtils.setConfigProp("extensionsRegistry", "extensions/extensions.json");
```

- *Context Editor* (`pluginsConfig.json`):

```javascript
ConfigUtils.setConfigProp("contextPluginsConfiguration", "configs/pluginsConfig.json");
```

- *Extensions folder* ( folder where to get the extensions found in `extensions.json`):

```javascript
ConfigUtils.setConfigProp("extensionsFolder", "extensions/");
```

!!! note
    Because in this case we are modifying the `app.jsx` file, these changes can be applied only at build time in a custom project.
    Future improvements will allow to externalize these files also in the main product, without any need to rebuild the application.

## Overriding front-end configuration

Externalizing the whole `localConfig.json` file allows to keep your configurations during the various updates. Anyway keeping this long file in sync can become hard.
You can use patch files, and this is the first suggested option.

Anyway if you need to specify something in `localConfig.json` that comes from your Java application, MapStore gives you the possibility to override only some specific properties of this big file and keep these changes separated from the application,
allowing an easier updates.
This is particularly useful for example when you have to change only a bunch of settings on a specific instance, and use the standard configuration for everything else.

You can override one or more properties in the file using the following JVM flags:

- `overrides.config`: the path of a properties file (relative to the datadir) where override values are stored
- `overrides.mappings`: comma limited list of JSONPath=property values to override

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
