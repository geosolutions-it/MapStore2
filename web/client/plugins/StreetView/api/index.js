import * as google from '../api/google';
import * as cyclomedia from '../api/cyclomedia';

/**
 * Street view APIs
 * @prop google google street view API
 * @prop cyclomedia cyclomedia street view API
 * Each API has the following methods:
 * - `getAPI()` // returns the API object (specific to the provider)
 * - `loadAPI(apiKey)` // loads the API and returns a promise that resolves when the API is loaded. Takes (optional) apiKey as argument
 * - `getLocation(point)` // returns a promise that resolves to a location object. The `point` is the click point event (the point contains the `intersectedFeatures`, `latlng`...)
 *    resolved object **must** have the following properties (the other properties are optional and depend on the provider):
 * - `latLng`: the latLng of the location (note: different case of `latlng` in `point` argument of `getLocation` from returned object `latLng`)
 *   rejected object is an error object with the following properties:
 *     - `code`: the error code (string) (optional). The error code can be one of the following:
 *       - `ZERO_RESULTS`: no data found for the location
 */
export default {
    google,
    cyclomedia
};
