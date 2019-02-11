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

import Plugin from '../Map';
import { getPluginForTest } from './pluginsTestUtils';

import { INIT_MAP } from '../../actions/map';
import { RESET_CONTROLS } from '../../actions/controls';

const map = {
    center: {
        x: 13.0,
        y: 43.0
    },
    zoom: 10
};

describe('Map Plugin', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('creates a Map plugin with default configuration (leaflet)', () => {
        const MapPlugin = getPluginForTest(Plugin, {map});
        ReactDOM.render(<MapPlugin.plugin />, document.getElementById("container"));
        expect(document.getElementById('map')).toExist();
        expect(document.getElementsByClassName('leaflet-container').length).toBe(1);
    });

    it('creates a Map plugin with specified mapType configuration (openlayers)', () => {
        const MapPlugin = getPluginForTest(Plugin, { map, maptype: {
            mapType: 'openlayers'
        } });
        ReactDOM.render(<MapPlugin.plugin pluginCfg={{ shouldLoadFont: false }} />, document.getElementById("container"));
        expect(document.getElementById('map')).toExist();
        expect(document.getElementsByClassName('ol-viewport').length).toBe(1);
    });

    it('resetOnMapInit epic is activated by INIT_MAP action', () => {
        const MapPlugin = getPluginForTest(Plugin, { map });
        ReactDOM.render(<MapPlugin.plugin/>, document.getElementById("container"));
        MapPlugin.store.dispatch({
            type: INIT_MAP
        });
        expect(MapPlugin.actions.filter(action => action.type === RESET_CONTROLS).length).toBe(1);
    });
});
