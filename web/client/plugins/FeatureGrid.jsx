/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {connect} = require('react-redux');
const {updateHighlighted} = require('../actions/highlight');
const {query} = require('../actions/wfsquery');

module.exports = {
    FeatureGridPlugin: connect((state) => ({
        features: state.query && state.query.result && state.query.result.features,
        filterObj: state.query && state.query.filterObj,
        searchUrl: state.query && state.query.searchUrl,
        pagination: true,
        initWidth: "100%",
        columnsDef: state.query && state.query.typeName && state.query.featureTypes
            && state.query.featureTypes[state.query.typeName]
            && state.query.featureTypes[state.query.typeName]
            && state.query.featureTypes[state.query.typeName].attributes
            && state.query.featureTypes[state.query.typeName].attributes.filter(attr => attr.name !== "geometry")
            .map((attr) => ({
                headerName: attr.label,
                field: attr.attribute
            })),
        query: state.query && state.query.queryObj,
        totalFeatures: state.query && state.query.result && state.query.result.totalFeatures
    }),
    {
        selectFeatures: updateHighlighted,
        onQuery: query
    })(require('../components/data/featuregrid/DockedFeatureGrid'))
};
