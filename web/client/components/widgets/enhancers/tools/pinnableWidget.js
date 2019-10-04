/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {compose, withProps} = require('recompose');

/**
 * Support widget locking. When locked, a widget becomes "static".
 */
module.exports = () =>
    compose(
        withProps(({ widgetTools = [], toolsOptions = {}, updateProperty = () => { }, dataGrid = {}}) => ({
            widgetTools: !!toolsOptions.showPin ? [
                ...widgetTools,
                {
                    glyph: "pushpin",
                    bsStyle: dataGrid.static && "primary",
                    glyphClassName: dataGrid.static ? "active" : undefined,
                    tooltipId: dataGrid.static ? "widgets.widget.menu.unpin" : "widgets.widget.menu.pin",
                    target: 'icons',
                    onClick: () => updateProperty("dataGrid.static", !dataGrid.static)
                }] : widgetTools
        }))
    );
