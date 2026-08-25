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

const ITEMS = Array.from({ length: 12 }, (unused, index) => ({
    id: `${index}`,
    label: `Item ${index}`
}));

const NOUISLIDER_LAYOUT_RULES = `
    #container { width: 401px; }
    .noUi-target { position: relative; display: block; }
    .noUi-pips { position: absolute; top: 100%; left: 0; width: 100%; }
    .noUi-marker { position: absolute; width: 2px; height: 8px; margin-left: -1px; }
`;

const renderSlider = (props = {}) => {
    const container = document.getElementById('container');
    ReactDOM.render(
        <FilterSlider items={ITEMS} onSelectionChange={() => {}} {...props} />,
        container
    );
    return container;
};

describe('FilterSlider', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<style id="rules"></style><div id="container"></div>';
        document.getElementById('rules').textContent = NOUISLIDER_LAYOUT_RULES;
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

    it('should render one tick marker for every item', () => {
        const container = renderSlider({ showTicks: true });
        expect(container.querySelectorAll('.noUi-marker').length).toBe(ITEMS.length);
    });

    it('should render no tick marker when ticks are disabled', () => {
        const container = renderSlider();
        expect(container.querySelectorAll('.noUi-marker').length).toBe(0);
    });

    it('should align the tick markers on the physical pixel grid', (done) => {
        const container = renderSlider({ showTicks: true });
        const pixelRatio = window.devicePixelRatio || 1;
        setTimeout(() => {
            const markers = Array.from(container.querySelectorAll('.noUi-marker'));
            expect(markers.length).toBe(ITEMS.length);
            markers.forEach((marker) => {
                const position = marker.getBoundingClientRect().left * pixelRatio;
                expect(Math.abs(Math.round(position) - position)).toBeLessThan(0.02);
            });
            done();
        });
    });

    it('should give every tick marker a whole number of physical pixels', (done) => {
        const container = renderSlider({ showTicks: true });
        const pixelRatio = window.devicePixelRatio || 1;
        setTimeout(() => {
            const widths = Array.from(container.querySelectorAll('.noUi-marker'))
                .map((marker) => marker.getBoundingClientRect().width * pixelRatio);
            widths.forEach((width) => {
                expect(Math.abs(Math.round(width) - width)).toBeLessThan(0.02);
            });
            expect(Math.max(...widths) - Math.min(...widths)).toBeLessThan(0.02);
            done();
        });
    });

    it('should keep the stylesheet width to realign the markers after a resize', (done) => {
        const container = renderSlider({ showTicks: true });
        setTimeout(() => {
            Array.from(container.querySelectorAll('.noUi-marker')).forEach((marker) => {
                expect(marker.dataset.msOriginalWidth).toNotBe(undefined);
            });
            done();
        });
    });

    it('should keep the percentage offsets to realign the markers after a resize', (done) => {
        const container = renderSlider({ showTicks: true });
        setTimeout(() => {
            const markers = Array.from(container.querySelectorAll('.noUi-marker'));
            markers.forEach((marker) => {
                expect(marker.dataset.msOriginalLeft.indexOf('%')).toBeGreaterThan(-1);
            });
            done();
        });
    });
});

