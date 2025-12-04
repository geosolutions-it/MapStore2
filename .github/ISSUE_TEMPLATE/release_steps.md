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
- [ ] Verify if it is needed to release a new version of `http_proxy`, `mapfish-print` or `geostore`, and do it if necessary accordingly with [release calendar](https://github.com/geosolutions-it/MapStore2/wiki/MapStore-Release-Calendars).
  - [ ] for `geostore`, check if [here](https://maven.geo-solutions.it/it/geosolutions/geostore/geostore-webapp/) is present the version specified. Release procedure is specified in the [Readme.md](https://github.com/geosolutions-it/geostore) file of the project.
  - [ ] for `http_proxy`, check if [here](https://maven.geo-solutions.it/proxy/http_proxy/) is present the version specified. Release procedure is specified in the [Readme.md](https://github.com/geosolutions-it/http-proxy) file of the project.
  - [ ] for `mapfish-print` check if [here](https://maven.geo-solutions.it/proxy/http_proxy/) is present the version specified. Release procedure is specified in the [Readme.md](https://github.com/geosolutions-it/mapfish-print) file of the project.
- [ ] Check if dependencies of MapStore libraries and geostore libraries are the same (compare `src/pom.xml` in geostore e `pom.xml` in MapStore).
- [ ] Check if dependencies of the **template projects** are aligned
  - [ ] `project/standard/templates/pom.xml` are aligned as the ones in `pom.xml` of MapStore
  - [ ] `project/standard/templates/web/pom.xml` are aligned as the ones in `product/pom.xml` of MapStore.

## New stable branch creation

**Only** if you need to create a new stable major release (YYYY.XX.00), you need to create a branch for it. Check the following:

- [ ] Run the [`Cut Release Branch`](https://github.com/geosolutions-it/MapStore2/actions/workflows/cut_major_branch.yml) workflow on github.
  With the following Parameters:
  - [ ] Use workflow from branch `master`
  - [ ] MapStore branch name to use: `YYYY.XX.xx`
  - [ ] use the default value for the other parameters
- [ ] Wait for the process to complete. At the end:
  - A Pull request will be created to the master
  - A new branch named `YYYY.XX.xx` with fixed versions
- [ ] Merge the incoming PR created by the workflow
- [ ] Create on [ReadTheDocs](https://app.readthedocs.org/projects/mapstore/) project the version build for `YYYY.XX.xx` (click on "Versions" and activate the version of the branch)
- [ ] Run the [`Cut Release Branch`](https://github.com/geosolutions-it/MapStoreExtension/actions/workflows/cut_release_branch.yml) workflow on MapStoreExtension project, indicating:
  - [ ] Use workflow from branch `master`
  - [ ] MapStore branch name to use: `YYYY.XX.xx`
  - [ ] main branch `master` (default)
- [ ] Update the [QA build](http://build.geosolutionsgroup.com/view/MapStore/job/MapStore/view/MapStore%20QA/job/MapStore2-QA-Build/) to point to the branch created (YYYY.XX.xx)

## Before the Release

- [ ] Check `pom.xml` dependencies are all in fixed stable versions ( no `-SNAPSHOT` usage release). If not, You use the action  [`Update dependencies versions`](https://github.com/geosolutions-it/MapStore2/actions/workflows/update_dependencies_versions.yml) to fix them, setting:
  - [ ] the branch to `YYYY.XX.xx`
  - [ ] the of geostore, http_proxy and mapfish-print versions accordingly with the [MapStore release calendar](https://github.com/geosolutions-it/MapStore2/wiki/MapStore-Release-Calendars)
- [ ] Merge the PR created after the action avove has been finshed
- [ ] Check that [MapStoreExtension](https://github.com/geosolutions-it/MapStoreExtension) repository is aligned and working.
- [ ] Run the [Submodule Update](https://github.com/geosolutions-it/MapStoreExtension/actions/workflows/submodules_update.yml) of [MapStoreExtension](https://github.com/geosolutions-it/MapStoreExtension) to generate the `SampleExtension.zip` to use for testing.
  - [ ] Use workflow from `YYYY.XX.xx` branch
  - [ ] Wait for completition
  - [ ] Download the `Artifacts.zip` that contains `SampleExtension.zip` from the execution of the `checks` action on the branch `YYYY.XX.xx`. This can be used for tests.
- [ ] Test on QA [https://qa-mapstore.geosolutionsgroup.com/mapstore/](https://qa-mapstore.geosolutionsgroup.com/mapstore/)
  - [ ] Test **everything**, not only the new features
  - [ ] Test the creation of a standard project starting in from the stable branch and with the internal backend, so:
    - [ ] `node ./createProject.js` and insert the entries (for the rest simply press enter:
      - **project name**: `release_project_test`
      - **base branch**: insert the release branch (e.g. `YYYY.XX.xx`)
      - **project folder** insert `../test_release_<release_number>` )
    - [ ] `cd ../test_release_<release_number>`
    - [ ] `npm install`
    - [ ] `npm start`, then check that an empty homepage loads correctly
  - [ ] Test [Binary](http://build.geosolutionsgroup.com/view/MapStore/job/MapStore/view/MapStore%20QA/job/MapStore2-QA-Build/) (take the mapstore2-<RELEASE_BRANCH>-qa-bin.zip, from latest build)

## Prepare Release

- [ ] Run [`Prepare Release`](https://github.com/geosolutions-it/MapStore2/actions/workflows/pre_release.yml) workflow on github actions with the following parameters:
  - Use workflow from `branch` **YYYY.XX.xx** (the release branch)
  - Version to release **YYYY.XX.mm** (the effective number of the release)
  - MapStore version for changelog generation **YYYY.XX.mm** (the effective number of the previous release)
  - version to fix for the java module, accordingly with [release calendar](https://github.com/geosolutions-it/MapStore2/wiki/MapStore-Release-Calendars) (e.g. `1.7.0`)
  - use the default value for the other parameters
- [ ] Wait for the process to complete. At the end:
  - a new commit will be added to the release branch tagged as `vYYYY.XX.mm`. This commit will contain the changelog and the updated version of the java modules.
  - a pull request will be created on master with the changelog updates
- [ ] Merge the incoming PR created by the workflow for updating changelog on Master
- [ ] Run [`Submodules Update`](https://github.com/geosolutions-it/MapStoreExtension/actions/workflows/submodules_update.yml) on MapStoreExtension:
  - Branch `YYYY.XX.xx`

## MapStore Stable deploy

- [ ] check if there are changes to be ported to STABLE branch of [mapstore-datadir](https://github.com/geosolutions-it/mapstore-datadir/tree/STABLE) repo
  - [ ] if so prepare a PR to be merged
  - [ ] merge the PR and move on with the steps otherwise stop here
- [ ] Lunch [MapStore2-Stable-Build](http://build.geosolutionsgroup.com/view/MapStore/job/MapStore/view/MapStore%20QA/job/MapStore2-Stable-Build/)
      - `branch`: `vYYYY.XX.mm` (the version tag name, e.g. v2024.01.01)
      - `version`: `${branch}-stable` ( version to pass to the build )
      - `TAG_NAME`: `${branch}-stable` (tag to assign to the docker hub image)
- [ ] After "MapStore2-Stable-Build" finished, Launch [MapStore2-Stable-Deploy](http://build.geosolutionsgroup.com/view/MapStore/job/MapStore/view/MapStore%20Stable/job/MapStore2-Stable-Deploy/) to install the latest stable version on official demo.
      - `branch`: `vYYYY.XX.mm` (the version tag name, e.g. v2024.01.01)
      - `TAG_NAME`: `${branch}-stable` (tag of the docker hub image, previously build)
- [ ] Test the change has been applied, login on <https://mapstore.geosolutionsgroup.com> and verify that the layers from `gs-stable` are visible without errors (typically authentication errors that was caused by the wrong auth-key).

## Create and Publish MapStoreExtension release

- [ ] [Create a draft release](https://github.com/geosolutions-it/MapStoreExtension/releases/new) for [MapstoreExtension](https://github.com/geosolutions-it/MapStoreExtension) with the same name and tag
  - target of the release is **stable branch** aligned to latest commit in stable branch of main mapstore repo
  - tag is **vYYYY.XX.mm**
- [ ] Upload the `SampleExtension.zip` to upload on release:
  - [Open the page](https://github.com/geosolutions-it/MapStoreExtension/actions/workflows/checks.yml). You will see a process running for the stable branch, triggered by **"Update submodules"**. Wait for the end of this task.
  - When the process is succesfully finished **click** on the **"Update submodules"** last successful task. The task page will open.
  - At the bottom of the page **click** on "**Artifacts**" to download.
  - **Extract**  from the `artifacts.zip` the `SampleExtension.zip` file
  - Upload the `SampleExtension.zip` to the draft release created.
- [ ] Publish the MapStoreExtension release

## Create and Publish MapStore release

- [ ] Run [`Create Release`](https://github.com/geosolutions-it/MapStore2/actions/workflows/create_release.yml) workflow on github actions with the following parameters:
  - Use workflow from `branch` **YYYY.XX.xx** (the release branch)
  - Version to release **YYYY.XX.mm** (version **without** the `v` prefix)
  - Previous Version of the release **YYYY.XX.mm** (the effective number of the previous release, without the `v` prefix) for correct full changelog link generation
- [ ] Launch [MapStore2-Stable-Releaser](http://build.geosolutionsgroup.com/view/MapStore/job/MapStore/view/MapStore%20Stable/job/MapStore2-Stable-Releaser/) Jenkins job with
  - **branch**: **vYYYY.XX.mm** (the version tag name, e.g. v2024.01.01)
  - **ms2Version**: **YYYY.XX.mm** (version **without** the `v` prefix)
- [ ] Wait the end of the 2 process

When the processes are finished, the release is ready to be published on github in draft mode.

- [ ] Open the new release in draft from [here](https://github.com/geosolutions-it/MapStore2/releases)
- [ ] Update the link to Docker in the release notes with the link to the latest stable release (search the new tag on [docker hub](https://hub.docker.com/r/geosolutionsit/mapstore2/tags) )
- [ ] Update the description of the release details
- [ ] Publish the release

## Update ReadTheDocs

- [ ] create on [ReadTheDocs](https://app.readthedocs.org/dashboard/mapstore/version/create/) project the version build for `vYYYY.XX.mm` (search for the tag, check the `active` toggle and click on update verson )
- [ ] Update `Default version` to point the new tag (`vYYYY.XX.mm`) in read the [ReadTheDocs Settings](https://app.readthedocs.org/dashboard/mapstore/edit/)  panel and click on save.

## Finalize Release

- [ ] Run the [`Post Release`](https://github.com/geosolutions-it/MapStore2/actions/workflows/post_release.yml) workflow on github with the following parameters:
  - Use workflow from branch `YYYY.XX.xx` (the release branch)
  - Version of Java Packages to restore accordingly with [release calendar](https://github.com/geosolutions-it/MapStore2/wiki/MapStore-Release-Calendars) with `-SNAPSHOT` E.g. `1.7-SNAPSHOT`
- [ ] Use the action  [`Update dependencies versions`](https://github.com/geosolutions-it/MapStore2/actions/workflows/update_dependencies_versions.yml) to restore the `-SNAPSHOT` version of GeoStore, setting:
  - [ ] the branch to `YYYY.XX.xx`
  - [ ] the of geostore, http_proxy and mapfish-print versions accordingly with the [MapStore release calendar](https://github.com/geosolutions-it/MapStore2/wiki/MapStore-Release-Calendars) and use `-SNAPSHOT` version of geostore.
- [ ] Write to the mailing list about the current release news and the next release major changes
- [ ] Optional - prepare a PR for updating release procedure, if needed
- [ ] Close this issue
- [ ] Close the related milestone **YYYY.XX.mm**

## Other useful information
<!-- error stack trace, screenshot, videos, or link to repository code are welcome -->
