/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const CONTROL_NAME = 'isochrone';
export const DEFAULT_PROVIDER = 'graphhopper';
export const ISOCHRONE_ROUTE_LAYER = 'isochrone-area';

export const DEFAULT_PROVIDER_CONFIG = {
    profile: 'car',
    distanceLimit: 10, // in kms
    reverseFlow: false, // default is "departure"; 'true' is "arrival"
    buckets: 1 // max is 4
};

export const DEFAULT_RAMP = "orrd";
export const DEFAULT_SEARCH_CONFIG = [{type: "nominatim", priority: 5, options: {limit: 10, polygon_geojson: 1, format: 'json'}}];

export const DEFAULT_PROFILE_OPTIONS = [
    { value: 'foot', glyph: 'male' },
    { value: 'car', glyph: 'car' }
];

export const DEFAULT_RANGE_OPTIONS = [
    { value: 'distance', label: 'Distance', glyph: '1-ruler' },
    { value: 'time', label: 'Time', glyph: 'time' }
];

export const DIRECTION_OPTIONS = ['departure', 'arrival'];
export const RANGE = {
    DISTANCE: 'distance',
    TIME: 'time'
};

export const BUCKET_COLORS = ["#c7eac2", "#f8cdf6", "#8d8bc0", "#ffda97"];
export const BUCKET_OUTLINE_COLOR = "#000000";
export const UOM = {
    DISTANCE: 'km',
    TIME: 'min'
};
