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
    clearDownloadOptions
} from '../actions/layerdownload';
import { toggleControl, setControlProperty } from '../actions/controls';

import {
    layerDonwloadControlEnabledSelector,
    downloadOptionsSelector,
    loadingSelector,
    wfsFormatsSelector,
    formatsLoadingSelector,
    serviceSelector,
    checkingWPSAvailabilitySelector,
    wfsFilterSelector
} from '../selectors/layerdownload';
import { wfsURL } from '../selectors/query';
import { getSelectedLayer } from '../selectors/layers';

import DownloadDialog from '../components/data/download/DownloadDialog';

import * as epics from '../epics/layerdownload';
import layerdownload from '../reducers/layerdownload';

import { createPlugin } from '../utils/PluginsUtils';

/**
 * Provides advanced export functionalities using WFS and WPS.
 * @memberof plugins
 * @name LayerDownload
 * @class
 * @prop {object[]} formats An array of name-label objects for the allowed formats available.
 * @prop {object[]} srsList An array of name-label objects for the allowed srs available. Use name:'native' to omit srsName param in wfs filter
 * @prop {string} defaultSrs Deafult selected srs
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
        onMount: () => setControlProperty("layerdownload", "available", true),
        onUnmount: () => setControlProperty("layerdownload", "available", false),
        onClose: () => toggleControl("layerdownload")
    })(DownloadDialog),
    containers: {
        TOC: {
            doNotHide: true,
            name: "LayerDownload"
        }
    },
    epics,
    reducers: {
        layerdownload
    }
});

export default LayerDownloadPlugin;
