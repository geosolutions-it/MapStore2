/*
 * Copyright 2026, GeoSolutions
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import FilterSlider, { getTickIndexFromPosition } from '../FilterSlider';

describe('FilterSlider', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should convert a pip position to the nearest item index', () => {
        expect(getTickIndexFromPosition('0%', 5)).toBe(0);
        expect(getTickIndexFromPosition('49%', 5)).toBe(2);
        expect(getTickIndexFromPosition('100%', 5)).toBe(4);
        expect(getTickIndexFromPosition('', 5)).toBe(-1);
    });

    it('should select the item associated with a clicked tick label', () => {
        const container = document.getElementById('container');
        const items = [
            { id: 'first', label: 'First' },
            { id: 'second', label: 'Second' },
            { id: 'third', label: 'Third' }
        ];
        let selectedValues;

        ReactDOM.render(
            <FilterSlider
                items={items}
                selectedValues={['first']}
                showTicks
                onSelectionChange={(values) => {
                    selectedValues = values;
                }}
            />,
            container
        );

        const labels = container.querySelectorAll('.noUi-value');
        expect(labels.length).toBe(3);
        labels[1].dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(selectedValues).toEqual(['second']);
    });

    it('should select the nearest item when a tick marker is clicked', () => {
        const container = document.getElementById('container');
        const items = [
            { id: 'first', label: 'First' },
            { id: 'second', label: 'Second' },
            { id: 'third', label: 'Third' }
        ];
        let selectedValues;

        ReactDOM.render(
            <FilterSlider
                items={items}
                selectedValues={['first']}
                showTicks
                onSelectionChange={(values) => {
                    selectedValues = values;
                }}
            />,
            container
        );

        const marker = Array.from(container.querySelectorAll('.noUi-marker'))
            .find((element) => element.style.left === '50%');
        expect(marker).toExist();
        marker.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(selectedValues).toEqual(['second']);
    });

    it('should select the nearest item when the surrounding pips area is clicked', () => {
        const container = document.getElementById('container');
        const items = [
            { id: 'first', label: 'First' },
            { id: 'second', label: 'Second' },
            { id: 'third', label: 'Third' }
        ];
        let selectedValues;

        ReactDOM.render(
            <FilterSlider
                items={items}
                selectedValues={['first']}
                showTicks
                onSelectionChange={(values) => {
                    selectedValues = values;
                }}
            />,
            container
        );

        const sliderBase = container.querySelector('.noUi-base');
        sliderBase.getBoundingClientRect = () => ({ left: 100, width: 200 });
        const pips = container.querySelector('.noUi-pips');
        pips.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 245 }));
        expect(selectedValues).toEqual(['second']);
    });
});
