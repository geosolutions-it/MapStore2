import axios from 'axios';
import {PANORAMAX_DEFAULT_API_URL} from '../constants';

const DEFAULT_SRS = 'EPSG:4326';

/**
 * Load the panoramax API. Does nothing for now but written to respect the same interface as the others plugins.
 * If would be helpful to load the panoramax library but we loaded it dynamcally via npm package
 * @returns {Promise<void>}
 */
export const loadAPI = () => Promise.resolve();

/**
 * Get the panoramax API
 */
export const getAPI = () => {};

/**
 * Compute the bbox around the clicked point
 * @param lat latitude
 * @param lng longitude
 * @returns {`${number},${number},${number},${number}`}
 */
const getBbox = (lat, lng) => {
    // We reduce the search perimeter to a bbox of 20 meters around the clicked point
    // We assume the geometry coordinates are in EPSG:4326 projection as expected by default by panoramax
    const rayonMetres = 10; // 10m on each side = 20m wide

    // Latitude conversion factor
    const metresParDegreLat = 111320;

    // 1. Calculation of Delta Lat (constant)
    const deltaLat = rayonMetres / metresParDegreLat;

    // 2. Calculation of Delta Lng (variable depending on latitude)
    const cosLat = Math.cos(lat * Math.PI / 180); // Convertir lat en radians
    const deltaLng = rayonMetres / (metresParDegreLat * cosLat);

    // Bbox construction
    return `${lng - deltaLng},${lat - deltaLat},${lng + deltaLng},${lat + deltaLat}`;
};

/**
 * Search the feature properties at the clicked point
 * @param point The coordinates of the clicked point
 * @param providerSettings  The provider settings
 * @returns {Promise<unknown>}
 */
export const getLocation = (point, providerSettings = {}) => {
    return new Promise((resolve, reject) => {
        if (point?.intersectedFeatures?.length) {

            // We are interested only in picture features (with id and sequence_id)
            // At a certain zoom level (when the points are not displayed on the map but the lines) we encounter more sequence features instead of picture features
            const feature = point.intersectedFeatures[0].features.find(ft => ft.properties.first_sequence && ft.properties.id);
            if (feature) {
                resolve({
                    latLng: { lat: point.latlng.lat, lng: point.latlng.lng, h: 0 },
                    // sequence_id and id will be passed to the panoramax viewer to get the corresponding picture
                    properties: {id: feature.properties.id, sequence_id: feature.properties.first_sequence}
                });
                return;
            }
        }

        if (point) {
            // In case where no picture feature is found
            // We directly ask the API to get one feature near that point
            // Panoramax config params
            const apiUrl = providerSettings.PanoramaxApiURL || PANORAMAX_DEFAULT_API_URL;

            // Clic coordinates
            const { lat, lng } = point.latlng;

            // TODO Implements transformation to the specified srs (can be get from the providerSettings),
            //  Now panoramax API only uses EPSG:4326 as coordinates projection

            // We calculate the bbox by constructing a rectangle with a radius of 10 m around the clicked point.
            const bbox = getBbox(lat, lng);

            // The features will be filtered by their proximity to the clic position on for those located at a distance of 0 to 10m.
            // By passing a bbox, the features are sorted by their proximity to the center of the bbox
            // The param limit=1 is set to return only the closest feature to the center of the bbox
            axios.get(`${apiUrl}/search`, {
                params: {
                    bbox: bbox,
                    limit: 1
                }
            }).then(response => {
                // For now, the response features are of type Point only, so we assume that we receive points features as responses
                const features = response.data?.features;
                if (features && features.length > 0) {
                    const feature = features[0];
                    const [fLng, fLat] = feature.geometry.coordinates;
                    resolve({
                        latLng: { lat: fLat, lng: fLng, h: 0 },
                        // sequence_id and id will be passed to the panoramax viewer to get the corresponding picture
                        properties: {id: feature.id, sequence_id: feature.collection}
                    });
                } else {
                    reject({ code: "ZERO_RESULTS" });
                }
            }).catch(e => {
                console.error(e);
                reject({ code: "ZERO_RESULTS" });
            });
            return;
        }

        reject({ code: "ZERO_RESULTS" });
    });
};
