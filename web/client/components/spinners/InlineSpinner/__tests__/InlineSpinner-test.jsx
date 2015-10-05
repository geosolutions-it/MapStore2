/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');
var React = require('react/addons');

var InlineSpinner = require('../InlineSpinner');

describe('InlineSpinner', () => {
    afterEach((done) => {
        React.unmountComponentAtNode(document.body);
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test defaults', () => {
        const spinner = React.render(<InlineSpinner />, document.body);
        expect(spinner).toExist();

        const domNode = React.findDOMNode(spinner);
        expect(domNode).toExist();

        expect(domNode.style.display).toBe('none');
    });

    it('test loading animation', () => {
        const spinner = React.render(<InlineSpinner loading/>, document.body);
        expect(spinner).toExist();

        const domNode = React.findDOMNode(spinner);
        expect(domNode).toExist();

        expect(domNode.style.display).toBe('inline-block');
    });

});
