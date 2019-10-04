/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {castArray} = require('lodash');

/**
 * Utilities for rule services (GeoFence REST API, stand-alone and GeoServer integrated)
 * @name RuleServiceUtils
 * @memberof utils
 */
module.exports = {
    /**
     * Convert from GeoServer REST format into GeoFence (internal) format
     * @param {object} rule in GeoServer format
     * @returns {object} the rule in GeoFence Format
     */
    convertRuleGS2GF: ({
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
        layerDetails

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
        }
    }),

    /**
     * Convert from the GeoFence (and internal) rule format into the GeoServer REST format
     * @param {object} rule in GeoFence Format
     * @returns {object} the rule in GeoServer Format
     */
    convertRuleGF2GS: ({
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
        ipaddress
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
        addressRange: ipaddress
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
    })
};
