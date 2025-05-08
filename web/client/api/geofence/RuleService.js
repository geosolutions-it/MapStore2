/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import axios from '../../libs/ajax';

import { toJSONPromise } from './common';

const EMPTY_RULE = {
    constraints: {},
    ipaddress: "",
    layer: "",
    request: "",
    rolename: "",
    service: "",
    username: "",
    workspace: "",
    validbefore: "",
    validafter: ""
};

export const cleanConstraints = (rule) => {
    if (rule.instance) {
        // remove url as in rule -> instance includes: id [mandatory], name[optional]
        delete rule.instance.url;
    }
    if (!rule.constraints) {
        return rule;
    } else if (rule.grant === "DENY") {
        const { constraints: omit, ...r } = rule;
        return r;
    }
    let constraints = { ...rule.constraints };
    constraints.allowedStyles = constraints?.allowedStyles?.style ?? [];
    constraints.attributes = constraints?.attributes?.attribute ?? [];
    if (!constraints.restrictedAreaWkt) constraints.restrictedAreaWkt = null; // cannot be empty string, may cause API call to fail
    return { ...rule, constraints };
};

const removeUnusedFieldsForGFRule = (rule) => {
    let ruleKeys = Object.keys(rule);
    if (ruleKeys.includes('date')) {
        delete rule.date;
    }
    return rule;
};
const normalizeFilterValue = (value) => {
    return value === "*" ? undefined : value;
};
const normalizeKey = (key) => {
    switch (key) {
    case 'username':
        return 'userName';
    case 'rolename':
        return 'groupName';
    case 'roleAny':
        return 'groupAny';
    case 'instance':
        return 'instanceName';
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
        const value = rulesFiltersValues[key];
        const isAnyField = key.endsWith("Any");

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
 * Creates an API to interacts with stand-alone version of GeoFence
 * @param {object} config
 * @param {function} config.addBaseUrl function that add the baseURL to the axios options.
 * @param {function} config.addBaseUrlGS function that add the GeoServer URL to the BaseURL (used to empty the cache)
 * @param {function} config.getGeoServerInstance function that returns the instance object `{id: 1, url: "some-url"}`
 */
const Api = ({addBaseUrl, addBaseUrlGS, getGeoServerInstance}) => ({
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
                'Content': 'application/xml'
            }
        };
        return axios.get('/rules', addBaseUrl(options))
            .then( (response) => {
                return toJSONPromise(response.data);
            }
            ).then(({RuleList = {}}) => ({rules: [].concat(RuleList.rule || [])}));
    },

    getRulesCount: (rulesFiltersValues) => {
        const options = {
            'params': assignFiltersValue(processFilterValues(rulesFiltersValues))
        };
        return axios.get('/rules/count', addBaseUrl(options)).then( (response) => {
            return response.data;
        });
    },

    moveRules: (targetPriority, rules) => {
        const options = {
            'params': {
                'targetPriority': targetPriority,
                'rulesIds': rules && rules.map(rule => rule.id).join()
            }
        };
        return axios.get('/rules/move', addBaseUrl(options)).then( (response) => {
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
        return axios.post('/rules', cleanConstraints(removeUnusedFieldsForGFRule(newRule)), addBaseUrl({
            'headers': {
                'Content': 'application/json'
            }
        }));
    },

    updateRule: (rule) => {
        // id, priority and grant aren't updatable
        const { id, priority, grant, position, ...others } = cleanConstraints(rule);
        const newRule = { ...EMPTY_RULE, ...others };
        return axios.put(`/rules/id/${id}`, removeUnusedFieldsForGFRule(newRule), addBaseUrl({
            'headers': {
                'Content': 'application/json'
            }
        }));
    }
});

export default Api;
