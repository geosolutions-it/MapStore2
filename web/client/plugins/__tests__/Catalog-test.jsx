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
import TestUtils from 'react-dom/test-utils';
import CatalogPlugin from '../Catalog';
import { getPluginForTest } from './pluginsTestUtils';
import { setControlProperty } from '../../actions/controls';
import { catalogClose } from '../../actions/catalog';

const ACTIVE_CATALOG_STATE = {
    controls: {
        metadataexplorer: {
            enabled: true
        }
    }
};

const expectDialogView = () => {
    expect(document.querySelector('.ms-catalog-grid-wrapper')).toBeTruthy();
    expect(document.querySelector('.ms-catalog.grid')).toBeTruthy();
    expect(document.querySelector('.ms-catalog-panel')).toBeFalsy();
};

const expectPanelView = () => {
    expect(document.querySelector('.ms-catalog-panel')).toBeTruthy();
    expect(document.querySelector('.ms-catalog.list')).toBeTruthy();
    expect(document.querySelector('.ms-catalog-grid-wrapper')).toBeFalsy();
};

const openCatalog = (store) => store.dispatch(setControlProperty('metadataexplorer', 'enabled', true));
const closeCatalog = (store) => store.dispatch(catalogClose());
const waitForUpdates = (callback) => setTimeout(callback, 0);

describe('Catalog Plugin', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="container"></div>';
    });

    afterEach(() => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
    });

    it('creates a CatalogPlugin plugin with default configuration', () => {
        const {Plugin} = getPluginForTest(CatalogPlugin, {});
        ReactDOM.render(<Plugin/>, document.getElementById("container"));
        expect(document.getElementById('container')).toBeTruthy();
        expect(document.querySelector('.ms-catalog-wrapper')).toBeFalsy();
    });
    it('test CatalogPlugin plugin on mount', (done) => {
        const {Plugin, actions} = getPluginForTest(CatalogPlugin, {});
        ReactDOM.render(<Plugin/>, document.getElementById("container"));

        setTimeout(() => {
            expect(actions.length).toBeTruthy();
            expect(actions.map(a => a.type).includes("CATALOG:INIT_PLUGIN")).toBeTruthy();
            done();
        }, 0);
    });
    it('test CatalogPlugin plugin on unmount', (done) => {
        const {Plugin, actions} = getPluginForTest(CatalogPlugin, {});
        ReactDOM.render(<Plugin/>, document.getElementById("container"));

        setTimeout(() => {
            ReactDOM.render(<div/>, document.getElementById("container"));
            expect(actions.length).toBeTruthy();
            expect(actions.map(a => a.type).includes("CATALOG:CATALOG_CLOSE")).toBeTruthy();
            done();
        }, 0);
    });
    it('renders in dialog mode when configured as default view', (done) => {
        const {Plugin, store} = getPluginForTest(CatalogPlugin, ACTIVE_CATALOG_STATE);
        ReactDOM.render(<Plugin defaultView="dialog" />, document.getElementById("container"));

        waitForUpdates(() => {
            try {
                expectDialogView();
                expect(store.getState().controls.metadataexplorer.panel).toBe(false);
            } catch (e) {
                done(e);
                return;
            }
            done();
        });
    });
    it('keeps default dialog mode after close and reopen when view button is untouched', (done) => {
        const {Plugin, store} = getPluginForTest(CatalogPlugin, ACTIVE_CATALOG_STATE);
        ReactDOM.render(<Plugin defaultView="dialog" />, document.getElementById("container"));

        waitForUpdates(() => {
            try {
                expectDialogView();
                closeCatalog(store);
            } catch (e) {
                done(e);
                return;
            }
            waitForUpdates(() => {
                try {
                    expect(document.querySelector('.ms-catalog')).toBeFalsy();
                    openCatalog(store);
                } catch (e) {
                    done(e);
                    return;
                }
                waitForUpdates(() => {
                    try {
                        expectDialogView();
                        expect(store.getState().controls.metadataexplorer.panel).toBe(false);
                    } catch (e) {
                        done(e);
                        return;
                    }
                    done();
                });
            });
        });
    });
    it('keeps user selected panel mode after close and reopen', (done) => {
        const {Plugin, store} = getPluginForTest(CatalogPlugin, ACTIVE_CATALOG_STATE);
        ReactDOM.render(<Plugin defaultView="dialog" />, document.getElementById("container"));

        waitForUpdates(() => {
            try {
                expectDialogView();
                const toggleButton = document.querySelector('.glyphicon-minus').parentNode;
                TestUtils.Simulate.click(toggleButton);
            } catch (e) {
                done(e);
                return;
            }
            waitForUpdates(() => {
                try {
                    expectPanelView();
                    closeCatalog(store);
                } catch (e) {
                    done(e);
                    return;
                }
                waitForUpdates(() => {
                    try {
                        expect(document.querySelector('.ms-catalog')).toBeFalsy();
                        openCatalog(store);
                    } catch (e) {
                        done(e);
                        return;
                    }
                    waitForUpdates(() => {
                        try {
                            expectPanelView();
                            expect(store.getState().controls.metadataexplorer.panel).toBe(true);
                        } catch (e) {
                            done(e);
                            return;
                        }
                        done();
                    });
                });
            });
        });
    });
});
