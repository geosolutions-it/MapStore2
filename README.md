# MapStore

![Build Checks](https://github.com/geosolutions-it/MapStore2/actions/workflows/CI.yml/badge.svg?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/geosolutions-it/MapStore2/badge.svg?branch=master)](https://coveralls.io/github/geosolutions-it/MapStore2?branch=master)
[![Master Documentation Status](https://readthedocs.org/projects/mapstore/badge/?version=latest)](https://docs.mapstore.geosolutionsgroup.com/en/latest/?badge=master)
[![Twitter URL](https://img.shields.io/twitter/url/https/twitter.com/fold_left.svg?style=social&label=Follow%20%40mapstore2)](https://twitter.com/mapstore2)

MapStore is an open-source web mapping framework that enables users to create, share, and embed maps and dashboards with ease, drawing from a broad range of geospatial data sources. Designed for flexibility and scalability, MapStore integrates seamlessly with **OpenLayers**, **Leaflet**, and **Cesium** for both **2D** and **3D** visualization, allowing users to explore maps in a dynamic, real-time environment.

With built-in support for **OGC** **standards** (such as **WMS**, **WMTS**, **WFS**, **3DTiles** and **CSW**), MapStore caters to the needs of professional GIS users while maintaining an intuitive interface for casual users. It supports rich feature configurations like layer styling, spatial analysis tools, and collaborative editing, making it a robust solution for diverse industries—from urban planning to environmental monitoring.

MapStore's architecture is designed for modularity and extensibility, allowing developers to integrate custom plugins or adapt it for specific use cases. Whether you need to create interactive maps for publication or sophisticated geospatial applications, MapStore2 provides a solid foundation for building powerful web mapping solutions.

For more information check the <a href="https://docs.mapstore.geosolutionsgroup.com/en/latest/" target="_blank">MapStore documentation!</a>

Also check out the MapStore project entry page available online at [mapstore.io](https://mapstore.io/)

## Documentation

You can find more documentation about how to build, install or develop with MapStore on the <a href="https://docs.mapstore.geosolutionsgroup.com/en/latest/" target="_blank">documentation site</a>.

## License

MapStore is Free and Open Source software, it is based on OpenLayers, Cesium, Leaflet and <a href="https://facebook.github.io/react/" target="_blank">ReactJS</a>, and is licensed under the Simplified BSD License.

## Demo Instances

We have the following instances:

1. a DEV instance, which can be accessed <a href="https://dev-mapstore.geosolutionsgroup.com/" target="_blank">here</a>, where all the changes are deployed once they are published on the Master branch of our repo
2. a QA instance, which can be accessed  <a href="https://qa-mapstore.geosolutionsgroup.com/" target="_blank">here</a>, that becomes active 1 week before any release, during the hardening phase, and deploys the release branch whenever a fix is pushed onto it.
3. a STABLE instance, which can be accessed <a href="https://mapstore.geosolutionsgroup.com/" target="_blank">here</a>, that gets deployed on demand after each release.

As a user you need to be aware of STABLE and DEV, QA is used internally before a release; for 1 Week it will diverge from STABLE as it is actually anticipating the next stable.
So, if you want to test latest features use DEV, if you are not that brave use STABLE. You might forget that QA exists unless you are parte of the developers team.

## Download

You can download the WAR file from the latest release [MapStore documentation!](https://docs.mapstore.geosolutionsgroup.com/en/latest/)

[All the releases](https://github.com/geosolutions-it/MapStore2/releases)

## Quick Start

There are two quick ways to test out MapStore. Either using <a href="https://www.docker.com/" target="_blank">Docker</a> (all tags are available in the [geosolutions dockerhub](https://hub.docker.com/r/geosolutionsit/mapstore2/tags?page=1&ordering=last_updated)) or a local java web container like <a href="http://tomcat.apache.org/" target="_blank">Apache Tomcat</a>

## Using Docker

### * Run Mapstore as standalone container

Pull the latest image from Docker Hub:

```sh
docker pull geosolutionsit/mapstore2
docker run --name mapstore -p 8080:8080  geosolutionsit/mapstore2
```

Then you can access MapStore using the following URL:

[http://localhost:8080/mapstore](http://localhost:8080/mapstore)

Use the default credentials (admin / admin) to login and start creating your maps!

### * Build your own image

If you need to customize MapStore (e.g., use your own build or custom plugins), you can build an image using the provided Dockerfile instead of relying on the prebuilt image.

The Dockerfile supports the build-time argument `MAPSTORE_WEBAPP_SRC`, which specifies either the URL or the local path of an already-built WAR file to include in the image.

```shell
docker build \
  --build-arg MAPSTORE_WEBAPP_SRC=<YOUR_WAR_FILE> \
  -t <YOUR_IMAGE_TAG> .
```

If this argument is not provided, the build will automatically detect the WAR file from either `./product/target` (standard MapStore) or `./web/target` (custom MapStore), depending on the project structure.

### * Run the Mapstore with PostGIS through docker-compose in the local environment

- To test a different release of MapStore, you should change the `MAPSTORE_WEBAPP_SRC` build argument in the docker-compose file.
- You should change the value of `POSTGRES_PASSWORD` for more security.
- Due to proxy binding on host port 80, you may need to run docker-compose as root.
- To spin up the environment run:

  ```sh
  docker-compose up -d
  ```

**Note**: Take in consideration due to the requirements of the deployment, you should update the docker-compose to the latest version.

---

- After the docker-compose finish, you can access to the site using following URL:

  [http://localhost/mapstore](http://localhost/mapstore)

- Use the default credentials (**admin** / **admin**) to login and start creating your maps!
- After finished the test you can stop the environment with the command:

    ```shell
    docker-compose down
    ```

- To clean the full environment:

    ```shell
    docker-compose down --remove-orphans --rmi all -v
    ```

## Using the Web Archive (WAR file)

After downloading the MapStore war file, install it in your java web container (e.g. Tomcat), with usual procedures for the container (normally you only need to copy the war file in the webapps subfolder).

Check out <a href="https://docs.mapstore.geosolutionsgroup.com/en/latest/developer-guide/requirements/" target="_blank">here</a> which version of Java and Tomcat are needed.

Then you can access MapStore using the following URL (assuming the web container is on the standard 8080 port):

[http://localhost:8080/mapstore](http://localhost:8080/mapstore)

Use the default credentials (admin / admin) to login and start creating your maps!

## Start developing your custom app

Clone the repository:

`git clone https://github.com/geosolutions-it/MapStore2.git`

Install NodeJS (with npm), Java and Maven following the requirements [here](https://docs.mapstore.geosolutionsgroup.com/en/latest/developer-guide/requirements/)

Install docma to build the documentation

`npm install -g docma`

Start the demo locally:

`npm cache clean` (this is useful to prevent errors on Windows during install)

`npm install`

`npm start`

The demo runs at [http://localhost:8081](http://localhost:8081) afterwards (with the Java back-end running at port `http://localhost:8080`).

Build the deployable war:

`./build.sh [version_identifier]`

Where `version_identifier` is an optional identifier of the generated war that will be shown in the settings panel of the application.

Deploy the generated `mapstore.war` file (in `product/target`) to your favorite J2EE container (e.g. Tomcat).

Read more on the <a href="https://docs.mapstore.geosolutionsgroup.com/en/latest/" target="_blank">documentation site</a>.

## Professional Support

MapStore is being developed by <a href="http://www.geosolutionsgroup.com/" target="_blank">GeoSolutions</a> hence you can talk to us for professional support. Anyway the project is a real Open Source project hence you can contribute to it (see section below).

## Communication

We currently have two mailing list:  <br>
<a href="https://groups.google.com/d/forum/mapstore-users" target="_blank">one</a> for users <br>
<a href="https://groups.google.com/d/forum/mapstore-developers" target="_blank">one</a> for developers.

The first one is for those who are willing to use MapStore and need help/directions, the latter is for those trying to extend/proposed fixes for MapStore.

## Contributing

We welcome contributions in any form:

- pull requests for new features
- pull requests for bug fixes
- pull requests for documentation
- funding for any combination of the above

For more information check [this](https://github.com/geosolutions-it/MapStore2/wiki/Contributing-to-MapStore) page.

## Who uses MapStore

Here below is a small list of organizations using MapStore either directly or through [GeoNode](https://geonode.org/). If you want us to add ( or remove 😟 ) your organization from this list, please, contact [simone.giannecchini@geosolutionsgroup.com](mailto:simone.giannecchini@geosolutionsgroup.com) .

- [City of Genova - Italy](https://mappe.comune.genova.it/MapStore2/#/)
- [City of Bozen - Italy](https://sit.comune.bolzano.it/mapstore2/#/)
- City of Florence - Italy
- City of Munich - Germany
- Rennes Metropole - France
- [CRAIG - France](https://ids.craig.fr/mapstore/#/)
- Compagnie Nationale du Rhone - France
- [Urban Brussles (BruGIS) - Belgium](https://gis.urban.brussels/brugis/#/)
- [Ruhr Regional Association](https://mapstore.geoportal.ruhr/#/)
- [Atlas Horizon 2020](http://www.atlas-horizon2020.eu/), this is based on GeoNode
- [Whanganui District Council - New Zealand](https://data.whanganui.govt.nz/mapstore2-whanganuidc/#/)
- [Otorohanga District Council - New Zealand](https://maps.otodc.govt.nz)
- [Wairoa District Council - New Zealand](https://maps.wairoadc.govt.nz/#/)
- [Cleveland Metroparks - USA](https://mapstore.cmparks.net/)
- [Moldova National GeoPortal](http://www.moldova-map.md/)
- [Region of Tuscany, Hydrologic Service - Italy](https://webgis.sir.toscana.it/mapstore/#/)
- Neftex Halliburton - UK
- Dhiantus - Sweden
- [LaMMa Consortium - Italy](https://geoportale.lamma.rete.toscana.it/difesa_suolo/#/)
- [Arno River Authority - Italy](https://geodata.appenninosettentrionale.it/mapstore/)
- [Austro Control - Austria](https://maps.austrocontrol.at/mapstore/)
- Earth-i - UK
- MapStand - UK
- [County of Milan - Italy](https://inlineainfrastrutture.cittametropolitana.mi.it/mapstore)
- [Nordeste Municipality - Portugal](https://sigweb.cmnordeste.pt/mapstore/#/)
- [Corvo Muncipality - Portugal](https://geocorvo.pt/mapstore/#/)
- [Lajes das Flores Municipality - Portal](https://sigweb.cmlajesdasflores.pt/#/)
