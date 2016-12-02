/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {connect} = require('react-redux');

module.exports = {
    FeatureGridPlugin: connect((state) => ({
        features: state.query && state.query.result && state.query.result.features,
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
        totalFeatures: state.query && state.query.result && state.query.result.totalFeatures
    }))(require('../components/data/featuregrid/DockedFeatureGrid'))
};
