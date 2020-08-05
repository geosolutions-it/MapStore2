/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const {createSink} = require('recompose');
const expect = require('expect');
const useFiles = require('../useFiles');

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
            loadMap: (conf, mapId, zoomToExtent, ) => {
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
    it('useFiles rendering with layer', (done) => {

        const actions = {
            setLayers: (layers) => {
                expect(layers).toExist();
                expect(layers.length).toBe(1);
                expect(layers[0].features).toExist();
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
        ReactDOM.render(<EnhancedSink layers={[{type: 'vector', name: "FileName", hideLoading: true, features: []}]}
            setLayers={actions.setLayers} onClose={actions.onClose} />, document.getElementById("container"));
        expect(spyOnClose).toNotHaveBeenCalled();
        expect(spyLoadAnnotations).toNotHaveBeenCalled();
        expect(spyLoadMap).toNotHaveBeenCalled();
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
