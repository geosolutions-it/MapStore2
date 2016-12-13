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
