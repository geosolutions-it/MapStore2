/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import ReactDOM from 'react-dom';
import { createSink, setObservableConfig } from 'recompose';
import rxjsConfig from 'recompose/rxjsObservableConfig';
setObservableConfig(rxjsConfig);
import expect from 'expect';
import useFiles from '../useFiles';

describe('useFiles enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('useFiles rendering with map', (done) => {

        const actions = {
            loadMap: (conf, mapId, zoomToExtent ) => {
                expect(conf).toExist();
                expect(conf.map).toExist();
                expect(conf.map.bbox).toExist();
                expect(conf.map.center).toExist();
                expect(conf.map.zoom).toExist();
                expect(mapId).toBe(null);
                expect(zoomToExtent).toBe(false);
                done();
            },
            onClose: () => {},
            loadAnnotations: () => {},
            setLayers: () => {}
        };
        const spyOnClose = expect.spyOn(actions, 'onClose');
        const spyLoadAnnotations = expect.spyOn(actions, 'loadAnnotations');
        const spySetLayers = expect.spyOn(actions, 'setLayers');

        const sink = createSink( props => {
            expect(props).toExist();
            expect(props.maps).toExist();
            expect(props.useFiles).toExist();
            props.useFiles({maps: props.maps});
        });
        const EnhancedSink = useFiles(sink);
        ReactDOM.render(<EnhancedSink maps={[ {map: {zoom: 4, center: { x: 1, y: 1 }, bbox: { x: 1, y: 1 }, maxExtent: "TEST"}} ]}
            loadAnnotations={actions.loadAnnotations} setLayers={actions.setLayers} loadMap={actions.loadMap} onClose={actions.onClose} currentMap={{zoom: 4, center: { x: 1, y: 1 }}} />, document.getElementById("container"));
        expect(spyOnClose).toHaveBeenCalled();
        expect(spyLoadAnnotations).toNotHaveBeenCalled();
        expect(spySetLayers).toNotHaveBeenCalled();
    });
    it('useFiles rendering with map with pre-existing mapId', (done) => {
        const actions = {
            loadMap: (conf, mapId, zoomToExtent ) => {
                expect(conf).toExist();
                expect(conf.map).toExist();
                expect(conf.map.bbox).toExist();
                expect(conf.map.center).toExist();
                expect(conf.map.zoom).toExist();
                expect(mapId).toExist();
                expect(zoomToExtent).toBeFalsy();
                done();
            },
            loadMapInfo: () => {},
            onClose: () => {},
            loadAnnotations: () => {},
            setLayers: () => {}
        };
        const spyOnClose = expect.spyOn(actions, 'onClose');
        const spyLoadMapInfo = expect.spyOn(actions, 'loadMapInfo');
        const spyLoadAnnotations = expect.spyOn(actions, 'loadAnnotations');
        const spySetLayers = expect.spyOn(actions, 'setLayers');

        const sink = createSink( props => {
            expect(props).toExist();
            expect(props.maps).toExist();
            expect(props.useFiles).toExist();
            props.useFiles({maps: props.maps});
        });
        const EnhancedSink = useFiles(sink);
        ReactDOM.render(<EnhancedSink maps={[ {map: { zoom: 4, center: { x: 1, y: 1 }, bbox: { x: 1, y: 1 }, maxExtent: "TEST"}, fileName: "savedMap.json" } ]}
            loadAnnotations={actions.loadAnnotations} setLayers={actions.setLayers} loadMap={actions.loadMap} loadMapInfo={actions.loadMapInfo} onClose={actions.onClose} currentMap={{zoom: 4, center: { x: 1, y: 1 }, mapId: "10"}} />, document.getElementById("container"));
        expect(spyLoadMapInfo).toHaveBeenCalledWith("10");
        expect(spyOnClose).toHaveBeenCalled();
        expect(spyLoadAnnotations).toNotHaveBeenCalled();
        expect(spySetLayers).toNotHaveBeenCalled();
    });
    it('useFiles rendering with layer withIn Bounds', (done) => {
        const actions = {
            setLayers: (layers) => {
                expect(layers).toExist();
                expect(layers.length).toBe(1);
                done();
            },
            onClose: () => {},
            loadAnnotations: () => {},
            loadMap: () => {}
        };
        const spyOnClose = expect.spyOn(actions, 'onClose');
        const spyLoadAnnotations = expect.spyOn(actions, 'loadAnnotations');
        const spyLoadMap = expect.spyOn(actions, 'loadMap');
        const sink = createSink( props => {
            expect(props).toExist();
            expect(props.layers).toExist();
            expect(props.useFiles).toExist();
            props.useFiles({layers: props.layers});

        });
        const EnhancedSink = useFiles(sink);
        const layer = {
            type: 'vector', name: "FileName", hideLoading: true,
            bbox: {crs: "EPSG:4326"},
            "features": [{
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [-150, 90]
                },
                "properties": {
                    "prop0": "value0"
                }
            }]
        };
        ReactDOM.render(<EnhancedSink layers={[layer]}
            setLayers={actions.setLayers} onClose={actions.onClose} />, document.getElementById("container"));

        expect(spyOnClose).toNotHaveBeenCalled();
        expect(spyLoadAnnotations).toNotHaveBeenCalled();
        expect(spyLoadMap).toNotHaveBeenCalled();
    });

    it('useFiles rendering with layer outside Bounds should call warnig()', (done) => {
        const handlers = {
            warning: () => {},
            onClose: () => {},
            loadAnnotations: () => {},
            loadMap: () => {}
        };
        const warningSpy = expect.spyOn(handlers, 'warning');

        const actions = {
            setLayers: (layers) => {
                expect(layers).toExist();
                // length is 0 since layer is invalid
                expect(layers.length).toBe(0);
                expect(warningSpy).toHaveBeenCalled();
                done();
            }
        };

        const sink = createSink( props => {
            expect(props).toExist();
            expect(props.layers).toExist();
            expect(props.useFiles).toExist();
            props.useFiles({layers: props.layers});

        });
        const EnhancedSink = useFiles(sink);

        const layer = {
            type: 'vector', name: "FileName", hideLoading: true,
            bbox: {crs: "EPSG:4326"},
            "features": [{
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [-150, 95]
                },
                "properties": {
                    "prop0": "value0"
                }
            }]
        };
        ReactDOM.render(<EnhancedSink layers={[layer]}
            setLayers={actions.setLayers} warning={handlers.warning} onClose={handlers.onClose} />, document.getElementById("container"));

    });
    it('useFiles rendering with layer having size exceed the max limit should call warnig()', (done) => {
        const handlers = {
            warning: () => {},
            onClose: () => {},
            loadAnnotations: () => {},
            loadMap: () => {}
        };
        const warningSpy = expect.spyOn(handlers, 'warning');

        const actions = {
            setLayers: (layers) => {
                expect(layers).toExist();
                // length is 1 since just one layer is valid and the another is invalid for its size
                expect(layers.length).toBe(1);
                expect(warningSpy).toHaveBeenCalled();
                done();
            }
        };

        const sink = createSink( props => {
            expect(props).toExist();
            expect(props.layers).toExist();
            expect(props.useFiles).toExist();
            props.useFiles({layers: props.layers});

        });
        const EnhancedSink = useFiles(sink);

        const layers = [{
            type: 'vector', name: "FileName", hideLoading: true,
            bbox: {crs: "EPSG:4326"},
            "features": [{
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [-20, 30]
                },
                "properties": {
                    "prop0": "value0"
                }
            }]
        }, {
            type: 'vector', name: "FileName01", hideLoading: true,
            exceedFileMaxSize: true,
            "features": []
        }];
        ReactDOM.render(<EnhancedSink layers={layers}
            setLayers={actions.setLayers} warning={handlers.warning} onClose={handlers.onClose} />, document.getElementById("container"));

    });
    it('useFiles rendering with new annotation layer', (done) => {

        const actions = {
            loadAnnotations: (layers, override) => {
                expect(layers).toExist();
                expect(override).toBe(false);
                done();
            },
            onClose: () => {},
            setLayers: () => {},
            loadMap: () => {}
        };
        const spyOnClose = expect.spyOn(actions, 'onClose');
        const spySetLayers = expect.spyOn(actions, 'setLayers');
        const spyLoadMap = expect.spyOn(actions, 'loadMap');

        const sink = createSink( props => {
            expect(props).toExist();
            expect(props.layers).toExist();
            expect(props.useFiles).toExist();
            props.useFiles({layers: props.layers});
        });
        const EnhancedSink = useFiles(sink);
        ReactDOM.render(<EnhancedSink layers={[{name: 'Annotations', features: []}]}
            loadAnnotations={actions.loadAnnotations} setLayers={actions.setLayers} onClose={actions.onClose} annotationsLayer={false}  />, document.getElementById("container"));
        expect(spyOnClose).toHaveBeenCalled();
        expect(spySetLayers).toNotHaveBeenCalled();
        expect(spyLoadMap).toNotHaveBeenCalled();
    });
    it('useFiles rendering with existing annotation layer', (done) => {

        const actions = {
            loadAnnotations: () => {},
            onClose: () => {},
            setLayers: (layers) => {
                expect(layers).toExist();
                expect(layers.length).toBe(1);
                expect(layers[0].features).toExist();
                expect(layers[0].name).toBe("Annotations");
                done();
            },
            loadMap: () => {}
        };
        const spyOnClose = expect.spyOn(actions, 'onClose');
        const spyLoadAnnotations = expect.spyOn(actions, 'loadAnnotations');
        const spyLoadMap = expect.spyOn(actions, 'loadMap');

        const sink = createSink( props => {
            expect(props).toExist();
            expect(props.layers).toExist();
            expect(props.useFiles).toExist();
            props.useFiles({layers: props.layers});
        });
        const EnhancedSink = useFiles(sink);
        ReactDOM.render(<EnhancedSink layers={[{name: 'Annotations', features: []}]}
            setLayers={actions.setLayers} loadAnnotations={actions.loadAnnotations} onClose={actions.onClose} annotationsLayer  />, document.getElementById("container"));
        expect(spyOnClose).toNotHaveBeenCalled();
        expect(spyLoadAnnotations).toNotHaveBeenCalled();
        expect(spyLoadMap).toNotHaveBeenCalled();
    });
});
