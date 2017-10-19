 /*
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */
const React = require('react');
const enhanceChartWidget = require('../enhancers/chartWidget');
const wpsChart = require('../enhancers/wpsChart');

const {Responsive, WidthProvider: widthProvider} = require('react-grid-layout');
const ResponsiveReactGridLayout = widthProvider(Responsive);

require('react-grid-layout/css/styles.css');
require('react-resizable/css/styles.css');

const ChartWidget = wpsChart(enhanceChartWidget(require('../widget/ChartWidget')));
// const propsStreamFactory = require('../../misc/enhancers/propsStreamFactory');
// const StreamWidget = propsStreamFactory((props) => <ChartWidget {...props} />);


module.exports = ({widgets=[]}={}) =>
    (<ResponsiveReactGridLayout
        style={{left: 0, bottom: 30, minHeight: '440px', width: 'calc(100% - 50px)', position: 'absolute', zIndex: 50}}
        containerPadding={[10, 10]}
        className="widget-card-on-map"
        rowHeight={208}
        autoSize={false}
        compactType={'vertical'}
        verticalCompact={false}
        breakpoints={{lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0}}
        cols={{lg: 6, md: 4, sm: 2, xs: 1, xxs: 1}}>

     {widgets.map((w, i) => {
         return (<div key={'wg' + i} className="widget-card-on-map" >
              <ChartWidget key={i} {...w} />
         </div>);
     })}
   </ResponsiveReactGridLayout>);
