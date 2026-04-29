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
    LegendWidget,
    FilterWidget
} from './enhancedWidgets';
import CustomWidgetFrame from './CustomWidgetFrame';

const getWidgetOpts = (w) => w?.widgetOpts?.[w.widgetType];

/**
 * Renders proper widget by widgetType, binding props and methods
 */
const DefaultWidget = ({
    items,
    dependencies,
    customWidgets = [],
    toggleCollapse = () => {},
    exportCSV = () => {},
    onDelete = () => {},
    onEdit = () => {},
    ...w
} = {}) => {
    const customItem = customWidgets.find(({ type }) => type === w.type);
    const { Component } = customItem || {};
    if (w.widgetType === "custom" && Component) {
        return (
            <CustomWidgetFrame
                Component={Component}
                {...w}
                {...getWidgetOpts(w)}
                items={items}
                toggleCollapse={toggleCollapse}
            />
        );
    }
    switch (w.widgetType) {
    case "text":
        return (
            <TextWidget
                {...w}
                toggleCollapse={toggleCollapse}
                onDelete={onDelete}
                onEdit={onEdit}
            />
        );
    case "table":
        return (
            <TableWidget
                {...w}
                {...getWidgetOpts(w)}
                toggleCollapse={toggleCollapse}
                exportCSV={exportCSV}
                dependencies={dependencies}
                onDelete={onDelete}
                onEdit={onEdit}
                items={items}
            />
        );
    case "counter":
        return (
            <CounterWidget
                {...w}
                {...getWidgetOpts(w)}
                toggleCollapse={toggleCollapse}
                dependencies={dependencies}
                onDelete={onDelete}
                onEdit={onEdit}
            />
        );
    case "map":
        return (
            <MapWidget
                {...w}
                {...getWidgetOpts(w)}
                toggleCollapse={toggleCollapse}
                dependencies={dependencies}
                onDelete={onDelete}
                onEdit={onEdit}
                items={items}
            />
        );
    case "legend":
        return (
            <LegendWidget
                {...w}
                {...getWidgetOpts(w)}
                toggleCollapse={toggleCollapse}
                dependencies={dependencies}
                onDelete={onDelete}
                onEdit={onEdit}
            />
        );
    case "filter":
        return (
            <FilterWidget
                {...w}
                {...getWidgetOpts(w)}
                interactions={w.interactions}
                toggleCollapse={toggleCollapse}
                dependencies={dependencies}
                onDelete={onDelete}
                onEdit={onEdit}
            />
        );
    default:
        return (
            <ChartWidget
                {...w}
                {...getWidgetOpts(w)}
                toggleCollapse={toggleCollapse}
                exportCSV={exportCSV}
                dependencies={dependencies}
                onDelete={onDelete}
                onEdit={onEdit}
            />
        );
    }
};
export default DefaultWidget;
