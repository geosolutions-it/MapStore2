/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const { compose } = require('recompose');

// enhancers for base menus and functionalities
const chartWidget = require('../enhancers/chartWidget');
const counterWidget = require('../enhancers/counterWidget');
const tableWidget = require('../enhancers/tableWidget');
const legendWidget = require('../enhancers/legendWidget');
const textWidget = require('../enhancers/textWidget');
const mapWidget = require('../enhancers/mapWidget');

// Enhancers for ajax support
const wpsChart = require('../enhancers/wpsChart');
const wpsCounter = require('../enhancers/wpsCounter');
const wfsTable = require('../enhancers/wfsTable');


// enhancers for dependencies management
const dependenciesToFilter = require('../enhancers/dependenciesToFilter');
const dependenciesToOptions = require('../enhancers/dependenciesToOptions');
const dependenciesToWidget = require('../enhancers/dependenciesToWidget');
const dependenciesToExtent = require('../enhancers/dependenciesToExtent');
const dependenciesToLayers = require('../enhancers/dependenciesToLayers');
const dependenciesToMapProp = require('../enhancers/dependenciesToMapProp');
//
// connect widgets to dependencies, remote services and add base icons/tools
//
const ChartWidget = compose(
    dependenciesToWidget,
    dependenciesToFilter,
    dependenciesToOptions,
    wpsChart,
    chartWidget
)(require('./ChartWidget'));

const TextWidget = compose(
    textWidget
)(require('./TextWidget'));

const MapWidget = compose(
    dependenciesToWidget,
    dependenciesToLayers,
    dependenciesToMapProp('center'),
    dependenciesToMapProp('zoom'),
    dependenciesToExtent,
    mapWidget
)(require('./MapWidget'));

const TableWidget = compose(
    dependenciesToWidget,
    dependenciesToOptions,
    dependenciesToFilter,
    wfsTable,
    tableWidget,
)(require('./TableWidget'));

const CounterWidget = compose(
    dependenciesToWidget,
    dependenciesToFilter,
    dependenciesToOptions,
    wpsCounter,
    counterWidget
)(require("./CounterWidget"));

const LegendWidget = compose(
    dependenciesToWidget,
    legendWidget
)(require("./LegendWidget"));

/**
 * Renders proper widget by widgetType, binding props and methods
 */
module.exports = ({
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
