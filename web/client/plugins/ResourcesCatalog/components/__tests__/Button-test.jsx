
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
import Button from '../Button';

describe('Button component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should render with default', () => {
        ReactDOM.render(<Button><span className="child" /></Button>, document.getElementById('container'));
        const button = document.querySelector('.btn');
        expect(button).toBeTruthy();
        expect(document.querySelector('.child')).toBeTruthy();
    });
    it('should apply custom classes based on props', () => {
        ReactDOM.render(<Button
            variant="primary"
            size="md"
            borderTransparent
        ><span className="child" /></Button>, document.getElementById('container'));
        const button = document.querySelector('.btn');
        expect(button).toBeTruthy();
        expect(button.getAttribute('class')).toBe(' _border-transparent btn btn-md btn-primary');
    });
    it('should render a square button', () => {
        ReactDOM.render(<Button square ><span className="child" /></Button>, document.getElementById('container'));
        const button = document.querySelector('.btn');
        expect(button).toBeTruthy();
        expect(button.getAttribute('class')).toBe('square-button-md btn btn-default');
    });
});
