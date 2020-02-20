# Quick Setup and Run

Clone the repository:

```bash
git clone https://github.com/geosolutions-it/MapStore2.git
```

If needed, install NodeJS version >= 8 from [here](https://nodejs.org/en/download/releases/), then update npm to version >= 5, using:

```bash
npm install -g npm
```

Start the demo locally:

```bash
npm cache clean  # this is useful to prevent errors on Windows during install

npm install

npm start
```

Then point your preferred browser to [http://localhost:8081](http://localhost:8081).

**note:** This running demo uses [https://dev.geo-solutions.it/mapstore/](https://dev.geo-solutions.it/mapstore/) as back-end.

## Other useful commands

```bash
# Run tests
npm test

# run test with hot reload
npm run continuoustest

#generate test documentation
npm run doctest
```

## Quick Build and Deploy

Install latest Maven, if needed, from [here](https://maven.apache.org/download.cgi) (version 3.1.0 is required).

Build the deployable war:

```
./build.sh [version_identifier]
```

Where version_identifier is an optional identifier of the generated war that will be shown in the settings panel of the application.

Deploy the generated `mapstore.war` file (in web/target) to your favourite J2EE container (e.g. Tomcat).

[Here](database-setup) you can find how to setup the database.
