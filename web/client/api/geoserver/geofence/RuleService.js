/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import axios from '../../../libs/ajax';

import { pickBy } from 'lodash';
import { convertRuleGS2GF, convertRuleGF2GS } from '../../../utils/RuleServiceUtils';


const EMPTY_RULE = {
    constraints: {},
    ipaddress: "",
    layer: "",
    request: "",
    rolename: "",
    service: "",
    username: "",
    workspace: "",
    validbefore: null,
    validafter: null
};

/**
 *
 * @param {object} object the rule
 */
const clearNullEntries = object => pickBy(object, v => v !== null);

// TODO: missing documentation
const cleanConstraints = (rule) => {
    if (!rule.constraints) {
        return rule;
    } else if (rule.grant === "DENY") {
        const { constraints: omit, ...r } = rule;
        return r;
    }
    let constraints = { ...rule.constraints };
    constraints.allowedStyles = {style: constraints.allowedStyles && constraints.allowedStyles.style || []};
    constraints.attributes = {attribute: constraints.attributes && constraints.attributes.attribute || []};
    constraints.restrictedAreaWkt = constraints.restrictedAreaWkt || "";
    return { ...rule, constraints };
};

const normalizeFilterValue = (value) => {
    return value === "*" ? undefined : value;
};

/**
 * Returns the parameter for GeoServer REST GeoFence (integrated) API key
 * @param {string} key the key of the filter map
 */
const normalizeKey = (key) => {
    switch (key) {
    // found out that is case sensitive
    case 'username':
        return 'userName';
    case 'rolename':
        return 'roleName';
    default:
        return key;
    }
};

const assignFiltersValue = (rulesFiltersValues = {}) => {
    return Object.keys(rulesFiltersValues).map(key => ({ key, normKey: normalizeKey(key) }))
        .reduce((params, { key, normKey }) => ({ ...params, [normKey]: normalizeFilterValue(rulesFiltersValues[key]) }), {});
};

const processFilterValues = (rulesFiltersValues) => {
    let normalizeFilterValues = {};

    Object.keys(rulesFiltersValues).forEach((key) => {
        let value = rulesFiltersValues[key];
        let isAnyField = key.endsWith("Any");

        // Handle normal fields (not ending with "Any")
        if (!isAnyField) {
            const anyKey = `${key}Any`;

            if (value !== undefined && value !== "") {
                // If the field has a value, include it and process the flag
                normalizeFilterValues[key] = value;
                normalizeFilterValues[anyKey] = rulesFiltersValues[anyKey] === true || rulesFiltersValues[anyKey] === undefined ? true : false;
            } else {
                // If the field has no value, do not include its flag
                delete normalizeFilterValues[anyKey];
            }
        }
    });

    return normalizeFilterValues;
};

/**
 * Creates an API to interacts with geoserver-integrated version of GeoFence
 * @param {object} config
 * @param {function} config.addBaseUrl function that add the baseURL to the axios options.
 * @param {function} config.addBaseUrlGS function that add the GeoServer URL to the BaseURL (used to empty the cache)
 * @param {function} config.getGeoServerInstance function that returns the instance object `{id: 1, url: "some-url"}`
 */
const Api = ({ addBaseUrl, addBaseUrlGS, getGeoServerInstance }) => ({
    cleanCache: () => {
        return axios.get('rest/geofence/ruleCache/invalidate', addBaseUrlGS())
            .then((response) => {
                return response.data;
            }
            );
    },
    loadRules: (page, rulesFiltersValues, entries = 10) => {
        const params = {
            page,
            entries,
            ...assignFiltersValue(processFilterValues(rulesFiltersValues))
        };
        const options = {
            params, 'headers': {
                'Content': 'application/json'
            }
        };
        return axios.get('/rules', addBaseUrl(options))
            .then(({data}) => {
                return {
                    count: data.count,
                    rules: (data.rules || []).map( convertRuleGS2GF )
                    // remove null. undefined is expected as no-data value
                        .map( clearNullEntries )
                };
            });
    },
    /**
     * Count Rules with match with the selected filter
     * @param {object} filter the filter to apply
     * @returns {Promise<Number>}
     */
    getRulesCount: (rulesFiltersValues) => {
        const options = {
            'params': assignFiltersValue(processFilterValues(rulesFiltersValues))
        };
        return axios.get('/rules/count', addBaseUrl(options)).then((response) => {
            return response.data.count;
        });
    },
    /**
     * Move the `rules` passed at the the `targetPriority` position.
     * @param {number|string} targetPriority the position where to place the rules
     * @param {array[object]} rules the rules to move
     * @returns {Promise}
     */
    moveRules: (targetPriority, rules) => {
        const options = {
            'params': {
                'targetPriority': targetPriority,
                'rulesIds': rules && rules.map(rule => rule.id).join()
            }
        };
        return axios.get('/rules/move', addBaseUrl(options)).then((response) => {
            return response.data;
        });
    },

    deleteRule: (ruleId) => {
        return axios.delete('/rules/id/' + ruleId, addBaseUrl({}));
    },

    addRule: (rule) => {
        const newRule = { ...rule };
        if (!newRule.instance) {
            const { id: instanceId } = getGeoServerInstance();
            newRule.instance = { id: instanceId };
        }
        if (!newRule.grant) {
            newRule.grant = "ALLOW";
        }
        return axios.post('/rules', {Rule: convertRuleGF2GS(cleanConstraints(newRule))}, addBaseUrl({
            'headers': {
                'Content': 'application/json'
            }
        }));
    },

    updateRule: (rule) => {
        // id, priority and grant aren't updatable
        const newRule = { ...EMPTY_RULE, ...cleanConstraints(rule) };

        return axios.put(`/rules/id/${rule.id}`, {Rule: convertRuleGF2GS(newRule)}, addBaseUrl({
            'headers': {
                'Content': 'application/json'
            }
        }));
    }
});

export default Api;
