/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const enhanceChartWidget = require('../enhancers/chartWidget');
const enhanceTextWidget = require('../enhancers/deleteWidget');
const enhanceTableWidget = require('../enhancers/tableWidget');
const wpsChart = require('../enhancers/wpsChart');
const dependenciesToFilter = require('../enhancers/dependenciesToFilter');
const ChartWidget = dependenciesToFilter(wpsChart(enhanceChartWidget(require('./ChartWidget'))));
const TextWidget = enhanceTextWidget(require('./TextWidget'));
const MapWidget = enhanceTextWidget(require('./MapWidget'));
const TableWidget = dependenciesToFilter(enhanceTableWidget(require('./TableWidget')));
const enhanceCounter = require('../enhancers/counterWidget');
const CounterWidget = dependenciesToFilter(enhanceCounter(require("./CounterWidget")));
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

            : (<ChartWidget {...w}
                exportCSV={exportCSV}
                dependencies={dependencies}
                exportImage={exportImage}
                onDelete={onDelete}
                onEdit={onEdit} />)
         ;
