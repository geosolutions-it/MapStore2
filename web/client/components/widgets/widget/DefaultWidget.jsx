/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const enhanceChartWidget = require('../enhancers/chartWidget');
const deleteWidget = require('../enhancers/deleteWidget');
const enhanceTableWidget = require('../enhancers/tableWidget');
const legendWidget = require('../enhancers/legendWidget');
const wpsChart = require('../enhancers/wpsChart');
const {compose} = require('recompose');
const dependenciesToFilter = require('../enhancers/dependenciesToFilter');
const dependenciesToOptions = require('../enhancers/dependenciesToOptions');
const dependenciesToWidget = require('../enhancers/dependenciesToWidget');
const dependenciesToMapProp = require('../enhancers/dependenciesToMapProp');
const ChartWidget = compose(
    dependenciesToWidget,
    dependenciesToFilter,
    dependenciesToOptions,
    wpsChart,
    enhanceChartWidget
)(require('./ChartWidget'));
const TextWidget = deleteWidget(require('./TextWidget'));
const MapWidget = compose(
    dependenciesToWidget,
    dependenciesToMapProp('center'),
    dependenciesToMapProp('zoom'),
    deleteWidget
)(require('./MapWidget'));
const TableWidget = compose(
    dependenciesToWidget,
    dependenciesToOptions,
    dependenciesToFilter,
    enhanceTableWidget
)(require('./TableWidget'));
const enhanceCounter = require('../enhancers/counterWidget');
const CounterWidget = compose(
    dependenciesToWidget,
    dependenciesToFilter,
    dependenciesToOptions,
    enhanceCounter
)(require("./CounterWidget"));

const LegendWidget = compose(
    legendWidget,
    deleteWidget
)(require("./LegendWidget"));
module.exports = ({
    dependencies,
    exportCSV = () => {},
    exportImage = () => {},
    onDelete = () => {},
    onEdit = () => {},
    ...w
} = {}) => w.widgetType === "text"
            ? (<TextWidget {...w}
                onDelete={onDelete}
                onEdit={onEdit}/>)
            : w.widgetType === "table"
            ? <TableWidget {...w}
                exportCSV={exportCSV}
                dependencies={dependencies}
                onDelete={onDelete}
                onEdit={onEdit}
            />
            : w.widgetType === "counter"
            ? <CounterWidget {...w}
                dependencies={dependencies}
                onDelete={onDelete}
                onEdit={onEdit} />
            : w.widgetType === "map"
            ? <MapWidget {...w}
                dependencies={dependencies}
                onDelete={onDelete}
                onEdit={onEdit} />
            : w.widgetType === "legend"
            ? <LegendWidget {...w}
                dependencies={dependencies}
                onDelete={onDelete}
                onEdit={onEdit} />
            : (<ChartWidget {...w}
                exportCSV={exportCSV}
                dependencies={dependencies}
                exportImage={exportImage}
                onDelete={onDelete}
                onEdit={onEdit} />)
         ;
