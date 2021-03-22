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

import MapTemplatesPanel from '../MapTemplatesPanel';

describe('MapTemplatesPanel component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('MapTemplatesPanel rendering with defaults', () => {
        ReactDOM.render(<MapTemplatesPanel />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.getElementsByClassName('map-templates-panel')[0]).toExist();
    });
    it('MapTemplatesPanel with template with format', () => {
        const template = {
            id: 1,
            format: 'wmc'
        };

        ReactDOM.render(<MapTemplatesPanel templates={[template]}/>, document.getElementById("container"));
        const sideCards = document.getElementsByClassName('mapstore-side-card');
        expect(sideCards.length).toBe(1);
        const formatIcon = document.getElementsByClassName('glyphicon-ext-wmc')[0];
        expect(formatIcon).toExist();
    });
});
