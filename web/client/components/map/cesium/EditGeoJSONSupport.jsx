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
 * Support for 3D drawing, this component provides only the interactions and callback for a drawing workflow.
 * At the moment only `Feature` or `FeatureCollection` with single geometries are supported. **The component does not support multi geometry types**.
 * Following feature properties are used by the edit tool:
 * - properties.geodesic {boolean} if true, enables the geodesic geometries editing
 * - properties.radius {number} value in meters of radius for `Circle` geometry
 * @name EditGeoJSONSupport
 * @prop {object} map instance of the current map library in use
 * @prop {boolean} active activate the drawing functionalities
 * @prop {object} geojson `Feature` or `FeatureCollection` GeoJSON data, **does not support multi geometry types**
 * @prop {function} onEditEnd triggered one the editing has been completed
 * @prop {function} getGeometryType argument of the function is the feature and it should return a string representing the geometry type: `Point`, `LineString`, `Polygon` or `Circle`
 * @prop {object} style override the default style of drawing mode (see `web/client/utils/DrawUtils.js`)
 * @prop {function} getPositionInfo override the default getPositionInfo function, mainly used for testing
 */
function EditGeoJSONSupport({
    map,
    active,
    geojson,
    onEditEnd,
    getGeometryType,
    style,
    getPositionInfo
}) {
    const modify = useRef();

    useEffect(() => {
        if (map?.canvas && active) {
            modify.current = new CesiumModifyGeoJSONInteraction({
                map,
                geojson,
                getGeometryType,
                onEditEnd,
                style,
                getPositionInfo
            });
        }
        return () => {
            if (modify.current) {
                modify.current.remove();
                modify.current = null;
            }
        };
    }, [map, active]);

    useEffect(() => {
        if (modify.current) {
            modify.current.setGeoJSON(geojson);
        }
    }, [geojson]);

    return null;
}

export default EditGeoJSONSupport;
