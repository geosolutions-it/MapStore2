/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import JSZip from 'jszip';
import { Provider } from 'react-redux';
import expect from 'expect';
import MockAdapter from 'axios-mock-adapter';

import axios from '../../../libs/ajax';
import ExtensionsManager from '../ExtensionsManager';
import contextcreator from '../../../reducers/contextcreator';
import { getPluginForTest } from '../../__tests__/pluginsTestUtils';
import { MANAGER_TOOL_NAME } from '../constants';
import { SHOW_RESULT } from '../actions/extensionsManager';
import { LOAD_EXTENSIONS, PLUGIN_UNINSTALLED } from '../../../actions/contextcreator';

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
    // the application store has the context creator reducer, which handles the uninstall too
    const { containers, store, actions } = getPluginForTest(ExtensionsManager, {}, { ManagerPlugin: {} }, [], { contextcreator });
    const Tool = containers.Manager.Component;
    ReactDOM.render(<Provider store={store}><Tool active /></Provider>, document.getElementById('container'));
    return { containers, store, actions };
};

const zipOf = (plugin, name) => {
    const zip = new JSZip();
    zip.file('index.js', 'window.Extension = {};');
    zip.file('index.json', JSON.stringify({ plugins: [plugin] }));
    return zip.generateAsync({ type: 'blob' }).then(blob => new File([blob], name));
};

