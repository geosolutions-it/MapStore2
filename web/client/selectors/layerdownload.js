/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createSelector } from 'reselect';

import { isFeatureGridOpen } from './featuregrid';
import { getSelectedLayer } from './layers';
import { wfsFilter } from './query';

import { getTableWidgets } from './widgets';

export const layerDonwloadControlEnabledSelector = state => state?.controls?.layerdownload?.enabled;
export const downloadOptionsSelector = state => state?.layerdownload?.downloadOptions;
export const loadingSelector = state => state?.layerdownload?.loading;
export const checkingWPSAvailabilitySelector = state => state?.layerdownload?.checkingWPSAvailability;
export const wfsFormatsSelector = state => state?.layerdownload?.wfsFormats;
export const formatsLoadingSelector = state => state?.layerdownload?.formatsLoading;
export const wpsAvailableSelector = state => state?.layerdownload?.wpsAvailable;
export const serviceSelector = state => state?.layerdownload?.service;

export const downloadLayerSelector = state => state?.layerdownload?.downloadLayer;

export const wfsFilterSelector = createSelector(
    isFeatureGridOpen,
    wfsFilter,
    getSelectedLayer,
    downloadLayerSelector,
    getTableWidgets,
    (
        featureGridOpen,
        wfsFilterObj,
        mapLayer,
        downloadLayer,
        tableWidgets
    ) => {
        const selectedLayer = mapLayer || downloadLayer;
        const widget = tableWidgets.filter(w => w.id === downloadLayer?.widgetId)[0];
        return featureGridOpen ? wfsFilterObj || widget?.filter : selectedLayer?.name ? widget?.filter || {
            featureTypeName: selectedLayer.name,
            filterType: 'OGC',
            ogcVersion: '1.1.0'
        } : null;
    }
);
export const exportDataResultsControlEnabledSelector = state => state?.controls?.exportDataResults?.enabled;
export const exportDataResultsSelector = state => state?.layerdownload?.results;
export const showInfoBubbleSelector = state => state?.layerdownload?.showInfoBubble;
export const infoBubbleMessageSelector = state => state?.layerdownload?.infoBubbleMessage;
export const checkingExportDataEntriesSelector = state => state?.layerdownload?.checkingExportDataEntries;
