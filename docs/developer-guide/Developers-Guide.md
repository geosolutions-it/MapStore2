# Quick Start:

Clone the repository with the --recursive option to automatically clone submodules:

`git clone --recursive https://github.com/geosolutions-it/MapStore2.git`

Install NodeJS 0.12 , if needed, from [here](https://nodejs.org/en/download/releases/).

Start the demo locally:

`npm cache clean` (this is useful to prevent errors on Windows during install)

`npm install`

`npm start`

Then point your preferred browser to [http://localhost:8081](http://localhost:8081).

Install latest Maven, if needed, from [here](https://maven.apache.org/download.cgi) (version 3.1.0 is required).

Build the deployable war:

`./build.sh`

Deploy the generated mapstore.war file (in web/target) to your favourite J2EE container (e.g. Tomcat).

# Developers documentation
 * [Infrastructure](https://github.com/geosolutions-it/MapStore2/blob/master/docs/developer-guide/Infrastructure-and-general-architecture)
 * [Building and developing](https://github.com/geosolutions-it/MapStore2/blob/master/docs/developer-guide/Building-and-developing)
 * [Frontend building tools and configuration](https://github.com/geosolutions-it/MapStore2/blob/master/docs/developer-guide/Frontend-building-tools-and-configuration)
 * [Developing with MapStore 2](https://github.com/geosolutions-it/MapStore2/blob/master/docs/developer-guide/Developing-with-MapStore-2)
 * [ReactJS and Redux introduction](https://github.com/geosolutions-it/MapStore2/blob/master/docs/developer-guide/ReactJS-and-Redux-introduction)
 * [ReactJS 0.14.x](https://github.com/geosolutions-it/MapStore2/blob/master/docs/developer-guide/React-0.14.x-Migration-Guide)
 * [Maps configuration](https://github.com/geosolutions-it/MapStore2/blob/master/docs/developer-guide/Maps-configuration)
 * [Plugins architecture](https://github.com/geosolutions-it/MapStore2/blob/master/docs/developer-guide/Plugins-architecture)
 * [How to use a CDN](https://github.com/geosolutions-it/MapStore2/blob/master/docs/developer-guide/How-to-use-a-CDN)
