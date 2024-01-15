import { Loader } from '@googlemaps/js-api-loader';
import { googleToMapStoreLocation } from '../utils/google';

let API;
export const loadGoogleMapsAPI  = ({apiKey, version = "weekly", useStaticCache = true, ...options} = {}) => {
    const cachedValue = useStaticCache ? API : undefined;
    if (!cachedValue) {
        const loader = new Loader({
            apiKey,
            version,
            ...options
        });
        return loader.load().then((google) => {
            API = google;
            return google;
        });
    }
    return new Promise((resolve) => resolve(API));
};
export function getAPI() {
    return API;
}
export const loadAPI = loadGoogleMapsAPI;
/**
 *
 * @param {point} Click point event (the point contains the `intersectedFeatures`, `latlng`... (note: different case of `latlng` from returned object `latLng`))
 * @returns {Promise} a promise that resolves to a location object with the following properties:
 * - `pano`: the pano id
 * - `shortDescription`: a short description of the location
 * - `description`: a description of the location
 * - `latLng`: the latitude and longitude of the location
 * - `properties`: additional properties of the location
 */
export function getLocation({latlng}) {
    const google = getAPI();
    const sv = new google.maps.StreetViewService();
    return sv.getPanorama({ location: latlng, radius: 50 }).then(({data} = {}) => {
        const {location} = data ?? {};
        return googleToMapStoreLocation(location);

    });
}

