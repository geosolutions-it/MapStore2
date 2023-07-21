/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import PermalinkPlugin from '../Permalink';
import { getPluginForTest } from './pluginsTestUtils';
import { Provider } from 'react-redux';

describe('PermalinkPlugin Plugin', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="container"></div>';
    });

    afterEach(() => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
    });

    it('test PermalinkPlugin with default configuration', () => {
        const { Plugin, containers } = getPluginForTest(PermalinkPlugin, {});
        ReactDOM.render(<Plugin />, document.getElementById("container"));
        expect(containers).toBeTruthy();
        expect(containers.Share.target).toBe("tabs");
        expect(containers.Share.title).toBeTruthy();
        expect(containers.Share.component).toBeTruthy();

        const store = { dispatch: () => {}, subscribe: () => {}, getState: () => ({}) };
        const Component = containers.Share.component;
        ReactDOM.render(<Provider store={store}><Component /></Provider>, document.getElementById("container"));
        expect(document.getElementById('permalink')).toBeTruthy();
    });
});

