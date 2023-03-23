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
import MetadataExplorerPlugin from '../MetadataExplorer';
import { getPluginForTest } from './pluginsTestUtils';

describe('MetadataExplorer Plugin', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="container"></div>';
    });

    afterEach(() => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
    });

    it('creates a MetadataExplorerPlugin plugin with default configuration', () => {
        const {Plugin} = getPluginForTest(MetadataExplorerPlugin, {});
        ReactDOM.render(<Plugin/>, document.getElementById("container"));
        expect(document.getElementById('catalog-root')).toBeTruthy();
    });
    it('test MetadataExplorerPlugin plugin on unmount', () => {
        const {Plugin, actions} = getPluginForTest(MetadataExplorerPlugin, {});
        ReactDOM.render(<Plugin/>, document.getElementById("container"));

        ReactDOM.render(<div/>, document.getElementById("container"));
        expect(actions.length).toBe(4);
        expect(actions[0].type).toBe("CATALOG:CATALOG_CLOSE");
        expect(actions[1].type).toBe("SET_CONTROL_PROPERTIES");
        expect(actions[1].control).toBe("metadataexplorer");
        expect(actions[2].type).toBe("CATALOG:CHANGE_CATALOG_MODE");
        expect(actions[2].mode).toBe("view");
        expect(actions[3].type).toBe("CATALOG:RESET_CATALOG");
    });
});
