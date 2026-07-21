/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import interactionZoomToExtent from '../interactionZoomToExtent';
import { ZOOM_TO_EXTENT_HOOK } from '../../../../utils/MapUtils';

const MockComponent = () => <div id="mock-component" />;
const EnhancedComponent = interactionZoomToExtent(MockComponent);

describe('interactionZoomToExtent enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('triggers zoom hook when a map has zoomToRequest', () => {
        const container = document.getElementById('container');
        let hookCalled = false;
        let updateCalled = false;

        const hookRegister = {
            getHook: (hookName) => {
                if (hookName === ZOOM_TO_EXTENT_HOOK) {
                    return (extent, options) => {
                        hookCalled = true;
                        expect(extent).toEqual([1, 2, 3, 4]);
                        expect(options.crs).toBe('EPSG:4326');
                        expect(options.padding).toEqual([10, 10, 10, 10]);
                    };
                }
                return null;
            }
        };

        const updateProperty = (id, prop, value, mode) => {
            updateCalled = true;
            expect(id).toBe('widget-1');
            expect(prop).toBe('maps');
            expect(value.mapId).toBe('map-1');
            expect(value.zoomToRequest).toBeFalsy();
            expect(mode).toBe('merge');
        };

        const maps = [{
            mapId: 'map-1',
            zoomToRequest: {
                extent: [1, 2, 3, 4],
                crs: 'EPSG:4326',
                padding: [10, 10, 10, 10]
            }
        }];

        ReactDOM.render(
            <EnhancedComponent
                id="widget-1"
                maps={maps}
                hookRegister={hookRegister}
                updateProperty={updateProperty}
            />,
            container
        );

        expect(hookCalled).toBe(true);
        expect(updateCalled).toBe(true);
    });

    it('does nothing when no map has zoomToRequest', () => {
        const container = document.getElementById('container');
        let hookCalled = false;
        let updateCalled = false;

        const hookRegister = {
            getHook: (hookName) => {
                if (hookName === ZOOM_TO_EXTENT_HOOK) {
                    return () => { hookCalled = true; };
                }
                return null;
            }
        };

        const updateProperty = () => { updateCalled = true; };

        const maps = [{ mapId: 'map-1' }];

        ReactDOM.render(
            <EnhancedComponent
                id="widget-1"
                maps={maps}
                hookRegister={hookRegister}
                updateProperty={updateProperty}
            />,
            container
        );

        expect(hookCalled).toBe(false);
        expect(updateCalled).toBe(false);
    });
});
