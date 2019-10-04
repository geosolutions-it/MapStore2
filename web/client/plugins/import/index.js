/**
* Copyright 2016, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
const {connect} = require('react-redux');

const {onShapeError} = require('../../actions/mapimport');
const {setStyleParameter} = require('../../actions/style');

const ShapeFileUploadAndStyle = connect((state) => (
    {
        uploadOptions: {
            error: state.mapimport && state.mapimport.error || null,
            loading: state.mapimport && state.mapimport.loading || false }
    }
), {
    onShapeError: onShapeError
})(require('../../components/import/ShapefileUploadAndStyle'));

const StylePolygon = connect((state) => (
    {
        shapeStyle: state.style || {}
    }
), {
    setStyleParameter: setStyleParameter
})(require('../../components/style/StylePolygon'));

const StylePoint = connect((state) => (
    {
        shapeStyle: state.style || {}
    }
), {
    setStyleParameter: setStyleParameter
})(require('../../components/style/StylePoint'));

const StylePolyline = connect((state) => (
    {
        shapeStyle: state.style || {}
    }
), {
    setStyleParameter: setStyleParameter
})(require('../../components/style/StylePolyline'));

module.exports = {
    ShapeFileUploadAndStyle,
    StylePolygon,
    StylePolyline,
    StylePoint
};
