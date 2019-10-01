/**
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import {DragDropContext as dragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import TOCPlugin from '../TOC';
import { getPluginForTest } from './pluginsTestUtils';

const dndContext = dragDropContext(HTML5Backend);

describe('TOCPlugin Plugin', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('Shows TOCPlugin plugin', () => {
        const { Plugin } = getPluginForTest(TOCPlugin, {
            controls: {
                addgroup: {
                    enabled: true
                }
            }
        });
        const WrappedPlugin = dndContext(Plugin);
        ReactDOM.render(<WrappedPlugin />, document.getElementById("container"));
        expect(document.getElementsByClassName('mapstore-toc').length).toBe(1);
    });

    it('TOCPlugin shows annotations layer in openlayers mapType', () => {
        const { Plugin } = getPluginForTest(TOCPlugin, {
            layers: {
                groups: [{id: 'default', title: 'Default', nodes: ['annotations']}],
                flat: [{id: 'annotations', title: 'Annotations'}]
            },
            mapType: {
                mapType: 'openlayers'
            }
        });
        const WrappedPlugin = dndContext(Plugin);
        ReactDOM.render(<WrappedPlugin />, document.getElementById("container"));
        expect(document.querySelector('.toc-title').textContent).toBe('Annotations');
        expect(document.querySelector('.toc-group-title').textContent).toBe('Default');
        expect(document.querySelectorAll('.mapstore-filter.form-group').length).toBe(1);
    });

    it('TOCPlugin hides annotations layer and empty group in cesium mapType', () => {
        const { Plugin } = getPluginForTest(TOCPlugin, {
            layers: {
                groups: [{ id: 'default', title: 'Default', nodes: ['annotations'] }],
                flat: [{ id: 'annotations', title: 'Annotations' }]
            },
            maptype: {
                mapType: 'cesium'
            }
        });
        const WrappedPlugin = dndContext(Plugin);
        ReactDOM.render(<WrappedPlugin />, document.getElementById("container"));
        expect(document.querySelectorAll('.toc-title').length).toBe(0);
        expect(document.querySelectorAll('.toc-group-title').length).toBe(0);
    });

    it('TOCPlugin hides annotations layer but not its group if not empty in cesium mapType', () => {
        const { Plugin } = getPluginForTest(TOCPlugin, {
            layers: {
                groups: [{ id: 'default', title: 'Default', nodes: ['annotations', 'other'] }],
                flat: [{ id: 'annotations', title: 'Annotations' }, { id: 'other', title: 'Other'}]
            },
            maptype: {
                mapType: 'cesium'
            }
        });
        const WrappedPlugin = dndContext(Plugin);
        ReactDOM.render(<WrappedPlugin />, document.getElementById("container"));
        expect(document.querySelectorAll('.toc-title').length).toBe(1);
        expect(document.querySelectorAll('.toc-group-title').length).toBe(1);
    });
    it('TOCPlugin hides filter layer if no groups and no layers are present', () => {
        const { Plugin } = getPluginForTest(TOCPlugin, {
            layers: {
                groups: [{ id: 'default', title: 'Default', nodes: [] }],
                flat: []
            },
            maptype: {
                mapType: 'openlayers'
            }
        });
        const WrappedPlugin = dndContext(Plugin);
        ReactDOM.render(<WrappedPlugin />, document.getElementById("container"));
        expect(document.querySelectorAll('.mapstore-filter.form-group').length).toBe(0);
    });
    it('TOCPlugin hides filter layer if a group with no layers are present', () => {
        const { Plugin } = getPluginForTest(TOCPlugin, {
            layers: {
                groups: [],
                flat: []
            },
            maptype: {
                mapType: 'openlayers'
            }
        });
        const WrappedPlugin = dndContext(Plugin);
        ReactDOM.render(<WrappedPlugin />, document.getElementById("container"));
        expect(document.querySelectorAll('.mapstore-filter.form-group').length).toBe(0);
    });
});
