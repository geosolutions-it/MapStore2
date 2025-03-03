/**
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

import expect from 'expect';

import React from 'react';
import ReactDOM from 'react-dom';
import tooltip from '../tooltip';
import { Button } from 'react-bootstrap';

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
        expect(el).toBeTruthy();
    });
    it('creates component with tooltip props', () => {
        const CMP = tooltip(Button);
        ReactDOM.render(<CMP tooltipShowDelay={0} tooltip={<div>Hello</div>} tooltipTrigger={['click', 'focus', 'hover']} id="text-cmp">TEXT</CMP>, document.getElementById("container"));
        const el = document.getElementById("text-cmp");
        expect(el).toBeTruthy();
        el.click();
        expect(el.getAttribute('aria-describedby')).toBeTruthy();
    });

    it('creates component with tooltip show delay', (done) => {
        const CMP = tooltip(Button);
        const tooltipShowDelay = 50;
        ReactDOM.render(<CMP tooltipShowDelay={tooltipShowDelay} tooltip={<div>Hello</div>} tooltipTrigger={['click', 'focus', 'hover']} id="text-cmp">TEXT</CMP>, document.getElementById("container"));
        let el = document.getElementById("text-cmp");
        expect(el).toBeTruthy();
        setTimeout(() => {
            el = document.getElementById("text-cmp");
            el.click();
            expect(el.getAttribute('aria-describedby')).toBeTruthy();
            done();
        }, tooltipShowDelay + 5);
    });
});
