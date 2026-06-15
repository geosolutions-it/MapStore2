
/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import ALink from '../ALink';

describe('ALink component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should not render with default', () => {
        ReactDOM.render(<ALink />, document.getElementById('container'));
        const container = document.getElementById('container');
        expect(container.children.length).toBe(0);
    });
    it('should apply the link (a) tag if href is provided', () => {
        ReactDOM.render(<ALink href="#" className="link"><span className="child"></span></ALink>, document.getElementById('container'));
        const container = document.getElementById('container');
        expect(container.children[0].getAttribute('class')).toBe('link');
    });
    it('should not apply the link (a) tag if href is not provided', () => {
        ReactDOM.render(<ALink className="link"><span className="child"></span></ALink>, document.getElementById('container'));
        const container = document.getElementById('container');
        expect(container.children[0].getAttribute('class')).toBe('child');
    });
    it('should not apply the link (a) tag if href is provided and readOnly is true', () => {
        ReactDOM.render(<ALink href="#" readOnly className="link"><span className="child"></span></ALink>, document.getElementById('container'));
        const container = document.getElementById('container');
        expect(container.children[0].getAttribute('class')).toBe('child');
    });
});
