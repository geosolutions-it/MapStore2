# How to release
Below you can find the release procedure as a checklist. On each release it can be updated (if needed), copied and pasted into a GitHub issue, of course changing the release name.
Then you can check each entry on the GitHub issue when done until the release is end.

## Release Checklist
- [ ] Create an issue with this checklist in the release milestone.
- [ ] Create a branch (**YYYY.XX.mm**)  
- [ ] Change [QA Jenkins job](http://build.geo-solutions.it/jenkins/view/MapStore2/job/MapStore2-QA-Build/) to build the new branch, enable the job continuous deploy
- [ ] Test on QA [http://qa.mapstore2.geo-solutions.it/mapstore/](http://qa.mapstore2.geo-solutions.it/mapstore/)  
    * Any fix must be done on both **YYYY.XX.mm** and **master** branch  
    * Test **everything**, not only the new features
- [ ] Generate the changelog with github_changelog_generator
- [ ] Commit the changelog to the release branch
- [ ] Create a [github draft release](https://github.com/geosolutions-it/MapStore2/releases) pointing to the branch **YYYY.XX.mm**.  
  > The Release name should follow be named YYYY.XX.mm where YYYY is the year, XX is the incremental number of the release for the current year (starting from 01) and the second number mm is an incremental value (starting from 00) to increment for minor releases. Insert the tag YYY.XX.mm to create when the release is published. In the release description describe the major changes and link the Changelog paragraph.
- [ ] Launch [MapStore2-Releaser](http://build.geo-solutions.it/jenkins/job/MapStore2-Releaser/) Jenkins job setting up the correct name of the version (**and wait the end**). **Note:** Using the MapStore2 Releaser allows to write the correct version number into the binary packages.
- [ ] Get the [latest mapstore.war](http://build.geo-solutions.it/jenkins/view/MapStore2/job/MapStore2-Releaser/ws/web/target/mapstore.war) from the Releaser Jenkins build and upload it to github  
- [ ] Get the [latest mapstore2-YYYY.XX.mm-bin.zip](http://build.geo-solutions.it/jenkins/view/MapStore2/job/MapStore2-Releaser/ws/release/target/) from the Releaser Jenkins build and upload it to github
  > from the job [configuration page](http://build.geo-solutions.it/jenkins/view/MapStore2/job/MapStore2-Releaser/ws/) there is a link to access the job workspace to easily download the built WAR and binary package
- [ ] Publish the release
- [ ] Merge release branch into master
- [ ] Create a blog post 
- [ ] Write to the mailing list about the current release news and the next release major changes
- [ ] Update the release procedure if needed.
- [ ] Close this issue
- [ ] Close the related milestone
