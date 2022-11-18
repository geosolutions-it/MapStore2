# Developing with MapStore

Due to the dual nature of the project (Java backend and JavaScript frontend) building and developing using the MapStore framework requires two distinct set of tools

* [Apache Maven](https://maven.apache.org/) for Java
* [NPM](https://www.npmjs.com/) for JavaScript.

A basic knowledge of both tools is required.

## Start developing

To start developing the MapStore framework you have to:

* download developer tools and install frontend dependencies locally:

```sh
npm install
```

After a while (depending on the network bandwidth) the full set of dependencies and tools will be downloaded to the **node_modules** sub-folder.

* **start the local dev server** instances with:

```sh
npm start
```

Then point your preferred browser to [http://localhost:8081/?debug=true#/](http://localhost:8081/?debug=true#/). By default the frontend works using the local dev server as backend. This configuration is suggested if you want to develop.

!!! note
    `npm start` will run both front-end on port 8081 and back-end on port 8080 (make sure to have both the ports available).
    The first time back-end will take a lot to start, downloading all the dependencies.

If you still want to start only the frontend because you have the backend running in a tomcat container for example you may simply run

```sh
npm start
```

See the [dedicated section in this page](#backend) for more info

## Frontend

You can run only the front-end running `npm run fe:start`.
Running this script MapStore will run on port `8081` and will look for the back-end at port `8080`.

If you want to use an online instance of MapStore as backend, instead of the local one, you can define the environment variable `MAPSTORE_BACKEND_URL` to the desired URL.

```sh
export MAPSTORE_BACKEND_URL=https://dev-mapstore.geosolutionsgroup.com/mapstore
npm run fe:start # this command lunches only the front-end
```

!!! Note
    for more customizations on devServer you can edit the `build/devServer.js` file.

### Debugging

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

#### Redux Dev Tools

When you are running the application locally using `npm start` you can debug the application with [redux dev tools](https://github.com/gaearon/redux-devtools) using the flag ?debug=true

```url
http://localhost:8081/?debug=true#/
```

It also integrates with the [browser's extension](https://github.com/zalmoxisus/redux-devtools-extension), if installed.

This way you can monitor the application's state evolution and the action triggered by your application.

### Unit tests

To run the MapStore frontend test suite you can use:

```sh
npm test
```

You can also have a continuously running watching test runner, that will execute the complete suite each time a file is changed, launching:

```sh
npm run test:watch
```

Usually during the development you may need to execute less tests, when working on some specific files.

You can reduce the tests invoked in `npm run test:watch` execution by editing the file `tests.webpack.js` and modifying the directory (`/web`) and/or the regular expression that intercept the files to execute.

To run ESLint checks launch:

```sh
npm run lint
```

More information on frontend building tools and configuration is available [here](frontend-building-tools-and-configuration)

## Backend

In order to have a full running MapStore in development environment, you need to run also the backend java part locally.
This runs automatically with `npm start`. If you want to run only the backend, you can use `npm run be:start`.

The back end will run on port 8080 and will look for the front-end at port 8081. If you want to change the back-end port, you can set the environment variable `MAPSTORE_BACKEND_PORT` to the desired port.

```sh
export MAPSTORE_BACKEND_PORT=8082
npm start # or npm run be:start
```

### Defaults Users and Database

Running MapStore backend locally, on start-up you will find the following users:

* `admin`, with ADMIN role and password `admin`
* `user` with USER role with password `user`

You can login as `admin` to set-up new users and access to all the features reserved to `ADMIN` users.

The database used by default in this mode is H2 on disk. You can find the files of the database in the directory `webapps/mapstore/` starting from your execution context. Check how to set-up database in the dedicated section of the documentation.

### Running Backend

When we say "running the backend", in fact we say that we are running some sort of a whole instance of MapStore locally, that can be used as backend for your frontend dev server, or for debugging of the backend itself.

#### Embedded tomcat

MapStore is configured to use a maven plugin-in to build and run mapstore locally in tomcat. To use it you have to:

* `npm run be:start`

Now you are good to go, and you can start the frontend

Your local backend will now start at [http://localhost:8080/mapstore/](http://localhost:8080/mapstore/).
If you want to change the port you can edit the dedicated entry in `product/pom.xml`, just remember to change also the dev-server proxy configuration on the frontend in the same way.

#### Local tomcat instance

If you prefer, or if you have some problems with `mvn cargo:run`, you can run MapStore backend in a tomcat instance instead of using the embedded one.
To do so, you can :

* download a tomcat standalone [here](https://mapstore.readthedocs.io/en/latest/developer-guide/requirements/) and extract to a folder of your choice
* To generate a war file that will be deployed on your tomcat server, go to the root of the Mapstore project that was git cloned and run `./build.sh`. This might take some time but at the end a war file named `mapstore.war` will be generated into the `product/target` folder.
* Copy the `mapstore.war` and then head back to your tomcat folder. Look for a `webapps` folder and paste the `mapstore.war` file there.
* To start tomcat server, go to the terminal, `cd` into the root of your tomcat extracted folder and run `./bin/startup.sh` ( unix systems) or `./bin/startup.bat` (Windows). The server will start on port `8080` and Mapstore will be running at `http://localhost:8080/mapstore`. For development purposes we're only interested in the backend that was started on the tomcat server along with Mapstore.

Even in this case you can connect your frontend to point to this instance of MapStore.

### Debug

To run or debug the server side part of MapStore we suggest to run the backend in tomcat (embedded or installed) and connect in remote debugging to it. This guide explains how to do it with Eclipse. This procedure has been tested with Eclipse Luna.

### Enable Remote Debugging

for embedded tomcat you can configure the following:

```bash
# Linux
export MAVEN_OPTS="-Xdebug -Xnoagent -Djava.compiler=NONE -Xrunjdwp:transport=dt_socket,address=4000,server=y,suspend=n"
```

```bash
# Windows
set MAVEN_OPTS=-Xdebug -Xnoagent -Djava.compiler=NONE -Xrunjdwp:transport=dt_socket,address=4000,server=y,suspend=n
```

then start tomcat

```bash
npm start # or npm run start:app, or npm run be:start (this last only for the backend)
```

For your local tomcat, you can follow the standard procedure to debug with tomcat.

### Setup eclipse project

* Run eclipse plugin

```bash
mvn eclipse:eclipse
```

* Import the project in eclipse from **File --> Import**
* Then select Existing project into the Workspace
* Select root directory as MapStore root (to avoid eclipse to iterate over all node_modules directories looking for eclipse project)
* import all projects

### Start Debugging with eclipse

* Start Eclipse and open **Run --> Debug Configurations**
* Create a new Remote Java Application selecting the project "mapstore-product" setting:
  * host localhost
  * port 4000
  * Click on *Debug*
Remote debugging is now available.

> **NOTE** With some version of eclipse you will have to set `suspend=y` in mvn options to make it work. In this case
the server will wait for the debug connection at port 4000 (`address=4000`)
