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
const ChartWidget = enhanceChartWidget(require('../widget/ChartWidget'));
const propsStreamFactory = require('../../misc/enhancers/propsStreamFactory');
const StreamWidget = propsStreamFactory((props) => <ChartWidget {...props} />);
module.exports = ({widgets=[]}={}) => (<Panel header={<WidgetGridHeader />}>
        <div className="mapstore-scroll-container-1">
            <WidgetGrid>
                {widgets.map( (w, i) => <StreamWidget key={i} {...w} />)}
            </WidgetGrid>
        </div>
    </Panel>);
