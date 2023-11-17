---
name: MapStore Release
about: Steps to follow for a MapStore release
title: ''
labels: 'internal'
assignees: ''
---

## Setup and preliminary checks

This steps have to be followed always when preparing a new release.

- [x] Create an issue with this checklist in the release milestone, named "Release YYYY.XX.mm".
- [ ] Create the milestone if it doesn't exist. (Name YYYY.XX.mm).
- [ ] Verify if it is needed to release a new version of `http_proxy`, `mapfish-print` or `geostore`, and do it if necessary accordingly with [release calendar 2022](https://github.com/geosolutions-it/MapStore2/wiki/MapStore-Releases-2022).
  - [ ] for `geostore`, check if [here](https://maven.geo-solutions.it/it/geosolutions/geostore/geostore-webapp/) is present the version specified. Release procedure is specified in the [Readme.md](https://github.com/geosolutions-it/geostore) file of the project.
  - [ ] for `http_proxy`, check if [here](https://maven.geo-solutions.it/proxy/http_proxy/) is present the version specified. Release procedure is specified in the [Readme.md](https://github.com/geosolutions-it/http-proxy) file of the project.
  - [ ] for `mapfish-print` check if [here](https://maven.geo-solutions.it/proxy/http_proxy/) is present the version specified. Release procedure is specified in the [Readme.md](https://github.com/geosolutions-it/mapfish-print) file of the project.

## New stable branch creation

If stable release (YYYY.XX.00) follow these sub-steps:

- [ ] create a branch `YYYY.XX.xx` from master branch  (`xx` is really `xx`, example: 2018.01.xx). This is the new **stable branch**
- [ ] Change [MapStore2-QA-Build](http://build.geosolutionsgroup.com/view/MapStore/job/MapStore/view/MapStore%20QA/job/MapStore2-QA-Build/) by updating the `branch` parameter in the build configuration page to `YYYY.XX.xx`
- [ ] on MapStore **stable branch**
    - [ ] Fix `pom.xml` files to make sure that no `-SNAPSHOT` **dependencies** are used anymore.
- [ ] on MapStore **master branch**
    - [ ] increase version of java modules. (`mvn versions:set -DnewVersion=<SNAPSHOT_VERSION> -DprocessAllModules -DgenerateBackupPoms=false`). Where `<SNAPSHOT_VERSION>` increases the major number. (e.g. `1.3-SNAPSHOT` --> `1.4-SNAPSHOT`)
    - [ ] Manually update project pom templates to use `mapstore-services` of `<SNAPSHOT_VERSION>` to the new one. (`projects/templates/web/pom.xml`).
    - [ ] Increment version of `package.json` on master **0.&lt;x-incremented&gt;.0** with the command `npm version minor --git-tag-version=false`
- [ ] Create on [ReadTheDocs](https://readthedocs.org/projects/mapstore/) project the version build for `YYYY.XX.xx` (click on "Versions" and activate the version of the branch)
- [ ] create a branch with the same name (`YYYY.XX.xx`) in [MapStoreExtension](https://github.com/geosolutions-it/MapStoreExtension) repository.

## Before the Release

- [ ] Check `pom.xml` dependencies are all in fixed stable versions ( no `-SNAPSHOT` usage release).
- [ ] Check that [MapStoreExtension](https://github.com/geosolutions-it/MapStoreExtension) repository is aligned and working
- [ ] Test on QA [https://qa-mapstore.geosolutionsgroup.com/mapstore/](https://qa-mapstore.geosolutionsgroup.com/mapstore/)
  - [ ] Test **everything**, not only the new features
  - [ ] Test the creation of a standard project starting in from the stable branch and with the internal backend, so:
      - [ ] `node ./createProject.js` and insert the entries (for the rest simply press enter:
          - **project name**: `release_project_test`
          - **base branch**: insert the release branch (e.g. `YYYY.XX.xx`)
          - **project folder** insert `../test_release_<release_number>` )
      - [ ] `cd ../test_release_<release_number>`
      - [ ] `npm install`
      - [ ] `npm run start:app`, then check that an empty homepage loads correctly
  - [ ] Test [Binary](http://build.geosolutionsgroup.com/view/MapStore/job/MapStore/view/MapStore%20QA/job/MapStore2-QA-Build/) (take the mapstore2-<RELEASE_BRANCH>-qa-bin.zip, from latest build)

## Release

- [ ] On **stable** branch, do and merge a PR for updating:
  - [ ] Update `CHANGELOG.md` [Instructions](https://mapstore.readthedocs.io/en/latest/developer-guide/release/#changelog-generation)
  - [ ] Update the version of java modules on the stable branch to a stable, incremental version. Run `mvn versions:set -DnewVersion=<SNAPSHOT_VERSION> -DprocessAllModules -DgenerateBackupPoms=false` to update package version, where `<VERSION>` is the version of the java packages (e.g. `1.3.1`). (`mvn:release:prepare` may also work. TODO: check this command)
  - [ ] Manually update project pom templates to use `mapstore-services` of `<VERSION>`. `project/standard/templates/web/pom.xml`
- [ ] on **master branch** do and merge a PR for updating:
  - [ ] Update `CHANGELOG.md` [Instructions](https://mapstore.readthedocs.io/en/latest/developer-guide/release/#changelog-generation)

## MapStore Stable deploy

- [ ] check if there are changes to be ported to STABLE branch of [mapstore-datadir](https://github.com/geosolutions-it/mapstore-datadir/tree/STABLE) repo
  - [ ] if so prepare a PR to be merged
  - [ ] merge the PR and move on with the steps otherwise stop here
- [ ] Launch the [MapStore2-Stable-Build](http://build.geosolutionsgroup.com/view/MapStore/job/MapStore/view/MapStore%20Stable/job/MapStore2-Stable-Build/) and wait for the MapStore2-Stable-EndPointsTests to complete as well
  - [ ] When previous two jobs are green you can:
    - [ ] Lunch [MapStore2-Stable-Build](http://build.geosolutionsgroup.com/view/MapStore/job/MapStore/view/MapStore%20QA/job/MapStore2-Stable-Build/)
      - [ ] `branch` build on stable branch `YYYY.XX.xx`
      - [ ] `version`: `YYYY.XX.mm`
    - [ ] After "MapStore2-Stable-Build" finished, Launch [MapStore2-Stable-Deploy](http://build.geosolutionsgroup.com/view/MapStore/job/MapStore/view/MapStore%20Stable/job/MapStore2-Stable-Deploy/) to install the latest stable version on official demo
    - [ ] test the change has been applied, login on https://mapstore.geosolutionsgroup.com and verify that the layers from `gs-stable` are visible without errors (typically authentication errors that was caused by the wrong auth-key).


## Build and publishing release

- [ ] Create a [github draft release](https://github.com/geosolutions-it/MapStore2/releases)
  - [ ] `branch` **YYYY.XX.xx**
  - [ ] `tag` **vYYYY.XX.mm** (create a new tag from UI after entering this value)
  - [ ] `release` name equal to tag **vYYYY.XX.mm**
  - [ ] `description` describe the major changes and add links of the Changelog paragraph.
- [ ] Launch [MapStore2-Stable-Releaser](http://build.geosolutionsgroup.com/view/MapStore/job/MapStore/view/MapStore%20Stable/job/MapStore2-Stable-Releaser/) Jenkins job with **YYYY.XX.mm** for the version and **YYYY.XX.xx** for the branch to build and  **wait the end**. **Note:** Using the MapStore2 Releaser allows to write the correct version number into the binary packages. In the overview of this job you can find and download :
  - [ ] the latest `mapstore.war`
  - [ ] the latest binary `mapstore2-YYYY.XX.mm-bin.zip`
  - [ ] the printing bundle `mapstore-printing.zip`
  - [ ] Upload to draft release
    - [ ] the updated binary `mapstore2-YYYY.XX.mm-bin.zip`
    - [ ] the `mapstore.war` package
    - [ ] `mapstore-printing.zip` on github release
- [ ] Publish the release
- [ ] create on [ReadTheDocs](https://readthedocs.org/projects/mapstore/) project the version build for `vYYYY.XX.mm` (click on "Versions" and activate the version of the tag, created when release was published)
- [ ] Update `Default version` to point the release version in the `Advanced Settings` menu of the [ReadTheDocs](https://readthedocs.org/dashboard/mapstore/advanced/) admin panel


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
    - [ ] reset versions of java modules to `-SNAPSHOT` (`mvn versions:set -DnewVersion=<SNAPSHOT_VERSION> -DprocessAllModules -DgenerateBackupPoms=false`) where `<SNAPSHOT_VERSION>` is the version to set. (e.g. `1.2-SNAPSHOT`).
    - [ ] Manually update project pom templates to use `mapstore-services` of `<SNAPSHOT_VERSION>`. `project/standard/templates/web/pom.xml`
    - [ ] on `package.json` increasing the minor "version" number. **0.x.&lt;number-of-minor-version&gt;**
- [ ] Write to the mailing list about the current release news and the next release major changes
- [ ] Optional - prepare a PR for updating release procedure, if needed
- [ ] Close this issue
- [ ] Close the related milestone **YYYY.XX.mm**

## Other useful information
<!-- error stack trace, screenshot, videos, or link to repository code are welcome -->
