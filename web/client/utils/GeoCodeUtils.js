/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var GeoCodeUtils = {
    /**
     * @return a filtered version of INFO_FORMATS object.
     * the returned object contains only keys that AVAILABLE_FORMAT contains.
     */
    nominatimToGeoJson(searchResults) {
        if (searchResults === null) {
            return [];
        }
        return searchResults.map((result)=> {
            return {
                properties: {result},
                id: result.osm_id,
                type: "Feature",
                geometry: {
                    type: 'Point',
                    coordinates: [parseFloat(result.lon), parseFloat(result.lat)]
                }
            };
        });
    },
    nominatimToLayer(name, searchResults) {
        return {
            type: 'vector',
            visibility: true,
            name: name || "Search Results",
            styleName: "marker",
            features: GeoCodeUtils.nominatimToGeoJson(searchResults)

        };
    }
};

module.exports = GeoCodeUtils;
