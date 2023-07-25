/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import React from 'react';
import ReactDOM from 'react-dom';
import { waitFor } from '@testing-library/react';
import Preview from '../Preview';
import OLMap from '../../../../map/openlayers/Map';
import OpenlayersLayer from '../../../../map/openlayers/Layer';

import '../../../../../utils/openlayers/Layers';
import '../../../../map/openlayers/plugins/OSMLayer';

describe("test the OL Snapshot Preview component", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"><div id="map"></div><div id="snap"></div></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("snap"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('component creation', () => {
        const tb = ReactDOM.render(<Preview active={false}/>, document.getElementById("snap"));
        expect(tb).toBeTruthy();
    });
    it('component snapshot img creation', (done) => {
        const map = ReactDOM.render(
            <OLMap id="ol-map" center={{y: 43.9, x: 10.3}} zoom={11} style={{ width: 200, height: 200 }}>
                <OpenlayersLayer type="osm" options={{ visibility: true }} />
            </OLMap>, document.getElementById("map"));
        expect(map).toBeTruthy();
        waitFor(() => expect(document.querySelector('canvas')).toBeTruthy())
            .then(() => {
                expect(map).toBeTruthy();
                let tb = ReactDOM.render(
                    <Preview
                        mapId="map"
                        snapstate={{error: "Test"}}
                        active={false}
                        timeout={0}/>,
                    document.getElementById("snap"));
                expect(tb).toBeTruthy();
                tb = ReactDOM.render(
                    <Preview
                        mapId="map"
                        snapstate={{error: "Test"}}
                        active
                        timeout={0}
                        onSnapshotReady={() => {
                            try {
                                expect(tb.isTainted(false));
                                expect(tb.exportImage()).toBeTruthy();
                                done();
                            } catch (e) {
                                done(e);
                            }
                        }}/>,
                    document.getElementById("snap"));
            })
            .catch(done);
    });
    it('component deactivation do not generate snapshot', () => {
        const map = ReactDOM.render(<OLMap center={{y: 43.9, x: 10.3}} zoom={11}  style={{ width: 200, height: 200 }} />, document.getElementById("map"));
        expect(map).toBeTruthy();
        // set a big timeout to make you sure that the snapshot is not not generated
        let tb = ReactDOM.render(<Preview mapId="map" snapstate={{error: "Test"}} active timeout={10000} onSnapshotReady={() => { expect(true).toBe(false); }}/>, document.getElementById("snap"));
        expect(tb).toBeTruthy();
        tb = ReactDOM.render(<Preview mapId="map" snapstate={{error: "Test"}} active={false} timeout={10000} onSnapshotReady={() => { expect(true).toBe(false); }}/>, document.getElementById("snap"));
    });
});
