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
import ReactTestUtils from 'react-dom/test-utils';
import BookmarkList from '../BookmarkList';

describe("BookmarkList component", () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="container"></div>';
    });

    afterEach(() => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
    });

    it('test BookmarkList', () => {
        ReactDOM.render(<BookmarkList.Element/>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container).toExist();
        const inputs = container.querySelectorAll(".form-control");
        const list = container.querySelector(".search-bookmark-name");
        expect(inputs.length).toBe(1);
        expect(list.innerText).toBe('search.bookmarkslistempty');
    });
    it('test BookmarkList bookmark as cards', () => {
        ReactDOM.render(<BookmarkList.Element bookmarks={[{title: "Bookmark1"}]}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container).toExist();
        const inputs = container.querySelectorAll(".form-control");
        const list = container.querySelector(".search-bookmark-name");
        const bookmarkCard = container.querySelectorAll(".mapstore-side-card");
        const buttons = container.querySelectorAll("button");
        expect(inputs.length).toBe(1);
        expect(list).toNotExist();
        expect(bookmarkCard.length).toBe(1);
        expect(bookmarkCard[0].innerText).toBe('Bookmark1');
        expect(buttons.length).toBe(2);

    });

    it('test BookmarkList edit a bookmark', () => {
        const actions = {
            onPropertyChange: () => { }
        };
        const spyOnPropertyChange = expect.spyOn(actions, 'onPropertyChange');

        ReactDOM.render(<BookmarkList.Element onPropertyChange={actions.onPropertyChange} bookmarks={[{title: "Bookmark 1"}, {title: "Bookmark 2"}]}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container).toExist();
        const bookmarkCard = container.querySelectorAll(".mapstore-side-card");
        const buttons = container.querySelectorAll("button");
        expect(bookmarkCard.length).toBe(2);
        expect(buttons.length).toBe(4);
        const editBookmark1 = buttons[0];
        ReactTestUtils.Simulate.click(editBookmark1);
        expect(spyOnPropertyChange).toHaveBeenCalled();
        expect(spyOnPropertyChange.calls.length).toBe(3);
        expect(spyOnPropertyChange.calls[0].arguments[0]).toBe("bookmark");
        expect(spyOnPropertyChange.calls[0].arguments[1]).toEqual({title: "Bookmark 1"});
        expect(spyOnPropertyChange.calls[1].arguments[0]).toBe("editIdx");
        expect(spyOnPropertyChange.calls[1].arguments[1]).toBe(0);
        expect(spyOnPropertyChange.calls[2].arguments[0]).toBe("page");
        expect(spyOnPropertyChange.calls[2].arguments[1]).toBe(1);

    });
    it('test BookmarkList open a bookmark', () => {
        const actions = {
            onPropertyChange: () => { }
        };
        const spyOnPropertyChange = expect.spyOn(actions, 'onPropertyChange');

        ReactDOM.render(<BookmarkList.Element onPropertyChange={actions.onPropertyChange} bookmarks={[{title: "Bookmark 1"}, {title: "Bookmark 2"}]}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container).toExist();
        const bookmarkCard = container.querySelectorAll(".mapstore-side-card-title span");
        ReactTestUtils.Simulate.click(bookmarkCard[1]); // First bookmark
        expect(spyOnPropertyChange).toHaveBeenCalled();
        expect(spyOnPropertyChange.calls.length).toBe(3);
        expect(spyOnPropertyChange.calls[0].arguments[0]).toBe("bookmark");
        expect(spyOnPropertyChange.calls[0].arguments[1]).toEqual({title: "Bookmark 1"});
        expect(spyOnPropertyChange.calls[1].arguments[0]).toBe("editIdx");
        expect(spyOnPropertyChange.calls[1].arguments[1]).toBe(0);
        expect(spyOnPropertyChange.calls[2].arguments[0]).toBe("page");
        expect(spyOnPropertyChange.calls[2].arguments[1]).toBe(1);

    });
    it('test BookmarkList delete a bookmark', () => {
        const actions = {
            onPropertyChange: () => { }
        };
        const spyOnPropertyChange = expect.spyOn(actions, 'onPropertyChange');

        ReactDOM.render(<BookmarkList.Element onPropertyChange={actions.onPropertyChange} bookmarks={[{title: "Bookmark 1"}, {title: "Bookmark 2"}]}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container).toExist();
        const bookmarkCard = container.querySelectorAll(".mapstore-side-card");
        const buttons = container.querySelectorAll("button");
        expect(bookmarkCard.length).toBe(2);
        expect(buttons.length).toBe(4);
        const deleteBookmark1 = buttons[1];
        ReactTestUtils.Simulate.click(deleteBookmark1);
        expect(spyOnPropertyChange).toHaveBeenCalled();
        expect(spyOnPropertyChange.calls.length).toBe(1);
        expect(spyOnPropertyChange.calls[0].arguments[0]).toBe("bookmarkSearchConfig");
        expect(spyOnPropertyChange.calls[0].arguments[1]).toEqual({bookmarks: [{title: "Bookmark 2"}]});

    });
    it('test BookmarkList filter a bookmark', () => {
        const actions = {
            onFilter: () => {}
        };
        const spyOnFilter = expect.spyOn(actions, 'onFilter');

        ReactDOM.render(<BookmarkList.Element onFilter={actions.onFilter} filter={""} bookmarks={[{title: "Bookmark 1"}, {title: "New 2"}]}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container).toExist();
        const filter = container.querySelector(".form-control");
        filter.value = "New";
        ReactTestUtils.Simulate.change(filter);
        expect(spyOnFilter).toHaveBeenCalled();
        expect(spyOnFilter.calls.length).toBe(1);
        expect(spyOnFilter.calls[0].arguments[0]).toBe("New");

        const filterVal = spyOnFilter.calls[0].arguments[0];
        ReactDOM.render(<BookmarkList.Element onFilter={actions.onFilter} filter={filterVal} bookmarks={[{title: "Bookmark 1"}, {title: "New 2"}]}/>, document.getElementById("container"));
        const bookmarkCard = document.querySelectorAll(".mapstore-side-card");
        const bookmarkCardTitle = document.querySelectorAll(".mapstore-side-card-title");
        expect(bookmarkCard.length).toBe(1);
        expect(bookmarkCardTitle[0].innerText).toBe("New 2");
    });
});
