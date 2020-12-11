/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {withProps} from 'recompose';

/**
 * Add widget tools (menu items) needed to export widgets. @see withMenu
 */
export default () =>
    withProps(({ widgetTools = [], data, title, exportCSV = () => { } }) => ({
        widgetTools: [
            ...widgetTools,
            {
                glyph: "download",
                glyphClassName: "exportCSV",
                target: "menu",
                textId: "widgets.widget.menu.downloadData",
                disabled: !data || !data.length,
                onClick: () => exportCSV({ data, title })
            }/* TODO: support for plotlyJS {
                glyph: "download",
                target: "menu",
                glyphClassName: "exportImage",
                textId: "widgets.widget.menu.exportImage",
                disabled: !data || !data.length,
                // NOTE: the widget widget-chart-${id} must be the id of the div to export as image
                onClick: () => exportImage({ widgetDivId: `widget-chart-${id}`, title })
            }*/
        ]
    }));
