MapStore 2
==========
MapStore 2 is a framework to build *web mapping* applications using standard mapping libraries, such as OpenLayers 3 and Leaflet.

MapStore 2 has several example applications: 
 * MapViewer is a simple viewer of preconfigured maps (optionally stored in a database using GeoStore)
 * MapPublisher has been developed to create, save and share in a simple and intuitive way maps and mashups created selecting contents by server like OpenStreetMap, Google Maps, MapQuest or specific servers provided by your organization or third party. 

MapStore 2 is based on OpenLayers 3, Leaflet and ReactJS, and is licensed under the GPLv3 license.

Quick Start:
------------

Clone the repository with --the recursive option to automatically clone submodules:

`git clone --recursive https://github.com/geosolutions-it/MapStore2.git`

Install NodeJS, if needed, from [here](https://nodejs.org/).

Start the demo locally:

`npm install`
`npm start`

Install latest Maven, if needed, from [here](https://maven.apache.org/download.cgi) (version 3.1.0 is required).

Build the deployable war:

`./build.sh`

Deploy the generated mapstore.war file (in web/target) to your favourite J2EE container (e.g. Tomcat).
