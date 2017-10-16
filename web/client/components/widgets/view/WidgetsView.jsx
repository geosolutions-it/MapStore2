 /*
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */
const React = require('react');

const {Panel} = require('react-bootstrap');
const WidgetGridHeader = require('./WidgetGridHeader');
const enhanceChartWidget = require('../enhancers/chartWidget');
const wpsChart = require('../enhancers/wpsChart');

const {Responsive, WidthProvider: widthProvider} = require('react-grid-layout');
const ResponsiveReactGridLayout = widthProvider(Responsive);

require('react-grid-layout/css/styles.css');
require('react-resizable/css/styles.css');

const ChartWidget = wpsChart(enhanceChartWidget(require('../widget/ChartWidget')));
// const propsStreamFactory = require('../../misc/enhancers/propsStreamFactory');
// const StreamWidget = propsStreamFactory((props) => <ChartWidget {...props} />);


module.exports = ({widgets=[]}={}) => (<Panel header={<WidgetGridHeader />}>
    <ResponsiveReactGridLayout
        style={{left: '500px', bottom: 30, minHeight: '552px', width: 'calc(100% - 552px)', position: 'absolute', zIndex: 2}}
        className="layout"
        rowHeight={208}
        compactVertical={false}
        compactType={'horizontal'}
        breakpoints={{lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0}}
        cols={{lg: 7, md: 6, sm: 5, xs: 4, xxs: 4}}>

     {widgets.map((w, i) => {
         return (<div key={'wg' + i} className="widget-card-on-map" >
              <ChartWidget key={i} {...w} />;
         </div>);
     })}
   </ResponsiveReactGridLayout>
</Panel>);
