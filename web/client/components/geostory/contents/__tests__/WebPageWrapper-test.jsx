/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactDOM from 'react-dom';

import expect from 'expect';
import { WebPageWrapper } from '../WebPageWrapper';

describe('WebPageWrapper', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('render with defaults', () => {
        ReactDOM.render(<WebPageWrapper />, document.getElementById("container"));
        const el = document.querySelector('.modal-dialog');
        expect(el).toBe(null);
    });

    it('should render when editURL is true', () => {
        const props = { editURL: true };
        ReactDOM.render(<WebPageWrapper {...props} />, document.getElementById("container"));
        const el = document.querySelector('.modal-dialog');
        expect(el).toExist();
    });
});
