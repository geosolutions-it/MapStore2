import { useRef, useEffect } from "react";
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
            const { top = 0, right = 0, bottom = 0, left = 0 } = padding;
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
        if (zoomTo[mapType]) {
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

export default FitBounds;
