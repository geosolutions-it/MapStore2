/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import RuleLegendIcon from '../RuleLegendIcon';

describe('RuleLegendIcon', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should render empty svg due to async mark image making', () => {
        const symbolizer = {
            "kind": "Mark",
            "color": "rgba(0, 0, 255, 0.1)",
            "fillOpacity": 0.1,
            "strokeColor": "rgba(0, 0, 255, 1)",
            "strokeOpacity": 1,
            "strokeWidth": 1,
            "radius": 10,
            "wellKnownName": "Circle",
            "msHeightReference": "none",
            "msBringToFront": true,
            "symbolizerId": "027a01c1-94f6-11ee-901f-a346ad8bfd94"
        };
        ReactDOM.render(<RuleLegendIcon rule={{ symbolizers: [symbolizer] }} />, document.getElementById('container'));
        const svgElements = document.querySelectorAll('svg');
        expect(svgElements.length).toBe(1);
        expect(svgElements[0].innerHTML).toBe('');
    });

    it('should render icon image', () => {
        const symbolizer = {
            "kind": "Icon",
            "image": "https://url.to.image",
            "opacity": 1,
            "size": 32,
            "rotate": 0,
            "msBringToFront": false,
            "symbolizerId": "d21a3951-42f8-11ed-b9d2-fbb7c629c7af"
        };
        ReactDOM.render(<RuleLegendIcon rule={{ symbolizers: [symbolizer] }} />, document.getElementById('container'));
        const icon = document.querySelectorAll('span');
        expect(icon.length).toBe(1);
        expect(icon[0].getAttribute('class')).toBe('glyphicon glyphicon-point');
    });
});
