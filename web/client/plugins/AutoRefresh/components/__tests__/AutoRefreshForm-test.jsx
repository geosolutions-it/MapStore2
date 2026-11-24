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
import ReactSelect from 'react-select';
import reactSelectStyles from '!!raw-loader!react-select/dist/react-select.css';
import autoRefreshStyles from '!!raw-loader!less-loader!../../../../themes/default/less/autorefresh.less';

import AutoRefreshForm from '../AutoRefreshForm';
import AutoRefreshMenu from '../AutoRefreshMenu';

describe('AutoRefreshForm component', () => {
    let container;
    const defaultProps = {
        defaultRefreshInterval: 60,
        minimumRefreshInterval: 30,
        handleAddLayer: () => {},
        handleRemoveLayer: () => {},
        handleIntervalChange: () => {}
    };

    // function components return null from ReactDOM.render, so wrap to get an instance
    class Wrapper extends React.Component {
        render() {
            return <AutoRefreshForm {...this.props} />;
        }
    }

    const renderComponent = (props = {}) => ReactDOM.render(
        <Wrapper {...defaultProps} {...props} />,
        container
    );

    const getSelect = (instance) => TestUtils.findRenderedComponentWithType(instance, ReactSelect);

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        ReactDOM.unmountComponentAtNode(container);
        document.body.removeChild(container);
    });

    it('renders the available layers and active layer controls', () => {
        const instance = renderComponent({
            availableLayers: [{ id: 'available-layer', title: 'Available layer', type: 'wms' }],
            activeLayers: [{ id: 'active-layer', title: 'Active layer', type: 'wms', visibility: true, _v_: 1 }]
        });

        expect(getSelect(instance).props.options).toEqual([{ value: 'available-layer', label: 'Available layer' }]);
        expect(container.querySelector('.ms-autorefresh-form-group__title').textContent).toBe('Active layer');
        expect(container.querySelector('input[type="number"]').value).toBe('60');
        expect(container.querySelector('.ms-autorefresh-form-group__summary')).toBeTruthy();
    });

    it('adds a selected layer at the default interval and resets the selector', () => {
        const handleAddLayer = expect.createSpy();
        const instance = renderComponent({
            availableLayers: [{ id: 'layer-1', title: 'Layer 1', type: 'wms' }],
            handleAddLayer
        });

        getSelect(instance).props.onChange({ value: 'layer-1' });

        expect(handleAddLayer).toHaveBeenCalledWith('layer-1', 60);
    });

    it('opens the layer list above the footer selector without clipping or losing selection', () => {
        const handleAddLayer = expect.createSpy();
        const layers = Array.from({ length: 30 }, (_, index) => ({ id: `layer-${index}`, title: `Layer ${index}` }));
        Object.assign(container.style, { position: 'fixed', bottom: '24px', right: '24px' });
        // Mount styles with the fixture because other suites clear document.head.
        ReactDOM.render(
            <React.Fragment>
                <style>{`${reactSelectStyles}\n${autoRefreshStyles}`}</style>
                <AutoRefreshMenu>
                    <AutoRefreshForm {...defaultProps} availableLayers={layers} activeLayers={layers} handleAddLayer={handleAddLayer} />
                </AutoRefreshMenu>
            </React.Fragment>,
            container
        );

        const control = container.querySelector('.Select-control');
        TestUtils.Simulate.mouseDown(control, { button: 0 });

        const menu = container.querySelector('.Select-menu-outer');
        const menuBounds = menu.getBoundingClientRect();
        expect(menuBounds.height).toBeGreaterThan(0);
        expect(menuBounds.bottom).toBeLessThanOrEqualTo(control.getBoundingClientRect().top);
        expect(menu.contains(document.elementFromPoint(menuBounds.left + 10, menuBounds.top + 10))).toBe(true);
        const selectedLayers = container.querySelector('.ms-autorefresh-selected-layers');
        expect(selectedLayers.scrollHeight).toBeGreaterThan(selectedLayers.clientHeight);

        TestUtils.Simulate.mouseDown(menu.querySelector('.Select-option'), { button: 0 });
        expect(handleAddLayer).toHaveBeenCalledWith('layer-0', 60);
    });

    it('does not add a layer when the placeholder option is selected', () => {
        const handleAddLayer = expect.createSpy();
        getSelect(renderComponent({ handleAddLayer })).props.onChange({ value: 'none' });

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
            activeLayers: [{ id: 'layer-1', title: 'Layer 1', visibility: true, autoRefreshInterval: 45000 }],
            handleIntervalChange
        });

        TestUtils.Simulate.blur(container.querySelector('input[type="number"]'), { target: { value: '90' } });

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
    it('restores the default when a cleared interval loses focus', () => {
        const handleIntervalChange = expect.createSpy();
        renderComponent({ activeLayers: [{ id: 'roads', title: 'Roads', autoRefreshInterval: 60000 }], handleIntervalChange });
        const input = container.querySelector('input[type="number"]');
        input.value = '';
        TestUtils.Simulate.blur(input);
        expect(input.value).toBe('60');
        expect(handleIntervalChange).toHaveBeenCalledWith(60, 'roads');
    });

});
