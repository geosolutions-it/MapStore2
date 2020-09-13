/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { FORMAT_OPTIONS_FETCH, DOWNLOAD_FEATURES, onDownloadFinished, updateFormats, onDownloadOptionChange} = require('../actions/wfsdownload');
const {cleanDuplicatedQuestionMarks} = require('../utils/ConfigUtils');

const {TOGGLE_CONTROL, toggleControl} = require('../actions/controls');
const {queryPanelSelector, wfsDownloadSelector} = require('../selectors/controls');
const {DOWNLOAD} = require('../actions/layers');
const {createQuery} = require('../actions/wfsquery');
const {error} = require('../actions/notifications');
const Rx = require('rxjs');
const {get, find, pick, toPairs} = require('lodash');
const {saveAs} = require('file-saver');
const axios = require('axios');
const FilterUtils = require('../utils/FilterUtils');
const {getByOutputFormat} = require('../utils/FileFormatUtils');
const {getLayerWFSCapabilities} = require('../observables/wfs');


const DOWNLOAD_FORMATS_LOOKUP = {
    "gml3": "GML3.1",
    "GML2": "GML2",
    "DXF-ZIP": "DXF-ZIP",
    "application/vnd.google-earth.kml+xml": "KML",
    "OGR-CSV": "OGR-CSV",
    "OGR-FileGDB": "OGR-GeoDatabase",
    "OGR-GPKG": "OGR-GeoPackage",
    "OGR-KML": "OGR-KML",
    "OGR-MIF": "OGR-MIF",
    "OGR-TAB": "OGR-TAB",
    "SHAPE-ZIP": "Shapefile",
    "gml32": "GML3.2",
    "application/json": "GeoJSON",
    "csv": "CSV",
    "application/x-gpkg": "GeoPackage",
    "excel": "excel",
    "excel2007": "excel2007"
};

const hasOutputFormat = (data) => {
    const operation = get(data, "WFS_Capabilities.OperationsMetadata.Operation");
    const getFeature = find(operation, function(o) { return o.name === 'GetFeature'; });
    const parameter = get(getFeature, "Parameter");
    const outputFormatValue = find(parameter, function(o) { return o.name === 'outputFormat'; }).Value;
    const pickedObj = pick(DOWNLOAD_FORMATS_LOOKUP, outputFormatValue);
    return toPairs(pickedObj).map(([prop, value]) => ({ name: prop, label: value }));
};

const getWFSFeature = ({url, filterObj = {}, downloadOptions = {}} = {}) => {
    const data = FilterUtils.toOGCFilter(filterObj.featureTypeName, filterObj, filterObj.ogcVersion, filterObj.sortOptions, false, null, null, downloadOptions.selectedSrs);
    return Rx.Observable.defer( () =>
        axios.post(cleanDuplicatedQuestionMarks(url + `?service=WFS&outputFormat=${downloadOptions.selectedFormat}`), data, {
            timeout: 60000,
            responseType: 'arraybuffer',
            headers: {'Content-Type': 'application/xml'}
        }));
};
const getFileName = action => {
    const name = get(action, "filterObj.featureTypeName");
    const format = getByOutputFormat(get(action, "downloadOptions.selectedFormat"));
    if (format && format.extension) {
        return name + "." + format.extension;
    }
    return name;
};
const getDefaultSortOptions = (attribute) => {
    return attribute ? { sortBy: attribute, sortOrder: 'A'} : {};
};
const getFirstAttribute = (state)=> {
    return state.query && state.query.featureTypes && state.query.featureTypes[state.query.typeName] && state.query.featureTypes[state.query.typeName].attributes && state.query.featureTypes[state.query.typeName].attributes[0] && state.query.featureTypes[state.query.typeName].attributes[0].attribute || null;
};
/*
const str2bytes = (str) => {
    var bytes = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
        bytes[i] = str.charCodeAt(i);
    }
    return bytes;
};
*/
module.exports = {
    openDownloadTool: (action$) =>
        action$.ofType(DOWNLOAD)
            .switchMap((action) => {
                return Rx.Observable.from([
                    toggleControl("wfsdownload"),
                    onDownloadOptionChange("singlePage", false),
                    createQuery(action.layer.url, {featureTypeName: action.layer.name})
                ]);
            }),
    fetchFormatsWFSDownload: (action$) =>
        action$.ofType(FORMAT_OPTIONS_FETCH)
            .switchMap( action => {
                return getLayerWFSCapabilities(action)
                    .map((data) => {
                        return updateFormats(hasOutputFormat(data));
                    });
            }),
    startFeatureExportDownload: (action$, store) =>
        action$.ofType(DOWNLOAD_FEATURES).switchMap(action => {
            const {virtualScroll = false} = (store.getState()).featuregrid;
            return getWFSFeature({
                url: action.url,
                downloadOptions: action.downloadOptions,
                filterObj: {
                    ...action.filterObj,
                    pagination: !virtualScroll && get(action, "downloadOptions.singlePage") ? action.filterObj && action.filterObj.pagination : null
                }
            })
                .do(({data, headers}) => {
                    if (headers["content-type"] === "application/xml") { // TODO add expected mimetypes in the case you want application/dxf
                        let xml = String.fromCharCode.apply(null, new Uint8Array(data));
                        if (xml.indexOf("<ows:ExceptionReport") === 0 ) {
                            throw xml;
                        }
                    }
                })
                .catch( () => {
                    return getWFSFeature({
                        url: action.url,
                        downloadOptions: action.downloadOptions,
                        filterObj: {
                            ...action.filterObj,
                            pagination: !virtualScroll && get(action, "downloadOptions.singlePage") ? action.filterObj && action.filterObj.pagination : null,
                            sortOptions: getDefaultSortOptions(getFirstAttribute(store.getState()))
                        }
                    }).do(({data, headers}) => {
                        if (headers["content-type"] === "application/xml") { // TODO add expected mimetypes in the case you want application/dxf
                            let xml = String.fromCharCode.apply(null, new Uint8Array(data));
                            if (xml.indexOf("<ows:ExceptionReport") === 0 ) {
                                throw xml;
                            }
                        }
                        saveAs(new Blob([data], {type: headers && headers["content-type"]}), getFileName(action));
                    });
                }).do(({data, headers}) => {
                    saveAs(new Blob([data], {type: headers && headers["content-type"]}), getFileName(action));
                })
                .map( () => onDownloadFinished() )
                .catch( (e) => Rx.Observable.of(
                    error({
                        error: e,
                        title: "wfsdownload.error.title",
                        message: "wfsdownload.error.invalidOutputFormat",
                        autoDismiss: 5,
                        position: "tr"
                    }),
                    onDownloadFinished())
                );
        }),
    closeExportDownload: (action$, store) =>
        action$.ofType(TOGGLE_CONTROL)
            .filter((a) => a.control === "queryPanel" && !queryPanelSelector(store.getState()) && wfsDownloadSelector(store.getState()))
            .switchMap( () => Rx.Observable.of(toggleControl("wfsdownload")))
};
