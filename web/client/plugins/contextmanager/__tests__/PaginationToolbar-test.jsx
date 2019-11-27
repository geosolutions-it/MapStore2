/**
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import expect from 'expect';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';
import {Provider} from 'react-redux';
import configureMockStore from 'redux-mock-store';

import PaginationToolbar from '../PaginationToolbar';
import {SEARCH_CONTEXTS} from '../../../actions/contextmanager';

const mockStore = configureMockStore();

describe("contextmanager PaginationToolbar component", () => {
    let store;
    beforeEach((done) => {
        store = mockStore();
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test pagination page change', () => {
        const resources = (new Array(12)).map((_, i) => ({
            canCopy: true,
            canEdit: true,
            canDelete: true,
            creation: "2019-11-11 15:27:17.974",
            description: "desc",
            id: i,
            name: "Name" + i,
            thumbnail: "NODATA"
        }));

        store = mockStore({
            contextmanager: {
                loading: false,
                results: resources,
                searchOptions: {
                    params: {
                        start: 0,
                        limit: 12
                    }
                },
                searchText: "",
                success: true,
                totalCount: 16
            }
        });

        const comp = ReactDOM.render(
            <Provider store={store}>
                <PaginationToolbar/>
            </Provider>, document.getElementById("container"));
        expect(comp).toExist();

        const container = document.getElementById('container');
        const pagination = container.getElementsByClassName('pagination');
        expect(pagination).toExist();
        expect(pagination.length).toBe(1);
        const buttons = pagination[0].getElementsByTagName('a');
        expect(buttons.length).toBe(6); // start prev firstpage secondpage next end

        TestUtils.Simulate.click(buttons[3]);

        const actions = store.getActions();
        expect(actions.length).toBe(1);
        expect(actions[0].type).toBe(SEARCH_CONTEXTS);
        expect(actions[0].options).toEqual({
            params: {
                start: 12,
                limit: 12
            }
        });
    });
});
