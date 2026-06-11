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

import FilterWidgetTOCButton from '../FilterWidgetTOCButton';
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

describe('FilterWidgetTOCButton plugin', () => {
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
        ReactDOM.render(
            <Provider store={store}>
                <FilterWidgetTOCButton
                    status={STATUS_TYPES.DESELECT}
                    statusTypes={STATUS_TYPES}
                    itemComponent={ItemComponent}
                />
            </Provider>,
            document.getElementById('container')
        );
        expect(document.querySelectorAll('.ms-test-toc-btn').length).toBe(0);
    });

    it('renders nothing when no filterable map layers exist', () => {
        const { store } = makeStore({
            controls: { widgetBuilder: { available: true } },
            layers: { flat: [{ id: 'l1', type: 'vector' }] }
        });
        ReactDOM.render(
            <Provider store={store}>
                <FilterWidgetTOCButton
                    status={STATUS_TYPES.DESELECT}
                    statusTypes={STATUS_TYPES}
                    itemComponent={ItemComponent}
                />
            </Provider>,
            document.getElementById('container')
        );
        expect(document.querySelectorAll('.ms-test-toc-btn').length).toBe(0);
    });

    it('renders nothing when a layer is selected (status=LAYER)', () => {
        const { store } = makeStore();
        ReactDOM.render(
            <Provider store={store}>
                <FilterWidgetTOCButton
                    status={STATUS_TYPES.LAYER}
                    statusTypes={STATUS_TYPES}
                    itemComponent={ItemComponent}
                />
            </Provider>,
            document.getElementById('container')
        );
        expect(document.querySelectorAll('.ms-test-toc-btn').length).toBe(0);
    });

    it('renders the button when DESELECT and at least one filterable layer is present', () => {
        const { store } = makeStore();
        ReactDOM.render(
            <Provider store={store}>
                <FilterWidgetTOCButton
                    status={STATUS_TYPES.DESELECT}
                    statusTypes={STATUS_TYPES}
                    itemComponent={ItemComponent}
                />
            </Provider>,
            document.getElementById('container')
        );
        const btns = document.querySelectorAll('.ms-test-toc-btn');
        expect(btns.length).toBe(1);
        expect(btns[0].getAttribute('data-glyph')).toBe('widgets');
        expect(btns[0].getAttribute('data-tooltip')).toBe('toc.createWidgetForMap');
    });

    it('clicking the button dispatches createWidget without a preset widgetType (opens the type selector) and flags map-layers-only', () => {
        const { store, dispatched } = makeStore();
        ReactDOM.render(
            <Provider store={store}>
                <FilterWidgetTOCButton
                    status={STATUS_TYPES.DESELECT}
                    statusTypes={STATUS_TYPES}
                    itemComponent={ItemComponent}
                />
            </Provider>,
            document.getElementById('container')
        );
        const btn = document.querySelector('.ms-test-toc-btn');
        Simulate.click(btn);
        expect(dispatched.length).toBe(1);
        expect(dispatched[0].type).toBe(NEW);
        // no preset type: the "Select the widget type" panel is shown first
        expect(dispatched[0].widget.widgetType).toBe(undefined);
        // every builder's layer step lists only the current map layers
        expect(dispatched[0].widget.globalWidgetMode).toBe(true);
        expect(dispatched[0].widget.builderEntry).toBe(undefined);
    });

    it('respects activateFilterWidgetButton config flag (false hides the button)', () => {
        const { store } = makeStore();
        ReactDOM.render(
            <Provider store={store}>
                <FilterWidgetTOCButton
                    status={STATUS_TYPES.DESELECT}
                    statusTypes={STATUS_TYPES}
                    itemComponent={ItemComponent}
                    config={{ activateFilterWidgetButton: false }}
                />
            </Provider>,
            document.getElementById('container')
        );
        expect(document.querySelectorAll('.ms-test-toc-btn').length).toBe(0);
    });
});
