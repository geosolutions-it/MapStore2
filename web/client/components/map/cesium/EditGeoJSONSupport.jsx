/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useRef, useEffect } from 'react';
import CesiumModifyGeoJSONInteraction from '../../../utils/cesium/ModifyGeoJSONInteraction';

/**
 * Support for 3D drawing, this component provides only the interactions and callback for a drawing workflow
 * @name EditGeoJSONSupport
 * @prop {object} map instance of the current map library in use
 * @prop {boolean} active activate the drawing functionalities
 * @prop {object} geojson `Feature` or `FeatureCollection` GeoJSON data
 * @prop {function} onEditEnd triggered one the editing has been completed
 * @prop {function} toEditProperties convert properties of feature to edit properties `geometryType`, `geodesic` and `radius` are needed to compute the editing. `geometryType` could be: `Point`, `LineString`, `Polygon` or `Circle`
 * @prop {function} fromEditProperties restore properties of the feature to the original one
 * @prop {number} mouseMoveThrottleTime throttle value to limit the mousemove event callback and improve the interaction, default 100ms
 * @prop {object} style override the default style of drawing mode (see web/client/utils/DrawUtils.js)
 */
function EditGeoJSONSupport({
    map,
    active,
    geojson,
    onEditEnd,
    style,
    toEditProperties,
    fromEditProperties,
    mouseMoveThrottleTime
}) {
    const modify = useRef();

    useEffect(() => {
        if (map?.canvas && active) {
            modify.current = new CesiumModifyGeoJSONInteraction({
                map,
                geojson,
                toEditProperties,
                fromEditProperties,
                onEditEnd,
                style,
                mouseMoveThrottleTime
            });
        }
        return () => {
            if (modify.current) {
                modify.current.remove();
            }
        };
    }, [map, active, mouseMoveThrottleTime]);

    useEffect(() => {
        if (modify.current) {
            modify.current.setGeoJSON(geojson);
            modify.current = null;
        }
    }, [geojson]);

    return null;
}

export default EditGeoJSONSupport;
