/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {compose, withProps} from 'recompose';
/**
 * Support widget locking. When locked, a widget becomes "static".
 */
export default () =>
    compose(
        withProps(({maximized = {}, widgetTools = [], toolsOptions = {}, updateProperty = () => { }, dataGrid = {}}) => ({
            widgetTools: !!toolsOptions.showPin ? [
                ...widgetTools,
                {
                    glyph: "pushpin",
                    bsStyle: dataGrid.static && "primary",
                    glyphClassName: dataGrid.static ? "active" : undefined,
                    tooltipId: dataGrid.static ? "widgets.widget.menu.unpin" : "widgets.widget.menu.pin",
                    target: 'icons',
                    visible: !maximized.widget,
                    onClick: () => updateProperty("dataGrid.static", !dataGrid.static)
                }] : widgetTools
        }))
    );
