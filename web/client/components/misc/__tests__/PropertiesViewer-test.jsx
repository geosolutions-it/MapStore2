/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');
var React = require('react/addons');
var PropertiesViewer = require('../PropertiesViewer');

describe('PropertiesViewer', () => {
    afterEach((done) => {
        React.unmountComponentAtNode(document.body);
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('test defaults', () => {
        const cmp = React.render(<PropertiesViewer/>, document.body);
        expect(cmp).toExist();

        const cmpDom = React.findDOMNode(cmp);
        expect(cmpDom).toExist();

        expect(cmpDom.childNodes.length).toBe(0);
    });
    it('test title rendering', () => {
        const cmp = React.render(<PropertiesViewer title="testTitle"/>, document.body);
        expect(cmp).toExist();

        const cmpDom = React.findDOMNode(cmp);
        expect(cmpDom).toExist();

        expect(cmpDom.childNodes.length).toBe(1);
        expect(cmpDom.childNodes.item(0).innerHTML).toBe("testTitle");
    });
    it('test body rendering', () => {
        const testProps = {
            k0: "v0",
            k1: "v1",
            k2: "v2"
        };
        const cmp = React.render(<PropertiesViewer {...testProps}/>, document.body);
        expect(cmp).toExist();

        const cmpDom = React.findDOMNode(cmp);
        expect(cmpDom).toExist();

        expect(cmpDom.childNodes.length).toBe(1);

        const body = cmpDom.childNodes.item(0);
        expect(body.childNodes.length).toBe(Object.keys(testProps).length);

        const testKeys = Object.keys(testProps);
        expect(Array.prototype.reduce.call(body.childNodes, (prev, child, i) => {
            let testKey = testKeys[i];
            let testVal = testProps[testKey];
            return prev
                && child.childNodes.length === 3
                && child.childNodes.item(0).innerHTML === testKey
                && child.childNodes.item(1).innerHTML === " "
                && child.childNodes.item(2).innerHTML === testVal;
        }, true)).toBe(true);
    });

});
