# Configuring MapStore

MapStore (and every application developed with MapStore) allows customization through configuration.
To understand how to configure MapStore you have to know that the back-end and the front-end of MapStore have two different configuration systems.

This separation allows to:

* Make mapstore configuration system live also as a front-end only framework
* Keep the power of customization provided by spring on the back-end

In this document we will describe the configuration files for both the [back-end](#back-end-configuration-files) and the [front-end](#front-end-configurations-files), and how to [externalize](#externalize-configurations) them. Moreover, we will see how to pass some specific configurations as [Java system properties](#java-system-properties).

## Back-end Configuration Files

They are `.properties` files or `.xml` files, and they allow to configure the various parts of the back-end.
In source code they are located in `java/web/src/main/resources`. In the `MapStore.war` they are under the directory `/WEB-INF/classes`.

The following are the main configuration files for the backend:

* `proxy.properties`: configuration for the internal proxy (for cross-origin requests). More information [here](https://github.com/geosolutions-it/http-proxy/wiki/Configuring-Http-Proxy).
* `geostore-datasource-ovr.properties`: provides settings for the database.
* `log4j2.properties`: configuration for back-end logging
* `sample-categories.xml`: initial set of categories for back-end resources (MAP, DASHBOARD, GEOSTORY...)
* `mapstore.properties`: allow specific overrides to front-end files, See [externalization system](externalized-configuration.md#externalized-configuration) for more details

Except for `mapstore.properties` and `ldap.properties`, all these files are simply overrides of original configuration files coming from the included sub-applications part of the back-end. In `WEB-INF/classes` you will find also some other useful files coming from the original application:

### Back-end security configuration files

Back-end security can be configured to use different authentication strategies. Maven profiles can be used to switch between these different strategies.

Depending on the chosen profile a different file will be copied from the `product/config` folder to  override `WEB-INF/classes/geostore-spring-security.xml` in the final package. In particular:

* **default**: `db\geostore-spring-security-db.xml` (geostore database)
* **ldap**: `ldap\geostore-spring-security-ldap.xml` (LDAP source)

Specific configuration files are available to configure connection details for the chosen profile.

For example, if using LDAP, look at [LDAP integration](integrations/users/ldap.md#ldap-integration-with-mapstore).

### Log4j2 configuration file

Below will be presented some basic pointers to configure logging through the `log4j2.properties` file. For more informations see the [official documentation page](https://logging.apache.org/log4j/2.x/manual/configuration.html).

The following is the default MapStore `log4j2.properties` file.

```properties
rootLogger.level = INFO
appenders= console, file


appender.console.type = Console
appender.console.name = LogToConsole
appender.console.layout.type = PatternLayout
appender.console.layout.pattern = %p %d{yyyy-MM-dd HH:mm:ss.SSS} %c::%M:%L - %m%n
rootLogger.appenderRef.stdout.ref = LogToConsole
rootLogger.appenderRef.console.ref = LogToConsole

appender.file.type = File
appender.file.name = LogToFile
appender.file.fileName=${sys:catalina.base}/logs/mapstore.log
appender.file.layout.type=PatternLayout
appender.file.layout.pattern=%p   %d{yyyy-MM-dd HH:mm:ss.SSS}   %C{1}.%M() - %m %n
rootLogger.appenderRef.file.ref = LogToFile


logger.restsrv.name=it.geosolutions.geostore.services.rest
logger.restsrv.level=  INFO
logger.hibernate1.name=org.hibernate
logger.hibernate1.level=INFO
logger.trg1.name=com.trg
logger.trg1.level=INFO
```

The first two properties defines the rootLogger level and appenders declarations.

```properties
rootLogger.level = INFO
appenders= console, file
```

The following properties configure two appenders: one that writes log messages to the console and the other to a log file. In both cases a pattern layout has been configured through a conversion pattern strings to format the log messages (more details about patterned layouts are available [here](https://logging.apache.org/log4j/2.x/manual/layouts.html)).
For the file appender we have configured as well the location of the log file to which writing log messages (property `appender.file.fileName`).
Note the `${sys:catalina.base}` variable, used as a placeholder of the root folder of the tomcat instance where MapStore is deployed.

```properties
appender.console.type = Console
appender.console.name = LogToConsole
appender.console.layout.type = PatternLayout
appender.console.layout.pattern = %p %d{yyyy-MM-dd HH:mm:ss.SSS} %c::%M:%L - %m%n
rootLogger.appenderRef.stdout.ref = LogToConsole
rootLogger.appenderRef.console.ref = LogToConsole

appender.file.type = File
appender.file.name = LogToFile
appender.file.fileName=${sys:catalina.base}/logs/mapstore.log
appender.file.layout.type=PatternLayout
appender.file.layout.pattern=%p   %d{yyyy-MM-dd HH:mm:ss.SSS}   %C{1}.%M() - %m %n
rootLogger.appenderRef.file.ref = LogToFile
```

In the final section of the properties file the loggers for specific package name are configured. In this case the syntax is `logger.{a_name_of_choice}.name` to declare the package to which the configured logger belongs and `logger.{a_name_of_choice}.level` to declare the log level of that logger.

```properties
logger.restsrv.name=it.geosolutions.geostore.services.rest
logger.restsrv.level=  INFO
logger.hibernate1.name=org.hibernate
logger.hibernate1.level=INFO
logger.trg1.name=com.trg
logger.trg1.level=INFO
```

## Front-end Configurations Files

They are JSON files that will be loaded via HTTP from the client, keeping most of the framework working also in an html-only context (when used with different back-ends or no-backend). These JSON files are located in `web/client/configs` directory and they will be copied in the `configs` of the war file.

Several configuration files (at development and / or run time) are available to configure all the different aspects of an application.

* `localConfig.json`: Dedicated to the application configuration. Defines all general settings of the front-end part, with all the plugins for all the pages. See [Application Configuration](local-config.md#application-configuration) for more information.
* `new.json` Can be customized to set-up the initial new map, setting the backgrounds, initial position .. See [Maps configuration](maps-configuration.md#map-configuration) for more information.
* `pluginsConfig.json`: Allows to configure the context editor plugins list. See [Context Editor Configuration](context-editor-config.md#configuration-of-application-context-manager) for more information.

## Java System Properties

It is possible to pass some specific configurations as Java system properties. These configurations regard mainly:

* the location of the data directory
* the corporate proxy settings

Other configurations can be passed as Java system properties, depending on the specific needs, and they will be explained in the specific sections of the documentation that require them.

### Setting Java System Properties

To pass Java system properties, you can use the `-D` option when starting the Java application. For example:

```sh
java -Ddatadir.location=/path/to/data-dir -jar mapstore.war
```

In servlet containers like Tomcat, you can set Java system properties in the `setenv.sh` file (for Unix-based systems) or `setenv.bat` file (for Windows systems) located in the `bin` directory of the Tomcat installation.

If you are using Tomcat as a service, you can set Java system properties in the service configuration file (for instance `/etc/default/tomcat9` in Ubuntu 20.04 ).

### `datadir.location`

This property allows you to externalize the location of some back-end and front-end configuration files. For more details, refer to the [Externalize Configuration](externalized-configuration.md#externalized-configuration) section.

### Corporate proxy settings

In case of corporate proxy, some services may require the use of an HTTP proxy to access the internet. You can pass the following Java system properties to configure the HTTP proxy:

* `http.proxyHost`: specifies the HTTP proxy host.
* `http.proxyPort`: specifies the HTTP proxy port.
* `http.nonProxyHosts`: specifies a list of hosts that should not use the HTTP proxy.

For more information, refer to the [official HTTP proxy documentation](https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/net/doc-files/net-properties.html) corresponding to the java version in use (see [requirements](./requirements.md)).

#### Usage Example

To pass these system properties, you can use the `-D` option when starting the Java application. For example:

```sh
java -Ddatadir.location=/path/to/data-dir -Dhttp.proxyHost=proxy.example.com -Dhttp.proxyPort=8080 -jar mapstore.war
```

## Externalize Configurations

Typically configuration customization should stay outside the effective application installation directory to simplify future updates. Updates in fact are usually replacement of the old application file package with the newer one. Changes applied directly inside the application package may be so removed on every update. For this reason MapStore provides a externalization system for both the configuration systems. See [Externalize Configuration](externalized-configuration.md#externalized-configuration) section to learn how to do this.
