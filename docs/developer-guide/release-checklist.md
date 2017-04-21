# How to release
Below you can find the release procedure as a checklist. On each release it can be updated (if needed), copied and pasted into a GitHub issue, of course changing the release name.
Then you can check each entry on the GitHub issue when done until the release is end.

## Release Checklist

- [ ] Create a branch (**YYYY.XX.00**)  
- [ ] Generate the changelog with github_changelog_generator
- [ ] Change [QA Jenkins job](http://build.geo-solutions.it/jenkins/view/MapStore2/job/MapStore2-QA-Build/) to build the new branch, enable the job continuous deploy
- [ ] Test on QA [http://qa.mapstore2.geo-solutions.it/mapstore/](http://qa.mapstore2.geo-solutions.it/mapstore/)  
    * Any fix must be done on both **YYYY.XX.00** and **master** branch  
    * Test **everything**, not only the new features
- [ ] Create a [github release](https://github.com/geosolutions-it/MapStore2/releases) pointing to the branch **YYYY.XX.00**.  
  > The Release name should follow be named YYYY.XX.mm where YYYY is the year, XX is the incremental number of the release for the current year (starting from 01) and the second number mm is an incremental value (starting from 00) to increment for minor releases.
- [ ] Get the [latest mapstore.war](http://build.geo-solutions.it/jenkins/job/MapStore2-QA-Build/ws/web/target/mapstore.war) from the QA Jenkins build and upload it to github  
- [ ] Get the [latest mapstore2-bin.zip](http://build.geo-solutions.it/jenkins/job/MapStore2-QA-Build/ws/release/target/mapstore2-1.0-SNAPSHOT-bin.zip) from the QA Jenkins build and upload it to github
  > from the job configuration page there is a link to access the job workspace to easily download the built WAR and binary package
- [ ] Write release notes with links to closed issues
- [ ] EITHER launch Jenkins job [MapStore2-Releaser](http://build.geo-solutions.it/jenkins/job/MapStore2-Releaser/) OR upload the war to stable  
- [ ] Close the related milestone
- [ ] Merge release branch into master
- [ ] Create a blog post
- [ ] Write to the mailing list about the current release news and the next release major changes
