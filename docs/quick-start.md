# Quick Start

You can either choose to download a standalone binary package, a WAR file, or use Docker to quickly start playing with MapStore.

## Local Setup

This section covers how to get MapStore running on your local machine for testing and development.

### Binary package

The easiest way to try out MapStore is to download and extract the binary package available on MapStore [release page](https://github.com/geosolutions-it/MapStore2/releases/latest).
Here you can find some preconfigured maps as well users and groups.
The goal for this package is to ease all the requirements needed for you to take MapStore for a test-drive.

Go to the location where you saved the zip file, unzip the contents and run:

Windows: `mapstore2_startup.bat`

Linux: `./mapstore2_startup.sh`

Point your browser to: [http://localhost:8080/mapstore](http://localhost:8080/mapstore)

To stop MapStore simply do:

Windows: `mapstore2_shutdown.bat`

Linux: `./mapstore2_shutdown.sh`

#### Package Contents

* [MapStore](https://github.com/geosolutions-it/MapStore2/releases/latest)
* [Tomcat](https://tomcat.apache.org/download-90.cgi)
* [Java JDK](https://jdk.java.net/archive/)

### WAR file

Download the WAR file from the latest release [here](https://github.com/geosolutions-it/MapStore2/releases/latest).

[All the releases](https://github.com/geosolutions-it/MapStore2/releases)

After downloading the MapStore war file, install it in your java web container (e.g. Tomcat), with usual procedures for the container (normally you only need to copy the war file in the webapps subfolder).

If you don't have a java web container you can download [Apache Tomcat](https://tomcat.apache.org/download-90.cgi) and install it. You will also need a [Java JDK](https://jdk.java.net/archive/). Check the [Requirements](developer-guide/requirements.md#war-installation) page for supported versions.

Then you can access MapStore using the following URL (assuming the web container is on the standard 8080 port):

[http://localhost:8080/mapstore](http://localhost:8080/mapstore)

### Docker (standalone)

Pull the latest image from Docker Hub:

```sh
docker pull geosolutionsit/mapstore2
docker run --name mapstore -p 8080:8080  geosolutionsit/mapstore2
```

Then you can access MapStore at: [http://localhost:8080/mapstore](http://localhost:8080/mapstore)

#### Build your own image

If you need to customize MapStore (e.g., use your own build or custom plugins), you can build an image using the root [Dockerfile](https://github.com/geosolutions-it/MapStore2/blob/master/Dockerfile) in the MapStore2 repository instead of relying on the prebuilt image.

The `Dockerfile` supports the build-time argument `MAPSTORE_WEBAPP_SRC`, which specifies either the URL or the local path of an already-built WAR file to include in the image.

```shell
docker build \
  --build-arg MAPSTORE_WEBAPP_SRC=<YOUR_WAR_FILE> \
  -t <YOUR_IMAGE_TAG> \
  .
```

### Default credentials

Use the default credentials (**admin** / **admin**) to login and start creating your maps!

## Production Deployment

This section covers how to deploy MapStore on a server with your own domain (e.g. `example.com`).

The provided `docker-compose.yml` sets up a full production stack with:

* **PostgreSQL/PostGIS** — persistent database for maps, users and configuration
* **MapStore** — the application container
* **Nginx** — reverse proxy handling external traffic on port 80

### Prerequisites

* A server with [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) installed
* A domain name (e.g. `example.com`) with DNS pointing to your server's IP address

### Deploy with docker-compose

1. Clone the repository on your server:

    ```sh
    git clone https://github.com/geosolutions-it/MapStore2
    cd MapStore2
    ```

2. Update the database password in `docker-compose.yml`:

    ```yaml
    environment:
      POSTGRES_PASSWORD: <your-secure-password>
    ```

3. Update the Nginx server name in `docker/mapstore.conf` to match your domain:

    ```nginx
    server_name example.com;
    ```

4. Start the stack:

    ```sh
    docker-compose up -d
    ```

5. Access MapStore at your domain: `http://example.com/mapstore`

!!! note
    Due to proxy binding on host port 80, you may need to run docker-compose as root.

!!! note
    To test a different release of MapStore, change the `MAPSTORE_WEBAPP_SRC` build argument in the `docker-compose.yml` file.

### Adding SSL/TLS with Let's Encrypt

To serve MapStore over HTTPS, you can use [Certbot](https://certbot.eff.org/) to obtain a free SSL certificate from Let's Encrypt.

1. Install Certbot on your server:

    ```sh
    sudo apt-get install certbot
    ```

2. Obtain a certificate:

    ```sh
    sudo certbot certonly --standalone -d example.com
    ```

3. Update `docker/mapstore.conf` to enable HTTPS:

    ```nginx
    server {
        server_name example.com;

        listen 443 ssl;
        ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

        # ... rest of the configuration
    }

    server {
        listen 80;
        server_name example.com;
        return 301 https://$host$request_uri;
    }
    ```

4. Mount the certificates in `docker-compose.yml` under the proxy service:

    ```yaml
    proxy:
      volumes:
        - ./docker/mapstore.conf:/etc/nginx/conf.d/default.conf:rw
        - /etc/letsencrypt:/etc/letsencrypt:ro
      ports:
        - 80:80
        - 443:443
    ```

5. Restart the stack:

    ```sh
    docker-compose down && docker-compose up -d
    ```

Your MapStore instance will now be available at `https://example.com/mapstore`.

### Managing the stack

* Stop the environment:

    ```shell
    docker-compose down
    ```

* Clean the full environment (removes containers, images and volumes):

    ```shell
    docker-compose down --remove-orphans --rmi all -v
    ```
