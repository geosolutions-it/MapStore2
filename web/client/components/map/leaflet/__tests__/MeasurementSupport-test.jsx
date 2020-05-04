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
const MeasurementSupport = require('../MeasurementSupport');
const {getFormattedBearingValue} = require("../../../../utils/MeasureUtils");
let defaultPrecision = {
    km: 2,
    ha: 2,
    m: 2,
    mi: 2,
    ac: 2,
    yd: 0,
    ft: 0,
    nm: 2,
    sqkm: 2,
    sqha: 2,
    sqm: 2,
    sqmi: 2,
    sqac: 2,
    sqyd: 2,
    sqft: 2,
    sqnm: 2
};
describe('Leaflet MeasurementSupport', () => {
    var msNode;
    function getMapLayersNum(map) {
        return Object.keys(map._layers).length;
    }

    beforeEach(() => {
        document.body.innerHTML = '<div id="map" style="heigth: 100px; width: 100px"></div><div id="ms"></div>';
        msNode = document.getElementById('ms');
    });
    afterEach(() => {
        ReactDOM.unmountComponentAtNode(msNode);
        document.body.innerHTML = '';
        msNode = undefined;
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
        let myMessages = {message: "message"};
        let drawLocal = L.drawLocal;
        L.drawLocal = null;
        const cmp = ReactDOM.render(
            <MeasurementSupport
                messages={myMessages}
            />
            , msNode);
        expect(cmp).toExist();
        expect(L.drawLocal).toEqual(myMessages);
        // restoring old value of drawLocal because other test would fail otherwise.
        // L is global so drawLocal need to be restore to default value
        L.drawLocal = drawLocal;
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
        let cmp = ReactDOM.render(
            <MeasurementSupport
                map={map}
                projection={proj}
                measurement={measurement}
                changeMeasurementState={() => {}}
            />
            , msNode);
        expect(cmp).toExist();

        cmp = ReactDOM.render(
            <MeasurementSupport
                map={map}
                projection={proj}
                measurement={{geomType: "LineString"}}
                changeMeasurementState={() => {}}
            />
            , msNode);
        expect(getMapLayersNum(map)).toBeGreaterThan(initialLayersNum);
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
        let cmp = ReactDOM.render(
            <MeasurementSupport
                map={map}
                projection={proj}
                measurement={measurement}
                changeMeasurementState={() => {}}
            />
            , msNode);
        expect(cmp).toExist();

        let initialLayersNum = getMapLayersNum(map);
        cmp = ReactDOM.render(
            <MeasurementSupport
                map={map}
                projection={proj}
                measurement={{
                    geomType: "Polygon"
                }}
                changeMeasurementState={() => {}}
            />
            , msNode);
        expect(getMapLayersNum(map)).toBeGreaterThan(initialLayersNum);
        cmp = ReactDOM.render(
            <MeasurementSupport
                map={map}
                projection={proj}
                measurement={{
                    geomType: null
                }}
                changeMeasurementState={() => {}}
            />
            , msNode);
        expect(getMapLayersNum(map)).toBe(initialLayersNum);
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
        let cmp = ReactDOM.render(
            <MeasurementSupport
                map={map}
                projection={proj}
                measurement={measurement}
                changeMeasurementState={(data) => {newMeasureState = data; }}
            />
            , msNode);
        expect(cmp).toExist();

        cmp = ReactDOM.render(
            <MeasurementSupport
                map={map}
                projection={proj}
                measurement={{
                    geomType: "Point"
                }}
                changeMeasurementState={(data) => {newMeasureState = data; }}
            />
            , msNode);
        expect(cmp).toExist();

        document.getElementById('map').addEventListener('click', () => {
            expect(newMeasureState).toExist();
        });
        document.getElementById('map').click();
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
        let cmp = ReactDOM.render(
            <MeasurementSupport
                map={map}
                projection={proj}
                measurement={measurement}
                changeMeasurementState={(data) => {newMeasureState = data; }}
            />
            , msNode);
        expect(cmp).toExist();

        cmp = ReactDOM.render(
            <MeasurementSupport
                map={map}
                projection={proj}
                measurement={{
                    geomType: "LineString"
                }}
                changeMeasurementState={(data) => {newMeasureState = data; }}
            />
            , msNode);

        document.getElementById('map').addEventListener('draw:addvertex', () => {
            expect(newMeasureState).toExist();
        });
        document.getElementById('map').click();
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
        let cmp = ReactDOM.render(
            <MeasurementSupport
                map={map}
                projection={proj}
                measurement={measurement}
                changeMeasurementState={(data) => {newMeasureState = data; }}
            />
            , msNode);
        expect(cmp).toExist();

        cmp = ReactDOM.render(
            <MeasurementSupport
                map={map}
                projection={proj}
                measurement={{
                    geomType: "Polygon"
                }}
                changeMeasurementState={(data) => {newMeasureState = data; }}
            />
            , msNode);
        document.getElementById('map').addEventListener('draw:addvertex', () => {
            expect(newMeasureState).toExist();
        });
        document.getElementById('map').click();
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
        let cmp = ReactDOM.render(
            <MeasurementSupport
                map={map}
                projection={proj}
                measurement={measurement}
                changeMeasurementState={(data) => {newMeasureState = data; }}
            />
            , msNode);
        expect(cmp).toExist();

        cmp = ReactDOM.render(
            <MeasurementSupport
                map={map}
                projection={proj}
                measurement={{
                    geomType: "Bearing"
                }}
                changeMeasurementState={(data) => {newMeasureState = data; }}
            />
            , msNode);
        document.getElementById('map').addEventListener('draw:addvertex', () => {
            expect(newMeasureState).toExist();
        });
        document.getElementById('map').click();
    });

    it('test L.GeometryUtil.readableDistance with Bearing', () => {
        const distance = 1;
        const isMetric = true;
        const isFeet = false;
        const isNauticalMile = false;
        const precision = null;
        const options = {
            geomType: "Bearing",
            bearing: "5° N 4° E",
            useTreshold: true,
            uom: {
                length: {
                    unit: "m",
                    label: "m"
                }
            }
        };
        let distanceStr = L.GeometryUtil.readableDistance(distance, isMetric, isFeet, isNauticalMile, precision, options);
        expect(distanceStr).toBe("5° N 4° E");
    });
    it('test L.GeometryUtil.readableDistance with Bearing', () => {
        const distance = 1;
        const isMetric = true;
        const isFeet = false;
        const isNauticalMile = false;
        const precision = null;
        const trueBearing =  { measureTrueBearing: true};
        const options = {
            geomType: "Bearing",
            bearing: getFormattedBearingValue(80.9, trueBearing),
            useTreshold: true,
            uom: {
                length: {
                    unit: "m",
                    label: "m"
                }
            }
        };
        let distanceStr = L.GeometryUtil.readableDistance(distance, isMetric, isFeet, isNauticalMile, precision, options);
        expect(distanceStr).toBe("080° T");
    });
    it('test L.GeometryUtil.readableDistance length with trehsold', () => {
        const distance = 1;
        const isMetric = true;
        const isFeet = false;
        const isNauticalMile = false;
        const precision = null;
        const options = {
            geomType: "LineString",
            bearing: 0,
            useTreshold: true,
            uom: {
                length: {
                    unit: "km",
                    label: "km"
                }
            }
        };
        let distanceStr = L.GeometryUtil.readableDistance(distance, isMetric, isFeet, isNauticalMile, precision, options);
        expect(distanceStr).toBe("1.00 m");

        distanceStr = L.GeometryUtil.readableDistance(distance * 1E4, isMetric, isFeet, isNauticalMile, precision, options);
        expect(distanceStr).toBe("10.00 km");
    });
    it('test L.GeometryUtil.readableDistance metric length with no trehsold', () => {
        const distance = 1000;
        const isMetric = true;
        const isFeet = false;
        const isNauticalMile = false;
        const precision = null;
        const options = {
            geomType: "LineString",
            bearing: 0,
            useTreshold: false,
            uom: {
                length: {
                    unit: "km",
                    label: "km"
                }
            }
        };
        let distanceStr = L.GeometryUtil.readableDistance(distance, isMetric, isFeet, isNauticalMile, precision, options);
        expect(distanceStr).toBe("1.00 km");
    });
    it('test L.GeometryUtil.readableDistance imperial length with trehsold', () => {
        const distance = 10;
        const isMetric = false;
        const isFeet = false;
        const isNauticalMile = false;
        const precision = null;
        const options = {
            geomType: "LineString",
            bearing: 0,
            useTreshold: true,
            uom: {
                length: {
                    unit: "mi",
                    label: "mi"
                }
            }
        };
        let distanceStr = L.GeometryUtil.readableDistance(distance, isMetric, isFeet, isNauticalMile, precision, options);
        expect(distanceStr).toBe("11 yd");
        distanceStr = L.GeometryUtil.readableDistance(distance * 1e4, isMetric, isFeet, isNauticalMile, precision, options);
        expect(distanceStr).toBe("62.14 mi");
    });
    it('test L.GeometryUtil.readableArea imperial length with trehsold', () => {
        const area = 100000;
        const isMetric = false;
        const precision = null;
        const options = {
            geomType: "LineString",
            bearing: 0,
            useTreshold: true,
            uom: {
                area: {
                    unit: "sqmi",
                    label: "mi²"
                }
            }
        };
        let areaStr = L.GeometryUtil.readableArea(area, isMetric, precision, options);
        expect(areaStr).toBe("119600.00 yd²");
        areaStr = L.GeometryUtil.readableArea(area * 1e6, isMetric, precision, options);
        expect(areaStr).toBe("38610.22 mi²");
    });
    it('test L.GeometryUtil.readableArea metric length with trehsold', () => {
        const area = 100000;
        const isMetric = true;
        const precision = null;
        const options = {
            geomType: "LineString",
            bearing: 0,
            useTreshold: true,
            uom: {
                area: {
                    unit: "sqkm",
                    label: "km²"
                }
            }
        };
        let areaStr = L.GeometryUtil.readableArea(area, isMetric, precision, options);
        expect(areaStr).toBe("100000.00 m²");
        areaStr = L.GeometryUtil.readableArea(area * 1e6, isMetric, precision, options);
        expect(areaStr).toBe("100000.00 km²");
    });
    it('test L.GeometryUtil.readableArea metric length with no trehsold', () => {
        const area = 100000;
        const isMetric = true;
        const precision = null;
        const options = {
            geomType: "LineString",
            bearing: 0,
            useTreshold: false,
            uom: {
                area: {
                    unit: "sqkm",
                    label: "km²"
                }
            }
        };
        let areaStr = L.GeometryUtil.readableArea(area, isMetric, precision, options);
        expect(areaStr).toBe("0.10 km²");
        areaStr = L.GeometryUtil.readableArea(area * 1e3, isMetric, precision, options);
        expect(areaStr).toBe("100.00 km²");
    });
    it('test L.getMeasureWithTreshold', () => {
        const value = 100000;
        const threshold = 1000;
        const precision = defaultPrecision;
        const source = "m";
        const dest = "km";
        const sourceLabel = "m";
        const destLabel = "km";

        // value > treshold
        let areaStr = L.getMeasureWithTreshold(value, threshold, source, dest, precision, sourceLabel, destLabel);
        expect(areaStr).toBe("100.00 km");
        // value < treshold
        areaStr = L.getMeasureWithTreshold(value, threshold * 1e3, source, dest, precision, sourceLabel, destLabel);
        expect(areaStr).toBe("100000.00 m");
    });
    it('test L.Draw.Polygon.prototype._getMeasurementString', () => {
        L.Draw.Polygon.prototype.options = {
            metric: true,
            precision: undefined,
            useTreshold: true,
            uom: {
                area: {
                    unit: "sqkm",
                    label: "km²"
                }
            },
            showLength: false
        };
        L.Draw.Polygon.prototype._area = 1000;

        let areaStr = L.Draw.Polygon.prototype._getMeasurementString();
        expect(areaStr).toBe("1000.00 m²");

    });
    it('test L.Draw.Polyline.prototype._getMeasurementString', () => {
        L.Draw.Polyline.prototype.options = {
            metric: true,
            feet: false,
            nautic: false,
            precision: undefined,
            useTreshold: true,
            uom: {
                length: {
                    unit: "km",
                    label: "km"
                }
            },
            showLength: false
        };
        let map = L.map("map", {
            center: [51.505, -0.09],
            zoom: 13
        });
        L.Draw.Polyline.prototype._map = map;
        L.Draw.Polyline.prototype._measurementRunningTotal = 0;
        L.Draw.Polyline.prototype._currentLatLng = L.latLng([50.5, 30.5]);
        L.Draw.Polyline.prototype._markers = [L.marker([50.5, 30.5]), L.marker([52.5, 30.5])];

        let distanceStr = L.Draw.Polyline.prototype._getMeasurementString();
        expect(distanceStr).toBe("222.39 km");

    });
    it('test L.Draw.Polyline.prototype._getMeasurementString', () => {
        L.Draw.Polyline.prototype.options = {
            metric: true,
            feet: false,
            nautic: false,
            showLength: true,
            useTreshold: true,
            geomType: "Bearing",
            bearing: 84.82388445,
            uom: {
                length: {
                    unit: "m",
                    label: "m"
                }
            },
            trueBearing: { measureTrueBearing: true, fractionDigits: 4}
        };
        let map = L.map("map", {
            center: [51.505, -0.09],
            zoom: 13
        });
        L.Draw.Polyline.prototype._map = map;
        L.Draw.Polyline.prototype._measurementRunningTotal = 0;
        L.Draw.Polyline.prototype._currentLatLng = L.latLng([50.5, 30.5]);
        L.Draw.Polyline.prototype._markers = [L.marker([50.5, 30.5]), L.marker([52.5, 30.5])];

        let distanceStr = L.Draw.Polyline.prototype._getMeasurementString();
        expect(distanceStr).toBe("084.8239° T");

    });

});
