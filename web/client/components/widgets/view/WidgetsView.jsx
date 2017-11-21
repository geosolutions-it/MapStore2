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
const dependenciesToFilter = require('../enhancers/dependenciesToFilter');
const {pure} = require('recompose');

/*
react-grid-layout-resize-prevent-collision is a fork of react-grid-layout deployed on npmjs.org to fix https://github.com/STRML/react-grid-layout/issues/655
You can install and use react-grid-layout again when the issue is fixed
*/
const {Responsive, WidthProvider: widthProvider} = require('react-grid-layout-resize-prevent-collision');
const ResponsiveReactGridLayout = widthProvider(Responsive);
require('react-grid-layout-resize-prevent-collision/css/styles.css');
require('react-grid-layout-resize-prevent-collision/css/styles.css');

const ChartWidget = dependenciesToFilter(wpsChart(enhanceChartWidget(require('../widget/ChartWidget'))));

module.exports = pure(({
    id,
    width,
    height,
    rowHeight=208,
    widgets=[],
    layouts,
    deleteWidget = () => {},
    editWidget = () => {},
    onLayoutChange = () => {},
    exportCSV = () => {},
    exportImage = () => {},
    dependencies}={}
    ) =>
    (<ResponsiveReactGridLayout
        key={id}
        onLayoutChange={onLayoutChange}
        preventCollision
        layouts={layouts ? JSON.parse(JSON.stringify(layouts)) : undefined}
        style={{
            left: (width && width > 800) ? "500px" : "0",
            bottom: 50,
            height: Math.floor((height - 100) / (rowHeight + 10)) * (rowHeight + 10),
            width: `${width && width > 800 ? 'calc(100% - 550px)' : 'calc(100% - 50px)'}`,
            position: 'absolute',
            zIndex: 50}}

        className="widget-card-on-map"
        rowHeight={rowHeight}
        autoSize
        verticalCompact={false}
        breakpoints={{lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0}}
        cols={{lg: 6, md: 6, sm: 4, xs: 2, xxs: 1}}>
     {widgets.map( w => {
         return (<div key={w.id} data-grid={w.dataGrid} >
              <ChartWidget {...w}
                  exportCSV={exportCSV}
                  dependencies={dependencies}
                  exportImage={exportImage}
                  onDelete={() => deleteWidget(w)}
                  onEdit={() => editWidget(w)} />
         </div>);
     })}
 </ResponsiveReactGridLayout>));
