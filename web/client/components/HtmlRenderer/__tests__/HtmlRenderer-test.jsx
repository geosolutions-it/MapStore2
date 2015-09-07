/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');
var React = require('react/addons');
var HtmlRenderer = require('../HtmlRenderer');

describe("This test for HtmlRenderer component", () => {
    afterEach((done) => {
        React.unmountComponentAtNode(document.body);
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('creates componet with defaults', () => {
        const cmp = React.render(<HtmlRenderer/>, document.body);
        expect(cmp).toExist();

        const node = React.findDOMNode(cmp);
        expect(node.id).toNotExist();
        expect(node.childNodes.length).toBe(0);
    });

    it('creates empty componet with id', () => {
        const cmp = React.render(<HtmlRenderer id="testId"/>, document.body);
        expect(cmp).toExist();

        const node = React.findDOMNode(cmp);
        expect(node.id).toBe("testId");
        expect(node.childNodes.length).toBe(0);
    });

    it('creates a filled componet', () => {
        const srcCode = '<p id="innerP"><span id="innerSPAN">text</span></p>';
        const cmp = React.render(<HtmlRenderer html={srcCode}/>, document.body);
        expect(cmp).toExist();

        const node = React.findDOMNode(cmp);
        expect(node.childNodes.length).toBe(1);

        const innerP = node.childNodes[0];
        expect(innerP.id).toBe("innerP");
        expect(innerP.childNodes.length).toBe(1);

        const innerSPAN = innerP.childNodes[0];
        expect(innerSPAN.id).toBe("innerSPAN");
        expect(innerSPAN.innerHTML).toBe("text");
    });
});
