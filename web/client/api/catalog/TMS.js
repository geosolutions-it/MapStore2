/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as TMS100 from './TMS_1_0_0';

import * as tileProvider from './tileProvider';
import { validate as defaultValidate, testService as defaultTestService } from './common';

/**
 * Implements Catalog API for the abstraction of a TMS catalog, that can provide layers of type:
 * - tileprovider: custom (type of provider is "custom", or empty) or pre-configured configuration of tileprovider layers (will have provider: "provider.variant").
 * - tms: standard TMS 1.0.0 service, with remote data retrieval.
 * @module api.catalog.TMS
 */

export const getRecords = (url, startPosition, maxRecords, text, info = {}) => {
    const {options} = info;
    const { service = {} } = options || {};
    if ( service.provider === "tms") {
        TMS100.getRecords(url, startPosition, maxRecords, text, info);

    }
    return tileProvider.getRecords(url, startPosition, maxRecords, text, info);
};
export const textSearch = (url, startPosition, maxRecords, text, info = {}) => {
    const { options } = info;
    const { service = {} } = options || {};
    if (service.provider === "tms") {
        return TMS100.getRecords(url, startPosition, maxRecords, text, info);
    }
    return tileProvider.getRecords(url, startPosition, maxRecords, text, info);
};
export const validate = service => {
    if (service.provider === "tms") {
        return defaultValidate(service);
    }
    return tileProvider.validate(service);
};
export const testService = service => {
    if (service.provider === "tms") {
        return defaultTestService({ parseUrl: TMS100.parseUrl })(service);
    }
    return tileProvider.testService(service);
};
