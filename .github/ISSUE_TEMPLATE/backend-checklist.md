---
name: Backend checklist
about: Checklist when releasing a new ms version
title: ''
labels: ''
assignees: ''

---

## Description

Make sure that new changes to pom are reflected also into standard files.
In particular changes applied to pom.xml and java/web/pom.xml

These version must match

- [ ] platform BOM versions
  - [ ] tomcat.version
  - [ ] all the others
- [ ] Spring Framework & Security
  - [ ] all of them
- [ ] other dependencies
  - [ ] all of them
- [ ] MapStore‑specific
  - [ ] geostore-webapp.version
  - [ ] print-lib.version
  - [ ] http_proxy.version>

Also make sure that other changes other than the version are included
