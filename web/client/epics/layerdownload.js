/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Rx from 'rxjs';
import { get, isNil, find, pick, toPairs, castArray, isEmpty } from 'lodash';
import { saveAs } from 'file-saver';
import uuidv1 from 'uuid/v1';
import { LOCATION_CHANGE } from 'connected-react-router';

import {
    FORMAT_OPTIONS_FETCH,
    DOWNLOAD_FEATURES,
    ADD_EXPORT_DATA_RESULT,
    REMOVE_EXPORT_DATA_RESULT,
    UPDATE_EXPORT_DATA_RESULT,
    CHECK_EXPORT_DATA_ENTRIES,
    SERIALIZE_COOKIE,
    onDownloadFinished,
    updateFormats,
    onDownloadOptionChange,
    setExportDataResults,
    removeExportDataResults,
    checkingExportDataEntries,
    serializeCookie,
    addExportDataResult,
    updateExportDataResult
} from '../actions/layerdownload';
import { TOGGLE_CONTROL, toggleControl } from '../actions/controls';
import { DOWNLOAD } from '../actions/layers';
import { createQuery } from '../actions/wfsquery';
import { error, info, success } from '../actions/notifications';
import {
    LOGIN_SUCCESS,
    LOGOUT
} from '../actions/security';
import {
    MAP_CONFIG_LOADED
} from '../actions/config';

import { serviceSelector, exportDataResultsSelector, downloadLayerSelector } from '../selectors/layerdownload';
import { queryPanelSelector, wfsDownloadSelector } from '../selectors/controls';
import { getSelectedLayer } from '../selectors/layers';
import { currentLocaleSelector } from '../selectors/locale';
import { mapBboxSelector } from '../selectors/map';
import { layerDescribeSelector } from "../selectors/query";
import {
    isLoggedIn,
    userSelector
} from '../selectors/security';

import { getLayerWFSCapabilities, getXMLFeature } from '../observables/wfs';
import { download } from '../observables/wps/download';
import { referenceOutputExtractor, makeOutputsExtractor, getExecutionStatus  } from '../observables/wps/execute';

import { mergeFiltersToOGC } from '../utils/FilterUtils';
import { getByOutputFormat } from '../utils/FileFormatUtils';
import { getLayerTitle } from '../utils/LayersUtils';
import { bboxToFeatureGeometry } from '../utils/CoordinatesUtils';
import { interceptOGCError } from '../utils/ObservableUtils';
import requestBuilder from '../utils/ogc/WFS/RequestBuilder';
import { toWKT } from '../utils/ogc/WKT';
import {extractGeometryAttributeName} from "../utils/WFSLayerUtils";

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

const { getFeature: getFilterFeature, query, sortBy, propertyName } = requestBuilder({ wfsVersion: "1.1.0" });
const getCQLFilterFromLayer = (layer = {}) => {
    const params = layer?.params ?? {};
    return params?.[Object.keys(params).find((k) => k?.toLowerCase() === "cql_filter")];
};

const hasOutputFormat = (data) => {
    const operation = get(data, "WFS_Capabilities.OperationsMetadata.Operation");
    const getFeature = find(operation, function(o) { return o.name === 'GetFeature'; });
    const parameter = get(getFeature, "Parameter");
    const outputFormatValue = find(parameter, function(o) { return o.name === 'outputFormat'; }).Value;
    const pickedObj = pick(DOWNLOAD_FORMATS_LOOKUP, outputFormatValue);
    return toPairs(pickedObj).map(([prop, value]) => ({ name: prop, label: value }));
};

const getWFSFeature = ({ url, filterObj = {}, layerFilter, layer, downloadOptions = {}, options } = {}) => {
    const { sortOptions, propertyNames } = options;

    const cqlFilter = getCQLFilterFromLayer(layer);
    const data = mergeFiltersToOGC({ ogcVersion: '1.1.0', addXmlnsToRoot: true, xmlnsToAdd: ['xmlns:ogc="http://www.opengis.net/ogc"', 'xmlns:gml="http://www.opengis.net/gml"'] }, downloadOptions.downloadFilteredDataSet ? layerFilter : {}, downloadOptions.downloadFilteredDataSet ? filterObj : {}, cqlFilter);

    return getXMLFeature(url, getFilterFeature(query(
        filterObj.featureTypeName, [...(sortOptions ? [sortBy(sortOptions.sortBy, sortOptions.sortOrder)] : []), ...(propertyNames ? [propertyName(propertyNames)] : []), ...(data ? castArray(data) : [])],
        { srsName: downloadOptions.selectedSrs })
    ), options, downloadOptions.selectedFormat);

};

