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

import GraphHopperProvider from '../GraphHopper';
import { DEFAULT_PROVIDER } from '../../../constants';

describe('GraphHopperProvider Component', () => {
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
        registerApi: () => {},
        config: {
            key: 'test-api-key',
            url: 'https://custom-graphhopper.com/api/1/route',
            profile: 'car'
        }
    };

    it('should render the component container', () => {
        ReactDOM.render(<GraphHopperProvider {...defaultProps} />, container);
        const componentContainer = container.querySelector('.itinerary-graphhopper');
        expect(componentContainer).toBeTruthy();
    });

    it('should handle undefined props', () => {
        ReactDOM.render(<GraphHopperProvider />, container);
        expect(container.querySelector('.itinerary-graphhopper')).toBeTruthy();
    });

    it('should render profile selection buttons', () => {
        ReactDOM.render(<GraphHopperProvider {...defaultProps} />, container);
        const profileButtons = container.querySelectorAll('.profile-btn');
        expect(profileButtons.length).toBe(2);
    });

    it('should render route optimization toggle', () => {
        ReactDOM.render(<GraphHopperProvider {...defaultProps} />, container);
        const optimizeToggle = container.querySelector('input[type="checkbox"]');
        expect(optimizeToggle).toBeTruthy();
        expect(optimizeToggle.checked).toBeTruthy();
    });

    it('should highlight selected profile button', () => {
        ReactDOM.render(<GraphHopperProvider {...defaultProps} />, container);
        const profileButtons = container.querySelectorAll('.profile-btn');
        const selectedButton = Array.from(profileButtons).find(btn =>
            btn.classList.contains('btn-primary')
        );
        expect(selectedButton).toBeTruthy();
    });

    it('should change selected profile when clicked', () => {
        ReactDOM.render(<GraphHopperProvider {...defaultProps} />, container);
        const profileButtons = container.querySelectorAll('.profile-btn');
        const bikeButton = Array.from(profileButtons).find(btn =>
            btn.querySelector('.glyphicon').classList.contains('glyphicon-car')
        );
        ReactTestUtils.Simulate.click(bikeButton);
        expect(bikeButton.classList.contains('btn-primary')).toBeTruthy();
    });

    it('should call registerApi on mount', () => {
        let registerApiCalled = false;
        const mockRegisterApi = () => {
            registerApiCalled = true;
        };
        const propsWithRegisterApi = {
            ...defaultProps,
            registerApi: mockRegisterApi
        };
        ReactDOM.render(<GraphHopperProvider {...propsWithRegisterApi} />, container);
        expect(registerApiCalled).toBeTruthy();
    });

    it('should register with correct provider name', () => {
        let registeredProvider = null;
        const mockRegisterApi = (providerName) => {
            registeredProvider = providerName;
        };
        const propsWithRegisterApi = {
            ...defaultProps,
            registerApi: mockRegisterApi
        };
        ReactDOM.render(<GraphHopperProvider {...propsWithRegisterApi} />, container);
        expect(registeredProvider).toBe(DEFAULT_PROVIDER);
    });

    it('should use config profile as initial profile', () => {
        const configWithProfile = {
            ...defaultProps.config,
            profile: 'car'
        };
        const propsWithProfile = {
            ...defaultProps,
            config: configWithProfile
        };
        ReactDOM.render(<GraphHopperProvider {...propsWithProfile} />, container);
        const profileButtons = container.querySelectorAll('.profile-btn');
        const carButton = Array.from(profileButtons).find(btn =>
            btn.querySelector('.glyphicon').classList.contains('glyphicon-car')
        );
        expect(carButton.classList.contains('btn-primary')).toBeTruthy();
    });

    it('should handle missing registerApi gracefully', () => {
        const propsWithoutRegisterApi = {
            config: defaultProps.config
        };
        ReactDOM.render(<GraphHopperProvider {...propsWithoutRegisterApi} />, container);
        expect(container.querySelector('.itinerary-graphhopper')).toBeTruthy();
    });
});
