# Script to check the version format to avoid typos and mistakes.
# WIP: This script is not used in the workflow yet.

VERSION=$1

echo "Checking version format for version: $VERSION"

if [[ ! "$VERSION" =~ ^[0-9]+\.[0-9]+(\.[0-9]+)?(-SNAPSHOT)?$ ]]; then
  echo "Invalid version format: $VERSION"
  exit 1
fi

echo "Version format is valid: $VERSION"VERSION=${{ github.event.inputs.version }}

echo "Checking version format for version: $VERSION"

if [[ ! "$VERSION" =~ ^[0-9]+\.[0-9]+(\.[0-9]+)?(-SNAPSHOT)?$ ]]; then
  echo "Invalid version format: $VERSION"
  exit 1
fi

echo "Version format is valid: $VERSION"
