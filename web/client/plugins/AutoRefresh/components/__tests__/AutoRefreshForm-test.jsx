/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import TestUtils from 'react-dom/test-utils';

import AutoRefreshForm from '../AutoRefreshForm';

describe('AutoRefreshForm component', () => {
    let container;
    const defaultProps = {
        defaultRefreshInterval: 60,
        minimumRefreshInterval: 30,
        handleAddLayer: () => {},
        handleRemoveLayer: () => {},
        handleIntervalChange: () => {}
    };

    const renderComponent = (props = {}) => ReactDOM.render(
        <AutoRefreshForm {...defaultProps} {...props} />,
        container
    );

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        ReactDOM.unmountComponentAtNode(container);
        document.body.removeChild(container);
    });

    it('renders the available layers and active layer controls', () => {
        renderComponent({
            availableLayers: [{ id: 'available-layer', title: 'Available layer' }],
            activeLayers: [{ id: 'active-layer', title: 'Active layer', visibility: true, _v_: 1 }]
        });

        expect(container.querySelector('option[value="available-layer"]').textContent).toBe('Available layer');
        expect(container.querySelector('.ms-autorefresh-form-group__title').textContent).toBe('Active layer');
        expect(container.querySelector('input[type="number"]').value).toBe('60');
        expect(container.querySelector('.ms-autorefresh-form-group__summary')).toBeTruthy();
    });

    it('adds a selected layer at the default interval and resets the selector', () => {
        const handleAddLayer = expect.createSpy();
        renderComponent({
            availableLayers: [{ id: 'layer-1', title: 'Layer 1' }],
            handleAddLayer
        });

        const selector = container.querySelector('#autorefresh-settings-add-layer');
        selector.value = 'layer-1';
        TestUtils.Simulate.change(selector, { target: selector });

        expect(handleAddLayer).toHaveBeenCalledWith('layer-1', 60);
        expect(selector.value).toBe('none');
    });

    it('does not add a layer when the placeholder option is selected', () => {
        const handleAddLayer = expect.createSpy();
        renderComponent({ handleAddLayer });

        const selector = container.querySelector('#autorefresh-settings-add-layer');
        TestUtils.Simulate.change(selector, { target: { value: 'none' } });

        expect(handleAddLayer).toNotHaveBeenCalled();
    });

    it('removes an active layer when its button is clicked', () => {
        const handleRemoveLayer = expect.createSpy();
        renderComponent({
            activeLayers: [{ id: 'layer-1', title: 'Layer 1', visibility: true }],
            handleRemoveLayer
        });

        TestUtils.Simulate.click(container.querySelector('.ms-autorefresh-form-group__button'));

        expect(handleRemoveLayer).toHaveBeenCalledWith('layer-1');
    });

    it('reports numeric interval changes with the layer id', () => {
        const handleIntervalChange = expect.createSpy();
        renderComponent({
            activeLayers: [{ id: 'layer-1', title: 'Layer 1', visibility: true, autoRefreshInterval: 45 }],
            handleIntervalChange
        });

        TestUtils.Simulate.change(container.querySelector('input[type="number"]'), { target: { value: '90' } });

        expect(handleIntervalChange).toHaveBeenCalledWith(90, 'layer-1');
    });

    it('marks hidden and stale layers with the appropriate classes', () => {
        renderComponent({
            activeLayers: [
                { id: 'hidden', title: 'Hidden', visibility: false },
                { id: 'stale', title: 'Stale', visibility: true }
            ]
        });

        expect(container.querySelectorAll('.ms-autorefresh-form-group-hidden').length).toBe(1);
        expect(container.querySelectorAll('.ms-autorefresh-form-group-inactive').length).toBe(2);
    });
});
