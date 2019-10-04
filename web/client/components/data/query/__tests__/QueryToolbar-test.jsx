/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');

const expect = require('expect');
const QueryToolbar = require('../QueryToolbar');
describe('QueryToolbar component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('QueryToolbar rendering with defaults', () => {
        ReactDOM.render(<QueryToolbar />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.query-toolbar');
        expect(el).toExist();
    });
    it('QueryToolbar check empty filter warning', () => {
        ReactDOM.render(<QueryToolbar emptyFilterWarning allowEmptyFilter spatialField={{}} crossLayerFilter={{attribute: "ATTR", operation: undefined}}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('#query-toolbar-query.showWarning');
        expect(el).toExist();
        ReactDOM.render(<QueryToolbar emptyFilterWarning allowEmptyFilter spatialField={{}} crossLayerFilter={{attribute: "ATTR", operation: "INTERSECT"}}/>, document.getElementById("container"));
        expect(container.querySelector('#query-toolbar-query.showWarning')).toNotExist();
        expect(container.querySelector('#query-toolbar-query')).toExist();
        ReactDOM.render(<QueryToolbar emptyFilterWarning allowEmptyFilter spatialField={{geometry: {}}} crossLayerFilter={{attribute: "ATTR", operation: undefined}}/>, document.getElementById("container"));
        expect(container.querySelector('#query-toolbar-query.showWarning')).toNotExist();
    });

    describe('advancedToolbar', () => {
        const VALID_FILTERS = [
            // spatial only
            {
                groupFields: [],
                spatialPanelExpanded: true,
                spatialField: {
                    attribute: "the_geom",
                    geometry: {
                        "some": "geometry"
                    }
                }
            },
            // spatial different
            {
                groupFields: [],
                spatialPanelExpanded: true,
                spatialField: {
                    attribute: "the_geom",
                    geometry: {
                        "some": "OTHER_geometry"
                    }
                }
            }];
        const checkButtonsEnabledCondition = (container) => (apply, save, discard, reset) => {
            return expect(!container.querySelector("button#query-toolbar-query").disabled).toBe(!!apply, `expected apply to be ${apply ? 'enabled' : 'disabled'}`)
                && expect(!container.querySelector("button#query-toolbar-save").disabled).toBe(!!save, `expected save to be ${save ? 'enabled' : 'disabled'}`)
                && expect(!container.querySelector("button#query-toolbar-discard").disabled).toBe(!!discard, `expected discard to be ${discard ? 'enabled' : 'disabled'}`)
                && expect(!container.querySelector("button#reset").disabled).toBe(!!reset, `expected reset to be ${reset ? 'enabled' : 'disabled'}`);
        };
        it('defaults', () => {
            ReactDOM.render(<QueryToolbar />, document.getElementById("container"));
            const container = document.getElementById('container');
            expect(container.querySelectorAll('button').length).toBe(2);
            ReactDOM.render(<QueryToolbar advancedToolbar />, document.getElementById("container"));
            const buttons = [...container.querySelectorAll('button')];
            expect(buttons.length).toBe(4);
            expect(buttons.filter(({ disabled }) => disabled).length).toBe(4);
        });
        it('apply button is enabled when valid', () => {
            const container = document.getElementById('container');
            ReactDOM.render(<QueryToolbar advancedToolbar {...VALID_FILTERS[0]} />, document.getElementById("container"));
            checkButtonsEnabledCondition(container)(true, false, false, false);
        });
        it('save and reset enabled when the current filter is applied', () => {
            const container = document.getElementById('container');
            ReactDOM.render(<QueryToolbar advancedToolbar {...VALID_FILTERS[0]} appliedFilter={VALID_FILTERS[0]} />, document.getElementById("container"));
            const buttons = [...container.querySelectorAll('button')];
            expect(buttons.length).toBe(4);
            checkButtonsEnabledCondition(container)(false, true, false, true);
        });
        it('apply and reset enabled when the current filter is different from applied', () => {
            const container = document.getElementById('container');
            ReactDOM.render(<QueryToolbar advancedToolbar {...VALID_FILTERS[1]} appliedFilter={VALID_FILTERS[0]} />, document.getElementById("container"));
            const buttons = [...container.querySelectorAll('button')];
            expect(buttons.length).toBe(4);
            checkButtonsEnabledCondition(container)(true, false, false, true);
        });
        it('restore enabled when applied a filter different from saved one, not yet saved', () => {
            const container = document.getElementById('container');
            ReactDOM.render(<QueryToolbar advancedToolbar
                {...VALID_FILTERS[0]}
                appliedFilter={VALID_FILTERS[0]}
                storedFilter={VALID_FILTERS[1]}
            />, document.getElementById("container"));
            const buttons = [...container.querySelectorAll('button')];
            expect(buttons.length).toBe(4);
            checkButtonsEnabledCondition(container)(false, true, true, true);
        });
        it('saved filter with no changes has only reset enabled', () => {
            const container = document.getElementById('container');
            ReactDOM.render(<QueryToolbar advancedToolbar
                {...VALID_FILTERS[0]}
                appliedFilter={VALID_FILTERS[0]}
                storedFilter={VALID_FILTERS[0]}
            />, document.getElementById("container"));
            const buttons = [...container.querySelectorAll('button')];
            expect(buttons.length).toBe(4);
            checkButtonsEnabledCondition(container)(false, false, false, true);
        });
    });
});
