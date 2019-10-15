/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {createSelector} = require('reselect');
const {get, pick} = require('lodash');

const defaultServicesSelector = (state) => get(state, "catalog.default.services");
const servicesSelector = (state) => get(state, "catalog.services");
const servicesSelectorWithBackgrounds = createSelector(defaultServicesSelector, servicesSelector, (defaultServices, services) => ({
    ...services,
    ...(pick(defaultServices, "default_map_backgrounds"))
}));

module.exports = {
    groupSelector: (state) => get(state, "controls.metadataexplorer.group"),
    savingSelector: (state) => get(state, "catalog.saving"),
    resultSelector: (state) => get(state, "catalog.result"),
    serviceListOpenSelector: (state) => get(state, "catalog.openCatalogServiceList"),
    newServiceSelector: (state) => get(state, "catalog.newService"),
    defaultServicesSelector,
    servicesSelector,
    servicesSelectorWithBackgrounds,
    newServiceTypeSelector: (state) => get(state, "catalog.newService.type", "csw"),
    selectedCatalogSelector: (state) => get(state, `catalog.services["${get(state, 'catalog.selectedService')}"]`),
    selectedServiceTypeSelector: (state) => get(state, `catalog.services["${get(state, 'catalog.selectedService')}"].type`, get(state, `catalog.default.services["${get(state, 'catalog.selectedService')}"].type`, "csw")),
    searchOptionsSelector: (state) => get(state, "catalog.searchOptions"),
    formatsSelector: (state) => get(state, "catalog.supportedFormats") || [{name: "csw", label: "CSW"}, {name: "wms", label: "WMS"}, {name: "wmts", label: "WMTS"}],
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
    delayAutoSearchSelector: (state) => get(state, "catalog.delayAutoSearch", 1000)
};
