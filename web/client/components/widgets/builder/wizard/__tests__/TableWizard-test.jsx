/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';

import TableWizard from '../TableWizard';
import { waitFor } from '@testing-library/react';

describe('TableWizard component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('TableWizard rendering with defaults', (done) => {
        ReactDOM.render(<TableWizard />, document.getElementById("container"));
        const container = document.getElementById('container');
        waitFor(() => container.querySelector('.chart-options-form'))
            .then(() => {
                const el = container.querySelector('.ms-wizard');
                expect(el).toExist();
                expect(container.querySelector('.chart-options-form')).toBeTruthy();
                done();
            });
    });
    it('TableWizard rendering options', () => {
        ReactDOM.render(<TableWizard step={1} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.widget-options-form');
        expect(el).toBeTruthy();
    });
});
