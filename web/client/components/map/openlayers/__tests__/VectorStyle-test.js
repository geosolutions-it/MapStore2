/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const expect = require('expect');
const {
    getCircleStyle,
    getMarkerStyle,
    getStrokeStyle,
    getFillStyle,
    getTextStyle,
    getGeometryTrasformation,
    getFilter,
    parseStyles
} = require('../VectorStyle');
const ol = require('openlayers');
const {isArray} = require('lodash');
const baseImageUrl = require('../../../mapcontrols/annotations/img/markers_default.png');
const shadowImageUrl = require('../../../mapcontrols/annotations/img/markers_shadow.png');
const MarkerUtils = require('../../../../utils/MarkerUtils');
const {colorToRgbaStr} = require('../../../../utils/ColorUtils');
const glyphs = MarkerUtils.getGlyphs('fontawesome');

describe('Test VectorStyle', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="map"></div><div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('getCircleStyle, default', () => {
        const olStyle = getCircleStyle();
        expect(olStyle).toBe(null);
    });
    it('getCircleStyle, with a non Circle Style', () => {
        const olStyle = getCircleStyle({
            color: "#223366",
            fillColor: "#998877"
        });
        expect(olStyle).toBe(null);
    });
    it('getCircleStyle, with a Circle Style', () => {
        const olStyle = getCircleStyle({
            radius: 800
        });
        expect(typeof olStyle).toBe("object");
        expect(olStyle.getRadius()).toBe(800);
        expect(olStyle.getStroke()).toBe(null);
        expect(olStyle.getFill()).toBe(null);
    });
    it('getCircleStyle, with a Circle Style, with stroke and fill', () => {
        const strokeStyle = {
            color: "#223366"
        };
        const stroke = new ol.style.Stroke(strokeStyle);
        const fillStyle = {
            color: "#998877"
        };
        const fill = new ol.style.Fill(fillStyle);
        const olStyle = getCircleStyle({
                radius: 800
            },
            stroke,
            fill
        );
        expect(typeof olStyle).toBe("object");
        expect(olStyle.getRadius()).toBe(800);
        expect(olStyle.getStroke()).toNotBe(null);
        expect(olStyle.getStroke().getColor()).toBe("#223366");
        expect(olStyle.getFill()).toNotBe(null);
        expect(olStyle.getFill().getColor()).toBe("#998877");
    });
    it('getMarkerStyle, default', () => {
        const olStyle = getMarkerStyle();
        expect(olStyle).toBe(null);
    });
    it('getMarkerStyle, with a non Marker Style', () => {
        const olStyle = getMarkerStyle({
            color: "#223366",
            fillColor: "#998877"
        });
        expect(olStyle).toBe(null);
    });
    it('getMarkerStyle, with a Marker Style', () => {
        const olStyle = getMarkerStyle({
            iconGlyph: "comment",
            iconShape: "square",
            iconColor: "blue"
        });
        expect(typeof olStyle).toBe("object");
        expect(isArray(olStyle)).toBe(true);
        expect(olStyle.length).toBe(2);
        expect(olStyle[0].getStroke()).toBe(null);
        expect(olStyle[0].getFill()).toBe(null);

        expect(olStyle[1].getStroke()).toBe(null);
        expect(olStyle[1].getFill()).toBe(null);
    });
    it('getMarkerStyle, with a Marker Style, but no highlight, extra library', () => {
        // this test works with a loading img limit: 8192 bytes
        const markerStyle = {
            iconGlyph: "comment",
            iconShape: "square",
            iconColor: "blue"
        };
        const olStyle = getMarkerStyle(markerStyle);
        expect(typeof olStyle).toBe("object");
        expect(isArray(olStyle)).toBe(true);
        expect(olStyle.length).toBe(2);
        // ******** shadow ********
        expect(olStyle[0].getStroke()).toBe(null);
        expect(olStyle[0].getFill()).toBe(null);
        expect(olStyle[0].getImage().getSrc()).toBe(shadowImageUrl);
        expect(olStyle[0].getImage().getAnchor()).toEqual([12, 12]);
        expect(olStyle[0].getImage().getSize()).toEqual(null);
        expect(olStyle[0].getImage().getOrigin()).toEqual([0, 0]);
        // ******** marker ********
        expect(olStyle[1].getFill()).toBe(null);
        expect(olStyle[1].getStroke()).toBe(null);
        expect(olStyle[1].getImage().getSrc()).toBe(baseImageUrl);
        expect(olStyle[1].getImage().getAnchor()).toEqual([18, 46]);
        expect(olStyle[1].getImage().getSize()).toEqual([36, 46]);
        expect(olStyle[1].getImage().getOrigin()).toEqual([180, 46]);
        expect(olStyle[1].getText().getText()).toEqual(glyphs[markerStyle.iconGlyph]);
        expect(olStyle[1].getText().getFont()).toEqual("14px FontAwesome");
        expect(olStyle[1].getText().getOffsetY()).toEqual(-30.666666666666668);
        expect(olStyle[1].getText().getFill().getColor()).toEqual("#FFFFFF");
    });
    it('getMarkerStyle, with a Marker Style and highlight', () => {
        // this test works with a loading img limit: 8192 bytes
        const markerStyle = {
            iconGlyph: "comment",
            iconShape: "square",
            iconColor: "blue",
            highlight: true
        };
        const olStyle = getMarkerStyle(markerStyle);
        expect(typeof olStyle).toBe("object");
        expect(isArray(olStyle)).toBe(true);
        expect(olStyle.length).toBe(3);
        // **************** shadow ****************
        expect(olStyle[0].getStroke()).toBe(null);
        expect(olStyle[0].getFill()).toBe(null);
        expect(olStyle[0].getImage().getSrc()).toBe(shadowImageUrl);
        expect(olStyle[0].getImage().getAnchor()).toEqual([12, 12]);
        expect(olStyle[0].getImage().getSize()).toEqual(null);
        expect(olStyle[0].getImage().getOrigin()).toEqual([0, 0]);
        // **************** marker ****************
        expect(olStyle[1].getFill()).toBe(null);
        expect(olStyle[1].getStroke()).toBe(null);
        expect(olStyle[1].getImage().getSrc()).toBe(baseImageUrl);
        expect(olStyle[1].getImage().getAnchor()).toEqual([18, 46]);
        expect(olStyle[1].getImage().getSize()).toEqual([36, 46]);
        expect(olStyle[1].getImage().getOrigin()).toEqual([180, 46]);
        expect(olStyle[1].getText().getText()).toEqual(glyphs[markerStyle.iconGlyph]);
        expect(olStyle[1].getText().getFont()).toEqual("14px FontAwesome");
        expect(olStyle[1].getText().getOffsetY()).toEqual(-30.666666666666668);
        expect(olStyle[1].getText().getFill().getColor()).toEqual("#FFFFFF");
        // **************** highlight ****************
        expect(olStyle[2].getText().getText()).toEqual("\ue165");
        expect(olStyle[2].getText().getFont()).toEqual("18px mapstore2");
        expect(olStyle[2].getText().getOffsetY()).toEqual(-56);
        expect(olStyle[2].getText().getFill().getColor()).toEqual("#FF00FF");
    });
    it('getMarkerStyle, with a Marker Style with url, no shadow, no highlight', () => {
        const markerStyle = {
            iconUrl: "url",
            highlight: false
        };
        const olStyles = getMarkerStyle(markerStyle);
        expect(typeof olStyles).toBe("object");
        expect(isArray(olStyles)).toBe(true);
        expect(olStyles.length).toBe(1);
        // **************** icon ****************
        expect(olStyles[0].getImage().getSrc()).toBe("url");
        // this is weird, and a bug of ol see https://github.com/openlayers/openlayers/issues/6557
        // if you dont pass a size and units is fraction then anchor is null (but seems to be applied)
        const image = olStyles[0].getImage();
        expect(image.getAnchor()).toEqual(null);
        expect(image.getSize()).toEqual(null);
        expect(image.getOrigin()).toEqual([0, 0]);
    });
    it('getMarkerStyle, with a Marker Style with url, no shadow, yes highlight', () => {
        const markerStyle = {
            iconUrl: "url",
            highlight: true
        };
        const olStyles = getMarkerStyle(markerStyle);
        expect(typeof olStyles).toBe("object");
        expect(isArray(olStyles)).toBe(true);
        expect(olStyles.length).toBe(2);
        // **************** icon ****************
        const image = olStyles[0].getImage();
        expect(image.getSrc()).toBe("url");
        // this is weird, and a bug of ol see https://github.com/openlayers/openlayers/issues/6557, if you dont pass a size and units is fraction then anchor is null (but seems to be applied)
        expect(image.getAnchor()).toEqual(null);
        // expect(image.getSize()).toEqual(null);
        expect(image.getOrigin()).toEqual([0, 0]);
    });
    it('getMarkerStyle, with a Marker Style with url and anchor in pixels, no shadow, no highlight', () => {
        const markerStyle = {
            iconUrl: "url",
            highlight: false,
            iconAnchor: [52, 52]
        };
        const olStyles = getMarkerStyle(markerStyle);
        expect(typeof olStyles).toBe("object");
        expect(isArray(olStyles)).toBe(true);
        expect(olStyles.length).toBe(1);
        // **************** icon ****************
        expect(olStyles[0].getImage().getSrc()).toBe("url");
        // this is weird, and a bug of ol see https://github.com/openlayers/openlayers/issues/6557, if you dont pass a size and units is fraction then anchor is null (but seems to be applied)
        expect(olStyles[0].getImage().getAnchor()).toEqual([52, 52]);
        // expect(olStyles[0].getImage().getSize()).toEqual(null);
        expect(olStyles[0].getImage().getOrigin()).toEqual([0, 0]);
    });
    it('getMarkerStyle, with a Marker Style with url and anchor in pixels, no shadow, no highlight', () => {
        const markerStyle = {
            iconUrl: "url",
            highlight: false,
            iconAnchor: [52, 52]
        };
        const olStyles = getMarkerStyle(markerStyle);
        expect(typeof olStyles).toBe("object");
        expect(isArray(olStyles)).toBe(true);
        expect(olStyles.length).toBe(1);
        // **************** icon ****************
        expect(olStyles[0].getImage().getSrc()).toBe("url");
        // this is weird, and a bug of ol see https://github.com/openlayers/openlayers/issues/6557, if you dont pass a size and units is fraction then anchor is null (but seems to be applied)
        expect(olStyles[0].getImage().getAnchor()).toEqual([52, 52]);
        // expect(olStyles[0].getImage().getSize()).toEqual(null);
        expect(olStyles[0].getImage().getOrigin()).toEqual([0, 0]);
    });
    it('getMarkerStyle, with a Marker Style with url, yes shadow, no highlight', () => {
        const markerStyle = {
            iconUrl: "iconUrl",
            shadowUrl: "shadowUrl",
            highlight: false
        };
        const olStyles = getMarkerStyle(markerStyle);
        expect(typeof olStyles).toBe("object");
        expect(isArray(olStyles)).toBe(true);
        expect(olStyles.length).toBe(2);
        // **************** shadow ****************
        expect(olStyles[0].getImage().getSrc()).toBe("shadowUrl");
        expect(olStyles[0].getImage().getAnchor()).toEqual([12, 41]);
        // **************** icon ****************
        expect(olStyles[1].getImage().getSrc()).toBe("iconUrl");
        // this is weird, and a bug of ol see https://github.com/openlayers/openlayers/issues/6557, if you dont pass a size anchor is null, but seems to be applied?
        expect(olStyles[1].getImage().getAnchor()).toEqual(null);
        expect(olStyles[0].getImage().getSize()).toEqual(null);
        expect(olStyles[1].getImage().getOrigin()).toEqual([0, 0]);
    });
    it('getMarkerStyle, with a Marker Style with url, yes shadow, yes highlight', () => {
        const markerStyle = {
            iconUrl: "iconUrl",
            shadowUrl: "shadowUrl",
            highlight: true
        };
        const olStyles = getMarkerStyle(markerStyle);
        expect(typeof olStyles).toBe("object");
        expect(isArray(olStyles)).toBe(true);
        expect(olStyles.length).toBe(3);
        // **************** shadow ****************
        expect(olStyles[0].getImage().getSrc()).toBe("shadowUrl");
        expect(olStyles[0].getImage().getAnchor()).toEqual([12, 41]);
        // **************** icon ****************
        expect(olStyles[1].getImage().getSrc()).toBe("iconUrl");
        // this is weird, and a bug of ol see https://github.com/openlayers/openlayers/issues/6557, if you dont pass a size anchor is null, but seems to be applied?
        expect(olStyles[1].getImage().getAnchor()).toEqual(null);
        expect(olStyles[0].getImage().getSize()).toEqual(null);
        expect(olStyles[1].getImage().getOrigin()).toEqual([0, 0]);
    });
    it('getMarkerStyle, with a Marker Style with url with anchor, yes shadow, yes highlight', () => {
        const markerStyle = {
            iconUrl: "iconUrl",
            shadowUrl: "shadowUrl",
            iconAnchor: [5, 5],
            highlight: true
        };
        const olStyles = getMarkerStyle(markerStyle);
        expect(typeof olStyles).toBe("object");
        expect(isArray(olStyles)).toBe(true);
        expect(olStyles.length).toBe(3);
        // **************** shadow ****************
        expect(olStyles[0].getImage().getSrc()).toBe("shadowUrl");
        expect(olStyles[0].getImage().getAnchor()).toEqual([12, 41]);
        // **************** icon ****************
        expect(olStyles[1].getImage().getSrc()).toBe("iconUrl");
        // this is weird, and a bug of ol see https://github.com/openlayers/openlayers/issues/6557, if you dont pass a size anchor is null, but seems to be applied?
        expect(olStyles[1].getImage().getAnchor()).toEqual([5, 5]);
        // expect(olStyles[0].getImage().getSize()).toEqual(null);
        expect(olStyles[1].getImage().getOrigin()).toEqual([0, 0]);
    });
    it('getStrokeStyle, with a marker style', () => {
        const olStyle = getStrokeStyle({iconUrl: "url"});
        expect(olStyle).toBe(null);
    });
    it('getStrokeStyle, with Stroke obj, with defaults, no highlight', () => {
        /* TODO verify where in the codebase it is passing a stroke object or do a blame in the history.
        Options are:
        - remove it
        - test it more, on ol they say that some defaults are applied, but it is not the case
        (https://openlayers.org/en/v4.6.5/apidoc/ol.style.Stroke.html)
        */
        const strokeStyle = {
            color: "#ffffff",
            stroke: {
                color: "#ffffff",
                opacity: 0.5
            }
        };
        const olStyle = getStrokeStyle(strokeStyle);
        expect(typeof olStyle).toBe("object");
        expect(isArray(olStyle)).toBe(false);
        expect(olStyle.getColor()).toBe("#ffffff");
        expect(olStyle.getWidth()).toBe(undefined);
        expect(olStyle.getLineCap()).toBe(undefined);
        expect(olStyle.getLineDash()).toEqual(null);
        expect(olStyle.getLineDashOffset()).toBe(undefined);
        expect(olStyle.getLineJoin()).toBe(undefined);
        expect(olStyle.getMiterLimit()).toBe(undefined);
    });
    it('getStrokeStyle, without Stroke obj, with color, other defaults, no highlight', () => {
        const strokeStyle = {
            color: "#ffffff",
            highlight: false
        };
        const olStyle = getStrokeStyle(strokeStyle);
        expect(typeof olStyle).toBe("object");
        expect(isArray(olStyle)).toBe(false);
        expect(olStyle.getColor()).toBe(colorToRgbaStr(strokeStyle.color, strokeStyle.opacity));
        expect(olStyle.getWidth()).toBe(1);
        expect(olStyle.getLineCap()).toBe("round");
        expect(olStyle.getLineDash()).toEqual([0]);
        expect(olStyle.getLineDashOffset()).toBe(0);
        expect(olStyle.getLineJoin()).toBe("round");
        expect(olStyle.getMiterLimit()).toBe(undefined);
    });
    it('getStrokeStyle, without Stroke obj, with opacity, other defaults, no highlight', () => {
        const strokeStyle = {
            opacity: 0.5,
            highlight: false
        };
        const olStyle = getStrokeStyle(strokeStyle);
        expect(typeof olStyle).toBe("object");
        expect(isArray(olStyle)).toBe(false);
        // default color --> #0000FF
        expect(olStyle.getColor()).toBe(colorToRgbaStr("#0000FF", strokeStyle.opacity));
        expect(olStyle.getWidth()).toBe(1);
        expect(olStyle.getLineCap()).toBe("round");
        expect(olStyle.getLineDash()).toEqual([0]);
        expect(olStyle.getLineDashOffset()).toBe(0);
        expect(olStyle.getLineJoin()).toBe("round");
        expect(olStyle.getMiterLimit()).toBe(undefined);
    });
    it('getStrokeStyle, without Stroke obj, with opacity, other defaults, yes highlight', () => {
        const strokeStyle = {
            opacity: 0.5,
            highlight: true
        };
        const olStyle = getStrokeStyle(strokeStyle);
        expect(typeof olStyle).toBe("object");
        expect(isArray(olStyle)).toBe(false);
        expect(olStyle.getColor()).toEqual([ 0, 153, 255, 1 ]);
        expect(olStyle.getWidth()).toBe(1);
        expect(olStyle.getLineCap()).toBe("round");
        expect(olStyle.getLineDash()).toEqual([0]);
        expect(olStyle.getLineDashOffset()).toBe(0);
        expect(olStyle.getLineJoin()).toBe("round");
        expect(olStyle.getMiterLimit()).toBe(undefined);
    });
    it('getStrokeStyle, without Stroke obj, with all values, no highlight', () => {
        const strokeStyle = {
            opacity: 0,
            color: "#012345",
            weight: 5,
            dashArray: [6],
            lineCap: 'butt',
            lineJoin: 'bevel',
            dashOffset: 2,
            highlight: false
        };
        const olStyle = getStrokeStyle(strokeStyle);
        expect(typeof olStyle).toBe("object");
        expect(isArray(olStyle)).toBe(false);
        expect(olStyle.getColor()).toEqual(colorToRgbaStr(strokeStyle.color, strokeStyle.opacity));
        expect(olStyle.getWidth()).toBe(5);
        expect(olStyle.getLineCap()).toBe("butt");
        expect(olStyle.getLineDash()).toEqual([6]);
        expect(olStyle.getLineDashOffset()).toBe(2);
        expect(olStyle.getLineJoin()).toBe("bevel");
        expect(olStyle.getMiterLimit()).toBe(undefined);
    });
    it('getFillStyle, with a marker style', () => {
        const olStyle = getFillStyle({iconUrl: "url"});
        expect(olStyle).toBe(null);
    });
    it('getFillStyle, with a fill obj', () => {
        const olStyle = getFillStyle({fill: {
            fillColor: "#123254"
        }});
        expect(olStyle).toBe(null);
    });
    it('getFillStyle, defaults, no highlight', () => {
        let fillStyle = {
            fillColor: "#123254"
        };
        let olStyle = getFillStyle(fillStyle);
        expect(olStyle.getColor()).toBe(colorToRgbaStr(fillStyle.fillColor, fillStyle.fillOpacity));
        fillStyle = {
            fillOpacity: 0.5
        };
        olStyle = getFillStyle(fillStyle);
        expect(olStyle.getColor()).toBe(colorToRgbaStr("#0000FF", fillStyle.fillOpacity));
    });
    it('getTextStyle, with a marker style', () => {
        const olStyle = getTextStyle({iconUrl: "url"});
        expect(olStyle).toBe(null);
    });
    it('getTextStyle, with a Text style, defaults, no highlight', () => {
        const textStyle = {
            label: "a label"
        };
        const olStyle = getTextStyle(textStyle);
        expect(typeof olStyle).toBe("object");
        expect(isArray(olStyle)).toBe(false);
        expect(olStyle.getText()).toBe(textStyle.label);
    });
    it('getTextStyle, with a Text style, no highlight', () => {
        const textStyle = {
            font: "12px Arial",
            label: "12px Arial"
        };
        const olStyle = getTextStyle(textStyle);
        expect(typeof olStyle).toBe("object");
        expect(isArray(olStyle)).toBe(false);
        expect(olStyle.getText()).toBe(textStyle.label);
    });
    it('getGeometryTrasformation, with marker style, no geometry', () => {
        const markerStyle = {
            iconGlyph: "comment",
            iconShape: "square",
            iconColor: "blue"
        };
        const geomFunc = getGeometryTrasformation(markerStyle);
        expect(geomFunc).toNotBe(null);
        const feature = new ol.Feature({
            geometry: new ol.geom.Point([1, 2]),
            labelPoint: new ol.geom.Point([1, 1]),
            name: 'My Polygon'
        });
        expect(geomFunc(feature).getType()).toBe("Point");
    });
    it('getGeometryTrasformation, with marker style, geometry applied to polygon', () => {
        const markerStyle = {
            iconGlyph: "comment",
            iconShape: "square",
            iconColor: "blue",
            geometry: "centerPoint"
        };
        const geomFunc = getGeometryTrasformation(markerStyle);
        expect(geomFunc).toNotBe(null);
        const feature = new ol.Feature({
            geometry: new ol.geom.Polygon([[[1, 2], [2, 2], [3, 2], [1, 2]]]),
            labelPoint: new ol.geom.Point([1, 1]),
            name: 'My Polygon'
        });
        expect(geomFunc(feature).getType()).toBe("Point");
    });
    it('getGeometryTrasformation, with lineStyle, geometry transformation applied to MultiPoint', () => {
        const markerStyle = {
            color: "#995511",
            geometry: "lineToArc"
        };
        const geomFunc = getGeometryTrasformation(markerStyle);
        expect(geomFunc).toNotBe(null);
        const feature = new ol.Feature({
            geometry: new ol.geom.MultiPoint([[1, 2], [2, 2], [3, 2], [1, 2]]),
            labelPoint: new ol.geom.Point([1, 1]),
            name: 'My Polygon'
        });
        expect(geomFunc(feature).getType()).toBe("LineString");
    });
    it('getGeometryTrasformation, with lineStyle, geometry transformation not applied to Polygon', () => {
        const markerStyle = {
            color: "#995511",
            geometry: "lineToArc"
        };
        const geomFunc = getGeometryTrasformation(markerStyle);
        expect(geomFunc).toNotBe(null);
        const feature = new ol.Feature({
            geometry: new ol.geom.Polygon([[[1, 2], [2, 2], [3, 2], [1, 2]]]),
            labelPoint: new ol.geom.Point([1, 1]),
            name: 'My Polygon'
        });
        expect(geomFunc(feature).getType()).toBe("Polygon");
    });
    it('getFilter, old style version', () => {
        const markerStyle = {
            iconGlyph: "comment",
            iconShape: "square",
            iconColor: "blue"
        };
        expect(getFilter(markerStyle)).toBe(true);
    });
    it('getFilter, filtering true', () => {
        const markerStyle = {
            iconGlyph: "comment",
            iconShape: "square",
            iconColor: "blue",
            filtering: true
        };
        expect(getFilter(markerStyle)).toBe(true);
    });
    it('getFilter, filtering false', () => {
        const markerStyle = {
            iconGlyph: "comment",
            iconShape: "square",
            iconColor: "blue",
            filtering: false
        };
        expect(getFilter(markerStyle)).toBe(false);
    });
    it('parseStyles, default', () => {
        expect(parseStyles()).toEqual([]);
    });
    it('parseStyles of a feature, with a style [markerStyle]', () => {
        const markerStyle = {
            iconGlyph: "comment",
            iconShape: "square",
            iconColor: "blue"
        };
        const olStyles = parseStyles({style: [markerStyle]});
        expect(isArray(olStyles)).toBe(true);
        expect(olStyles.length).toBe(2);
    });
    it('parseStyles of a feature, with a style [polygonStyle, markerStyle]', () => {
        const markerStyle = {
            iconGlyph: "comment",
            iconShape: "square",
            iconColor: "blue",
            geometry: "centerPoint"
        };
        const polygonStyle = {
            color: "#151515",
            fillColor: "#151515"
        };
        const olStyles = parseStyles({style: [polygonStyle, markerStyle]});
        expect(isArray(olStyles)).toBe(true);
        expect(olStyles.length).toBe(3);
    });
});
