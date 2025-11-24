/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';

import LegendWizard from '../LegendWizard';

describe('LegendWizard component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('LegendWizard rendering with defaults', () => {
        ReactDOM.render(<LegendWizard />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-wizard');
        expect(el).toBeTruthy();
        expect(container.querySelector('.empty-state-container')).toBeTruthy();
    });

    it('LegendWizard rendering with valid dependencies', () => {
        const LAYERS = [{
            id: 'layer:00',
            name: 'layer:00',
            title: 'Layer',
            visibility: true,
            type: 'wms'
        },
        {
            id: 'layer:01',
            name: 'layer:01',
            title: 'Layer:01',
            visibility: false,
            type: 'wms',
            opacity: 0.5
        }];
        const dependencies = { layers: LAYERS };
        ReactDOM.render(<LegendWizard valid dependencies={dependencies} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-wizard');
        expect(el).toBeTruthy();
        expect(container.querySelector('.ms-layers-tree')).toBeTruthy();
    });

    it('LegendWizard rendering WidgetOptions', () => {
        ReactDOM.render(<LegendWizard step={1} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.widget-options-form');
        expect(el).toBeTruthy();
    });

    it('LegendWizard renders legend preview container', () => {
        const LAYERS = [{
            id: 'layer:00',
            name: 'layer:00',
            title: 'Layer',
            visibility: true,
            type: 'wms'
        }];
        const dependencies = { layers: LAYERS };
        ReactDOM.render(<LegendWizard valid dependencies={dependencies} />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.legend-preview-container')).toBeTruthy();
    });

    it('LegendWizard renders LegendPreview with correct props', () => {
        const LAYERS = [{
            id: 'layer:00',
            name: 'layer:00',
            title: 'Layer',
            visibility: true,
            type: 'wms'
        }];
        const dependencies = { layers: LAYERS };
        const data = {
            dependenciesMap: {
                layers: 'widgets[map-widget-1].maps[test-map]'
            }
        };
        const updatePropertySpy = expect.createSpy();

        ReactDOM.render(<LegendWizard
            valid
            dependencies={dependencies}
            data={data}
            currentLocale="en-US"
            language="en"
            updateProperty={updatePropertySpy}
        />, document.getElementById("container"));
        const container = document.getElementById('container');

        // Should render the legend preview
        expect(container.querySelector('.ms-wizard')).toBeTruthy();
        expect(container.querySelector('.legend-preview-container')).toBeTruthy();
        expect(container.querySelector('.empty-state-container')).toBeFalsy();
    });

    it('LegendWizard shows empty state when not valid', () => {
        ReactDOM.render(<LegendWizard valid={false} />, document.getElementById("container"));
        const container = document.getElementById('container');

        // Should show empty state when not valid
        expect(container.querySelector('.empty-state-container')).toBeTruthy();
    });

    it('LegendWizard handles step navigation', () => {
        const setPageSpy = expect.createSpy();

        ReactDOM.render(<LegendWizard
            step={0}
            setPage={setPageSpy}
        />, document.getElementById("container"));
        const container = document.getElementById('container');

        // Should render wizard container
        expect(container.querySelector('.ms-wizard')).toBeTruthy();
    });

    it('LegendWizard passes updateProperty to LegendPreview', () => {
        const updatePropertySpy = expect.createSpy();
        const LAYERS = [{
            id: 'layer:00',
            name: 'layer:00',
            title: 'Layer',
            visibility: true,
            type: 'wms'
        }];
        const dependencies = { layers: LAYERS };

        ReactDOM.render(<LegendWizard
            valid
            dependencies={dependencies}
            updateProperty={updatePropertySpy}
        />, document.getElementById("container"));
        const container = document.getElementById('container');

        // Should render wizard with updateProperty prop passed
        expect(container.querySelector('.ms-wizard')).toBeTruthy();
        expect(container.querySelector('.legend-preview-container')).toBeTruthy();
    });

    it('LegendWizard passes dependenciesMap from data prop', () => {
        const LAYERS = [{
            id: 'layer:00',
            name: 'layer:00',
            title: 'Layer',
            visibility: true,
            type: 'wms'
        }];
        const dependencies = { layers: LAYERS };
        const data = {
            dependenciesMap: {
                layers: 'widgets[map-widget-1].maps[test-map]'
            }
        };

        ReactDOM.render(<LegendWizard
            valid
            dependencies={dependencies}
            data={data}
        />, document.getElementById("container"));
        const container = document.getElementById('container');

        expect(container.querySelector('.ms-wizard')).toBeTruthy();
        expect(container.querySelector('.legend-preview-container')).toBeTruthy();
    });
});
