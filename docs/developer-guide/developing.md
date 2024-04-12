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
Optionally you can set the data dir location by setting the environment variable `MAPSTORE_DATA_DIR`.

For Linux:

```sh
export MAPSTORE_BACKEND_PORT=8082 # set a different backend port
export MAPSTORE_DATA_DIR=/usr/datadir # set the datadir location
npm start # or npm run be:start
```

For Windows:

```bat
set MAPSTORE_BACKEND_PORT=8082 
set MAPSTORE_DATA_DIR=C:/Users/user/datadir
npm start # or npm run be:start
```

!!! note
    When the data directory is set using `npm start`, the `/configs` folder used by the dev server is anyway the one in `web/client/configs`. If you want to use the configuration override functionalities of the data directory of MapStore, you have to edit the `devServer.js` to proxy also the `/configs` directory and use the remote service running by the backend. Noticed that in this case the configuration files in `web/client/configs` will not be used anymore.
    Here a sample of the config to add to `devServer.js`.

    ```js
    '/configs': {
        target: MAPSTORE_BACKEND_URL,
        secure: false,
        headers: {
            host: domain
        }
    },
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

##### Embedded tomcat properties

The command `npm run be:start` internally runs the maven command `mvn cargo:run` with some properties set.
You can customize the properties by passing them as arguments to the command.

```bash
npm run be:start -- <java-properties>
```

The java properties are passed to the maven command as `-D<property-name>=<property-value>`.

For example:

```bash
npm run be:start -- -Dsecurity.integration=ldap-direct -Ddatadir.location=/usr/datadir -Dbackend.debug.args="-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=8000"
```

Here the list of the properties that you can set:

* `datadir.location` : the location of the data directory. This can be set also as environment variable `MAPSTORE_DATA_DIR`.
* `backend.debug.args` : the arguments to pass to the JVM for debugging. If you want to enable remote debugging, you can set this property to `-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=8000`
* `security.integration` : the security integration to use. Possible values are `default`, `keycloak-direct`

#### Local tomcat instance

If you prefer, or if you have some problems with `mvn cargo:run`, you can run MapStore backend in a tomcat instance instead of using the embedded one.
To do so, you can :

* download a tomcat standalone [here](https://mapstore.readthedocs.io/en/latest/developer-guide/requirements/) and extract to a folder of your choice
* To generate a war file that will be deployed on your tomcat server, go to the root of the Mapstore project that was git cloned and run `./build.sh`. This might take some time but at the end a war file named `mapstore.war` will be generated into the `product/target` folder.
* Copy the `mapstore.war` and then head back to your tomcat folder. Look for a `webapps` folder and paste the `mapstore.war` file there.
* To start tomcat server, go to the terminal, `cd` into the root of your tomcat extracted folder and run `./bin/startup.sh` ( unix systems) or `./bin/startup.bat` (Windows). The server will start on port `8080` and Mapstore will be running at `http://localhost:8080/mapstore`. For development purposes we're only interested in the backend that was started on the tomcat server along with Mapstore.

Even in this case you can connect your frontend to point to this instance of MapStore.

### Debug

To run or debug the server side part of MapStore we suggest to run the backend in tomcat (embedded or installed) and connect in remote debugging to it.

### Enable Remote Debugging

for embedded tomcat you can run the following:

```bash
npm run be:start -- backend.debug.args"-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=8000"
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
