/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');
var React = require('react/addons');
var ScaleBox = require('../ScaleBox');
var mapUtils = require('../../../utils/MapUtils');

describe('ScaleBox', () => {
    afterEach((done) => {
        React.unmountComponentAtNode(document.body);
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('create component with defaults', () => {
        const sb = React.render(<ScaleBox />, document.body);
        expect(sb).toExist();
        const domNode = React.findDOMNode(sb);
        expect(domNode).toExist();
        expect(domNode.id).toBe('mapstore-scalebox');

        const comboItems = Array.prototype.slice.call(domNode.getElementsByTagName('option'), 0);
        expect(comboItems.length).toBe(22);

        expect(comboItems.reduce((pre, cur, i) => {
            const scale = parseInt(cur.innerHTML.replace(/1\s\:\s/i, ''), 10);
            const testScale = Math.round(mapUtils.getGoogleMercatorScale(i));
            return pre && (scale === testScale);
        }, true)).toBe(true);

        expect(comboItems.reduce((pre, cur, i) => {
            return pre && (i === 0 ? cur.selected : !cur.selected);
        }), true).toBe(true);
    });
    it('test handler for onChange event', () => {
        var newZoom;

        const sb = React.render(<ScaleBox onChange={(z) => {newZoom = z; }}/>, document.body);
        expect(sb).toExist();
        const domNode = React.findDOMNode(sb);
        expect(domNode).toExist();
        const domSelect = domNode.getElementsByTagName('select').item(0);
        expect(domSelect).toExist();

        domSelect.value = 5;
        React.addons.TestUtils.Simulate.change(domSelect, {target: {value: 5}});
        expect(newZoom).toBe(5);
    });
});
