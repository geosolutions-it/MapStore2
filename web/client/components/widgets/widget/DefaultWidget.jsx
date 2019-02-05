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
const { pinnableWidget, hidableWidget, withTools, withMenu, editableWidget, collapsibleWidget} = require('../enhancers/tools');

/*
 * TODO: now tools in menu are added checking the same order the enhancers are applied to the components.
 * A better solution should be to add an attribute to the tool to sort entries in the menu.
 */

const ChartWidget = compose(
    dependenciesToWidget,
    dependenciesToFilter,
    dependenciesToOptions,
    wpsChart,
    enhanceChartWidget
)(require('./ChartWidget'));

const TextWidget = compose(
    deleteWidget,
    withTools(),
    pinnableWidget(),
    collapsibleWidget(),
    editableWidget(),
    hidableWidget(),
    withMenu()
)(require('./TextWidget'));

const MapWidget = compose(
    dependenciesToWidget,
    dependenciesToMapProp('center'),
    dependenciesToMapProp('zoom'),
    deleteWidget,
    collapsibleWidget(),
    editableWidget(),
    withMenu()
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
    deleteWidget,
    collapsibleWidget(),
    editableWidget(),
    withMenu()
)(require("./LegendWidget"));

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