const dropFiles = files => ReactTestUtils.Simulate.change(document.querySelector('.modal .dropzone input[type=file]'), { target: { files } });

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
    it('installs a new extension, loads it in the application and shows it in the list', (done) => {
        let catalog = CATALOG;
        mockAxios.onGet(CATALOG_URL).reply(() => [200, catalog]);
        mockAxios.onPost('rest/config/uploadPlugin').reply(() => {
            catalog = { plugins: [...CATALOG.plugins, { name: 'Statistics', title: 'Statistics', version: '2.0.0', extension: true }] };
            return [200, { name: 'Statistics', extension: true }];
        });
        const { actions } = renderTool();
        waitFor(() => expect(document.querySelectorAll('.ms-extension-title').length).toBe(2), () => {
            ReactTestUtils.Simulate.click(document.querySelector('.ms-extensions-install'));
            zipOf({ name: 'Statistics', version: '2.0.0' }, 'statistics.zip').then(file => {
                dropFiles([file]);
                waitFor(() => {
                    expect([...document.querySelectorAll('.uploading-file .plugin-name')].map(node => node.textContent)).toEqual(['Statistics']);
                    expect(document.querySelectorAll('.upload-warning').length).toBe(0);
                }, () => {
                    ReactTestUtils.Simulate.click([...document.querySelectorAll('.modal-footer button')].find(button => button.textContent === 'contextCreator.configurePlugins.install'));
                    waitFor(() => {
                        expect(mockAxios.history.post.length).toBe(1);
                        expect(document.querySelector('.modal')).toNotExist();
                        expect([...document.querySelectorAll('.ms-extension-title')].map(node => node.textContent)).toEqual(['Privacy settings', 'Sample', 'Statistics']);
                        expect(actions.map(action => action.type)).toEqual([SHOW_RESULT, LOAD_EXTENSIONS, SHOW_RESULT]);
                        expect(actions[0].result).toBe(null);
                        expect(actions[2].result).toEqual({ msgId: 'extensionsManager.installedMessage' });
                        expect(document.querySelector('.ms-extensions-result').textContent).toContain('extensionsManager.installedMessage');
                    }, done);
                });
            }).catch(done);
        });
    });
    it('marks a zip of an installed extension as a replacement, and asks to reload the page after the update', (done) => {
        mockAxios.onGet(CATALOG_URL).reply(200, CATALOG);
        mockAxios.onPost('rest/config/uploadPlugin').reply(200, { name: 'PrivacySettings', extension: true });
        const { actions } = renderTool();
        waitFor(() => expect(document.querySelectorAll('.ms-extension-title').length).toBe(2), () => {
            ReactTestUtils.Simulate.click(document.querySelector('.ms-extensions-install'));
            zipOf({ name: 'PrivacySettings', version: '1.1.0' }, 'privacy.zip').then(file => {
                dropFiles([file]);
                waitFor(() => expect(document.querySelector('.upload-warning').textContent).toBe('extensionsManager.replacesVersion'), () => {
                    ReactTestUtils.Simulate.click([...document.querySelectorAll('.modal-footer button')].find(button => button.textContent === 'contextCreator.configurePlugins.install'));
                    waitFor(() => {
                        expect(actions.map(action => action.type)).toEqual([SHOW_RESULT, LOAD_EXTENSIONS, SHOW_RESULT]);
                        expect(actions[2].result).toEqual({ msgId: 'extensionsManager.updatedMessage' });
                        expect(document.querySelector('.ms-extensions-result').textContent).toContain('extensionsManager.updatedMessage');
                    }, done);
                });
            }).catch(done);
        });
    });
    it('keeps the dialog open with the error when the upload fails', (done) => {
        mockAxios.onGet(CATALOG_URL).reply(200, CATALOG);
        mockAxios.onPost('rest/config/uploadPlugin').reply(500, 'denied');
        const { actions } = renderTool();
        waitFor(() => expect(document.querySelectorAll('.ms-extension-title').length).toBe(2), () => {
            ReactTestUtils.Simulate.click(document.querySelector('.ms-extensions-install'));
            zipOf({ name: 'Statistics' }, 'statistics.zip').then(file => {
                dropFiles([file]);
                waitFor(() => expect(document.querySelectorAll('.uploading-file').length).toBe(1), () => {
                    ReactTestUtils.Simulate.click([...document.querySelectorAll('.modal-footer button')].find(button => button.textContent === 'contextCreator.configurePlugins.install'));
                    waitFor(() => {
                        expect(document.querySelector('.modal .alert-danger')).toExist();
                        expect(document.querySelector('.ms-extensions-result')).toNotExist();
                        expect(actions.map(action => action.type)).toEqual([SHOW_RESULT]);
                        expect(actions[0].result).toBe(null);
                    }, done);
                });
            }).catch(done);
        });
    });
    describe('uninstall', () => {
        const confirmButton = () => [...document.querySelectorAll('.modal button')].find(button => button.textContent.trim() === 'extensionsManager.uninstall');
        const cancelButton = () => [...document.querySelectorAll('.modal button')].find(button => button.textContent.trim() === 'extensionsManager.cancel');
        const openUninstall = (index, done, next) => waitFor(() => expect(document.querySelectorAll('.ms-extension-uninstall').length).toBe(2), () => {
            ReactTestUtils.Simulate.click(document.querySelectorAll('.ms-extension-uninstall')[index]);
            next();
        });
        it('removes the confirmed extension from the server, the application and the list', (done) => {
            let catalog = CATALOG;
            mockAxios.onGet(CATALOG_URL).reply(() => [200, catalog]);
            mockAxios.onDelete('rest/config/uninstallPlugin/PrivacySettings').reply(() => {
                catalog = { plugins: CATALOG.plugins.filter(plugin => plugin.name !== 'PrivacySettings') };
                return [200, { bundle: 'PrivacySettings/index.js', translations: 'PrivacySettings/translations' }];
            });
            const { actions } = renderTool();
            openUninstall(0, done, () => {
                expect(document.querySelector('.modal').textContent).toContain('extensionsManager.uninstallDescription');
                ReactTestUtils.Simulate.click(confirmButton());
                waitFor(() => {
                    expect(mockAxios.history.delete.length).toBe(1);
                    expect(actions.map(action => action.type)).toEqual([SHOW_RESULT, PLUGIN_UNINSTALLED, SHOW_RESULT]);
                    expect(actions[1].plugin).toBe('PrivacySettings');
                    expect(actions[1].cfg).toEqual({ bundle: 'PrivacySettings/index.js', translations: 'PrivacySettings/translations' });
                    expect(actions[2].result).toEqual({ msgId: 'extensionsManager.uninstalledMessage', params: { title: 'Privacy settings' } });
                    expect(document.querySelector('.ms-extensions-result').textContent).toContain('extensionsManager.uninstalledMessage');
                    expect(document.querySelector('.modal')).toNotExist();
                    expect([...document.querySelectorAll('.ms-extension-title')].map(node => node.textContent)).toEqual(['Sample']);
                }, done);
            });
        });
        it('does nothing when the uninstall is cancelled', (done) => {
            mockAxios.onGet(CATALOG_URL).reply(200, CATALOG);
            const { actions } = renderTool();
            openUninstall(1, done, () => {
                ReactTestUtils.Simulate.click(cancelButton());
                waitFor(() => {
                    expect(document.querySelector('.modal')).toNotExist();
                    expect(mockAxios.history.delete.length).toBe(0);
                    expect(actions.map(action => action.type)).toEqual([SHOW_RESULT]);
                    expect(document.querySelectorAll('.ms-extension-title').length).toBe(2);
                }, done);
            });
        });
        it('keeps the dialog open with the error when the uninstall fails', (done) => {
            mockAxios.onGet(CATALOG_URL).reply(200, CATALOG);
            mockAxios.onDelete('rest/config/uninstallPlugin/Sample').reply(500);
            const { actions } = renderTool();
            openUninstall(1, done, () => {
                ReactTestUtils.Simulate.click(confirmButton());
                waitFor(() => {
                    expect(document.querySelector('.modal .alert-danger').textContent).toBe('extensionsManager.uninstallError');
                    expect(actions.map(action => action.type)).toEqual([SHOW_RESULT]);
                    expect(document.querySelectorAll('.ms-extension-title').length).toBe(2);
                }, done);
            });
        });
    });
});
