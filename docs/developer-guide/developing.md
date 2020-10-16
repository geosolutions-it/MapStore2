# Developing with MapStore

Due to the dual nature of the project (Java backend and JavaScript frontend) building and developing using the MapStore framework requires two distinct set of tools

* [Apache Maven](https://maven.apache.org/) for Java
* [NPM](https://www.npmjs.com/) for JavaScript.

A basic knowledge of both tools is required.

## Frontend

To start developing the MapStore framework you have to:

* download developer tools and frontend dependencies locally:

`npm install`

After a while (depending on the network bandwidth) the full set of dependencies and tools will be downloaded to the **node_modules** sub-folder.

* start the development instance with:

`npm start`

Then point your preferred browser to [http://localhost:8081](http://localhost:8081). By default the front-end works using the online dev server as back-end. This configuration is useful for a quick startup, but is not the suggested configuration if you want to develop.
To learn how to connect the front-end dev server to a local back-end read the following instructions.

### Connect Front-end to local back-end

By default `npm start` uses the online dev server as a backend.
This configuration needs to be changed to develop locally in order to access all the functionalities.

To use a local back-end you have to:

* **Remove auth configuration dedicated to GeoServer** from `localConfig.json --> authenticationRules` (it provides the MapStore/GeoServer integration for dev-server, that is not present in your local back-end)

```diff
"authenticationRules": [{
        "urlPattern": ".*geostore.*",
        "method": "bearer"
      }, {
        "urlPattern": ".*rest/config.*",
        "method": "bearer"
-      },
-      {
-        "urlPattern": "http(s)?\\:\\/\\/gs-stable\\.geo-solutions\\.it\\/geoserver/.*",
-        "authkeyParamName": "authkey",
-       "method": "authkey"
    }],
```

* **Run the back-end locally**. See the [dedicated section in this page](#back-end)

* **Setup dev-server to use the local back-end**, applying this changes to `buildConfig.js` --> devServer configuration. (the configuration of the port and path depends on how you configured the local back-end.

```javascript
devServer: {
        proxy: {
            '/rest/': {
                target: "http://localhost:8080/mapstore" // port 8080, mapstore path
            },
            '/proxy': {
                target: "http://localhost:8080/mapstore", // port 8080, mapstore path
                secure: false
            }
        }
    },
    // ...
```

* **re-run** `npm start`

### Examples

`npm start` doesn't run the examples by default (for dev performance reasons). If you want to  run in dev mode the application with also the examples you can run, instead of `npm start` the following command:

```bash
npm run examples
```

This command will compile and run both mapstore and examples, with the same live editing functionalities of `npm start`.

### Debugging the frontend

The development instance uses file watching and live reload, so each time a MapStore file is changed, the browser will reload the updated application.

Use your favorite editor / IDE to develop and debug on the browser as needed.

We suggest to use one of the following:

* [Visual Studio Code](https://code.visualstudio.com/) with the following plugins:
  * [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) `dbaeumer.vscode-eslint`
  * [EditorConfig for VSCode](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig) `editorconfig.editorconfig`
* [Atom](https://atom.io/) with the following plugins:
  * editorconfig
  * linter
  * linter-eslint
  * react
  * lcovinfo
  * minimap & minimap-highlight-selected
  * highlight-line & highlight-selected
* [Sublime Text Editor](http://www.sublimetext.com/) with the following plugins:
  * Babel
  * Babel snippets
  * Emmet

### Redux Dev Tools

When you are running the application locally using `npm start` you can debug the application with [redux dev tools](https://github.com/gaearon/redux-devtools) using the flag ?debug=true

```url
http://localhost:8081/?debug=true#/
```

It also integrates with the [browser's extension](https://github.com/zalmoxisus/redux-devtools-extension), if installed.

This way you can monitor the application's state evolution and the action triggered by your application.

## Frontend unit tests

To run the MapStore frontend test suite you can use:

`npm test`

You can also have a continuously running watching test runner, that will execute the complete suite each time a file is changed, launching:

`npm run continuoustest`

To run ESLint checks launch:

`npm run lint`

To run the same tests Travis will check (before a pull request):
`npm run travis`

More information on frontend building tools and configuration is available [here](frontend-building-tools-and-configuration)

## Back-end

In order to have a full running MapStore in development environment, you need to run also the back-end java part locally. In this section you will find how to start the back-end and how to develop with it.

### Defaults Users and Database

Running MapStore back-end locally, on start-up you will find the following users:

* `admin`, with ADMIN role and password `admin`
* `user` with USER role with password `user`

You can login as `admin` to set-up new users and access to all the features reserved to `ADMIN` users.

The database used by default in this mode is H2 on disk. You can find the files of the database in the directory `webapps/mapstore/` starting from your execution context. Check how to set-up database in the dedicated section of the documentation.

### Running Back-end

When we say "running the back-end", in fact we say that we are running some sort of a whole instance of MapStore locally, that can be used as back-end for your front-end dev server, or for debugging of the back-end itself.

#### Embedded tomcat

MapStore is configured to use a tomcat maven plugin-in to build and run mapstore locally. To use it you have to:

* make sure to run at least once `mvn install` in the root directory, to make `mapstore-backend` artifact available.
* `cd web` directory
* run `mvn tomcat7:run-war`

Your local back-end will now start at [http://localhost:8080/mapstore/](http://localhost:8080/mapstore/).
If you want to change the port you can edit the dedicated entry in `web/pom.xml`, just remember to change also the dev-server proxy configuration on the front-end in the same way.

#### Local tomcat instance

If you prefer, or if you have some problems with `mvn tomcat7:run-war`, you can run MapStore back-end in a tomcat instance instead of using the embedded one.
To do so, you can :

* download a tomcat standalone [here](https://mapstore.readthedocs.io/en/latest/developer-guide/requirements/) and extract to a folder of your choice
* To generate a war file that will be deployed on your tomcat server, go to the root of the Mapstore project that was git cloned and run `./build.sh`. This might take some time but at the end a war file named `mapstore.war` will be generated into the `web/target` folder.
* Copy the `mapstore.war` and then head back to your tomcat folder. Look for a `webapps` folder and paste the `mapstore.war` file there.
* To start tomcat server, go to the terminal, `cd` into the root of your tomcat extracted folder and run `./bin/startup.sh` ( unix systems) or `./bin/startup.bat` (Windows). The server will start on port `8080` and Mapstore will be running at `http://localhost:8080/mapstore`. For development purposes we're only interested in the backend that was started on the tomcat server along with Mapstore.

Even in this case you can connect your front-end to point to this instance of MapStore.

### Debug

To run or debug the server side part of MapStore we suggest to run the back-end in tomcat (embedded or installed) and connect in remote debugging to it. This guide explains how to do it with Eclipse. This procedure has been tested with Eclipse Luna.

### Enable Remote Debugging

for embedded tomcat you can configure the following:

```bash
# Linux
MAVEN_OPTS="-Xdebug -Xnoagent -Djava.compiler=NONE -Xrunjdwp:transport=dt_socket,address=4000,server=y,suspend=n"
```

```bash
# Windows
set MAVEN_OPTS=-Xdebug -Xnoagent -Djava.compiler=NONE -Xrunjdwp:transport=dt_socket,address=4000,server=y,suspend=n
```

then start tomcat

```bash
mvn tomcat7:run-war
```

For your local tomcat, you can follow the standard procedure to debug with tomcat.

### Setup eclipse project

* Run eclipse plugin

```bash
mvn eclipse:eclipse
```

* Import the project in eclipse from **File --> Import**
* Then select Existing project into the Workspace
* Select root directory as "web" (to avoid eclipse to iterate over all node_modules directories looking for eclipse project)
* import the project

### Start Debugging with eclipse

* Start Eclipse and open **Run --> Debug Configurations**
* Create a new Remote Java Application selecting the project "mapstore-web" setting:
  * host localhost
  * port 4000
  * Click on *Debug*
Remote debugging is now available.

> **NOTE** With some version of eclipse you will have to set `suspend=y` in mvn options to make it work. In this case
the server will wait for the debug connection at port 4000 (`address=4000`)
