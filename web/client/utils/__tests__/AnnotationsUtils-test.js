/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const expect = require('expect');

const feature = require("../../test-resources/Annotation_geomColl.json");

const {getAvailableStyler, getRelativeStyler, convertGeoJSONToInternalModel,
    DEFAULT_ANNOTATIONS_STYLES, createFont, circlesToMultiPolygon, textToPoint,
    flattenGeometryCollection, normalizeAnnotation, removeDuplicate,
    formatCoordinates, getComponents, addIds, validateCoords, validateCoordsArray,
    validateCoord, getBaseCoord, validateText, validateCircle, validateCoordinates,
    coordToArray, validateFeature, fromTextToPoint, fromCircleToPolygon,
    fromAnnotationToGeoJson, annotationsToPrint,
    getStartEndPointsForLinestring,
    createGeometryFromGeomFunction,
    updateAllStyles,
    fromLineStringToGeodesicLineString, isCompletePolygon,
    getDashArrayFromStyle, getGeometryType, getGeometryGlyphInfo
} = require('../AnnotationsUtils');

const featureCollection = {
    features: [{
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: [1, 1]
        }
    },
    {
        type: "Feature",
        geometry: {
            type: "LineString",
            coordinates: [1, 1]
        }
    }],
    type: "FeatureCollection"
};
const circle1 = {
    type: "Feature",
    geometry: {
        type: "Polygon",
        coordinates: [[[1, 1], [2, 2], [3, 3], [1, 1]]]
    },
    properties: {
        isCircle: true,
        radius: 200,
        id: "circle1"
    }
};
const circle2 = {
    type: "Feature",
    geometry: {
        type: "Point",
        coordinates: [1, 1]
    },
    properties: {
        polygonGeom: {
            type: "Polygon",
            coordinates: [[[1, 1], [2, 2], [3, 3], [1, 1]]]
        },
        isCircle: true,
        radius: 200,
        id: "circle1"
    }
};
const textFeature = {
    geometry: {
        type: "Point",
        coordinates: [1, 2]
    },
    type: "Feature",
    properties: {isText: true, valueText: "pino"}
};
const geodesicLineString = {
    geometry: {
        type: "LineString",
        coordinates: [[1, 2], [2, 2]]
    },
    type: "Feature",
    properties: {
        useGeodesicLines: true,
        id: "geodesic.line",
        geometryGeodesic: {
            type: "LineString",
            coordinates: [[]]
        }
    }
};
describe('Test the AnnotationsUtils', () => {
    it('getAvailableStyler for point or MultiPoint', () => {
        let stylers = getAvailableStyler({type: "Point"});
        expect(stylers.length).toBe(1);
        expect(stylers[0]).toBe("marker");

        stylers = getAvailableStyler({type: "MultiPoint"});
        expect(stylers.length).toBe(1);
        expect(stylers[0]).toBe("marker");
    });
    it('getAvailableStyler for LineString or MultiLineString', () => {
        let stylers = getAvailableStyler({type: "LineString"});
        expect(stylers.length).toBe(1);
        expect(stylers[0]).toBe("lineString");

        stylers = getAvailableStyler({type: "MultiLineString"});
        expect(stylers.length).toBe(1);
        expect(stylers[0]).toBe("lineString");
    });
    it('getAvailableStyler for Polygon or MultiPolygon', () => {
        let stylers = getAvailableStyler({type: "Polygon"});
        expect(stylers.length).toBe(1);
        expect(stylers[0]).toBe("polygon");

        stylers = getAvailableStyler({type: "MultiPolygon"});
        expect(stylers.length).toBe(1);
        expect(stylers[0]).toBe("polygon");
    });
    it('getAvailableStyler for GeometryCollection', () => {
        let stylers = getAvailableStyler({type: "GeometryCollection", geometries:
            [{type: "MultiPolygon"}, {type: "MultiPoint"}]});
        expect(stylers.length).toBe(2);
        expect(stylers[0]).toBe("polygon");
        expect(stylers[1]).toBe("marker");

        stylers = getAvailableStyler({type: "GeometryCollection", geometries:
            [{type: "MultiLineString"}, {type: "MultiPoint"}, {type: "MultiPolygon"}]});
        expect(stylers.length).toBe(3);
        expect(stylers[0]).toBe("lineString");
        expect(stylers[1]).toBe("marker");
        expect(stylers[2]).toBe("polygon");
    });
    it('getRelativeStyler for simple Geoms and Text', () => {
        let styler = getRelativeStyler("Polygon");
        expect(styler).toBe("polygon");
        styler = getRelativeStyler("MultiPolygon");
        expect(styler).toBe("polygon");

        styler = getRelativeStyler("MultiPoint");
        expect(styler).toBe("marker");
        styler = getRelativeStyler("Point");
        expect(styler).toBe("marker");

        styler = getRelativeStyler("MultiLineString");
        expect(styler).toBe("lineString");
        styler = getRelativeStyler("LineString");
        expect(styler).toBe("lineString");

        styler = getRelativeStyler("Text");
        expect(styler).toBe("text");
    });
    it('default styles text', () => {
        const numStyles = Object.keys(DEFAULT_ANNOTATIONS_STYLES);
        expect(numStyles.length).toBe(8);

        const textParams = Object.keys(DEFAULT_ANNOTATIONS_STYLES.Text);
        expect(textParams.length).toBe(11);

        const {font, color, opacity, fontStyle, fontSize, fontSizeUom, textAlign, fontFamily, fontWeight, fillColor, fillOpacity} = DEFAULT_ANNOTATIONS_STYLES.Text;
        expect(font).toBe("14px Arial");
        expect(fontStyle).toBe("normal");
        expect(fontWeight).toBe("normal");
        expect(fontSize).toBe("14");
        expect(fontFamily).toBe("Arial");
        expect(fontSizeUom).toBe("px");
        expect(textAlign).toBe("center");

        expect(color).toBe("#000000");
        expect(opacity).toBe(1);
        expect(fillColor).toBe("#000000");
        expect(fillOpacity).toBe(1);
    });
    it('default styles Point', () => {
        let {iconGlyph, iconShape, iconColor} = DEFAULT_ANNOTATIONS_STYLES.Point;
        expect(iconGlyph).toBe("comment");
        expect(iconShape).toBe("square");
        expect(iconColor).toBe("blue");
    });
    it('default styles MultiPoint', () => {
        let {iconGlyph, iconShape, iconColor} = DEFAULT_ANNOTATIONS_STYLES.MultiPoint;
        expect(iconGlyph).toBe("comment");
        expect(iconShape).toBe("square");
        expect(iconColor).toBe("blue");
    });
    it('default styles LineString', () => {
        let {color, opacity, weight} = DEFAULT_ANNOTATIONS_STYLES.LineString;
        expect(color).toBe("#ffcc33");
        expect(opacity).toBe(1);
        expect(weight).toBe(3);
    });
    it('default styles Circle', () => {
        let {color, opacity, weight, fillColor, fillOpacity} = DEFAULT_ANNOTATIONS_STYLES.Circle;
        expect(color).toBe("#ffcc33");
        expect(opacity).toBe(1);
        expect(weight).toBe(3);
        expect(fillColor).toBe("#ffffff");
        expect(fillOpacity).toBe(0.2);
    });
    it('default styles MultiLineString', () => {
        let {color, opacity, weight} = DEFAULT_ANNOTATIONS_STYLES.MultiLineString;
        expect(color).toBe("#ffcc33");
        expect(opacity).toBe(1);
        expect(weight).toBe(3);
    });
    it('default styles Polygon', () => {
        let {color, opacity, weight, fillColor, fillOpacity} = DEFAULT_ANNOTATIONS_STYLES.Polygon;
        expect(color).toBe("#ffcc33");
        expect(opacity).toBe(1);
        expect(weight).toBe(3);
        expect(fillColor).toBe("#ffffff");
        expect(fillOpacity).toBe(0.2);
    });
    it('default styles MultiPolygon', () => {
        let {color, opacity, weight, fillColor, fillOpacity} = DEFAULT_ANNOTATIONS_STYLES.MultiPolygon;
        expect(color).toBe("#ffcc33");
        expect(opacity).toBe(1);
        expect(weight).toBe(3);
        expect(fillColor).toBe("#ffffff");
        expect(fillOpacity).toBe(0.2);
    });
    it('convertGeoJSONToInternalModel simple geoms', () => {
        let newGeom = convertGeoJSONToInternalModel({type: "MultiPoint"}, []);
        expect(newGeom.type).toBe("MultiPoint");
        newGeom = convertGeoJSONToInternalModel({type: "MultiPoint"}, ["someval"]);
        expect(newGeom.type).toBe("Text");
        newGeom = convertGeoJSONToInternalModel({type: "MultiLineString"}, []);
        expect(newGeom.type).toBe("MultiLineString");
        newGeom = convertGeoJSONToInternalModel({type: "LineString"}, []);
        expect(newGeom.type).toBe("LineString");
        newGeom = convertGeoJSONToInternalModel({type: "MultiPolygon"}, []);
        expect(newGeom.type).toBe("MultiPolygon");
        newGeom = convertGeoJSONToInternalModel({type: "Polygon"}, []);
        expect(newGeom.type).toBe("Polygon");
    });
    it('convertGeoJSONToInternalModel multi geoms', () => {
        let geometries = [{type: "MultiPolygon"}, {type: "MultiPoint"}];
        let newGeom = convertGeoJSONToInternalModel({type: "GeometryCollection", geometries}, []);
        newGeom.geometries.forEach((g, i) => {
            expect(g.type).toBe(geometries[i].type);
        });
        geometries = [{type: "MultiPolygon"}, {type: "MultiPoint"}];

        let convertedGeometries = [{type: "MultiPolygon"}, {type: "Text"}];
        newGeom = convertGeoJSONToInternalModel({type: "GeometryCollection", geometries}, ["some va"]);
        newGeom.geometries.forEach((g, i) => {
            expect(g.type).toBe(convertedGeometries[i].type);
        });
        geometries = [{type: "MultiPoint"}, {type: "MultiPoint"}];
        convertedGeometries = [{type: "Text"}, {type: "MultiPoint"}];
        newGeom = convertGeoJSONToInternalModel({type: "GeometryCollection", geometries}, ["some va"]);
        newGeom.geometries.forEach((g, i) => {
            expect(g.type).toBe(convertedGeometries[i].type);
        });
        geometries = [{type: "Polygon"}, {type: "MultiPoint"}];
        convertedGeometries = [{type: "Circle"}, {type: "MultiPoint"}];
        newGeom = convertGeoJSONToInternalModel({type: "GeometryCollection", geometries}, [], ["some va"]);
        newGeom.geometries.forEach((g, i) => {
            expect(g.type).toBe(convertedGeometries[i].type);
        });
        geometries = [{type: "MultiPoint"}, {type: "MultiLineString"}, {type: "MultiPoint"}];
        convertedGeometries = [{type: "Text"}, {type: "MultiLineString"}, {type: "MultiPoint"}];
        newGeom = convertGeoJSONToInternalModel({type: "GeometryCollection", geometries}, ["some va"]);
        newGeom.geometries.forEach((g, i) => {
            expect(g.type).toBe(convertedGeometries[i].type);
        });
    });
    it('create font with values', () => {
        // with defaults
        expect(createFont({})).toBe("normal normal 14px Arial");
        // with values
        expect(createFont({fontFamily: "Courier"})).toBe("normal normal 14px Courier");
        expect(createFont({fontSize: "30"})).toBe("normal normal 30px Arial");
        expect(createFont({fontSizeUom: "em"})).toBe("normal normal 14em Arial");
        expect(createFont({fontStyle: "italic"})).toBe("italic normal 14px Arial");
        expect(createFont({fontWeight: "bold"})).toBe("normal bold 14px Arial");
    });
    it('circlesToMultiPolygon', () => {
        const {geometry, properties, style} = feature;
        const f = circlesToMultiPolygon(geometry, properties, style.Circle);
        expect(f).toExist();
        expect(f.type).toBe("Feature");
        expect(f.geometry.type).toBe("MultiPolygon");
        expect(f.properties).toExist();
        expect(f.properties.ms_style).toExist();
        expect(f.properties.ms_style.strokeColor).toBe(style.Circle.color);
    });
    it('fromCircleToPolygon', () => {
        const {geometry, properties} = circle1;
        const {style} = feature;
        const ft = fromCircleToPolygon(geometry, properties, style.Circle);
        expect(ft).toExist();
        expect(ft.type).toBe("Feature");
        expect(ft.geometry.type).toBe("Polygon");
        expect(ft.properties).toExist();
        expect(ft.properties.ms_style).toExist();
        expect(ft.properties.isCircle).toBe(undefined);
        const {geometry: geometry2, properties: properties2} = circle2;

        const ft2 = fromCircleToPolygon(geometry2, properties2, style.Circle);
        expect(ft2.geometry.type).toBe("Polygon");
        expect(ft2.properties.isCircle).toBe(undefined);
    });
    it('textToPoint', () => {
        const {geometry, properties, style} = feature;
        const fts = textToPoint(geometry, properties, style.Text);
        expect(fts).toExist();
        expect(fts.length).toBe(2);
        expect(fts[0].type).toBe("Feature");
        expect(fts[0].geometry.type).toBe("MultiPoint");
        expect(fts[0].properties).toExist();
        expect(fts[0].properties.ms_style).toExist();
        expect(fts[0].properties.ms_style.label).toBe("pino");

    });
    it('fromTextToPoint', () => {
        const {geometry, properties} = textFeature;
        const {style} = feature;
        const ft = fromTextToPoint(geometry, properties, style.Text);
        expect(ft).toExist();
        expect(ft.type).toBe("Feature");
        expect(ft.geometry.type).toBe("Point");
        expect(ft.properties).toExist();
        expect(ft.properties.ms_style).toExist();
        expect(ft.properties.ms_style.label).toBe("pino");

    });
    it('fromAnnotationToGeoJson with a circle', () => {
        const ft = fromAnnotationToGeoJson(circle1);
        expect(ft.type).toBe("Feature");
        expect(ft.geometry.type).toBe("Polygon");
        expect(ft.properties).toExist();
        expect(ft.properties.ms_style).toExist();
        expect(ft.properties.isCircle).toBe(undefined);
    });
    it('fromAnnotationToGeoJson with a geodesic LineString', () => {
        const ft = fromAnnotationToGeoJson(geodesicLineString);
        expect(ft.type).toBe("Feature");
        expect(ft.geometry.type).toBe("LineString");
        expect(ft.properties).toExist();
        expect(ft.properties.ms_style).toExist();
        expect(ft.properties.geometryGeodesic).toBe(undefined);
    });
    it('fromAnnotationToGeoJson with a text', () => {
        const ft = fromAnnotationToGeoJson(textFeature);
        expect(ft.type).toBe("Feature");
        expect(ft.geometry.type).toBe("Point");
        expect(ft.properties).toExist();
        expect(ft.properties.ms_style).toExist();
        expect(ft.properties.isText).toBe(undefined);
    });
    it('fromAnnotationToGeoJson with a point', () => {
        const ft = fromAnnotationToGeoJson(featureCollection.features[0]);
        expect(ft.type).toBe("Feature");
        expect(ft.geometry.type).toBe("Point");
        expect(ft.properties).toExist();
        expect(ft.properties.ms_style).toExist();
    });
    it('fromAnnotationToGeoJson with a LineString in origin, but with a style of a startPoint', () => {
        const f = {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [[0, 0], [1, 1], [3, 3], [5, 5]]
            },
            style: getStartEndPointsForLinestring()[0]
        };
        const ft = fromAnnotationToGeoJson(f);
        expect(ft.type).toBe("Feature");
        expect(ft.geometry.type).toBe("Point");
        expect(ft.geometry.coordinates[0]).toBe(0);
        expect(ft.geometry.coordinates[1]).toBe(0);
        expect(ft.properties).toExist();
        expect(ft.properties.ms_style).toExist();
    });
    it('fromAnnotationToGeoJson with a LineString with dashArray', () => {
        const f = {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [[0, 0], [1, 1], [3, 3], [5, 5]]
            },
            style: {
                dashArray: [1, 3]
            }
        };
        const ft = fromAnnotationToGeoJson(f);
        expect(ft.type).toBe("Feature");
        expect(ft.properties).toExist();
        expect(ft.properties.ms_style).toExist();
        expect(ft.properties.ms_style.strokeDashstyle).toEqual("1 3");
    });
    it('flattenGeometryCollection', () => {
        const fts = flattenGeometryCollection(feature);
        expect(fts).toExist();
        expect(fts.length).toBe(9);
        expect(fts[6].type).toBe("Feature");
        expect(fts[6].geometry.type).toBe("MultiPolygon");
        expect(fts[6].properties.ms_style).toExist();
        expect(fts[6].properties.ms_style.strokeColor).toBe(feature.style.Circle.color);
        expect(fts[6].properties).toExist();
        expect(fts[7].type).toBe("Feature");
        expect(fts[7].geometry.type).toBe("MultiPoint");
        expect(fts[7].properties.ms_style).toExist();
        expect(fts[7].properties.ms_style.label).toBe("pino");
        expect(fts[7].properties).toExist();
    });

    it('test normalizeAnnotation defaults', () => {
        let annotation = normalizeAnnotation();
        expect(annotation.geometry.coordinates).toBe(undefined);
        expect(annotation.geometry.type).toBe(undefined);
        expect(annotation.properties.title).toBe("Default title");
    });
    it('test normalizeAnnotation with Annotation', () => {
        let annotation = normalizeAnnotation(featureCollection);
        expect(annotation.type).toBe("FeatureCollection");
        expect(annotation.features[0].geometry.type).toBe("Point");
        expect(annotation.features[1].geometry.type).toBe("LineString");

    });
    it('test removeDuplicate', () => {
        const annotations = [{properties: {id: "id1"}}, {properties: {id: "id2"}}, {properties: {id: "id2"}}];
        expect(removeDuplicate(annotations).length).toBe(2);
    });
    it('test formatCoordinates defaults and with data', () => {
        expect(formatCoordinates().length).toBe(1);
        expect(formatCoordinates()[0].lon).toBe(undefined);
        expect(formatCoordinates()[0].lat).toBe(undefined);

        const coords = [[1, 2], [3, 4]];
        expect(formatCoordinates(coords).length).toBe(2);
        expect(formatCoordinates(coords)[0].lon).toBe(1);
        expect(formatCoordinates(coords)[0].lat).toBe(2);

        const coords2 = [[1, undefined]];
        expect(formatCoordinates(coords2).length).toBe(1);
        expect(formatCoordinates(coords2)[0].lon).toBe(1);
        expect(formatCoordinates(coords2)[0].lat).toBe(undefined);
    });

    it('test getComponents defaults', () => {
        const polygonCoords3 = [[[1, 1], [2, 2], [3, 3], [1, 1]]];

        let polygonGeom = {
            type: "Polygon",
            coordinates: polygonCoords3
        };
        expect(getComponents(polygonGeom).length).toBe(3);

        const polygonCoords2 = [[[1, 1], [2, undefined], [3, 3]]];
        let polygonGeom2 = {
            type: "Polygon",
            coordinates: polygonCoords2
        };
        expect(getComponents(polygonGeom2).length).toBe(3);

        let lineString = {
            type: "LineString",
            coordinates: polygonCoords2[0]
        };
        expect(getComponents(lineString).length).toBe(3);

        let point = {
            type: "Point",
            coordinates: polygonCoords2[0][0]
        };
        expect(getComponents(point).length).toBe(1);
        expect(getComponents(point)[0].lon).toBe(1);
        expect(getComponents(point)[0].lat).toBe(1);
    });
    it('test addIds defaults', () => {
        const features = [{properties: {id: "some id"}}, {properties: {}}];
        expect(addIds(features).length).toBe(2);
        expect(addIds(features).map(f => f.properties.id)[0]).toBe("some id");
    });
    it('test validateCoords ', () => {
        expect(validateCoords({lat: undefined, lon: 2})).toBe(false);
        expect(validateCoords({lat: 4, lon: 2})).toBe(true);
    });
    it('test validateCoordsArray', () => {
        expect(validateCoordsArray([undefined, 2])).toBe(false);
        expect(validateCoordsArray([4, 2])).toBe(true);
    });
    it('test validateCoord', () => {
        expect(validateCoord(undefined)).toBe(false);
        expect(validateCoord(2)).toBe(true);
    });
    it('test coordToArray', () => {
        expect(coordToArray()[0]).toBe(undefined);
        expect(coordToArray()[1]).toBe(undefined);
        expect(coordToArray({lon: 2})[0]).toBe(2);
        expect(coordToArray({lon: 2})[1]).toBe(undefined);
        expect(coordToArray({lon: 2, lat: 1})[0]).toBe(2);
        expect(coordToArray({lon: 2, lat: 1})[1]).toBe(1);
    });
    it('test getBaseCoord', () => {
        expect(getBaseCoord().length).toBe(1);
        expect(getBaseCoord()[0].length).toBe(1);
        expect(getBaseCoord("Polygon").length).toBe(0);
        expect(getBaseCoord("LineString").length).toBe(0);
        expect(getBaseCoord("MultiPoint").length).toBe(0);
    });
    it('test validateText defaults', () => {
        let components = [{lat: 4, lon: 4}];
        let textAnnot = {
            components,
            properties: {
                valueText: "valid"
            }
        };
        expect(validateText(textAnnot)).toBe(true);

        textAnnot.properties.valueText = "";
        expect(validateText(textAnnot)).toBe(false);

        textAnnot.properties.valueText = "asdgf";
        textAnnot.components = [undefined, 4];
        expect(validateText(textAnnot)).toBe(false);

        textAnnot.components = [undefined, 4];
        expect(validateText(textAnnot)).toBe(false);
    });
    it('test validateCircle defaults', () => {
        let components = [{lat: 4, lon: 4}];
        let textAnnot = {
            components,
            properties: {
                radius: 5
            }
        };
        expect(validateCircle({})).toBe(false);
        expect(validateCircle(textAnnot)).toBe(true);

        textAnnot.properties.radius = "";
        expect(validateCircle(textAnnot)).toBe(false);

        textAnnot.properties.radius = 50;
        textAnnot.components = [undefined, 4];
        expect(validateCircle(textAnnot)).toBe(false);

        textAnnot.components = [undefined, 4];
        expect(validateCircle(textAnnot)).toBe(false);
    });
    it('test getGeometryType', ()=>{
        let geomFeature = {};
        expect(getGeometryType(geomFeature)).toBeFalsy();

        geomFeature = {...geomFeature, properties: {isCircle: true}};
        expect(getGeometryType(geomFeature)).toBe('Circle');

        geomFeature = {properties: {isText: true}};
        expect(getGeometryType(geomFeature)).toBe('Text');

        geomFeature = {geometry: {type: "Polygon"}};
        expect(getGeometryType(geomFeature)).toBe('Polygon');
    });
    it('test getGeometryGlyphInfo', ()=>{
        let point = '';
        expect(getGeometryGlyphInfo().glyph).toBe('point');

        point = 'LineString';
        expect(getGeometryGlyphInfo(point).glyph).toBe('polyline');

        point = 'Text';
        expect(getGeometryGlyphInfo(point).glyph).toBe('font');

        point = 'Circle';
        expect(getGeometryGlyphInfo(point).glyph).toBe('1-circle');
    });
    it('test validateCoordinates defaults', () => {
        let components = [{lat: 4, lon: 4}];
        let textAnnot = {
            components,
            type: "Point"
        };
        expect(validateCoordinates({})).toBe(false);
        expect(validateCoordinates(textAnnot)).toBe(true);
        textAnnot.components = [[undefined, 4]];
        expect(validateCoordinates(textAnnot)).toBe(false);
        textAnnot.components = [{lat: 4, lon: 4}];
        expect(validateCoordinates(textAnnot)).toBe(true);
        textAnnot.components = [[undefined, 4]];
        expect(validateCoordinates(textAnnot)).toBe(false);
    });
    it('test validateFeature defaults', () => {
        let components = [{lat: 4, lon: 4}];
        let textAnnot = {
            components,
            type: "Point"
        };
        expect(validateFeature({})).toBe(false);
        expect(validateFeature(textAnnot)).toBe(true);
    });
    it('test annotationsToPrint from featureCollection', () => {
        let fts = annotationsToPrint([featureCollection]);
        expect(fts).toExist();
        expect(fts.length).toBe(2);
        expect(fts[0].geometry.type).toBe("Point");
        expect(fts[1].geometry.type).toBe("LineString");
    });
    it('test annotationsToPrint from array of geometryCollection', () => {
        let fts = annotationsToPrint([feature]);
        expect(fts).toExist();
        expect(fts.length).toBe(9);
        expect(fts[0].geometry.type).toBe("MultiPolygon");
        expect(fts[1].geometry.type).toBe("MultiLineString");
        expect(fts[2].geometry.type).toBe("MultiPoint");
        expect(fts[3].geometry.type).toBe("MultiPoint");
        expect(fts[4].geometry.type).toBe("MultiPoint");
        expect(fts[5].geometry.type).toBe("MultiPoint");
        expect(fts[6].geometry.type).toBe("MultiPolygon");
        expect(fts[7].geometry.type).toBe("MultiPoint");
        expect(fts[8].geometry.type).toBe("MultiPoint");
    });
    it('test annotationsToPrint from a lineString', () => {
        const f = {
            type: "FeatureCollection",
            features: [{
                type: "Feature",
                geometry: {
                    type: "LineString",
                    coordinates: [[0, 0], [1, 1], [3, 3], [5, 5]]
                },
                style: [{
                    color: "#FF0000"
                }].concat(getStartEndPointsForLinestring())
            }]
        };
        let fts = annotationsToPrint([f]);
        expect(fts).toExist();
        expect(fts.length).toBe(1); // filter the style not applied
    });
    it('getStartEndPointsForLinestring, defaults', () => {
        const styles = getStartEndPointsForLinestring();
        expect(styles.length).toBe(2);
        expect(styles[0].iconShape).toBe("square");
        expect(styles[0].iconGlyph).toBe("comment");
        expect(styles[0].iconColor).toBe("blue");
        expect(typeof styles[0].id).toBe("string");
        expect(styles[0].geometry).toBe("startPoint");
        expect(styles[0].filtering).toBe(false);
        expect(styles[0].highlight).toBe(true);
        expect(styles[0].iconAnchor.length).toBe(2);
        expect(styles[0].iconAnchor[0]).toBe(0.5);
        expect(styles[0].iconAnchor[1]).toBe(0.5);
        expect(styles[0].type).toBe("Point");
        expect(styles[0].title).toBe("StartPoint Style");

        expect(styles[1].iconShape).toBe("square");
        expect(styles[1].iconGlyph).toBe("comment");
        expect(styles[1].iconColor).toBe("blue");
        expect(typeof styles[1].id).toBe("string");
        expect(styles[1].geometry).toBe("endPoint");
        expect(styles[1].filtering).toBe(false);
        expect(styles[1].highlight).toBe(true);
        expect(styles[1].iconAnchor.length).toBe(2);
        expect(styles[1].iconAnchor[0]).toBe(0.5);
        expect(styles[1].iconAnchor[1]).toBe(0.5);
        expect(styles[1].type).toBe("Point");
        expect(styles[1].title).toBe("EndPoint Style");
    });
    it('createGeometryFromGeomFunction startPoint', () => {
        // feature with start point style but with a linestring ad geom
        const f = {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [[0, 0], [1, 1], [3, 3], [5, 5]]
            },
            style: getStartEndPointsForLinestring()[0]
        };
        const newGeom = createGeometryFromGeomFunction(f);
        expect(newGeom.type).toBe("Point");
        expect(newGeom.coordinates[0]).toBe(0);
        expect(newGeom.coordinates[0]).toBe(0);
    });
    it('createGeometryFromGeomFunction startPoint', () => {
        // feature with end point style but with a linestring ad geom
        const f = {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [[0, 0], [1, 1], [3, 3], [5, 5]]
            },
            style: getStartEndPointsForLinestring()[1]
        };
        const newGeom = createGeometryFromGeomFunction(f);
        expect(newGeom.type).toBe("Point");
        expect(newGeom.coordinates[0]).toBe(5);
        expect(newGeom.coordinates[0]).toBe(5);
    });
    it('createGeometryFromGeomFunction centerPoint', () => {
        // feature with end point style but with a linestring ad geom
        const f = {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [[0, 0], [5, 5]]
            },
            style: {...getStartEndPointsForLinestring()[1], geometry: "centerPoint"}
        };
        const newGeom = createGeometryFromGeomFunction(f);
        expect(newGeom.type).toBe("Point");
        expect(newGeom.coordinates[0]).toBe(2.5);
        expect(newGeom.coordinates[0]).toBe(2.5);
    });
    it('createGeometryFromGeomFunction lineString', () => {
        // feature with end point style but with a linestring ad geom
        const f = {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [[0, 0], [1, 1], [3, 3], [5, 5]]
            },
            style: {
                color: "#FF0000"
            }
        };
        const newGeom = createGeometryFromGeomFunction(f);
        expect(newGeom.type).toBe("LineString");
        expect(newGeom.coordinates[0][0]).toBe(0);
        expect(newGeom.coordinates[0][1]).toBe(0);
        expect(newGeom.coordinates[3][0]).toBe(5);
        expect(newGeom.coordinates[3][1]).toBe(5);
    });
    it('updateAllStyles, defaults', () => {
        const f = {
            type: "FeatureCollection",
            features: []
        };
        const newFcoll = updateAllStyles(f);
        expect(newFcoll.features.length).toBe(0);
    });
    it('updateAllStyles, with new props', () => {
        const f = {
            type: "FeatureCollection",
            features: [{
                type: "Feature",
                geometry: {
                    type: "LineString",
                    coordinates: [[0, 0], [1, 1], [3, 3], [5, 5]]
                },
                style: [{
                    color: "#FF0000"
                }].concat(getStartEndPointsForLinestring())
            }]
        };
        const newFcoll = updateAllStyles(f, {highlight: true});
        expect(newFcoll.features.length).toBe(1);
        newFcoll.features.map(ft => {
            ft.style.map(s => {
                expect(s.highlight).toBe(true);
            });
        });
    });
    it('fromLineStringToGeodesicLineString', () => {
        const geometryGeodesic = {
            type: "LineString",
            coordinates: [[1, 1], [2, 2]]
        };
        const properties = {
            geometryGeodesic,
            id: "VR46"
        };
        const f = fromLineStringToGeodesicLineString(properties, {color: "#12233"});
        expect(f.geometry).toEqual(geometryGeodesic);
        expect(f.type).toEqual("Feature");
        expect(f.properties.id).toEqual("VR46");
        expect(f.properties.ms_style).toExist();
    });

    it('test isCompletePolygon defaults', () => {
        const polygonCoords1 = [[[1, 1], [2, 2]]];
        const polygonCoords2 = [[[1, 1], [2, 2], [1, 1]]];
        const polygonCoords3 = [[[1, 1], [2, 2], [3, 3], [1, 1]]];
        const polygonCoords4 = [[[1, 1], [2, undefined], [3, 3], [1, 1]]];
        expect(isCompletePolygon()).toBe(false);
        expect(isCompletePolygon(polygonCoords1)).toBe(false);
        expect(isCompletePolygon(polygonCoords2)).toBe(false);
        expect(isCompletePolygon(polygonCoords3)).toBe(true);
        expect(isCompletePolygon(polygonCoords4)).toBe(false);
    });
    it('test getDashArrayFromStyle', () => {
        // default
        expect(getDashArrayFromStyle()).toEqual("");
        expect(getDashArrayFromStyle("3 4 5")).toEqual("3 4 5");
        expect(getDashArrayFromStyle(["3", "4", "5"])).toEqual("3 4 5");
    });
    it('test annotationsToPrint strokeDashstyle defaults to solid', () => {
        const f = {
            type: "FeatureCollection",
            features: [{
                type: "Feature",
                geometry: {
                    type: "LineString",
                    coordinates: [[0, 0], [1, 1], [3, 3], [5, 5]]
                },
                style: [{
                    color: "#FF0000"
                }].concat(getStartEndPointsForLinestring())
            }]
        };
        let fts = annotationsToPrint([f]);
        expect(fts).toExist();
        expect(fts.length).toBe(1);
        expect(fts[0].properties.ms_style).toExist();
        expect(fts[0].properties.ms_style.strokeDashstyle).toBe('solid');
    });

    it('test annotationsToPrint text without outline', () => {
        const f = {
            type: "FeatureCollection",
            features: [{
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [0, 0]
                },
                style: {
                    color: "#000000",
                    fillColor: "#000000",
                    fillOpacity: 1,
                    font: "14px Arial",
                    fontFamily: "Arial",
                    fontSize: "14",
                    fontSizeUom: "px",
                    fontStyle: "normal",
                    fontWeight: "normal",
                    highlight: false,
                    label: "test",
                    opacity: 1,
                    textAlign: "center",
                    title: "Text Style",
                    type: "Text"
                }
            }]
        };
        let fts = annotationsToPrint([f]);
        expect(fts).toExist();
        expect(fts.length).toBe(1);
        expect(fts[0].properties.ms_style).toExist();
        expect(fts[0].properties.ms_style.labelOutlineColor).toNotExist();
    });

    it('test annotationsToPrint text with outline', () => {
        const f = {
            type: "FeatureCollection",
            features: [{
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [0, 0]
                },
                style: {
                    color: "#000000",
                    fillColor: "#000000",
                    fillOpacity: 1,
                    font: "14px Arial",
                    fontFamily: "Arial",
                    fontSize: "14",
                    fontSizeUom: "px",
                    fontStyle: "normal",
                    fontWeight: "normal",
                    highlight: false,
                    label: "test",
                    opacity: 1,
                    textAlign: "center",
                    title: "Text Style",
                    type: "Text",
                    weight: 2.0
                },
                properties: {
                    isText: true
                }
            }]
        };
        let fts = annotationsToPrint([f]);
        expect(fts).toExist();
        expect(fts.length).toBe(1);
        expect(fts[0].properties.ms_style).toExist();
        expect(fts[0].properties.ms_style.labelOutlineColor).toExist();
    });
});
