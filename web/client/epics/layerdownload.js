/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import axios from 'axios';
import Rx from 'rxjs';
import { get, find, findIndex, pick, toPairs } from 'lodash';
import { saveAs } from 'file-saver';
import { parseString } from 'xml2js';
import { stripPrefix } from 'xml2js/lib/processors';
import uuidv1 from 'uuid/v1';
import { LOCATION_CHANGE } from 'connected-react-router';

import {
    FORMAT_OPTIONS_FETCH,
    DOWNLOAD_FEATURES,
    CHECK_WPS_AVAILABILITY,
    SHOW_INFO_BUBBLE_MESSAGE,
    ADD_EXPORT_DATA_RESULT,
    REMOVE_EXPORT_DATA_RESULT,
    UPDATE_EXPORT_DATA_RESULT,
    CHECK_EXPORT_DATA_ENTRIES,
    SERIALIZE_COOKIE,
    checkingWPSAvailability,
    onDownloadFinished,
    updateFormats,
    onDownloadOptionChange,
    setService,
    showInfoBubble,
    setInfoBubbleMessage,
    setExportDataResults,
    removeExportDataResults,
    checkingExportDataEntries,
    serializeCookie,
    addExportDataResult,
    updateExportDataResult,
    showInfoBubbleMessage
} from '../actions/layerdownload';
import { TOGGLE_CONTROL, toggleControl } from '../actions/controls';
import { DOWNLOAD } from '../actions/layers';
import { createQuery } from '../actions/wfsquery';
import { error } from '../actions/notifications';
import {
    LOGIN_SUCCESS,
    LOGOUT
} from '../actions/security';
import {
    MAP_CONFIG_LOADED
} from '../actions/config';

import { serviceSelector, exportDataResultsSelector } from '../selectors/layerdownload';
import { queryPanelSelector, wfsDownloadSelector } from '../selectors/controls';
import { getSelectedLayer } from '../selectors/layers';
import { currentLocaleSelector } from '../selectors/locale';
import { mapBboxSelector } from '../selectors/map';
import {
    isLoggedIn,
    userSelector
} from '../selectors/security';

import { getLayerWFSCapabilities } from '../observables/wfs';
import { describeProcess } from '../observables/wps/describe';
import { download } from '../observables/wps/download';
import { referenceOutputExtractor, makeOutputsExtractor, getExecutionStatus  } from '../observables/wps/execute';

import { cleanDuplicatedQuestionMarks } from '../utils/ConfigUtils';
import { toOGCFilter, mergeFiltersToOGC } from '../utils/FilterUtils';
import { getByOutputFormat } from '../utils/FileFormatUtils';
import { getLayerTitle } from '../utils/LayersUtils';
import { bboxToFeatureGeometry } from '../utils/CoordinatesUtils';
import { interceptOGCError } from '../utils/ObservableUtils';

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
    const data = toOGCFilter(filterObj.featureTypeName, filterObj, filterObj.ogcVersion, filterObj.sortOptions, false, null, null, downloadOptions.selectedSrs);
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

