# GeoStore

GeoStore is an open source Java enterprise application for storing, searching and retrieving data on the fly. In MapStore it is the backend that stores maps, dashboards, stories and the other resources, and manages users, groups and permissions.

GeoStore performs authentication internally (the auth framework is pluggable), and internal authorization rules grant permissions on single Resources or whole Categories.

A comprehensive [REST API](https://github.com/geosolutions-it/geostore/wiki/REST-API) allows an easy handling of internal resources, so that client side applications can easily query the store, while remote server side applications can integrate with GeoStore using the GeoStoreClient, a utility Java class that hides the REST communication complexities.

GeoStore used to live in its own repository, [geosolutions-it/geostore](https://github.com/geosolutions-it/geostore), which keeps its history and the maintenance branches of the releases before MapStore 2027.01.00. It is now part of MapStore, and built, versioned and released with it.

## Documentation

For more information check the [GeoStore wiki](https://github.com/geosolutions-it/geostore/wiki/Documentation-index).

## Build

GeoStore is a module of MapStore's Maven reactor: dependency versions are managed in MapStore's root `pom.xml`. From the root of the MapStore repository:

```bash
# the whole backend, GeoStore included
mvn clean install -f backend/pom.xml

# GeoStore only (its parent poms are taken from the repository itself)
mvn clean install -f backend/geostore/pom.xml
```

Database profiles of the webapp (`backend/geostore/src/web/app`): `postgres`, `oracle` and `h2_disk` add the driver and the matching `geostore-datasource-ovr.properties`; `auditing` adds the auditing module. The published `geostore-webapp` is built with `-Ppostgres`.

The PMD and SpotBugs checks run by default and use the rules in `qa/`; disable them with `-Dqa=false`. The REST integration tests run in MapStore's `GeoStore integration tests` workflow.

## License

GeoStore is free and Open Source software, released under the [GPL v3](https://www.gnu.org/licenses/gpl-3.0.html) license (see [LICENSE.txt](LICENSE.txt)). Note that the rest of MapStore is released under the BSD 2-Clause license.

## Professional Support

GeoStore is developed by [GeoSolutions](https://www.geosolutionsgroup.com/), hence you can talk to us for professional support. Anyway the project is a real Open Source project hence you can contribute to it, through the [MapStore repository](https://github.com/geosolutions-it/MapStore2).
