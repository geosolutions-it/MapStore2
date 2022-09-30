# How to release

Below you can find the release procedure as a checklist. On each release it can be updated (if needed), copied and pasted into a GitHub issue, of course changing the release name.
Then you can check each entry on the GitHub issue when done until the release is end.

## Changelog generation

Generate new changelog by running this:

```sh
npm run generate:changelog <oldReleaseNumber>  <newReleaseNumber>

# usage
# generate:changelog 2022.01.00 2022.02.00
```

## Release Checklist

### naming conventions

#### release and tag

- **vYYYY.XX.mm** name of the release and tag. (e.g. `v2022.01.01`)
- **YYYY** is the year,
- **XX** is the incremental number of the release for the current year (starting from 01)
- **mm** is an incremental value (starting from 00) to increment for minor releases

#### stable branch

- **YYYY.XX.xx** name of stable branch (e.g. `2022.01.xx` )
- **YYYY** is the year
- **XX** is the incremental number of the release for the current year (starting from 01)
- **xx** is the fixed text `xx`

### Release procedure

```txt
## Setup and preliminary checks

This steps have to be followed always when preparing a new release.

- [ ] Create an issue with this checklist in the release milestone, named "Release YYYY.XX.mm". Create the milestone if it doesn't exist. (Name YYYY.XX.mm).
- [ ] Verify if it is needed to release a new version of http_proxy, mapfish-print or geostore, and do it if necessary.
  - [ ] for geostore, check if [here](https://maven.geo-solutions.it/it/geosolutions/geostore/geostore-webapp/) is present the version specified in the [release calendar 2022](https://github.com/geosolutions-it/MapStore2/wiki/MapStore-Releases-2022). (Geostore release procedure [here](https://github.com/geosolutions-it/geostore/wiki/Release-Process)
  - [ ] for http_proxy, check if [here](https://mvnrepository.com/artifact/proxy/http_proxy) is present the version specified in the [release calendar 2022](https://github.com/geosolutions-it/MapStore2/wiki/MapStore-Releases-2022)

## New major branch creation

If major release (YYYY.XX.00) follow these sub-steps:

- [ ] create a branch `YYYY.XX.xx` from master branch  (`xx` is really `xx`, example: 2018.01.xx). This is the new **stable branch**
- [ ] Change [MapStore2-QA-Build](http://build.geosolutionsgroup.com/view/MapStore/job/MapStore/view/MapStore%20QA/job/MapStore2-QA-Build/) by updating the `branch` parameter in the build configuration page to `YYYY.XX.xx`
- [ ] on MapStore **stable branch**
    - [ ] Fix `pom.xml` files to make sure that no -SNAPSHOT **dependencies** are used anymore.
- [ ] on MapStore **master branch**
    - [ ] increase version of java modules. (`mvn versions:set -DnewVersion=<SNAPSHOT_VERSION> -DprocessAllModules -DgenerateBackupPoms=false`). Where `<SNAPSHOT_VERSION>` increases the major number. (e.g. `1.3-SNAPSHOT` --> `1.4-SNAPSHOT`)
    - [ ] Manually update project pom templates to use `mapstore-services` of `<SNAPSHOT_VERSION>` to the new one. (`projects/templates/web/pom.xml`).
    - [ ] Increment version of `package.json` on master **0.&lt;x-incremented&gt;.0**
- [ ] Create on [ReadTheDocs](https://readthedocs.org/projects/mapstore/) project the version build for `YYYY.XX.xx` (click on "Versions" and activate the version of the branch)
- [ ] create a branch with the same name (`YYYY.XX.xx`) in [MapStoreExtension](https://github.com/geosolutions-it/MapStoreExtension) repository.

## Before the Release

- [ ] Check `pom.xml` dependencies are all in fixed stable versions ( no `-SNAPSHOT` usage release).
- [ ] Check that MapStoreExtension repository is aligned and working
- [ ] Make sure that the issues of the current release are connected to the current milestone on github.
- [ ] Test on QA [https://qa-mapstore.geosolutionsgroup.com/mapstore/](https://qa-mapstore.geosolutionsgroup.com/mapstore/)
  - [ ] Test **everything**, not only the new features
  - [ ] Test the creation of a standard project starting in from the stable branch and with the internal backend, so `npm start:app`, then check that an empty homepage loads correctly
  - [ ] Test [Binary](http://build.geosolutionsgroup.com/view/MapStore/job/MapStore/view/MapStore%20QA/job/MapStore2-QA-Build/) (take the mapstore2-<RELEASE_BRANCH>-qa-bin.zip, from latest build)

The following procedure allow you to migrate issues from zenhub release to github milestone.

- assign the label "current-release" to all the issues and PRs of the current zenhub release
- use the label to filter the issues on github and assign to all the issues and Prs the milestone created
- remove assignments of "current-release"

## Release

- [ ] on **master branch** do and merge a PR for updating:
    - [ ] "default stable branch" used in `createProject.js` script , in particular the utility/projects/projectLib.js file and commit
    - [ ] `CHANGELOG.md` for **master** and **stable** [Instructions](https://mapstore.readthedocs.io/en/latest/developer-guide/release/#changelog-generation)
- [ ] On **stable**branch, do and merge a PR for updating:
 - [ ] "default stable branch" used in `createProject.js` script , in particular the utility/projects/projectLib.js file and commit
 - [ ] Check `pom.xml` dependencies stable versions ( no `-SNAPSHOT` usage release).
 - [ ] Update the version of java modules on the stable branch to a stable, incremental version. Run `mvn versions:set -DnewVersion=<SNAPSHOT_VERSION> -DprocessAllModules -DgenerateBackupPoms=false` to update package version, where `<VERSION>` is the version of the java packages (e.g. `1.3.1`). (`mvn:release:prepare` may also work. TODO: check this command)
 - [ ] Manually update project pom templates to use `mapstore-services` of `<VERSION>`. `project/standard/templates/web/pom.xml`
- [ ] Release a stable `mapstore-services`. (from `2022.01.xx` also mapstore-webapp (java/web) should be deployed for new project system).
  - [ ] Use `mvn clean install deploy -f java/pom.xml` to deploy `mapstore-services` and `mapstore-webapp`.

## MapStore Stable publishing
- [ ] check if there are changes to be ported to STABLE branch of [mapstore-datadir](https://github.com/geosolutions-it/mapstore-datadir/tree/STABLE) repo
  - [ ] if so prepare a PR to be merged
  - [ ] merge the PR and move on with the steps otherwise stop here
- [ ] Launch the [MapStore2-Stable-Build](http://build.geosolutionsgroup.com/view/MapStore/job/MapStore/view/MapStore%20Stable/job/MapStore2-Stable-Build/) and wait for the MapStore2-Stable-EndPointsTests to complete as well
  - [ ] When previous two jobs are green you can:
    - [ ] Change [MapStore2-Stable-Build](http://build.geosolutionsgroup.com/view/MapStore/job/MapStore/view/MapStore%20QA/job/MapStore2-Stable-Build/) to build on stable branch **YYYY.XX.xx**
    - [ ] Launch [MapStore2-Stable-Deploy](http://build.geosolutionsgroup.com/view/MapStore/job/MapStore/view/MapStore%20Stable/job/MapStore2-Stable-Deploy/) to install the latest stable version on official demo
- [ ] test the change has been applied, login on mapstore.geosolutionsgroup.com and verify that the layers from `gs-stable` are visible without errors (typically authentication errors that was caused by the wrong auth-key).


## Build and publishing release

- [ ] Create a [github draft release](https://github.com/geosolutions-it/MapStore2/releases)
  - [ ] `branch` **YYYY.XX.xx**
  - [ ] `tag` **vYYYY.XX.mm** (create a new tag from UI after entering this value)
  - [ ] `release` name equal to tag **vYYYY.XX.mm**
  - [ ] `description` describe the major changes and add links of the Changelog paragraph.
- [ ] Launch [MapStore2-Stable-Releaser](http://build.geosolutionsgroup.com/view/MapStore/job/MapStore/view/MapStore%20Stable/job/MapStore2-Stable-Releaser/) Jenkins job with **YYYY.XX.mm** for the version and **YYYY.XX.xx** for the branch to build and  **wait the end**). **Note:** Using the MapStore2 Releaser allows to write the correct version number into the binary packages. In the overview of this job you can find and download :
  - [ ] the latest `mapstore.war`
  - [ ] the latest binary `mapstore2-YYYY.XX.mm-bin.zip`
  - [ ] the printing bundle `mapstore-printing.zip`
  - [ ] Upload to draft release
    - [ ] the updated binary `mapstore2-YYYY.XX.mm-bin.zip`
    - [ ] the `mapstore.war` package
    - [ ] `mapstore-printing.zip` on github release
- [ ] Publish the release
- [ ] create on [ReadTheDocs](https://readthedocs.org/projects/mapstore/) project the version build for `vYYYY.XX.mm` (click on "Versions" and activate the version of the tag, created when release was published)


## Build and publish MapStoreExtension release
- [ ] [Create a draft release](https://github.com/geosolutions-it/MapStoreExtension/releases/new) for [MapstoreExtension](https://github.com/geosolutions-it/MapStoreExtension) with the same name and tag
  - [ ] target of the release is **stable branch** aligned to latest commit in stable branch of main mapstore repo
  - [ ] tag is **vYYYY.XX.mm**
  - [ ] Update revision of mapstore to the release tag **vYYYY.XX.mm**
  - [ ] [run the build](https://github.com/geosolutions-it/MapStoreExtension#build-extension) locally and attach to the release the file `SampleExtension.zip` from the `/dist` folder
  - [ ] create a PR for the changes of the revision to the MapstoreExtension repo
  - [ ] Merge the PR
  - [ ] Publish the release
  - [ ] Link the MapStore extension release in the MapStore release

## Finalize Release
- [ ] Prepare a PR MapStore **stable branch** **YYYY.XX.xx** in order to :
    - [ ] reset versions of java modules to `-SNAPSHOT` (`mvn versions:set -DnewVersion=<SNAPSHOT_VERSION> -DprocessAllModules -DgenerateBackupPoms=false`) where `<SNAPSHOT_VERSION>` is the version to set. (e.g. 1.2-SNAPSHOT). Make sure that only mapstore-services has changed
    - [ ] on `package.json` increasing the minor "version" number. **0.x.&lt;number-of-minor-version&gt;**
- [ ] Write to the mailing list about the current release news and the next release major changes
- [ ] Optional - prepare a PR for updating release procedure, if needed
- [ ] Close this issue
- [ ] Close the related milestone **YYYY.XX.mm**
```
