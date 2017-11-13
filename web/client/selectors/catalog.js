const {get} = require('lodash');

module.exports = {
    savingSelector: (state) => get(state, "catalog.saving"),
    resultSelector: (state) => get(state, "catalog.result"),
    serviceListOpenSelector: (state) => get(state, "catalog.openCatalogServiceList"),
    newServiceSelector: (state) => get(state, "catalog.newService"),
    servicesSelector: (state) => get(state, "catalog.services"),
    newServiceTypeSelector: (state) => get(state, "catalog.newService.type", "csw"),
    selectedServiceTypeSelector: (state) => get(state, `catalog.services.${get(state, 'catalog.selectedService')}.type`, "csw"),
    searchOptionsSelector: (state) => get(state, "catalog.searchOptions"),
    formatsSelector: (state) => get(state, "catalog.supportedFormats") || [{name: "csw", label: "CSW"}, {name: "wms", label: "WMS"}, {name: "wmts", label: "WMTS"}],
    loadingErrorSelector: (state) => get(state, "catalog.loadingError"),
    selectedServiceSelector: (state) => get(state, "catalog.selectedService"),
    modeSelector: (state) => get(state, "catalog.mode", "view"),
    layerErrorSelector: (state) => get(state, "catalog.layerError"),
    activeSelector: (state) => get(state, "controls.toolbar.active") === "metadataexplorer" || get(state, "controls.metadataexplorer.enabled"),
    authkeyParamNameSelector: (state) => {
        return (get(state, "localConfig.authenticationRules") || []).filter(a => a.method === "authkey").map(r => r.authkeyParamName) || [];
    }
};
