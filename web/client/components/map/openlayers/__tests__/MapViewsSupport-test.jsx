/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import OpenLayersMap from '../Map';
import expect from 'expect';
import { act } from 'react-dom/test-utils';
import MapViewsSupport from '../MapViewsSupport';
import { ViewSettingsTypes } from '../../../../utils/MapViewsUtils';
import { clearHooks } from '../../../../utils/MapUtils';

describe('OpenLayers MapViewsSupport', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
        clearHooks();
    });
    it('should render with default values', () => {
        act(() => {
            ReactDOM.render(
                <OpenLayersMap
                    id="map"
                    center={{ y: 43.9, x: 10.3 }}
                    zoom={11}
                >
                    <MapViewsSupport />
                </OpenLayersMap>,
                document.getElementById('container'));
        });
        const viewer = document.querySelector('#map');
        expect(viewer).toBeTruthy();
    });
    it('should provide and apiRef prop', (done) => {
        act(() => {
            ReactDOM.render(
                <OpenLayersMap
                    id="map"
                    center={{ y: 43.9, x: 10.3 }}
                    zoom={11}
                >
                    <MapViewsSupport
                        apiRef={(api) => {
                            expect(api.options).toEqual({
                                settings: [
                                    ViewSettingsTypes.DESCRIPTION,
                                    ViewSettingsTypes.POSITION,
                                    ViewSettingsTypes.ANIMATION,
                                    ViewSettingsTypes.LAYERS_OPTIONS
                                ],
                                unsupportedLayers: ['3dtiles', 'terrain']
                            });
                            expect(api.getView).toBeTruthy();
                            expect(api.setView).toBeTruthy();
                            done();
                        }}
                    />
                </OpenLayersMap>,
                document.getElementById('container'));
        });
        const viewer = document.querySelector('#map');
        expect(viewer).toBeTruthy();
    });
});
