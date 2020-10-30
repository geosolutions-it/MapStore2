# Printing Module

The **printing module** of MapStore is a back-end service **not included  by default in the release package** that allows to create a printable PDF from the current map.

!!! note
    The **printing module** is required by the **Print plugin** of MapStore, so if you want to have the Print plugin working in your application, you have to include also the printing module in your MapStore installation.

## Including the printing module in MapStore

Because MapStore doesn't include the printing module by default, to use it you need to build from the source a `MapStore.war` that includes it or add the missing files to an existing MapStore deployed.

### Building from the Source

If you want to include the printing module in your MapStore, by building the source code, you have to add the profile `printing` (profiles can be added as 2nd argument of the `build.sh` script, after the version that is the 1st. If you have more then one profile, you can add them separated by `,`):

```bash
./build.sh [version_identifier] printing
```

MapStore projects also allow to use the `printing` profile to include this module. So you can use the same `printing` profile to build your custom MapStore project including the printing module.

### Adding to an existing MapStore

If you have an existing and deployed instance of MapStore and you want to add the printing module, you can build only the printing extension as a zip running `mvn clean install -Pprintingbundle`. The zip bundle will created in `printing/target/mapstore-printing.zip`. 
You can copy the content of this zip bundle into `webapps/mapstore` directory of your java container (e.g. Tomcat) following the same directory structure: 

- files from zip directory `WEB-INF/classes` must be placed in `webapps/mapstore/WEB-INF/classes` 
- files from zip directory `WEB-INF/lib` must be placed in `webapps/mapstore/WEB-INF/lib` 

Then restart your java container.

## Configuring the print

This printing module includes the [MapStore printing engine](https://github.com/geosolutions-it/mapfish-print/), that is a fork of [MapPhish print (version 2)](http://www.mapfish.org/doc/print/), with some additional functionalities you can find in the [Wiki page](https://github.com/geosolutions-it/mapfish-print/).

!!! note:
    The module was originally written for GeoServer, so on the Github wiki you can find information about downloading and installing it in GeoServer, but if you include the engine directly in MapStore you don't need any other installation.

### MapStore

The MapStore print module on the front-end is implemented by the `Print` plugin inside `localConfig.json`. Make you sure to have this plugin in `plugins/(mode)` section. If so, this will will automatically check the presence of the back-end module and show the entry in the Burger Menu, if the back-end service is present.

In `localConfig.json` you will find also a `printUrl` configuration that refers to the (relative) URL where the main entry point of the application is available. (the default should enough)

### Print Settings

This fork uses the same configuration files of the original library to define the various print layouts and options.
This files is in the directory `resources/geoserver/print`, and they will be copied in `WEB-INF/classes` in the final `war` file.

* `config.yml`: The main file that configures the layout. More information about this configuration file in the [original documentaiton](http://www.mapfish.org/doc/print/configuration.html)
* `print_header.png`: The header, referred in `config.yml`
* `Arrow_north_CFCF.svg` the north indicator, referred in `config.yml`

## Troubleshooting

### I can not see the "Print" entry in the menu

Please check if:

* "Print" plugin is present in `localConfig.json --> plugins --> desktop`.
* You are using a desktop browser. The plugin is not designed for a mobile devices (tablet, smartphone...), for this reason it is not included in `plugins --> mobile`
* The service at url `http(s)://<your-domain>/<applciation-base-paath>/pdf/info.json` is responding. Example: `https://example.com/mapstore/pdf/info.json`. The URL of this `info.json` is configured (by default as relative URL) in `localConfig.json` --> `printUrl` entry.
* Looking at the JSON returned by the request above, the URLs in the entries `printURL` and `createURL` are reachable, and the domain, (the port) and the schema (http/https) of these URLs are the same of MapStore.

### I have an error printing (using Reverse Proxy/HTTPS)

When you open MapStore from the browser, MapStore do a request to the main entry point (`info.json`) of the printing module. This entry point provides a set of URLs where to find all the print related services. These URLs are generated starting from the current request.

A common practice is to use a reverse proxy in front of a Java Application Server, and so MapStore (this is used also to add https, if the reverse proxy is part of a web server). If this reverse proxy is not properly configured anyway, MapStore will not be able to correctly generate the URLs of the printing services, and this may cause an error when you try to print a PDF.

To avoid this problem, you can use several solution, depending on your setup and your reverse proxy.

#### Setting up your proxy

Some typical solutions are:

* Using AJP instead of http (this forwards all the information by default)

```conf
# Example for Apache HTTP server
ProxyPass        /mapstore   ajp://localhost:8010/mapstore
ProxyPassReverse /mapstore   ajp://localhost:8010/mapstore
```

* Using rewrite engine to rewrite the requests. (apache web server)

```conf
# example for Apache HTTP server
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI}
RedirectMatch ^/$ /mapstore/
ProxyRequests Off
ProxyPreserveHost On
ProxyVia full
```

* Using non-standard headers, `X-Forwarded-Host` and `X-Forwarded-Proto`.

```conf
# example for nginx
proxy_set_header X-Forwarded-Proto https;
```

#### Forcing PRINT_BASE_URL of printing module

If, for any reason, you can not modify the proxy configuration, MapStore printing module provides a system variable `PRINT_BASE_URL` that you can set to force the URLs returned by `info.json` to be resolved from it.

A useful trick can be to set as a relative URL (relative to MapStore) to make it work in any context (only for MapStore).

```bash
JAVA_OPTS= "$JAVA_OPTS -DPRINT_BASE_URL=pdf"
```

or you can use the absolute URL:

```bash
JAVA_OPTS= "$JAVA_OPTS -DPRINT_BASE_URL=https://example.com/mapstore/pdf"
```
