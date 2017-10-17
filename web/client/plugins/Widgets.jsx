/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const Dock = require('react-dock').default;

const assign = require('object-assign');
const PropTypes = require('prop-types');
const WidgetsView = require('../components/widgets/view/WidgetsView');

const W1 = {
    title: "chart",
    description: "description",
    type: "line",
    layer: {
        name: "topp:states"
    },
    url: "http://demo.geo-solutions.it/geoserver/wfs",
    options: {aggregateFunction: "Count", aggregationAttribute: "STATE_NAME", groupByAttributes: "SUB_REGION"},
    legend: {
        layout: "vertical",
        align: "left",
        verticalAlign: "middle"
    },
    width: 500,
    height: 200
};
/*
const W2 = {
    title: "chart",
    description: "description",
    type: "pie",
    layer: {
        name: "SITGEO:V_INDUSTRIE"
    },
    url: "/geoserver-test/wfs",
    options: {aggregateFunction: "Count", aggregationAttribute: "AZIENDA", groupByAttributes: "TIPOSEDE"},
    legend: {
        layout: "vertical",
        align: "left",
        verticalAlign: "middle"
    },
    width: 500,
    height: 200
};
*/


// const WIDGETS = [{data, loading: true, title: "chart", description: "description", series: SERIES, yAxis: {}, xAxis: {dataKey: "name"} }];
const WIDGETS = [ W1, {...W1, type: 'pie'}, {...W1, type: 'bar'} ];


class Widgets extends React.Component {
     static propTypes = {
         id: PropTypes.string,
         enabled: PropTypes.isVisible,
         limitDockHeight: PropTypes.bool,
         fluid: PropTypes.bool,
         zIndex: PropTypes.number,
         dockSize: PropTypes.number,
         position: PropTypes.string,
         dimMode: PropTypes.dimMode,
         src: PropTypes.string,
         style: PropTypes.object
     };
     static defaultProps = {
         id: "widgets-plugin",
         enabled: true,
         dockSize: 600,
         limitDockHeight: true,
         zIndex: 10000,
         fluid: false,
         dimMode: "none",
         position: "right"
     };
    render() {
        return (<WidgetsView widgets={WIDGETS}/>);

    }
}

module.exports = {
    WidgetsPlugin: assign(Widgets, {

    })
};
