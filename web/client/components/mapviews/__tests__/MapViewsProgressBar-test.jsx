/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import MapViewsProgressBar from '../MapViewsProgressBar';
import expect from 'expect';

describe('MapViewsProgressBar component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should render with default', () => {
        ReactDOM.render(<MapViewsProgressBar />, document.getElementById("container"));
        const progressNode = document.querySelector('.ms-map-view-progress-container');
        expect(progressNode).toBeTruthy();
    });

    it('should display the bar based on progress prop', () => {
        ReactDOM.render(<MapViewsProgressBar
            progress={50}
        />, document.getElementById("container"));
        const progressBar = document.querySelector('.ms-map-view-progress-bar');
        expect(progressBar).toBeTruthy();
        expect(progressBar.style.width).toBe('50%');
    });
    it('should display ticks based on segments and totalLength props', () => {
        ReactDOM.render(<MapViewsProgressBar
            segments={[0, 2000, 4000, 5000]}
            totalLength={10000}
        />, document.getElementById("container"));
        const tickNodes = [...document.querySelectorAll('.ms-map-view-progress-tick')];
        expect(tickNodes.length).toBeTruthy(4);
        expect(tickNodes.map(tickNode => tickNode.style.left)).toEqual([
            '0%',
            '20%',
            '40%',
            '50%'
        ]);
    });
});
