/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { isArray, castArray, filter, isEmpty, isNil } from 'lodash';
import { getResolutionObject } from "../../utils/MapUtils";
import { Observable } from 'rxjs';
import { getConfigProp, cleanDuplicatedQuestionMarks } from '../../utils/ConfigUtils';
import { getLayerTitleTranslations } from '../../utils/LayersUtils';
import { isValidGetFeatureInfoFormat, isValidGetMapFormat } from '../../utils/WMSUtils';
import { INFO_FORMATS_BY_MIME_TYPE } from '../../utils/FeatureInfoUtils';
import {
    extractOGCServicesReferences,
    toURLArray,
    removeParameters,
    buildSRSMap,
    getRecordLinks
} from '../../utils/CatalogUtils';

import {
    getBBox,
    textSearch as wmsTextSearch,
    parseUrl as wmsParseUrl
} from '../WMS';
import {
    validate as commonValidate,
    testService as commonTestService
} from './common';

const recordToLayer = (record, {
    removeParams = [],
    service,
    catalogURL,
    url,
    map = {},
    layerBaseConfig
} = {}) => {
    if (!record || !record.references) {
        // we don't have a valid record so no buttons to add
        return null;
    }
    // let's extract the references we need
    const { wms: ogcServiceReference } = extractOGCServicesReferences(record);

    // typically you should remove authkey parameters
    const cleanURL = URL => removeParameters(cleanDuplicatedQuestionMarks(URL), ["request", "layer", "layers", "service", "version"].concat(removeParams));
    let originalUrl;
    let params;
    const urls = toURLArray(ogcServiceReference.url);

    // extract additional parameters and alternative URLs.
    if (urls && isArray(urls)) {
        originalUrl = urls.map( u => cleanURL(u)).map( ({url: u}) => u);
        params = urls.map(u => cleanURL(u)).map(({params: p}) => p).reduce( (prev, cur) => ({...prev, ...cur}), {});
    } else {
        const { url: uu, params: pp } = cleanURL(urls || catalogURL);
        originalUrl = uu;
        params = pp;
    }

    // calculate and normalize URL
    // if array of 1 element, take simply the string
    const toLayerURL = u => isArray(u) && u.length === 1 ? u[0] : u;
    const layerURL = toLayerURL(url || originalUrl);

    const allowedSRS = buildSRSMap(ogcServiceReference.SRS);
    const {
        MaxScaleDenominator: maxScaleDenominator,
        MinScaleDenominator: minScaleDenominator
    } = record?.capabilities ?? {};

    const {
        format: defaultFormat,
        infoFormat,
        localizedLayerStyles,
        allowUnsecureLayers,
        autoSetVisibilityLimits,
        layerOptions
    } = service || {};

    const supportedGetMapFormats = (record.getMapFormats || []).filter(isValidGetMapFormat);
    const supportedGetFeatureInfoFormats = (record.getFeatureInfoFormats || []).filter(isValidGetFeatureInfoFormat);
    const format = supportedGetMapFormats?.find((value) => value === defaultFormat)
        || supportedGetMapFormats[0]
        || defaultFormat;
    const featureInfo = infoFormat && INFO_FORMATS_BY_MIME_TYPE[infoFormat]
        ? { format: INFO_FORMATS_BY_MIME_TYPE[infoFormat] }
        : null;
    let security;
    if (service?.protectedId) {
        security = {sourceId: service?.protectedId, type: "basic"};
    }
    let layer = {
        type: 'wms',
        requestEncoding: record.requestEncoding, // WMTS KVP vs REST, KVP by default
        style: record.style,
        format,
        featureInfo: featureInfo,
        url: layerURL,
        capabilitiesURL: record.capabilitiesURL,
        queryable: record.queryable,
        visibility: true,
        dimensions: record.dimensions || [],
        name: ogcServiceReference.params && ogcServiceReference.params.name,
        title: record.title || ogcServiceReference.params && ogcServiceReference.params.name,
        description: record.description || "",
        credits: !getConfigProp("noCreditsFromCatalog") && record.credits,
        bbox: {
            crs: record.boundingBox.crs,
            bounds: {
                minx: record.boundingBox.extent[0],
                miny: record.boundingBox.extent[1],
                maxx: record.boundingBox.extent[2],
                maxy: record.boundingBox.extent[3]
            }
        },
        security,
        links: getRecordLinks(record),
        params: params,
        allowedSRS: allowedSRS,
        catalogURL,
        ...layerBaseConfig,
        ...layerOptions,
        ...record.layerOptions,
        localizedLayerStyles: !isNil(localizedLayerStyles) ? localizedLayerStyles : undefined,
        imageFormats: supportedGetMapFormats,
        infoFormats: supportedGetFeatureInfoFormats,
        ...(!isNil(allowUnsecureLayers) && { forceProxy: allowUnsecureLayers })
    };

    if (autoSetVisibilityLimits && !isEmpty(map) && (maxScaleDenominator || minScaleDenominator)) {
        const {resolution: minResolution} = !isNil(minScaleDenominator)
        && getResolutionObject(minScaleDenominator, 'scale', map) || {};
        const {resolution: maxResolution} = !isNil(maxScaleDenominator)
        && getResolutionObject(maxScaleDenominator, 'scale', map) || {};
        layer = {...layer, minResolution, maxResolution};
    }

    return layer;
};

