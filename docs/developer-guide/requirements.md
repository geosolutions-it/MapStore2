# Requirements

In this section you can have a glance of the minimum and recommended versions of the tools needed to build/debug/install MapStore

## War Installation

You can download a java web container like *Apache Tomcat* from and *Java JRE*

| Tool   | Link                                               | Minimum | Recommended | Maximum       |
|--------|----------------------------------------------------|---------|-------------|---------------|
| Java   | [link](https://www.java.com/it/download/)          | 8<sup>1</sup>       | 11           | 11<sup>2</sup>           |
| Tomcat | [link](https://tomcat.apache.org/download-80.cgi)  | 8.5     | 9           | 9<sup>2</sup>            |

## Debug / Build

These tools needs to be installed (other than **Java** in versions above above):

| Tool                  | Link                                                       | Minimum | Recommended | Maximum             |
|-----------------------|------------------------------------------------------------|---------|-------------|---------------------|
| npm                   | [link](https://www.npmjs.com/get-npm)                      | 8       | 8           | 8.19.4<sup>3</sup>  |
| NodeJS                | [link](https://nodejs.org/en/)                             | 16      | 16          | 16.20.1<sup>3</sup> |
| Java (JDK)            | [link](https://www.java.com/en/download/help/develop.html) | 8       | 9           | 11<sup>2</sup>      |
| Maven                 | [link](https://maven.apache.org/download.cgi)              | 3.1.0   | 3.6         |                     |
| python<sup>4</sup>    | [link](https://www.python.org/downloads/)                  | 2.7.9   | 3.7         |                     |

!!! notes
    Here some notes about some requirements and reasons for max version indicated, for future improvements and maintenance :

    - <sup>1</sup> Java 8 is the minimum version required for running MapStore, but it is not compatible in case you want to use the print module. In this case, you need to use Java 11.
    - <sup>2</sup> About Java and Tomcat maximum versions:
        - For execution, MapStore is well tested on Java v11.
        - Build with success with v11, only smoke tests passing on v13, errors with v16.(Details on issue [#6935](https://github.com/geosolutions-it/MapStore2/issues/6935))
        - Running with Tomcat 10 causes this issue [#7524](https://github.com/geosolutions-it/MapStore2/issues/7524).
    - <sup>3</sup> About NodeJS and NPM:
        - **note** node 14.18.1 / npm 6.14.15 causes [this issue](https://github.com/geosolutions-it/mapstore-project/issues/18) on MapStore project system.
        - Node 18 causes [webpack issue](https://stackoverflow.com/questions/69394632/webpack-build-failing-with-err-ossl-evp-unsupported) needs to be solved by changing the hash algorithm or setting proper flags.
        - *If you are using Node >= 12 you can remove the -max_old_space_size=2048 config for the `compile` script*
    - <sup>4</sup> Python is only needed for building documentation.

## Running in Production

### System requirements

| Resource  | Minimum | Recommended |
|-----------|---------|-------------|
| Processor | 2 Core  | 2 Core      |
| Memory    | 2 GB    | 4 GB        |

### Database

In production a PostgreSQL database is recommended:

| Tool     | Link                                               | Minimum | Recommended | Maximum    |
|----------|----------------------------------------------------|---------|-------------|------------|
| Postgres | [link](https://www.postgresql.org/)                | 9.6     | 13          | 13         |
