/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {compose, defaultProps} from 'recompose';
import '../../../../libs/bindings/rxjsRecompose';

import mapWidget from '../../enhancers/mapWidget';
import MapWidgetComp from '../MapWidget';

const MapWidget = compose(
    defaultProps({
        canEdit: true
    }),
    mapWidget)(MapWidgetComp);
describe('MapWidget component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('MapWidget rendering with defaults', () => {
        ReactDOM.render(<Provider store={{subscribe: () => {}, getState: () => ({maptype: {mapType: 'openlayers'}})}} ><MapWidget map={{size: {height: 401, width: 401}, layers: []}}/></Provider>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.glyphicon-pencil')).toBeTruthy();
        expect(container.querySelector('.glyphicon-trash')).toBeTruthy();
    });
    it('view only mode', () => {
        ReactDOM.render(<Provider store={{ subscribe: () => { }, getState: () => ({ maptype: { mapType: 'openlayers' } }) }} ><MapWidget map={{size: {height: 401, width: 401}, layers: [] }} canEdit={false}/></Provider>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.glyphicon-pencil')).toNotExist();
        expect(container.querySelector('.glyphicon-trash')).toNotExist();
    });
    it('renders MapSwitcher when multiple maps are provided', () => {
        const maps = [
            { mapId: 'map1', title: 'Map 1' },
            { mapId: 'map2', title: 'Map 2' }
        ];
        ReactDOM.render(<Provider store={{ subscribe: () => { }, getState: () => ({ maptype: { mapType: 'openlayers' } }) }} ><MapWidget map={{size: {height: 401, width: 401}, layers: [] }} maps={maps} selectedMapId="map1"/></Provider>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.map-switcher')).toBeTruthy();
    });
    it('renders BackgroundSelector when showBackgroundSelector is true and background layers exist', () => {
        const map = {
            size: { height: 500, width: 500 },
            layers: [
                { id: 'bg1', group: 'background', visibility: true },
                { id: 'layer1', group: 'overlay', visibility: true }
            ],
            showBackgroundSelector: true,
            mapInfoControl: true
        };
        ReactDOM.render(<Provider store={{ subscribe: () => { }, getState: () => ({ maptype: { mapType: 'openlayers' } }) }} >
            <MapWidget map={map}/></Provider>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.ms-background-selector')).toBeTruthy();
    });
    it('does not render BackgroundSelector when showBackgroundSelector is false', () => {
        const map = {
            size: { height: 500, width: 500 },
            layers: [
                { id: 'bg1', group: 'background', visibility: true }
            ],
            showBackgroundSelector: false,
            mapInfoControl: true
        };
        ReactDOM.render(<Provider store={{ subscribe: () => { }, getState: () => ({ maptype: { mapType: 'openlayers' } }) }} ><MapWidget map={map}/></Provider>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.ms-background-selector')).toNotExist();
    });
    it('renders LegendView when showLegend is true', () => {
        const map = {
            size: { height: 500, width: 500 },
            layers: [],
            showLegend: true,
            mapInfoControl: true
        };
        ReactDOM.render(<Provider store={{ subscribe: () => { }, getState: () => ({ maptype: { mapType: 'openlayers' } }) }} ><MapWidget map={map}/></Provider>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.legend-in-mapview')).toBeTruthy();
    });
    it('does not render LegendView when showLegend is false', () => {
        const map = {
            size: { height: 500, width: 500 },
            layers: [],
            showLegend: false,
            mapInfoControl: true
        };
        ReactDOM.render(<Provider store={{ subscribe: () => { }, getState: () => ({ maptype: { mapType: 'openlayers' } }) }} ><MapWidget map={map}/></Provider>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.legend-in-mapview')).toNotExist();
    });
    it('renders loading spinner when loading is true', () => {
        ReactDOM.render(<Provider store={{ subscribe: () => { }, getState: () => ({ maptype: { mapType: 'openlayers' } }) }} ><MapWidget map={{size: {height: 401, width: 401}, layers: [] }} loading/></Provider>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.widget-footer')).toBeTruthy();
        expect(container.querySelector('.mapstore-inline-loader')).toBeTruthy();
    });
    it('does not render loading spinner when loading is false', () => {
        ReactDOM.render(<Provider store={{ subscribe: () => { }, getState: () => ({ maptype: { mapType: 'openlayers' } }) }} ><MapWidget map={{size: {height: 401, width: 401}, layers: [] }} loading={false}/></Provider>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.widget-footer')).toNotExist();
    });
    it('enables viewer tools when map is large enough and has mapInfoControl', () => {
        const map = {
            size: { height: 500, width: 500 },
            layers: [],
            mapInfoControl: true
        };
        ReactDOM.render(<Provider store={{ subscribe: () => { }, getState: () => ({ maptype: { mapType: 'openlayers' } }) }} ><MapWidget map={map}/></Provider>, document.getElementById("container"));
        const container = document.getElementById('container');
        // MapView should have popup tools enabled
        expect(container.querySelector('.map-widget-view-content')).toBeTruthy();
    });
    it('disables viewer tools when map is too small', () => {
        const map = {
            size: { height: 300, width: 300 },
            layers: [],
            mapInfoControl: true
        };
        ReactDOM.render(<Provider store={{ subscribe: () => { }, getState: () => ({ maptype: { mapType: 'openlayers' } }) }} ><MapWidget map={map}/></Provider>, document.getElementById("container"));
        const container = document.getElementById('container');
        // BackgroundSelector and LegendView should not be rendered when tools are disabled
        expect(container.querySelector('.ms-background-selector')).toNotExist();
        expect(container.querySelector('.legend-in-mapview')).toNotExist();
    });
    it('disables MapSwitcher when selectionActive is true', () => {
        const maps = [
            { mapId: 'map1', title: 'Map 1' },
            { mapId: 'map2', title: 'Map 2' }
        ];
        ReactDOM.render(<Provider store={{ subscribe: () => { }, getState: () => ({ maptype: { mapType: 'openlayers' } }) }} ><MapWidget map={{size: {height: 401, width: 401}, layers: [] }} maps={maps} selectedMapId="map1" selectionActive/></Provider>, document.getElementById("container"));
        const container = document.getElementById('container');
        const mapSwitcher = container.querySelector('.map-switcher');
        expect(mapSwitcher).toBeTruthy();
        expect(mapSwitcher.classList.contains('is-disabled')).toBeTruthy();
    });
    it('renders with custom topRightItems', () => {
        const customItem = <div key="custom-item" className="custom-top-item">Custom Item</div>;
        ReactDOM.render(<Provider store={{ subscribe: () => { }, getState: () => ({ maptype: { mapType: 'openlayers' } }) }} ><MapWidget map={{size: {height: 401, width: 401}, layers: [] }} topRightItems={[customItem]}/></Provider>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.custom-top-item')).toBeTruthy();
    });
});
