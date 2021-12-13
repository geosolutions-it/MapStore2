/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useRef, useEffect } from "react";
import PropTypes from 'prop-types';

import { reprojectBbox, reproject } from '../../../../utils/CoordinatesUtils';
import Point from 'ol/geom/Point';

const zoomTo = {
    openlayers: {
        fit: ({ map, geometry, padding, geometryProjection, fixedZoom, maxZoom, duration }) => {
            const view = map.getView();
            const mapProjection = view.getProjection().getCode();
            let target;
            if (geometry.length === 2) {
                const { x, y } = reproject(geometry, geometryProjection, mapProjection);
                target = new Point([x, y]);
            } else {
                target = reprojectBbox(geometry, geometryProjection, mapProjection);
            }
            const { top = 0, right = 0, bottom = 0, left = 0 } = padding || {};
            view.fit(target, {
                padding: [top, right, bottom, left],
                maxZoom: fixedZoom ? view.getZoom() : maxZoom,
                duration
            });
        }
    },
    leaflet: {
        fit: ({ map, geometry, padding, geometryProjection, fixedZoom, maxZoom, duration }) => {
            const zoom = fixedZoom ? map.getZoom() : maxZoom;
            const { top = 0, right = 0, bottom = 0, left = 0 } = padding;
            let target;
            if (geometry.length === 2) {
                const { x: lng, y: lat } = reproject(geometry, geometryProjection, 'EPSG:4326');
                target = [
                    [lat, lng],
                    [lat, lng]
                ];
            } else {
                const [minLng, minLat, maxLng, maxLat] = reprojectBbox(geometry, geometryProjection, 'EPSG:4326');
                target = [
                    [minLat, minLng],
                    [maxLat, maxLng]
                ];
            }
            map.flyToBounds(target, {
                paddingTopLeft: [left, top],
                paddingBottomRight: [right, bottom],
                maxZoom: zoom,
                animate: !!duration,
                duration: duration / 1000
            });
        }
    }
};

/**
 * Support for fit bounds maps callback
 * @prop {object} map map library instance object
 * @prop {string} mapType type of map library
 * @prop {boolean} active activate fit actions
 * @prop {array} geometry array of coordinates: point [x, y] or extent [minx, miny, maxx, maxy]
 * @prop {object} padding padding in px to center the zoom pan actions { top: 0, right: 0, bottom: 0, left: 0 }
 * @prop {number} maxZoom maximum zoom to fit the bounds
 * @prop {boolean} fixedZoom use the current map zoom
 * @prop {number} duration duration of animation in milliseconds
 */
function FitBounds({
    map,
    mapType,
    active,
    geometry,
    geometryProjection = 'EPSG:4326',
    padding,
    maxZoom,
    fixedZoom,
    duration
}) {
    const fit = useRef();

    fit.current = () => {
        if (map && zoomTo[mapType]) {
            zoomTo[mapType].fit({
                map,
                geometry,
                padding,
                geometryProjection,
                maxZoom,
                fixedZoom,
                duration
            });
        }
    };

    useEffect(() => {
        if (active && geometry) {
            fit.current();
        }
    }, [ geometry, active ]);

    return null;
}

FitBounds.propTypes = {
    id: PropTypes.string,
    map: PropTypes.object,
    mapType: PropTypes.string,
    active: PropTypes.bool,
    geometry: PropTypes.array,
    geometryProjection: PropTypes.string,
    padding: PropTypes.object,
    maxZoom: PropTypes.number,
    fixedZoom: PropTypes.bool,
    duration: PropTypes.number
};

FitBounds.defaultProps = {
    geometryProjection: 'EPSG:4326',
    padding: { top: 0, right: 0, bottom: 0, left: 0 }
};

export default FitBounds;
