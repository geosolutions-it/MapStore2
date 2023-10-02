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
import { waitFor } from '@testing-library/react';

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

    it('creates a Map plugin with default configuration', (done) => {
        const { Plugin } = getPluginForTest(MapPlugin, {map});
        ReactDOM.render(<Plugin />, document.getElementById("container"));
        waitFor(() => expect(document.querySelector('.mapLoadingMessage')).toBeTruthy())
            .then(() => {
                done();
            })
            .catch(done);
    });

    it('creates a Map plugin with specified mapType configuration (openlayers)', (done) => {
        const { Plugin } = getPluginForTest(MapPlugin, { map, maptype: {
            mapType: 'openlayers'
        } });

        ReactDOM.render(<Plugin
            pluginCfg={{ shouldLoadFont: false }}
            onLoadingMapPlugins={(loading, mapType) => {
                if (!loading) {
                    try {
                        expect(mapType).toBe('openlayers');
                        expect(document.getElementById('map')).toExist();
                        expect(document.getElementsByClassName('ol-viewport').length).toBe(1);
                    } catch (e) {
                        done(e);
                    }
                    done();
                }
            }}
        />, document.getElementById("container"));
    });

    it('resetOnMapInit epic is activated by INIT_MAP action', () => {
        const { Plugin, store, actions } = getPluginForTest(MapPlugin, { map });
        ReactDOM.render(<Plugin/>, document.getElementById("container"));
        store.dispatch({
            type: INIT_MAP
        });
        expect(actions.filter(action => action.type === RESET_CONTROLS).length).toBe(1);
    });
    it('should always assign an id to static additional layers', (done) => {
        const { Plugin } = getPluginForTest(MapPlugin, { map });
        ReactDOM.render(<Plugin
            fonts={null}
            additionalLayers={[
                {
                    type: 'terrain',
                    provider: 'cesium',
                    url: 'url/to/terrain',
                    visibility: true
                }
            ]}
            pluginsCreator={() => Promise.resolve({
                Map: ({ children }) => <div className="map">{children}</div>,
                Layer: ({ options }) => <div id={options.id} className="layers">{options.type}</div>,
                Feature: () => null,
                tools: {
                    overview: () => null,
                    scalebar: () => null,
                    draw: () => null,
                    highlight: () => null,
                    selection: () => null,
                    popup: () => null,
                    box: () => null
                },
                mapType: 'openlayers'
            })}
        />, document.getElementById("container"));
        waitFor(() => expect(document.querySelector('.layers')).toBeTruthy())
            .then(() => {
                expect(document.querySelector('.layers').getAttribute('id')).toBe('additional-layers-0');
                done();
            })
            .catch(done);
    });
});
