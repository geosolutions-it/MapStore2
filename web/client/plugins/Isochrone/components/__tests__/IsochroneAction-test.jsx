/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import TestUtils from 'react-dom/test-utils';

import IsochroneAction from '../IsochroneAction';

describe('IsochroneAction component', () => {
    let container;

    beforeEach((done) => {
        container = document.createElement('div');
        document.body.appendChild(container);
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(container);
        document.body.removeChild(container);
        setTimeout(done);
    });

    const renderComponent = (props = {}) => {
        const component = React.createElement(IsochroneAction, props);
        return ReactDOM.render(component, container);
    };

    describe('render component', () => {
        it('should render with default props', () => {
            renderComponent();
            expect(container.querySelector('.ms-isochrone-action')).toBeTruthy();
            expect(container.querySelectorAll('button').length).toBe(2);
        });
    });

    describe('Button functionality', () => {
        it('should call onHandleReset when reset button is clicked', () => {
            const onHandleReset = expect.createSpy();
            renderComponent({ onHandleReset });

            const buttons = container.querySelectorAll('button');
            const resetButton = buttons[0]; // First button should be reset
            TestUtils.Simulate.click(resetButton);

            expect(onHandleReset).toHaveBeenCalled();
        });

        it('should call onHandleRun when run button is clicked', () => {
            const onHandleRun = expect.createSpy();
            renderComponent({ onHandleRun });

            const buttons = container.querySelectorAll('button');
            const runButton = buttons[1]; // Second button should be run
            TestUtils.Simulate.click(runButton);

            expect(onHandleRun).toHaveBeenCalled();
        });

        it('should not call handlers when they are not provided', () => {
            renderComponent();

            const buttons = container.querySelectorAll('button');
            buttons.forEach(button => {
                expect(() => TestUtils.Simulate.click(button)).toNotThrow();
            });
        });
    });

    it('should disable run button when disabled prop is true', () => {
        renderComponent({ disabled: true });

        const buttons = container.querySelectorAll('button');
        const runButton = buttons[1]; // Second button should be run
        expect(runButton.disabled).toBe(true);
    });

    it('should not disable reset button when disabled prop is true', () => {
        renderComponent({ disabled: true });

        const buttons = container.querySelectorAll('button');
        const resetButton = buttons[0]; // First button should be reset
        expect(resetButton.disabled).toBe(false);
    });

    it('should not disable run button when disabled prop is false', () => {
        renderComponent({ disabled: false });

        const buttons = container.querySelectorAll('button');
        const runButton = buttons[1]; // Second button should be run
        expect(runButton.disabled).toBe(false);
    });

    it('should not disable run button when disabled prop is not provided', () => {
        renderComponent();

        const buttons = container.querySelectorAll('button');
        const runButton = buttons[1]; // Second button should be run
        expect(runButton.disabled).toBe(false);
    });

    it('should apply primary variant to run button', () => {
        renderComponent();

        const buttons = container.querySelectorAll('button');
        const runButton = buttons[1]; // Second button should be run
        expect(runButton.className).toContain('btn-primary');
    });

    it('should apply default variant to reset button', () => {
        renderComponent();

        const buttons = container.querySelectorAll('button');
        const resetButton = buttons[0]; // First button should be reset
        expect(resetButton.className).toContain('btn-default');
    });

    it('should handle missing onHandleReset prop', () => {
        renderComponent({ onHandleRun: () => {} });
        expect(container.querySelector('.ms-isochrone-action')).toBeTruthy();
    });

    it('should handle missing onHandleRun prop', () => {
        renderComponent({ onHandleReset: () => {} });
        expect(container.querySelector('.ms-isochrone-action')).toBeTruthy();
    });

    it('should handle all props missing', () => {
        renderComponent({});
        expect(container.querySelector('.ms-isochrone-action')).toBeTruthy();
    });
});
