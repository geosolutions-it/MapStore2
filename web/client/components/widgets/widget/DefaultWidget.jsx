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

const getWidgetOpts = (w) => w?.widgetOpts?.[w.widgetType];

/**
 * Renders proper widget by widgetType, binding props and methods
 */
const DefaultWidget = ({
    items,
    dependencies,
    toggleCollapse = () => {},
    exportCSV = () => {},
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
            {...getWidgetOpts(w)}
            toggleCollapse={toggleCollapse}
            exportCSV={exportCSV}
            dependencies={dependencies}
            onDelete={onDelete}
            onEdit={onEdit}
            items={items}
        />
        : w.widgetType === "counter"
            ? <CounterWidget {...w}
                {...getWidgetOpts(w)}
                toggleCollapse={toggleCollapse}
                dependencies={dependencies}
                onDelete={onDelete}
                onEdit={onEdit} />
            : w.widgetType === "map"
                ? <MapWidget {...w}
                    {...getWidgetOpts(w)}
                    toggleCollapse={toggleCollapse}
                    dependencies={dependencies}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    items={items} />
                : w.widgetType === "legend"
                    ? <LegendWidget {...w}
                        {...getWidgetOpts(w)}
                        toggleCollapse={toggleCollapse}
                        dependencies={dependencies}
                        onDelete={onDelete}
                        onEdit={onEdit} />
                    : (<ChartWidget {...w}
                        {...getWidgetOpts(w)}
                        toggleCollapse={toggleCollapse}
                        exportCSV={exportCSV}
                        dependencies={dependencies}
                        onDelete={onDelete}
                        onEdit={onEdit} />);
export default DefaultWidget;
