/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');
var React = require('react/addons');
var ReactDOM = require('react-dom');
var ApplyTemplate = require('../ApplyTemplate');

describe('ApplyTemplate', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('test defaults', () => {
        const cmp = ReactDOM.render(<ApplyTemplate />, document.getElementById("container"));
        expect(cmp).toExist();

        const cmpDom = ReactDOM.findDOMNode(cmp);
        expect(cmpDom).toExist();

        expect(cmpDom.innerHTML).toBe("");
    });
    it('test child rendering', () => {
        const cmp = ReactDOM.render(
            <ApplyTemplate data={{id: "p-id"}}>
                <p></p>
            </ApplyTemplate>, document.getElementById("container"));
        expect(cmp).toExist();

        const cmpDom = ReactDOM.findDOMNode(cmp);
        expect(cmpDom).toExist();

        expect(cmpDom.childNodes.length).toBe(1);
        expect(cmpDom.childNodes.item(0).id).toBe("p-id");
    });

});
