/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {compose, withProps} from 'recompose';

/**
 * Support widget collapse function, adding the collapse button to the tools. @see withIcons
 */
export default () =>
    compose(
        withProps(({maximized = {}, widgetTools = [], dataGrid = {}, toggleCollapse = () => {}, toolsOptions = {}}) => ({
            widgetTools: !!toolsOptions.showCollapse ? [
                ...widgetTools,
                {
                    glyph: "minus",
                    target: "icons",
                    tooltipId: "widgets.widget.menu.collapse",
                    // pinned can not be collapsed, hidden can not be collapsed because they do not appear in the tray
                    visible: !maximized.widget && !dataGrid.static,
                    onClick: () => toggleCollapse()
                }
            ] : widgetTools
        }))
    );
