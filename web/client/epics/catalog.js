/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import * as Rx from 'rxjs';
import axios from 'axios';
import xpathlib from 'xpath';
import { DOMParser } from 'xmldom';
import {head, get, find, isArray, isString, isObject, keys, toPairs, merge} from 'lodash';
import {
    ADD_SERVICE,
    ADD_LAYERS_FROM_CATALOGS,
    CHANGE_TEXT,
    DELETE_SERVICE,
    GET_METADATA_RECORD_BY_ID,
    TEXT_SEARCH,
    CATALOG_CLOSE,
    FORMAT_OPTIONS_FETCH,
    addCatalogService,
    setLoading,
    deleteCatalogService,
    recordsNotFound,
    recordsLoaded,
    recordsLoadError,
    savingService,
    changeCatalogMode,
    resetCatalog,
    textSearch,
    changeSelectedService,
    formatsLoading,
    setSupportedFormats, ADD_LAYER_AND_DESCRIBE, describeError, addLayer
} from '../actions/catalog';
import {showLayerMetadata, SELECT_NODE, changeLayerProperties, addLayer as addNewLayer} from '../actions/layers';
import { error, success } from '../actions/notifications';
import {SET_CONTROL_PROPERTY, setControlProperties, setControlProperty, TOGGLE_CONTROL} from '../actions/controls';
import { closeFeatureGrid } from '../actions/featuregrid';
import { purgeMapInfoResults, hideMapinfoMarker } from '../actions/mapInfo';
import { allowBackgroundsDeletion } from '../actions/backgroundselector';
import {
    authkeyParamNameSelector,
    delayAutoSearchSelector,
    newServiceSelector,
    pageSizeSelector,
    selectedServiceSelector,
    servicesSelector,
    selectedCatalogSelector,
    searchOptionsSelector,
    catalogSearchInfoSelector,
    getFormatUrlUsedSelector,
    isActiveSelector
} from '../selectors/catalog';
import { metadataSourceSelector } from '../selectors/backgroundselector';
import { currentMessagesSelector } from "../selectors/locale";
import { getSelectedLayer, selectedNodesSelector } from '../selectors/layers';

import {
    buildSRSMap,
    extractOGCServicesReferences
} from '../utils/CatalogUtils';
import { getSupportedFormat, getCapabilities, describeLayers } from '../api/WMS';
import CoordinatesUtils from '../utils/CoordinatesUtils';
import ConfigUtils from '../utils/ConfigUtils';
import {getCapabilitiesUrl, getLayerId, getLayerUrl} from '../utils/LayersUtils';
import { wrapStartStop } from '../observables/epics';
import {zoomToExtent} from "../actions/map";
import CSW from '../api/CSW';

/**
    * Epics for CATALOG
    * @name epics.catalog
    * @type {Object}
    */

