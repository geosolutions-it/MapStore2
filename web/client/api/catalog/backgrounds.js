/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import mapBackground from '../mapBackground';
import {
    validate as commonValidate,
    testService as commonTestService,
    preprocess as commonPreprocess
} from './common';

const recordToLayer = (record) => {
    return {
        ...record?.background,
        id: record?.background.name,
        visibility: false
    };
};

export const textSearch = mapBackground.textSearch;
export const preprocess = commonPreprocess;
export const validate = commonValidate;
export const testService = commonTestService({ parseUrl: url => url });
export const getCatalogRecords = (records) => {
    if (records && records.records) {
        return records.records.map(record => {
            return {
                serviceType: 'backgrounds',
                isValid: !!record,
                description: record.title,
                title: record.title,
                identifier: record.name,
                thumbnail: record.thumbURL,
                references: [],
                background: record
            };
        });
    }
    return null;
};

export const getLayerFromRecord = (record, options, asPromise) => {
    const layer = recordToLayer(record, options);
    return asPromise ? Promise.resolve(layer) : layer;
};
