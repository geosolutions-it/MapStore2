/*
* Copyright 2020, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import expect from 'expect';

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';
import {Provider} from "react-redux";
import BookmarkSelect from '../BookmarkSelect';

describe("BookmarkList component", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test BookmarkSelect default', () => {
        const store = {dispatch: () => {}, subscribe: () => {}, getState: () => ({searchbookmarkconfig: {selected: {}}})};
        ReactDOM.render(<Provider store={store}><BookmarkSelect onPropertyChange={null} bookmarkConfig={null}/></Provider>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container).toExist();
        const select = container.querySelector(".search-select");
        expect(select).toExist();
        const labelValue = container.querySelector(".Select-value-label");
        expect(labelValue).toNotExist();
        const placeholder = container.querySelector(".Select-placeholder");
        expect(placeholder.innerText).toBe("search.b_placeholder");

    });
    it('test BookmarkSelect, onPropertyChange and zoomOnSelect', () => {
        const store = {dispatch: () => {}, subscribe: () => {}, getState: () => ({searchbookmarkconfig: {
            selected: {title: "Bookmark 1"},
            zoomOnSelect: true,
            bookmarkSearchConfig: {
                bookmarks: [{title: "Bookmark 1", options: {west: 1, east: 1, north: 1, south: 1}}, {title: "Bookmark 2"}]
            }}})};

        const spyOnchange = expect.spyOn(store, "dispatch");

        ReactDOM.render(
            <Provider store={store}>
                <BookmarkSelect/>,
            </Provider>,
            document.getElementById("container"));

        const cmp = document.getElementById('container');
        expect(cmp).toBeTruthy();

        const input = cmp.querySelector('input');
        expect(input).toBeTruthy();

        TestUtils.Simulate.change(input, { target: { value: 'Bookmark 1' } });
        TestUtils.Simulate.keyDown(input, {keyCode: 9, key: 'Tab' });

        let selectValue = cmp.querySelector('.Select-value-label');
        expect(selectValue.innerText).toBe("Bookmark 1");
        expect(spyOnchange).toHaveBeenCalled();
        expect(spyOnchange.calls[0].arguments[0].type).toBe("SET_SEARCH_BOOKMARK_CONFIG");
        expect(spyOnchange.calls[0].arguments[0].value).toBeTruthy();
        expect(spyOnchange.calls[0].arguments[0].value.title).toBe("Bookmark 1");

        expect(spyOnchange.calls[1].arguments[0].type).toBe("ZOOM_TO_EXTENT");
        expect(spyOnchange.calls[1].arguments[0].extent).toEqual([1, 1, 1, 1]);
        expect(spyOnchange.calls[1].arguments[0].crs).toBe("EPSG:4326");

        TestUtils.act(() => {
            TestUtils.Simulate.focus(input);
            TestUtils.Simulate.keyDown(input, { key: 'ArrowDown', keyCode: 40 });
        });
        const selectMenuOptionNodes = cmp.querySelectorAll('.Select-option');
        expect(selectMenuOptionNodes.length).toBe(2);

        TestUtils.Simulate.change(input, { target: { value: 'Bookmark 2' } });
        TestUtils.Simulate.keyDown(input, {keyCode: 9, key: 'Tab' });

        expect(spyOnchange).toHaveBeenCalled();
        expect(spyOnchange.calls[2].arguments[0].type).toBe("SET_SEARCH_BOOKMARK_CONFIG");
        expect(spyOnchange.calls[2].arguments[0].value).toBeTruthy();
        expect(spyOnchange.calls[2].arguments[0].value.title).toBe("Bookmark 2");

    });

    it('test BookmarkSelect, onLayerVisibilityLoad', () => {
        const store = {dispatch: () => {}, subscribe: () => {}, getState: () => ({searchbookmarkconfig: {
            selected: {title: "Bookmark 1"},
            zoomOnSelect: true,
            bookmarkSearchConfig: {
                bookmarks: [{title: "Bookmark 1", layerVisibilityReload: true, options: {west: 1, east: 1, north: 1, south: 1}}, {title: "Bookmark 2"}]
            }}})};

        const spyOnchange = expect.spyOn(store, "dispatch");

        ReactDOM.render(
            <Provider store={store}>
                <BookmarkSelect mapInitial={{map: {layer: "Test"}}}/>,
            </Provider>,
            document.getElementById("container"));

        const cmp = document.getElementById('container');
        expect(cmp).toBeTruthy();

        const input = cmp.querySelector('input');
        expect(input).toBeTruthy();

        TestUtils.Simulate.change(input, { target: { value: 'Bookmark 1' } });
        TestUtils.Simulate.keyDown(input, {keyCode: 9, key: 'Tab' });

        let selectValue = cmp.querySelector('.Select-value-label');
        expect(selectValue.innerText).toBe("Bookmark 1");
        expect(spyOnchange).toHaveBeenCalled();
        expect(spyOnchange.calls[0].arguments[0].type).toBe("SET_SEARCH_BOOKMARK_CONFIG");
        expect(spyOnchange.calls[0].arguments[0].value).toBeTruthy();
        expect(spyOnchange.calls[0].arguments[0].value.title).toBe("Bookmark 1");

        expect(spyOnchange.calls[1].arguments[0].type).toBe("MAP_CONFIG_LOADED");
        expect(spyOnchange.calls[1].arguments[0].config).toBeTruthy();
        expect(spyOnchange.calls[1].arguments[0].config.map).toBeTruthy();
        expect(spyOnchange.calls[1].arguments[0].config.map.layer).toEqual("Test");
        expect(spyOnchange.calls[1].arguments[0].config.map.bookmark_search_config).toBeTruthy();
        expect(spyOnchange.calls[1].arguments[0].zoomToExtent).toBeTruthy();
        expect(spyOnchange.calls[1].arguments[0].zoomToExtent.bounds).toEqual([1, 1, 1, 1]);
        expect(spyOnchange.calls[1].arguments[0].zoomToExtent.crs).toBe("EPSG:4326");
    });
});
