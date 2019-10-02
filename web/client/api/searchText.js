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

const defaultFromTextToFilter = ({searchText, staticFilter, blacklist, item, queriableAttributes, predicate} ) => {
    // split into words and remove blacklisted words
    const staticFilterParsed = generateTemplateString(staticFilter || "")(item);
    let searchWords = searchText.split(" ").filter(w => w).filter( w => blacklist.indexOf(w.toLowerCase()) < 0 );

    // if the array searchWords is empty, then use the full searchText
    if (searchWords.length === 0 ) {
        searchWords = !!searchText ? [searchText] : [];
    }
    let filter;
    if (searchWords.length > 0 ) {
        filter = "(".concat( searchWords.map( (w) => queriableAttributes.map( attr => `${attr} ${predicate} '%${w.replace("'", "''")}%'`).join(" OR ")).join(') AND (')).concat(")");
    }

    filter = filter ? filter.concat(staticFilterParsed) : staticFilterParsed || null;
    return filter;
};
/*
 * The API returns a promise for each search service.
 * These search services have a particular option that specify how the response is returned.
 * 'returnFullData' is a boolean option that if true a the full data is returned, otherwise an array o fearures.
*/
let Services = {
    nominatim: (searchText, options = {
        returnFullData: false
    }) =>
        require('./Nominatim')
            .geocode(searchText, options)
            .then( res => {return options.returnFullData ? res : GeoCodeUtils.nominatimToGeoJson(res.data); }),
    wfs: (searchText, {url, typeName, queriableAttributes = [], outputFormat = "application/json", predicate = "ILIKE", staticFilter = "", blacklist = [], item, fromTextToFilter = defaultFromTextToFilter, returnFullData = false, ...params }) => {
        const filter = fromTextToFilter({searchText, staticFilter, blacklist, item, queriableAttributes, predicate});
        return WFS
            .getFeatureSimple(url, assign({
                maxFeatures: 10,
                typeName,
                outputFormat,
                // create a filter like : `(ATTR ilike '%word1%') AND (ATTR ilike '%word2%')`
                cql_filter: filter
            }, params))
            .then( response => {return returnFullData ? response : response.features; } );
    }
};

const Utils = {
    setService: (type, fun) => {
        Services[type] = fun;
    },
    getService: (type) => {
        return !!Services[type] ? Services[type] : null;
    }
};

module.exports = {API: {Services, Utils}};
