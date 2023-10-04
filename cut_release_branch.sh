

MAPFISH_GROUP=org.mapfish.print
MAPFISH_VERSION=2.3-SNAPSHOT
GEOSTORE_GROUP=it.geosolutions.geostore
GEOSTORE_VERSION=2.2-SNAPSHOT
HTTP_PROXY_GROUP=proxy
HTTP_PROXY_VERSION=1.5-SNAPSHOT


### TODO: create branch for release
### TODO: checkout to release branch
### TODO: fix versions to not use snapshots anymore.

# Find all pom.xml files and update-dependencies on them
echo "Updating versions on release branch"
POM_FILES=$(git ls-files . | grep 'pom\.xml$' | grep -v 'project/standard/templates/backend/pom\.xml$'| grep -v 'project/standard/templates/pom\.xml$');
for POM_FILE in $POM_FILES; do
    mvn versions:use-dep-version -f $POM_FILE -Dincludes=$MAPFISH_GROUP -DdepVersion=$MAPFISH_VERSION -DforceVersion=true -DgenerateBackupPoms=false -DautoVersionSubmodules=true -Pprinting,binary,printingbundle
    mvn versions:use-dep-version -f $POM_FILE -Dincludes=$GEOSTORE_GROUP -DdepVersion=$GEOSTORE_VERSION -DforceVersion=true -DgenerateBackupPoms=false -DautoVersionSubmodules=true -Pprinting,binary,printingbundle
    mvn versions:use-dep-version -f $POM_FILE -Dincludes=$HTTP_PROXY_GROUP -DdepVersion=$HTTP_PROXY_VERSION -DforceVersion=true -DgenerateBackupPoms=false -DautoVersionSubmodules=true -Pprinting,binary,printingbundle
done
echo $POM_FILES | xargs git add

### TODO: commit on release branch
### TODO: push the new release branch

#
# Update version of java packages
#
echo "Updating versions on master branch"
### TODO: Checkout master
OLD_JAVA_VERSION=$(mvn help:evaluate -Dexpression=project.version -q -DforceStdout)
echo "Incrementing java packages versions"
mvn -B release:update-versions -DautoVersionSubmodules=true -Pprinting,binary,printingbundle
NEXT_JAVA_VERSION=$(mvn help:evaluate -Dexpression=project.version -q -DforceStdout)
echo "Java packages versions updated from $OLD_JAVA_VERSION to $NEXT_JAVA_VERSION"
# Alternative
# mvn versions:set -DnewVersion=<SNAPSHOT_VERSION> -DprocessAllModules -DgenerateBackupPoms=false
### TODO: increase dependency of project to new version
echo "Updating project dependency to new version"
mvn versions:use-dep-version -f project/standard/templates/web/pom.xml -Dincludes=it.geosolutions.mapstore -DdepVersion=$NEXT_JAVA_VERSION -DforceVersion=true -DgenerateBackupPoms=false
# Increase release minor version
echo "Updating project version to new version in package.json"
npm version minor --git-tag-version=false
### TODO: commit to master (do pull request)