const getFileName = action => {
    const name = get(action, "filterObj.featureTypeName") || "suca";
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

const wpsExecuteErrorToMessage = e => {
    switch (e.code) {
    case 'ProcessFailed': {
        return {
            msgId: 'layerdownload.wpsExecuteError.processFailed',
            msgParams: {
                exceptionReport: e.message
            }
        };
    }
    case 'NoStatusLocation':
    case 'NoExecutionId':
    case 'UnexpectedProcessStatus': {
        return {
            msgId: 'layerdownload.wpsExecuteError.badResponse',
            msgParams: {
                eCode: e.code
            }
        };
    }
    case 'ExecuteProcessXHRFailed': {
        return {
            msgId: 'layerdownload.wpsExecuteError.executeProcessXhrFailed'
        };
    }
    case 'GetExecutionStatusXHRFailed': {
        return {
            msgId: 'layerdonwload.wpsExecuteError.getExecutionStatusXhrFailed'
        };
    }
    default: {
        return {
            msgId: 'layerdownload.wpsExecuteError.unexpectedError'
        };
    }
    }
};

const restoreExportDataResultsFromCookie = (state) => {
    const user = userSelector(state);

    if (user?.id) {
        const cookies = document.cookie.split(';');
        const userExportDataResultsCookie = cookies.filter(cookie => cookie.indexOf(`exportDataResults_${user.id}=`) > -1)[0];

        if (userExportDataResultsCookie) {
            const { results } = JSON.parse(decodeURIComponent(userExportDataResultsCookie.split('=')[1]));
            return Rx.Observable.of(setExportDataResults(results.filter(({status}) => status !== 'pending')));
        }
    }

    return Rx.Observable.empty();
};

export const openDownloadTool = (action$) =>
    action$.ofType(DOWNLOAD)
        .switchMap((action) => {
            return Rx.Observable.from([
                toggleControl("layerdownload"),
                onDownloadOptionChange("singlePage", false),
                ...(action.layer.search?.url ? [createQuery(action.layer.url, {featureTypeName: action.layer.name})] : [])
            ]);
        });
export const fetchFormatsWFSDownload = (action$) =>
    action$.ofType(FORMAT_OPTIONS_FETCH)
        .switchMap( action => {
            return getLayerWFSCapabilities(action)
                .map((data) => {
                    return updateFormats(hasOutputFormat(data));
                });
        });
export const startFeatureExportDownload = (action$, store) =>
    action$.ofType(DOWNLOAD_FEATURES).switchMap(action => {
        const state = store.getState();
        const {virtualScroll = false} = state.featuregrid || {};
        const service = serviceSelector(state);

        const mapLayer = getSelectedLayer(state);
        const downloadLayer = downloadLayerSelector(state);
        const layer = mapLayer || downloadLayer;

        const mapBbox = mapBboxSelector(state);
        const currentLocale = currentLocaleSelector(state);
        const propertyNames = action.downloadOptions.propertyName ? [
            extractGeometryAttributeName(layerDescribeSelector(state, layer.name)),
            ...action.downloadOptions.propertyName
        ] : null;

        const { layerFilter } = layer;

        const wfsFlow = () => getWFSFeature({
            url: action.url,
            downloadOptions: action.downloadOptions,
            filterObj: isNil(action.filterObj) ? {} : action.filterObj,
            layer,
            layerFilter,
            options: {
                pagination: !virtualScroll && get(action, "downloadOptions.singlePage") ? action.filterObj && action.filterObj.pagination : null,
                propertyNames
            }
        })
            .do(({ data, headers }) => {
                if (headers["content-type"] === "application/xml") { // TODO add expected mimetypes in the case you want application/dxf
                    let xml = String.fromCharCode.apply(null, new Uint8Array(data));
                    if (xml.indexOf("<ows:ExceptionReport") === 0) {
                        throw xml;
                    }
                }
            })
            .catch(() => {
                // check here
                return getWFSFeature({
                    url: action.url,
                    downloadOptions: action.downloadOptions,
                    filterObj: action.filterObj,
                    layer,
                    layerFilter,
                    options: {
                        pagination: !virtualScroll && get(action, "downloadOptions.singlePage") ? action.filterObj && action.filterObj.pagination : null,
                        sortOptions: getDefaultSortOptions(getFirstAttribute(store.getState())),
                        propertyNames: action.downloadOptions.propertyName ? [...action.downloadOptions.propertyName,
                            extractGeometryAttributeName(layerDescribeSelector(state, layer.name))] : null
                    }
                }).do(({ data, headers }) => {
                    if (headers["content-type"] === "application/xml") { // TODO add expected mimetypes in the case you want application/dxf
                        let xml = String.fromCharCode.apply(null, new Uint8Array(data));
                        if (xml.indexOf("<ows:ExceptionReport") === 0) {
                            throw xml;
                        }
                    }
                    saveAs(new Blob([data], { type: headers && headers["content-type"] }), getFileName(action));
                });
            }).do(({ data, headers }) => {
                saveAs(new Blob([data], { type: headers && headers["content-type"] }), getFileName(action));
            })
            .map(() => onDownloadFinished())
            .catch((e) => Rx.Observable.of(
                error({
                    error: e,
                    title: "layerdownload.error.title",
                    message: "layerdownload.error.invalidOutputFormat",
                    autoDismiss: 5,
                    position: "tr"
                }),
                onDownloadFinished())
            );

        const wpsFlow = () => {
            const isVectorLayer = !!layer.search?.url;
            const cropToROI = action.downloadOptions.cropDataSet && !!mapBbox && !!mapBbox.bounds;
            const cqlFilter = getCQLFilterFromLayer(layer);
            const filterData = mergeFiltersToOGC({
                ogcVersion: '1.1.0',
                addXmlnsToRoot: true,
                xmlnsToAdd: ['xmlns:ogc="http://www.opengis.net/ogc"', 'xmlns:gml="http://www.opengis.net/gml"']
            }, layer.layerFilter, action.filterObj, cqlFilter);
            const wpsDownloadOptions = {
                layerName: layer.name,
                outputFormat: action.downloadOptions.selectedFormat,
                asynchronous: true,
                outputAsReference: true,
                targetCRS: action.downloadOptions.selectedSrs && action.downloadOptions.selectedSrs !== 'native' ? action.downloadOptions.selectedSrs : undefined,
                cropToROI,
                dataFilter: action.downloadOptions.downloadFilteredDataSet && !isEmpty(filterData) ? {
                    type: 'TEXT',
                    data: { mimeType: 'text/xml; subtype=filter/1.1', data: filterData }
                } : undefined,
                ROI: cropToROI ? {
                    type: 'TEXT',
                    data: {
                        mimeType: 'application/wkt',
                        data: toWKT(bboxToFeatureGeometry(mapBbox.bounds))
                    }
                } : undefined,
                roiCRS: cropToROI ? (mapBbox.crs || 'EPSG:4326') : undefined,
                writeParameters: {
                    ...(action.downloadOptions.tileWidth ? {tilewidth: action.downloadOptions.tileWidth} : {}),
                    ...(action.downloadOptions.tileHeight ? {tileheight: action.downloadOptions.tileHeight} : {}),
                    ...(action.downloadOptions.compression ? {
                        compression: action.downloadOptions.compression,
                        ...(action.downloadOptions.quality ? {quality: action.downloadOptions.quality} : {})
                    } : {})
                },
                notifyDownloadEstimatorSuccess: true,
                attribute: isVectorLayer && propertyNames ? propertyNames : undefined
            };
            const newResult = {
                id: uuidv1(),
                layerName: layer.name,
                layerTitle: layer.title,
                status: 'pending'
            };
            const wpsExecuteOptions = {
                outputsExtractor: makeOutputsExtractor(referenceOutputExtractor)
            };

            const executor = download;

            return executor(action.url, wpsDownloadOptions, wpsExecuteOptions)
                .takeUntil(action$.ofType(REMOVE_EXPORT_DATA_RESULT).filter(({id}) => id === newResult.id).take(1))
                .flatMap((data) => {
                    if (data === 'DownloadEstimatorSuccess') {
                        return Rx.Observable.of(
                            addExportDataResult({...newResult, startTime: (new Date()).getTime()}),
                            info({position: "tc", message: 'layerdownload.exportResultsMessages.newExport'}),
                            onDownloadFinished(),
                            toggleControl('layerdownload', 'enabled')
                        );
                    }
                    return Rx.Observable.of(...(data && data.length > 0 && data[0].href ? [
                        updateExportDataResult(newResult.id, {status: 'completed', result: data[0].href}),
                        success({position: "tc", message: 'layerdownload.exportResultsMessages.exportSuccess', values: {layerTitle: getLayerTitle(layer, currentLocale)}})
                    ] : [
                        updateExportDataResult(newResult.id, {status: 'failed', result: {msgId: 'layerdonwload.exportResultsMessages.invalidHref'}}),
                        error({position: "tc", message: 'layerdownload.exportResultsMessages.exportFailure', values: {layerTitle: getLayerTitle(layer, currentLocale)}, autoDismiss: 5})
                    ]));
                })
                .catch(e => Rx.Observable.of(...(e.message && e.message.indexOf('DownloadEstimator') > -1 ?
                    [
                        error({
                            error: e,
                            position: "tc",
                            title: 'layerdownload.error.downloadEstimatorTitle',
                            message: 'layerdownload.error.downloadEstimatorFailed',
                            autoDismiss: 5
                        }),
                        onDownloadFinished()] : [
                        updateExportDataResult(newResult.id, {status: 'failed', result: wpsExecuteErrorToMessage(e)}),
                        error({position: "tc", message: 'layerdownload.exportResultsMessages.exportFailure', values: {layerTitle: getLayerTitle(layer, currentLocale)}, autoDismiss: 5})
                    ]
                )));
        };

        return service === 'wps' ? wpsFlow() : wfsFlow();
    });

export const closeExportDownload = (action$, store) =>
    action$.ofType(TOGGLE_CONTROL)
        .filter((a) => a.control === "queryPanel" && !queryPanelSelector(store.getState()) && wfsDownloadSelector(store.getState()))
        .switchMap( () => Rx.Observable.of(toggleControl("layerdownload")));

export const checkExportDataEntriesEpic = (action$, store) => action$
    .ofType(CHECK_EXPORT_DATA_ENTRIES)
    .exhaustMap(() => {
        const state = store.getState();
        const results = exportDataResultsSelector(state) || [];
        const validResults = results.filter(({status}) => status === 'completed');

        return validResults.length > 0 ? Rx.Observable.forkJoin(validResults
            .map((validResult) => {
                const { result } = validResult;
                const executionIdStart = result.indexOf('executionId=');
                const executionIdSlice = result.slice(executionIdStart);
                const executionIdEnd = executionIdSlice.indexOf('&');
                const executionId = (executionIdEnd > -1 ? executionIdSlice.slice(0, executionIdEnd) : executionIdSlice).slice(12);
                const urlEnd = result.indexOf('?');
                const url = result.slice(0, urlEnd);

                return getExecutionStatus(url, executionId)
                    .let(interceptOGCError)
                    .catch(() => {
                        return Rx.Observable.of(null);
                    })
                    .map(reqResult => !reqResult ? validResult.id : null);
            })
        ).flatMap(checkedResults => {
            return Rx.Observable.of(
                removeExportDataResults(checkedResults.filter(res => !!res)),
                serializeCookie(),
                checkingExportDataEntries(false)
            );
        })
            .startWith(checkingExportDataEntries(true)) : Rx.Observable.empty();
    });

export const serializeCookieOnExportDataChange = (action$, store) => action$
    .ofType(ADD_EXPORT_DATA_RESULT, REMOVE_EXPORT_DATA_RESULT, UPDATE_EXPORT_DATA_RESULT, SERIALIZE_COOKIE)
    .filter(() => isLoggedIn(store.getState()))
    .do(() => {
        const state = store.getState();
        const results = exportDataResultsSelector(state);
        const { id } = userSelector(state);

        const json = JSON.stringify({results});

        document.cookie = `exportDataResults_${id}=${encodeURIComponent(json)}`;
    })
    .flatMap(() => Rx.Observable.empty());

export const resetExportDataResultsOnLogout = (action$) => action$
    .ofType(MAP_CONFIG_LOADED)
    .switchMap(() => action$
        .ofType(LOGOUT)
        .switchMap(() => Rx.Observable.of(setExportDataResults([])))
        .takeUntil(action$.ofType(LOCATION_CHANGE))
    );

export const setExportDataResultsOnLoginSuccessAndMapConfigLoaded = (action$, store) => action$
    .ofType(MAP_CONFIG_LOADED)
    .switchMap(() => restoreExportDataResultsFromCookie(store.getState()).concat(action$
        .ofType(LOGIN_SUCCESS)
        .switchMap(() => restoreExportDataResultsFromCookie(store.getState()))
        .takeUntil(action$.ofType(LOCATION_CHANGE))
    ));
