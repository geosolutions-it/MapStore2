/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');

const SettingsModal = require('../SettingsModal');
const expect = require('expect');

describe('TOC SettingsModal', () => {
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
        const cmp = ReactDOM.render(<SettingsModal element={{id: 'layer001'}} settings={{expanded: true}}/>, document.getElementById("container"));
        expect(cmp.state).toEqual({ initialState: { id: 'layer001' }, originalSettings: { id: 'layer001' }});
        const el = document.getElementById('mapstore-layer-settings');
        expect(el).toBeTruthy();
    });

    it('trigger retrieveLayerData in UNSAFE_componentWillReceiveProps', () => {
        const cmp = ReactDOM.render(<SettingsModal element={{id: 'layer001', capabilitiesLoading: true}} settings={{expanded: false}}/>, document.getElementById("container"));
        const cmp2 = ReactDOM.render(<SettingsModal element={{id: 'layer001', type: "wms", capabilitiesLoading: true}} settings={{expanded: true}}/>, document.getElementById("container"));
        const el = document.getElementById('mapstore-layer-settings');
        const textarea = document.getElementsByTagName('textarea')[0];
        expect(el).toBeTruthy();
        expect(cmp).toBeTruthy();
        expect(cmp2).toBeTruthy();
        expect(textarea).toBeFalsy();
        const cmp3 = ReactDOM.render(<SettingsModal element={{id: 'layer001', type: "wms", capabilitiesLoading: false, description: "description of layer"}} settings={{expanded: true}}/>, document.getElementById("container"));
        expect(cmp3).toBeTruthy();
        const textareaAfterLoading = document.getElementsByTagName('textarea')[0];
        expect(textareaAfterLoading).toBeTruthy();
        expect(textareaAfterLoading.value).toBe("description of layer");
    });
});
