/**
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const Feature = require('../Feature');
const expect = require('expect');

const container = {
    addLayer: () => {},
    removeLayer: () => {}
};

describe('leaflet Feature component', () => {

    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test LineString style', () => {
        const geometry = {
            type: 'LineString',
            coordinates: [
                [100.0, 0.0], [101.0, 1.0]
            ]
        };
        const type = 'Feature';
        let lineString = ReactDOM.render(<Feature
            type={type}
            container={container}
            geometry={geometry}/>, document.getElementById("container"));

        expect(lineString._layer).toExist();
        expect({...lineString._layer.options}).toEqual({});

        const style = {
            color: '#3388ff',
            weight: 4
        };

        lineString = ReactDOM.render(<Feature
            type={type}
            container={container}
            style={style}
            geometry={geometry}/>, document.getElementById("container"));

        expect(lineString._layer).toExist();
        expect({...lineString._layer.options}).toEqual(style);

        const styleWithFeatureType = {
            color: '#3388ff',
            weight: 4,
            LineString: {
                color: '#ffaa33',
                weight: 10
            }
        };

        lineString = ReactDOM.render(<Feature
            type={type}
            container={container}
            style={styleWithFeatureType}
            geometry={geometry}/>, document.getElementById("container"));

        expect(lineString._layer).toExist();
        expect({...lineString._layer.options}).toEqual(styleWithFeatureType.LineString);
    });


    it('test MultiLineString style', () => {
        const geometry = {
            type: 'MultiLineString',
            coordinates: [
                [ [100.0, 0.0], [101.0, 1.0] ],
                [ [102.0, 2.0], [103.0, 3.0] ]
            ]
        };
        const type = 'Feature';
        let multiLineString = ReactDOM.render(<Feature
            type={type}
            container={container}
            geometry={geometry}/>, document.getElementById("container"));

        expect(multiLineString._layer).toExist();

        let layersKeys = Object.keys(multiLineString._layer._layers);
        let firstLayer = multiLineString._layer._layers[layersKeys[0]];
        expect({...firstLayer.options}).toEqual({});

        const style = {
            color: '#3388ff',
            weight: 4
        };

        multiLineString = ReactDOM.render(<Feature
            type={type}
            container={container}
            style={style}
            geometry={geometry}/>, document.getElementById("container"));

        expect(multiLineString._layer).toExist();

        layersKeys = Object.keys(multiLineString._layer._layers);
        firstLayer = multiLineString._layer._layers[layersKeys[0]];
        expect({...firstLayer.options}).toEqual(style);

        const styleWithFeatureType = {
            color: '#3388ff',
            weight: 4,
            MultiLineString: {
                color: '#ffaa33',
                weight: 10
            }
        };

        multiLineString = ReactDOM.render(<Feature
            type={type}
            container={container}
            style={styleWithFeatureType}
            geometry={geometry}/>, document.getElementById("container"));

        expect(multiLineString._layer).toExist();

        layersKeys = Object.keys(multiLineString._layer._layers);
        firstLayer = multiLineString._layer._layers[layersKeys[0]];
        expect({...firstLayer.options}).toEqual(styleWithFeatureType.MultiLineString);
    });

    it('test Polygon style', () => {
        const geometry = {
            type: 'Polygon',
            coordinates: [
                [ [100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0] ]
            ]
        };

        const type = 'Feature';
        let polygon = ReactDOM.render(<Feature
            type={type}
            container={container}
            geometry={geometry}/>, document.getElementById("container"));

        expect(polygon._layer).toExist();
        expect({...polygon._layer.options}).toEqual({});

        const style = {
            color: '#3388ff',
            weight: 4,
            dashArray: '',
            fillColor: 'rgba(51, 136, 255, 0.2)'
        };

        polygon = ReactDOM.render(<Feature
            type={type}
            container={container}
            style={style}
            geometry={geometry}/>, document.getElementById("container"));

        expect(polygon._layer).toExist();
        expect({...polygon._layer.options}).toEqual(style);

        const styleWithFeatureType = {
            color: '#3388ff',
            weight: 4,
            dashArray: '',
            fillColor: 'rgba(51, 136, 255, 0.2)',
            Polygon: {
                color: '#ffaa33',
                weight: 10,
                dashArray: '10 5',
                fillColor: '#333333'
            }
        };

        polygon = ReactDOM.render(<Feature
            type={type}
            container={container}
            style={styleWithFeatureType}
            geometry={geometry}/>, document.getElementById("container"));

        expect(polygon._layer).toExist();
        expect({...polygon._layer.options}).toEqual(styleWithFeatureType.Polygon);
    });

    it('test MultiPolygon style', () => {
        const geometry = {
            type: 'MultiPolygon',
            coordinates: [
                [
                    [ [102.0, 2.0], [103.0, 2.0], [103.0, 3.0], [102.0, 3.0], [102.0, 2.0] ]
                ],
                [
                    [ [100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0] ],
                    [ [100.2, 0.2], [100.8, 0.2], [100.8, 0.8], [100.2, 0.8], [100.2, 0.2] ]
                ]
            ]
        };

        const type = 'Feature';
        let multiPolygon = ReactDOM.render(<Feature
            type={type}
            container={container}
            geometry={geometry}/>, document.getElementById("container"));

        expect(multiPolygon._layer).toExist();

        let layersKeys = Object.keys(multiPolygon._layer._layers);
        let firstLayer = multiPolygon._layer._layers[layersKeys[0]];
        expect({...firstLayer.options}).toEqual({});

        const style = {
            color: '#3388ff',
            weight: 4,
            dashArray: '',
            fillColor: 'rgba(51, 136, 255, 0.2)'
        };

        multiPolygon = ReactDOM.render(<Feature
            type={type}
            container={container}
            style={style}
            geometry={geometry}/>, document.getElementById("container"));

        expect(multiPolygon._layer).toExist();

        layersKeys = Object.keys(multiPolygon._layer._layers);
        firstLayer = multiPolygon._layer._layers[layersKeys[0]];
        expect({...firstLayer.options}).toEqual(style);

        const styleWithFeatureType = {
            color: '#3388ff',
            weight: 4,
            dashArray: '',
            fillColor: 'rgba(51, 136, 255, 0.2)',
            MultiPolygon: {
                color: '#ffaa33',
                weight: 10,
                dashArray: '10 5',
                fillColor: '#333333'
            }
        };

        multiPolygon = ReactDOM.render(<Feature
            type={type}
            container={container}
            style={styleWithFeatureType}
            geometry={geometry}/>, document.getElementById("container"));

        layersKeys = Object.keys(multiPolygon._layer._layers);
        firstLayer = multiPolygon._layer._layers[layersKeys[0]];
        expect({...firstLayer.options}).toEqual(styleWithFeatureType.MultiPolygon);
    });
});
