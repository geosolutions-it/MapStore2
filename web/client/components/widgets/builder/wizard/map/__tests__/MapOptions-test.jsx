/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import {DragDropContext as dragDropContext} from 'react-dnd';
import testBackend from 'react-dnd-test-backend';
import ReactDOM from 'react-dom';
import { Simulate } from 'react-dom/test-utils';

import MapOptionsComp from '../MapOptions';

const MapOptions = dragDropContext(testBackend)(MapOptionsComp);

describe('MapOptions component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('MapOptions rendering with defaults', () => {
        ReactDOM.render(<MapOptions />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.mapstore-step-title')).toBeTruthy();
        // renders the TOC tab by default
        expect(container.querySelector('.ms-row-tab')).toBeTruthy();
        expect(container.querySelector('.empty-state-container')).toBeTruthy();
    });

    it('MapOptions rendering with layers', () => {
        ReactDOM.render(<MapOptions
            map={{
                mapId: 'test-map',
                groups: [{ id: 'GGG' }],
                layers: [{ id: "LAYER", group: "GGG", name: "LAYER", options: {} }]
            }}
            nodes={[{ id: 'GGG', nodes: [{ id: "LAYER", group: "GGG", name: "LAYER", options: {} }] }]}
            layers={[{ id: "LAYER", group: "GGG", name: "LAYER", options: {} }]}
        />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.mapstore-step-title')).toBeTruthy();
        // renders the TOC
        expect(container.querySelector('.ms-layers-tree')).toBeTruthy();
        expect(container.querySelector('.empty-state-container')).toBeFalsy();
    });

    it('MapOptions rendering node editor', () => {
        ReactDOM.render(<MapOptions
            map={{
                mapId: 'test-map',
                groups: [{ id: 'GGG' }],
                layers: [{ id: "LAYER", group: "GGG", name: "LAYER", options: {} }]
            }}
            nodes={[{ id: 'GGG', nodes: [{ id: "LAYER", group: "GGG", name: "LAYER", options: {}}]}]}
            layers={[{ id: "LAYER", group: "GGG", name: "LAYER", options: {} }]}
            editNode={"LAYER"}
        />, document.getElementById("container"));
        const container = document.getElementById('container');
        // renders the editor
        expect(container.querySelector('.ms-row-tab')).toBeTruthy();
        // not the TOC
        expect(container.querySelector('.ms-layers-tree')).toBeFalsy();
    });

    it('MapOptions renders preview section', () => {
        const mockPreview = <div className="test-preview">Preview Content</div>;
        ReactDOM.render(<MapOptions preview={mockPreview} />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.test-preview')).toBeTruthy();
        expect(container.querySelector('.test-preview').textContent).toBe('Preview Content');
    });

    it('MapOptions tab navigation works correctly', () => {
        ReactDOM.render(<MapOptions map={{ mapId: 'test-map' }} />, document.getElementById("container"));
        const container = document.getElementById('container');

        // Initially TOC tab should be active
        expect(container.querySelector('.ms-row-tab')).toBeTruthy();
        const settingsTab = container.querySelectorAll('.nav-tabs > li')[1].querySelector('a');
        // Find and click the settings tab
        expect(settingsTab).toBeTruthy();
        Simulate.click(settingsTab);

        // After clicking settings tab, should show settings content
        expect(document.querySelector('.widget-options-form')).toBeTruthy();
    });

    it('MapViewOptions renders checkboxes correctly', (done) => {
        const map = {
            mapId: 'test-map',
            showBackgroundSelector: true,
            showLegend: false
        };

        ReactDOM.render(<MapOptions map={map} />, document.getElementById("container"));
        const container = document.getElementById('container');

        // Switch to settings tab
        const settingsTab = container.querySelectorAll('.nav-tabs > li')[1].querySelector('a');
        expect(settingsTab).toBeTruthy();
        Simulate.click(settingsTab);

        // Wait for the component to render and then check checkboxes
        setTimeout(() => {
            // Check background selector checkbox
            const backgroundCheckbox = container.querySelector('input[type="checkbox"]');
            expect(backgroundCheckbox).toBeTruthy();
            expect(backgroundCheckbox.checked).toBe(true);

            // Check legend checkbox
            const legendCheckbox = container.querySelectorAll('input[type="checkbox"]')[1];
            expect(legendCheckbox).toBeTruthy();
            expect(legendCheckbox.checked).toBe(false);
            done();
        }, 10);
    });

    it('MapViewOptions checkbox interactions trigger onChange', (done) => {
        const map = {
            mapId: 'test-map',
            showBackgroundSelector: false,
            showLegend: false
        };

        const onChangeSpy = expect.createSpy();

        ReactDOM.render(<MapOptions map={map} onChange={onChangeSpy} />, document.getElementById("container"));
        const container = document.getElementById('container');

        // Switch to settings tab
        const settingsTab = container.querySelectorAll('.nav-tabs > li')[1].querySelector('a');
        expect(settingsTab).toBeTruthy();
        Simulate.click(settingsTab);

        // Wait for the component to render and then interact with checkboxes
        setTimeout(() => {
            // Click background selector checkbox
            const backgroundCheckbox = container.querySelector('input[type="checkbox"]');
            expect(backgroundCheckbox).toBeTruthy();
            Simulate.change(backgroundCheckbox, { target: { checked: true } });

            expect(onChangeSpy).toHaveBeenCalledWith('maps[test-map].showBackgroundSelector', true);

            // Click legend checkbox
            const legendCheckbox = container.querySelectorAll('input[type="checkbox"]')[1];
            expect(legendCheckbox).toBeTruthy();
            Simulate.change(legendCheckbox, { target: { checked: true } });

            expect(onChangeSpy).toHaveBeenCalledWith('maps[test-map].showLegend', true);
            done();
        }, 10);
    });

    it('MapViewOptions shows legend warning when legend widget exists', (done) => {
        const map = {
            mapId: 'test-map',
            showLegend: true
        };

        const widgets = [{
            widgetType: 'legend',
            dependenciesMap: {
                layers: 'widgets[test-widget].maps'
            }
        }];

        ReactDOM.render(<MapOptions
            map={map}
            widgets={widgets}
            widgetId="test-widget"
        />, document.getElementById("container"));
        const container = document.getElementById('container');

        // Switch to settings tab
        const settingsTab = container.querySelectorAll('.nav-tabs > li')[1].querySelector('a');
        expect(settingsTab).toBeTruthy();
        Simulate.click(settingsTab);

        // Wait for the component to render and then check for warning
        setTimeout(() => {
            // Should show warning alert
            expect(container.querySelector('.alert-warning')).toBeTruthy();
            done();
        }, 10);
    });

    it('MapViewOptions does not show warning when no legend widget exists', (done) => {
        const map = {
            mapId: 'test-map',
            showLegend: true
        };

        const widgets = [{
            widgetType: 'chart',
            dependenciesMap: {
                layers: 'widgets[test-widget].maps'
            }
        }];

        ReactDOM.render(<MapOptions
            map={map}
            widgets={widgets}
            widgetId="test-widget"
        />, document.getElementById("container"));
        const container = document.getElementById('container');

        // Switch to settings tab
        const settingsTab = container.querySelectorAll('.nav-tabs > li')[1].querySelector('a');
        expect(settingsTab).toBeTruthy();
        Simulate.click(settingsTab);

        // Wait for the component to render and then check for no warning
        setTimeout(() => {
            // Should not show warning alert
            expect(container.querySelector('.alert-warning')).toBeFalsy();
            done();
        }, 10);
    });

    it('MapViewOptions handles legend widget with different dependency path', (done) => {
        const map = {
            mapId: 'test-map',
            showLegend: true
        };

        const widgets = [{
            widgetType: 'legend',
            dependenciesMap: {
                layers: 'widgets[different-widget].maps'
            }
        }];

        ReactDOM.render(<MapOptions
            map={map}
            widgets={widgets}
            widgetId="test-widget"
        />, document.getElementById("container"));
        const container = document.getElementById('container');

        // Switch to settings tab
        const settingsTab = container.querySelectorAll('.nav-tabs > li')[1].querySelector('a');
        expect(settingsTab).toBeTruthy();
        Simulate.click(settingsTab);

        // Wait for the component to render and then check for no warning
        setTimeout(() => {
            // Should not show warning alert since dependency path doesn't match
            expect(container.querySelector('.alert-warning')).toBeFalsy();
            done();
        }, 10);
    });
});
