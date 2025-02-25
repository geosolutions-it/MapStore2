/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useMemo } from 'react';
import get from 'lodash/get';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import { handleExpression } from '../../../utils/PluginsUtils';

const recursiveParsing = (value, parsingFunc) => {
    if (isArray(value)) {
        return value.map(val => recursiveParsing(val, parsingFunc));
    }
    if (isObject(value)) {
        return Object.keys(value).reduce((acc, key) => ({
            ...acc,
            [key]: recursiveParsing(value[key], parsingFunc)
        }), {});
    }
    return parsingFunc(value);
};

const recursiveFilter = (value, filterFunc) => {
    if (isArray(value)) {
        return value.map(val => recursiveFilter(val, filterFunc)).filter(val => val !== undefined);
    }
    if (isObject(value)) {
        return filterFunc(value) ? Object.keys(value).reduce((acc, key) => {
            return {
                ...acc,
                [key]: recursiveFilter(value[key], filterFunc)
            };
        }, {}) : undefined;
    }
    return value;
};

const expressionParsingFunc = (monitoredState) => (value) => {
    try {
        return handleExpression((path) => get(monitoredState, path), /* getPluginsContext()*/ {}, value);
    } catch (e) {
        return value;
    }
};

/**
 * replace expressions with the parsed value taking into account the monitored state
 * @param {object} monitoredState the monitored state object
 * @param {object} payload configuration payload to be parsed
 * @param {function} options.filterFunc a function to filter the parsed items
 * @return {object} parsed payload configuration
 */
const useParsePluginConfigExpressions = (monitoredState, payload, { filterFunc = item => !item.disableIf } = {}) => {
    const parsedConfig = useMemo(() => {
        const config = recursiveFilter(recursiveParsing(payload, expressionParsingFunc(monitoredState)), filterFunc);
        return config;
    }, [monitoredState, payload]);
    return parsedConfig;
};

export default useParsePluginConfigExpressions;

