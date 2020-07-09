/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.p
 */

const React = require('react');
const ReactDOM = require('react-dom');
const { createSink, setObservableConfig, compose, mapPropsStream } = require('recompose');
const expect = require('expect');
const processFiles = require('../processFiles');

const {
    getShapeFile,
    getKmlFile,
    getKmzFile,
    getGpxFile,
    getGeoJsonFile,
    getMapFile,
    getUnsupportedMapFile,
    getAnnotationGeoJsonFile
} = require('./testData');

const rxjsConfig = require('recompose/rxjsObservableConfig').default;
setObservableConfig(rxjsConfig);

describe('processFiles enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('processFiles rendering with defaults', (done) => {
        const Sink = processFiles(createSink( props => {
            expect(props).toBeTruthy();
            done();
        }));
        ReactDOM.render(<Sink />, document.getElementById("container"));
    });
    it('processFiles read error', (done) => {
        const Sink = compose(
            processFiles,
            mapPropsStream(props$ => props$.merge(props$.take(1).do(({ onDrop = () => { } }) => onDrop(["ABC"])).ignoreElements()))
        )(createSink( props => {
            expect(props).toBeTruthy();
            if (props.error) {
                done();
            }
        }));
        ReactDOM.render(<Sink />, document.getElementById("container"));
    });
    it('processFiles read shp', (done) => {
        const Sink = compose(
            processFiles,
            mapPropsStream(props$ => props$.merge(
                props$
                    .take(1)
                    .switchMap(({ onDrop = () => { } }) => getShapeFile().map((file) => onDrop([file]))).ignoreElements()))
        )(createSink(props => {
            expect(props).toBeTruthy();
            if (props.files) {
                expect(props.files.layers.length).toBe(1);
                done();
            }
        }));
        ReactDOM.render(<Sink />, document.getElementById("container"));
    });
    it('processFiles read kmz', (done) => {
        const Sink = compose(
            processFiles,
            mapPropsStream(props$ => props$.merge(
                props$
                    .take(1)
                    .switchMap(({ onDrop = () => { } }) => getKmzFile().map((file) => onDrop([file]))).ignoreElements()))
        )(createSink(props => {
            expect(props).toBeTruthy();
            if (props.files) {
                expect(props.files.layers.length).toBe(1);
                done();
            }
        }));
        ReactDOM.render(<Sink />, document.getElementById("container"));
    });
    it('processFiles read gpx', (done) => {
        const Sink = compose(
            processFiles,
            mapPropsStream(props$ => props$.merge(
                props$
                    .take(1)
                    .switchMap(({ onDrop = () => { } }) => getGpxFile().map((file) => onDrop([file]))).ignoreElements()))
        )(createSink(props => {
            expect(props).toBeTruthy();
            if (props.files) {
                expect(props.files.layers.length).toBe(1);
                done();
            }
        }));
        ReactDOM.render(<Sink />, document.getElementById("container"));
    });
    it('processFiles read kml', (done) => {
        const Sink = compose(
            processFiles,
            mapPropsStream(props$ => props$.merge(
                props$
                    .take(1)
                    .switchMap(({ onDrop = () => { } }) => getKmlFile().map((file) => onDrop([file]))).ignoreElements()))
        )(createSink(props => {
            expect(props).toBeTruthy();
            if (props.files) {
                expect(props.files.layers.length).toBe(1);
                done();
            }
        }));
        ReactDOM.render(<Sink />, document.getElementById("container"));
    });
    it('processFiles read geojson', (done) => {
        const Sink = compose(
            processFiles,
            mapPropsStream(props$ => props$.merge(
                props$
                    .take(1)
                    .switchMap(({ onDrop = () => { } }) => getGeoJsonFile().map((file) => onDrop([file]))).ignoreElements()))
        )(createSink(props => {
            expect(props).toBeTruthy();
            if (props.files) {
                expect(props.files.layers.length).toBe(1);
                done();
            }
        }));
        ReactDOM.render(<Sink />, document.getElementById("container"));
    });
    it('processFiles read annotation geojson', (done) => {
        const Sink = compose(
            processFiles,
            mapPropsStream(props$ => props$.merge(
                props$
                    .take(1)
                    .switchMap(({ onDrop = () => { } }) => getAnnotationGeoJsonFile().map((file) => onDrop([file]))).ignoreElements()))
        )(createSink(props => {
            expect(props).toBeTruthy();
            if (props.files) {
                expect(props.files.layers.length).toBe(1);
                expect(props.files.layers[0].name).toBe("Annotations");
                expect(props.files.layers[0].features).toBeTruthy();
                done();
            }
        }));
        ReactDOM.render(<Sink />, document.getElementById("container"));
    });
    it('processFiles read geojson files with geojson extension', (done) => {
        const Sink = compose(
            processFiles,
            mapPropsStream(props$ => props$.merge(
                props$
                    .take(1)
                    .switchMap(({ onDrop = () => { } }) => getGeoJsonFile("file.geojson").map((file) => onDrop([file]))).ignoreElements()))
        )(createSink(props => {
            expect(props).toBeTruthy();
            if (props.files) {
                expect(props.files.layers.length).toBe(1);
                done();
            }
        }));
        ReactDOM.render(<Sink />, document.getElementById("container"));
    });
    it('processFiles read map file', (done) => {
        const Sink = compose(
            processFiles,
            mapPropsStream(props$ => props$.merge(
                props$
                    .take(1)
                    .switchMap(({ onDrop = () => { } }) => getMapFile().map((file) => onDrop([file]))).ignoreElements()))
        )(createSink(props => {
            expect(props).toBeTruthy();
            if (props.files) {
                expect(props.files.layers.length).toBe(0);
                expect(props.files.maps.length).toBe(1);
                done();
            }
        }));
        ReactDOM.render(<Sink />, document.getElementById("container"));
    });
    it('an error was thrown while processFiles read map file that has an unsupported projection', (done) => {
        const Sink = compose(
            processFiles,
            mapPropsStream(props$ => props$.merge(
                props$
                    .take(1)
                    .switchMap(({ onDrop = () => { } }) => getUnsupportedMapFile().map((file) => onDrop([file]))).ignoreElements()))
        )(createSink(props => {
            expect(props).toBeTruthy();
            if (props.error) {
                done();
            }
        }));
        ReactDOM.render(<Sink />, document.getElementById("container"));
    });
});
