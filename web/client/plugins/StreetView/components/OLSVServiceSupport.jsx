
import {useState, useEffect} from 'react';
import { getAPI } from '../api/gMaps';

import { reproject } from '../../../utils/CoordinatesUtils';
import { googleToMapStoreLocation } from '../googleMapsUtils';


/**
 * Openlayers support implementation for panorama.
 * Intercepts map clicks to
 */
export default function OLPanoramaSupport({map, enabled, setLocation = () => {} }) {
    const [clickHandle, setClickHandle] = useState();
    useEffect(() => {
        if (map && enabled && !clickHandle) {
            const callback = (event) => {
                const coordinate = event.coordinate;
                const source = map.getView().getProjection().getCode();
                // NOTE: if extension, proj4 definitions must be loaded in local proj4 instance. (see urbanisme extension)
                const {x: lng, y: lat} = reproject({x: coordinate[0], y: coordinate[1]}, source, "EPSG:4326");
                const latLng = {lat, lng};
                const google = getAPI();
                const sv = new google.maps.StreetViewService();
                sv.getPanorama({ location: latLng, radius: 50 }).then(({data} = {}) => {
                    const {location} = data ?? {};
                    setLocation(googleToMapStoreLocation(location));

                });
            };
            setClickHandle(map.on('singleclick', callback, map));
        }
        return () => {
            if (clickHandle) {
                map.un('singleclick', clickHandle);
            }
        };

    }, [enabled]);
    return null;
}