export const preprocess = (service) => {
    let { domainAliases } = service;
    service.domainAliases = filter(domainAliases);
    return Observable.of(service);
};
export const validate = commonValidate;
export const testService = commonTestService({ parseUrl: wmsParseUrl });
export const textSearch = wmsTextSearch;
export const getCatalogRecords = (records, options) => {
    if (records && records.records) {
        return records.records.map((record) => {
            const references = [{
                type: "OGC:WMS",
                url: options && options.url,
                SRS: (record.SRS && (isArray(record.SRS) ? record.SRS : [record.SRS])) || [],
                params: {
                    name: record.Name
                }
            }];
            const { wms: ogcReferences } = extractOGCServicesReferences({ references });
            return {
                serviceType: 'wms',
                isValid: !!ogcReferences,
                capabilities: record,
                credits: record.credits,
                boundingBox: getBBox(record),
                description: record.Abstract || record.Title || record.Name,
                identifier: record.Name,
                service: records.service,
                tags: "",
                layerOptions: {
                    ...(options?.layerOptions || {}),
                    ...(records?.layerOptions || {})
                },
                title: getLayerTitleTranslations(record) || record.Name,
                getMapFormats: record.getMapFormats,
                getFeatureInfoFormats: record.getFeatureInfoFormats,
                dimensions: (record.Dimension && castArray(record.Dimension) || []).map((dim) => Object.assign({}, {
                    values: dim._ && dim._.split(',') || []
                }, dim.$ || {}))
                // TODO: re-enable when support to inline values is full (now timeline miss snap, auto-select and forward-backward buttons enabled/disabled for this kind of values)
                // TODO: replace with capabilities URL service. something like this:
                    /*
                    .map(dim => dim && dim.name !== "time" ? dim : {
                        ...dim,
                        values: undefined, <-- remove values (they can be removed from dimension's epic instead, using them as initial value)
                        source: { <-- add the source
                            type: "wms-capabilities",
                            url: options.url
                        }
                    })
                    */
                    // excludes time from dimensions. TODO: remove when time from WMS capabilities is supported
                    .filter(dim => dim && dim.name !== "time"),

                references,
                ogcReferences
            };
        });
    }
    return null;
};
export const getLayerFromRecord = (record, options, asPromise) => {
    const layer = recordToLayer(record, options);
    return asPromise ? Promise.resolve(layer) : layer;
};
