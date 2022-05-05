# How to release

Below you can find the release procedure as a checklist. On each release it can be updated (if needed), copied and pasted into a GitHub issue, of course changing the release name.
Then you can check each entry on the GitHub issue when done until the release is end.

## Changelog generation

Add an entry in the changelog like this:

```markdown
## [2018.02.00](https://github.com/geosolutions-it/MapStore2/tree/v2018.02.00) (2018-09-11)

 - **[Full Changelog](https://github.com/geosolutions-it/MapStore2/compare/v2018.01.00...v2018.02.00)**

 - **[Implemented enhancements](https://github.com/geosolutions-it/MapStore2/issues?q=is%3Aissue+milestone%3A%222018.02.00%22+is%3Aclosed+label%3Aenhancement)**

 - **[Fixed bugs](https://github.com/geosolutions-it/MapStore2/issues?q=is%3Aissue+milestone%3A%222018.02.00%22+is%3Aclosed+label%3Abug)**

 - **[Closed issues](https://github.com/geosolutions-it/MapStore2/issues?q=is%3Aissue+milestone%3A%222018.02.00%22+is%3Aclosed)**

```

Replacing:

- replacing `2022.01.00` with branch name
- with current release tag name `v2018.02.00`
- `%22v2022.01.00%22` with the name of the milestone (`%22` are `"` in the URL to generate a filter like `milestone:"v2022.01.00"`)

## Release Checklist

### naming conventions

**release and tag**
- **vYYYY.XX.mm** name of the release and tag. (e.g. `v2022.01.01`) 
- **YYYY** is the year,
- **XX** is the incremental number of the release for the current year (starting from 01) 
- **mm** is an incremental value (starting from 00) to increment for minor releases

**stable branch**
- **YYYY.XX.xx** name of stable branch (e.g. `2022.01.xx` )
- **YYYY** is the year
- **XX** is the incremental number of the release for the current year (starting from 01) 
- **xx** is the fixed text `xx`

### Release procedure

