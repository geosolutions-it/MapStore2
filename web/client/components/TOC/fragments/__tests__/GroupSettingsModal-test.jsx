/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');

const GroupSettingsModal = require('../GroupSettingsModal');
const expect = require('expect');

describe('TOC GroupSettingsModal', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('render component', () => {
        const cmp = ReactDOM.render(<GroupSettingsModal element={{id: 'group001'}} settings={{expanded: true}}/>, document.getElementById("container"));
        expect(cmp.state).toEqual({ initialState: { id: 'group001' }, originalSettings: { id: 'group001' }});
        const el = document.getElementById('mapstore-layer-groups-settings');
        expect(el).toExist();
    });
});
