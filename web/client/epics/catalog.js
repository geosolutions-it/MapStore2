/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const Rx = require('rxjs');
const {ADD_SERVICE, addCatalogService} = require('../actions/catalog');
const {error, warning, success} = require('../actions/notifications');
const API = {
    csw: require('../api/CSW'),
    wms: require('../api/WMS'),
    wmts: require('../api/WMTS')
};

   /**
    * Epics for CATALOG
    * @name epics.catalog
    * @type {Object}
    */

module.exports = {
    newCatalogServiceAdded: (action$, store) =>
    action$.ofType(ADD_SERVICE)
        .switchMap(() => {
            const state = store.getState();
            const newService = state.catalog.newService;
            let notification = null;
            let addNewService = null;
            const warningMessage = warning({
                    title: "notification.warning",
                    message: "catalog.notification.warningAddCatalogService",
                    autoDismiss: 6,
                    position: "tc"
                });
            return Rx.Observable.fromPromise(
                API[newService.type].getRecords(newService.url, 0, 2, "", undefined)
                .then((result) => {
                    if (result.error) {
                        return {notification: warningMessage};
                    }
                    if (newService.title !== "") {
                        notification = success({
                            title: "notification.success",
                            message: "catalog.notification.addCatalogService",
                            autoDismiss: 6,
                            position: "tc"
                        });
                        addNewService = addCatalogService(newService);
                    } else {
                        notification = warningMessage;
                    }
                    return {notification, addNewService};
                }))
                .switchMap((actions) => {
                    return actions.addNewService !== null ? Rx.Observable.of(actions.notification, actions.addNewService) : Rx.Observable.of(actions.notification);
                }).catch(() => {
                    return Rx.Observable.of(error({
                            title: "notification.warning",
                            message: "catalog.notification.errorServiceUrl",
                            autoDismiss: 6,
                            position: "tc"
                        }));
                });
        })
};
