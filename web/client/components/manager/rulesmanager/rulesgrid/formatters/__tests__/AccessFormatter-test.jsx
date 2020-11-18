/**
  * Copyright 2018, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */
import React from 'react';

import ReactDOM from 'react-dom';
import AccessFormatter from '../AccessFormatter';
import expect from 'expect';

describe('Test AccessFormatter component', () => {
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
        ReactDOM.render(<AccessFormatter/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-deny-cell');
        expect(el).toExist();
    });
    it('render with ALLOW', () => {
        ReactDOM.render(<AccessFormatter value={"ALLOW"}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-allow-cell');
        expect(el).toExist();
    });
});
