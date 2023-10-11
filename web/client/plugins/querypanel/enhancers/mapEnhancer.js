/**
* Copyright 2023, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import { compose, withStateHandlers, defaultProps, withPropsOnChange, withProps } from 'recompose';
import { isEmpty } from 'lodash';

import { getCenterForExtent, getZoomForExtent, createRegisterHooks, ZOOM_TO_EXTENT_HOOK } from '../../../utils/MapUtils';
import { reprojectBbox, getExtentFromViewport } from '../../../utils/CoordinatesUtils';

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


const mapEnhancer = compose(
    defaultProps({
        onMapReady: () => {},
        baseLayer: defaultBaseLayer

    }),
    withPropsOnChange("baseLayer", props => {
        return {layers: [props.baseLayer]};
    }),
    withPropsOnChange(["id"],
        ({hookRegister = null}) => ({
            hookRegister: hookRegister || createRegisterHooks()
        })),
    withStateHandlers(() => ({
        initialized: false
    }),
    {
        onMapViewChanges: () => (map) => ( {map}),
        onLayerLoad: ({map, initialized}, {onMapReady, baseLayer, hookRegister, layer}) => (layerId) => {
            // Map is ready when background is loaded just first load
            if (!initialized && layerId === baseLayer.id) {
                onMapReady(map);
                const bounds4326 = layer.bbox.bounds;
                const hook = hookRegister.getHook(ZOOM_TO_EXTENT_HOOK);
                if (hook) {
                    // trigger "internal" zoom to extent
                    hook(bounds4326, {
                        crs: layer.bbox.crs,
                        maxZoom: 21
                    });
                }
                return {initialized: true};
            }
            return {};
        },
        centerLayer: (state, {layer: l}) => (map) => {
            if (isEmpty(l)) {
                return {};
            }
            const newBbox = getExtentFromViewport(l.bbox, l.bbox.crs);
            const center = getCenterForExtent(newBbox, l.bbox.crs);
            const extent = l.bbox.crs !== (map.projection || "EPSG:3857") ? reprojectBbox(l.bbox.bounds, l.bbox.crs, map.projection || "EPSG:3857") : l.bbox.extent;
            let zoom = 1;
            if (map?.size) {
                zoom = getZoomForExtent(extent, map.size, 0, 21);
            }
            const {bbox: omit, ...om} = map;
            return {map: {...om, zoom, center, extent, mapStateSource: "mapModal"}};
        }
    }
    ),
    withProps(props => {
        return {layers: props.layers.concat(props.layer || [])};
    }),
    withPropsOnChange(({map = {}}, {map: nM}) => {
        return (!map?.size && nM?.size);
    },
    ({ centerLayer, map}) => {
        if (map?.size) {
            centerLayer(map);
        }
        return {};
    }),
    withProps(({onLayerLoad}) => ({eventHandlers: {onLayerLoad}}))
);
mapEnhancer.displayName = 'mapEnhancer';
export default mapEnhancer;
