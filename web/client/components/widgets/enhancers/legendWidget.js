/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { compose, withProps } from 'recompose';

import { get } from 'lodash';
import deleteWidget from './deleteWidget';
import { editableWidget, defaultIcons, withHeaderTools } from './tools';
import { getScales } from '../../../utils/MapUtils';

/**
 * map dependencies to layers, scales and current zoom level to show legend items for current zoom.
 * Add also base tools and menu to the widget
 */
export default compose(
    withProps(({ dependencies = {}, dependenciesMap = {} }) => ({
        layers: dependencies[dependenciesMap.layers] || dependencies.layers || [],
        scales: getScales(
            // TODO: this is a fallback that checks the viewport if projection is not defined. We should use only projection
            dependencies.projection || dependencies.viewport && dependencies.viewport.crs || 'EPSG:3857',
            get( dependencies, "mapOptions.view.DPI")
        ),
        currentZoomLvl: dependencies.zoom
    })),
    // filter backgrounds
    withProps(
        ({ layers = [] }) => ({ layers: layers.filter((l = {}) => l.group !== "background" && l.visibility !== false && l.type !== "vector")})
    ),
    deleteWidget,
    editableWidget(),
    defaultIcons(),
    withHeaderTools()
);
