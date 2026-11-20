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
import MockAdapter from 'axios-mock-adapter';
import CatalogPlugin from '../Catalog';
import { getPluginForTest } from './pluginsTestUtils';
import { setControlProperty } from '../../actions/controls';
import { catalogClose } from '../../actions/catalog';
import axios from '../../libs/ajax';

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

    describe('GeoNode map imports', () => {
        let mockAxios;
        beforeEach(() => {
            mockAxios = new MockAdapter(axios);
        });
        afterEach(() => {
            mockAxios.restore();
        });

        it('preserves layer order across sibling and nested groups, including empty groups', (done) => {
            const layer = (id, group) => ({ id, title: id, type: 'vector', group });
            const mapLayers = [
                layer('bottom', 'Default'),
                layer('lower', 'Default.lower'),
                layer('parent-bottom', 'Default.parent'),
                layer('nested', 'Default.parent.nested'),
                layer('parent-top', 'Default.parent'),
                layer('middle', 'Default'),
                layer('upper', 'Default.upper'),
                layer('top', 'Default')
            ];
            const record = { pk: 4134, title: 'Imported map', resource_type: 'map' };
            mockAxios.onGet('http://geonode.test/api/v2/maps/4134').reply(200, {
                map: {
                    ...record,
                    data: {
                        map: {
                            layers: mapLayers,
                            groups: [
                                { id: 'Default.lower', title: 'Lower' },
                                { id: 'Default.parent', title: 'Parent' },
                                { id: 'Default.parent.nested', title: 'Nested' },
                                { id: 'Default.upper', title: 'Upper' },
                                { id: 'Default.empty', title: 'Empty' }
                            ]
                        }
                    }
                }
            });
            const { Plugin, store } = getPluginForTest(CatalogPlugin, {
                ...ACTIVE_CATALOG_STATE,
                layers: {
                    flat: [layer('existing', 'Default')],
                    groups: [{ id: 'Default', title: 'Default', nodes: ['existing'] }]
                },
                catalog: {
                    services: { geonode: { type: 'geonode', title: 'GeoNode', url: 'http://geonode.test', autoload: false } },
                    selectedService: 'geonode',
                    result: { records: [record], numberOfRecordsMatched: 1 }
                }
            });
            ReactDOM.render(<Plugin zoomToLayer={false} />, document.getElementById('container'));

            waitForUpdates(() => {
                const addButton = document.querySelector('.ms-catalog-list .ms-resource-card-buttons .glyphicon-plus')?.closest('button');
                if (!addButton) {
                    done(new Error('Missing map import button'));
                    return;
                }
                TestUtils.Simulate.click(addButton);
                waitForUpdates(() => {
                    try {
                        const { flat, groups } = store.getState().layers;
                        expect(store.getState().catalog.layerError).toBeFalsy();
                        expect(flat.map(({ title }) => title)).toEqual(['existing', ...mapLayers.map(({ title }) => title)]);
                        const importedGroup = groups[0].nodes[0];
                        const getTitles = nodes => nodes.map(node => node.title || flat.find(({ id }) => id === node).title);
                        expect(importedGroup.title).toBe('Imported map');
                        expect(groups[0].nodes[1]).toBe('existing');
                        expect(getTitles(importedGroup.nodes)).toEqual(['top', 'Upper', 'middle', 'Parent', 'Lower', 'bottom', 'Empty']);
                        expect(getTitles(importedGroup.nodes[3].nodes)).toEqual(['parent-top', 'Nested', 'parent-bottom']);
                        expect(importedGroup.nodes[6].nodes).toEqual([]);
                        done();
                    } catch (error) {
                        done(error);
                    }
                });
            });
        });
    });
});