/*
const str2bytes = (str) => {
    var bytes = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
        bytes[i] = str.charCodeAt(i);
    }
    return bytes;
};
*/
export const checkWPSAvailabilityEpic = (action$) => action$
    .ofType(CHECK_WPS_AVAILABILITY)
    .switchMap(({url}) => {
        return describeProcess(url, 'gs:DownloadEstimator,gs:Download')
            .switchMap(response => Rx.Observable.defer(() => new Promise((resolve, reject) => parseString(response.data, {tagNameProcessors: [stripPrefix]}, (err, res) => err ? reject(err) : resolve(res)))))
            .flatMap(xmlObj => {
                const ids = [
                    xmlObj?.ProcessDescriptions?.ProcessDescription?.[0]?.Identifier?.[0],
                    xmlObj?.ProcessDescriptions?.ProcessDescription?.[1]?.Identifier?.[0]
                ];
                return Rx.Observable.of(
                    setService(findIndex(ids, x => x === 'gs:DownloadEstimator') > -1 && findIndex(ids, x => x === 'gs:Download') > -1 ? 'wps' : 'wfs'),
                    checkingWPSAvailability(false)
                );
            })
            .catch(() => Rx.Observable.of(setService('wfs'), checkingWPSAvailability(false)))
            .startWith(checkingWPSAvailability(true));
    });
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
        const {virtualScroll = false} = state.featuregrid;
        const service = serviceSelector(state);
        const layer = getSelectedLayer(state);
        const mapBbox = mapBboxSelector(state);
        const currentLocale = currentLocaleSelector(state);

        const wfsFlow = () => getWFSFeature({
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
                    title: "layerdownload.error.title",
                    message: "layerdownload.error.invalidOutputFormat",
                    autoDismiss: 5,
                    position: "tr"
                }),
                onDownloadFinished())
            );

        const wpsFlow = () => {
            const cropToROI = action.downloadOptions.cropDataSet && !!mapBbox && !!mapBbox.bounds;
            const wpsDownloadOptions = {
                layerName: layer.name,
                outputFormat: action.downloadOptions.selectedFormat,
                asynchronous: true,
                outputAsReference: true,
                targetCRS: action.downloadOptions.selectedSrs && action.downloadOptions.selectedSrs !== 'native' ? action.downloadOptions.selectedSrs : undefined,
                cropToROI,
                dataFilter: action.downloadOptions.downloadFilteredDataSet ? {
                    type: 'TEXT',
                    data: {
                        mimeType: 'text/plain; subtype=filter/1.0',
                        data: mergeFiltersToOGC({
                            ogcVersion: '1.0.0',
                            addXmlnsToRoot: true,
                            xmlnsToAdd: ['xmlns:ogc="http://www.opengis.net/ogc"', 'xmlns:gml="http://www.opengis.net/gml"']
                        }, layer.layerFilter, action.filterObj)
                    }
                } : undefined,
                ROI: cropToROI ? {
                    type: 'TEXT',
                    data: {
                        mimeType: 'application/json',
                        data: JSON.stringify(bboxToFeatureGeometry(mapBbox.bounds))
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
                notifyDownloadEstimatorSuccess: true
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

            return download(action.url, wpsDownloadOptions, wpsExecuteOptions)
                .takeUntil(action$.ofType(REMOVE_EXPORT_DATA_RESULT).filter(({id}) => id === newResult.id).take(1))
                .flatMap((data) => {
                    if (data === 'DownloadEstimatorSuccess') {
                        return Rx.Observable.of(
                            addExportDataResult({...newResult, startTime: (new Date()).getTime()}),
                            showInfoBubbleMessage('layerdownload.exportResultsMessages.newExport'),
                            onDownloadFinished(),
                            toggleControl('layerdownload', 'enabled')
                        );
                    }
                    return Rx.Observable.of(...(data && data.length > 0 && data[0].href ? [
                        updateExportDataResult(newResult.id, {status: 'completed', result: data[0].href}),
                        showInfoBubbleMessage('layerdownload.exportResultsMessages.exportSuccess', {layerTitle: getLayerTitle(layer, currentLocale)}, 'success')
                    ] : [
                        updateExportDataResult(newResult.id, {status: 'failed', result: {msgId: 'layerdonwload.exportResultsMessages.invalidHref'}}),
                        showInfoBubbleMessage('layerdownload.exportResultsMessages.exportFailure', {layerTitle: getLayerTitle(layer, currentLocale)}, 'danger')
                    ]));
                })
                .catch(e => Rx.Observable.of(...(e.message && e.message.indexOf('DownloadEstimator') > -1 ?
                    [error({
                        error: e,
                        title: 'layerdownload.error.downloadEstimatorTitle',
                        message: 'layerdownload.error.downloadEstimatorFailed'
                    }), onDownloadFinished()] : [
                        updateExportDataResult(newResult.id, {status: 'failed', result: wpsExecuteErrorToMessage(e)}),
                        showInfoBubbleMessage('layerdownload.exportResultsMessages.exportFailure', {layerTitle: getLayerTitle(layer, currentLocale)}, 'danger')
                    ]
                )));
        };

        return service === 'wps' ? wpsFlow() : wfsFlow();
    });

export const closeExportDownload = (action$, store) =>
    action$.ofType(TOGGLE_CONTROL)
        .filter((a) => a.control === "queryPanel" && !queryPanelSelector(store.getState()) && wfsDownloadSelector(store.getState()))
        .switchMap( () => Rx.Observable.of(toggleControl("layerdownload")));

export const showInfoBubbleMessageEpic = (action$) => action$
    .ofType(SHOW_INFO_BUBBLE_MESSAGE)
    .concatMap((action = {}) => Rx.Observable.of(setInfoBubbleMessage(action.msgId, action.msgParams, action.level), showInfoBubble(true)).delay(10) // the delay is to ensure that transition animation always triggers
        .concat(Rx.Observable.of(showInfoBubble(false)).delay(action.duration || 3000))
        .concat(Rx.Observable.empty().delay(1000)/* this is set to the duration of css transition animation in layerdownload.less*/));

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
        }).startWith(checkingExportDataEntries(true)) : Rx.Observable.empty();
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
