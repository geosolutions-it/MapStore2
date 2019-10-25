/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import * as Rx from 'rxjs';
import {head, isArray, isString, isObject, keys} from 'lodash';
import {
    ADD_SERVICE,
    ADD_LAYERS_FROM_CATALOGS,
    CHANGE_TEXT,
    DELETE_SERVICE,
    GET_METADATA_RECORD_BY_ID,
    TEXT_SEARCH,
    CATALOG_CLOSE,
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
    changeSelectedService
} from '../actions/catalog';
import {showLayerMetadata, addLayer} from '../actions/layers';
import {error, success} from '../actions/notifications';
import {SET_CONTROL_PROPERTY, setControlProperties} from '../actions/controls';
import {closeFeatureGrid} from '../actions/featuregrid';
import {purgeMapInfoResults, hideMapinfoMarker} from '../actions/mapInfo';
import {allowBackgroundsDeletion} from '../actions/backgroundselector';
import {
    authkeyParamNameSelector,
    delayAutoSearchSelector,
    newServiceSelector,
    pageSizeSelector,
    selectedServiceSelector,
    servicesSelector,
    selectedCatalogSelector,
    searchOptionsSelector
} from '../selectors/catalog';
import {metadataSourceSelector} from '../selectors/backgroundselector';
import {currentMessagesSelector} from "../selectors/locale";
import {layersSelector, getSelectedLayer} from '../selectors/layers';
import axios from '../libs/ajax';
import {
    buildSRSMap,
    esriToLayer,
    extractEsriReferences,
    extractOGCServicesReferences,
    getCatalogRecords,
    recordToLayer
} from '../utils/CatalogUtils';
import CoordinatesUtils from '../utils/CoordinatesUtils';

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
            .switchMap(({format, url, startPosition, maxRecords, text, options}) => {
                return Rx.Observable.defer( () =>
                    API[format].textSearch(url, startPosition, maxRecords, text, options, layersSelector(store.getState()))
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
            .filter(({layers, sources}) => isArray(layers) && isArray(sources) && layers.length && layers.length === sources.length)
            // maxRecords is 4 (by default), but there can be a possibility that the record desired is not among
            // the results. In that case a more detailed search with full record name can be helpful
            .switchMap(({layers, sources, options, startPosition = 1, maxRecords = 4 }) => {
                const state = store.getState();
                const addLayerOptions = options || searchOptionsSelector(state);
                const services = servicesSelector(state);
                const actions = layers
                    .filter((l, i) => !!services[sources[i]]) // ignore wrong catalog name
                    .map((l, i) => {
                        const {type: format, url} = services[sources[i]];
                        const text = layers[i];
                        return Rx.Observable.defer( () =>
                            API[format].textSearch(url, startPosition, maxRecords, text, addLayerOptions).catch(() => ({results: []}))
                        ).map(r => ({...r, format, url, text}));
                    });
                return Rx.Observable.forkJoin(actions)
                    .switchMap((results) => {
                        if (isArray(results) && results.length) {
                            return Rx.Observable.of(results.map(r => {
                                const {format, url, text, ...result} = r;
                                const locales = currentMessagesSelector(state);
                                const records = getCatalogRecords(format, result, addLayerOptions, locales) || [];
                                const record = head(records.filter(rec => rec.identifier === text)); // exact match of text and record identifier
                                const {wms, wmts} = extractOGCServicesReferences(record);
                                let layer = {};
                                const layerBaseConfig = {}; // DO WE NEED TO FETCH IT FROM STATE???
                                const authkeyParamName = authkeyParamNameSelector(state);
                                if (wms) {
                                    const allowedSRS = buildSRSMap(wms.SRS);
                                    if (wms.SRS.length > 0 && !CoordinatesUtils.isAllowedSRS("EPSG:3857", allowedSRS)) {
                                        return Rx.Observable.empty(); // TODO CHANGE THIS
                                        // onError('catalog.srs_not_allowed');
                                    }
                                    layer = recordToLayer(record, "wms", {
                                        removeParams: authkeyParamName,
                                        catalogURL: format === 'csw' && url ? url + "?request=GetRecordById&service=CSW&version=2.0.2&elementSetName=full&id=" + record.identifier : url
                                    }, layerBaseConfig);
                                } else if (wmts) {
                                    layer = {};
                                    const allowedSRS = buildSRSMap(wmts.SRS);
                                    if (wmts.SRS.length > 0 && !CoordinatesUtils.isAllowedSRS("EPSG:3857", allowedSRS)) {
                                        return Rx.Observable.empty(); // TODO CHANGE THIS
                                        // onError('catalog.srs_not_allowed');
                                    }
                                    layer = recordToLayer(record, "wmts", {
                                        removeParams: authkeyParamName
                                    }, layerBaseConfig);
                                } else {
                                    const {esri} = extractEsriReferences(record);
                                    if (esri) {
                                        layer = esriToLayer(record, layerBaseConfig);
                                    }
                                }
                                if (!record) {
                                    return text;
                                }
                                return layer;
                            }));
                        }
                        return Rx.Observable.empty();
                    });
            })
            .mergeMap(results => {
                if (results) {
                    const allRecordsNotFound = results.filter(r => isString(r)).join(" ");
                    let actions = [];
                    if (allRecordsNotFound) {
                        // return one notification for all records that have not been found
                        actions = [recordsNotFound(allRecordsNotFound)];
                    }
                    // add all layers found to the map
                    actions = [...actions, ...results.filter(r => isObject(r)).map(r => addLayer(r))];
                    return Rx.Observable.from(actions);
                }
                return Rx.Observable.empty();
            })
            .catch( () => {
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
                const services = servicesSelector(state);
                const errorMessage = error({
                    title: "notification.warning",
                    message: "catalog.notification.errorServiceUrl",
                    autoDismiss: 6,
                    position: "tc"
                });
                const warningMessage = error({
                    title: "notification.warning",
                    message: "catalog.notification.warningAddCatalogService",
                    autoDismiss: 6,
                    position: "tc"
                });
                let notification = errorMessage;
                let addNewService = null;
                return Rx.Observable.fromPromise(
                    axios.get(API[newService.type].parseUrl(newService.url))
                        .then((result) => {
                            if (newService.title === "" || newService.url === "") {
                                notification = warningMessage;
                            }
                            if (result.error || result.data === "") {
                                return {notification: errorMessage, addNewService};
                            }
                            if (newService.title !== "" && newService.url !== "") {
                                notification = warningMessage;
                                if (!services[newService.title] || services[newService.title] && newService.oldService === newService.title) {
                                    notification = success({
                                        title: "notification.success",
                                        message: "catalog.notification.addCatalogService",
                                        autoDismiss: 6,
                                        position: "tc"
                                    });
                                    addNewService = addCatalogService(newService);
                                } else {
                                    notification = error({
                                        title: "notification.warning",
                                        message: "catalog.notification.duplicatedServiceTitle",
                                        autoDismiss: 6,
                                        position: "tc"
                                    });
                                }
                            }
                            return {notification, addNewService};
                        }))
                    .switchMap((actions) => {
                        return actions.addNewService !== null ? Rx.Observable.of(actions.notification, actions.addNewService) : Rx.Observable.of(actions.notification);
                    })
                    .startWith(savingService(true))
                    .catch(() => {
                        return Rx.Observable.of(error({
                            title: "notification.warning",
                            message: "catalog.notification.warningAddCatalogService",
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
    openCatalogEpic: (action$) =>
        action$.ofType(SET_CONTROL_PROPERTY)
            .filter((action) => action.control === "metadataexplorer" && action.value)
            .switchMap(() => {
                return Rx.Observable.of(closeFeatureGrid(), purgeMapInfoResults(), hideMapinfoMarker());
            }),
    getMetadataRecordById: (action$, store) =>
        action$.ofType(GET_METADATA_RECORD_BY_ID)
            .switchMap(() => {
                const state = store.getState();
                const layer = getSelectedLayer(state);
                return Rx.Observable.fromPromise(
                    API.csw.getRecordById(layer.catalogURL)
                )
                    .switchMap((action) => {
                        if (action && action.error) {
                            return Rx.Observable.of(error({
                                title: "notification.warning",
                                message: "toc.layerMetadata.notification.warnigGetMetadataRecordById",
                                autoDismiss: 6,
                                position: "tc"
                            }), showLayerMetadata({}, false));
                        }
                        if (action && action.dc) {
                            return Rx.Observable.of(
                                showLayerMetadata(action.dc, false)
                            );
                        }
                        return Rx.Observable.empty();
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
    autoSearchEpic: (action$, {getState = () => {}} = {}) =>
        action$.ofType(CHANGE_TEXT)
            .debounce(() => {
                const state = getState();
                const delay = delayAutoSearchSelector(state);
                return Rx.Observable.timer(delay);
            })
            .switchMap(({text}) => {
                const state = getState();
                const pageSize = pageSizeSelector(state);
                const {type, url} = selectedCatalogSelector(state);
                return Rx.Observable.of(textSearch({format: type, url, startPosition: 1, maxRecords: pageSize, text}));
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
            })
});
