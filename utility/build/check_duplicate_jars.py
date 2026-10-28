"""
check_duplicate_jars.py

Fails when the given WAR or ZIP archives, deployed together, put two versions of
the same library in WEB-INF/lib. Which of the two the servlet container loads
first depends on the environment, so such a WAR must not be released.

The archives are merged the way they are deployed: the printing bundle is
unpacked over the MapStore WAR, so a jar with the same file name in both is
the same file, not a duplicate.

A library is identified by the jar file name without its version
(e.g. log4j-api-2.26.1.jar -> log4j-api). Two jars with the same name are
reported only when they contain at least one class in common: this keeps apart
libraries that share an artifactId but not their packages, such as Jackson 2
(com.fasterxml.jackson.core:jackson-core) and Jackson 3
(tools.jackson.core:jackson-core).

Usage example:
  python utility/build/check_duplicate_jars.py \\
      product/target/mapstore.war \\
      backend/printing/target/mapstore-printing.zip

Exit status: 0 when no library is duplicated, 1 otherwise.
"""

import argparse
import io
import os
import re
import sys
import zipfile
from collections import defaultdict

LIB_ENTRY = re.compile(r"^WEB-INF/lib/([^/]+\.jar)$")
# the name ends before the first "-<digit>": guava-32.0.0-jre.jar -> guava
JAR_NAME = re.compile(r"^(.+?)-\d.*\.jar$")


def library_name(jar_file_name):
    match = JAR_NAME.match(jar_file_name)
    return match.group(1) if match else jar_file_name[: -len(".jar")]


def class_entries(jar_bytes):
    with zipfile.ZipFile(io.BytesIO(jar_bytes)) as jar:
        return {
            name
            for name in jar.namelist()
            if name.endswith(".class")
            and not name.startswith("META-INF/")
            and not name.endswith("module-info.class")
        }


def collect_jars(archives):
    """Returns {jar file name: (archive path, jar bytes)}, merged as deployed."""
    jars = {}
    for archive in archives:
        with zipfile.ZipFile(archive) as zipped:
            for entry in zipped.namelist():
                match = LIB_ENTRY.match(entry)
                if match:
                    jars[match.group(1)] = (archive, zipped.read(entry))
    return jars


def find_duplicates(jars):
    by_name = defaultdict(list)
    for jar_file_name in jars:
        by_name[library_name(jar_file_name)].append(jar_file_name)

    duplicates = []
    for name, jar_file_names in sorted(by_name.items()):
        if len(jar_file_names) < 2:
            continue
        classes = {jar: class_entries(jars[jar][1]) for jar in jar_file_names}
        clashing = sorted(
            jar
            for jar in jar_file_names
            if any(classes[jar] & classes[other] for other in jar_file_names if other != jar)
        )
        if clashing:
            duplicates.append((name, clashing))
    return duplicates


def main():
    parser = argparse.ArgumentParser(
        description="Fail when WAR/ZIP archives deployed together contain two versions of the same jar."
    )
    parser.add_argument("archives", nargs="+", help="WAR or ZIP archives, in deploy order")
    args = parser.parse_args()

    for archive in args.archives:
        if not os.path.isfile(archive):
            parser.error(f"archive not found: {archive}")

    jars = collect_jars(args.archives)
    duplicates = find_duplicates(jars)
    checked = ", ".join(args.archives)

    if not duplicates:
        print(f"No duplicated libraries among {len(jars)} jars in {checked}")
        return 0

    in_github_actions = os.environ.get("GITHUB_ACTIONS") == "true"
    print(f"Libraries packaged in more than one version in {checked}:")
    for name, jar_file_names in duplicates:
        found = ", ".join(f"{jar} ({jars[jar][0]})" for jar in jar_file_names)
        print(f"  {name}: {found}")
        if in_github_actions:
            print(f"::error title=Duplicated library {name}::{found}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
