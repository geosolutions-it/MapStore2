/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');
var React = require('react/addons');
var ApplyTemplate = require('../ApplyTemplate');

describe('ApplyTemplate', () => {
    afterEach((done) => {
        React.unmountComponentAtNode(document.body);
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('test defaults', () => {
        const cmp = React.render(<ApplyTemplate />, document.body);
        expect(cmp).toExist();

        const cmpDom = React.findDOMNode(cmp);
        expect(cmpDom).toExist();

        expect(cmpDom.innerHTML).toBe("");
    });
    it('test child rendering', () => {
        const cmp = React.render(
            <ApplyTemplate data={{id: "p-id"}}>
                <p></p>
            </ApplyTemplate>, document.body);
        expect(cmp).toExist();

        const cmpDom = React.findDOMNode(cmp);
        expect(cmpDom).toExist();

        expect(cmpDom.childNodes.length).toBe(1);
        expect(cmpDom.childNodes.item(0).id).toBe("p-id");
    });

});
