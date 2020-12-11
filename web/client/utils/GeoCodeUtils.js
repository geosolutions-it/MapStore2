/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


// nominatim is south lat, north lat, west lon, east  lon
// bbox is      west  lon, south lat, east lon, north lat
// so:          0 --> 1,  1 --> 3.  2 --> 0,  3 --> 2
export const nominiatimIndexToBboxIndex = (index) => {
    switch (index) {
    case 0:
        return 1;
    case 1:
        return 3;
    case 2:
        return 0;
    case 3:
        return 2;
    default:
        return -1;
    }
};
/**
 * @return a filtered version of INFO_FORMATS object.
 * the returned object contains only keys that AVAILABLE_FORMAT contains.
 */
export const nominatimToGeoJson = (searchResults) => {
    if (searchResults === null) {
        return [];
    }
    return searchResults.map((result)=> {
        return {
            properties: {...result},
            id: result.osm_id,
            type: "Feature",
            bbox: result.boundingbox.map( (elem) => {return parseFloat(elem); }).reduce( (acc, currentValue, currentIndex) => {
                acc[nominiatimIndexToBboxIndex(currentIndex)] = currentValue;
                return acc;
            }, []),
            geometry: result.geojson || {
                type: 'Point',
                coordinates: [parseFloat(result.lon), parseFloat(result.lat)]
            }
        };
    });
}; // see http://wiki.openstreetmap.org/wiki/Bounding_Box

export const nominatimToLayer = (name, searchResults) => {
    return {
        type: 'vector',
        visibility: true,
        name: name || "Search Results",
        styleName: "marker",
        features: nominatimToGeoJson(searchResults)

    };
};
