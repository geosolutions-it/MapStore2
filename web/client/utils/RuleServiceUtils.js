/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { castArray } from 'lodash';
import ConfigUtils from './ConfigUtils';

/**
 * Utilities for rule services (GeoFence REST API, stand-alone and GeoServer integrated)
 * @name RuleServiceUtils
 * @memberof utils
 */

/**
 * Convert from GeoServer REST format into GeoFence (internal) format
 * @param {object} rule in GeoServer format
 * @returns {object} the rule in GeoFence Format
 */
export const convertRuleGS2GF = ({
    id,
    priority,
    access: grant,
    layer,
    workspace,
    service,
    request,
    userName: username,
    roleName: rolename,
    limits, // TODO: parse and manage
    addressRange: ipaddress,
    layerDetails,
    validBefore: validbefore,
    validAfter: validafter
}) => ({
    id,
    priority,
    grant,
    layer,
    workspace,
    service,
    request,
    username,
    rolename,
    limits,
    ipaddress,
    constraints: layerDetails && layer && {
        type: layerDetails.layerType,
        defaultStyle: layerDetails.defaultStyle,
        cqlFilterRead: layerDetails.cqlFilterRead,
        cqlFilterWrite: layerDetails.cqlFilterWrite,
        restrictedAreaWkt: layerDetails.allowedArea,
        allowedStyles: layerDetails.allowedStyles && {
            style: castArray(layerDetails.allowedStyles)
        },
        attributes: layerDetails.attributes
            && {
                attribute: layerDetails.attributes.map(({ name, accessType }) =>
                    ({
                        name,
                        access: accessType
                    }))
            }
    },
    validbefore,
    validafter
});

/**
 * Convert from the GeoFence (and internal) rule format into the GeoServer REST format
 * @param {object} rule in GeoFence Format
 * @returns {object} the rule in GeoServer Format
 */
export const convertRuleGF2GS = ({
    id,
    priority,
    grant,
    layer,
    workspace,
    service,
    request,
    username,
    rolename,
    limits,
    ipaddress,
    ...rest
    // constraints = {}

}) => ({
    id,
    priority,
    access: grant,
    layer,
    workspace,
    service,
    request,
    userName: username,
    roleName: rolename,
    limits, // TODO: parse and manage
    addressRange: ipaddress,
    validAfter: rest.validafter || rest.validAfter,
    validBefore: rest.validbefore || rest.validBefore
    /* LAYER DETAILS NOT SUPPORTED YET
    layerDetails: constraints && layer && {
        layerType: constraints.type,
        defaultStyle: constraints.defaultStyle,
        cqlFilterRead: constraints.cqlFilterRead,
        cqlFilterWrite: constraints.cqlFilterWrite,
        allowedArea: constraints.restrictedAreaWkt,
        allowedStyles: constraints.allowedStyles && constraints.allowedStyles.style && castArray(constraints.allowedStyles.style),
        attributes: constraints.attributes && constraints.attributes.attribute
            && constraints.attributes.attribute.map( ({name, access}) =>
                ({
                    name,
                    accessType: access
                }))
    }
    */
});
/**
 * Checks if a given GeoServer instance has configured slave instances in localConfig.
 *
 * This function looks up the 'additionalGsInstancesUrls' configuration using the provided
 * instance name as the key. It returns true only if the configuration exists, is an array,
 * and contains at least one slave entry.
 *
 * @param {string} instanceName - The name/key of the GeoServer master instance to check.
 * @returns {boolean} True if the instance has one or more configured slaves, false otherwise.
 *
 * @example
 * // Example configuration in localConfig.json:
 * {
 *   "additionalGsInstancesUrls": {
 *     "master1": [
 *       { "url": "http://localhost:8081/geoserver1/slave1", "name": "master1/slave1" },
 *       { "url": "http://localhost:8081/geoserver1/slave2", "name": "master1/slave2" },
 *       { "url": "http://localhost:8081/geoserver1/slave3", "name": "master1/slave3" }
 *     ]
 *   }
 * }
 *
 * // Usage:
 * // hasConfiguredGSSlaves("master1") returns true
 * // hasConfiguredGSSlaves("unknownMaster") returns false
 */
export const hasConfiguredGSSlaves = (instanceName) => {
    if (!instanceName) return false;

    const config = ConfigUtils.getConfigProp("additionalGsInstancesUrls") || {};
    const slaves = config[instanceName];

    // Check if slaves exist, is an array, and is not empty
    return Array.isArray(slaves) && slaves.length > 0;
};
/**
 * Expands an array of GeoServer instances by appending their configured slave instances.
 *
 * This function iterates through the provided list of instances. For each instance, it checks
 * if there are associated slaves defined in the 'additionalGsInstancesUrls' configuration.
 * If found, the slaves are appended to the result array immediately after the master instance.
 *
 * @param {object[]} instances - An array of GeoServer instance objects. Each object must have a 'name' property used as the lookup key.
 * @returns {object[]} A new flat array containing the original instances followed by their respective slaves.
 *
 * @example
 * // Example configuration in localConfig.json:
 * {
 *   "additionalGsInstancesUrls": {
 *     "master1": [
 *       { "url": "http://localhost:8081/slave1", "name": "slave1" },
 *       { "url": "http://localhost:8081/slave2", "name": "slave2" }
 *     ]
 *   }
 * }
 *
 * // Input:
 * const instances = [
 *   { name: "master1", url: "http://localhost:8080/master" },
 *   { name: "standalone", url: "http://localhost:8082/standalone" }
 * ];
 *
 * // Output:
 * [
 *   { name: "master1", url: "http://localhost:8080/master" },      // Master
 *   { url: "http://localhost:8081/slave1", name: "slave1" },        // Slave 1
 *   { url: "http://localhost:8081/slave2", name: "slave2" },        // Slave 2
 *   { name: "standalone", url: "http://localhost:8082/standalone" } // Standalone (no slaves)
 * ]
 */
export const expandInstancesWithSlaves = (instances) => {
    const additionalGsInstancesConfig = ConfigUtils.getConfigProp("additionalGsInstancesUrls") || {};
    if (!instances || !Array.isArray(instances)) return [];

    let expanded = [];
    instances.forEach(instance => {
        // Always add the master/current instance
        expanded.push(instance);

        // Check for slaves
        const masterKey = instance.name;
        if (additionalGsInstancesConfig[masterKey] && Array.isArray(additionalGsInstancesConfig[masterKey])) {
            expanded = expanded.concat(additionalGsInstancesConfig[masterKey]);
        }
    });
    return expanded;
};
