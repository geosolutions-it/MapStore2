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
import { zoomToExtent } from '../../../actions/map';
import Message from '../../../components/I18N/Message';

const getCRS = (layers = []) => {
    const crsValues = uniq(layers.map((layer) => layer?.bbox?.crs).filter(value => !!value));
    return crsValues.length === 1 ? crsValues[0] : '';
};

function computeBoundingBoxFromLayers(layers) {
    const layersBbox = layers
        .filter(l => l.bbox)
        .map(l => ({
            ...l.bbox,
            bounds: {
                minx: parseFloat(l.bbox.bounds.minx),
                miny: parseFloat(l.bbox.bounds.miny),
                maxx: parseFloat(l.bbox.bounds.maxx),
                maxy: parseFloat(l.bbox.bounds.maxy)
            }
        }));
    const bbox = layersBbox.length > 1 ? layersBbox.reduce((a, b) => {
        return {
            bounds: {
                maxx: a.bounds.maxx > b.bounds.maxx ? a.bounds.maxx : b.bounds.maxx,
                maxy: a.bounds.maxy > b.bounds.maxy ? a.bounds.maxy : b.bounds.maxy,
                minx: a.bounds.minx < b.bounds.minx ? a.bounds.minx : b.bounds.minx,
                miny: a.bounds.miny < b.bounds.miny ? a.bounds.miny : b.bounds.miny
            }, crs: b.crs};
    }, layersBbox[0]) : layersBbox[0];
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
        const layers = getGroupLayers({ nodes: selectedNodes.map(selected => selected?.node) }).filter(layer => layer?.bbox);
        const crs = getCRS(layers);
        if (!crs) {
            return null;
        }
        const crsIsSupported = crs && Proj4js.defs(crs);
        const boundingBox = computeBoundingBoxFromLayers(layers);
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
                labelId={layers.length > 1 ? 'toc.toolZoomToLayersTooltip' : 'toc.toolZoomToLayerTooltip'}
                tooltip={
                    crsIsSupported
                        ? <Message msgId={layers.length > 1 ? 'toc.toolZoomToLayersTooltip' : 'toc.toolZoomToLayerTooltip'}/>
                        : <Message msgId="toc.epsgNotSupported" msgParams={{ epsg: crs || ' ' }}/>
                }
                onClick={!crsIsSupported ? () => {} : () => onZoomTo(boundingBox.bounds, boundingBox.crs)}
            />
        );
    }
    return null;
});

export default ZoomToLayersButton;

