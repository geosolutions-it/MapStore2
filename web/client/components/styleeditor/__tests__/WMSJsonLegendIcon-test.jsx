/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import WMSJsonLegendIcon, {
    createIconSymbolizerForPoint,
    getExternalGraphicUrl,
    getPointExternalGraphicUrl
} from '../WMSJsonLegendIcon';

describe('WMSJsonLegendIcon', () => {
    const imageSrc = 'styles/tree.png';
    const pointUrl = 'styles/point-url.png';

    const createExternalGraphicLegend = () => ({
        Legend: [{
            layerName: 'tasmania_cities',
            title: 'Tasmania cities',
            rules: [{
                title: 'City Point',
                symbolizers: [{
                    Point: {
                        title: 'title',
                        'abstract': 'abstract',
                        url: pointUrl,
                        size: '6',
                        opacity: '1.0',
                        rotation: '0.0',
                        graphics: [{
                            'external-graphic-url': imageSrc,
                            'external-graphic-type': 'image/png'
                        }]
                    }
                }]
            }]
        }]
    });

    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should parse external graphic url from graphic object', () => {
        expect(getExternalGraphicUrl({
            'external-graphic-url': imageSrc,
            'external-graphic-type': 'image/png'
        })).toBe(imageSrc);
    });
    it('should parse point external graphic url from GeoServer legend json', () => {
        const legend = createExternalGraphicLegend();
        const pointSymbolizer = legend.Legend[0].rules[0].symbolizers[0].Point;
        expect(getPointExternalGraphicUrl(pointSymbolizer)).toBe(imageSrc);
    });
    it('should create icon symbolizer from external graphic url', () => {
        const legend = createExternalGraphicLegend();
        const pointSymbolizer = legend.Legend[0].rules[0].symbolizers[0].Point;
        expect(createIconSymbolizerForPoint(pointSymbolizer)).toInclude({
            image: imageSrc,
            rotate: '0.0',
            opacity: '1.0'
        });
    });
    it('should create icon symbolizer from point url when external graphic is not available', () => {
        expect(createIconSymbolizerForPoint({
            url: imageSrc,
            graphics: []
        })).toInclude({
            image: imageSrc
        });
    });
    it('should render polygon icon ', () => {
        const symbolizers = [{"Polygon": {
            "fill": "#4DFF4D",
            "fill-opacity": "0.7"
        }}];
        ReactDOM.render(<WMSJsonLegendIcon rule={{ symbolizers: symbolizers }} />, document.getElementById('container'));
        const svgElements = document.querySelectorAll('svg');
        expect(svgElements.length).toBe(1);
        expect(svgElements[0].innerHTML).toNotBe('');
    });
    it('should render line icon ', () => {
        const symbolizers = [{"Line": {
            "stroke": "#AA3333",
            "stroke-width": "2",
            "stroke-opacity": "1",
            "stroke-linecap": "butt",
            "stroke-linejoin": "miter"
        }}];
        ReactDOM.render(<WMSJsonLegendIcon rule={{ symbolizers: symbolizers }} />, document.getElementById('container'));
        const svgElements = document.querySelectorAll('svg');
        expect(svgElements.length).toBe(1);
        expect(svgElements[0].innerHTML).toNotBe('');
    });
    it('should render point icon', () => {
        const symbolizers = [{"Point": {
            "title": "title",
            "abstract": "abstract",
            "url": "http://localhost:9000/geoserver/kml/icon/capitals?0.0.0=",
            "size": "6",
            "opacity": "1.0",
            "rotation": "0.0",
            "graphics": [      {
                "mark": "circle",
                "fill": "#FFFFFF",
                "fill-opacity": "1.0",
                "stroke": "#000000",
                "stroke-width": "2",
                "stroke-opacity": "1",
                "stroke-linecap": "butt",
                "stroke-linejoin": "miter"
            }]}}
        ];
        ReactDOM.render(<WMSJsonLegendIcon rule={{ symbolizers: symbolizers }} />, document.getElementById('container'));
        const svgElements = document.querySelectorAll('svg');
        expect(svgElements.length).toBe(1);
    });
    it('should render polygon icon with graphic-fill pattern', () => {
        const symbolizers = [{
            "Polygon": {
                "fill": "#4DFF4D",
                "fill-opacity": "0.7",
                "graphic-fill": {
                    "size": 10,
                    "opacity": 1,
                    "rotation": 45,
                    "graphics": [{
                        "mark": "shape://horline",
                        "stroke": "#000000",
                        "stroke-width": 2,
                        "stroke-opacity": 1
                    }]
                },
                "vendor-options": {
                    "graphic-margin": "2 2"
                }
            }
        }];
        ReactDOM.render(<WMSJsonLegendIcon rule={{ symbolizers }} />, document.getElementById('container'));
        const svg = document.querySelector('svg');
        const patterns = svg.querySelectorAll('pattern');
        const paths = svg.querySelectorAll('path');
        expect(patterns.length).toBeGreaterThan(0);
        expect(paths.length).toBeGreaterThan(0);
        expect(paths[0].getAttribute('fill')).toMatch(/^url\(#pattern-/);
    });
    it('should render line icon with graphic-stroke pattern', () => {
        const symbolizers = [{
            "Line": {
                "stroke": "#AA3333",
                "stroke-width": 2,
                "stroke-opacity": 1,
                "graphic-stroke": {
                    "size": 8,
                    "opacity": 1,
                    "graphics": [{
                        "mark": "shape://vertline",
                        "stroke": "#AA3333",
                        "stroke-width": 2,
                        "stroke-opacity": 1
                    }]
                },
                "vendor-options": {
                    "graphic-margin": "1 1"
                }
            }
        }];
        ReactDOM.render(<WMSJsonLegendIcon rule={{ symbolizers }} />, document.getElementById('container'));
        const svg = document.querySelector('svg');
        const patterns = svg.querySelectorAll('pattern');
        const paths = svg.querySelectorAll('path');
        expect(patterns.length).toBeGreaterThan(0);
        expect(paths.length).toBeGreaterThan(0);
        expect(paths[0].getAttribute('stroke')).toMatch(/^url\(#pattern-/);
    });
    it('should render multiple polygon symbolizers with patterns', () => {
        const symbolizers = [{
            "Polygon": {
                "fill": "#FF0000",
                "fill-opacity": "0.8",
                "graphic-fill": {
                    "size": 6,
                    "opacity": 1,
                    "graphics": [{
                        "mark": "circle",
                        "fill": "#FFFFFF",
                        "fill-opacity": 1,
                        "stroke": "#FF0000",
                        "stroke-width": 1,
                        "stroke-opacity": 1
                    }]
                }
            }
        }, {
            "Polygon": {
                "fill": "#0000FF",
                "fill-opacity": "0.5",
                "graphic-fill": {
                    "size": 6,
                    "opacity": 1,
                    "graphics": [{
                        "mark": "shape://slash",
                        "stroke": "#0000FF",
                        "stroke-width": 1,
                        "stroke-opacity": 1
                    }]
                }
            }
        }];
        ReactDOM.render(<WMSJsonLegendIcon rule={{ symbolizers }} />, document.getElementById('container'));
        const svg = document.querySelector('svg');
        const patterns = svg.querySelectorAll('pattern');
        const paths = svg.querySelectorAll('path');
        expect(patterns.length).toBeGreaterThan(1);
        expect(paths.length).toBeGreaterThan(1);
    });
});
