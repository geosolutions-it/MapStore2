# Configuring MapStore

MapStore (and every application developed with MapStore) allows customization through configuration.
To understand how to configure MapStore you have to know that the back-end and the front-end of MapStore have two different configuration systems.

This separation allows to:

* Make mapstore configuration system live also as a front-end only framework
* Keep the power of customization provided by spring on the back-end

## Back-end Configuration Files

They are `.properties` files or `.xml` files, and they allow to configure the various parts of the back-end.
They are located in `web/src/main/resources` and they will be copied in  `MapStore.war` under the directory `/WEB-INF/classes`.

* `proxy.properties`: configuration for the internal proxy (for cross-origin requests). More information [here](https://github.com/geosolutions-it/http-proxy/wiki/Configuring-Http-Proxy>).
* `geostore-datasource-ovr.properties`: provides settings for the database.
* `log4j.properties`: configuration for back-end logging
* `sample-categories.xml`: initial set of categories for back-end resources (MAP, DASHBOARD, GEOSTORY...)
* `mapstore.properties`: allow specific overrides to front-end files, See [externalization system](../externalized-configuration) for more details

Except `mapstore.properties`, all these files are simply overrides of original configuration files coming from the included sub-applications part of the back-end. In `WEB-INF/classes` you will find also some other useful files coming from the original application:

* `spring-security.xml`: Provide the security settings and configurations. It can be configured to set-up [LDAP integration](integrations/users/ldap.md). (usually in a custom application).


## Front-end Configurations Files

They are JSON files that will be loaded via HTTP from the client, keeping most of the framework working also in an html-only context (when used with different back-ends or no-backend). These JSON files are located in `web/client` directory and they will be copied in the root of the war file.

Several configuration files (at development and / or run time) are available to configure all the different aspects of an application.

* `localConfig.json`: Dedicated to the application configuration. Defines all general settings of the front-end part, with all the plugins for all the pages. See [Application Configuration](../local-config) for more information.
* `new.json` Can be customized to set-up the inital new map, setting the backgrounds, initial position .. See [Maps configuration](../maps-configuration) for more information.
* `pluginsConfig.json`: Allows to configure the context editor plugins list. See [Context Editor Configuration](context-editor-config.md) for more information.

## Externalize Configurations

Typically configuration customization should stay outside the effective application installation directory to simplify future updates. Updates in fact are usually replacement of the old application file package with the newer one. Changes applied directly inside the application package may be so removed on every update. For this reason MapStore provides a externalization system for both the configuration systems. See [Externalize Configuration](../externalized-configuration) section to learn how to do this.
