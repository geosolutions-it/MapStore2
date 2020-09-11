/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {createSelector, createStructuredSelector} = require('reselect');
const {get, pick} = require('lodash');

const staticServicesSelector = (state) => get(state, "catalog.default.staticServices");
const servicesSelector = (state) => get(state, "catalog.services");
const servicesSelectorWithBackgrounds = createSelector(staticServicesSelector, servicesSelector, (staticServices, services) => ({
    ...services,
    ...(pick(staticServices, "default_map_backgrounds"))
}));
const selectedStaticServiceTypeSelector =
    (state) => get(state, `catalog.default.staticServices["${get(state, 'catalog.selectedService')}"].type`, "csw");
const {projectionSelector} = require('./map');

// Picks configured tile sizes from state, otherwise default is [256, 512]
const tileSizeOptionsSelector = state => get(state, 'catalog.default.tileSizes', [256, 512]);

module.exports = {
    groupSelector: (state) => get(state, "controls.metadataexplorer.group"),
    savingSelector: (state) => get(state, "catalog.saving"),
    resultSelector: (state) => get(state, "catalog.result"),
    serviceListOpenSelector: (state) => get(state, "catalog.openCatalogServiceList"),
    newServiceSelector: (state) => get(state, "catalog.newService"),
    staticServicesSelector,
    servicesSelector,
    servicesSelectorWithBackgrounds,
    newServiceTypeSelector: (state) => get(state, "catalog.newService.type", "csw"),
    selectedCatalogSelector: (state) => get(state, `catalog.services["${get(state, 'catalog.selectedService')}"]`),
    selectedStaticServiceTypeSelector,
    selectedServiceTypeSelector: (state) => get(state, `catalog.services["${get(state, 'catalog.selectedService')}"].type`, selectedStaticServiceTypeSelector(state)),
    selectedServiceLayerOptionsSelector: (state) => get(state, `catalog.services["${get(state, 'catalog.selectedService')}"].layerOptions`, {}),
    searchOptionsSelector: (state) => get(state, "catalog.searchOptions"),
    loadingErrorSelector: (state) => get(state, "catalog.loadingError"),
    loadingSelector: (state) => get(state, "catalog.loading", false),
    selectedServiceSelector: (state) => get(state, "catalog.selectedService"),
    modeSelector: (state) => get(state, "catalog.mode", "view"),
    layerErrorSelector: (state) => get(state, "catalog.layerError"),
    searchTextSelector: (state) => get(state, "catalog.searchOptions.text", ""),
    activeSelector: (state) => get(state, "controls.toolbar.active") === "metadataexplorer" || get(state, "controls.metadataexplorer.enabled"),
    authkeyParamNameSelector: (state) => {
        return (get(state, "localConfig.authenticationRules") || []).filter(a => a.method === "authkey").map(r => r.authkeyParamName) || [];
    },
    pageSizeSelector: (state) => get(state, "catalog.pageSize", 4),
    delayAutoSearchSelector: (state) => get(state, "catalog.delayAutoSearch", 1000),
    // information from the state needed to perform searches on catalog
    catalogSearchInfoSelector: createStructuredSelector({
        projection: projectionSelector
    }),
    tileSizeOptionsSelector
};
