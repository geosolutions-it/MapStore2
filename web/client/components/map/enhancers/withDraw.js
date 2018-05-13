/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const { withPropsOnChange } = require("recompose");

const {connect} = require("react-redux");
const {changeDrawingStatus, endDrawing, setCurrentStyle, geometryChanged, drawStopped} = require('../../../actions/draw');

const defaultDrawConnect = connect((state) =>
state.draw || {}, {
    onChangeDrawingStatus: changeDrawingStatus,
    onEndDrawing: endDrawing,
    onGeometryChanged: geometryChanged,
    onDrawStopped: drawStopped,
    setCurrentStyle: setCurrentStyle
});

module.exports = (connectFunction = defaultDrawConnect) => withPropsOnChange(
    ['plugins'],
    ({plugins}= {}) => {
        const {DrawSupport, tools = {}, ...rest} = plugins;
        if (!DrawSupport) {
            return {};
        }
        const Draw = connectFunction(DrawSupport);
        return {plugins: {...rest, tools: {...tools, draw: Draw}}};
    }
);
