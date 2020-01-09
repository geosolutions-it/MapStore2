/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { compose, withHandlers, withProps } from 'recompose';
import {connect} from 'react-redux';
import { head, isArray, isObject, mapValues } from 'lodash';
import Proj4js from 'proj4';
import CoordinatesUtils from '../../../utils/CoordinatesUtils';
import MapUtils from '../../../utils/MapUtils';
import { onEditorChange } from '../../../actions/widgets';

/**
 * Convert and normalize the extent into an array `minx,miny,maxx, maxy`
 * @param {object|array} extent extent object to normalize
 */
const toBoundsArray = extent => {
    // clean up extent
    if (isArray(extent)) {
        return extent.map((val) => {
            // MapUtils.getCenterForExtent returns an array of strings sometimes (catalog)
            if (typeof val === 'string' || val instanceof String) {
                return Number(val);
            }
            return val;
        });
    }
    if (isObject(extent)) {
        const numericExtent = mapValues(extent, v => {
            if (typeof v === 'string' || v instanceof String) {
                return Number(v);
            }
            return v;
        });
        return [
            numericExtent.minx,
            numericExtent.miny,
            numericExtent.maxx,
            numericExtent.maxy
        ];
    }
    return null;
};

const enhancer = compose(
    connect(() => ({}), {
        setMap: map => onEditorChange('map', map)
    }),
    withHandlers({
        isEpsgSupported: ({ editorData = {}, selectedNodes = [] }) => () => {
            const layers = editorData.map.layers;
            const selectedLayers = selectedNodes.map(nodeId => layers.find(layer => layer.id === nodeId)).filter(l => l);
            const layersBbox = selectedLayers.filter(l => l.bbox).map(l => l.bbox);
            const uniqueCRS = layersBbox.length > 0 ? layersBbox.reduce((a, b) => a.crs === b.crs ? a : { crs: 'differentCRS' }) : { crs: 'differentCRS' };
            const currentEPSG = !!head(layersBbox) && uniqueCRS.crs !== 'differentCRS' && uniqueCRS.crs;
            return currentEPSG && Proj4js.defs(currentEPSG);
        },
        zoomTo: ({ editorData = {}, setMap = () => {} }) => (selectedNodes) => {
            const map = editorData.map;
            const layers = editorData.map.layers;
            const selectedLayers = selectedNodes.map(nodeId => layers.find(layer => layer.id === nodeId)).filter(l => l);
            const layersBbox = selectedLayers.filter(l => l.bbox).map(l => l.bbox);
            const bbox = layersBbox.length > 1 ? layersBbox.reduce((a, b) => {
                return {
                    bounds: {
                        maxx: a.bounds.maxx > b.bounds.maxx ? a.bounds.maxx : b.bounds.maxx,
                        maxy: a.bounds.maxy > b.bounds.maxy ? a.bounds.maxy : b.bounds.maxy,
                        minx: a.bounds.minx < b.bounds.minx ? a.bounds.minx : b.bounds.minx,
                        miny: a.bounds.miny < b.bounds.miny ? a.bounds.miny : b.bounds.miny
                    }, crs: b.crs
                };
            }, layersBbox[0]) : layersBbox[0];

            let zoom = 0;
            let extent = toBoundsArray(bbox.bounds);
            let bounds = CoordinatesUtils.reprojectBbox(extent, bbox.crs, map.bbox && map.bbox.crs || "EPSG:4326");
            if (bounds) {
                // center by the max. extent defined in the map's config
                let center = CoordinatesUtils.reproject(MapUtils.getCenterForExtent(extent, bbox.crs), bbox.crs, 'EPSG:4326');
                // workaround to get zoom 0 for -180 -90... - TODO do it better
                let full = bbox.crs === "EPSG:4326" && extent && extent[0] <= -180 && extent[1] <= -90 && extent[2] >= 180 && extent[3] >= 90;
                if (full) {
                    zoom = 1;
                } else {
                    let mapBBounds = CoordinatesUtils.reprojectBbox(extent, bbox.crs, map.projection || "EPSG:4326");
                    // NOTE: mapState should contain size !!!
                    zoom = MapUtils.getZoomForExtent(mapBBounds, map.size, 0, 21, null);
                }

                let newBounds = { minx: bounds[0], miny: bounds[1], maxx: bounds[2], maxy: bounds[3] };
                let newBbox = { ...map.bbox, bounds: newBounds };

                setMap({
                    ...editorData.map,
                    center,
                    zoom,
                    bbox: newBbox,
                    mapStateSource: "tool"
                });
            }
        }
    }),
    withProps(({ isEpsgSupported = () => { } }) => ({
        epsgSupported: isEpsgSupported()
    }))
);

export default enhancer;
