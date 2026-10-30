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

import AutoRefreshSettings from '../AutoRefreshSettings';
import { NodeTypes } from '../../../../utils/LayersUtils';

describe('AutoRefreshSettings component', () => {
    let container;
    const defaultProps = {
        defaultRefreshInterval: 60,
        minimumRefreshInterval: 30,
        availableLayers: [{ id: 'available-layer', title: 'Available layer' }],
        activeLayers: [{ id: 'active-layer', title: 'Active layer', visibility: true, autoRefreshInterval: 60 }],
        onUpdateNode: () => {}
    };

    const renderComponent = (props = {}) => ReactDOM.render(
        <AutoRefreshSettings {...defaultProps} {...props} />,
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

    it('renders the settings control and its form', () => {
        renderComponent();

        expect(container.querySelector('#ms-autorefresh-selector')).toBeTruthy();
        expect(container.querySelector('.ms-autorefresh-form-container')).toBeTruthy();
    });

    it('adds a layer using the default refresh interval', () => {
        const onUpdateNode = expect.createSpy();
        renderComponent({ onUpdateNode });

        const selector = container.querySelector('#autorefresh-settings-add-layer');
        selector.value = 'available-layer';
        TestUtils.Simulate.change(selector, { target: selector });

        expect(onUpdateNode).toHaveBeenCalledWith(
            'available-layer',
            NodeTypes.LAYER,
            { autoRefreshInterval: 60 }
        );
    });

    it('clamps interval updates to the configured minimum', () => {
        const onUpdateNode = expect.createSpy();
        renderComponent({ onUpdateNode });

        TestUtils.Simulate.change(container.querySelector('input[type="number"]'), { target: { value: '10' } });

        expect(onUpdateNode).toHaveBeenCalledWith(
            'active-layer',
            NodeTypes.LAYER,
            { autoRefreshInterval: 30 }
        );
    });

    it('removes a layer by setting its refresh interval to -1', () => {
        const onUpdateNode = expect.createSpy();
        renderComponent({ onUpdateNode });

        TestUtils.Simulate.click(container.querySelector('.ms-autorefresh-form-group__button'));

        expect(onUpdateNode).toHaveBeenCalledWith(
            'active-layer',
            NodeTypes.LAYER,
            { autoRefreshInterval: -1 }
        );
    });
});
