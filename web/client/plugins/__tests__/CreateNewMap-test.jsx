/**
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';

import CreateNewMapPlugin from '../CreateNewMap';
import { getPluginForTest } from './pluginsTestUtils';
import security from "../../reducers/security";

describe('CreateNewMap Plugin', () => {

    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('creates CreateNewMap plugin with default configuration for anonymous visitor', () => {
        const initialState = {
            security: {
                user: null
            }
        };
        const { Plugin } = getPluginForTest({...CreateNewMapPlugin, reducers: {
            ...CreateNewMapPlugin.reducers,
            security
        }}, initialState );
        ReactDOM.render(<Plugin />, document.getElementById("container"));
        const wrapper = document.getElementsByClassName("create-new-map-container")[0];
        const container = wrapper.getElementsByClassName("container")[0];
        const buttons = wrapper.getElementsByClassName("btn");
        expect(container.style.display).toBe('none');
        expect(buttons.length).toBe(4);
    });
    it('creates CreateNewMap plugin with default configuration for logged-in used', () => {
        const initialState = {
            security: {
                user: {
                    role: "USER",
                    name: "user",
                    enabled: true
                }
            }
        };
        const { Plugin } = getPluginForTest({...CreateNewMapPlugin, reducers: {
            ...CreateNewMapPlugin.reducers,
            security
        }}, initialState );
        ReactDOM.render(<Plugin />, document.getElementById("container"));
        const wrapper = document.getElementsByClassName("create-new-map-container")[0];
        const container = wrapper.getElementsByClassName("container")[0];
        const buttons = wrapper.getElementsByClassName("btn");
        expect(container.style.display).toNotBe('none');
        expect(buttons.length).toBe(4);
    });
});
