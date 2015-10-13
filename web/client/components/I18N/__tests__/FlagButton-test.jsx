/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');

var React = require('react/addons');
var FlagButton = require('../FlagButton');

describe('FlagButton', () => {
    afterEach((done) => {
        React.unmountComponentAtNode(document.body);
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('checks default', () => {

        const cmp = React.render(<FlagButton/>, document.body);
        expect(cmp).toExist();

        const cmpDom = cmp.getDOMNode();
        expect(cmpDom).toExist();


    });
});
