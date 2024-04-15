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

let mockAxios;

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
                    "rules": [
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
                        }]
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
});
