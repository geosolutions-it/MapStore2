# Requirements

In this section you can have a glance of the minimum and recommended versions of the tools needed to build/debug/install MapStore

## War Installation

You can download a java web container like *Apache Tomcat* from and *Java JRE*

| Tool   | Link                                               | Minimum          | Recommended | Maximum |
|--------|----------------------------------------------------|------------------|-------------|---------|
| Java   | [link](https://jdk.java.net/archive/)              | 17<sup>1</sup>   | 17          | 21      |
| Tomcat | [link](https://tomcat.apache.org/download-10.cgi)  | 10.1<sup>2</sup> | 10.1        | 11      |

## Debug / Build

These tools needs to be installed (other than **Java** in versions above above):

| Tool                  | Link                                                       | Minimum | Recommended | Maximum         |
|-----------------------|------------------------------------------------------------|---------|-------------|-----------------|
| npm                   | [link](https://www.npmjs.com/get-npm)                      | 8       | 10          |                 |
| NodeJS                | [link](https://nodejs.org/en/)                             | 20      | 20          | 24<sup>3</sup>  |
| Java (JDK)            | [link](https://jdk.java.net/archive/) | 17      | 17          | 21              |
| Maven                 | [link](https://maven.apache.org/download.cgi)              | 3.1.0   | 3.6         |                 |
| python<sup>4</sup>    | [link](https://www.python.org/downloads/)                  | 2.7.9   | 3.7         |                 |

!!! notes
    Here some notes about some requirements and reasons for max version indicated, for future improvements and maintenance :

    - <sup>1</sup> Java 17 is the minimum version required since the upgrade to Spring 7 (see the [migration guidelines](mapstore-migration-guide.md)). Previous versions of MapStore could run on Java 8/11.
    - <sup>2</sup> Since the upgrade to Spring 7 / Jakarta EE 10, MapStore requires a servlet container supporting the Jakarta Servlet API 6.0 (`jakarta.*` namespace): Tomcat 10.1 is the reference target, and the binary distribution ships Tomcat 11. Tomcat 9 or older (based on the `javax.*` namespace) is **not** supported anymore.
    - <sup>3</sup> Latest version tested.
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
| Postgres | [link](https://www.postgresql.org/)                | 13      | 17          | 18         |

!!! tip
    If you need to configure the database connection (and other settings) for a production deployment, it is recommended to use the [externalized configuration](externalized-configuration.md) (`-Ddatadir.location=`) instead of setting only the database override file. This allows you to manage all MapStore configuration files (database, proxy, JSON configs, etc.) in a single external directory that persists across updates.
