# How to release

To create a new MapStore release, you need to:

- Create an issue of type `Mapstore Release` on GitHub by clicking [here](https://github.com/geosolutions-it/MapStore2/issues/new?assignees=&labels=internal&template=release_steps.md&title=) with the title of the release.
- Follow the checklist in the issue created.

Here below some details about changelog generation and naming conventions.

## Changelog generation

Generate new changelog by running this:

```sh
npm run generate:changelog <oldReleaseNumber>  <newReleaseNumber>

# usage
# generate:changelog 2022.01.00 2022.02.00
```

## Release Checklist

### naming conventions

#### release and tag

- **vYYYY.XX.mm** name of the release and tag. (e.g. `v2022.01.01`)
- **YYYY** is the year,
- **XX** is the incremental number of the release for the current year (starting from 01)
- **mm** is an incremental value (starting from 00) to increment for minor releases

#### stable branch

- **YYYY.XX.xx** name of stable branch (e.g. `2022.01.xx` )
- **YYYY** is the year
- **XX** is the incremental number of the release for the current year (starting from 01)
- **xx** is the fixed text `xx`
