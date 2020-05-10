/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var ReactDOM = require('react-dom');
var WMSLegend = require('../WMSLegend');

var expect = require('expect');

describe('test WMSLegend module component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
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
});
