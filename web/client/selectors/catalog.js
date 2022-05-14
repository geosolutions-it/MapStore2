/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createSelector, createStructuredSelector } from 'reselect';
import { get } from 'lodash';

import { projectionSelector } from './map';
import { DEFAULT_FORMAT_WMS, getUniqueInfoFormats } from '../api/WMS';

export const staticServicesSelector = (state) => get(state, "catalog.default.staticServices");
export const servicesSelector = (state) => get(state, "catalog.services");
export const servicesSelectorWithBackgrounds = createSelector(staticServicesSelector, servicesSelector, (staticServices, services) => {
    const backgroundService = staticServices?.default_map_backgrounds;
    if (backgroundService) {
        // static services are readOnly by default
        backgroundService.readOnly = true;
        return {...services, default_map_backgrounds: backgroundService};
    }
    return services;
});
export const selectedStaticServiceTypeSelector =
    (state) => get(state, `catalog.default.staticServices["${get(state, 'catalog.selectedService')}"].type`, "csw");

// Picks configured tile sizes from state, otherwise default is [256, 512]
export const tileSizeOptionsSelector = state => get(state, 'catalog.default.tileSizes', [256, 512]);

export const groupSelector = (state) => get(state, "controls.metadataexplorer.group");
export const savingSelector = (state) => get(state, "catalog.saving");
export const resultSelector = (state) => get(state, "catalog.result");
export const serviceListOpenSelector = (state) => get(state, "catalog.openCatalogServiceList");
export const newServiceSelector = (state) => get(state, "catalog.newService");
export const newServiceTypeSelector = (state) => get(state, "catalog.newService.type", "csw");
export const selectedCatalogSelector = (state) => get(state, `catalog.services["${get(state, 'catalog.selectedService')}"]`);
export const selectedServiceTypeSelector = (state) => get(state, `catalog.services["${get(state, 'catalog.selectedService')}"].type`, selectedStaticServiceTypeSelector(state));
export const selectedServiceLayerOptionsSelector = (state) => get(state, `catalog.services["${get(state, 'catalog.selectedService')}"].layerOptions`, {});
export const searchOptionsSelector = (state) => get(state, "catalog.searchOptions");
export const loadingErrorSelector = (state) => get(state, "catalog.loadingError");
export const loadingSelector = (state) => get(state, "catalog.loading", false);
export const selectedServiceSelector = (state) => get(state, "catalog.selectedService");
export const modeSelector = (state) => get(state, "catalog.mode", "view");
export const layerErrorSelector = (state) => get(state, "catalog.layerError");
export const searchTextSelector = (state) => get(state, "catalog.searchOptions.text", "");
export const isActiveSelector = (state) => get(state, "controls.toolbar.active") === "metadataexplorer" || get(state, "controls.metadataexplorer.enabled");
export const authkeyParamNameSelector = (state) => {
    return (get(state, "localConfig.authenticationRules") || []).filter(a => a.method === "authkey").map(r => r.authkeyParamName) || [];
};
export const pageSizeSelector = (state) => get(state, "catalog.pageSize", 4);
export const delayAutoSearchSelector = (state) => get(state, "catalog.delayAutoSearch", 1000);
// information from the state needed to perform searches on catalog
export const catalogSearchInfoSelector = createStructuredSelector({
    projection: projectionSelector
});
export const formatsLoadingSelector = (state) => get(state, "catalog.formatsLoading", false);
export const getSupportedFormatsSelector = (state) => get(state, "catalog.newService.supportedFormats.imageFormats", DEFAULT_FORMAT_WMS);
export const getSupportedGFIFormatsSelector = (state) => get(state, "catalog.newService.supportedFormats.infoFormats", getUniqueInfoFormats());
export const getFormatUrlUsedSelector = (state) => get(state, "catalog.newService.formatUrlUsed", '');
