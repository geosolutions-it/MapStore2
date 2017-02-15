/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');
var React = require('react/addons');
var ReactDOM = require('react-dom');
var L = require('leaflet');
var MeasurementSupport = require('../MeasurementSupport');

describe('Leaflet MeasurementSupport', () => {
    var msNode;
    function getMapLayersNum(map) {
        return Object.keys(map._layers).length;
    }

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
        let map = L.map("map");
        let proj = "EPSG:3857";
        let measurement = {
            geomType: null
        };

        const cmp = ReactDOM.render(
            <MeasurementSupport
                map={map}
                projection={proj}
                measurement={measurement}
                changeMeasurementState={() => {}}
            />
        , msNode);
        expect(cmp).toExist();
    });

    it('test rendering', () => {
        let map = L.map("map");
        let proj = "EPSG:3857";
        let measurement = {
            geomType: null
        };
        let messages = { draw: { handlers: { circle: { radius: 'Radius', tooltip: { start: 'Click and drag to draw circle.' } }, marker: { tooltip: { start: 'Click map to place marker.' } }, polygon: { tooltip: { cont: 'Click to continue drawing shape.', end: 'Click first point to close this shape.', start: 'Click to start drawing shape.' } }, polyline: { error: '<strong>Error:</strong> shape edges cannot cross!', tooltip: { cont: 'Click to continue drawing line.', end: 'Click last point to finish line.', start: 'Click to start drawing line.' } }, rectangle: { tooltip: { start: 'Click and drag to draw rectangle.' } }, simpleshape: { tooltip: { end: 'Release mouse to finish drawing.' } } }, toolbar: { actions: { text: 'Cancel', title: 'Cancel drawing' }, buttons: { circle: 'Draw a circle', marker: 'Draw a marker', polygon: 'Draw a polygon', polyline: 'Draw a polyline', rectangle: 'Draw a rectangle' }, undo: { text: 'Delete last point', title: 'Delete last point drawn' } } }, edit: { handlers: { edit: { tooltip: { subtext: 'Click cancel to undo changes.', text: 'Drag handles, or marker to edit feature.' } }, remove: { tooltip: { text: 'Click on a feature to remove' } } }, toolbar: { actions: { cancel: { text: 'Cancel', title: 'Cancel editing, discards all changes.' }, save: { text: 'Save', title: 'Save changes.' } }, buttons: { edit: 'Edit layers.', editDisabled: 'No layers to edit.', remove: 'Delete layers.', removeDisabled: 'No layers to delete.' } } } };

        const cmp = ReactDOM.render(
            <MeasurementSupport
                projection={proj}
                map={map}
                measurement={measurement}
                messages={messages}
                changeMeasurementState={() => {}}
            />
        , msNode);
        expect(cmp).toExist();
        expect(L.drawLocal).toEqual(messages);
    });

    it('test if a new layer is added to the map in order to allow drawing.', () => {
        let map = L.map("map", {
            center: [51.505, -0.09],
            zoom: 13
        });
        let proj = "EPSG:3857";
        let measurement = {
            geomType: null
        };
        let initialLayersNum = getMapLayersNum(map);
        const cmp = ReactDOM.render(
            <MeasurementSupport
                map={map}
                projection={proj}
                measurement={measurement}
                changeMeasurementState={() => {}}
            />
        , msNode);
        expect(cmp).toExist();

        cmp.setProps({
            measurement: {
                geomType: "LineString"
            }
        }, () => {
            expect(getMapLayersNum(map)).toBeGreaterThan(initialLayersNum);
        });
    });

    it('test if drawing layers will be removed', () => {
        let map = L.map("map", {
            center: [51.505, -0.09],
            zoom: 13
        });
        let proj = "EPSG:3857";
        let measurement = {
            geomType: null
        };
        const cmp = ReactDOM.render(
            <MeasurementSupport
                map={map}
                projection={proj}
                measurement={measurement}
                changeMeasurementState={() => {}}
            />
        , msNode);
        expect(cmp).toExist();

        let initialLayersNum = getMapLayersNum(map);
        cmp.setProps({
            measurement: {
                geomType: "Polygon"
            }
        }, () => {
            expect(getMapLayersNum(map)).toBeGreaterThan(initialLayersNum);
            cmp.setProps({
                measurement: {
                    geomType: null
                }
            }, () => {
                expect(getMapLayersNum(map)).toBe(initialLayersNum);
            });
        });
    });

    it('test map onClick handler for POINT tool', () => {
        let newMeasureState;
        let map = L.map("map", {
            center: [51.505, -0.09],
            zoom: 13
        });
        let proj = "EPSG:3857";
        let measurement = {
            geomType: null
        };
        const cmp = ReactDOM.render(
            <MeasurementSupport
                map={map}
                projection={proj}
                measurement={measurement}
                changeMeasurementState={(data) => {newMeasureState = data; }}
            />
        , msNode);
        expect(cmp).toExist();

        cmp.setProps({
            measurement: {
                geomType: "Point"
            }
        }, () => {
            document.getElementById('map').addEventListener('click', () => {
                expect(newMeasureState).toExist();
            });
            document.getElementById('map').click();
        });
    });

    it('test map onClick handler for LINE tool', () => {
        let newMeasureState;
        let map = L.map("map", {
            center: [51.505, -0.09],
            zoom: 13
        });
        let proj = "EPSG:3857";
        let measurement = {
            geomType: null
        };
        const cmp = ReactDOM.render(
            <MeasurementSupport
                map={map}
                projection={proj}
                measurement={measurement}
                changeMeasurementState={(data) => {newMeasureState = data; }}
            />
        , msNode);
        expect(cmp).toExist();

        cmp.setProps({
            measurement: {
                geomType: "LineString"
            }
        }, () => {
            document.getElementById('map').addEventListener('click', () => {
                expect(newMeasureState).toExist();
            });
            document.getElementById('map').click();
        });
    });

    it('test map onClick handler for AREA tool', () => {
        let newMeasureState;
        let map = L.map("map", {
            center: [51.505, -0.09],
            zoom: 13
        });
        let proj = "EPSG:3857";
        let measurement = {
            geomType: null
        };
        const cmp = ReactDOM.render(
            <MeasurementSupport
                map={map}
                projection={proj}
                measurement={measurement}
                changeMeasurementState={(data) => {newMeasureState = data; }}
            />
        , msNode);
        expect(cmp).toExist();

        cmp.setProps({
            measurement: {
                geomType: "Polygon"
            }
        }, () => {
            document.getElementById('map').addEventListener('click', () => {
                expect(newMeasureState).toExist();
            });
            document.getElementById('map').click();
        });
    });

    it('test map onClick handler for BEARING tool', () => {
        let newMeasureState;
        let map = L.map("map", {
            center: [51.505, -0.09],
            zoom: 13
        });
        let proj = "EPSG:3857";
        let measurement = {
            geomType: null
        };
        const cmp = ReactDOM.render(
            <MeasurementSupport
                map={map}
                projection={proj}
                measurement={measurement}
                changeMeasurementState={(data) => {newMeasureState = data; }}
            />
        , msNode);
        expect(cmp).toExist();

        cmp.setProps({
            measurement: {
                geomType: "Bearing"
            }
        }, () => {
            document.getElementById('map').addEventListener('click', () => {
                expect(newMeasureState).toExist();
            });
            document.getElementById('map').click();
        });
    });

});
