/**
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
const {compose, withStateHandlers, defaultProps, withPropsOnChange, withProps} = require("recompose");
const MapUtils = require("../../../../utils/MapUtils");
const CoordinatesUtils = require("../../../../utils/CoordinatesUtils");
const {isEmpty} = require("lodash");
const defaultBaseLayer = {
    group: "background",
    id: "mapnik__0",
    loading: false,
    loadingError: false,
    name: "mapnik",
    source: "osm",
    title: "Open Street Map",
    type: "osm",
    visibility: true
};


module.exports = compose(
    defaultProps({
        onMapReady: () => {},
        baseLayer: defaultBaseLayer

    }),
    withPropsOnChange("baseLayer", props => {
        return {layers: [props.baseLayer]};
    }),
    withStateHandlers(() => ({
        map: { projection: "EPSG:4326" },
        initialized: false
    }),
    {
        onMapViewChanges: () => (map) => ( {map}),
        onLayerLoad: ({map, initialized}, {onMapReady, baseLayer}) => (layerId) => {
            // Map is ready when background is loaded just first load
            if (!initialized && layerId === baseLayer.id) {
                onMapReady(map);
                return {initialized: true};
            }
            return {};
        },
        centerLayer: (state, {layer: l}) => (map) => {
            if (isEmpty(l)) {
                return {};
            }
            const center = MapUtils.getCenterForExtent(l.bbox.extent, l.bbox.crs);
            const extent = l.bbox.crs !== (map.projection || "EPSG:3857") ? CoordinatesUtils.reprojectBbox(l.bbox.extent, l.bbox.crs, map.projection || "EPSG:3857") : l.bbox.extent;
            let zoom = 1;
            if (map.size) {
                zoom = MapUtils.getZoomForExtent(extent, map.size, 0, 21);
            }
            const {bbox: omit, ...om} = map;
            return {map: {...om, zoom, center, extent, mapStateSource: "mapModal"}};
        }
    }
    ),
    withPropsOnChange("layer", props => {
        return {layers: props.layers.concat(props.layer || [])};
    }),
    withPropsOnChange(({map = {}}, {map: nM}) => {
        return (!map.size && nM.size);
    },
    ({ centerLayer, map}) => {
        if (map.size) {
            centerLayer(map);
        }
        return {};
    }),
    withProps(({onLayerLoad}) => ({eventHandlers: {onLayerLoad}}))
);
