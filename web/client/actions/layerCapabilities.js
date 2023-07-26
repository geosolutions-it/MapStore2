/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import { get } from 'lodash';

import { updateNode } from './layers';

import {getCapabilitiesUrl} from '../utils/LayersUtils';
import { extractGeometryType } from '../utils/WFSLayerUtils';
import { getLayerOptions } from '../utils/WMSUtils';
import WCS from '../api/WCS';
import * as WFS from '../api/WFS';
import WMS from '../api/WMS';

export const DESCRIBE_FEATURE_TYPE_LOADED = "LAYER_CAPABILITIES:DESCRIBE_FEATURE_TYPE_LOADED";
export const DESCRIBE_COVERAGES_LOADED = "LAYER_CAPABILITIES:DESCRIBE_COVERAGES_LOADED";

/**
 * action for saying a describe feature type has been loaded
 * @memberof actions.layerCapabilities
 * @param  {string} layerId the layer id
 * @param  {string} source
 */
export const describeFeatureTypeLoaded = (layerId, source) => ({
    type: DESCRIBE_FEATURE_TYPE_LOADED,
    layerId,
    source
});
/**
 * action for saying a describe coverages has been loaded
 * @memberof actions.layerCapabilities
 * @param  {string} layerId the layer id
 * @param  {string} source
 */
export const describeCoveragesLoaded = (layerId, source) => ({
    type: DESCRIBE_COVERAGES_LOADED,
    layerId,
    source
});

/**
 * action for getting describe layer and describe feature type
 * @memberof actions.layerCapabilities
 * @param  {string} url the url
 * @param  {object} layer the layer object
 * @param  {object} options the options
 * @param  {source} source if present it will trigger a loaded action, useful for side effect
 */
export function getDescribeLayer(url, layer, options, source) {
    return (dispatch /* , getState */) => {
        return WMS.describeLayer(url, layer.name, options).then((describeLayer) => {
            if (describeLayer && describeLayer.owsType === "WFS") {
                WFS.describeFeatureType(url, describeLayer.name)
                    .then( (describeFeatureType) => {
                        describeLayer.geometryType = extractGeometryType(describeFeatureType);
                        dispatch(updateNode(layer.id, "id", { describeLayer, describeFeatureType }));
                        if (source) {
                            dispatch(describeFeatureTypeLoaded(layer.id, source));
                        }
                    })
                    .catch(() => {
                        dispatch(updateNode(layer.id, "id", { describeLayer: describeLayer || { "error": "no describe feature found" }}));
                    });
            } else if ( describeLayer && describeLayer.owsType === "WCS" ) {
                WCS.describeCoverage(url, describeLayer.name).then((describeCoverage) => {
                    // TODO move the management of this bands in the proper components, getting the describeFeatureType entry:
                    let axis = get(describeCoverage, "wcs:CoverageDescriptions.wcs:CoverageDescription.wcs:Range.wcs:Field.wcs:Axis.wcs:AvailableKeys.wcs:Key");
                    if (axis && typeof axis === "string") {
                        describeLayer.bands = [1 + ""];
                    } else {
                        describeLayer.bands = axis.map((el, index) => index + 1 + ""); // array of 1 2 3 because the sld do not recognize the name
                    }

                    dispatch(updateNode(layer.id, "id", {describeLayer, describeCoverage}));
                    if (source) {
                        dispatch(describeCoveragesLoaded(layer.id, source));
                    }
                }).catch(() => {
                    dispatch(updateNode(layer.id, "id", {describeLayer: describeLayer || {"error": "no describe coverage found"}}));
                });
            }
            dispatch(updateNode(layer.id, "id", {describeLayer: describeLayer || {"error": "no describe Layer found"}}));

        })
            .catch((error) => {
                dispatch(updateNode(layer.id, "id", {describeLayer: {"error": error.status}}));
            });
    };
}

export function getLayerCapabilities(layer) {
    // geoserver's specific. TODO parse layer.capabilitiesURL.
    const reqUrl = getCapabilitiesUrl(layer);
    return (dispatch) => {
        // TODO, look ad current cached capabilities;
        dispatch(updateNode(layer.id, "id", {
            capabilitiesLoading: true
        }));
        return WMS.getCapabilities(reqUrl).then((capabilities) => {
            const layerCapability = WMS.parseLayerCapabilities(capabilities, layer);

            if (layerCapability) {
                dispatch(updateNode(layer.id, "id", { ...getLayerOptions(layerCapability), capabilitiesLoading: null }));
            } else {
                dispatch(updateNode(layer.id, "id", { capabilitiesLoading: null, capabilities: { error: "error getting capabilities", details: "no layer info" }, description: null }));
            }
            // return dispatch(updateNode(layer.id, "id", {capabilities: capabilities || {"error": "no describe Layer found"}}));

        }).catch((error) => {
            dispatch(updateNode(layer.id, "id", {capabilitiesLoading: null, capabilities: {error: "error getting capabilities", details: error}, description: null} ));

            // return dispatch(updateNode(layer.id, "id", {capabilities: capabilities || {"error": "no describe Layer found"}}));

        });
    };
}
