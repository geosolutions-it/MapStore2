/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const React = require('react');
const ReactDOM = require('react-dom');
const L = require('leaflet');
const DrawSupport = require('../DrawSupport');
const {} = require('../../../../test-resources/drawsupport/features');
describe('Leaflet DrawSupport', () => {
    var msNode;

    beforeEach((done) => {
        document.body.innerHTML = '<div id="map" style="heigth: 100px; width: 100px"></div><div id="ms"></div>';
        msNode = document.getElementById('ms');
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(msNode);
        document.body.innerHTML = '';
        msNode = undefined;
        setTimeout(done);
    });

    it('test creation', () => {
        let map = L.map("map", {
            center: [51.505, -0.09],
            zoom: 13
        });
        const cmp = ReactDOM.render(
            <DrawSupport
                map={map}
                drawOwner="me"
            />
        , msNode);
        expect(cmp).toExist();
    });

    it('test circle drawing creation.', () => {
        let map = L.map("map", {
            center: [51.505, -0.09],
            zoom: 13
        });

        let cmp = ReactDOM.render(
            <DrawSupport
                map={map}
                drawOwner="me"
                options={{stopAfterDrawing: true}}
            />
        , msNode);
        expect(cmp).toExist();

        cmp = ReactDOM.render(
            <DrawSupport
                map={map}
                drawStatus="start"
                drawMethod="Circle"
                drawOwner="me"
                options={{stopAfterDrawing: true}}
            />
        , msNode);

        expect(map._layers).toExist();
    });

    it('test if drawing layers will be removed', () => {
        let map = L.map("map", {
            center: [51.505, -0.09],
            zoom: 13
        });
        let cmp = ReactDOM.render(
            <DrawSupport
                map={map}
                drawOwner="me"
                drawStatus="create"
                drawMethod="Point"
            />
        , msNode);
        cmp = ReactDOM.render(
            <DrawSupport
                map={map}
                drawOwner="me"
                drawStatus="create"
                drawMethod="BBOX"
            />
        , msNode);
        expect(cmp).toExist();

        cmp = ReactDOM.render(
            <DrawSupport
                map={map}
                drawOwner="me"
                drawStatus="clean"
                drawMethod="BBOX"
            />
        , msNode);
        expect(Object.keys(map._layers).length).toBe(0);
    });

    it('test map onClick handler created circle', () => {
        let bounds = L.latLngBounds(L.latLng(40.712, -74.227), L.latLng(40.774, -74.125));
        let map = L.map("map", {
            center: [51.505, -0.09],
            zoom: 13
        });
        let layer = {
            getBounds: function() { return bounds; },
            toGeoJSON: function() {return {geometry: {coordinates: [0, 0]}}; },
            _map: map
        };
        let cmp = ReactDOM.render(
            <DrawSupport
                map={map}
                drawOwner="me"
                drawStatus="start"
                drawMethod="Point"
            />
        , msNode);
        cmp = ReactDOM.render(
            <DrawSupport
                map={map}
                drawOwner="me"
                drawStatus="start"
                drawMethod="Circle"
            />
        , msNode);
        expect(cmp).toExist();
        let featureData;
        cmp.drawLayer = {addData: function(data) {featureData = data; return true; }, toGeoJSON: function() { return featureData; }};
        cmp.onDrawCreated.call(cmp, {layer: layer, layerType: "circle"});
    });
    it('test draw replace', () => {
        let map = L.map("map", {
            center: [51.505, -0.09],
            zoom: 13
        });
        let cmp = ReactDOM.render(
            <DrawSupport
                map={map}
                drawOwner="me"
                drawStatus="create"
                drawMethod="LineString"
                options={{editEnabled: true}}
            />
        , msNode);
        cmp = ReactDOM.render(
            <DrawSupport
                map={map}
                drawOwner="me"
                drawStatus="create"
                drawMethod="LineString"
                options={{editEnabled: false}}
            />
        , msNode);
        expect(cmp).toExist();
        cmp = ReactDOM.render(
            <DrawSupport
                map={map}
                drawOwner="me"
                drawStatus="replace"
                drawMethod="LineString"
                features={[{
                    projection: "EPSG:4326",
                    coordinates: [[ -21150.703250721977, 5855989.620460]],
                    type: "LineString"}
                ]}
                options={{featureProjection: "EPSG:4326"}}
            />
        , msNode);
    });
    it('test draw replace with circle', () => {
        const RADIUS = 1;
        let bounds = L.latLngBounds(L.latLng(40.712, -74.227), L.latLng(40.774, -74.125));
        let map = L.map("map", {
            center: [51.505, -0.09],
            zoom: 13
        });
        let layer = {
            getBounds: function() { return bounds; },
            toGeoJSON: function() {return {geometry: {coordinates: [0, 0]}}; },
            _map: map
        };
        let cmp = ReactDOM.render(
            <DrawSupport
                map={map}
                drawOwner="me"
                drawStatus="create"
                drawMethod="Circle"
                options={{editEnabled: true}}
            />
        , msNode);
        let featureData;
        cmp.drawLayer = { options: {}, addData: function(data) {featureData = data; return true; }, toGeoJSON: function() { return featureData; }, clearLayers: () => {}};
        cmp.onDrawCreated.call(cmp, {layer: layer, layerType: "circle"});
        cmp = ReactDOM.render(
            <DrawSupport
                map={map}
                drawOwner="me"
                drawStatus="create"
                drawMethod="Circle"
                options={{editEnabled: false}}
            />
        , msNode);
        expect(cmp).toExist();
        cmp = ReactDOM.render(
            <DrawSupport
                map={map}
                drawOwner="me"
                drawStatus="replace"
                drawMethod="Circle"
                features={[{
                    projection: "EPSG:4326",
                    coordinates: [[ -21150.703250721977, 5855989.620460]],
                    type: "Circle"}
                ]}
                options={{featureProjection: "EPSG:4326"}}
            />
        , msNode);
        expect(cmp.drawLayer.options).toExist();
        expect(cmp.drawLayer.options.pointToLayer).toExist();
        // verify the pointToLayer still exists and creates circle after replace
        const circle = cmp.drawLayer.options.pointToLayer({radius: RADIUS}, {lng: 0, lat: 0});
        expect(circle).toExist();
        expect(circle._mRadius).toBe(RADIUS);
    });
    it('test draw replace with circle in EPSG:3857', (done) => {
        const RADIUS = 500000;
        const L_RADIUS = 384644.03167441016;
        const CENTER = {lng: 997422.6375077313, lat: 4823889.328196847};
        const L_CENTER = {lng: 8.96, lat: 39.71};
        const layer = L.circle(L.latLng(L_CENTER.lat, L_CENTER.lng), L_RADIUS);

        let map = L.map("map", {
            center: [51.505, -0.09],
            zoom: 13
        });
        let cmp = ReactDOM.render(
            <DrawSupport
                map={map}
                drawOwner="me"
                drawStatus="create"
                drawMethod="Circle"
                options={{editEnabled: true}}
            />
        , msNode);
        let featureData;
        cmp.drawLayer = { options: {}, addData: function(data) {featureData = data; return true; }, toGeoJSON: function() { return featureData; }, clearLayers: () => {}};
        cmp.onDrawCreated.call(cmp, {layer: layer, layerType: "circle"});
        cmp = ReactDOM.render(
            <DrawSupport
                map={map}
                drawOwner="me"
                drawStatus="create"
                drawMethod="Circle"
                options={{editEnabled: false}}
            />
        , msNode);
        expect(cmp).toExist();
        cmp = ReactDOM.render(
            <DrawSupport
                map={map}
                drawOwner="me"
                drawStatus="replace"
                drawMethod="Circle"
                onEndDrawing={(geom) => {
                    expect(geom).toExist();
                    expect(isNaN(geom.coordinates[0][0][0])).toBe(false);
                    expect(Math.floor(geom.radius)).toBe(RADIUS);
                    done();
                }}
                features={[{
                    projection: "EPSG:3857",
                    radius: RADIUS,
                    center: {x: CENTER.lng, y: CENTER.lat},
                    type: "Circle"}
                ]}
                options={{featureProjection: "EPSG:3857"}}
            />
        , msNode);
        expect(cmp.drawLayer.options).toExist();
        expect(cmp.drawLayer.options.pointToLayer).toExist();
        // verify the pointToLayer still exists and creates circle after replace
        const circle = cmp.drawLayer.options.pointToLayer({radius: RADIUS, projection: "EPSG:3857"}, CENTER);
        expect(circle).toExist();
        // verify that the radius is changed as expected
        expect(Math.floor(circle._mRadius)).toBe(Math.floor(L_RADIUS));

        cmp.onDrawCreated({layer, layerType: "circle"});
    });
    it('test editEnabled=true', () => {
        let map = L.map("map", {
            center: [51.505, -0.09],
            zoom: 13
        });
        let cmp = ReactDOM.render( <DrawSupport map={map} drawOwner="me" drawStatus="drawOrEdit" drawMethod="Point" features={[]} options={{editEnabled: false}} />, msNode);
        cmp = ReactDOM.render( <DrawSupport map={map} drawOwner="me" drawStatus="drawOrEdit" drawMethod="Point" features={[]} options={{editEnabled: true}} />, msNode);
        cmp = ReactDOM.render( <DrawSupport map={map} drawOwner="me" drawStatus="drawOrEdit" drawMethod="LineString" features={[]} options={{editEnabled: true}} />, msNode);
        cmp = ReactDOM.render( <DrawSupport map={map} drawOwner="me" drawStatus="drawOrEdit" drawMethod="Polygon" features={[]} options={{editEnabled: true}} />, msNode);
        cmp = ReactDOM.render( <DrawSupport map={map} drawOwner="me" drawStatus="drawOrEdit" drawMethod="MultiPoint" features={[]} options={{editEnabled: true}} />, msNode);
        cmp = ReactDOM.render( <DrawSupport map={map} drawOwner="me" drawStatus="drawOrEdit" drawMethod="MultiLineString" features={[]} options={{editEnabled: true}} />, msNode);
        cmp = ReactDOM.render( <DrawSupport map={map} drawOwner="me" drawStatus="drawOrEdit" drawMethod="MultiPolygon" features={[]} options={{editEnabled: true}} />, msNode);
        cmp = ReactDOM.render( <DrawSupport map={map} drawOwner="me" drawStatus="drawOrEdit" drawMethod="MultiPolygon" features={[]} options={{editEnabled: true}} />, msNode);
        expect(cmp).toExist();

    });
    it('test drawEnabled=true', () => {
        let map = L.map("map", {
            center: [51.505, -0.09],
            zoom: 13
        });
        let cmp = ReactDOM.render( <DrawSupport map={map} drawOwner="me" drawStatus="drawOrEdit" drawMethod="Point" features={[]} options={{drawEnabled: false}} />, msNode);
        cmp = ReactDOM.render( <DrawSupport map={map} drawOwner="me" drawStatus="drawOrEdit" drawMethod="Point" features={[]} options={{drawEnabled: true}} />, msNode);
        cmp = ReactDOM.render( <DrawSupport map={map} drawOwner="me" drawStatus="drawOrEdit" drawMethod="LineString" features={[]} options={{drawEnabled: true}} />, msNode);
        cmp = ReactDOM.render( <DrawSupport map={map} drawOwner="me" drawStatus="drawOrEdit" drawMethod="Polygon" features={[]} options={{drawEnabled: true}} />, msNode);
        cmp = ReactDOM.render( <DrawSupport map={map} drawOwner="me" drawStatus="drawOrEdit" drawMethod="MultiPoint" features={[]} options={{drawEnabled: true}} />, msNode);
        cmp = ReactDOM.render( <DrawSupport map={map} drawOwner="me" drawStatus="drawOrEdit" drawMethod="MultiLineString" features={[]} options={{drawEnabled: true}} />, msNode);
        cmp = ReactDOM.render( <DrawSupport map={map} drawOwner="me" drawStatus="drawOrEdit" drawMethod="MultiPolygon" features={[]} options={{drawEnabled: true}} />, msNode);
        expect(cmp).toExist();

    });
    it('test stop status', () => {
        let map = L.map("map", {
            center: [51.505, -0.09],
            zoom: 13
        });
        let cmp = ReactDOM.render( <DrawSupport map={map} drawOwner="me" drawStatus="start" drawMethod="LineString" options={{}} />, msNode);
        cmp = ReactDOM.render( <DrawSupport map={map} drawOwner="me" drawStatus="stop" drawMethod="LineString" options={{}} />, msNode);
        expect(cmp).toExist();

    });
    it('test updateSpatialField = true', () => {
        const latlngs = [[37, -109.05], [41, -109.03], [41, -102.05], [37, -102.04]];
        let map = L.map("map", {
            center: [51.505, -0.09],
            zoom: 13
        });
        let cmp = ReactDOM.render( <DrawSupport map={map} drawOwner="me" drawStatus="drawOrEdit" drawMethod="Polygon" features={[{
            type: "Feature",
            geometry: {
                type: "Polygon",
                coordinates: [latlngs]
            }
        }]} options={{drawEnabled: false, updateSpatialField: false}} />, msNode);
        cmp = ReactDOM.render( <DrawSupport map={map} drawOwner="me" drawStatus="drawOrEdit" drawMethod="Polygon" features={[{
            type: "Feature",
            geometry: {
                type: "Polygon",
                coordinates: [latlngs]
            }
        }]} options={{drawEnabled: false, updateSpatialField: true}} />, msNode);
        expect(cmp).toExist();

    });

    it('test endDrawing action', () => {
        const map = L.map("map", {
            center: [51.505, -0.09],
            zoom: 13
        });

        const actions = {
            onEndDrawing: () => {}
        };

        const spyonEndDrawing = expect.spyOn(actions, "onEndDrawing");

        ReactDOM.render(<DrawSupport
            drawMethod="Circle"
            drawOwner="me"
            map={map}
            features={[]}
            onEndDrawing={actions.onEndDrawing}/>, msNode);

        ReactDOM.render(<DrawSupport
            drawMethod="Circle"
            drawOwner="me"
            map={map}
            features={[{
                center: {x: -11271098, y: 7748880},
                coordinates: [-11271098, 7748880],
                projection: 'EPSG:3857',
                radius: 2000000,
                type: 'Polygon'
            }]}
            drawStatus="endDrawing"
            onEndDrawing={actions.onEndDrawing}/>, msNode);

        expect(spyonEndDrawing).toHaveBeenCalled();
    });

    it('test endDrawing action without features', () => {
        const map = L.map("map", {
            center: [51.505, -0.09],
            zoom: 13
        });
        const actions = {
            onEndDrawing: () => {}
        };

        const spyonEndDrawing = expect.spyOn(actions, "onEndDrawing");

        ReactDOM.render(<DrawSupport
            drawMethod="Circle"
            map={map}
            features={[]}
            onEndDrawing={actions.onEndDrawing}
            options={{geodesic: true}}/>, msNode);

        ReactDOM.render(<DrawSupport
            drawMethod="Circle"
            map={map}
            features={[]}
            drawStatus="endDrawing"
            onEndDrawing={actions.onEndDrawing}
            options={{geodesic: true}}/>, msNode);

        expect(spyonEndDrawing).toNotHaveBeenCalled();
    });

});
