/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react/addons');
var Node = require('../Node');

var expect = require('expect');

describe('test Node module component', () => {

    afterEach((done) => {
        React.unmountComponentAtNode(document.body);
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('tests Node component creation', () => {
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            storeIndex: 9,
            type: 'wms'
        };
        const comp = React.render(<Node node={l} />, document.body);
        expect(comp).toExist();

        const domNode = React.findDOMNode(comp);
        expect(domNode).toExist();
    });

    it('tests Layer children', () => {
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: false,
            storeIndex: 9
        };
        const comp = React.render(<Node node={l}><div className="layer-content"/></Node>, document.body);
        expect(comp).toExist();

        const domNode = React.findDOMNode(comp);
        expect(domNode).toExist();

        const layers = domNode.getElementsByClassName('layer-content');
        expect(layers.length).toBe(1);

    });

    it('tests Layer children collapsible', () => {
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: false,
            storeIndex: 9
        };
        const comp = React.render(<Node node={l}><div position="collapsible" className="layer-collapsible"/><div className="layer-content"/></Node>, document.body);
        expect(comp).toExist();

        const domNode = React.findDOMNode(comp);
        expect(domNode).toExist();

        const layers = domNode.getElementsByClassName('layer-content');
        expect(layers.length).toBe(1);

        const collapsible = domNode.getElementsByClassName('layer-collapsible');
        expect(collapsible.length).toBe(1);

    });
});
