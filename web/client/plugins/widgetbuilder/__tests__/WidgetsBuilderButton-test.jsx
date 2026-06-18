/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Simulate } from 'react-dom/test-utils';

import WidgetsBuilderButton from '../WidgetBuilderButton';
import { NEW } from '../../../actions/widgets';

const STATUS_TYPES = {
    DESELECT: 'DESELECT',
    LAYER: 'LAYER',
    GROUP: 'GROUP',
    LAYERS: 'LAYERS',
    GROUPS: 'GROUPS',
    BOTH: 'BOTH'
};

const makeStore = (overrides = {}) => {
    const dispatched = [];
    const state = {
        controls: { widgetBuilder: { available: true } },
        layers: { flat: [{ id: 'l1', name: 'a', type: 'wms' }] },
        ...overrides
    };
    return {
        store: {
            subscribe: () => () => {},
            getState: () => state,
            dispatch: (a) => dispatched.push(a)
        },
        dispatched
    };
};

const ItemComponent = ({ glyph, tooltipId, onClick }) => (
    <button
        className="ms-test-toc-btn"
        data-glyph={glyph}
        data-tooltip={tooltipId}
        onClick={onClick}
    >x</button>
);

const render = (props, store) => ReactDOM.render(
    <Provider store={store}>
        <WidgetsBuilderButton
            statusTypes={STATUS_TYPES}
            itemComponent={ItemComponent}
            {...props}
        />
    </Provider>,
    document.getElementById('container')
);

describe('WidgetsBuilderButton plugin', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('renders nothing when widgetBuilder is not available', () => {
        const { store } = makeStore({ controls: {} });
        render({ status: STATUS_TYPES.DESELECT }, store);
        expect(document.querySelectorAll('.ms-test-toc-btn').length).toBe(0);
    });

    // --- per-layer widget branch (status = LAYER) ---

    it('renders the per-layer button when a supported layer is selected (status=LAYER)', () => {
        const { store } = makeStore();
        render({
            status: STATUS_TYPES.LAYER,
            selectedNodes: [{ node: { id: 'l1', search: {} } }]
        }, store);
        const btns = document.querySelectorAll('.ms-test-toc-btn');
        expect(btns.length).toBe(1);
        expect(btns[0].getAttribute('data-glyph')).toBe('widgets');
        expect(btns[0].getAttribute('data-tooltip')).toBe('toc.createWidget');
    });

    it('renders nothing when the selected layer is not widget-supported', () => {
        const { store } = makeStore();
        render({
            status: STATUS_TYPES.LAYER,
            selectedNodes: [{ node: { id: 'l1', search: 'vector' } }]
        }, store);
        expect(document.querySelectorAll('.ms-test-toc-btn').length).toBe(0);
    });

    it('clicking the per-layer button dispatches createWidget connected to the map by default', () => {
        const { store, dispatched } = makeStore();
        render({
            status: STATUS_TYPES.LAYER,
            selectedNodes: [{ node: { id: 'l1', search: {} } }]
        }, store);
        Simulate.click(document.querySelector('.ms-test-toc-btn'));
        expect(dispatched.length).toBe(1);
        expect(dispatched[0].type).toBe(NEW);
        // no payload: widget is connected to the selected layer/map with defaults
        expect(dispatched[0].widget).toBeFalsy();
    });

    it('clicking the per-layer button for a layer in error creates a widget not synced to the map', () => {
        const { store, dispatched } = makeStore();
        render({
            status: STATUS_TYPES.LAYER,
            selectedNodes: [{ node: { id: 'l1', search: {}, error: true } }]
        }, store);
        Simulate.click(document.querySelector('.ms-test-toc-btn'));
        expect(dispatched.length).toBe(1);
        expect(dispatched[0].widget.mapSync).toBeFalsy();
    });

    it('renders nothing when no filterable map layers exist', () => {
        const { store } = makeStore({
            controls: { widgetBuilder: { available: true } },
            layers: { flat: [{ id: 'l1', type: 'vector' }] }
        });
        render({ status: STATUS_TYPES.DESELECT }, store);
        expect(document.querySelectorAll('.ms-test-toc-btn').length).toBe(0);
    });

    it('renders the map-level button when DESELECT and at least one filterable layer is present', () => {
        const { store } = makeStore();
        render({ status: STATUS_TYPES.DESELECT }, store);
        const btns = document.querySelectorAll('.ms-test-toc-btn');
        expect(btns.length).toBe(1);
        expect(btns[0].getAttribute('data-glyph')).toBe('widgets');
        expect(btns[0].getAttribute('data-tooltip')).toBe('toc.createWidgetForMap');
    });

    it('renders the map-level button when a group is selected (status=GROUP)', () => {
        const { store } = makeStore();
        render({ status: STATUS_TYPES.GROUP }, store);
        expect(document.querySelectorAll('.ms-test-toc-btn').length).toBe(1);
    });

    it('clicking the map-level button dispatches createWidget without a preset widgetType and flags map-layers-only', () => {
        const { store, dispatched } = makeStore();
        render({ status: STATUS_TYPES.DESELECT }, store);
        Simulate.click(document.querySelector('.ms-test-toc-btn'));
        expect(dispatched.length).toBe(1);
        expect(dispatched[0].type).toBe(NEW);
        // no preset type: the "Select the widget type" panel is shown first
        expect(dispatched[0].widget.widgetType).toBeFalsy();
        // every builder's layer step lists only the current map layers
        expect(dispatched[0].widget.globalWidgetMode).toBeTruthy();
        expect(dispatched[0].widget.builderEntry).toBeFalsy();
    });
});
