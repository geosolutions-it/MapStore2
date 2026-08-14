/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import MapViewsSupport from '../MapViewsSupport';
import expect from 'expect';
import { waitFor } from '@testing-library/react';

describe('MapViewsSupport component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should render with default', () => {
        ReactDOM.render(<MapViewsSupport />, document.getElementById("container"));
        const mapViewsNode = document.querySelector('.ms-map-views');
        expect(mapViewsNode).toBeFalsy();
    });
    it('should show the view tools in view mode', (done) => {
        ReactDOM.render(<MapViewsSupport
            mapType="cesium"
            // mock cesium map
            map={{
                camera: {
                    position: {},
                    setView: () => {},
                    cancelFlight: () => {}
                },
                scene: {
                    primitives: {
                        add: () => {}
                    },
                    globe: {
                        translucency: {}
                    },
                    requestRender: () => {}
                }
            }}
            selectedId="view.1"
            views={[{
                center: {
                    longitude: 8.936900,
                    latitude: 44.395224,
                    height: 0
                },
                cameraPosition: {
                    longitude: 8.939256,
                    latitude: 44.386982,
                    height: 655
                },
                id: 'view.1',
                title: 'Map view',
                description: 'Map view',
                duration: 10,
                flyTo: true,
                zoom: 16,
                bbox: [
                    8.920925,
                    44.390840,
                    8.948118,
                    44.405544
                ]
            }]}
        />, document.getElementById("container"));
        waitFor(() => expect(document.querySelector('.ms-map-views')).toBeTruthy())
            .then(() => {
                const buttons = [...document.querySelectorAll('button > .glyphicon')];
                expect(buttons.length).toBe(7);
                expect(buttons.map(button => button.getAttribute('class').replace('glyphicon glyphicon-', ''))).toEqual([
                    'chevron-down',
                    'list',
                    'fast-backward',
                    'step-backward',
                    'play',
                    'step-forward',
                    'fast-forward'
                ]);
                done();
            })
            .catch(done);
    });
    it('should show the view tools in edit mode', (done) => {
        ReactDOM.render(<MapViewsSupport
            mapType="cesium"
            selectedId="view.1"
            // mock cesium map
            map={{
                camera: {
                    position: {},
                    setView: () => {},
                    cancelFlight: () => {}
                },
                scene: {
                    primitives: {
                        add: () => {}
                    },
                    globe: {
                        translucency: {}
                    },
                    requestRender: () => {}
                }
            }}
            edit
            views={[{
                center: {
                    longitude: 8.936900,
                    latitude: 44.395224,
                    height: 0
                },
                cameraPosition: {
                    longitude: 8.939256,
                    latitude: 44.386982,
                    height: 655
                },
                id: 'view.1',
                title: 'Map view',
                description: 'Map view',
                duration: 10,
                flyTo: true,
                zoom: 16,
                bbox: [
                    8.920925,
                    44.390840,
                    8.948118,
                    44.405544
                ]
            }]}
        />, document.getElementById("container"));
        waitFor(() => expect(document.querySelector('.ms-map-views')).toBeTruthy())
            .then(() => {
                const buttons = [...document.querySelectorAll('button > .glyphicon')];
                expect(buttons.length).toBe(12);
                expect(buttons.map(button => button.getAttribute('class').replace('glyphicon glyphicon-', ''))).toEqual([
                    'chevron-down',
                    'list',
                    'plus',
                    'duplicate',
                    'pencil',
                    'undo',
                    'redo',
                    'fast-backward',
                    'step-backward',
                    'play',
                    'step-forward',
                    'fast-forward'
                ]);
                done();
            })
            .catch(done);
    });
    it('should show the view tools in edit mode with 0 views', (done) => {
        ReactDOM.render(<MapViewsSupport
            mapType="cesium"
            // mock cesium map
            map={{
                camera: {
                    position: {},
                    setView: () => {},
                    cancelFlight: () => {}
                },
                scene: {
                    primitives: {
                        add: () => {}
                    },
                    globe: {
                        translucency: {}
                    },
                    requestRender: () => {}
                }
            }}
            edit
            views={[]}
        />, document.getElementById("container"));
        waitFor(() => expect(document.querySelector('.ms-map-views')).toBeTruthy())
            .then(() => {
                const buttons = [...document.querySelectorAll('button > .glyphicon')];
                expect(buttons.length).toBe(1);
                expect(buttons.map(button => button.getAttribute('class').replace('glyphicon glyphicon-', ''))).toEqual([
                    'plus'
                ]);
                done();
            })
            .catch(done);
    });

    // ── Security regression: DOMPurify.sanitize on map view description (SM-15 / X-10) ──
    it('sanitizes <script> in selected view description', () => {
        window.__xss_mvs = undefined;
        const evilDescription = '<p>ok</p><script>window.__xss_mvs=true</script>';
        // Render a MapViewsSupport with a selected view carrying a malicious description
        ReactDOM.render(
            <MapViewsSupport
                mapType="cesium"
                showDescription
                map={{ camera: { position: {}, setView: () => {}, cancelFlight: () => {} } }}
                views={[{ id: 'v1', title: 't', description: evilDescription }]}
                selectedId="v1"
            />,
            document.getElementById('container')
        );
        expect(window.__xss_mvs).toBe(undefined);
        expect(document.body.innerHTML.indexOf('<script')).toBe(-1);
    });
});
