/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var ReactDOM = require('react-dom');
var Title = require('../Title');

var expect = require('expect');

var ReactTestUtils = require('react-dom/test-utils');

describe('test Title module component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('tests Title component creation', () => {
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            storeIndex: 9,
            type: 'wms',
            url: 'fakeurl'
        };
        const comp = ReactDOM.render(<Title node={l} />, document.getElementById("container"));

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();

        expect(domNode.innerText.indexOf('Layer') !== -1).toBe(true);
    });

    it('tests Title right click', () => {
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            storeIndex: 9,
            type: 'wms',
            url: 'fakeurl'
        };

        const actions = {
            onContextMenu: () => {}
        };
        let spy = expect.spyOn(actions, "onContextMenu");

        const comp = ReactDOM.render(<Title node={l} onContextMenu={actions.onContextMenu}/>, document.getElementById("container"));
        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        ReactTestUtils.Simulate.contextMenu(domNode);
        expect(spy.calls.length).toBe(1);
    });

    it('tests Title attribute title as object without currentLocale', () => {
        const l = {
            name: 'layer00',
            title: {
                'default': 'Layer',
                'it-IT': 'Livello'
            },
            visibility: true,
            storeIndex: 9,
            type: 'wms',
            url: 'fakeurl'
        };
        const comp = ReactDOM.render(<Title node={l} currentLocale="en-US"/>, document.getElementById("container"));
        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        expect(domNode.innerHTML).toBe(l.title.default);
    });

    it('tests Title attribute title as object with currentLocale', () => {
        const l = {
            name: 'layer00',
            title: {
                'default': 'Layer',
                'it-IT': 'Livello'
            },
            visibility: true,
            storeIndex: 9,
            type: 'wms',
            url: 'fakeurl'
        };
        const comp = ReactDOM.render(<Title node={l} currentLocale="it-IT"/>, document.getElementById("container"));
        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        expect(domNode.innerHTML).toBe(l.title['it-IT']);
    });

    it('tests Title without title', () => {
        const l = {
            name: 'layer00',
            visibility: true,
            storeIndex: 9,
            type: 'wms',
            url: 'fakeurl'
        };
        const comp = ReactDOM.render(<Title node={l} currentLocale="it-IT"/>, document.getElementById("container"));
        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        expect(domNode.innerHTML).toBe(l.name);
    });

    it('tests Title with tooltip', () => {
        const l = {
            name: 'layer00',
            title: {
                'default': 'Layer',
                'it-IT': 'Livello'
            },
            visibility: true,
            storeIndex: 9,
            type: 'wms',
            url: 'fakeurl'
        };
        const comp = ReactDOM.render(<Title node={l} tooltip currentLocale="it-IT"/>, document.getElementById("container"));
        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        ReactTestUtils.Simulate.mouseOver(domNode);
        expect(ReactDOM.findDOMNode(comp).getAttribute('aria-describedby')).toBe('tooltip-layer-title');
    });

    it('tests Title without tooltip', () => {
        const l = {
            name: 'layer00',
            title: {
                'default': 'Layer',
                'it-IT': 'Livello'
            },
            visibility: true,
            storeIndex: 9,
            type: 'wms',
            url: 'fakeurl'
        };
        const comp = ReactDOM.render(<Title node={l} currentLocale="it-IT"/>, document.getElementById("container"));
        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        ReactTestUtils.Simulate.mouseOver(domNode);
        expect(ReactDOM.findDOMNode(comp).getAttribute('aria-describedby')).toBe(null);
    });
});
