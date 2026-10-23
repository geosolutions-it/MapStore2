/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import expect from 'expect';
import MockAdapter from 'axios-mock-adapter';

import axios from '../../../libs/ajax';
import ExtensionsManager from '../ExtensionsManager';
import { getPluginForTest } from '../../__tests__/pluginsTestUtils';
import { MANAGER_TOOL_NAME } from '../constants';

const CATALOG_URL = 'configs/pluginsConfig.json';
const CATALOG = {
    plugins: [
        { name: 'Map', title: 'Map' },
        { name: 'PrivacySettings', title: 'Privacy settings', description: 'Policy pages', version: '1.0.0', hidden: true, extension: true },
        { name: 'Sample', extension: true }
    ]
};

const waitFor = (check, done, attempts = 50) => {
    try {
        check();
        done();
    } catch (e) {
        if (attempts <= 0) {
            done(e);
            return;
        }
        setTimeout(() => waitFor(check, done, attempts - 1), 20);
    }
};

const renderTool = () => {
    const { containers, store } = getPluginForTest(ExtensionsManager, {}, { ManagerPlugin: {} });
    const Tool = containers.Manager.Component;
    ReactDOM.render(<Provider store={store}><Tool active /></Provider>, document.getElementById('container'));
    return { containers, store };
};

describe('ExtensionsManager plugin', () => {
    let mockAxios;
    beforeEach((done) => {
        mockAxios = new MockAdapter(axios);
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        mockAxios.restore();
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('adds a tab to the manager', () => {
        const { containers } = getPluginForTest(ExtensionsManager, {}, { ManagerPlugin: {} });
        expect(containers.Manager.name).toBe(MANAGER_TOOL_NAME);
        expect(containers.Manager.glyph).toBe('plug');
    });
    it('lists only the extensions of the plugins catalog', (done) => {
        mockAxios.onGet(CATALOG_URL).reply(200, CATALOG);
        renderTool();
        waitFor(() => {
            const titles = [...document.querySelectorAll('.ms-extension-title')].map(node => node.textContent);
            expect(titles).toEqual(['Privacy settings', 'Sample']);
            expect([...document.querySelectorAll('.ms-extension-version')].map(node => node.textContent)).toEqual(['1.0.0', '']);
        }, done);
    });
    it('shows an error when the catalog cannot be loaded', (done) => {
        mockAxios.onGet(CATALOG_URL).reply(500);
        renderTool();
        waitFor(() => {
            expect(document.querySelector('.alert-danger')).toExist();
            expect(document.querySelectorAll('.ms-extensions-list-entry').length).toBe(0);
        }, done);
    });
});
