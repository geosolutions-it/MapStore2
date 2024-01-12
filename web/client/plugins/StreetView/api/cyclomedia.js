import {STREET_VIEW_DATA_LAYER_ID} from '../constants';

/**
 * Load the Cyclomedia API (does nothing for now)
 * NOTE: The current implementation loads the API in an iframe in the CyclomediaViewer component, so this is only a fake API loader.
 * The API has been published on NPM (on Dec 2023), so we can load it dynamically in the future.
 * Now it's not possible because of conflicts with the `react-dnd` library.
 */
export const loadAPI = () => (new Promise((r) => r()));
// https://streetsmart.cyclomedia.com/api/v23.14/documentation/
// export const loadAPI = () => import('@cyclomedia/streetsmart-api').then((module) =>  module.default);
/**
 * Get the Cyclomedia API instance (because the API is loaded in an iframe and fully handled in it, here it is not needed)
 */
export const getAPI = () => {};
/**
 *
 * @param {object} point click point event. In case of Cyclomedia, it contains the intersectedFeatures from the Cyclomedia layer.
 * @returns {Promise<{properties: object, latLng: {lat: number, lng: number, h: number}}>} the location object with the properties and the latLng {lat, lng, h}.
 * If the location is not found, it returns a rejected promise with the code "ZERO_RESULTS".
 */
export const getLocation = (point) => {
    return new Promise((resolve, reject) => {
        // extract intersectedFeatures from point
        const {intersectedFeatures = []} = point;
        // extract the first intersectedFeature that match the layer
        const cyclomediaFeatures = intersectedFeatures.find(({id}) => id === STREET_VIEW_DATA_LAYER_ID)?.features ?? [];
        if (!cyclomediaFeatures.length) {
            reject({
                code: "ZERO_RESULTS"
            });
        }
        // convert from GeoJSON Point geometry and transform in latLng
        const {properties,
            geometry: {coordinates: [lng, lat, h = 0]
            } = {}} = cyclomediaFeatures[0] ?? {};
        resolve({
            properties,
            latLng: {
                lat,
                lng,
                h
            }
        });
    });
};

