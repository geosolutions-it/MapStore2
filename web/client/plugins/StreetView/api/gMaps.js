import { Loader } from '@googlemaps/js-api-loader';
import { googleToMapStoreLocation } from '../googleMapsUtils';

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
export function getLocation(latLng) {
    const google = getAPI();
    const sv = new google.maps.StreetViewService();
    return sv.getPanorama({ location: latLng, radius: 50 }).then(({data} = {}) => {
        const {location} = data ?? {};
        return googleToMapStoreLocation(location);

    });
}

