/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';

import Metadata from '../Metadata';

describe('Metadata component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('Metadata rendering with defaults', () => {
        ReactDOM.render(<Metadata map={{}} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelectorAll('input');
        expect(el.length).toBe(2);
    });
    it('Metadata rendering with meta-data', () => {
        const resource = {
            lastUpdate: new Date(),
            metadata: {
                name: "NAME",
                description: "DESCRIPTION"
            }
        };
        ReactDOM.render(<Metadata map={resource}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelectorAll('input');
        expect(el.length).toBe(2);
        expect(el[0].value).toBe("NAME");
        expect(el[1].value).toBe("DESCRIPTION");
    });
});
