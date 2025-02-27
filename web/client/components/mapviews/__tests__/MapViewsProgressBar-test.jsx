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
import { Simulate } from 'react-dom/test-utils';

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
            segments={[{ duration: 0 }, { duration: 2000 }, { duration: 4000 }, { duration: 5000 }]}
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
    it('should display tooltip on tick', (done) => {
        ReactDOM.render(<MapViewsProgressBar
            segments={[
                { duration: 0, view: { title: 'Title 01' } },
                { duration: 2000, view: { title: 'Title 02' } },
                { duration: 4000, view: { title: 'Title 03' } },
                { duration: 5000, view: { title: 'Title 04' } }
            ]}
            totalLength={10000}
        />, document.getElementById("container"));
        setTimeout(() => {
            const tickNodes = [...document.querySelectorAll('.ms-map-view-progress-tick')];
            expect(tickNodes.length).toBeTruthy(4);
            Simulate.mouseOver(tickNodes[0]);
            const tooltipInner = document.querySelector('.tooltip-inner');
            expect(tooltipInner.innerText).toBe('Title 01');
            done();
        }, 101);
    });
    it('should trigger on select by clicking on tick', (done) => {
        ReactDOM.render(<MapViewsProgressBar
            segments={[
                { duration: 0, view: { title: 'Title 01' } },
                { duration: 2000, view: { title: 'Title 02' } },
                { duration: 4000, view: { title: 'Title 03' } },
                { duration: 5000, view: { title: 'Title 04' } }
            ]}
            totalLength={10000}
            onSelect={(view) => {
                expect(view).toEqual({ title: 'Title 01' });
                done();
            }}
        />, document.getElementById("container"));
        const tickNodes = [...document.querySelectorAll('.ms-map-view-progress-tick')];
        expect(tickNodes.length).toBeTruthy(4);
        Simulate.click(tickNodes[0]);
    });
    it('should apply active class to tick with index less and equal to the current one', () => {
        ReactDOM.render(<MapViewsProgressBar
            currentIndex={2}
            segments={[
                { duration: 0, view: { title: 'Title 01' } },
                { duration: 2000, view: { title: 'Title 02' } },
                { duration: 4000, view: { title: 'Title 03' } },
                { duration: 5000, view: { title: 'Title 04' } }
            ]}
            totalLength={10000}
        />, document.getElementById("container"));
        const tickNodes = [...document.querySelectorAll('.active')];
        expect(tickNodes.length).toBeTruthy(3);
    });
});
