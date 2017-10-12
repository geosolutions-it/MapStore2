/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');

const expect = require('expect');
const StepHeader = require('../StepHeader');
describe('StepHeader component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('StepHeader rendering', () => {
        ReactDOM.render(<StepHeader title="TITLE"/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.mapstore-step-title');
        expect(el).toExist();
    });
});
