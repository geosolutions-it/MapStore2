/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import CONFIG_PROVIDER from '../../utils/ConfigProvider';
import {get} from 'lodash';
import {Observable} from 'rxjs';
import { isValidURLTemplate } from '../../utils/URLUtils';


const CUSTOM = "custom";

const getVariants = provider => Object.keys(CONFIG_PROVIDER ?.[provider]?.variants ?? {});
const searchAndPaginate = (layers, startPosition, maxRecords, text) => {

    const filteredLayers = layers
        .filter(({ title = "" } = {}) => !text
            || title.toLowerCase().indexOf(text.toLowerCase()) !== -1
        );
    const records = filteredLayers
        .filter((layer, index) => index >= startPosition - 1 && index < startPosition - 1 + maxRecords);
    return {
        numberOfRecordsMatched: filteredLayers.length,
        numberOfRecordsReturned: records.length,
        nextRecord: startPosition + Math.min(maxRecords, filteredLayers.length) + 1,
        records
    };
};

export const getRecords = (url, startPosition, maxRecords, text, info) => {
    const service = get(info, 'options.service'); // this option allows to show also other layers
    let layers = [];
    // existing tile provider from ConfigProvider
    if (service.provider && service.provider !== CUSTOM) {
        const variants = getVariants(service.provider);
        if (variants.length === 0) {
            layers.push({
                provider: `${service.provider}`,
                title: `${service.provider}`
            });
        } else {
            layers = variants.map(variant => ({
                provider: `${service.provider}.${variant}`
            }));
        }
    // custom service
    } else if (service.url) {
        // only one layer, as configured
        // TODO: handle variants in options
        layers = [{
            ...service,
            title: service.title,
            type: 'tileprovider',
            url: service.url,
            attribution: service.attribution,
            options: service.options || {},
            provider: CUSTOM // this overrides also in case of null value
        }];
    }
    // fake request with generated layers
    return new Promise((resolve) => {
        resolve(searchAndPaginate(layers, startPosition, maxRecords, text));
    });


};
export const textSearch = (url, startPosition, maxRecords, text, info) => getRecords(url, startPosition, maxRecords, text, info);


const validateURLTemplate = (url) => {
    return isValidURLTemplate(url); // TODO: check parameters
};
export const validate = (service) => {
    const isValid = (!service.provider || service.provider === "custom") ? validateURLTemplate(service.url) : !!service.provider;
    if (service.title && isValid) {
        return Observable.of(service);
    }
    const error = new Error("catalog.config.notValidURLTemplate");
    // insert valid URL;
    throw error;
};

export const testService = (service) => Observable.of(service);
/**
 * API (fake) for tileProvider catalog. Browse static configuration in ConfigProvider variants for each provider or offers a custom, 1 element source to add custom tileProvider.
 * @module api.tileProvider
 */
