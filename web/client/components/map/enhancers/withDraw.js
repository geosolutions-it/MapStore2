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
/**
 * Add the draw tool to base-map. The draw support is already present in plugins but It needs
 * to be connected and added to tools to work.
 * It's possible to pass a connect function to override default connection to state and action
 * @param {function} connectFunction connect function to override default connection of the draw tool.
 */
module.exports = (connectFunction = defaultDrawConnect) => withPropsOnChange(
    ['plugins'],
    ({plugins} = {}) => {
        const {DrawSupport, tools = {}, ...rest} = plugins;
        if (!DrawSupport) {
            return {};
        }
        const Draw = connectFunction(DrawSupport);
        return {plugins: {...rest, tools: {...tools, draw: Draw}}};
    }
);
