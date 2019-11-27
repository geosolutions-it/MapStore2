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
import { WebPageCreator } from '../WebPageCreator';

describe('WebPageCreator', () => {
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
        ReactDOM.render(<WebPageCreator />, document.getElementById("container"));
        const el = document.querySelector('.modal-dialog');
        expect(el).toBe(null);
    });

    it('should render when show is true', () => {
        const props = { show: true };
        ReactDOM.render(<WebPageCreator {...props} />, document.getElementById("container"));
        const el = document.querySelector('.modal-dialog');
        expect(el).toExist();
    });
});
