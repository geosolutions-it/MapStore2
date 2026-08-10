/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import FilterNodeTool from '../FilterNodeTool';
import ReactDOM from 'react-dom';
import expect from 'expect';
import * as TestUtils from 'react-dom/test-utils';
import { layerFilter, emptyLayerFilter }  from '../../../../test-resources/widgets/dependenciesToFiltersData';

const TestItemComponent = ({ glyph, onClick, tooltipId, tooltipParams }) => (
    <button
        className={glyph}
        data-tooltip-id={tooltipId}
        data-tooltip-widgets={tooltipParams?.widgets}
        onClick={() => onClick()}
    ></button>
);

describe('FilterNodeTool', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('render component', () => {
        ReactDOM.render(<FilterNodeTool node={layerFilter} itemComponent={TestItemComponent} />, document.getElementById("container"));
        const fNode = document.querySelector('.filter');
        expect(fNode).toBeTruthy();
        expect(fNode.getAttribute('data-tooltip-id')).toBe('toc.filterIconEnabled');
    });

    it('test cannot render component', () => {
        ReactDOM.render(<FilterNodeTool  node={emptyLayerFilter} itemComponent={TestItemComponent} />,
            document.getElementById("container"));
        const fNode = document.querySelector('.filter');
        expect(fNode).toBeFalsy();
    });

    it('test click handler', () => {
        const actions = {
            onChange: () => {}
        };
        const propertiesChangeHandlerSpy = expect.spyOn(actions, 'onChange');
        ReactDOM.render(
            <FilterNodeTool node={layerFilter} onChange={actions.onChange} itemComponent={TestItemComponent} />,
            document.getElementById("container"));
        const fNode = document.querySelector('.filter');
        TestUtils.Simulate.click(fNode);
        expect(propertiesChangeHandlerSpy).toHaveBeenCalled();
    });

    it('render widget only filter', () => {
        const node = {
            layerFilter: {
                filterFields: [],
                spatialField: {},
                crossLayerFilter: {},
                disabled: false,
                filters: [{ id: 'f1', appliedFromWidget: 'widget1' }]
            }
        };
        ReactDOM.render(<FilterNodeTool node={node} itemComponent={TestItemComponent} />, document.getElementById("container"));
        expect(document.querySelector('.filter')).toBeFalsy();
        const fNode = document.querySelector('.filter-widget');
        expect(fNode).toBeTruthy();
        expect(fNode.getAttribute('data-tooltip-id')).toBe('toc.filterWidgetIconEnabled');
    });

    it('render multiple widgets filtering the same layer (widget-only)', () => {
        const node = {
            layerFilter: {
                filterFields: [],
                spatialField: {},
                crossLayerFilter: {},
                disabled: false,
                filters: [
                    { id: 'f1', appliedFromWidget: 'widget1' },
                    { id: 'f2', appliedFromWidget: 'widget2' }
                ]
            }
        };
        ReactDOM.render(<FilterNodeTool node={node} itemComponent={TestItemComponent} />, document.getElementById("container"));
        const fNode = document.querySelector('.filter-widget');
        expect(fNode).toBeTruthy();
        expect(fNode.getAttribute('data-tooltip-id')).toBe('toc.filterWidgetIconEnabled');
    });

    it('render global filter when both global and widget filters are present', () => {
        const node = {
            layerFilter: {
                ...layerFilter.layerFilter,
                filters: [{ id: 'f1', appliedFromWidget: 'widget1' }]
            }
        };
        ReactDOM.render(<FilterNodeTool node={node} itemComponent={TestItemComponent} />, document.getElementById("container"));
        expect(document.querySelector('.filter-widget')).toBeFalsy();
        const fNode = document.querySelector('.filter');
        expect(fNode).toBeTruthy();
        expect(fNode.getAttribute('data-tooltip-id')).toBe('toc.filterAndWidgetIconEnabled');
    });

});

