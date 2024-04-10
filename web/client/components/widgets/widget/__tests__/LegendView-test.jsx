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

import LegendView from '../LegendView';
import TestUtils from "react-dom/test-utils";

describe('LegendView component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('LegendView rendering with defaults', () => {
        ReactDOM.render(<LegendView />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.ms-layers-tree')).toBeTruthy();
    });

    it('LegendView rendering with layers', () => {
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
            opacity: 0.5,
            expanded: true
        }
        ];
        ReactDOM.render(<LegendView map={{ layers: LAYERS, groups: [] }} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const legendTOC = container.querySelector('.ms-layers-tree');
        expect(legendTOC).toBeTruthy();
        // One layer is visible
        const visibility = legendTOC.querySelectorAll('.ms-visibility-check .glyphicon-checkbox-on');
        expect(visibility.length).toBe(1);
        const legendExpanded = container.querySelectorAll('.ms-node-expand .glyphicon-bottom');
        expect(legendExpanded.length).toBe(1);
    });

    it('LegendView hide visibility icon', () => {
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
        }
        ];
        ReactDOM.render(<LegendView map={{ layers: LAYERS, groups: [] }} disableVisibility />, document.getElementById("container"));
        const container = document.getElementById('container');
        const legendTOC = container.querySelector('.ms-layers-tree');
        expect(legendTOC).toBeTruthy();
        // One layer is visible
        const visibility = container.querySelector('.ms-visibility-check');
        expect(visibility).toBeFalsy();
    });

    it('LegendView with legendExpanded flag', () => {
        const LAYERS = [{
            id: 'layer:00',
            name: 'layer:00',
            title: 'Layer',
            visibility: true,
            type: 'wms',
            expanded: true
        },
        {
            id: 'layer:01',
            name: 'layer:01',
            title: 'Layer:01',
            visibility: false,
            type: 'wms',
            opacity: 0.5
        }
        ];
        ReactDOM.render(<LegendView map={{ layers: LAYERS, groups: [] }} legendExpanded />, document.getElementById("container"));
        const container = document.getElementById('container');
        const legendTOC = container.querySelector('.ms-layers-tree');
        expect(legendTOC).toBeTruthy();
        // Hide collapse icon
        const collapseIcon = container.querySelector('.ms-node-expand');
        expect(collapseIcon).toBeFalsy();
        // Show legend expanded
        const legendWMS = container.querySelector('.ms-node-layer ul');
        expect(legendWMS).toBeTruthy();
    });

    it('LegendView with opacity slider', () => {
        const LAYERS = [{
            id: 'layer:00',
            name: 'layer:00',
            title: 'Layer',
            visibility: true,
            type: 'wms',
            expanded: true
        },
        {
            id: 'layer:01',
            name: 'layer:01',
            title: 'Layer:01',
            visibility: false,
            type: 'wms',
            opacity: 0.5
        }
        ];
        ReactDOM.render(<LegendView map={{ layers: LAYERS, groups: [] }} />, document.getElementById("container"));
        let container = document.getElementById('container');
        let legendTOC = container.querySelector('.ms-layers-tree');
        expect(legendTOC).toBeTruthy();
        // Show opacity slider
        let opacitySlider = container.querySelector('.mapstore-slider');
        expect(opacitySlider).toBeTruthy();

        // Hide Slider
        ReactDOM.render(<LegendView map={{ layers: LAYERS, groups: [] }} disableOpacitySlider />, document.getElementById("container"));
        container = document.getElementById('container');
        legendTOC = container.querySelector('.ms-layers-tree');
        expect(legendTOC).toBeTruthy();
        // Show opacity slider
        opacitySlider = container.querySelector('.mapstore-slider');
        expect(opacitySlider).toBeFalsy();

    });

    it('LegendView rendering with title as object and currentLocale', () => {
        const LAYERS = [{
            id: 'layer:00',
            name: 'layer:00',
            title: {'en-EN': 'test1',
                'default': 'default'},
            visibility: true,
            type: 'wms'
        },
        {
            id: 'layer:01',
            name: 'layer:01',
            title: {'en-EN': 'test1',
                'default': 'default'},
            visibility: true,
            type: 'wms',
            opacity: 0.5
        }
        ];
        const currentLocale = 'en-EN';

        ReactDOM.render(<LegendView map={{ layers: LAYERS, groups: [] }} currentLocale={currentLocale} />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.ms-node-layer .ms-node-title').textContent).toBe('test1');
    });

    it('LegendView rendering with title as object and missing currentLocale', () => {
        const LAYERS = [{
            id: 'layer:00',
            name: 'layer:00',
            title: {'en-EN': 'test1',
                'default': 'default'},
            visibility: true,
            type: 'wms'
        },
        {
            id: 'layer:01',
            name: 'layer:01',
            title: {'en-EN': 'test1',
                'default': 'default'},
            visibility: false,
            type: 'wms',
            opacity: 0.5
        }
        ];
        const currentLocale = undefined;

        ReactDOM.render(<LegendView map={{ layers: LAYERS, groups: [] }} currentLocale={currentLocale}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.ms-node-layer .ms-node-title').textContent).toBe('default');
    });

    it('LegendView onUpdateProperty', () => {
        const actions = { updateProperty: () => {} };
        const spy = expect.spyOn(actions, 'updateProperty');
        const LAYERS = [
            {
                id: 'layer:01',
                name: 'layer:01',
                title: 'Layer:01',
                visibility: false,
                type: 'wms',
                opacity: 0.5
            },
            {
                id: 'layer:00',
                name: 'layer:00',
                title: 'Layer',
                visibility: true,
                type: 'wms',
                expanded: true
            }
        ];
        TestUtils.act(() => {
            ReactDOM.render(<LegendView
                map={{ layers: LAYERS, groups: [] }}
                updateProperty={actions.updateProperty}
            />,
            document.getElementById("container"));
        });
        let container = document.getElementById('container');
        let legendTOC = container.querySelector('.ms-layers-tree');
        expect(legendTOC).toBeTruthy();
        // On change visibility
        let visibility = container.querySelector('.ms-node-layer .ms-visibility-check');
        expect(visibility).toBeTruthy();
        TestUtils.Simulate.click(visibility);
        expect(spy).toHaveBeenCalled();
        expect(spy.calls[0].arguments.length).toBe(2);
        expect(spy.calls[0].arguments[0]).toBe('map');
        // layers are in reverse order in UI
        expect(spy.calls[0].arguments[1].layers[1].id).toBe('layer:00');
        expect(spy.calls[0].arguments[1].layers[1].visibility).toBe(false);

        // On change layer expand/collapse
        let collapseIcon = container.querySelector('.ms-node-layer .ms-node-expand');
        expect(collapseIcon).toBeTruthy();
        TestUtils.Simulate.click(collapseIcon);
        expect(spy).toHaveBeenCalled();
        expect(spy.calls[1].arguments.length).toBe(2);
        expect(spy.calls[1].arguments[0]).toBe('map');
        // layers are in reverse order in UI
        expect(spy.calls[1].arguments[1].layers[1].id).toBe('layer:00');
        expect(spy.calls[1].arguments[1].layers[1].expanded).toBe(false);
    });
});
