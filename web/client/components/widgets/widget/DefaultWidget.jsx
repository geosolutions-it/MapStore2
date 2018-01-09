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
const wpsChart = require('../enhancers/wpsChart');
const dependenciesToFilter = require('../enhancers/dependenciesToFilter');
const ChartWidget = dependenciesToFilter(wpsChart(enhanceChartWidget(require('./ChartWidget'))));
const TextWidget = enhanceTextWidget(require('./TextWidget'));
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
            : (<ChartWidget {...w}
                exportCSV={exportCSV}
                dependencies={dependencies}
                exportImage={exportImage}
                onDelete={onDelete}
                onEdit={onEdit} />)
         ;
