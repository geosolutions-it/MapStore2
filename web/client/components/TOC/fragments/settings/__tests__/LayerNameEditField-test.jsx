/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';

import LayerNameEditField from '../LayerNameEditField';

describe('LayerNameEditField component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('LayerNameEditField with defaults', () => {
        ReactDOM.render(<LayerNameEditField/>, document.getElementById('container'));
        const input = document.getElementsByTagName('input');
        expect(input.length).toBe(1);
        expect(input[0].getAttribute('disabled')).toNotBe(null);
    });
});
