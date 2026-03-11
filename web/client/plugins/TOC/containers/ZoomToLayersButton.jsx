/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import { connect } from 'react-redux';
import Proj4js from 'proj4';
import uniq from 'lodash/uniq';
import isPlainObject from 'lodash/isPlainObject';
import { zoomToExtent } from '../../../actions/map';
import Message from '../../../components/I18N/Message';
import turfBbox from '@turf/bbox';

const getCRS = (layers = []) => {
    const crsValues = uniq(layers.map((layer) => layer?.bbox?.crs).filter(value => !!value));
    return crsValues.length === 1 ? crsValues[0] : '';
};

const addVectorBbox = (layers = []) => {
    return layers.map((layer) => {
        // we can compute the extent from features
        // if the vector layer does not have a bounding box
        if (layer.type === 'vector' && !layer.bbox && layer?.features?.length) {
            const extent = turfBbox({
                type: "FeatureCollection",
                features: layer.features
            });
            return {
                ...layer,
                bbox: {
                    bounds: {
                        minx: extent[0],
                        miny: extent[1],
                        maxx: extent[2],
                        maxy: extent[3]
                    },
                    crs: 'EPSG:4326'
                }
            };
        }
        return layer;
    });
};

/**
 * compute the total bounds of a list of layers, the layers must have a bbox property with bounds and same crs
 * @param {array} layers the layers to compute the bounding box from
 * @returns {object} the bounding box of the layers
 */
function computeBoundingBoxFromLayers(layers) {
    const layersBbox = layers
        .filter(l => l.bbox)
        .map(l => {
            return {
                ...l.bbox,
                ...(l.bbox.bounds && {
                    bounds: {
                        minx: Number(l.bbox.bounds.minx),
                        miny: Number(l.bbox.bounds.miny),
                        maxx: Number(l.bbox.bounds.maxx),
                        maxy: Number(l.bbox.bounds.maxy)
                    }
                })
            };
        });
    const bbox = layersBbox.length > 1 ? layersBbox.reduce((a, b) => ({
        bounds: {
            maxx: Math.max(a.bounds.maxx, b.bounds.maxx),
            maxy: Math.max(a.bounds.maxy, b.bounds.maxy),
            minx: Math.min(a.bounds.minx, b.bounds.minx),
            miny: Math.min(a.bounds.miny, b.bounds.miny)
        },
        crs: b.crs
    }), layersBbox[0]) : layersBbox[0];
    return bbox;
}

const getGroupLayers = (node) => {
    if (!node?.nodes) {
        return node;
    }
    return [
        ...(node?.nodes || []).map(getGroupLayers).flat()
    ];
};
/**
 * This component provides the zoom to actions to make them available inside the toolbar or context menu
 */
const ZoomToLayersButton = connect(() => ({}), {
    onZoomTo: zoomToExtent
})(({
    onZoomTo,
    status,
    itemComponent,
    selectedNodes,
    statusTypes,
    ...props
}) => {

    const ItemComponent = itemComponent;
    if ([statusTypes.LAYER, statusTypes.GROUP, statusTypes.LAYERS, statusTypes.GROUPS, statusTypes.BOTH].includes(status)) {
        const layers = getGroupLayers({ nodes: selectedNodes.map(selected => selected?.node) });
        const layersWithBbox = addVectorBbox(layers).filter(layer => isPlainObject(layer?.bbox?.bounds) && layer?.bbox?.crs);
        const crs = getCRS(layersWithBbox);
        if (!crs) {
            return null;
        }
        const crsIsSupported = crs && Proj4js.defs(crs);
        const boundingBox = computeBoundingBoxFromLayers(layersWithBbox);
        if (!boundingBox) {
            return null;
        }
        return (
            <ItemComponent
                {...props}
                glyph="zoom-to"
                style={crsIsSupported
                    ? { opacity: 1.0, cursor: 'pointer' }
                    : { opacity: 0.5, cursor: 'default' }}
                labelId={layersWithBbox.length > 1 ? 'toc.toolZoomToLayersTooltip' : 'toc.toolZoomToLayerTooltip'}
                tooltip={
                    crsIsSupported
                        ? <Message msgId={layersWithBbox.length > 1 ? 'toc.toolZoomToLayersTooltip' : 'toc.toolZoomToLayerTooltip'}/>
                        : <Message msgId="toc.epsgNotSupported" msgParams={{ epsg: crs || ' ' }}/>
                }
                onClick={!crsIsSupported ? () => {} : () => onZoomTo(boundingBox.bounds, boundingBox.crs)}
            />
        );
    }
    return null;
});

export default ZoomToLayersButton;

