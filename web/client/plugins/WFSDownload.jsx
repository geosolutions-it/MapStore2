/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {connect} = require('react-redux');
const {downloadFeatures, onDownloadOptionChange, onFormatOptionsFetch} = require('../actions/wfsdownload');
const {toggleControl, setControlProperty} = require('../actions/controls');

const {createSelector} = require('reselect');
const {wfsURL, wfsFilter} = require('../selectors/query');
const {getSelectedLayer} = require('../selectors/layers');

const DownloadDialog = require('../components/data/download/DownloadDialog');
/**
 * Provides advanced export functionalities using WFS.
 * @memberof plugins
 * @name WFSDownload
 * @class
 * @prop {object[]} formats An array of name-label objects for the allowed formats available.
 * @prop {object[]} srsList An array of name-label objects for the allowed srs available. Use name:'native' to omit srsName param in wfs filter
 * @prop {string} defaultSrs Deafult selected srs
 * @prop {string} closeGlyph The icon to use for close the dialog
 * @example
 * {
 *  "name": "WFSDownload",
 *  "cfg": {
 *    "formats": [
 *            {"name": "csv", "label": "csv"},
 *            {"name": "shape-zip", "label": "shape-zip"},
 *            {"name": "excel", "label": "excel"},
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
module.exports = {
    WFSDownloadPlugin: connect(createSelector(
        wfsURL,
        wfsFilter,
        state => state && state.controls && state.controls.wfsdownload && state.controls.wfsdownload.enabled,
        state => state && state.wfsdownload && state.wfsdownload.downloadOptions,
        state => state && state.wfsdownload && state.wfsdownload.loading,
        state => state && state.wfsdownload && state.wfsdownload.wfsFormats,
        state => state && state.wfsdownload && state.wfsdownload.formatsLoading,
        getSelectedLayer,
        state => state && state.featuregrid && state.featuregrid.virtualScroll,
        (url, filterObj, enabled, downloadOptions, loading, wfsFormats, formatsLoading, layer, virtualScroll) => ({
            url,
            filterObj,
            enabled,
            downloadOptions,
            loading,
            wfsFormats,
            formatsLoading,
            layer,
            virtualScroll
        })
    ), {
        onExport: downloadFeatures,
        onDownloadOptionChange,
        onFormatOptionsFetch,
        onMount: () => setControlProperty("wfsdownload", "available", true),
        onUnmount: () => setControlProperty("wfsdownload", "available", false),
        onClose: () => toggleControl("wfsdownload")
    }
    )(DownloadDialog),
    epics: require('../epics/wfsdownload'),
    reducers: {
        wfsdownload: require('../reducers/wfsdownload')
    }
};
