/**
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import MarkIcon from '../MarkIcon';

describe('WFSLegend module component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('Should render empty svg due to asyncronous image making', () => {
        const symbolizer = {
            "kind": "Icon",
            "image": "https://url.to.image",
            "opacity": 1,
            "size": 32,
            "rotate": 0,
            "msBringToFront": false,
            "symbolizerId": "d21a3951-42f8-11ed-b9d2-fbb7c629c7af"
        };
        ReactDOM.render(<MarkIcon symbolizer={symbolizer} />, document.getElementById('container'));
        const svgElements = document.querySelectorAll('svg');
        expect(svgElements.length).toBe(1);
        expect(svgElements[0].innerHTML).toBe('');
    });

    it('Should render image', (done) => {
        const symbolizer = {
            "kind": "Icon",
            "image": "https://url.to.image",
            "opacity": 1,
            "size": 32,
            "rotate": 0,
            "msBringToFront": false,
            "symbolizerId": "d21a3951-42f8-11ed-b9d2-fbb7c629c7af"
        };
        ReactDOM.render(<MarkIcon symbolizer={symbolizer} />, document.getElementById('container'));
        setTimeout(() => {
            const svgElements = document.querySelectorAll('svg');
            expect(svgElements.length).toBe(1);
            const svgElement = svgElements[0];
            const imageElement = svgElement.firstChild;
            expect(imageElement).toExist();
            const imageAttributes = imageElement.attributes;
            expect(imageAttributes.href).toExist();
            expect(imageAttributes.height.value).toBe("50");
            expect(imageAttributes.width.value).toBe("50");
            done();
        }, 1);
    });
});
