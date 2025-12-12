/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';

import expect from 'expect';
import ChartWizard from '../ChartWizard';

const featureTypeProperties = [{
    "name": "the_geom",
    "maxOccurs": 1,
    "minOccurs": 0,
    "nillable": true,
    "type": "gml:MultiLineString",
    "localType": "MultiLineString"
},
{
    "name": "LABEL1",
    "maxOccurs": 1,
    "minOccurs": 0,
    "nillable": true,
    "type": "xsd:number",
    "localType": "number"
},
{
    "name": "LABEL2",
    "maxOccurs": 1,
    "minOccurs": 0,
    "nillable": true,
    "type": "xsd:string",
    "localType": "string"
}
];
const layer = {
    type: "wms",
    url: "https://gs-stable.geosolutionsgroup.com/geoserver/wms",
    visibility: true,
    dimensions: [],
    name: "test:layer",
    title: "Layer_1",
    description: "",
    bbox: {
        crs: "EPSG:4326",
        bounds: {
            minx: 7.47521710513349,
            miny: 35.21695657422812,
            maxx: 19.380075671969546,
            maxy: 45.89376984834448
        }
    },
    search: {
        type: "wfs",
        url: "some_url"
    }
};
const data = {
    mapSync: false,
    widgetType: "chart",
    charts: [
        {
            legend: false,
            cartesian: true,
            chartId: "1",
            traces: [{
                type: "bar",
                layer,
                options: {}
            }]
        },
        {
            legend: false,
            cartesian: true,
            chartId: "2",
            traces: [{
                type: "bar",
                layer: {...layer, title: "Layer_2", name: "test:layer1"},
                options: {}
            }]
        }
    ],
    selectedChartId: "1",
    geomProp: "the_geom"
};

describe('ChartWizard component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('ChartWizard rendering with defaults', () => {
        ReactDOM.render(<ChartWizard />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-wizard');
        expect(el).toBeFalsy();
    });
    it('ChartWizard with featureTypeProperties and traces', () => {
        ReactDOM.render(<ChartWizard
            featureTypeProperties={featureTypeProperties}
            data={{
                selectedChartId: 'chart-01',
                charts: [{
                    chartId: 'chart-01',
                    traces: [{
                        type: 'bar',
                        layer: {},
                        options: {}
                    }]
                }]
            }}
        />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container).toBeTruthy();
        expect(container.querySelector('.ms-wizard')).toBeTruthy();
        const elChartOption = container.querySelector('.chart-options');
        expect(elChartOption).toBeTruthy();
        const elChartOptionForm = container.querySelector('.chart-options-form');
        expect(elChartOptionForm).toBeTruthy();
    });
    it('ChartWizard with chart data', () => {
        const props = {
            featureTypeProperties,
            data,
            layer,
            hasAggregateProcess: true,
            withContainer: false,
            selectedChart: {...data, layer},
            noAttributes: false
        };
        ReactDOM.render(<ChartWizard step={0} {...props}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const domNode = container.querySelector('.ms-wizard');
        expect(domNode).toBeTruthy();
        const selectInputs = domNode.querySelectorAll('.Select');
        expect(selectInputs.length).toBe(9);
    });
    it('ChartWizard step 1', () => {
        const props = {
            featureTypeProperties,
            data,
            layer,
            hasAggregateProcess: true,
            withContainer: false,
            selectedChart: {...data, layer},
            noAttributes: false
        };
        ReactDOM.render(<ChartWizard step={1} {...props}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const domNode = container.querySelector('.ms-wizard');
        expect(domNode).toBeTruthy();
        expect(domNode.querySelectorAll('input').length).toBe(2);
    });
});
