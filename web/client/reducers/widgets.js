/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const CREATE = require('../actions/widgets');
const {get} = require('lodash');
const {set} = require('../utils/ImmutableUtils');

/***
 TEST DATA
 **********/
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
 /*** END TEST DATA ***/

const emptyState = {
    containers: {
        floating: {
            widgets: WIDGETS
        }
    }
};
/**
 * Manages the state of the widgets
 * @prop {array} widgets version identifier
 *
 * @example
 *{
 *  widgets: [{}]
 *}
 * @memberof reducers
 */
function widgets(state = emptyState, action) {
    switch (action.type) {
        case CREATE:
            return set(state, `containers['${action.target}']`, {
                widgets: [
                    ...(get(state, `containers[${action.target}].widgets`) || []),
                    {
                        id: action.id,
                        ...action.widget
                    }
                ]
            });
        default:
            return state;
    }
}

module.exports = widgets;
