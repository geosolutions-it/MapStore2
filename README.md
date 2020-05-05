[![Build Status](https://travis-ci.org/geosolutions-it/MapStore2.svg?branch=master)](https://travis-ci.org/geosolutions-it/MapStore2)
[![Coverage Status](https://coveralls.io/repos/github/geosolutions-it/MapStore2/badge.svg?branch=master)](https://coveralls.io/github/geosolutions-it/MapStore2?branch=master)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/1648d484427346e2877006dc287379b6)](https://app.codacy.com/app/geosolutions/MapStore2?utm_source=github.com&utm_medium=referral&utm_content=geosolutions-it/MapStore2&utm_campaign=badger)
[![Documentation Status](https://readthedocs.org/projects/mapstore2/badge/?version=latest)](https://mapstore.readthedocs.io/en/latest/?badge=latest)
[![Twitter URL](https://img.shields.io/twitter/url/https/twitter.com/fold_left.svg?style=social&label=Follow%20%40mapstore2)](https://twitter.com/mapstore2)

MapStore
========
MapStore is a framework to build *web mapping* applications using standard mapping libraries, such as <a href="http://openlayers.org/" target="_blank">OpenLayers</a> and <a href="http://leafletjs.com/" target="_blank">Leaflet</a>.

MapStore has several example applications:
 * MapViewer is a simple viewer of preconfigured maps (optionally stored in a database using GeoStore)
 * MapPublisher has been developed to create, save and share in a simple and intuitive way maps and mashups created selecting contents by server like OpenStreetMap, Google Maps, MapQuest or specific servers provided by your organization or third party.

For more information check the <a href="https://mapstore.readthedocs.io/en/latest/" target="_blank">MapStore documentation!</a>

Download
------------
You can download the WAR file from the latest release <a href="https://github.com/geosolutions-it/MapStore2/releases/latest" target="_blank">here</a>

<a href="https://github.com/geosolutions-it/MapStore2/releases" target="_blank">All the releases</a>

Quick Start
------------

There are two quick ways to test out MapStore. Either using <a href="https://www.docker.com/" target="_blank">Docker</a> or a local java web container like <a href="http://tomcat.apache.org/" target="_blank">Apache Tomcat</a>

### Using Docker

Pull the latest image from Docker Hub:

```
docker pull geosolutionsit/mapstore2
docker run --name mapstore -p8080:8080  geosolutionsit/mapstore2
```

Then you can access MapStore using the following URL:

<a href="http://localhost:8080/mapstore" target="_blank">http://localhost:8080/mapstore</a>


Use the default credentials (admin / admin) to login and start creating your maps!

### Using the Web Archive (WAR file)

After downloading the MapStore war file, install it in your java web container (e.g. Tomcat), with usual procedures for the container (normally you only need to copy the war file in the webapps subfolder).

Check out <a href="https://mapstore.readthedocs.io/en/latest/developer-guide/requirements/" target="_blank">here</a> which version of Java and Tomcat are needed.

Then you can access MapStore using the following URL (assuming the web container is on the standard 8080 port):

<a href="http://localhost:8080/mapstore" target="_blank">http://localhost:8080/mapstore</a>


Use the default credentials (admin / admin) to login and start creating your maps!

Documentation
-------------
You can find more documentation about how to build, install or develop with MapStore on the <a href="https://mapstore.readthedocs.io/en/latest/" target="_blank">documentation site</a>.

License
------------
MapStore is Free and Open Source software, it is based on OpenLayers, Leaflet and <a href="https://facebook.github.io/react/" target="_blank">ReactJS</a>, and is licensed under the Simplified BSD License.


Demo Instances
---------------
We have the following instances:

1. a DEV instance, which can be accessed <a href="http://dev.mapstore.geo-solutions.it" target="_blank">here</a>, where all the changes are deployed once they are published on the Master branch of our repo
2. a QA instance, which can be accessed  <a href="http://qa.mapstore.geo-solutions.it" target="_blank">here</a>, that becomes active 1 week before any release, during the hardening phase, and deploys the release branch whenever a fix is pushed onto it.
3. a STABLE instance, which can be accessed <a href="http://mapstore.geo-solutions.it" target="_blank">here</a>, that gets deployed on demand after each release.

As a user you need to be aware of STABLE and DEV, QA is used internally before a release; for 1 Week it will diverge from STABLE as it is actually anticipating the next stable.
So, if you want to test latest features use DEV, if you are not that brave use STABLE. You might forget that QA exists unless you are parte of the developers team.

Start developing your custom app
------------

Clone the repository:

`git clone https://github.com/geosolutions-it/MapStore2.git`

Install NodeJS and npm (npm it will come with NodeJS)

Checkout <a href="https://mapstore.readthedocs.io/en/latest/developer-guide/requirements/" target="_blank">here</a> what are the recommended versions of NodeJS and npm

Install docma to build the documentation

`npm install -g docma`

Start the demo locally:

`npm cache clean` (this is useful to prevent errors on Windows during install)

`npm install`

`npm start`

The demo runs at `http://localhost:8081` afterwards.

Install latest Maven, if needed, from <a href="https://maven.apache.org/download.cgi" target="_blank">here</a> (version 3.1.0 is required).

Build the deployable war:

`./build.sh [version_identifier]`

Where version_identifier is an optional identifier of the generated war that will be shown in the settings panel of the application.

Deploy the generated mapstore.war file (in web/target) to your favorite J2EE container (e.g. Tomcat).

Read more on the <a href="https://mapstore.readthedocs.io/en/latest/" target="_blank">documentation site</a>.

Professional Support
---------------------
MapStore is being developed by <a href="http://www.geo-solutions.it/" target="_blank">GeoSolutions</a> hence you can talk to us for professional support. Anyway the project is a real Open Source project hence you can contribute to it (see section below).

Communication
---------------------
We currently have two mailing list:  <br>
<a href="https://groups.google.com/d/forum/mapstore-users" target="_blank">one</a> for users <br>
<a href="https://groups.google.com/d/forum/mapstore-developers" target="_blank">one</a> for developers.

The first one is for those who are willing to use MapStore and need help/directions, the latter is for those trying to extend/proposed fixes for MapStore.


Contributing
---------------------
We welcome contributions in any form:

* pull requests for new features
* pull requests for bug fixes
* pull requests for documentation
* funding for any combination of the above

For more information check <a href="https://github.com/geosolutions-it/MapStore2/blob/master/CONTRIBUTING.md" target="_blank">this</a>page.
