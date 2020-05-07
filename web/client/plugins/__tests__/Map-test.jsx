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

import MapPlugin from '../Map';
import { getPluginForTest } from './pluginsTestUtils';

import { INIT_MAP } from '../../actions/map';
import { RESET_CONTROLS } from '../../actions/controls';
import MapUtils from '../../utils/MapUtils';

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
        MapUtils.clearHooks();
    });

    it('creates a Map plugin with default configuration (leaflet)', () => {
        const { Plugin } = getPluginForTest(MapPlugin, {map});
        ReactDOM.render(<Plugin />, document.getElementById("container"));
        expect(document.getElementById('map')).toExist();
        expect(document.getElementsByClassName('leaflet-container').length).toBe(1);
    });

    it('creates a Map plugin with specified mapType configuration (openlayers)', () => {
        const { Plugin } = getPluginForTest(MapPlugin, { map, maptype: {
            mapType: 'openlayers'
        } });
        ReactDOM.render(<Plugin pluginCfg={{ shouldLoadFont: false }} />, document.getElementById("container"));
        expect(document.getElementById('map')).toExist();
        expect(document.getElementsByClassName('ol-viewport').length).toBe(1);
    });

    it('resetOnMapInit epic is activated by INIT_MAP action', () => {
        const { Plugin, store, actions } = getPluginForTest(MapPlugin, { map });
        ReactDOM.render(<Plugin/>, document.getElementById("container"));
        store.dispatch({
            type: INIT_MAP
        });
        expect(actions.filter(action => action.type === RESET_CONTROLS).length).toBe(1);
    });
});
