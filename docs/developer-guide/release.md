# How to release
Below you can find the release procedure as a checklist. On each release it can be updated (if needed), copied and pasted into a GitHub issue, of course changing the release name.
Then you can check each entry on the GitHub issue when done until the release is end.

## Changelog generation

To generate the changelog for a specific release you can use [github_changelog_generator](https://github.com/skywinder/github-changelog-generator)  
The tool will overwrite the CHANGELOG.md file.

**Install (Ubuntu)**
```
sudo apt-get install ruby-dev
sudo gem install rake
sudo gem install github_changelog_generator
```

**Configure**
 * [Generate a github token](https://github.com/settings/tokens/new?description=GitHub%20Changelog%20Generator%20token) and place it in your .bashrc this:
```
 export CHANGELOG_GITHUB_TOKEN="«your-40-digit-github-token»"
```
as an alternative use --token

* cd to MapStore2
* edit `.github_changelog_generator` file :
   * set `since-tag ` (the first tag you want to exclude)
   * if you are creating the changelog before creating the tag set `future-release`=YYYY.NN.mm with the "release branch name" (the tag still needs to be generated)

For example the `.github_changelog_generator` file for the changes between 2017.02.00 and 2017.03.00 release can look like the following (**notice the initial 'v' for the tag**):

    future-release=2017.03.00
    since-tag=v2017.01.00

**Run**

Github REST API has some usage limits that don't allow to generate the full changelog for a big project like MapStore 2.

To update the changelog you should generate only the latest changes (from the previews release) and add it to the existing change-log. This is more or less the procedure:
 -specify the since-tag with the previous tag (e.g. `v2017.05.00`, notice the `v`) and the future-release name (e.g. `2015-06-00`).
 - backup CHANGELOG.md
 - run the changelog generator with: `github_changelog_generator --max-issues 1000` (**notice max-issues flag needed for large repositories**)
 - Merge the old CHANGELOG.md with the new, appending the new on top.

## Release Checklist
- [ ] Create an issue with this checklist in the release milestone.
- [ ] Create a branch (**YYYY.XX.mm**)  
- [ ] Change [QA Jenkins job](http://build.geo-solutions.it/jenkins/view/MapStore2/job/MapStore2-QA-Build/) to build the new branch, enable the job continuous deploy
- [ ] Test on QA [http://qa.mapstore2.geo-solutions.it/mapstore/](http://qa.mapstore2.geo-solutions.it/mapstore/)  
    * Any fix must be done on **YYYY.XX.mm**. The fixes will be manually merged on master
    * Test **everything**, not only the new features
- [ ] Generate the changelog with github_changelog_generator. [Instructions](https://dev.mapstore2.geo-solutions.it/mapstore/docs/release)
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
