/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import React from 'react';
import { Provider } from 'react-redux';
import ReactDOM from 'react-dom';
import MapSettings from '../mapsettings/MapSettings';
import configureMockStore from 'redux-mock-store';

const mockStore = configureMockStore();

// Helper: render MapSettings inside a Provider with a Cesium store
const renderCesium = (mapOptions = {}, extraProps = {}) => {
    const store = mockStore({
        map: { present: { mapOptions } },
        maptype: { mapType: 'cesium' }
    });
    ReactDOM.render(
        <Provider store={store}>
            <MapSettings {...extraProps} />
        </Provider>,
        document.getElementById('container')
    );
};

// Helper: render MapSettings inside a Provider with an OpenLayers store
const renderOL = (mapOptions = {}) => {
    const store = mockStore({
        map: { present: { mapOptions } },
        maptype: { mapType: 'openlayers' }
    });
    ReactDOM.render(
        <Provider store={store}><MapSettings /></Provider>,
        document.getElementById('container')
    );
};

describe('MapSettings component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('renders nothing when isCesium is false (OL map)', () => {
        renderOL();
        const container = document.getElementById('container');
        expect(container.innerHTML).toBeFalsy();
        const form = document.querySelector('form');
        expect(form).toBeFalsy();
    });

    it('renders a form when isCesium is true', () => {
        renderCesium();
        const form = document.querySelector('form');
        expect(form).toBeTruthy();
    });

    it('renders all 6 Cesium checkboxes', () => {
        renderCesium();
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        expect(checkboxes.length).toBe(6);
    });

    it('renders the lighting select dropdown', () => {
        renderCesium();
        const selects = document.querySelectorAll('.Select');
        expect(selects.length).toBeGreaterThan(0);
    });

    it('showSkyAtmosphere checkbox reflects mapOptions value when true', () => {
        renderCesium({ showSkyAtmosphere: true });
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        expect(checkboxes[0].checked).toBe(true);
    });

    it('showSkyAtmosphere checkbox reflects mapOptions value when false', () => {
        renderCesium({ showSkyAtmosphere: false });
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        expect(checkboxes[0].checked).toBe(false);
    });

    it('showGroundAtmosphere checkbox reflects mapOptions value', () => {
        renderCesium({ showGroundAtmosphere: true });
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        expect(checkboxes[1].checked).toBe(true);
    });

    it('enableFog checkbox reflects mapOptions value', () => {
        renderCesium({ enableFog: true });
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        expect(checkboxes[2].checked).toBe(true);
    });

    it('depthTestAgainstTerrain checkbox reflects mapOptions value', () => {
        renderCesium({ depthTestAgainstTerrain: true });
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        expect(checkboxes[3].checked).toBe(true);
    });

    it('enableCollisionDetection defaults to true when not set in mapOptions', () => {
        renderCesium();
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        expect(checkboxes[4].checked).toBe(true);
    });

    it('enableCollisionDetection reflects mapOptions value when explicitly set to false', () => {
        renderCesium({ enableCollisionDetection: false });
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        expect(checkboxes[4].checked).toBe(false);
    });

    it('enableImageryLayersOverlay defaults to true when not set in mapOptions', () => {
        renderCesium();
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        expect(checkboxes[5].checked).toBe(true);
    });

    it('enableImageryLayersOverlay reflects mapOptions value when explicitly set to false', () => {
        renderCesium({ enableImageryLayersOverlay: false });
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        expect(checkboxes[5].checked).toBe(false);
    });

    it('does not render DateTime picker when lighting is sunlight', () => {
        renderCesium({ lighting: { value: 'sunlight' } });
        const datePicker = document.querySelector('.lighting-dateTime-picker');
        expect(datePicker).toBeFalsy();
    });

    it('does not render DateTime picker when lighting is flashlight', () => {
        renderCesium({ lighting: { value: 'flashlight' } });
        const datePicker = document.querySelector('.lighting-dateTime-picker');
        expect(datePicker).toBeFalsy();
    });

    it('renders DateTime picker when lighting is set to dateTime', () => {
        renderCesium({ lighting: { value: 'dateTime', dateTime: new Date().toISOString() } });
        const datePicker = document.querySelector('.lighting-dateTime-picker');
        expect(datePicker).toBeTruthy();
    });

    it('uses defaultMapOptions prop when map.mapOptions is empty', () => {
        renderCesium({}, { mapOptions: { cesium: { showSkyAtmosphere: true, enableFog: true } } });
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        expect(checkboxes[0].checked).toBe(true);
        expect(checkboxes[2].checked).toBe(true);
    });

    it('map.mapOptions overrides defaultMapOptions prop', () => {
        renderCesium(
            { showSkyAtmosphere: false },
            { mapOptions: { cesium: { showSkyAtmosphere: true } } }
        );
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        expect(checkboxes[0].checked).toBe(false);
    });
});
