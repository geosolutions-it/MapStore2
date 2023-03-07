---
name: QA Test Run
about: Includes all steps to follow for QA testing 
title: ''
labels: 'internal'
assignees: ''
---

## Description
<!-- Add here a few sentences describing the issue -->
Steps listed below must be followed for a complete functional test procedure in QA as expected for a new MS release.

## How to reproduce
<!-- A list of steps for the QA functional test run -->
- [ ] Ensure all test scenarios [here](https://studio.cucumber.io/projects/292756/test-runs) in Cucumber are properly updated 
- [ ] Create a new test run [here](https://studio.cucumber.io/projects/292756/test-runs) containing the needed/expected test scenarios  
- [ ] Ensure the MS stable branch YYYY.MM.xx/mm is properly updated and all lib dependencies are the [expected ones](https://github.com/geosolutions-it/MapStore2/wiki/MapStore-Release-Calendars) for the release (if a new version of a backend dependecy is expected, the related stable branch should be used for the MS QA branch) 
- [ ] Ensure the [MS QA instance](https://qa-mapstore.geosolutionsgroup.com/mapstore/#/) has been properly deployed by Jenkins
- [ ] Ensure the corresponding stable branch YYYY.MM.xx/mm for [MapStore Extension](https://github.com/geosolutions-it/MapStoreExtension) has been created and the related artifact generated from the corresponding [GHA](https://github.com/geosolutions-it/MapStoreExtension/actions)
- [ ] Execute Cucumber the test run in QA:
  - [ ] Updating scenarios with proper state and description in case of failure (new issues will be opened for necessary fixes after a review of test failures)
  - [ ] Fixing scenario definitions if necessary
  - [ ] Testing in QA the [MapStore Extension](https://github.com/geosolutions-it/MapStoreExtension) sample dewnloaded from the latest [GHA](https://github.com/geosolutions-it/MapStoreExtension/actions) run on the corresponding branch YYYY.MM.xx/mm  
- [ ] Report/list all relevant aspects coming from the test run execution in Cucumber Test Run description
- [ ] Close the issue 


## Other useful information
<!-- other relevant information to report -->
