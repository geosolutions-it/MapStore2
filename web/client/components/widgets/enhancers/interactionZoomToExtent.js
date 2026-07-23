/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { withPropsOnChange } from 'recompose';
import { isEqual } from 'lodash';
import { ZOOM_TO_EXTENT_HOOK } from '../../../utils/MapUtils';

/**
 * Triggers the map's zoom when a `zoomToRequest` is received from the filter widget
 * interaction. Unlike `dependenciesToExtent`, it is driven directly by the interaction
 * system and does not require legacy map connection setup.
 */
export default withPropsOnChange(
    (props = {}, nextProps = {}) => {
        const next = (nextProps.maps || []).find(m => m?.zoomToRequest);
        const current = (props.maps || []).find(m => m?.mapId === next?.mapId);
        return !!next && !isEqual(current?.zoomToRequest, next.zoomToRequest);
    },
    ({ id, maps = [], updateProperty = () => {}, hookRegister }) => {
        const targetMap = maps.find(m => m?.zoomToRequest);
        if (!targetMap) {
            return {};
        }
        const hook = hookRegister?.getHook(ZOOM_TO_EXTENT_HOOK);
        if (hook) {
            const { extent, crs, maxZoom, padding } = targetMap.zoomToRequest;
            hook(extent, { crs, maxZoom, ...(padding ? { padding } : {}) });
        }
        updateProperty(id, 'maps', { mapId: targetMap.mapId, zoomToRequest: undefined }, 'merge');
        return {};
    }
);
