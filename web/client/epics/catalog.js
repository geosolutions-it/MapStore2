/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const Rx = require('rxjs');
const {ADD_SERVICE, GET_METADATA_RECORD_BY_ID, DELETE_SERVICE, deleteCatalogService, addCatalogService, savingService} = require('../actions/catalog');
const {showLayerMetadata} = require('../actions/layers');
const {error, success} = require('../actions/notifications');
const {SET_CONTROL_PROPERTY} = require('../actions/controls');
const {closeFeatureGrid} = require('../actions/featuregrid');
const {newServiceSelector, selectedServiceSelector, servicesSelector} = require('../selectors/catalog');
const {getSelectedLayer} = require('../selectors/layers');
const axios = require('../libs/ajax');

   /**
    * Epics for CATALOG
    * @name epics.catalog
    * @type {Object}
    */

module.exports = (API) => ({
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
        closeFeatureGridEpic: (action$) =>
            action$.ofType(SET_CONTROL_PROPERTY)
            .filter((action) => action.control === "metadataexplorer" && action.value)
            .switchMap(() => {
                return Rx.Observable.of(closeFeatureGrid());
            }),
        getMetadataRecordById: (action$, store) =>
            action$.ofType(GET_METADATA_RECORD_BY_ID)
            .switchMap(() => {
                const state = store.getState();
                const layer = getSelectedLayer(state);
                return Rx.Observable.fromPromise(
                    API.csw.getRecordById(layer.catalogURL)
                )
                .switchMap((actions) => {
                    if (actions && actions.error) {
                        return Rx.Observable.of(error({
                                title: "notification.warning",
                                message: actions.error,
                                autoDismiss: 6,
                                position: "tc"
                            }), showLayerMetadata({}, false));
                    }
                    if (actions && actions.dc) {
                        return Rx.Observable.of(
                            showLayerMetadata(actions.dc, false)
                        );
                    }
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
            })
});