export default (API) => ({
    /**
     * search a layer given catalog service url, format, startPosition, maxRecords and text
     * text is the name of the layer to search
     * it also start with a loading action used to trigger loading state in catalog ui
     */
    recordSearchEpic: (action$, store) =>
        action$.ofType(TEXT_SEARCH)
            .switchMap(({ format, url, startPosition, maxRecords, text, options }) => {
                const filter = get(options, 'service.filter') || get(options, 'filter');
                return Rx.Observable.defer(() =>
                    API[format].textSearch(url, startPosition, maxRecords, text, { options, filter, ...catalogSearchInfoSelector(store.getState()) })
                )
                    .switchMap((result) => {
                        if (result.error) {
                            return Rx.Observable.of(recordsLoadError(result));
                        }
                        return Rx.Observable.of(recordsLoaded({
                            url,
                            startPosition,
                            maxRecords,
                            text
                        }, result));
                    })
                    .startWith(setLoading(true))
                    .catch((e) => {
                        return Rx.Observable.of(recordsLoadError(e));
                    });
            }),

    /**
     * layers specified in the mapviewer query params are added
     * it will perform the getRecords requests to fetch records that are transformed into layer
     * and added to the map
    */
    addLayersFromCatalogsEpic: (action$, store) =>
        action$.ofType(ADD_LAYERS_FROM_CATALOGS)
            .filter(({ layers, sources }) => isArray(layers) && isArray(sources) && layers.length && layers.length === sources.length)
            // maxRecords is 4 (by default), but there can be a possibility that the record desired is not among
            // the results. In that case a more detailed search with full record name can be helpful
            .switchMap(({ layers, sources, options, startPosition = 1, maxRecords = 4 }) => {
                const state = store.getState();
                const services = servicesSelector(state);
                const actions = layers
                    .filter((l, i) => !!services[sources[i]] || typeof sources[i] === 'object') // check for catalog name or object definition
                    .map((l, i) => {
                        const layerOptions = get(options, i, searchOptionsSelector(state));
                        const source = sources[i];
                        const service = typeof source === 'object' ? source : services[source];
                        const format = service.type.toLowerCase();
                        const url = service.url;
                        const text = layers[i];
                        return Rx.Observable.defer(() =>
                            API[format].textSearch(url, startPosition, maxRecords, text, {...layerOptions, ...service}).catch(() => ({ results: [] }))
                        ).map(r => ({ ...r, format, url, text, layerOptions }));
                    });
                return Rx.Observable.forkJoin(actions)
                    .switchMap((results) => {
                        if (isArray(results) && results.length) {
                            return Rx.Observable.of(results.map(r => {
                                const { format, url, text, layerOptions, ...result } = r;
                                const locales = currentMessagesSelector(state);
                                const records = API[format].getCatalogRecords(result, layerOptions, locales) || [];
                                const record = head(records.filter(rec => rec.identifier || rec.name === text)); // exact match of text and record identifier
                                const { wms, wmts } = extractOGCServicesReferences(record);
                                const servicesReferences = wms || wmts;
                                if (servicesReferences) {
                                    const allowedSRS = buildSRSMap(servicesReferences.SRS);
                                    if (servicesReferences.SRS.length > 0 && !CoordinatesUtils.isAllowedSRS("EPSG:3857", allowedSRS)) {
                                        return Rx.Observable.empty(); // TODO CHANGE THIS
                                        // onError('catalog.srs_not_allowed');
                                    }
                                }
                                const layerBaseConfig = {}; // DO WE NEED TO FETCH IT FROM STATE???
                                const authkeyParamName = authkeyParamNameSelector(state);
                                const layer = API[format].getLayerFromRecord(record, {
                                    removeParams: authkeyParamName,
                                    catalogURL: format === 'csw' && url
                                        ? url + "?request=GetRecordById&service=CSW&version=2.0.2&elementSetName=full&id=" + record.identifier
                                        : url,
                                    layerBaseConfig
                                });
                                if (!record) {
                                    return [text];
                                }
                                return [layer, layerOptions];
                            }));
                        }
                        return Rx.Observable.empty();
                    });
            })
            .mergeMap(results => {
                if (results) {
                    const allRecordsNotFound = results.filter(r => isString(r[0])).join(" ");
                    let actions = [];
                    if (allRecordsNotFound) {
                        // return one notification for all records that have not been found
                        actions = [recordsNotFound(allRecordsNotFound)];
                    }
                    // add all layers found to the map
                    actions = [
                        ...actions,
                        ...results.filter(r => isObject(r[0])).map(r => {
                            return addLayer(merge({}, r[0], r[1]));
                        })
                    ];
                    return Rx.Observable.from(actions);
                }
                return Rx.Observable.empty();
            })
            .catch(() => {
                return Rx.Observable.empty();
            }),
    addLayerAndDescribeEpic: (action$, store) =>
        action$.ofType(ADD_LAYER_AND_DESCRIBE)
            .mergeMap((value) => {
                const { layer, zoomToLayer } = value;
                const actions = [];
                const state = store.getState();
                const id = getLayerId(layer);
                actions.push(addNewLayer({...layer, id}));
                if (zoomToLayer && layer.bbox) {
                    actions.push(zoomToExtent(layer.bbox.bounds, layer.bbox.crs));
                }
                if (layer.type === 'wms') {
                    return Rx.Observable.defer(() => describeLayers(getLayerUrl(layer), layer.name))
                        .switchMap(results => {
                            if (results) {
                                let description = find(results, (desc) => desc.name === layer.name );
                                if (description && description.owsType === 'WFS') {
                                    const filteredUrl = ConfigUtils.filterUrlParams(ConfigUtils.cleanDuplicatedQuestionMarks(description.owsURL), authkeyParamNameSelector(state));
                                    return Rx.Observable.of(changeLayerProperties(id, {
                                        search: {
                                            url: filteredUrl,
                                            type: 'wfs'
                                        }
                                    }));
                                }
                            }
                            return Rx.Observable.empty();
                        })
                        .merge(Rx.Observable.from(actions))
                        .catch((e) => Rx.Observable.of(describeError(layer, e)));
                }
                return Rx.Observable.from(actions);
            })
            .catch(() => {
                return Rx.Observable.empty();
            }),
    /**
     * Gets every `ADD_SERVICE` event.
     * It performs a head request in order to check if the server is up. (a better validation should be handled when research is performed).
     * If it is adding a new service and the title is a duplicate, it triggers a notification. Other notification are triggered if the title is empty or the head request fails.
     * It dispatches an action that actually add or update a service for the catalog.
     * @param {Observable} action$ the actions triggered
     * @memberof epics.catalog
     * @return {external:Observable}
    */
    newCatalogServiceAdded: (action$, store) =>
        action$.ofType(ADD_SERVICE)
            .switchMap(() => {
                const state = store.getState();
                const newService = newServiceSelector(state);
                return Rx.Observable.of(newService)
                    // validate
                    .switchMap((service) => API[service.type]?.preprocess?.(service) ?? ( Rx.Observable.of(service)))
                    .switchMap((service) => API[service.type]?.validate?.(service) ?? ( Rx.Observable.of(service)))
                    .switchMap((service) => API[service.type]?.testService?.(service) ?? (Rx.Observable.of(service)))
                    .switchMap(() => {
                        return Rx.Observable.of(
                            addCatalogService(newService),
                            success({
                                title: "notification.success",
                                message: "catalog.notification.addCatalogService",
                                autoDismiss: 6,
                                position: "tc"
                            })
                        );
                    })
                    .startWith(savingService(true))
                    .catch((e) => {
                        return Rx.Observable.of(error({
                            exception: e,
                            title: "notification.warning",
                            message: e.notification || "catalog.notification.warningAddCatalogService",
                            autoDismiss: 6,
                            position: "tc"
                        }));
                    })
                    .concat(Rx.Observable.of(savingService(false)));
            }),
    deleteCatalogServiceEpic: (action$, store) =>
        action$.ofType(DELETE_SERVICE)
            .switchMap(() => {
                const state = store.getState();
                let selectedService = selectedServiceSelector(state);
                const services = servicesSelector(state);
                let notification = services[selectedService] ? success({
                    title: "notification.warning",
                    message: "catalog.notification.serviceDeletedCorrectly",
                    autoDismiss: 6,
                    position: "tc"
                }) : error({
                    title: "notification.warning",
                    message: "catalog.notification.impossibleDeleteService",
                    autoDismiss: 6,
                    position: "tc"
                });
                let deleteServiceAction = deleteCatalogService(selectedService);
                return services[selectedService] ? Rx.Observable.of(notification, deleteServiceAction) : Rx.Observable.of(notification);
            }),
    /**
            catalog opening must close other panels like:
            - GFI
            - FeatureGrid
            */
    openCatalogEpic: (action$, store) =>
        action$.ofType(SET_CONTROL_PROPERTY, TOGGLE_CONTROL)
            .filter((action) => action.control === "metadataexplorer" && isActiveSelector(store.getState()))
            .switchMap(() => {
                return Rx.Observable.of(closeFeatureGrid(), purgeMapInfoResults(), hideMapinfoMarker());
            }),
    getMetadataRecordById: (action$, store) =>
        action$.ofType(GET_METADATA_RECORD_BY_ID)
            .switchMap(({metadataOptions = {}}) => {
                const state = store.getState();
                const layer = getSelectedLayer(state);

                return Rx.Observable.defer(() => getCapabilities(getCapabilitiesUrl(layer)))
                    .switchMap((caps) => {
                        const layersXml = get(caps, 'capability.layer.layer', []);
                        const metadataUrls = layersXml.length === 1 ? layersXml[0].metadataURL : find(layersXml, l => l.name === layer.name.split(':')[1]);
                        const metadataUrl = get(find(metadataUrls, mUrl => isString(mUrl.type) &&
                            mUrl.type.toLowerCase() === 'iso19115:2003' &&
                            (mUrl.format === 'application/xml' || mUrl.format === 'text/xml')), 'onlineResource.href');
                        const metadataUrlHTML = get(find(metadataUrls, mUrl => isString(mUrl.type) &&
                            mUrl.type.toLowerCase() === 'iso19115:2003' &&
                            mUrl.format === 'text/html'), 'onlineResource.href');
                        const extractor = find(get(metadataOptions, 'extractors', []),
                            ({properties, layersRegex}) => {
                                const rxp = layersRegex ? new RegExp(layersRegex) : null;
                                return isObject(properties) && (layersRegex ? rxp.test(layer.name) : true);
                            }
                        );
                        const defaultMetadata = metadataUrlHTML ? {metadataUrl: metadataUrlHTML} : {};

                        const cswDCFlow = Rx.Observable.defer(() => CSW.getRecordById(layer.catalogURL))
                            .switchMap((action) => {
                                if (action && action.error) {
                                    return Rx.Observable.of(error({
                                        title: "notification.warning",
                                        message: "toc.layerMetadata.notification.warnigGetMetadataRecordById",
                                        autoDismiss: 6,
                                        position: "tc"
                                    }), showLayerMetadata(defaultMetadata, false));
                                }
                                if (action && action.dc) {
                                    return Rx.Observable.of(
                                        showLayerMetadata({...defaultMetadata, ...action.dc}, false)
                                    );
                                }
                                return Rx.Observable.empty();
                            });

                        const metadataFlow = Rx.Observable.defer(() => axios.get(metadataUrl, {headers: {'Accept': 'application/xml'}}))
                            .pluck('data')
                            .map(metadataXml => new DOMParser().parseFromString(metadataXml))
                            .map(metadataDoc => {
                                const selectXpath = xpathlib.useNamespaces(metadataOptions.xmlNamespaces || {});

                                const processProperties = (properties = {}, doc) => toPairs(properties).reduce((result, [propName, xpath]) => {
                                    let finalProp;

                                    if (isObject(xpath) &&
                                        isString(xpath.xpath) &&
                                        isObject(xpath.properties) &&
                                        keys(xpath.properties).length > 0
                                    ) {
                                        const newDocs = selectXpath(xpath.xpath, doc);
                                        finalProp = newDocs.map(newDoc => processProperties(xpath.properties, newDoc));

                                        if (finalProp.length === 0) {
                                            finalProp = null;
                                        }
                                    } else {
                                        const selectedNodes = selectXpath(xpath, doc);

                                        if (selectedNodes.length === 1) {
                                            finalProp =  get(selectedNodes[0], 'nodeValue') ?? get(selectedNodes[0], 'childNodes[0].nodeValue');
                                        } else if (selectedNodes.length > 1) {
                                            finalProp = selectedNodes.map(selectedNode => get(selectedNode, 'childNodes[0].nodeValue'))
                                                .filter(selectedNode => !!selectedNode);
                                        }
                                    }

                                    return {
                                        ...result,
                                        ...(finalProp ? {[propName]: finalProp} : {})
                                    };
                                }, {});

                                return processProperties(extractor.properties, metadataDoc);
                            })
                            .switchMap((result) => {
                                return Rx.Observable.of(showLayerMetadata({...defaultMetadata, ...result}, false));
                            });

                        return metadataUrl && extractor ? metadataFlow :
                            layer.catalogURL ? cswDCFlow : Rx.Observable.of(showLayerMetadata(defaultMetadata, false));
                    })
                    .startWith(
                        showLayerMetadata({}, true)
                    )
                    .catch(() => {
                        return Rx.Observable.of(error({
                            title: "notification.warning",
                            message: "toc.layerMetadata.notification.warnigGetMetadataRecordById",
                            autoDismiss: 6,
                            position: "tc"
                        }), showLayerMetadata({}, false));
                    });
            }),
    /**
             * it trigger search automatically after a delay, default is 1s
             * it uses layersSearch in favor of
             */
    autoSearchEpic: (action$, { getState = () => { } } = {}) =>
        action$.ofType(CHANGE_TEXT)
            .debounce(() => {
                const state = getState();
                const delay = delayAutoSearchSelector(state);
                return Rx.Observable.timer(delay);
            })
            .switchMap(({ text }) => {
                const state = getState();
                const pageSize = pageSizeSelector(state);
                const service = selectedCatalogSelector(state);
                const { type, url, filter } = service;
                return Rx.Observable.of(textSearch({ format: type, url, startPosition: 1, maxRecords: pageSize, text, options: { service, filter }}));
            }),

    catalogCloseEpic: (action$, store) =>
        action$.ofType(CATALOG_CLOSE)
            .switchMap(() => {
                const state = store.getState();
                const metadataSource = metadataSourceSelector(state);
                const services = servicesSelector(state);
                return Rx.Observable.of(...([
                    setControlProperties('metadataexplorer', "enabled", false, "group", null),
                    changeCatalogMode("view"),
                    resetCatalog()
                ].concat(metadataSource === 'backgroundSelector' ?
                    [changeSelectedService(head(keys(services))), allowBackgroundsDeletion(true)] : [])));
            }),

    /**
     * Fetch all supported formats of a WMS service configured (infoFormats and imageFormats)
     * Dispatches an action that sets the supported formats of the service.
     * @param {Observable} action$ the actions triggered
     * @param {object} getState store object
     * @memberof epics.catalog
     * @return {external:Observable}
     */
    getSupportedFormatsEpic: (action$, {getState = ()=> {}} = {}) =>
        action$.ofType(FORMAT_OPTIONS_FETCH)
            .filter((action)=> getFormatUrlUsedSelector(getState()) !== action?.url)
            .switchMap(({url = ''} = {})=> {
                return Rx.Observable.defer(() => getSupportedFormat(url, true))
                    .switchMap((supportedFormats) => Rx.Observable.of(setSupportedFormats(supportedFormats, url)))
                    .let(
                        wrapStartStop(
                            formatsLoading(true),
                            formatsLoading(false),
                            () => {
                                return Rx.Observable.of(
                                    error({ title: "layerProperties.format.error.title", message: 'layerProperties.format.error.message' }),
                                    formatsLoading(false)
                                );
                            }
                        )
                    );
            }),

    /**
    * Sets control property to currently selected group when catalogue is open
    * Sets the currently selected group as the detination of new layers in catalogue
    * if a layer instead of a group is selected it resets the groupId to Default
    *  Action performed: setControlProperty (only if catalogue is open)
    * @memberof epics.layers
    * @param {external:Observable} action$ manages `SELECT_NODE`
    * @return {external:Observable}
    */
    updateGroupSelectedMetadataExplorerEpic: (action$, store) => action$.ofType(SELECT_NODE)
        .filter(() => isActiveSelector(store.getState()))
        .switchMap(({ nodeType, id }) => {
            const state = store.getState();
            const selectedNodes = selectedNodesSelector(state);
            const groupId = (selectedNodes.length === 0 || nodeType !== 'group')
                ? 'Default'
                : id;
            return Rx.Observable.of(setControlProperty('metadataexplorer', "group", groupId));
        })
});
