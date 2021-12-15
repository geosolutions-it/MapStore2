/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

import {
    downloadFeatures,
    checkWPSAvailability,
    onDownloadOptionChange,
    onFormatOptionsFetch,
    clearDownloadOptions,
    removeExportDataResult,
    checkExportDataEntries
} from '../actions/layerdownload';
import { toggleControl } from '../actions/controls';

import {
    layerDonwloadControlEnabledSelector,
    downloadOptionsSelector,
    loadingSelector,
    wfsFormatsSelector,
    formatsLoadingSelector,
    serviceSelector,
    checkingWPSAvailabilitySelector,
    wfsFilterSelector,
    exportDataResultsControlEnabledSelector,
    exportDataResultsSelector,
    showInfoBubbleSelector,
    infoBubbleMessageSelector,
    checkingExportDataEntriesSelector
} from '../selectors/layerdownload';
import { wfsURL } from '../selectors/query';
import { getSelectedLayer } from '../selectors/layers';
import { currentLocaleSelector } from '../selectors/locale';

import DownloadDialog from '../components/data/download/DownloadDialog';
import ExportDataResultsComponent from '../components/data/download/ExportDataResultsComponent';
import FeatureEditorButton from '../components/data/download/FeatureEditorButton';

import * as epics from '../epics/layerdownload';
import layerdownload from '../reducers/layerdownload';

import { createPlugin } from '../utils/PluginsUtils';

/**
 * Provides advanced data export functionalities using [WPS download process](https://docs.geoserver.org/stable/en/user/community/wps-download/index.html) or using WFS service, if WPS download process is missing.
 * @memberof plugins
 * @name LayerDownload
 * @class
 * @prop {object[]} formats An array of name-label objects for the allowed formats available. This object can contain an optional `validServices` entry, that contains an array of the  services where the formats should be used. If no "wfs" service is configured, the plugin will retrieve the list from the "WFS" service.
 * @prop {object[]} srsList An array of name-label objects for the allowed srs available. Use name:'native' to omit srsName param in wfs filter
 * @prop {string} defaultSrs Default selected srs
 * @prop {string} closeGlyph The icon to use for close the dialog
 * @example
 * {
 *  "name": "LayerDownload",
 *  "cfg": {
 *    "formats": [
 *            {"name": "csv", "label": "csv"},
 *            {"name": "shape-zip", "label": "shape-zip", "validServices": ["wfs"]},
 *            {"name": "excel", "label": "excel", "validServices": ["wfs", "wps"]},
 *            {"name": "excel2007", "label": "excel2007"},
 *            {"name": "dxf-zip", "label": "dxf-zip"}
 *    ],
 *     "srsList": [
 *            {"name": "native", "label": "Native"},
 *            {"name": "EPSG:4326", "label": "WGS84"}
 *    ],
 *     "defaultSrs": "native"
 *  }
 * }
 * // it is possible to support GeoPackage format when the targeted GeoServer uses wps download extensions
 * // here an example of configuration that include GeoPackage for wps
 *
 *  {
 *      "name": "LayerDownload",
 *      "cfg": {
 *          "formats": [
 *              { "name": "application/json", "label": "GeoJSON", "type": "vector", "validServices": ["wps"] },
 *              { "name": "application/arcgrid", "label": "ArcGrid", "type": "raster", "validServices": ["wps"] },
 *              { "name": "image/tiff", "label": "TIFF", "type": "raster", "validServices": ["wps"] },
 *              { "name": "image/png", "label": "PNG", "type": "raster", "validServices": ["wps"] },
 *              { "name": "image/jpeg", "label": "JPEG", "type": "raster", "validServices": ["wps"]},
 *              { "name": "application/wfs-collection-1.0", "label": "wfs-collection-1.0", "type": "vector", "validServices": ["wps"] },
 *              { "name": "application/wfs-collection-1.1", "label": "wfs-collection-1.1", "type": "vector", "validServices": ["wps"] },
 *              { "name": "application/zip", "label": "Shapefile", "type": "vector", "validServices": ["wps"] },
 *              { "name": "text/csv", "label": "CSV", "type": "vector", "validServices": ["wps"] },
 *
 *              { "name": "application/geopackage+sqlite3", "label": "GeoPackage", "type": "vector", "validServices": ["wps"] },
 *              { "name": "application/geopackage+sqlite3", "label": "GeoPackage", "type": "raster", "validServices": ["wps"] }
 *          ]
 *      }
 *  }
 */
const LayerDownloadPlugin = createPlugin('LayerDownload', {
    component: connect(createStructuredSelector({
        url: wfsURL,
        filterObj: wfsFilterSelector,
        enabled: layerDonwloadControlEnabledSelector,
        downloadOptions: downloadOptionsSelector,
        loading: loadingSelector,
        wfsFormats: wfsFormatsSelector,
        formatsLoading: formatsLoadingSelector,
        layer: getSelectedLayer,
        service: serviceSelector,
        checkingWPSAvailability: checkingWPSAvailabilitySelector,
        virtualScroll: state => state && state.featuregrid && state.featuregrid.virtualScroll
    }), {
        onExport: downloadFeatures,
        onDownloadOptionChange,
        onClearDownloadOptions: clearDownloadOptions,
        onFormatOptionsFetch,
        onCheckWPSAvailability: checkWPSAvailability,
        onClose: () => toggleControl("layerdownload")
    })(DownloadDialog),
    containers: {
        TOC: {
            doNotHide: true,
            name: "LayerDownload"
        },
        FeatureEditor: {
            doNotHide: true,
            name: "LayerDownload",
            position: 20,
            target: "toolbar",
            Component: connect(createStructuredSelector({
                isDownloadOpen: state =>  state?.controls?.layerdownload?.enabled
            }), {
                onClick: () => toggleControl("layerdownload")
            })(FeatureEditorButton)
        },
        MapFooter: {
            doNotHide: true,
            name: "LayerDownload",
            position: 1,
            tool: connect(createStructuredSelector({
                active: exportDataResultsControlEnabledSelector,
                showInfoBubble: showInfoBubbleSelector,
                infoBubbleMessage: infoBubbleMessageSelector,
                checkingExportDataEntries: checkingExportDataEntriesSelector,
                results: exportDataResultsSelector,
                currentLocale: currentLocaleSelector
            }), {
                onToggle: toggleControl.bind(null, 'exportDataResults', 'enabled'),
                onActive: checkExportDataEntries,
                onRemoveResult: removeExportDataResult
            })(ExportDataResultsComponent)
        }
    },
    epics,
    reducers: {
        layerdownload
    }
});

export default LayerDownloadPlugin;
