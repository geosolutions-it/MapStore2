# Dev Setup and Run

Clone the repository with the --recursive option to automatically clone submodules:

```
git clone --recursive https://github.com/geosolutions-it/MapStore2.git
```

If needed, install NodeJS >= 7.10.0 from [here](https://nodejs.org/en/download/releases/), then update npm to 3.x, using:

```
npm install -g npm@3
```

Start the demo locally:

```
npm cache clean  # this is useful to prevent errors on Windows during install

npm install

npm start
```

Then point your preferred browser to [http://localhost:8081](http://localhost:8081).

**Other useful commands**
```
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

Deploy the generated mapstore.war file (in web/target) to your favourite J2EE container (e.g. Tomcat).

# Developers Documentation
 * [Infrastructure](infrastructure-and-general-architecture)
 * [Developing with MapStore2](developing-with-mapstore-2-intro)
 * [Configuration](configuration-files)
 * [Migration](mapstore-migration-guide)
 * [How to Release](release)
