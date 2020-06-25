# General Migration Guidelines

Updating MapStore could mean:

- updating an existing installation
- updating a MapStore project created for a previous version

To update an existing installation you usually have to do nothing except eventually to execute queries on your database to update the changes to the database schema. 

In case of a project it becomes a little more complicated, depending on the customization.

This is a list of things to check if you want to update from a previous version valid for every version.

- Take a list to migration notes below for your version
- Take a look to the release notes
- update your `package.json` to latest libs versions
- take a look at your custom files to see if there are some changes (e.g. `localConfig.js`, `proxy.properties`)
- Some changes that may need to be ported could be present also in `pom.xml` files and in `configs` directory.
- Optionally check also accessory files like `.eslinrc`, if you want to keep aligned with lint standards.
- Follow the instructions below, in order, from your version to the one you want to update to.

## Migration from 2020.01.00 to 2020.02.00

### Translation files

- The translations file extension has been changed into JSON. Now translation files has been renamed from `data.<locale>` to `data.<locale>.json`. This change makes the `.json` extension mandatory for all translation files. This means that depending projects with custom translation files should be renabled in the same name. E.g. `data.it-IT` have to be renamed as `data.it-IT.json`

### Database Update

Database schema has changed. To update your database you need to apply this SQL scripts to your database