- [ ] Create an issue with this checklist in the release milestone.
- [ ] Verify if it is needed to release a new version of http_proxy or geostore, and do it if necessary. Instruction for GeoStore [here](https://github.com/geosolutions-it/geostore/wiki/Release-Process)
  - [ ] for geostore, check if [here](https://maven.geo-solutions.it/it/geosolutions/geostore/geostore-webapp/) is present the version specified in the [release calendar 2022](https://github.com/geosolutions-it/MapStore2/wiki/MapStore-Releases-2022)
  - [ ] for http_proxy, check if [here](https://mvnrepository.com/artifact/proxy/http_proxy) is present the version specified in the [release calendar 2022](https://github.com/geosolutions-it/MapStore2/wiki/MapStore-Releases-2022)
- [ ] If major release (YYYY.XX.00), create a branch `YYYY.XX.xx`  (`xx` is really `xx`, example: 2018.01.xx)
- [ ] If major release, Change [QA Jenkins job](http://build.geo-solutions.it/jenkins/view/MapStore2/job/MapStore2-QA-Build/) to build the new branch, enable the job continuous deploy by updating the `branch` parameter in the build configuration page to `YYYY.XX.xx`
- [ ] Check version in `package.json`. (as for semantic versioning the major have to be 0 until the npm package has not a stable API).
    - [ ] Take note of current version of mapstore in `package.json` in master branch, it should be in the form 0.x.0
    - [ ] If major release, make pr and merge on master **0.&lt;x-incremented&gt;.0**
    - [ ] if minor release, make pr and merge on stable YYYY.XX.xx **0.x.&lt;number-of-minor-version&gt;**
- [ ] Create a milestone on GitHub with the same name of the release (vYYYY.XX.xx)
    - [ ] assign the label "current-release" to all the issues and Prs of the current zenhub release
    - [ ] use the label to filter the issues on github and assign to all the issues and Prs the milestone created
    - [ ] remove assignments of "current-release" 
- [ ] Prepare PR for updating `CHANGELOG.md` for **master** and **stable** [Instructions](https://mapstore.readthedocs.io/en/latest/developer-guide/release/#changelog-generation)
- [ ] Fix `pom.xml` dependencies stable versions ( no `-SNAPSHOT` usage release).
- [ ] Update the version of java modules on the stable branch to a stable, incremental version.
    - [ ] Run `mvn release:update-versions -DdevelopmentVersion=<VERSION> -Pprinting,printingbundle,release`
    to update package version, where <VERSION> is the version of the java packages (e.g. `1.2.2`).
    - [ ] Manually update project pom templates to use `mapstore-services` of `<VERSION>`
- [ ] Release a stable `mapstore-services`. (from `2022.01.xx` also mapstore-webapp (java/web) should be deployed for new project system). 
  - [ ] Use `mvn clean install deploy -f java/pom.xml` to deploy `mapstore-services` and `mapstore-webapp`.
- [ ] create on [ReadTheDocs](https://readthedocs.org/projects/mapstore/) project the version build for `YYYY.XX.xx` (click on "Versions" and activate the version of the branch)
- [ ] Test on QA [https://qa-mapstore.geosolutionsgroup.com/mapstore/](https://qa-mapstore.geosolutionsgroup.com/mapstore/)
    * Any fix must be done on **YYYY.XX.xx**. The fixes will be manually merged on master
    * Test **everything**, not only the new features
    * Test the creation of a standard project starting in from the stable branch and with the internal backend, so `npm run backend` and `npm start`, then check that an empty homepage loads correctly
- [ ] Test [Binary](https://build.geo-solutions.it/jenkins/view/MapStore2/job/MapStore2-QA-Build-NEW/) (take the mapstore2-QA-<RELEASE_BRANCH>-bin.zip, from latest build)
- [ ] Lunch the [stable deploy](https://build.geo-solutions.it/jenkins/view/MapStore2/job/MapStore2-Stable/) to install the latest stable version on official demo, remember to change version to **YYYY.XX.mm** 
- [ ] Manually edit the `localConfig.json` on mapstore.geosolutionsgroup.com to fit the authkey for production (change from `authkey-qa` to `authkey-prod`)
  - [ ] `ssh geosolutions@mapstore.geosolutionsgroup.com`
  - [ ] `sudo su`
  - [ ] `vim /var/lib/tomcats8/mapstore2_release/webapps/mapstore/configs/localConfig.json`
  - [ ] to test the change has been applied, login on mapstore.geosolutionsgroup.com and verify that the layers from `gs-stable` are visible without errors (typically authentication errors that was caused by the wrong auth-key). 
- [ ] Commit the changelog to the stable branch **YYYY.XX.xx**
- [ ] Create a [github draft release](https://github.com/geosolutions-it/MapStore2/releases)
  - [ ] `branch` **YYYY.XX.xx** 
  - [ ] `tag` **vYYYY.XX.mm** (create a new tag from UI after entering this value)
  - [ ] `release` name equal to tag **vYYYY.XX.mm**  
  - [ ] `description` describe the major changes and add links of the Changelog paragraph.
- [ ] Launch [MapStore2-Releaser](https://build.geo-solutions.it/jenkins/job/MapStore2-Releaser/) Jenkins job with **YYYY.XX.mm** for the version and **YYYY.XX.xx** for the branch to build and  **wait the end**). **Note:** Using the MapStore2 Releaser allows to write the correct version number into the binary packages.
    - [ ] Get the [latest mapstore.war](https://build.geo-solutions.it/jenkins/view/MapStore2/job/MapStore2-Releaser/ws/product/target/mapstore.war) from the Releaser Jenkins build 
    - [ ] Get the [latest mapstore2-YYYY.XX.mm-bin.zip](https://build.geo-solutions.it/jenkins/view/MapStore2/job/MapStore2-Releaser/ws/release/target/) from the Releaser Jenkins build
    > from the job [configuration page](https://build.geo-solutions.it/jenkins/view/MapStore2/job/MapStore2-Releaser/ws/) there is a link to access the job workspace to easily download the built WAR and binary package
    - [ ] Download `mapstore-printing.zip` [here](http://build.geo-solutions.it/jenkins/view/MapStore2/job/MapStore2-Releaser/ws/java/printing/target/mapstore-printing.zip) from the Releaser Jenkins build workspace
    - [ ] Check that the printing plugin is missing in the binary package to release
    - [ ] Remove manually from `localConfig.json` the entry for authentication to gs-stable from binary and war packages.
    - [ ] Upload the updated binary, the war package and `mapstore-printing.zip` on github release
    - [ ] Publish the release
- [ ] create on [ReadTheDocs](https://readthedocs.org/projects/mapstore/) project the version build for `vYYYY.XX.mm` (click on "Versions" and activate the version of the tag, created when release was published)
- [ ] Prepare a PR towards master branch **YYYY.XX.xx** in order to reset versions of java modules to `-SNAPSHOT`
    - `mvn versions:set -DnewVersion=<SNAPSHOT_VERSION> -DprocessAllModules -DgenerateBackupPoms=false`
    where `<SNAPSHOT_VERSION>` is the version to set. (e.g. 1.2-SNAPSHOT).
    make sure that only mapstore-services has changed

- [ ] [Create a draft release](https://github.com/geosolutions-it/MapStoreExtension/releases/new) for https://github.com/geosolutions-it/MapStoreExtension with the same name and tag
  - [ ] target of the release is **master** branch
  - [ ] tag is **vYYYY.XX.mm**
  - [ ] Update revision of mapstore to the release tag **vYYYY.XX.mm**
  - [ ] [run the build](https://github.com/geosolutions-it/MapStoreExtension#build-extension) locally and attach to the release the file `SampleExtension.zip` from the `/dist` folder
  - [ ] create a PR for the changes of the revision to the MapstoreExtension repo
  - [ ] Merge the PR
  - [ ] Publish the release
- [ ] Create a blog post
- [ ] Write to the mailing list about the current release news and the next release major changes
- [ ] Optional - prepare a PR for updating release procedure
- [ ] Close this issue
- [ ] Close the related milestone **vYYYY.XX.mm**

```
