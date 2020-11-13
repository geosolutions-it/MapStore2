/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import {
    ChartWidget,
    CounterWidget,
    MapWidget,
    TableWidget,
    TextWidget,
    LegendWidget
} from './enhancedWidgets';

/**
 * Renders proper widget by widgetType, binding props and methods
 */
const DefaultWidget = ({
    dependencies,
    toggleCollapse = () => {},
    exportCSV = () => {},
    exportImage = () => {},
    onDelete = () => {},
    onEdit = () => {},
    ...w
} = {}) => w.widgetType === "text"
    ? (<TextWidget {...w}
        toggleCollapse={toggleCollapse}
        onDelete={onDelete}
        onEdit={onEdit}/>)
    : w.widgetType === "table"
        ? <TableWidget {...w}
            toggleCollapse={toggleCollapse}
            exportCSV={exportCSV}
            dependencies={dependencies}
            onDelete={onDelete}
            onEdit={onEdit}
        />
        : w.widgetType === "counter"
            ? <CounterWidget {...w}
                toggleCollapse={toggleCollapse}
                dependencies={dependencies}
                onDelete={onDelete}
                onEdit={onEdit} />
            : w.widgetType === "map"
                ? <MapWidget {...w}
                    toggleCollapse={toggleCollapse}
                    dependencies={dependencies}
                    onDelete={onDelete}
                    onEdit={onEdit} />
                : w.widgetType === "legend"
                    ? <LegendWidget {...w}
                        toggleCollapse={toggleCollapse}
                        dependencies={dependencies}
                        onDelete={onDelete}
                        onEdit={onEdit} />
                    : (<ChartWidget {...w}
                        toggleCollapse={toggleCollapse}
                        exportCSV={exportCSV}
                        dependencies={dependencies}
                        exportImage={exportImage}
                        onDelete={onDelete}
                        onEdit={onEdit} />);
export default DefaultWidget;
