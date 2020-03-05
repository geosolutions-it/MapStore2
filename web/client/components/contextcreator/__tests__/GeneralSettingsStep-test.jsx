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
import ReactTestUtils from 'react-dom/test-utils';
import GeneralSettingsStep from '../GeneralSettingsStep';

describe('GeneralSettingsStep component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('GeneralSettingsStep rendering with defaults', () => {
        ReactDOM.render(<GeneralSettingsStep />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.getElementsByClassName('general-settings-step')).toExist();
    });
    it('accepts only letters, numbers, dashes, and underscores for the context name', () => {
        const actions = {
            onChange: () => {}
        };
        const spyonChange = expect.spyOn(actions, 'onChange');
        const container = document.getElementById('container');
        ReactDOM.render(<GeneralSettingsStep onChange={actions.onChange} />, container);
        const contextNameInput = container.querySelector('.general-settings-step .form-group input');
        contextNameInput.value = "_tes24 t-- 5*  __=+''...,";
        ReactTestUtils.Simulate.change(contextNameInput);
        expect(spyonChange.calls.length).toEqual(1);
        expect(spyonChange).toHaveBeenCalledWith("name", "_tes24t--5__");
    });
});

