/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { withProps, compose } from 'recompose';

import withMapConnect from './withMapConnect';

const isTargetForOtherWidgets = (allDependenciesMap, widgetType, editorData) => widgetType === "table" && allDependenciesMap.filter(depMap => Object.keys(depMap).filter(d => depMap[d] && depMap[d].indexOf(editorData.id) !== -1).length > 0 ).length === 0;

/**
 * Viewport connection configuration support (for widget builders of charts, table, counter)
 *
 */
export default compose(
    withProps(({ editorData = {}, widgets = [] }) => {
        const allDependenciesMap = widgets.filter(({mapSync, dependenciesMap}) => mapSync && dependenciesMap).map(({dependenciesMap}) => dependenciesMap);
        return {
            canConnect: editorData.geomProp && editorData.widgetType !== "table" || isTargetForOtherWidgets(allDependenciesMap, editorData.widgetType, editorData),
            connected: editorData.mapSync
        };
    }),
    withMapConnect({
        viewport: "viewport",
        layers: "layers",
        filter: "filter",
        quickFilters: "quickFilters",
        layer: "layer",
        options: "options",
        mapSync: "mapSync",
        dependenciesMap: "dependenciesMap"
    })
);
