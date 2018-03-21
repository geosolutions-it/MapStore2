/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const expect = require('expect');

const {getAvailableStyler, getRelativeStyler, convertGeoJSONToInternalModel, DEFAULT_ANNOTATIONS_STYLES, createFont,
circlesToMultiPolygon, textToPoint, flattenGeometryCollection} = require('../AnnotationsUtils');

const feature = require("json-loader!../../test-resources/Annotation.json");

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
        expect(textParams.length).toBe(9);

        const {font, color, opacity, fontStyle, fontSize, fontSizeUom, textAlign, fontFamily, fontWeight} = DEFAULT_ANNOTATIONS_STYLES.Text;
        expect(font).toBe("14px FontAwesome");
        expect(color).toBe("#000000");
        expect(fontStyle).toBe("normal");
        expect(fontWeight).toBe("normal");
        expect(fontSize).toBe("14");
        expect(fontFamily).toBe("FontAwesome");
        expect(fontSizeUom).toBe("px");
        expect(textAlign).toBe("center");
        expect(opacity).toBe(1);
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
        let {color, opacity, weight, fillColor, fillOpacity} = DEFAULT_ANNOTATIONS_STYLES.LineString;
        expect(color).toBe("#ffcc33");
        expect(opacity).toBe(1);
        expect(weight).toBe(3);
        expect(fillColor).toBe("#ffffff");
        expect(fillOpacity).toBe(0.2);
    });
    it('default styles MultiLineString', () => {
        let {color, opacity, weight, fillColor, fillOpacity} = DEFAULT_ANNOTATIONS_STYLES.MultiLineString;
        expect(color).toBe("#ffcc33");
        expect(opacity).toBe(1);
        expect(weight).toBe(3);
        expect(fillColor).toBe("#ffffff");
        expect(fillOpacity).toBe(0.2);
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
        expect(createFont({})).toBe("normal normal 14px FontAwesome");

        // with values
        expect(createFont({fontFamily: "Courier"})).toBe("normal normal 14px Courier");
        expect(createFont({fontSize: "30"})).toBe("normal normal 30px FontAwesome");
        expect(createFont({fontSizeUom: "em"})).toBe("normal normal 14em FontAwesome");
        expect(createFont({fontStyle: "italic"})).toBe("italic normal 14px FontAwesome");
        expect(createFont({fontWeight: "bold"})).toBe("normal bold 14px FontAwesome");
    });

    it('circlesToMultiPolygon', () => {
        const {geometry, properties, style} = feature;
        const f = circlesToMultiPolygon(geometry, properties, style.Circle);
        expect(f).toExist();
        expect(f.type).toBe("Feature");
        expect(f.geometry.type).toBe("MultiPolygon");
        expect(f.properties.ms_style).toExist();
        expect(f.properties.ms_style.strokeColor).toBe(style.Circle.color);
        expect(f.properties).toExist();

    });
    it('textToPoint', () => {
        const {geometry, properties, style} = feature;
        const fts = textToPoint(geometry, properties, style.Text);
        expect(fts).toExist();
        expect(fts.length).toBe(2);
        expect(fts[0].type).toBe("Feature");
        expect(fts[0].geometry.type).toBe("MultiPoint");
        expect(fts[0].properties.ms_style).toExist();
        expect(fts[0].properties.ms_style.label).toBe("pino");
        expect(fts[0].properties).toExist();

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

});
