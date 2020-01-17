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
import ConfigureMapTemplate from '../ConfigureMapTemplates';

describe('ConfigureMapTemplate component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('ConfigureMapTemplate with defaults', () => {
        ReactDOM.render(<ConfigureMapTemplate/>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.getElementsByClassName('configure-map-templates-transfer')[0]).toExist();
    });
});
