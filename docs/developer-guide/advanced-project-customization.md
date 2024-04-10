# Configure multiple installations of a single project

The MapStore2 [externalized configuration](https://docs.mapstore.geosolutionsgroup.com/en/latest/developer-guide/externalized-configuration/) allows for setting up multiple installations withing a single project. These installations may fulfill needs such as:

* Having different use case scenarios within a single platform.
* Providing different services, based on the same framework.
* Fulfilling third-party customer requirements.

This guideline assumes familiarity with the following sections of the documentation, so please read these first if you haven't done so already:

* [MapStore projects](https://docs.mapstore.geosolutionsgroup.com/en/latest/developer-guide/mapstore-projects/)
* [Working with extensions](https://docs.mapstore.geosolutionsgroup.com/en/latest/developer-guide/extensions/)
* [Externalized configuration](https://docs.mapstore.geosolutionsgroup.com/en/latest/developer-guide/externalized-configuration/)

## Basic setup requirements

First you need to [create you project](https://docs.mapstore.geosolutionsgroup.com/en/latest/developer-guide/project-creation-script/) following the steps outlined in the linked section.

Then you need to create the `datadir` folder inside root. **To use the contents of the datadir you need to set the JVM system property `datadir.location`**, like in the example below:

> java -Ddatadir.location=/etc/mapstore/datadir

This command will make the contents of the datadir available for the application **in runtime**. For further details on setting up and usage of the `datadir`, refer to the section [using a data directory](https://docs.mapstore.geosolutionsgroup.com/en/latest/developer-guide/externalized-configuration/#using-a-data-directory).

Alternatively, for development purposes only, you can set the same property by modifying the `web/pom.xml` file inside your custom project.

Find the entry for `cargo-maven3-plugin` and add the `systemProperties` tag within the `container` tag, so that your configuration looks like this:

```xml
        <plugin>
            <groupId>org.codehaus.cargo</groupId>
            <artifactId>cargo-maven3-plugin</artifactId>
            <configuration>
                <container>
                    <containerId>tomcat8x</containerId>
                    <systemProperties>
                        <datadir.location>[local_path_to_your_datadir]/datadir/[customInstallationFolder]</datadir.location>
                    </systemProperties>
                    <zipUrlInstaller>
                        <url>https://repo.maven.apache.org/maven2/org/apache/tomcat/tomcat/8.5.69/tomcat-8.5.69.zip</url>
                    </zipUrlInstaller>
                </container>
                <configuration>
                    <type>standalone</type>
                    <home>
                        ${project.build.directory}/apache-tomcat-${tomcat.version}
                    </home>
                    <properties>
                        <cargo.servlet.port>${tomcat.port}</cargo.servlet.port>
                        <cargo.logging>low</cargo.logging>
                    </properties>
                </configuration>
                <deployables>
                    <deployable>
                        <groupId>${project.groupId}</groupId>
                        <artifactId>${project.artifactId}</artifactId>
                        <type>war</type>
                        <properties>
                            <context>/mapstore</context>
                        </properties>
                    </deployable>
                </deployables>
            </configuration>
        </plugin>
```

In order to setup the multiple installations we can, for example, create three folders inside our `datadir`, denoting three different installations.

```text
├── datadir
    ├── customA
    ├── customB
    ├── customC
```

Please note that the only requirement regarding folder structure is that the `datadir` exists, any content inside is optional and can be structured freely.

As a final step, we will re-set the `datadir.location` system property outlined above to point to a specific installation, such that:

> java -Ddatadir.location=/etc/mapstore/datadir/customA

## Customize configuration, assets and translations

Inside our example installation folder `datadir/customA` we can include customizations pertinent to this instance only and excluded from the other two instances exemplified in the section above.

For the purpose of this guideline we will adhere to the following folder structure convention, as outlined [here](https://docs.mapstore.geosolutionsgroup.com/en/latest/developer-guide/externalized-configuration/#using-a-data-directory):

```text
├── customA
    ├── configs
    │   └── localConfig.json.patch
    └── extensions
        └── customizations
            ├── assets
            │   ├── css
            │   │   └── custom-style.css
            │   ├── img
            │   │   └── custom-logo.jpg
            │   │              
            │   └── js
                    └── customPlugin.js
            ├── index.js
            ├── index.js.LICENSE.txt
   
            ├── index.json
            └── translations
                ├── data.en-US.json
            │   ├── ...other translation files.
```

In the `customA/configs/localConfig.json.patch` file, we can patch the base configuration that is supplied by the `configs/localConfig.json` file inside root of the custom project, effectively customizing for this particular installation.

In alternative to `localConfig.json.patch`, that is applied server side, you can insert in the same directory `localConfig.patch.json` (noted the inverted suffix) in the same directory, and configure MapStore to use it by editing the `js/app.jsx` file.

```js
import { setLocalConfigurationFile} from '@mapstore/utils/ConfigUtils';
...

setLocalConfigurationFile(['configs/localConfig.json', 'configs/localConfig.patch.json']);
```

This alternative version  uses [`@mapstore/patcher`](https://github.com/geosolutions-it/Patcher) and allow perform more complex overrides, even if requires this change to be applied to the code, so it will not work with the standard product.

The patch file can serve as the central hub for these customizations (see example below), essentially linking the whole content of the custom datadir folder and allowing for:

* Adding custom plugins in the application.
* Replacing default MapStore plugins.
* Initializing and overriding default application state.
* Initializing default component state of a particular plugin.
* Linking to assets, such as images and fonts.
* Including specific translations and language support.

```JSON
[
  {
    "op": "replace",
    "path": "/initialState/defaultState/locales/supportedLocales",
    "value": {
      "en": {
        "code": "en-US",
        "description": "English"
      },
      "it": {
        "code": "it-IT",
        "description": "Italiano"
      }
    }
  },
  {
    "op": "replace",
    "path": "/translationsPath",
    "value": [
      "./MapStore2/web/client/translations",
      "./extensions/customizations/translations"
    ]
  },
  {
    "op": "replace",
    "path": "/initialState/defaultState/theme/selectedTheme/id",
    "value": "MyTheme"
  },
  {
    "op": "add",
    "path": "/plugins/desktop/-",
    "value": {
      "name": "Logo",
      "cfg": {
        "src": "./extensions/customizations/assets/img/custom-logo.jpg",
        "width": 100,
        "position": "topleft"
      }
    }
  }
]
```

In the example above the following modifications are made:

* Language support is changed to English and Italian only.
* Translation files for the language support are now read from a custom directory `./extensions/customizations/translations`, instead of the default one.
* A custom theme `MyTheme` is enabled for the whole application. For details see section below.
* A custom plugin `Logo` is added to the application, specifically the homepage, while being configured with the following props:
  * **src** - for the logo image, pointing to a location in our datadir where the image is located.
  * **width** and **position** - which are props used by the component internally.

## Theme customizations

Custom themes can be included in the project and applied only to a specific installation as well. Follow [this guideline](https://docs.mapstore.geosolutionsgroup.com/en/latest/developer-guide/customize-theme/#custom-theme-for-project) in order to create a custom theme.

Once you have the required folder structure and the necessary imports in `theme.less`, as well as the required changes in your `webpack.config.js`, do the following steps:

Check `configs/localConfig.json`, if you override the configuration, and look for `selectedTheme` property, it should be the following path.

> /initialState/defaultState/theme/selectedTheme

If it's not configured, add the following block to `initialState.defaultState`, where `id` points to the name of the default theme (you should include one).

```JSON
      "theme": {
        "selectedTheme": {
          "id": "default"
        }
      }
```

Inside the configuration patch file `datadir/[installationName]/configs/localConfig.patch.json`, modify the id we have previously set to point to the name of your custom theme, in the example below that would be `MyTheme`.

This change will effectively change the theme for that specific installation only.

```JSON
[
  {
    "op": "replace",
    "path": "/initialState/defaultState/theme/selectedTheme/id",
    "value": "MyTheme"
  }
]
```

Please note that the `themes/` folder has to be placed outside of the `datadir` folder, as stated in the linked guideline above.

The reason is that css / less files are assembled and packaged into a theme at build time, while the contents of the `datadir` folder are only available at runtime.