- Update the user schema
run the script available [here](https://github.com/geosolutions-it/geostore/tree/master/doc/sql/migration/postgresql):
```sql

-- Update the geostore database from 1.4.2 model to 1.5.0
-- It adds fields to gs_security for external authorization

-- The script assumes that the tables are located into the schema called "geostore"
--      if you put geostore in a different schema, please edit the following search_path.
SET search_path TO geostore, public;

-- Tested only with postgres9.1

-- Run the script with an unprivileged application user allowed to work on schema geostore

alter table gs_security add column username varchar(255);
alter table gs_security add column groupname varchar(255);

create index idx_security_username on gs_security (username);

create index idx_security_groupname on gs_security (groupname);

```


- Add new categories

```sql
-- New CONTEXT category
INSERT into geostore.gs_category (id ,name) values ( nextval('geostore.hibernate_sequence'),  'CONTEXT') ON CONFLICT DO NOTHING;
-- New GEOSTORY category (introduced in 2020.01.00)
INSERT into geostore.gs_category (id ,name) values (nextval('geostore.hibernate_sequence'),  'GEOSTORY') ON CONFLICT DO NOTHING;
-- New TEMPLATE category
INSERT into geostore.gs_category (id ,name) values ( nextval('geostore.hibernate_sequence'),  'TEMPLATE') ON CONFLICT DO NOTHING;
-- New USERSESSION category
INSERT into geostore.gs_category (id ,name) values ( nextval('geostore.hibernate_sequence'),  'USERSESSION') ON CONFLICT DO NOTHING;

```


## Migration from 2019.02.01 to 2020.01.00


With MapStore **2020.01.00** some dependencies that were previously hosted on github, have now been published on the npm registry, and package.json has been updated accordingly.
[Here](https://github.com/geosolutions-it/MapStore2/pull/4598) is the PR that documents how to update local package.json and local webpack if not using the mapstore buildConfig/testConfig common files.

After updating package.json run **npm install**
Now you should be able to run locally with **npm start**

For more info see the related [issue](https://github.com/geosolutions-it/MapStore2/issues/4569)

Moreover a new category has been added for future features, called GEOSTORY.

It is not necessary for this release, but, to follow the update sequence, you can add it by executing the following line.

```sql
INSERT into geostore.gs_category (id ,name) values (nextval('geostore.hibernate_sequence'),  'GEOSTORY') ON CONFLICT DO NOTHING;
```

## Migration from 2019.01.00 to 2019.01.01

MapStore **2019.01.01** changes the location of some of the build and test configuration files.
This also affects projects using MapStore build files, sp if you update MapStore subproject to the **2019.01.01** version you also have to update some of the project configuration files. In particular:

- **webpack.config.js** and **prod-webpack.config.js**:
  - update path to themes.js from ./MapStore2/themes.js to ./MapStore2/build/themes.js
  - update path to buildConfig from ./MapStore2/buildConfig to ./MapStore2/build/buildConfig
- **karma.conf.continuous-test.js** and **karma.config.single-run.js**: update path to testConfig from ./MapStore2/testConfig to ./MapStore2/build/testConfig

## Migration from 2017.05.00 to 2018.01.00

MapStore **2018.01.00** introduced theme and js and css versioning.
This allows to auto-invalidates cache files for each version of your software.
For custom projects you could choose to ignore this changes by setting version: "no-version" in your app.jsx `StandardRouter` selector:

```javascript
//...
const routerSelector = createSelector(state => state.locale, (locale) => ({
    locale: locale || {},
    version: "no-version",
    themeCfg: {
        theme: "mythheme"
    },
    pages
}));
const StandardRouter = connect(routerSelector)(require('../MapStore2/web/client/components/app/StandardRouter'));
//...

```

### Support js/theme versioning in your project

Take a look to [this pull request](https://github.com/geosolutions-it/MapStore2/pull/2538/files) as reference.
Basically versioning is implemented in 2 different ways for css and js files :

- Add at build time the js files inclusion to the files, with proper hashes.
- Load theme css files appending to the URL the ?{version} where version is the current mapstore2 version
The different kind of loading for css files is needed to continue supporting the theme switching capabilities.
For the future we would like to unify these 2 systems. See [this issue](https://github.com/geosolutions-it/MapStore2/issues/2554).

You have to:

- Add the version file to the root (`version.txt`).
- Create a template for each html file you have. These files will replace the html files when you build the final  war file. These files are like the original ones but without the `[bundle].js` file inclusion and without theme css.
- Add `HtmlWebpackPlugin` for production only, one for each js file. This plugin will add to the template file the script inclusion ([example](https://github.com/geosolutions-it/MapStore2/pull/2538/files#diff-9d452e0b96db9be8d604c4c9dde575b4)).
  - if you have to include the script in the head (e.g. `api.html` has some script that need the js to be loaded before executing the inline scripts), use the option `inject: 'head'`
- change each entry point (`app.jsx`, `api.jsx`, `embedded.jsx`, `yourcoustomentrypoint.jsx`) this way ([example](https://github.com/geosolutions-it/MapStore2/pull/2538/files#diff-3bea50c2662e64129704ae694b587042)):
  - `version` reducer in `StandardRouter`
  - `loadVersion` action in `initialActions`
  - `version` and `loadAfterTheme` selectors to `StandardRouter` state.

```javascript
// Example
const {versionSelector} = require('../MapStore2/web/client/selectors/version');
const {loadVersion} = require('../MapStore2/web/client/actions/version');
const version = require('../MapStore2/web/client/actions/version');
//...
StandardRouter = connect ( state => ({
    locale: state.locale || {},
        pages,
        version : versionSelector(state),
        loadAfterTheme: loadAfterThemeSelector(state)
    }))(require('../MapStore2/web/client/components/app/StandardRouter'))
const appStore = require('../MapStore2/web/client/stores/StandardStore').bind(null, initialState, {
    // ...
    version: version
});
// ...
const appConfig = {
    // ...
    initialActions: [loadVersion]
}
```

- Add to your `pom.xml` some execution steps to replace html files with the ones generated in 'dist' directory. ([example](https://github.com/geosolutions-it/MapStore2/pull/2538/files#diff-eef89535a29b4a95a42d9de83cb53681)). And copy `version.txt`
- Override the version file in your build process (e.g. you can use the commit hash)


## Migration from 2017.05.00 to 2017.03.00 and previews

In **2017.03.00** the `createProject.js` script created only a custom project. From version 2017.04.00 we changed the script to generate 2 kind of projects:

- **custom**: the previous version
- **standard**: mapstore standard

Standard project wants to help to generate a project that is basically the MapStore product, where you can add your own plugins and customize your theme (before this you had to create a project similar to MapStore on your own)
Depending on our usage of custom project, this may introduce some breaking changes.
If you previously included some file from `product` folder, now `app.jsx` has been changed to call `main.jsx`. Please take a look on how the main product uses this to migrate your changes inside your custom project.

## Migration from 2017.01.00 to 2017.02.00

The version 2017.02.00 has many improvements and changes:

- introduced `redux-observable`
- updated `webpack` to version 2
- updated `react-intl` to version 2.x
- updated `react` to [version 15.4.2] (https://facebook.github.io/react/blog/2016/04/07/react-v15.html)
- updated `react-bootstrap` to version 0.30.7

We suggest you to:

- align your package.json with the latest version of 2017.02.00.
- update your webpack files (see below).
- update your tests to react 15 version. [see upgrade guide](https://facebook.github.io/react/blog/2016/04/07/react-v15.html#upgrade-guide)
- Update your `react-bootstrap` custom components with the new one (see below).

### Side Effect Management - Introduced redux-observable

To manage complex asynchronous operations the thunk middleware is not enough.
When we started with MapStore there was no alternative to thunk. Now we have some options. After a spike (results available [here](https://github.com/geosolutions-it/MapStore2/issues/1420)) we chose to use redux-observable.
For the future, we strongly recommend to use this library to perform asynchronous tasks.

Introducing this library will allow to :

- remove business logic from the components event handlers
- now all new  `actionCreators` should return pure actions. All async stuff will be deferred to the epics.
- avoid bouncing between components and state to trigger side effect
- speed up development with `rxjs` functionalities
- Existing thunk integration will be maintained since all the thunks will be replaced.

If you are using the Plugin system and the StandardStore, you may have only to include the missing new dependencies in your package.json (redux-observable and an updated version of redux).

Check the current package.json to get he most recent versions. For testing we included also redux-mockup-store as a dependency, but you are free to test your epics as you want.

For more complex integrations check [this](https://github.com/geosolutions-it/MapStore2/pull/1471) pull request to see how to integrate redux-observable or follow the guide on the [redux-observable site](https://redux-observable.js.org/).

### Webpack update to version 2

We updated webpack (old one is deprecated), check [this pull request](https://github.com/geosolutions-it/MapStore2/pull/1491) to find out how to update your webpack files.
here a list of what we had to update:

- module.loaders are now module.rules
- update your package.json with latest versions of webpack, webpack plugins and karma libs and integrations (Take a look to the changes on package.json in the pull request if you want a detailed list of what to update in this case).
- change your test proxy configuration with the new one.

More details on the [webpack site](https://webpack.js.org/migrate/).

### react-intl update to  2.x

See [this pull request](https://github.com/geosolutions-it/MapStore2/pull/1495/files) for the details. You should only have to update your package.json

### react update to 15.4.2

Check this pull request to see how to:

- update your package.json
- update your tests

### React Bootstrap update

The version we are using is not documented anymore, and not too much compatible with react 15 (too many warnings). So this update can not be postponed anymore.
The bigger change in this case is that the Input component do not exists anymore. You will have to replace all your Input with the proper components, and update the `package.json`. See [this pull request](https://github.com/geosolutions-it/MapStore2/pull/1511) for details.
