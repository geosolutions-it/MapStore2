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
        expect(container.querySelector('.legend-widget')).toBeTruthy();
    });

    it('LegendView rendering with layers', () => {
        const LAYERS = [{
            name: 'layer:00',
            title: 'Layer',
            visibility: true,
            type: 'wms'
        },
        {
            name: 'layer:01',
            title: 'Layer:01',
            visibility: false,
            type: 'wms',
            opacity: 0.5,
            expanded: true
        }
        ];
        ReactDOM.render(<LegendView layers={LAYERS} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const legendTOC = container.querySelectorAll('.widget-legend-toc');
        expect(legendTOC).toBeTruthy();
        expect(legendTOC.length).toBe(2);
        // One layer is visible
        const visibility = container.querySelectorAll('.visibility-check.checked');
        expect(visibility.length).toBe(1);
        const legendExpanded = container.querySelectorAll('.toc-legend-icon.expanded');
        expect(legendExpanded.length).toBe(1);
    });

    it('LegendView hide visibility icon', () => {
        const LAYERS = [{
            name: 'layer:00',
            title: 'Layer',
            visibility: true,
            type: 'wms'
        },
        {
            name: 'layer:01',
            title: 'Layer:01',
            visibility: false,
            type: 'wms',
            opacity: 0.5
        }
        ];
        ReactDOM.render(<LegendView layers={LAYERS} disableVisibility />, document.getElementById("container"));
        const container = document.getElementById('container');
        const legendTOC = container.querySelectorAll('.widget-legend-toc');
        expect(legendTOC).toBeTruthy();
        // One layer is visible
        const visibility = container.querySelector('.visibility-check');
        expect(visibility).toBeFalsy();
    });

    it('LegendView with legendExpanded flag', () => {
        const LAYERS = [{
            name: 'layer:00',
            title: 'Layer',
            visibility: true,
            type: 'wms',
            expanded: true
        },
        {
            name: 'layer:01',
            title: 'Layer:01',
            visibility: false,
            type: 'wms',
            opacity: 0.5
        }
        ];
        ReactDOM.render(<LegendView layers={LAYERS} legendExpanded />, document.getElementById("container"));
        const container = document.getElementById('container');
        const legendTOC = container.querySelectorAll('.widget-legend-toc');
        expect(legendTOC).toBeTruthy();
        // Hide collapse icon
        const collapseIcon = container.querySelector('.toc-legend-icon');
        expect(collapseIcon).toBeFalsy();
        // Show legend expanded
        const legendWMS = container.querySelector('.expanded-legend-view');
        expect(legendWMS).toBeTruthy();
    });

    it('LegendView with opacity slider', () => {
        const LAYERS = [{
            name: 'layer:00',
            title: 'Layer',
            visibility: true,
            type: 'wms',
            expanded: true
        },
        {
            name: 'layer:01',
            title: 'Layer:01',
            visibility: false,
            type: 'wms',
            opacity: 0.5
        }
        ];
        ReactDOM.render(<LegendView layers={LAYERS} />, document.getElementById("container"));
        let container = document.getElementById('container');
        let legendTOC = container.querySelectorAll('.widget-legend-toc');
        expect(legendTOC).toBeTruthy();
        // Show opacity slider
        let opacitySlider = container.querySelector('.mapstore-slider');
        expect(opacitySlider).toBeTruthy();

        // Hide Slider
        ReactDOM.render(<LegendView layers={LAYERS} disableOpacitySlider />, document.getElementById("container"));
        container = document.getElementById('container');
        legendTOC = container.querySelectorAll('.widget-legend-toc');
        expect(legendTOC).toBeTruthy();
        // Show opacity slider
        opacitySlider = container.querySelector('.mapstore-slider');
        expect(opacitySlider).toBeFalsy();

    });

    it('LegendView rendering with title as object and currentLocale', () => {
        const LAYERS = [{
            name: 'layer:00',
            title: {'en-EN': 'test1',
                'default': 'default'},
            visibility: true,
            type: 'wms'
        },
        {
            name: 'layer:01',
            title: {'en-EN': 'test1',
                'default': 'default'},
            visibility: true,
            type: 'wms',
            opacity: 0.5
        }
        ];
        const currentLocale = 'en-EN';

        ReactDOM.render(<LegendView layers={LAYERS} currentLocale={currentLocale} />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.toc-title').textContent).toBe('test1');
    });

    it('LegendView rendering with title as object and missing currentLocale', () => {
        const LAYERS = [{
            name: 'layer:00',
            title: {'en-EN': 'test1',
                'default': 'default'},
            visibility: true,
            type: 'wms'
        },
        {
            name: 'layer:01',
            title: {'en-EN': 'test1',
                'default': 'default'},
            visibility: false,
            type: 'wms',
            opacity: 0.5
        }
        ];
        const currentLocale = undefined;

        ReactDOM.render(<LegendView layers={LAYERS} currentLocale={currentLocale}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.toc-title').textContent).toBe('default');
    });

    it('LegendView onUpdateProperty', () => {
        const actions = { updateProperty: () => {} };
        const spy = expect.spyOn(actions, 'updateProperty');
        const LAYERS = [{
            id: 'L1',
            name: 'layer:00',
            title: 'Layer',
            visibility: true,
            type: 'wms',
            expanded: true
        },
        {
            name: 'layer:01',
            title: 'Layer:01',
            visibility: false,
            type: 'wms',
            opacity: 0.5
        }];
        ReactDOM.render(<LegendView layers={LAYERS} allLayers={LAYERS}
            updateProperty={actions.updateProperty} dependencyMapPath={"widgets[1].maps[1].dependenciesMap"}/>, document.getElementById("container"));
        let container = document.getElementById('container');
        let legendTOC = container.querySelectorAll('.widget-legend-toc');
        expect(legendTOC).toBeTruthy();
        // On change visibility
        let visibility = container.querySelector('.visibility-check.checked');
        expect(visibility).toBeTruthy();
        TestUtils.Simulate.click(visibility);
        expect(spy).toHaveBeenCalled();
        expect(spy.calls[0].arguments.length).toBe(3);
        expect(spy.calls[0].arguments[0]).toBe('visibility');
        expect(spy.calls[0].arguments[1]).toBeFalsy();
        expect(spy.calls[0].arguments[2]).toBe('L1');

        // On change layer expand/collapse
        let collapseIcon = container.querySelector('.toc-legend-icon.expanded');
        expect(collapseIcon).toBeTruthy();
        TestUtils.Simulate.click(collapseIcon);
        expect(spy).toHaveBeenCalled();
        expect(spy.calls[1].arguments.length).toBe(3);
        expect(spy.calls[1].arguments[0]).toBe('expanded');
        expect(spy.calls[1].arguments[1]).toBeFalsy();
        expect(spy.calls[1].arguments[2]).toBe('L1');
    });
});
