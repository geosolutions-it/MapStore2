/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const WFS = require('./WFS');
const assign = require('object-assign');
const GeoCodeUtils = require('../utils/GeoCodeUtils');
const {generateTemplateString} = require('../utils/TemplateUtils');
/*
const toNominatim = (fc) =>
    fc.features && fc.features.map( (f) => ({
        boundingbox: f.properties.bbox,
        lat: 1,
        lon: 1,
        display_name: `${f.properties.STATE_NAME} (${f.properties.STATE_ABBR})`

    }));
*/

module.exports = {
    nominatim: (searchText, options = {}) =>
        require('./Nominatim')
        .geocode(searchText, options)
        .then( res => GeoCodeUtils.nominatimToGeoJson(res.data)),
    wfs: (searchText, {url, typeName, queriableAttributes, outputFormat="application/json", predicate ="ILIKE", staticFilter="", blacklist = [], item, ...params }) => {
        // split into words and remove blacklisted words
        const staticFilterParsed = generateTemplateString(staticFilter || "")(item);
        let searchWords = searchText.split(" ").filter(w => w).filter( w => blacklist.indexOf(w.toLowerCase()) < 0 );

        // if the searchtext is empty use the full searchText
        if (searchWords.length === 0 ) {
            searchWords = [searchText];
        }
        return WFS
            .getFeatureSimple(url, assign({
                    maxFeatures: 10,
                    startIndex: 0,
                    typeName,
                    outputFormat,
                    // create a filter like : `(ATTR ilike  '%word1%') AND (ATTR ilike '%word2%')`
                    cql_filter: "(".concat( searchWords.map( (w) => queriableAttributes.map( attr => `${attr} ${predicate} '%${w.replace("'", "''")}%'`).join(" OR ")).join(') AND (')).concat(")") .concat(staticFilterParsed)
                }, params))
            .then( response => response.features );
    }
};
