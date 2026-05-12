/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import { Simulate } from 'react-dom/test-utils';
import FilterLayoutTab from '../FilterLayoutTab';

describe('FilterLayoutTab component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should render with defaults', () => {
        ReactDOM.render(<FilterLayoutTab />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-filter-wizard-layout-tab');
        expect(el).toExist();
    });

    it('should call onChange when input changes', (done) => {
        ReactDOM.render(<FilterLayoutTab
            data={{ layout: {} }}
            onChange={(key, value) => {
                expect(key).toBe('layout.label');
                expect(value).toBe('Test Label');
                done();
            }}
        />, document.getElementById("container"));

        const container = document.getElementById('container');

        // Check there are 4 input groups before title click
        const itemInputs = container.querySelectorAll('.input-group');
        expect(itemInputs.length).toBe(4);

        // Find title inside panel-heading (1st) and find span
        const titlePanelHeader = container.querySelector('.ms-filter-title-panel .panel-heading');
        const titleSpan = titlePanelHeader.querySelector('span');
        expect(titleSpan).toExist();

        const titleToggle = titlePanelHeader.querySelector('.accordion-title');
        expect(titleToggle).toExist();
        Simulate.click(titleToggle);

        // Verify there are 6 input groups in title panel
        const titlePanel = container.querySelector('.ms-filter-title-panel');
        const titleInputs = titlePanel.querySelectorAll('.input-group');
        expect(titleInputs.length).toBe(6);

        const labelInput = container.querySelector('input[type="text"][placeholder*="label"]');
        expect(labelInput).toExist();
        labelInput.value = 'Test Label';
        Simulate.change(labelInput);
    });

    it('should include slider in the variant options when selection mode is single', () => {
        ReactDOM.render(
            <FilterLayoutTab
                data={{
                    layout: {
                        selectionMode: 'single'
                    }
                }}
            />,
            document.getElementById("container")
        );

        const container = document.getElementById('container');
        const variantControl = container.querySelector('.ms-filter-items-panel .Select-control');
        expect(variantControl).toExist();
        Simulate.keyDown(variantControl, { keyCode: 40 });

        const options = container.querySelectorAll('.Select-option');
        const sliderOption = Array.from(options).find(option => option.textContent.trim() === 'Slider');
        expect(sliderOption).toExist();
    });

    it('should not include slider in the variant options when selection mode is multiple', () => {
        ReactDOM.render(
            <FilterLayoutTab
                data={{
                    layout: {
                        selectionMode: 'multiple'
                    }
                }}
            />,
            document.getElementById("container")
        );

        const container = document.getElementById('container');
        const variantControl = container.querySelector('.ms-filter-items-panel .Select-control');
        expect(variantControl).toExist();
        Simulate.keyDown(variantControl, { keyCode: 40 });

        const options = container.querySelectorAll('.Select-option');
        const sliderOption = Array.from(options).find(option => option.textContent.trim() === 'Slider');
        expect(sliderOption).toNotExist();
    });

    it('should hide direction control when variant is slider', () => {
        ReactDOM.render(
            <FilterLayoutTab
                data={{
                    layout: {
                        variant: 'slider',
                        selectionMode: 'single'
                    }
                }}
            />,
            document.getElementById("container")
        );

        const container = document.getElementById('container');
        expect(container.querySelector('.ms-filter-direction-form-group')).toNotExist();
    });

    it('should call onChange when tick angle changes', (done) => {
        ReactDOM.render(
            <FilterLayoutTab
                data={{
                    layout: {
                        variant: 'slider',
                        selectionMode: 'single',
                        showTicks: true,
                        tickAngle: 90
                    }
                }}
                onChange={(key, value) => {
                    expect(key).toBe('layout.tickAngle');
                    expect(value).toBe(45);
                    done();
                }}
            />,
            document.getElementById("container")
        );

        const container = document.getElementById('container');
        const tickAngleControl = container.querySelector('.ms-filter-tick-angle-control');
        expect(tickAngleControl).toExist();

        const tickAngleInput = container.querySelector('.ms-filter-tick-angle-range');
        expect(tickAngleInput).toExist();
        expect(tickAngleInput.min).toBe('-90');
        expect(tickAngleInput.max).toBe('90');
        const tickAngleNumberInput = container.querySelector('.ms-filter-tick-angle-number');
        expect(tickAngleNumberInput).toExist();
        expect(tickAngleNumberInput.min).toBe('-90');
        expect(tickAngleNumberInput.max).toBe('90');
        expect(tickAngleNumberInput.value).toBe('90');
        tickAngleInput.value = '45';
        Simulate.change(tickAngleInput);
    });

    it('should call onChange when tick angle number input changes', (done) => {
        ReactDOM.render(
            <FilterLayoutTab
                data={{
                    layout: {
                        variant: 'slider',
                        selectionMode: 'single',
                        showTicks: true,
                        tickAngle: -90
                    }
                }}
                onChange={(key, value) => {
                    expect(key).toBe('layout.tickAngle');
                    expect(value).toBe(45);
                    done();
                }}
            />,
            document.getElementById("container")
        );

        const container = document.getElementById('container');
        const tickAngleControl = container.querySelector('.ms-filter-tick-angle-control');
        expect(tickAngleControl).toExist();

        const tickAngleNumberInput = container.querySelector('.ms-filter-tick-angle-number');
        expect(tickAngleNumberInput).toExist();
        tickAngleNumberInput.value = '45';
        Simulate.change(tickAngleNumberInput);
    });
});
