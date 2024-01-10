import {STREET_VIEW_DATA_LAYER_ID} from '../constants';

let API;
// https://streetsmart.cyclomedia.com/api/v23.14/documentation/
export const loadAPI = () => import('@cyclomedia/streetsmart-api').then((module) => {
    API = module.default;
    // const encodedCredentials = btoa(`${username}:${password}`);
    // setCredentials(CYCLOMEDIA_CREDENTIALS_REFERENCE, {username, password});
    return API;
});
export const getAPI = () => API;
export const getLocation = (point) => {
    return new Promise((resolve, reject) => {
        // extract intersectedFeatures from point
        const {intersectedFeatures = []} = point;
        // extract the first intersectedFeature that match the layer
        const cyclomediaFeatures = intersectedFeatures.find(({id}) => id === STREET_VIEW_DATA_LAYER_ID)?.features ?? [];
        if (!cyclomediaFeatures.length) {
            reject({
                code: "ZERO_RESULTS"
            }); // TODO: handle this case
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

