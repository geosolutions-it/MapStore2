/*
* Copyright 2024, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import expect from 'expect';
import ReactDOM from 'react-dom';
import OLMapLocationSupport from '../OLMapLocationSupport';
import { act } from 'react-dom/test-utils';

describe('OLMapLocationSupport', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should not render', () => {
        act(() => {
            ReactDOM.render(<OLMapLocationSupport />, document.getElementById("container"));
        });
        expect(document.querySelector('#container').children.length).toBe(0);
    });
    it('should update location and position of marker', (done) => {
        let vectorLayer;
        act(() => {
            ReactDOM.render(
                <OLMapLocationSupport
                    location={{ latLng: { lat: 45, lng: 9, h: 100 } }}
                    pov={{ heading: 30 }}
                    map={{
                        getView: () => ({
                            getProjection: () => ({
                                getCode: () => 'EPSG:4326'
                            })
                        }),
                        addLayer: (_vectorLayer) => {
                            vectorLayer = _vectorLayer;
                        },
                        removeLayer: () => {}
                    }}
                    onUpdate={() => {
                        try {
                            const position = vectorLayer.getSource().getFeatures()[0];
                            expect(position.getGeometry().getCoordinates()).toEqual([ 9, 45, 100 ]);
                            expect(Math.round(position.getStyle().getImage().getRotation() * 180 / Math.PI)).toBe(30);
                        } catch (e) {
                            done(e);
                        }
                        done();
                    }}
                />, document.getElementById("container"));
        });
        expect(document.querySelector('#container').children.length).toBe(0);
    });
});

