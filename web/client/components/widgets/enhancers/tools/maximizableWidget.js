/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { compose, withProps } from 'recompose';

const maximizableWidget = compose(
    withProps(({maximized = {}, widgetTools = [], toggleMaximize = () => {}, dataGrid = {}, toolsOptions = {}}) => ({
        widgetTools: !!toolsOptions.showMaximize ? [
            ...widgetTools,
            {
                glyph: maximized.widget ? 'resize-small' : 'resize-full',
                target: 'icons',
                tooltipId: `widgets.widget.menu.${maximized.widget ? 'minimize' : 'maximize'}`,
                tooltipPosition: 'right',
                visible: !dataGrid.static,
                onClick: () => toggleMaximize()
            }
        ] : widgetTools
    }))
);

export default () => maximizableWidget;
