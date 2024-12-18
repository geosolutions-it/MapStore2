/**
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import ReactDOM from 'react-dom';
import MockAdapter from 'axios-mock-adapter';
import axios from '../../../../libs/ajax';
import StyleBasedWMSJsonLegend from '../StyleBasedWMSJsonLegend';
import expect from 'expect';
import TestUtils from 'react-dom/test-utils';
import { INTERACTIVE_LEGEND_ID } from '../../../../utils/LegendUtils';

let mockAxios;
const rules = [
    {
        "name": ">= 159.05 and < 5062.5",
        "filter": "[field >= '159.05' AND field < '5062.5']",
        "symbolizers": [{"Polygon": {
            "uom": "in/72",
            "stroke": "#ffffff",
            "stroke-width": "1.0",
            "stroke-opacity": "0.35",
            "stroke-linecap": "butt",
            "stroke-linejoin": "miter",
            "fill": "#8DD3C7",
            "fill-opacity": "0.75"
        }}]
    },
    {
        "name": ">= 5062.5 and < 20300.35",
        "filter": "[field >= '5062.5' AND field < '20300.35']",
        "symbolizers": [{"Polygon": {
            "uom": "in/72",
            "stroke": "#ffffff",
            "stroke-width": "1.0",
            "stroke-opacity": "0.35",
            "stroke-linecap": "butt",
            "stroke-linejoin": "miter",
            "fill": "#ABD9C5",
            "fill-opacity": "0.75"
        }}]
    }
];

describe('test StyleBasedWMSJsonLegend module component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        mockAxios = new MockAdapter(axios);
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        mockAxios.restore();
        setTimeout(done);
    });

    it('tests StyleBasedWMSJsonLegend component creation', async() => {
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            storeIndex: 9,
            type: 'wms',
            url: 'http://localhost:8080/geoserver/wms'
        };
        mockAxios.onGet().reply(() => {
            return [ 200, {
                "Legend": [{
                    "layerName": "layer00",
                    "title": "Layer",
                    rules
                }]
            }];
        });
        const comp = ReactDOM.render(<StyleBasedWMSJsonLegend legendHeight={50} legendWidth={50} layer={l} />, document.getElementById("container"));
        await TestUtils.act(async() => comp);

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toBeTruthy();

        const legendElem = document.querySelector('.wms-legend');
        expect(legendElem).toBeTruthy();
        const legendRuleElem = domNode.querySelectorAll('.wms-json-legend-rule');
        expect(legendRuleElem).toBeTruthy();
        expect(legendRuleElem.length).toEqual(2);
    });
    it('tests legend with empty rules', async() => {
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            storeIndex: 9,
            type: 'wms',
            url: 'http://localhost:8080/geoserver1/wms'
        };
        mockAxios.onGet(/geoserver1/).reply(() => {
            return [200, {
                "Legend": [{
                    "layerName": "layer01",
                    "title": "Layer1",
                    "rules": []
                }]
            }];
        });
        const comp = ReactDOM.render(<StyleBasedWMSJsonLegend legendHeight={50} legendWidth={50} layer={l} />, document.getElementById("container"));
        await TestUtils.act(async() => comp);

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toBeTruthy();

        const legendElem = document.querySelector('.wms-legend');
        expect(legendElem).toBeTruthy();
        expect(legendElem.innerText).toBe('layerProperties.interactiveLegend.noLegendData');
        const legendRuleElem = domNode.querySelectorAll('.wms-json-legend-rule');
        expect(legendRuleElem.length).toBe(0);
    });
    it('tests legend with incompatible filter rules', async() => {
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            storeIndex: 9,
            type: 'wms',
            url: 'http://localhost:8080/geoserver2/wms',
            layerFilter: {
                filters: [{
                    id: INTERACTIVE_LEGEND_ID,
                    filters: [{
                        id: 'filter1'
                    }]
                }],
                disabled: false
            }
        };
        mockAxios.onGet(/geoserver2/).reply(() => {
            return [200, {
                "Legend": [{
                    "layerName": "layer01",
                    "title": "Layer1",
                    rules
                }]
            }];
        });
        const comp = ReactDOM.render(<StyleBasedWMSJsonLegend legendHeight={50} legendWidth={50} layer={l} />, document.getElementById("container"));
        await TestUtils.act(async() => comp);

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toBeTruthy();

        const legendElem = document.querySelector('.wms-legend');
        expect(legendElem).toBeTruthy();
        const legendRuleElem = domNode.querySelector('.wms-legend .alert-warning');
        expect(legendRuleElem).toBeTruthy();
        expect(legendRuleElem.innerText).toContain('layerProperties.interactiveLegend.incompatibleFilterWarning');
        const resetLegendFilter = domNode.querySelector('.wms-legend .alert-warning button');
        expect(resetLegendFilter).toBeTruthy();
    });
    it('tests hide warning when layer filter is disabled', async() => {
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            storeIndex: 9,
            type: 'wms',
            url: 'http://localhost:8080/geoserver3/wms',
            layerFilter: {
                filters: [{
                    id: INTERACTIVE_LEGEND_ID,
                    filters: [{
                        id: 'filter1'
                    }]
                }],
                disabled: true
            }
        };
        mockAxios.onGet(/geoserver3/).reply(() => {
            return [200, {
                "Legend": [{
                    "layerName": "layer01",
                    "title": "Layer1",
                    rules
                }]
            }];
        });
        const comp = ReactDOM.render(<StyleBasedWMSJsonLegend legendHeight={50} legendWidth={50} layer={l} />, document.getElementById("container"));
        await TestUtils.act(async() => comp);

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toBeTruthy();

        const legendElem = document.querySelector('.wms-legend');
        expect(legendElem).toBeTruthy();
        const legendRuleElem = domNode.querySelector('.wms-legend .alert-warning');
        expect(legendRuleElem).toBeFalsy();
    });
});
