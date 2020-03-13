/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import axios from '../../libs/ajax';
import Rx from 'rxjs';

/**
 * Service validation or test exception
 */
export class ServiceValidationError extends Error {
    constructor(message, notification) {
        super(message);
        this.name = "ServiceValidationError";
        this.notification = notification;
    }
}

/**
 * Validate the current service setup. This is the default valudation that checks url and title to be filled
 *  @returns function that takes the service as parameter and return a stream. The stream emit the service again or throw an exception.
 */
export const validate = ({ services }) => (service) => {
    if (service.title === "" || service.url === "") {
        throw new ServiceValidationError("Validation Error", "catalog.notification.warningAddCatalogService");
    }
    if (service.title !== "" && service.url !== "") {
        if (!services[service.title] || services[service.title] && service.oldService === service.title) {
            return Rx.Observable.of(service);
        }
        throw new ServiceValidationError("Validation Error", "catalog.notification.duplicatedServiceTitle");
    }
    return Rx.Observable.complete();
};

/**
 * Default service test. Simple check to the URL response has not errors.
 * @param {Object} API the API of the catalog services
 * @returns function that takes the service and returns a stream. The stream emit the service again or throw an exception.
 */
export const testService = ({parseUrl}) => service => {
    const serviceError = "catalog.notification.errorServiceUrl";

    return Rx.Observable.defer(() => axios.get(parseUrl(service.url)))
        .catch(() => {
            throw new ServiceValidationError("Service Test error", serviceError);
        })
        .switchMap((result) => {
            if (result.error || result.data === "") {
                throw new ServiceValidationError("Service Test error", serviceError);
            }
            return Rx.Observable.of(service);
        });
};
// END of standard validation tools
