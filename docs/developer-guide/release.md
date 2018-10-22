# How to release
Below you can find the release procedure as a checklist. On each release it can be updated (if needed), copied and pasted into a GitHub issue, of course changing the release name.
Then you can check each entry on the GitHub issue when done until the release is end.

## Changelog generation
Add an entry in the changelog like this:
```
## [2018.02.00](https://github.com/geosolutions-it/MapStore2/tree/2018.02.00) (2018-09-11)
 
 - **[Full Changelog](https://github.com/geosolutions-it/MapStore2/compare/tv2018.01.00...v2018.02.00)**

 - **[Implemented enhancements](https://github.com/geosolutions-it/MapStore2/issues?q=is%3Aissue+milestone%3A%222018.02.00%22+is%3Aclosed+label%3Aenhancement)**

 - **[Fixed bugs](https://github.com/geosolutions-it/MapStore2/issues?q=is%3Aissue+milestone%3A%222018.02.00%22+is%3Aclosed+label%3Abug)**

 - **[Closed issues](https://github.com/geosolutions-it/MapStore2/issues?q=is%3Aissue+milestone%3A%222018.02.00%22+is%3Aclosed)**

```
Replacing: 
 -  replacing `2018.02.00` with branch name
 - with current release tag name `v2018.02.00` 
 - `%222018.02.00%22` with the name of the milestone (`%22` are `"` in the URL to generate a filter like `milestone:"2018.02.00"`)

NOTE: we don't use  github_changelog_generator anymore because it has some issues that may address issues to wrong milestone, accordingly to our current workflow.

## Release Checklist
- [ ] Create an issue with this checklist in the release milestone.
- [ ] Create a branch (**YYYY.XX.mm**)  
- [ ] Change [QA Jenkins job](http://build.geo-solutions.it/jenkins/view/MapStore2/job/MapStore2-QA-Build/) to build the new branch, enable the job continuous deploy
- [ ] Test on QA [http://qa.mapstore2.geo-solutions.it/mapstore/](http://qa.mapstore2.geo-solutions.it/mapstore/)  
    * Any fix must be done on **YYYY.XX.mm**. The fixes will be manually merged on master
    * Test **everything**, not only the new features
- [ ] Update `CHANGELOG.md`. [Instructions](https://dev.mapstore2.geo-solutions.it/mapstore/docs/release)
- [ ] Commit the changelog to the release branch
- [ ] Create a [github draft release](https://github.com/geosolutions-it/MapStore2/releases) pointing to the branch **YYYY.XX.mm**.  
  > The Release name should follow be named YYYY.XX.mm where YYYY is the year, XX is the incremental number of the release for the current year (starting from 01) and the second number mm is an incremental value (starting from 00) to increment for minor releases. Insert the tag vYYYY.XX.mm (**notice the initial 'v' for the tag**) to create when the release is published. In the release description describe the major changes and link the Changelog paragraph.
- [ ] Launch [MapStore2-Releaser](http://build.geo-solutions.it/jenkins/job/MapStore2-Releaser/) Jenkins job setting up the correct name of the version (**and wait the end**). **Note:** Using the MapStore2 Releaser allows to write the correct version number into the binary packages.
- [ ] Get the [latest mapstore.war](http://build.geo-solutions.it/jenkins/view/MapStore2/job/MapStore2-Releaser/ws/web/target/mapstore.war) from the Releaser Jenkins build and upload it to github  
- [ ] Get the [latest mapstore2-YYYY.XX.mm-bin.zip](http://build.geo-solutions.it/jenkins/view/MapStore2/job/MapStore2-Releaser/ws/release/target/) from the Releaser Jenkins build and upload it to github
  > from the job [configuration page](http://build.geo-solutions.it/jenkins/view/MapStore2/job/MapStore2-Releaser/ws/) there is a link to access the job workspace to easily download the built WAR and binary package
- [ ] Publish the release
- [ ] Merge release branch into master - *note: You can do a pull request for this but* **do not squash commits*
- [ ] Create a blog post
- [ ] Write to the mailing list about the current release news and the next release major changes
- [ ] Update the release procedure if needed.
- [ ] Close this issue
- [ ] Close the related milestone
