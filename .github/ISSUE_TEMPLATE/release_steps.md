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

**Only** if you are need to create a new stable major release (YYYY.XX.00), you need first to create a branch for it. Follow the following:

- [ ] Run the `Cut Release Branch` workflow on github.
      With the following Parameters:
        - Use workflow from branch `master`
        - MapStore branch name to use: `YYYY.XX.xx`
        - Version of *MapFish Print*, *GeoStore* and *HTTP-Proxy* accordingly to the release calendar
        - use the default value for the other parameters
- [ ] Wait for the end of the process
- [ ] Merge the incoming PR created by the workflow
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

- [ ] Run `Create Release` workflow on github actions with the following parameters
  - Use workflow from `branch` **YYYY.XX.xx** (the release branch)
  - Version to release **YYYY.XX.mm** (the effective number of the release)
  - MapStore version for changelog generation **YYYY.XX.mm** (the effective number of the previous release)
  - version to fix for the java module, accordingly with release schedule (e.g. `1.7.0`)
  - use the default value for the other parameters
- [ ] Wait for the end of the process.At the end of this process:
    - a new commit will be added to the release branch tagged as `vYYYY.XX.mm`. This commit will contain the changelog and the updated version of the java modules.
    - a draft release will be created on github with the same name and tag
    - a pull request will be created on master with the changelog update
- [ ] Merge the incoming PR created by the workflow for updating changelog on Master

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

- [ ] Launch [MapStore2-Stable-Releaser](http://build.geosolutionsgroup.com/view/MapStore/job/MapStore/view/MapStore%20Stable/job/MapStore2-Stable-Releaser/) Jenkins job with **YYYY.XX.mm** for the version and **YYYY.XX.xx** for the branch to build and  **wait the end**. **Note:** Using the MapStore2 Releaser allows to write the correct version number into the binary packages. In the overview of this job you can find and download :
- [ ] create on [ReadTheDocs](https://readthedocs.org/projects/mapstore/) project the version build for `vYYYY.XX.mm` (click on "Versions" and activate the version of the tag, created when release was published)
- [ ] Update the link to Docker in the release notes
- [ ] Update the description of the release with details
- [ ] Publish the release

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
- [ ] Run the `Post Release` workflow on github with the following parameters:
    - Use workflow from branch `YYYY.XX.xx` (the release branch)
    - Version of Java Packages to restore accordingly with release calendar with `-SNAPSHOT` E.g. `1.7-SNAPSHOT`
- [ ] Write to the mailing list about the current release news and the next release major changes
- [ ] Optional - prepare a PR for updating release procedure, if needed
- [ ] Close this issue
- [ ] Close the related milestone **YYYY.XX.mm**

## Other useful information
<!-- error stack trace, screenshot, videos, or link to repository code are welcome -->
