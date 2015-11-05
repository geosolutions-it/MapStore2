/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react/addons');
var GlobalSpinner = require('../GlobalSpinner');
var expect = require('expect');

describe('test the globalspinner component', () => {
    afterEach((done) => {
        React.unmountComponentAtNode(document.body);
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('creates the component with defaults', () => {
        const globalspinner = React.render(<GlobalSpinner/>, document.body);
        expect(globalspinner).toExist();
        const globalspinnerDiv = React.findDOMNode(globalspinner);
        expect(globalspinnerDiv).toNotExist();
    });

    it('creates the component with layers loading and spinner to show', () => {
        const globalspinner = React.render(<GlobalSpinner id="globalspinner" loading
            spinnersInfo={{globalspinner: true}}/>, document.body);
        expect(globalspinner).toExist();
        const globalspinnerDiv = React.findDOMNode(globalspinner);
        expect(globalspinnerDiv).toExist();
    });

    it('creates the component with layers load', () => {
        const globalspinner = React.render(<GlobalSpinner loading={false}/>, document.body);
        expect(globalspinner).toExist();
        const globalspinnerDiv = React.findDOMNode(globalspinner);
        expect(globalspinnerDiv).toNotExist();
    });
});
