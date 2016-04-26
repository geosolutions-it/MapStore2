/**
* Copyright 2016, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
const {connect} = require('react-redux');

const {onShapeError} = require('../../actions/shapefile');

const SelectShape = connect((state) => (
        {
            error: state.shapefile && state.shapefile.error || null,
            loading: state.shapefile && state.shapefile.loading || false }
        ), {
    onShapeError: onShapeError
})(require('../../components/shapefile/SelectShape'));
module.exports = {
    SelectShape
};
