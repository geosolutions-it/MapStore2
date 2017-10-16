 /*
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */
const React = require('react');
const WidgetGrid = require('./WidgetGrid');

const {Panel} = require('react-bootstrap');
const WidgetGridHeader = require('./WidgetGridHeader');
const enhanceChartWidget = require('../enhancers/chartWidget');
const wpsChart = require('../enhancers/wpsChart');

const ChartWidget = wpsChart(enhanceChartWidget(require('../widget/ChartWidget')));
// const propsStreamFactory = require('../../misc/enhancers/propsStreamFactory');
// const StreamWidget = propsStreamFactory((props) => <ChartWidget {...props} />);


module.exports = ({widgets=[]}={}) => (<Panel header={<WidgetGridHeader />}>
    <WidgetGrid>
        {widgets.map( (w, i) => {
            return <ChartWidget key={i} {...w} />;
        })}
    </WidgetGrid>
</Panel>);
