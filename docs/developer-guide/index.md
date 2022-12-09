# Quick Setup and Run

!!! Note
    Please make sure to have installed all the software as for requirements before to proceed.

Clone the repository:

```bash
git clone https://github.com/geosolutions-it/MapStore2.git
```

Start the demo locally:

```bash
npm cache clean  # this is useful to prevent errors on Windows during install

npm install

npm start
```

Then point your preferred browser to [http://localhost:8081](http://localhost:8081).

!!! Note
    This application runs the Java backend at `localhost:8080`. Make sure to have both ports 8080 and 8081 free before to run.

## Other useful commands

```bash
# Run tests
npm test

# run test with hot reload
npm run test:watch

#generate test documentation
npm run doc:test
```

## Quick Build and Deploy

Install latest Maven, if needed, from [here](https://maven.apache.org/download.cgi) (version 3.1.0 is required).

Build the deployable war:

```sh
./build.sh [version_identifier]
```

Where version_identifier is an optional identifier of the generated war that will be shown in the settings panel of the application.

Deploy the generated `mapstore.war` file (in product/target) to your favourite J2EE container (e.g. Tomcat).

[Here](database-setup.md#database-setup) you can find how to setup the database.
