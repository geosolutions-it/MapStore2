/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';

import ResourcesSearchPlugin from '../ResourcesSearch';
import { getPluginForTest } from '../../__tests__/pluginsTestUtils';
import { act, Simulate } from 'react-dom/test-utils';

const mockRouterReducer = (state = { location: {} }) => {
    return state;
};

describe('ResourcesSearch Plugin', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should render with default', () => {
        const { Plugin } = getPluginForTest(ResourcesSearchPlugin, {});
        ReactDOM.render(<Plugin />, document.getElementById("container"));
        const resourcesSearchNode = document.querySelector('.ms-resources-search');
        expect(resourcesSearchNode).toBeTruthy();
        const buttons = document.querySelectorAll('.square-button-md');
        expect(buttons.length).toBe(0);
    });
    it('should render with query', () => {
        const { Plugin, store } = getPluginForTest(ResourcesSearchPlugin, {
            router: {
                location: {
                    search: '?q=text'
                }
            }
        }, undefined, [], { router: mockRouterReducer });
        ReactDOM.render(<Plugin />, document.getElementById("container"));
        const resourcesSearchNode = document.querySelector('.ms-resources-search');
        expect(resourcesSearchNode).toBeTruthy();
        const button = document.querySelector('.square-button-md:has(.glyphicon-1-close)');
        expect(button).toBeTruthy();
        Simulate.click(button);
        expect(store.getState().resources.search.clear).toBe(true);
    });
    it('should render with custom item', () => {
        const { Plugin } = getPluginForTest(ResourcesSearchPlugin, {});
        function MyTool({ itemComponent }) {
            const ItemComponent = itemComponent;
            return <ItemComponent glyph="heart"/>;
        }
        ReactDOM.render(<Plugin items={[{ name: 'MyTool', Component: MyTool, target: 'toolbar' }]}/>, document.getElementById("container"));
        const resourcesSearchNode = document.querySelector('.ms-resources-search');
        expect(resourcesSearchNode).toBeTruthy();
        const button = document.querySelector('.square-button-md:has(.glyphicon-heart)');
        expect(button).toBeTruthy();
    });

    it('should render update resource state on input change', (done) => {
        const { Plugin, store } = getPluginForTest(ResourcesSearchPlugin, {});
        act(() => {
            ReactDOM.render(<Plugin debounceTime={0}/>, document.getElementById("container"));
        });
        const resourcesSearchNode = document.querySelector('.ms-resources-search');
        expect(resourcesSearchNode).toBeTruthy();
        const input = document.querySelector('input');
        expect(input).toBeTruthy();
        Simulate.change(input, { target: { value: 'Search' } });
        setTimeout(() => {
            expect(store.getState().resources.search.params).toEqual({ q: 'Search' });
            done();
        });
    });
});
