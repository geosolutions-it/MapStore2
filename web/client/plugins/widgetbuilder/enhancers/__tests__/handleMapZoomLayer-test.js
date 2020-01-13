/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import {createSink} from 'recompose';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import handleMapZoomLayer from '../handleMapZoomLayer';


describe('handleMapZoomLayer enhancer', function() {
    const mockStore = configureMockStore([]);
    const store = mockStore({});
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('check epsg support', (done) => {
        const Sink = handleMapZoomLayer(createSink(props => {
            expect(props.epsgSupported).toBe(false);
            done();
        }));
        const editorData = {map: {}};
        ReactDOM.render(<Provider store={store}><Sink editorData={editorData} /></Provider>, document.getElementById("container"));
    });

    it('test zoom map to layer', (done) => {
        const editorData = {map: {
            size: {
                width: 518,
                height: 351
            },
            layers: [{id: 1, bbox: {
                crs: 'EPSG:4326',
                bounds: {
                    minx: -12,
                    miny: 24,
                    maxx: -66,
                    maxy: 49
                }
            }}]
        }};
        const Sink = handleMapZoomLayer(createSink(props => {
            props.zoomTo([1]);
            done();
        }));
        ReactDOM.render(<Provider store={store}><Sink editorData={editorData} /></Provider>, document.getElementById("container"));
    });

    it('test zoom map to group', (done) => {
        const editorData = {map: {
            size: {
                width: 518,
                height: 351
            },
            layers: [{id: "layer.id1", bbox: {
                crs: 'EPSG:4326',
                bounds: {
                    minx: -12,
                    miny: 24,
                    maxx: -66,
                    maxy: 49
                }
            }},
            {id: "layer.id2", bbox: {
                crs: 'EPSG:4326',
                bounds: {
                    minx: -12,
                    miny: 24,
                    maxx: -66,
                    maxy: 49
                }
            }}]
        }};
        const selectedNodes = ["layer.id1", "layer.id2", "Default"];
        const Sink = handleMapZoomLayer(createSink(props => {
            props.zoomTo(selectedNodes);
            expect(props.isEpsgSupported()).toBeTruthy();
            done();
        }));
        ReactDOM.render(<Provider store={store}><Sink editorData={editorData} selectedNodes={selectedNodes}  /></Provider>, document.getElementById("container"));
    });
});

