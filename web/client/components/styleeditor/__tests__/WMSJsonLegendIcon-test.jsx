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
import WMSJsonLegendIcon from '../WMSJsonLegendIcon';

describe('WMSJsonLegendIcon', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
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
});
