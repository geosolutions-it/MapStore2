/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import expect from 'expect';
import withConnectButton from '../withConnectButton';

const getStepButtons = (props = {}) => {
    const enhancer = withConnectButton()((p) => p);
    const enhanced = enhancer(props);
    return enhanced.stepButtons;
};

describe('withConnectButton enhancer', () => {
    it('should set isTableOnlyWidget true and correct tooltip for table widget', () => {
        const widgets = [
            { id: 'w1', widgetType: 'table' },
            { id: 'w2', widgetType: 'chart' }
        ];
        const availableDependencies = ['widgets["w1"].layer'];
        const stepButtons = getStepButtons({
            availableDependencies,
            widgets,
            canConnect: true,
            connected: false
        });
        expect(stepButtons.length).toBe(1);
        expect(stepButtons[stepButtons.length - 1].tooltipId).toBe('widgets.builder.wizard.connectToTheTable');
    });

    it('should set correct tooltip for map connection', () => {
        const widgets = [
            { id: 'w2', widgetType: 'chart' }
        ];
        const availableDependencies = ['widgets["w2"].layer'];
        const stepButtons = getStepButtons({
            availableDependencies,
            widgets,
            canConnect: true,
            connected: false
        });
        expect(stepButtons[stepButtons.length - 1].tooltipId).toBe('widgets.builder.wizard.connectToTheMap');
    });

    it('should set correct tooltip for multi dependency', () => {
        const widgets = [
            { id: 'w1', widgetType: 'table' },
            { id: 'w2', widgetType: 'chart' }
        ];
        const availableDependencies = ['widgets["w1"].layer', 'widgets["w2"].layer'];
        const stepButtons = getStepButtons({
            availableDependencies,
            widgets,
            canConnect: true,
            connected: false
        });
        expect(stepButtons[stepButtons.length - 1].tooltipId).toBe('widgets.builder.wizard.connectToAMap');
    });
    it('should render when dependencies return empty dependency id', () => {
        const widgets = [
            { id: 'w1', widgetType: 'table' },
            { id: 'w2', widgetType: 'chart' }
        ];
        const availableDependencies = ['layer'];
        const stepButtons = getStepButtons({
            availableDependencies,
            widgets,
            canConnect: true,
            connected: false
        });
        expect(stepButtons[stepButtons.length - 1].tooltipId).toBe('widgets.builder.wizard.connectToTheMap');
    });
});
