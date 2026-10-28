![Build Status](https://github.com/geosolutions-it/http-proxy/actions/workflows/CI.yml/badge.svg)

http-proxy is a simple Java based HTTP Proxy that can be used to make cross origin calls from JavaScript based web applications.

It is free and Open Source, for information on the license please see the LICENSE file.

## Release process 

The release procedure is essentially made of 2 steps: 
- **Cut major branch**
- Effective **Release**

The project is developed on the main (master) branch, containing the latest `-SNAPSHOT` version of the modules of the project. When a major release starts the validation process, a new *release branch* is created (see [Cut-Release](#cut-Release-branch), named `<major-version>.xx`. 
After this on the main (master) branch the `-SNAPSHOT` version of the modules is increased and from this point the main branch will include commits for the next major version of the project.

When the validation process is completed and all the fixes have been applied to the *release branch*, the version of the java modules is fixed, commit is tagged with the number of the release and the Github *release* is published. See [Release](#release).

After this on the release brach the -SNAPSHOT version of the modules is restored so that it is possible to continue applying fixes and minor improvements, creating more releases on it with the same procedure, until end of maintainance.

Here the steps to follow for executing the 2 procedures :

### Cut-Release branch

1. Run the workflow [Cut Release branch](../../actions/workflows/cut-major-branch.yml) passing 
  - Branch Master
  - current version  
  - next version 
  - main branch (keep `master`)
  - other options (can be left as default)
2. Merge the PR that is generated, if not merged automatically

### Release

1. Run the workflow [Release](../../actions/workflows/release.yml) with the folling parameters: 
 - select the branch to use (e.g. `2.1.x`)
 - version to release (e.g. `2.1.0`)
 - base version (e.g. `2.1`)

The release will be automatically published on GitHub. Packages will be automatically deployed on maven repository.


## Relevant Workflows

- [CI](../../actions/workflows/CI.yml): Automatically does tests for pull request or commits on `master`. For commits on the main repo (e.g. when PR are merged on `master` or stable branches, the workflow publish also the artifacts on [GeoSolutions Maven Repository](https://maven.geo-solutions.it)
- **[Cut release branch](../../actions/workflows/cut-major-branch.yml)**: (`cut-major-branch.yml`): Manually triggered workflow that allows to create a stable branch named `<current-version>.x` and create a pull request for updating `master` branch `-SNAPSHOT` version with the new data. 
- **[Release](../../actions/workflows/release.yml)**: (`cut-major-branch.yml`): Manually triggered workflow to apply to the stable branch that fixes the maven modules versions, tags the commit, build and deploy artifacts, restores snapshot versions and publish a Github release on the tagged commit.
   
   
