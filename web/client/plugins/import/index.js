/**
* Copyright 2016, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import { connect } from 'react-redux';

import { onShapeError } from '../../actions/mapimport';
import { setStyleParameter } from '../../actions/style';
import ShapefileUploadAndStyleComp from '../../components/import/ShapefileUploadAndStyle';
import StylePointComp from '../../components/style/StylePoint';
import StylePolygonComp from '../../components/style/StylePolygon';
import StylePolylineComp from '../../components/style/StylePolyline';

export const ShapeFileUploadAndStyle = connect((state) => (
    {
        uploadOptions: {
            error: state.mapimport && state.mapimport.error || null,
            loading: state.mapimport && state.mapimport.loading || false }
    }
), {
    onShapeError: onShapeError
})(ShapefileUploadAndStyleComp);

export const StylePolygon = connect((state) => (
    {
        shapeStyle: state.style || {}
    }
), {
    setStyleParameter: setStyleParameter
})(StylePolygonComp);

export const StylePoint = connect((state) => (
    {
        shapeStyle: state.style || {}
    }
), {
    setStyleParameter: setStyleParameter
})(StylePointComp);

export const StylePolyline = connect((state) => (
    {
        shapeStyle: state.style || {}
    }
), {
    setStyleParameter: setStyleParameter
})(StylePolylineComp);

export default {
    ShapeFileUploadAndStyle,
    StylePolygon,
    StylePolyline,
    StylePoint
};
