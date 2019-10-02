/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');
const expect = require('expect');

const WorkspacesFilter = require('../WorkspacesFilter');
const {Provider} = require('react-redux');

describe('WorkspacesFilter', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('Load Workspaces', () => {
        const store = {
            getState: () => ({
                maptype: {
                    mapType: 'sink'
                }
            }),
            subscribe: () => { }
        };
        ReactDOM.render(<Provider store={store}><WorkspacesFilter /></Provider>, document.getElementById("container"));
        const container = document.getElementById('container');
        const input = container.querySelector('input');
        expect(input).toExist();
    });
});
