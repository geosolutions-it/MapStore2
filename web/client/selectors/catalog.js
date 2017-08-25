const {get} = require('lodash');

module.exports = {
    resultSelector: (state) => get(state, `catalog.result`),
    serviceListOpenSelector: (state) => get(state, `catalog.openCatalogServiceList`),
    newServiceSelector: (state) => get(state, `catalog.newService`),
    servicesSelector: (state) => get(state, `catalog.services`),
    newServiceTypeSelector: (state) => get(state, `catalog.newService.type`, 'csw'),
    selectedServiceTypeSelector: (state) => get(state, `catalog.services.${get(state, "catalog.selectedService")}.type`, 'csw'),
    searchOptionsSelector: (state) => get(state, `catalog.searchOptions`)
};
