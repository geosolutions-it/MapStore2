import * as google from '../api/google';
import * as cyclomedia from '../api/cyclomedia';
import * as mapillary from '../api/mapillary';

/**
 * Street view APIs
 * @prop google google street view API
 * @prop cyclomedia cyclomedia street view API
 * @prop mapillary mapillary street view API
 * Each API has the following methods:
 * - `getAPI()`: returns the API object (specific to the provider)
 * - `loadAPI(apiKey)`: loads the API and returns a `Promise` that resolves when the API is loaded. Takes an `apiKey` as argument (depending on the provider)
 * - `getLocation(point)`: returns a `Promise` that resolves to a location object. The `point` is the click point event
 *   (the `point` contains the `intersectedFeatures`, `latlng`...).
 *   The object resolved by the `Promise` returned **must** have the following properties (other properties are provider specific):
 *   - `latLng`: the latLng of the location (**note**: different case of `latlng` in `point` argument of `getLocation` from returned object `latLng`)
 *     In case of errors the rejected object is an error object with the following properties:
 *     - `code`: the error code (string) (optional). The error code can be one of the following:
 *       - `ZERO_RESULTS`: no data found for the location
 */
export default {
    google,
    cyclomedia,
    mapillary
};
