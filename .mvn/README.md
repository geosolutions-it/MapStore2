# .mvn

Marks the root of the MapStore Maven project. Maven looks for this directory to set
`maven.multiModuleProjectDirectory` to this folder, wherever `mvn` is launched from in the
repository, including from inside a single module.

The GeoStore build relies on it to find its QA rules (`backend/geostore/qa`, used by the PMD
and SpotBugs checks), so this directory must stay.
