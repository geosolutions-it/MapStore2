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

        ReactDOM.render(<BookmarkSelect onPropertyChange={null} bookmarkConfig={null}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container).toExist();
        const select = container.querySelector(".search-select");
        expect(select).toExist();
        const labelValue = container.querySelector(".Select-value-label");
        expect(labelValue).toNotExist();
        const placeholder = container.querySelector(".Select-placeholder");
        expect(placeholder.innerText).toBe("search.b_placeholder");

    });
    it('test BookmarkSelect with value and onPropertyChange', (done) => {

        let bookmarkConfig = {
            selected: {title: "Bookmark 1"},
            bookmarkSearchConfig: {
                bookmarks: [{title: "Bookmark 1"}, {title: "Bookmark 2"}]
            }
        };

        TestUtils.act(() => {
            ReactDOM.render(
                <BookmarkSelect
                    bookmarkConfig={bookmarkConfig}
                    onPropertyChange={
                        (s, value) => {
                            try {
                                expect(value.title).toBe('Bookmark 2');
                            } catch (e) {
                                done(e);
                            }
                            done();
                        }}
                />,
                document.getElementById("container"));
        });
        const cmp = document.getElementById('container');
        expect(cmp).toBeTruthy();

        const input = cmp.querySelector('input');
        expect(input).toBeTruthy();

        let selectValue = cmp.querySelector('.Select-value-label');
        expect(selectValue.innerText).toBe("Bookmark 1");

        TestUtils.act(() => {
            TestUtils.Simulate.focus(input);
            TestUtils.Simulate.keyDown(input, { key: 'ArrowDown', keyCode: 40 });
        });
        const selectMenuOptionNodes = cmp.querySelectorAll('.Select-option');
        expect(selectMenuOptionNodes.length).toBe(2);
        TestUtils.act(() => {
            TestUtils.Simulate.mouseDown(selectMenuOptionNodes[1]);
        });
        selectValue = cmp.querySelector('.Select-value-label');
        expect(selectValue.innerText).toBe("Bookmark 2");

    });
});
