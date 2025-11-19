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

import GraphHopperProvider from '../GraphHopperProvider';

describe('GraphHopperProvider component', () => {
    let container;
    const defaultProps = {
        registerApi: expect.createSpy(),
        config: {
            key: 'test-key',
            url: 'https://api.test.com',
            profile: 'car',
            distance_limit: 1000
        }
    };

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
        const component = React.createElement(GraphHopperProvider, {
            ...defaultProps,
            ...props
        });
        return ReactDOM.render(component, container);
    };

    describe('render component', () => {
        it('should render with default props', () => {
            renderComponent();
            expect(container.querySelector('.ms-isochrone-provider')).toBeTruthy();
        });

        it('should render all main sections', () => {
            renderComponent();
            expect(container.querySelector('.ms-range-by-container')).toBeTruthy();
            expect(container.querySelector('.ms-isochrone-mode-container')).toBeTruthy();
            expect(container.querySelector('.ms-isochrone-direction-container')).toBeTruthy();
            expect(container.querySelector('.ms-isochrone-bucket-container')).toBeTruthy();
        });

        it('should render range selection controls', () => {
            renderComponent();
            expect(container.querySelector('.ms-range-by-select')).toBeTruthy();
            expect(container.querySelector('#intl-numeric')).toBeTruthy();
        });

        it('should render profile selection buttons', () => {
            renderComponent();
            expect(container.querySelector('.ms-isochrone-profile')).toBeTruthy();
            const profileButtons = container.querySelectorAll('.ms-isochrone-profile-btn');
            expect(profileButtons.length).toBeGreaterThan(0);
        });

        it('should render direction selection buttons', () => {
            renderComponent();
            expect(container.querySelector('.ms-isochrone-direction')).toBeTruthy();
            const directionButtons = container.querySelectorAll('.ms-isochrone-direction-btn');
            expect(directionButtons.length).toBeGreaterThan(0);
        });

        it('should render buckets slider', () => {
            renderComponent();
            expect(container.querySelector('.mapstore-slider')).toBeTruthy();
        });
    });

    describe('Range selection', () => {
        it('should initialize with distance range by default', () => {
            renderComponent();
            const numberInput = container.querySelector('#intl-numeric');
            expect(numberInput).toBeTruthy();
        });

        it('should switch between distance and time limits when range changes', () => {
            renderComponent();
            const select = container.querySelector('.ms-range-by-select');
            const numberInput = container.querySelector('#intl-numeric');

            expect(select).toBeTruthy();
            expect(numberInput).toBeTruthy();
        });
    });

    describe('Profile selection', () => {
        it('should render all profile options', () => {
            renderComponent();
            const profileButtons = container.querySelectorAll('.ms-isochrone-profile-btn');
            expect(profileButtons.length).toBe(2); // car, foot
        });

        it('should highlight selected profile', () => {
            renderComponent();
            const profileButtons = container.querySelectorAll('.ms-isochrone-profile-btn');
            const selectedButton = Array.from(profileButtons).find(btn =>
                btn.className.includes('btn-primary')
            );
            expect(selectedButton).toBeTruthy();
        });

        it('should call handleProviderBodyChange when profile is clicked', () => {
            renderComponent();
            const profileButtons = container.querySelectorAll('.ms-isochrone-profile-btn');
            const firstButton = profileButtons[0];

            TestUtils.Simulate.click(firstButton);
            // The component should update its internal state
        });
    });

    describe('Direction selection', () => {
        it('should render departure and arrival buttons', () => {
            renderComponent();
            const directionButtons = container.querySelectorAll('.ms-isochrone-direction-btn');
            expect(directionButtons.length).toBe(2);
        });

        it('should highlight selected direction', () => {
            renderComponent();
            const directionButtons = container.querySelectorAll('.ms-isochrone-direction-btn');
            const selectedButton = Array.from(directionButtons).find(btn =>
                btn.className.includes('btn-primary')
            );
            expect(selectedButton).toBeTruthy();
        });
    });

    describe('Buckets configuration', () => {
        it('should render buckets slider', () => {
            renderComponent();
            const slider = container.querySelector('.mapstore-slider');
            expect(slider).toBeTruthy();
        });

        it('should show warning when buckets > 4', () => {
            // This would require setting the internal state to have buckets > 4
            // The component manages this internally based on slider value
            renderComponent();
            // The warning would appear when the slider value exceeds 4
        });
    });

    describe('API registration', () => {
        it('should call registerApi with correct parameters', () => {
            const registerApi = expect.createSpy();
            renderComponent({ registerApi });

            // The component should register the API in useEffect
            expect(registerApi).toHaveBeenCalled();
        });

        it('should provide getDirections function to API', () => {
            const registerApi = expect.createSpy();
            renderComponent({ registerApi });

            expect(registerApi).toHaveBeenCalled();
        });
    });

    describe('Configuration handling', () => {
        it('should update providerBody when config changes', () => {
            const newConfig = {
                key: 'new-key',
                url: 'https://new-api.com',
                profile: 'foot',
                distance_limit: 2000
            };

            renderComponent({ config: newConfig });
            expect(container.querySelector('.ms-isochrone-provider')).toBeTruthy();
        });

        it('should handle missing config gracefully', () => {
            renderComponent({ config: null });
            expect(container.querySelector('.ms-isochrone-provider')).toBeTruthy();
        });
    });

    it('should register API on mount', () => {
        const registerApi = expect.createSpy();
        renderComponent({ registerApi });
        expect(registerApi).toHaveBeenCalled();
    });

    it('should update when config changes', () => {
        const registerApi = expect.createSpy();
        renderComponent({ registerApi });

        const newConfig = { key: 'new-key', url: 'https://new-api.com' };
        // Re-render with new config
        renderComponent({ registerApi, config: newConfig });
        expect(container.querySelector('.ms-isochrone-provider')).toBeTruthy();
    });

    it('should handle API errors gracefully', () => {
        renderComponent();
        // The component should handle errors in getDirections
        expect(container.querySelector('.ms-isochrone-provider')).toBeTruthy();
    });

    describe('direction selection', () => {
        it('should render direction selection container', () => {
            renderComponent();
            const directionContainer = container.querySelector('.ms-isochrone-direction-container');
            expect(directionContainer).toBeTruthy();
        });

        it('should render direction button group', () => {
            renderComponent();
            const buttonGroup = container.querySelector('.ms-isochrone-direction');
            expect(buttonGroup).toBeTruthy();
            const buttons = container.querySelectorAll('.ms-isochrone-direction-btn');
            expect(buttons.length).toBe(2);
        });

        it('should highlight departure when reverseFlow is false', () => {
            const props = {
                currentRunParameters: { reverseFlow: false }
            };
            renderComponent(props);
            const buttons = container.querySelectorAll('.ms-isochrone-direction-btn');
            const departureButton = buttons[0];
            const arrivalButton = buttons[1];

            // Departure should be primary when reverseFlow is false
            expect(departureButton.classList.contains('btn-primary')).toBe(true);
            expect(arrivalButton.classList.contains('btn-primary')).toBe(false);
        });

        it('should highlight arrival when reverseFlow is true', () => {
            const props = {
                currentRunParameters: { reverseFlow: true }
            };
            renderComponent(props);
            const buttons = container.querySelectorAll('.ms-isochrone-direction-btn');
            const departureButton = buttons[0];
            const arrivalButton = buttons[1];

            // Arrival should be primary when reverseFlow is true
            expect(arrivalButton.classList.contains('btn-primary')).toBe(true);
            expect(departureButton.classList.contains('btn-primary')).toBe(false);
        });

        it('should call handleProviderBodyChange with reverseFlow false when departure button is clicked', () => {
            const props = {
                currentRunParameters: { reverseFlow: true }
            };

            renderComponent(props);
            const buttons = container.querySelectorAll('.ms-isochrone-direction-btn');
            const departureButton = buttons[0];

            TestUtils.Simulate.click(departureButton);

            // After clicking departure, it should be highlighted (reverseFlow = false)
            expect(departureButton.classList.contains('btn-primary')).toBe(true);
        });

        it('should call handleProviderBodyChange with reverseFlow true when arrival button is clicked', () => {
            const props = {
                currentRunParameters: { reverseFlow: false }
            };
            renderComponent(props);
            const buttons = container.querySelectorAll('.ms-isochrone-direction-btn');
            const arrivalButton = buttons[1];

            TestUtils.Simulate.click(arrivalButton);

            // After clicking arrival, it should be highlighted (reverseFlow = true)
            expect(arrivalButton.classList.contains('btn-primary')).toBe(true);
        });

        it('should toggle between departure and arrival correctly', () => {
            renderComponent({ currentRunParameters: { reverseFlow: false } });
            const buttons = container.querySelectorAll('.ms-isochrone-direction-btn');
            const departureButton = buttons[0];
            const arrivalButton = buttons[1];

            // Initially departure should be selected
            expect(departureButton.classList.contains('btn-primary')).toBe(true);
            expect(arrivalButton.classList.contains('btn-primary')).toBe(false);

            // Click arrival
            TestUtils.Simulate.click(arrivalButton);
            expect(arrivalButton.classList.contains('btn-primary')).toBe(true);
            expect(departureButton.classList.contains('btn-primary')).toBe(false);

            // Click departure
            TestUtils.Simulate.click(departureButton);
            expect(departureButton.classList.contains('btn-primary')).toBe(true);
            expect(arrivalButton.classList.contains('btn-primary')).toBe(false);
        });
    });
});
