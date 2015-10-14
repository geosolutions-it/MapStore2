/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react/addons');
var Layer = require('../DefaultLayer');

var expect = require('expect');

describe('test DefaultLayer module component', () => {

    afterEach((done) => {
        React.unmountComponentAtNode(document.body);
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('tests DefaultLayer component creation (wms)', () => {
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            storeIndex: 9,
            type: 'wms'
        };
        const comp = React.render(<Layer node={l} />, document.body);
        expect(comp).toExist();

        const domNode = React.findDOMNode(comp);
        expect(domNode).toExist();

        const checkbox = domNode.getElementsByTagName('input').item(0);
        expect(checkbox).toExist();
        expect(parseInt(checkbox.dataset.position, 10)).toBe(l.storeIndex);
        expect(checkbox.checked).toBe(l.visibility);

        const label = domNode.getElementsByTagName('span').item(0);
        expect(label).toExist();
        expect(label.innerHTML).toBe(l.title || l.name);
    });

    it('tests DefaultLayer component creation (no wms)', () => {
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: false,
            storeIndex: 9
        };
        const comp = React.render(<Layer node={l} />, document.body);
        expect(comp).toExist();

        const domNode = React.findDOMNode(comp);
        expect(domNode).toExist();

        const checkbox = domNode.getElementsByTagName('input').item(0);
        expect(checkbox).toExist();
        expect(parseInt(checkbox.dataset.position, 10)).toBe(l.storeIndex);
        expect(checkbox.checked).toBe(l.visibility);

        const label = domNode.getElementsByTagName('span').item(0);
        expect(label).toExist();
        expect(label.innerHTML).toBe(l.title || l.name);
    });

    it('test change event', () => {
        let newLayer;
        let position;

        let handler = (l, p) => {
            newLayer = l;
            position = p;
        };

        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: false,
            storeIndex: 9
        };
        const comp = React.render(
            <Layer
                propertiesChangeHandler={handler}
                node={l}
            />, document.body);
        expect(comp).toExist();

        const domNode = React.findDOMNode(comp);
        expect(domNode).toExist();

        const checkbox = domNode.getElementsByTagName('input').item(0);
        expect(checkbox).toExist();

        checkbox.checked = !l.visibility;
        React.addons.TestUtils.Simulate.change(checkbox, {
            target: {
                checked: !l.visibility
            }
        });
        expect(newLayer.visibility).toBe(!l.visibility);
        expect(position).toBe(l.storeIndex);
    });

});
