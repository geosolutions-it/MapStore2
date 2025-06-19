/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import ReactDOM from 'react-dom';
import WMSLegend from '../WMSLegend';
import expect from 'expect';
import TestUtils from 'react-dom/test-utils';
import MockAdapter from 'axios-mock-adapter';
import axios from '../../../../libs/ajax';

let mockAxios;

describe('test WMSLegend module component', () => {
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

    it('tests WMSLegend component creation', () => {
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            storeIndex: 9,
            type: 'wms',
            url: 'fakeurl'
        };
        const comp = ReactDOM.render(<WMSLegend node={l} />, document.getElementById("container"));

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();

        const image = domNode.getElementsByTagName('img');
        expect(image).toExist();
        expect(image.length).toBe(1);
    });

    it('tests WMSLegend is not shown if node is not visible', () => {
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: false,
            storeIndex: 9,
            type: 'wms',
            url: 'fakeurl'
        };
        const comp = ReactDOM.render(<WMSLegend node={l} showOnlyIfVisible />, document.getElementById("container"));

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toNotExist();
    });

    it('tests WMSLegend component default legendOptions', () => {
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            storeIndex: 9,
            type: 'wms',
            url: 'fakeurl'
        };
        const comp = ReactDOM.render(<WMSLegend node={l} />, document.getElementById("container"));

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();

        const image = domNode.getElementsByTagName('img');
        expect(image).toExist();
        expect(image.length).toBe(1);
        const params = new URLSearchParams(image[0].src);
        expect(params.get("width")).toBe('12');
        expect(params.get("height")).toBe('12');
        expect(params.get("LEGEND_OPTIONS")).toBe('forceLabels:on');
    });

    it('tests WMSLegend component legendOptions with one or all values missing', () => {
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            storeIndex: 9,
            type: 'wms',
            url: 'fakeurl',
            legendOptions: {legendWidth: "", legendHeight: 11}
        };
        const comp = ReactDOM.render(<WMSLegend node={l} />, document.getElementById("container"));

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();

        const image = domNode.getElementsByTagName('img');
        expect(image).toExist();
        expect(image.length).toBe(1);
        const params = new URLSearchParams(image[0].src);
        expect(params.get("width")).toBe('12');
        expect(params.get("height")).toBe('12');
        expect(params.get("LEGEND_OPTIONS")).toBe('forceLabels:on');
    });

    it('tests WMSLegend component legendOptions with values', () => {
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            storeIndex: 9,
            type: 'wms',
            url: 'fakeurl',
            legendOptions: {legendWidth: 20, legendHeight: 40}
        };
        const comp = ReactDOM.render(<WMSLegend node={l} />, document.getElementById("container"));

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();

        const image = domNode.getElementsByTagName('img');
        expect(image).toExist();
        expect(image.length).toBe(1);
        const params = new URLSearchParams(image[0].src);
        expect(params.get("width")).toBe('20');
        expect(params.get("height")).toBe('40');
        expect(params.get("LEGEND_OPTIONS")).toBe('forceLabels:on');
    });
    it('tests WMSLegend component legendOptions with dynamic legend enabled', () => {
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            storeIndex: 9,
            type: 'wms',
            url: 'fakeurl',
            enableDynamicLegend: true,
            legendOptions: {legendWidth: 20, legendHeight: 40}
        };
        const comp = ReactDOM.render(<WMSLegend node={l} />, document.getElementById("container"));

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();

        const image = domNode.getElementsByTagName('img');
        expect(image).toExist();
        expect(image.length).toBe(1);
        const params = new URLSearchParams(image[0].src);
        expect(params.get("width")).toBe('20');
        expect(params.get("height")).toBe('40');
        expect(params.get("LEGEND_OPTIONS")).toBe('hideEmptyRules:true;forceLabels:on');
    });

    it('tests WMSLegend component legendOptions from cfg', () => {
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            storeIndex: 9,
            type: 'wms',
            url: 'fakeurl'
        };
        const comp = ReactDOM.render(<WMSLegend node={l} legendWidth={20} legendHeight={40} />, document.getElementById("container"));

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();

        const image = domNode.getElementsByTagName('img');
        expect(image).toExist();
        expect(image.length).toBe(1);
        const params = new URLSearchParams(image[0].src);
        expect(params.get("width")).toBe('20');
        expect(params.get("height")).toBe('40');
        expect(params.get("LEGEND_OPTIONS")).toBe('forceLabels:on');
    });

    it('tests WMSLegend component language property with value', () => {
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            storeIndex: 9,
            type: 'wms',
            url: 'fakeurl',
            localizedLayerStyles: true
        };
        const language = 'example_language';
        const comp = ReactDOM.render(<WMSLegend node={l} language={language} />, document.getElementById("container"));

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();

        const image = domNode.getElementsByTagName('img');
        expect(image).toExist();
        expect(image.length).toBe(1);
        const params = new URLSearchParams(image[0].src);
        expect(params.get("LANGUAGE")).toBe(language);
    });

    it('tests WMSLegend with json legend', async() => {
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
                        }]
                }]
            }];
        });
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            storeIndex: 9,
            type: 'wms',
            url: 'fakeurl',
            enableInteractiveLegend: true
        };
        const comp = ReactDOM.render(<WMSLegend node={l} />, document.getElementById("container"));
        await TestUtils.act(async() => comp);

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toBeTruthy();
        const legendElem = document.querySelector('.wms-legend');
        expect(legendElem).toBeTruthy();
        const legendRuleElem = domNode.querySelectorAll('.wms-json-legend-rule');
        expect(legendRuleElem).toBeTruthy();
        expect(legendRuleElem.length).toBe(1);
    });
});
