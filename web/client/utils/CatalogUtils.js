/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { head, isArray, get, castArray, isString } from 'lodash';
import CoordinatesUtils from './CoordinatesUtils';
import { removeDuplicateLines } from './StringUtils';

export const COG_LAYER_TYPE = 'cog';
export const CATALOG_SERVICE_UNAVAILABLE = 'catalog.errors.serviceUnavailable';

/**
 * Normalize catalog search errors so reducers and views always receive a
 * meaningful error object, including errors without an HTTP response.
 * @param {object} error catalog API result or rejected request error
 * @returns {object} normalized catalog error
 */
export const normalizeCatalogSearchError = (error = {}) => {
    const [errorMessage] = castArray(error?.error);
    const message = isString(errorMessage) && errorMessage
        ? removeDuplicateLines(errorMessage)
        : CATALOG_SERVICE_UNAVAILABLE;
    return {
        message,
        status: error?.status ?? error?.response?.status
    };
};

/**
 * Resolve a normalized catalog error to a localized message configuration.
 * String errors are supported for backward compatibility with custom clients.
 * @param {object|string} error normalized or legacy catalog error
 * @returns {object} notification/message component configuration
 */
export const getCatalogSearchErrorMessage = (error) => {
    const normalizedError = isString(error) ? { message: error } : error || {};
    const { message, status } = normalizedError;
    const statusCode = Number(status);
    if (statusCode === 401) {
        return { message: 'catalog.errors.unauthorized' };
    }
    if (statusCode === 403) {
        return { message: 'catalog.errors.forbidden' };
    }
    if (message && message !== CATALOG_SERVICE_UNAVAILABLE) {
        return { message };
    }
    if (statusCode > 0) {
        return {
            message: 'catalog.errors.http',
            values: { status: statusCode }
        };
    }
    return { message: CATALOG_SERVICE_UNAVAILABLE };
};

export const buildSRSMap = (srs) => {
    return srs.filter(s => CoordinatesUtils.isSRSAllowed(s)).reduce((previous, current) => {
        return Object.assign(previous, {[current]: true});
    }, {});
};

export const removeParameters = (url, skip) => {
    const urlparts = url.split('?');
    const params = {};
    if (urlparts.length >= 2 && urlparts[1]) {
        const pars = urlparts[1].split(/[&;]/g);
        pars.forEach((par) => {
            const param = par.split('=');
            if (skip.indexOf(param[0].toLowerCase()) === -1) {
                params[param[0]] = param[1];
            }
        });
    }
    return {url: urlparts[0], params};
};

export const extractOGCServicesReferences = ({ references = [] } = {}) => ({
    wfs: head(references.filter(reference => reference.type && (reference.type === "OGC:WFS"
        || reference.type.indexOf("OGC:WFS") > -1 && reference.type.indexOf("http-get-feature") > -1))),
    wms: head(references.filter(reference => reference.type && (reference.type === "OGC:WMS"
        || reference.type.indexOf("OGC:WMS") > -1 && reference.type.indexOf("http-get-map") > -1))),
    wmts: head(references.filter(reference => reference.type && (reference.type === "OGC:WMTS"
        || reference.type.indexOf("OGC:WMTS") > -1 && reference.type.indexOf("http-get-map") > -1))),
    tms: head(references.filter(reference => reference.type && (reference.type === "OGC:TMS"
        || reference.type.indexOf("OGC:TMS") > -1)))
});
export const extractEsriReferences = (record = { references: [] }) => ({
    esri: head(record.references.filter(reference => reference.type && (reference.type === "ESRI:SERVER"
        || reference.type === "arcgis" )))
});
export const getRecordLinks = ({ references = [] } = {}) => {
    let wmsGetCap = head(references.filter(reference => reference.type &&
        reference.type.indexOf("OGC:WMS") > -1 && reference.type.indexOf("http-get-capabilities") > -1));
    let wfsGetCap = head(references.filter(reference => reference.type &&
        reference.type.indexOf("OGC:WFS") > -1 && reference.type.indexOf("http-get-capabilities") > -1));
    let wmtsGetCap = head(references.filter(reference => reference.type &&
        reference.type.indexOf("OGC:WMTS") > -1 && reference.type.indexOf("http-get-capabilities") > -1));
    let links = [];
    if (wmsGetCap) {
        links.push({
            type: "WMS_GET_CAPABILITIES",
            url: wmsGetCap.url,
            labelId: 'catalog.wmsGetCapLink'
        });
    }
    if (wmtsGetCap) {
        links.push({
            type: "WMTS_GET_CAPABILITIES",
            url: wmtsGetCap.url,
            labelId: 'catalog.wmtsGetCapLink'
        });
    }
    if (wfsGetCap) {
        links.push({
            type: "WFS_GET_CAPABILITIES",
            url: wfsGetCap.url,
            labelId: 'catalog.wfsGetCapLink'
        });
    }
    return links;
};

export const buildServiceUrl = (service) => {
    switch (service.type) {
    case "wms": {
        const aliases = service.domainAliases;
        const aliasArray = Array.isArray(aliases)
            ? aliases
            : (aliases ? Object.values(aliases).filter(Boolean) : []);
        return [service.url, ...aliasArray].join(',');
    }
    default:
        return service.url;
    }
};

export const toURLArray = (url) => {
    if (url && !isArray(url) && url.indexOf(",") !== -1) {
        return url.split(',').map(u => u.trim());
    }
    return url;
};

export const updateServiceData = (options, result) => {
    const isCOGService = get(options, 'service.type') === COG_LAYER_TYPE;

    if (isCOGService) {
        const records = get(options, 'service.records', []);
        return {
            ...options.service,
            records: records.map(record => ({
                ...record,
                ...result?.records?.find(_record => _record.url === record.url)
            }))
        };
    }
    return options.service;
};
