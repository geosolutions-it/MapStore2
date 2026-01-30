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

        const titleToggle = titlePanelHeader.querySelector('div[style*="cursor: pointer"]');
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
});

