# Developing with MapStore

Due to the dual nature of the project (Java backend and JavaScript frontend) building and developing using the MapStore 2 framework requires two distinct set of tools
 * [Apache Maven](https://maven.apache.org/) for Java
 * [NPM](https://www.npmjs.com/) for JavaScript.

A basic knowledge of both tools is required.

# Developing and debugging the framework
To start developing the MapStore 2 framework you have to:
 * download developer tools and frontend dependencies locally:

`npm install`

After a while (depending on the network bandwidth) the full set of dependencies and tools will be downloaded to the **node_modules** subfolder.

 * start a development instance of the framework and example applications:

`npm run examples`

 * or you can start a development instance **without the examples**:

`npm start`

Then point your preferred browser to [http://localhost:8081](http://localhost:8081).

The HomePage contains links to the available demo applications.


## Frontend debugging
The development instance uses file watching and live reload, so each time a MapStore 2 file is changed, the browser will reload the updated application.

Use your favourite editor / IDE to develop and debug on the browser as needed.

We suggest to use one of the following:

 * [Atom](https://atom.io/) with the following plugins:
   - editorconfig
   - linter
   - linter-eslint
   - react
   - lcovinfo
   - minimap & minimap-highlight-selected
   - highlight-line & highlight-selected
 * [Sublime Text Editor](http://www.sublimetext.com/) with the following plugins:
   - Babel
   - Babel snippets
   - Emmet

### Redux Dev Tools
When you are running the application locally using `npm start` you can debug the application with [redux dev tools](https://github.com/gaearon/redux-devtools) using the flag ?debug=true
```
http://localhost:8081/?debug=true#/?_k=c51bb5
```
It also integrates with the [browser's extension](https://github.com/zalmoxisus/redux-devtools-extension), if installed.

This way you can monitor the application's state evolution and the action triggered by your application.

## Backend services debugging

By default `npm start` runs a dev server connected to the mapstore 2 online demo as back-end.

If you want to use your own local test back-end you have to:
1. run `mvn jetty:run` - it makes run the mapstore back-end locally (port 8080), ìn memory db - By default 2 users
  - `admin` password `admin`
  - `user` with password `user`

2. Setup client to use the local back-end, apply this changes to webpack.config.js (at the devServer configuration)
```Javascript
devServer: {
    proxy: {
        '/mapstore/rest/': {
            target: "http://localhost:8080",
            pathRewrite: {'/mapstore/rest/': '/rest/'}
        },
        '/mapstore/proxy': {
            target: "http://localhost:8080",
            pathRewrite: {'/mapstore/proxy': '/proxy'}
        },
        '/docs': {
            target: "http://localhost:8081",
            pathRewrite: {'/docs': '/mapstore/docs'}
        }
    }
},
```
3. You have to run npm start to run mapstore client on port 8081, that is now connected to the local test back-end

You can even run geostore and http-proxy separately and debug them with your own IDE. See the documentation about them in their own repositories.

## Frontend testing
To run the MapStore 2 frontend test suite you can use:

`npm test`

You can also have a continuously running watching test runner, that will execute the complete suite each time a file is changed, launching:

`npm run continuoustest`

To run ESLint checks launch:

`npm run lint`

To run the same tests Travis will check (before a pull request):
`npm run travis`

More information on frontend building tools and configuration is available [here](frontend-building-tools-and-configuration)
