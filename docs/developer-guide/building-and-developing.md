# Building and developing

Due to the dual nature of the project (Java backend and JavaScript frontend) building and developing using the MapStore 2 framework requires two distinct set of tools
 * [Apache Maven](https://maven.apache.org/) for Java
 * [NPM](https://www.npmjs.com/) for JavaScript.

A basic knowledge of both tools is required.

# Developing and debugging the MapStore 2 framework
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

### Building the documentation

MapStore2 uses JSDoc to annotate the components, so the documentation can be automatically generated using [docma](http://onury.github.io/docma/).  
Please see http://usejsdoc.org/ for further information about code documentation.  

Refer to the existing files to follow the documentation style:

* [actions](https://github.com/geosolutions-it/MapStore2/blob/master/web/client/actions/controls.js)
* [reducers](https://github.com/geosolutions-it/MapStore2/blob/master/web/client/reducers/controls.js)
* [components](https://github.com/geosolutions-it/MapStore2/blob/master/web/client/components/buttons/FullScreenButton.jsx)
* [epics](https://github.com/geosolutions-it/MapStore2/blob/master/web/client/epics/fullscreen.js)
* [plugins](https://github.com/geosolutions-it/MapStore2/blob/master/web/client/plugins/Login.jsx)

To install docma:

`npm install -g docma`

While developing you can generate the documentation to be accessible in the local machine by:

`npm run doctest`

The resulting doc will be accessible from http://localhost:8081/mapstore/docs/

For the production deploy a different npm task must be used:

`npm run doc`

The documentation will be accessible from the */mapstore/docs/* path

The generated folders can be removed with:

`npm run cleandoc`

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

## Backend services debugging
TBD

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

# General building and deploying
Maven is the main tool for building and deploying a complete application. It takes care of:
 * building the java libraries and webapp(s)
 * calling NPM as needed to take care of the frontend builds
 * launching both backend and frontend test suites
 * creating the final war for deploy into a J2EE container (e.g. Tomcat)

To create the final war, you have several options:
 * full build, including submodules and frontend (e.g. GeoStore)

 `./build.sh [version_identifier]`

 Where version_identifier is an optional identifier of the generated war that will be shown in the settings panel of the application.

 * fast build (will use the last compiled version of submodules and compiled frontend)

`mvn clean install` -Dmapstore2.version=[version_identifier]

### Changelog generation

To generate the changelog for a specific release you can use [github_changelog_generator](https://github.com/skywinder/github-changelog-generator)  
The tool will overwrite the CHANGELOG.md file.

**Install (Ubuntu)**
```
sudo apt-get install ruby-dev
sudo gem install rake
sudo gem install github_changelog_generator
```

**Configure**
 * [Generate a github token](https://github.com/settings/tokens/new?description=GitHub%20Changelog%20Generator%20token) and place it in your .bashrc this:
```
 export CHANGELOG_GITHUB_TOKEN="«your-40-digit-github-token»"
```
as an alternative use --token

* cd to MapStore2
* edit `.github_changelog_generator` file :
   * set `since-tag ` (the first tag you want to exclude)
   * if you are creating the changelog before creating the tag set `future-release`=YYYY.NN.mm with the release tag

For example the `.github_changelog_generator` file for the changes between 2017.02.00 and 2017.03.00 release can look like the following:

    future-release=2017.03.00
    since-tag=2017.01.00

**Run**
```
github_changelog_generator
```

# Troubleshooting

## Autowatch doesn't work on Linux.
You should need to increase `max_user_watches` variable for inotify.
```
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
```
