# Quick Start

You can either choose to download a standalone binary package or a WAR file to quickly start playing with MapStore.

## Binary package
The easiest way to try out MapStore is to download and extract the binary package available on MapStore [release page](https://github.com/geosolutions-it/MapStore2/releases/latest).
Here you can find some preconfigured maps as well users and groups.
The goal for this package is to ease all the requirements needed for you to take MapStore for a test-drive.

We hope you enjoy MapStore!

## How to run
Go to the location where you saved the zip file, unzip the contents and run:

Windows: `mapstore2_startup.bat`

Linux: `./mapstore2_startup.sh`

Point your browser to: [http://localhost:8082/mapstore](http://localhost:8082/mapstore)

To stop MapStore simply do:

Windows: `mapstore2_shutdown.bat`

Linux: `./mapstore2_shutdown.sh`

## Package Contents
* [MapStore](https://github.com/geosolutions-it/MapStore2/releases/latest)
* [Tomcat7](http://tomcat.apache.org/)
* [Java JRE (Win and Linux)](https://www.oracle.com/technetwork/java/javase/downloads/index.html)

## Demo Maps
* **Aerial Imagery** - Simple map demo showing some aerial imagery data
* **WFS Query Map** - Demo map configured with MapStore built-in ability to query feature over WFS
* **User Map and User1 Map** - Map only visible to *user* and *user1* respectively, to demonstrate MapStore capabilities on user/group management and permissions.

## Demo accounts/groups
| **Users**       | **Groups**            |
|-----------------|-----------------------|
| **admin/admin** | MyGroupAdmin,everyone |
| guest           | everyone              |
| user/user       | everyone              |
| user1/user1     | everyone, MyGroup     |

## WAR file

Download the WAR file from the latest release [here](https://github.com/geosolutions-it/MapStore2/releases/latest).

[All the releases](https://github.com/geosolutions-it/MapStore2/releases)

After downloading the MapStore war file, install it in your java web container (e.g. Tomcat), with usual procedures for the container (normally you only need to copy the war file in the webapps subfolder).

If you don't have a java web container you can download Apache Tomcat from [here](https://tomcat.apache.org/download-70.cgi) and install it. You will also need a Java7 [JRE](https://www.oracle.com/technetwork/java/javase/downloads/jre7-downloads-1880261.html).

Then you can access MapStore using the following URL (assuming the web container is on the standard 8080 port):

[http://localhost:8080/mapstore](http://localhost:8080/mapstore)

Use the default credentials (admin / admin) to login and start creating your maps!
