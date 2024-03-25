import {STREET_VIEW_DATA_LAYER_ID} from '../constants';

/**
 * Load the Mapillary API
 */
export const loadAPI = () => (new Promise((r) => r()));
// export const loadAPI = () => import('mapillary-js').then((module) =>  module.Viewer);

export const getAPI = () => {};
/**
 *
 * @param {object} point click point event. In case of Mapillary, it contains the intersectedFeatures from the Mapillary layer.
 * @returns {Promise<{properties: object, latLng: {lat: number, lng: number, h: number}}>} the location object with the properties and the latLng {lat, lng, h}.
 * If the location is not found, it returns a rejected promise with the code "ZERO_RESULTS".
 */
export const getLocation = (point) => {
    return new Promise((resolve, reject) => {
        // extract intersectedFeatures from point
        const {intersectedFeatures = []} = point;
        // extract the first intersectedFeature that match the layer
        const mapillaryFeatures = intersectedFeatures.find(({id}) => id === STREET_VIEW_DATA_LAYER_ID)?.features ?? [];
        if (!mapillaryFeatures.length) {
            reject({
                code: "ZERO_RESULTS"
            });
        }
        // convert from GeoJSON Point geometry and transform in latLng
        let location = {};
        if (mapillaryFeatures[0]?.geometry) {
            const {
                geometry: {coordinates: [lng, lat, h = 0]} = {}
            } = mapillaryFeatures[0] ?? {};
            location = {
                latLng: {
                    lat,
                    lng,
                    h
                }
            };
        } else {
            location = point?.latlng ? { latLng: {...point?.latlng} } : {};
        }
        location.properties = mapillaryFeatures[0]?.properties || {};
        resolve(location);
    });
};

