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
import CatalogPlugin from '../Catalog';
import { getPluginForTest } from './pluginsTestUtils';

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
});
