/**
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

var expect = require('expect');
var React = require('react');
var ReactDOM = require('react-dom');
var tooltip = require('../tooltip');

const {Button} = require('react-bootstrap');
describe("tooltip enhancer", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('creates component with defaults', () => {
        const CMP = tooltip(({id}) => <div id={id} />);
        ReactDOM.render(<CMP id="text-cmp"/>, document.getElementById("container"));
        const el = document.getElementById("text-cmp");
        expect(el).toExist();
    });
    it('creates component with tooltip props', () => {
        const CMP = tooltip(Button);
        ReactDOM.render(<CMP tooltip={<div>Hello</div>} tooltipTrigger={['click', 'focus', 'hover']} id="text-cmp">TEXT</CMP>, document.getElementById("container"));
        const el = document.getElementById("text-cmp");
        expect(el).toExist();
        el.click();
        expect(el.getAttribute('aria-describedby')).toExist();
    });

});
