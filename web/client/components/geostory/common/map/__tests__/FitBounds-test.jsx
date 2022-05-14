/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import { act } from 'react-dom/test-utils';
import FitBounds from '../FitBounds';

describe('FitBounds', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should not crash if mapType is not supported', () => {
        act(() => {
            ReactDOM.render(<FitBounds />, document.getElementById("container"));
        });
        expect(document.getElementById("container").children.length).toBe(0);
    });

    it('should trigger fit function with openlayers mapType', (done) => {

        const map = {
            getView: () => {
                return {
                    getZoom: () => 7,
                    getProjection: () => {
                        return {
                            getCode: () => 'EPSG:3857'
                        };
                    },
                    fit: () => {
                        done();
                    }
                };
            }
        };

        act(() => {
            ReactDOM.render(
                <FitBounds
                    active
                    map={map}
                    mapType="openlayers"
                    geometry={[0, 0]}
                />, document.getElementById("container"));
        });
        expect(document.getElementById("container").children.length).toBe(0);
    });

    it('should trigger fit function with leaflet mapType', (done) => {

        const map = {
            getZoom: () => 7,
            flyToBounds: () => {
                done();
            }
        };

        act(() => {
            ReactDOM.render(
                <FitBounds
                    active
                    map={map}
                    mapType="leaflet"
                    geometry={[0, 0]}
                />, document.getElementById("container"));
        });
        expect(document.getElementById("container").children.length).toBe(0);
    });
});
