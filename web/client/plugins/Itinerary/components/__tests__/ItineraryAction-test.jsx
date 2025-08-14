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
import ReactTestUtils from 'react-dom/test-utils';

import ItineraryAction from '../ItineraryAction';

describe('ItineraryAction Component', () => {
    let container;

    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        container = document.getElementById('container');
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(container);
        document.body.innerHTML = '';
        setTimeout(done);
    });

    const defaultProps = {
        onHandleRun: () => {},
        locations: [
            [2.3522, 48.8566], // Paris
            [4.8320, 45.7578]  // Lyon
        ],
        itineraryLoading: false,
        onHandleReset: () => {}
    };

    it('should render the component container', () => {
        ReactDOM.render(<ItineraryAction {...defaultProps} />, container);

        const componentContainer = container.querySelector('.itinerary-run');
        expect(componentContainer).toBeTruthy();
    });

    it('should render reset button', () => {
        ReactDOM.render(<ItineraryAction {...defaultProps} />, container);

        const resetButton = container.querySelector('button:first-child');
        expect(resetButton).toBeTruthy();
        expect(resetButton.textContent).toBe('itinerary.reset');
    });

    it('should render run button', () => {
        ReactDOM.render(<ItineraryAction {...defaultProps} />, container);

        const runButton = container.querySelector('.run-btn');
        expect(runButton).toBeTruthy();
        expect(runButton.classList.contains('btn-primary')).toBeTruthy();
    });

    it('should render run button with correct text', () => {
        ReactDOM.render(<ItineraryAction {...defaultProps} />, container);

        const runButton = container.querySelector('.run-btn');
        expect(runButton.textContent).toContain('itinerary.run');
    });

    it('should enable run button when locations length is 2 or more and not loading', () => {
        const propsWithTwoLocations = {
            ...defaultProps,
            locations: [
                [2.3522, 48.8566], // Paris
                [4.8320, 45.7578]  // Lyon
            ],
            itineraryLoading: false
        };

        ReactDOM.render(<ItineraryAction {...propsWithTwoLocations} />, container);

        const runButton = container.querySelector('.run-btn');
        expect(runButton.disabled).toBe(false);
    });

    it('should disable run button when locations length is less than 2', () => {
        const propsWithOneLocation = {
            ...defaultProps,
            locations: [
                [2.3522, 48.8566] // Paris only
            ],
            itineraryLoading: false
        };

        ReactDOM.render(<ItineraryAction {...propsWithOneLocation} />, container);

        const runButton = container.querySelector('.run-btn');
        expect(runButton.disabled).toBeTruthy();
    });

    it('should disable run button when locations array is empty', () => {
        const propsWithNoLocations = {
            ...defaultProps,
            locations: [],
            itineraryLoading: false
        };

        ReactDOM.render(<ItineraryAction {...propsWithNoLocations} />, container);

        const runButton = container.querySelector('.run-btn');
        expect(runButton.disabled).toBeTruthy();
    });

    it('should disable run button when itineraryLoading is true', () => {
        const propsWithLoading = {
            ...defaultProps,
            locations: [
                [2.3522, 48.8566], // Paris
                [4.8320, 45.7578]  // Lyon
            ],
            itineraryLoading: true
        };

        ReactDOM.render(<ItineraryAction {...propsWithLoading} />, container);

        const runButton = container.querySelector('.run-btn');
        expect(runButton.disabled).toBeTruthy();
    });

    it('should disable run button when both conditions are met (insufficient locations and loading)', () => {
        const propsWithBothConditions = {
            ...defaultProps,
            locations: [
                [2.3522, 48.8566] // Paris only
            ],
            itineraryLoading: true
        };

        ReactDOM.render(<ItineraryAction {...propsWithBothConditions} />, container);

        const runButton = container.querySelector('.run-btn');
        expect(runButton.disabled).toBeTruthy();
    });

    it('should show loader when itineraryLoading is true', () => {
        const propsWithLoading = {
            ...defaultProps,
            itineraryLoading: true
        };

        ReactDOM.render(<ItineraryAction {...propsWithLoading} />, container);

        const loader = container.querySelector('.mapstore-small-size-loader');
        expect(loader).toBeTruthy();
    });

    it('should not show loader when itineraryLoading is false', () => {
        const propsWithoutLoading = {
            ...defaultProps,
            itineraryLoading: false
        };

        ReactDOM.render(<ItineraryAction {...propsWithoutLoading} />, container);

        const loader = container.querySelector('.ms-loader');
        expect(loader).toBeFalsy();
    });

    it('should call onHandleRun when run button is clicked', () => {
        let runCalled = false;

        const mockOnHandleRun = () => {
            runCalled = true;
        };

        const propsWithRunHandler = {
            ...defaultProps,
            onHandleRun: mockOnHandleRun
        };

        ReactDOM.render(<ItineraryAction {...propsWithRunHandler} />, container);

        const runButton = container.querySelector('.run-btn');
        ReactTestUtils.Simulate.click(runButton);

        expect(runCalled).toBeTruthy();
    });

    it('should call onHandleReset when reset button is clicked', () => {
        let resetCalled = false;

        const mockOnHandleReset = () => {
            resetCalled = true;
        };

        const propsWithResetHandler = {
            ...defaultProps,
            onHandleReset: mockOnHandleReset
        };

        ReactDOM.render(<ItineraryAction {...propsWithResetHandler} />, container);

        const resetButton = container.querySelector('button:first-child');
        ReactTestUtils.Simulate.click(resetButton);

        expect(resetCalled).toBeTruthy();
    });

    it('should not call onHandleRun when run button is disabled', () => {
        let runCalled = false;

        const mockOnHandleRun = () => {
            runCalled = true;
        };

        const propsWithDisabledRun = {
            ...defaultProps,
            locations: [], // This will disable the button
            onHandleRun: mockOnHandleRun
        };

        ReactDOM.render(<ItineraryAction {...propsWithDisabledRun} />, container);

        const runButton = container.querySelector('.run-btn');
        expect(runButton.disabled).toBeTruthy();

        ReactTestUtils.Simulate.click(runButton);

        // Even if clicked, the function should not be called when disabled
        expect(runCalled).toBe(false);
    });

    it('should handle undefined locations', () => {
        const propsWithUndefinedLocations = {
            ...defaultProps,
            locations: undefined
        };

        ReactDOM.render(<ItineraryAction {...propsWithUndefinedLocations} />, container);

        const runButton = container.querySelector('.run-btn');
        expect(runButton.disabled).toBeTruthy();
    });

    it('should have proper button elements', () => {
        ReactDOM.render(<ItineraryAction {...defaultProps} />, container);

        const buttons = container.querySelectorAll('button');
        expect(buttons.length).toBe(2);

        buttons.forEach(button => {
            expect(button.tagName).toBe('BUTTON');
        });
    });

    it('should have proper button text content', () => {
        ReactDOM.render(<ItineraryAction {...defaultProps} />, container);

        const resetButton = container.querySelector('button:first-child');
        const runButton = container.querySelector('.run-btn');

        expect(resetButton.textContent.trim()).toBe('itinerary.reset');
        expect(runButton.textContent.trim()).toContain('itinerary.run');
    });

    it('should use Message component for run button text', () => {
        ReactDOM.render(<ItineraryAction {...defaultProps} />, container);

        const runButton = container.querySelector('.run-btn');

        expect(runButton.textContent).toContain('itinerary.run');
    });

    it('should use correct message ID for run button', () => {
        ReactDOM.render(<ItineraryAction {...defaultProps} />, container);

        const runButton = container.querySelector('.run-btn');
        expect(runButton.textContent).toContain('itinerary.run');
    });
});
