/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import {
    getImageIdFromSymbolizer,
    geoStylerStyleFilter,
    getWellKnownNameImageFromSymbolizer,
    parseSymbolizerExpressions,
    getCachedImageById
} from '../StyleParserUtils';

describe("StyleParserUtils ", () => {

    it('should create an image id based on Icon or Mark symbolizers', () => {

        expect(getImageIdFromSymbolizer({
            kind: 'Mark',
            wellKnownName: 'Circle',
            color: '#ff0000',
            fillOpacity: 0.5,
            strokeColor: '#00ff00',
            strokeOpacity: 0.25,
            strokeWidth: 3,
            radius: 16,
            rotate: 90
        })).toBe('Circle:#ff0000:0.5:#00ff00:0.25::3:16');

        expect(getImageIdFromSymbolizer({
            kind: 'Icon',
            image: 'path/to/image',
            opacity: 0.5,
            size: 32,
            rotate: 90
        })).toBe('path/to/image');
        const parsedSymbolizer = {"symbolizerId": "df2715d2-8ecb-11ee-909e-8bd5d708e385", "kind": "Icon", "image": "data:image/png;base64,iVBORcmGtfaAAAAABJRU5ErkJggg==", "opacity": 1, "size": 46, "rotate": 0, "msBringToFront": false, "anchor": "bottom", "msHeightReference": "none"};
        const originalSymbolizer = {"symbolizerId": "df2715d2-8ecb-11ee-909e-8bd5d708e385", "kind": "Icon", "image": {"name": "msMarkerIcon", "args": [{"glyph": "power-off", "color": "purple", "shape": "square"}]}, "opacity": 1, "size": 46, "rotate": 0, "msBringToFront": false, "anchor": "bottom", "msHeightReference": "none"};
        expect(getImageIdFromSymbolizer(parsedSymbolizer, originalSymbolizer)).toEqual("msMarkerIcon:purple:square:power-off");

    });


    it('should read filter expression applied to a feature properties using geoStylerStyleFilter', () => {
        const feature = { properties: { count: 10, name: 'Abc' } };
        expect(geoStylerStyleFilter(feature, ['==', 'count', 10])).toBe(true);
        expect(geoStylerStyleFilter(feature, ['!=', 'count', 10])).toBe(false);
        expect(geoStylerStyleFilter(feature, ['>=', 'count', 10])).toBe(true);
        expect(geoStylerStyleFilter(feature, ['<=', 'count', 10])).toBe(true);
        expect(geoStylerStyleFilter(feature, ['<', 'count', 10])).toBe(false);
        expect(geoStylerStyleFilter(feature, ['>', 'count', 10])).toBe(false);
        expect(geoStylerStyleFilter(feature, ['*=', 'name', 'A'])).toBe(true);
        expect(geoStylerStyleFilter(feature, ['*=', 'name', 'd'])).toBe(false);

        expect(geoStylerStyleFilter(feature, ['||', ['*=', 'name', 'd'], ['<', 'count', 10]])).toBe(false);
        expect(geoStylerStyleFilter(feature, ['||', ['*=', 'name', 'd'], ['<=', 'count', 10]])).toBe(true);

        expect(geoStylerStyleFilter(feature, ['&&', ['*=', 'name', 'd'], ['<=', 'count', 10]])).toBe(false);
        expect(geoStylerStyleFilter(feature, ['&&', ['*=', 'name', 'A'], ['<=', 'count', 10]])).toBe(true);
    });

    it('should render an image if a mark symbolizer use an svg as wellKnownName property', (done) => {
        getWellKnownNameImageFromSymbolizer({
            "kind": "Mark",
            "wellKnownName": "base/web/client/test-resources/symbols/stop-hexagonal-signal.svg",
            "color": "#ff1887",
            "fillOpacity": 1,
            "strokeColor": "#1329ff",
            "strokeOpacity": 1,
            "strokeWidth": 4,
            "radius": 32,
            "rotate": 0,
            "msBringToFront": true,
            "msHeightReference": "none",
            "strokeDasharray": [8, 8]
        })
            .then(({ id, image, src, width, height }) => {
                expect(id).toBeTruthy();
                expect(width).toBe(68);
                expect(height).toBe(68);
                expect(image).toBeTruthy();
                expect(src).toBeTruthy();
                done();
            })
            .catch(done);
    });
    it('parse symbolizers using expressions', () => {
        expect(parseSymbolizerExpressions({
            kind: 'Icon',
            image: {
                name: 'msMarkerIcon',
                args: [
                    {
                        color: 'blue'
                    }
                ]
            }
        }, { properties: {} }).image.includes('data:image/png;base64')).toBe(true);

        expect(parseSymbolizerExpressions(
            {
                kind: 'Circle',
                color: '#ff0000',
                opacity: 0.5,
                outlineColor: '#00ff00',
                outlineWidth: 2,
                radius: {
                    name: 'property',
                    args: [
                        'radius'
                    ]
                },
                geodesic: {
                    name: 'property',
                    args: [
                        'geodesic'
                    ]
                },
                outlineOpacity: 0.25,
                outlineDasharray: [10, 10]
            },
            {
                properties: {
                    geodesic: true,
                    radius: 1000000
                }
            }
        ))
            .toEqual({
                kind: 'Circle',
                color: '#ff0000',
                opacity: 0.5,
                outlineColor: '#00ff00',
                outlineWidth: 2,
                radius: 1000000,
                geodesic: true,
                outlineOpacity: 0.25,
                outlineDasharray: [ 10, 10 ]
            });
    });
    it('test getCachedImageById method for Icon annotationSymbolizer to return width, height = size in case of returning undefined from getCachedImageById', () => {
        const annotationSymbolizer = {
            "symbolizerId": "5ba7eae188a0",
            "kind": "Icon",
            "image": {
                "name": "msMarkerIcon",
                "args": [
                    {
                        "color": "blue",
                        "shape": "circle",
                        "glyph": "comment"
                    }
                ]
            },
            "opacity": 1,
            "size": 46,
            "rotate": 0,
            "msBringToFront": false,
            "anchor": "bottom",
            "msHeightReference": "none"
        };
        const { width = annotationSymbolizer.size, height = annotationSymbolizer.size } = getCachedImageById(annotationSymbolizer);
        expect(width).toBe(annotationSymbolizer.size);
        expect(height).toBe(annotationSymbolizer.size);
    });
});
