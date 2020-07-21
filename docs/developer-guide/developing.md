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

* start a development instance of the framework and example applications:

`npm run examples`

* or you can start a development instance **without the examples**:

`npm start`

Then point your preferred browser to [http://localhost:8081](http://localhost:8081).

The HomePage contains links to the available demo applications.

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

By default `npm start` runs a dev server connected to the mapstore online demo as back-end.

### Using local backend

If you want to use your own local test back-end you have to:

* `cd web` directory
* run `mvn jetty:run-war` - it makes run the mapstore back-end locally (port 8080), ìn memory db - By default 2 users
  * `admin` password `admin`
  * `user` with password `user`

* Setup client to use the local back-end, apply this changes to `buildConfig.js` (at the devServer configuration)

```javascript
devServer: {
        proxy: {
            '/rest/': {
                target: "http://localhost:8080"
            },
            '/proxy': {
                target: "http://localhost:8080",
                secure: false
            },
            '/docs': { // this can be used when you run npm run doctest
                target: "http://localhost:8081",
                pathRewrite: { '/docs': '/mapstore/docs' }
            }
        }
    },
    // ...
```

* You have to run npm start to run mapstore client on port 8081, that is now connected to the local test back-end

### Running local backend in tomcat 
If you prefer, or if you have some problems with `mvn jetty:run-war`, you can run MapStore back-end in a tomcat instance instead of using Jetty. 
To do so, you can :
* download a tomcat standalone [here](https://mapstore.readthedocs.io/en/latest/developer-guide/requirements/) and extract to a folder of your choice
* To generate a war file that will be deployed on your tomcat server, go to the root of the Mapstore project that was git cloned and run `./build.sh`. This might take some time but at the end a war file named `mapstore.war` will be generated into the `web/target` folder.
* Copy the `mapstore.war` and then head back to your tomcat folder. Look for a `webapps` folder and paste the `mapstore.war` file there.
* To start tomcat server, go to the terminal, `cd` into the root of your tomcat extracted folder and run `./bin/startup.sh` ( unix systems) or `./bin/startup.bat` (Windows). The server will start on port `8080` and Mapstore will be running at `http://localhost:8080/mapstore`. For development purposes we're only interested in the backend that was started on the tomcat server along with Mapstore.
* To point our development server when we eventually start it using `npm start` we need to make the following change to `build/buildConfig.js`

```javascript
devServer: {
        proxy: {
            '/rest/': {
                target: "http://localhost:8080/mapstore"
            },
            '/proxy': {
                target: "http://localhost:8080/mapstore",
                secure: false
            },
            '/docs': { // this can be used when you run npm run doctest
                target: "http://localhost:8081",
                pathRewrite: { '/docs': '/mapstore/docs' }
            }
        }
    },
    // ...
```
* Finally, run the development server using `npm start`. The backend will now be pointed to the one tomcat is running.

You can even run geostore and http-proxy separately and debug them with your own IDE. See the documentation about them in their own repositories.

if you want to change the default port for mapstore back-end you have to edit `pom.xml` in the root of the project:

```xml
<!-- find the jetty-maven-plugin in pom.xml-->
<plugin>
    <groupId>org.eclipse.jetty</groupId>
    <artifactId>jetty-maven-plugin</artifactId>
    <version>9.2.11.v20150529</version>
    <configuration>
        <!-- add these lines -->
        <httpConnector>
            <port>9999</port> <!-- port 9999 or whatever you want -->
        </httpConnector>
        <!-- ^^ end of lines to add -->
        <systemProperties>
            <systemProperty>
                <name>log4j.configuration</name>
                <value>log4j-test.properties</value>
            </systemProperty>
        </systemProperties>
    </configuration>
</plugin>
```

## Debug backend using mvn and eclipse

To run or debug the server side part of MapStore we suggest to use jetty:run plugin.
This guide explains how to do it with Eclipse. This procedure is tested with Eclipse Luna.

### Simply Run the server side part

you can simply run the server side part using `mvn jetty:run` command. To run the server side part only, run:

```bash
mvn jetty:run -Pserveronly
```

This will skip the javascript building phase, you can now connect the webpack proxy to the server side proxy and debug client side part using:

```bash
npm start
```

### Enable Remote Debugging with jetty:run

Set the maven options as following :

```bash
# Linux
MAVEN_OPTS="-Xdebug -Xnoagent -Djava.compiler=NONE -Xrunjdwp:transport=dt_socket,address=4000,server=y,suspend=n"
```

```bash
# Windows
set MAVEN_OPTS=-Xdebug -Xnoagent -Djava.compiler=NONE -Xrunjdwp:transport=dt_socket,address=4000,server=y,suspend=n
```

then run jetty

```bash
mvn jetty:run -Pserveronly
```

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
