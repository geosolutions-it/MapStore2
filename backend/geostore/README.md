![Build Status](https://github.com/geosolutions-it/geostore/actions/workflows/CI.yml/badge.svg)
[![Coverage Status](https://coveralls.io/repos/github/geosolutions-it/geostore/badge.svg?branch=master)](https://coveralls.io/github/geosolutions-it/geostore?branch=master)

[GeoStore](https://github.com/geosolutions-it/geostore) is an open source Java enterprise application for storing, searching and retrieving data on the fly.

GeoStore performs authentication internally (auth framework shall be pluggable), and internal authorization rules grant permissions on single Resources or whole Categories.

A comprehensive [REST API](https://github.com/geosolutions-it/geostore/wiki/REST-API) allows an easy handling of internal resources, so that client side applications can easily query the store, while remote server side application can integrate with GeoStore using the GeoStoreClient, an utility java class that hides the REST communications complexities.

# Documentation

For more information check the [GeoStore wiki](https://github.com/geosolutions-it/geostore/wiki/Documentation-index) .

## Release process

The release procedure is essentially made of 2 steps:

- **Cut major branch**
- Effective **Release**

The project is developed on the main (master) branch, containing the latest `-SNAPSHOT` version of the modules of the project. When a major release starts the validation process, a new *release branch* is created (see [Cut-Release](#cut-release-branch), named `<major-version>.xx`.
After this on the main (master) branch the `-SNAPSHOT` version of the modules is increased and from this point the main branch will include commits for the next major version of the project.

When the validation process is completed and all the fixes have been applied to the *release branch*, the version of the java modules is fixed, commit is tagged with the number of the release and the Github *release* is published. See [Release](#release).

After this on the *release brach* the `-SNAPSHOT` version of the modules is restored so that it is possible to continue applying fixes and minor improvements, creating more releases on it with the same procedure, until end of maintainance.

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

# License

**GeoStore** core modules are free and Open Source software, released under the [GPL v3](http://www.gnu.org/licenses/gpl.html) license.

# Professional Support

GeoStore is being developed by [GeoSolutions](http://www.geo-solutions.it/) hence you can talk to us for professional support. Anyway the project is a real Open Source project hence you can contribute to it (see section below).

# Contributing

We welcome contributions in any form:

- pull requests for new features
- pull requests for bug fixes
- pull requests for documentation
- funding for any combination of the above
