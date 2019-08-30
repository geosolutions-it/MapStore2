/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import ReactTestUtils from 'react-dom/test-utils';
import {includes, castArray} from 'lodash';

import ContentToolbar from '../ContentToolbar';

describe('ContentToolbar component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('ContentToolbar rendering with defaults', () => {
        ReactDOM.render(<ContentToolbar />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-content-toolbar');
        expect(el).toExist();
    });
    it('ContentToolbar rendering all supported items', () => {
        ReactDOM.render(<ContentToolbar tools={["align", "size", "theme"]}/>, document.getElementById("container"));
        const buttons = document.getElementsByTagName('button');
        expect(buttons).toExist();
        expect(buttons.length).toEqual(3);
    });
    const testItems = [{
            name: "align",
            length: 3,
            totButtons: 1,
            aTag: ["left", "center", "right"]
        },
        {
            name: "size",
            length: 4,
            totButtons: 1,
            aTag: ["small", "medium", "large", "full"]
        },
        {
            name: "theme",
            length: 4,
            totButtons: 1,
            aTag: ["bright", "bright-text", "dark", "dark-text"]
        }];
    testItems.forEach(tool => {
        it(`ContentToolbar rendering ${tool.name} item and click event`, (done) => {
            ReactDOM.render(<ContentToolbar
                tools={[tool.name]}
                update={(t, selected) => {
                    expect(t).toEqual(tool.name);
                    expect(includes(tool.aTag, selected)).toEqual(true);
                    done();
                }}
            />, document.getElementById("container"));
            const buttons = document.getElementsByTagName('button');
            expect(buttons).toExist();
            expect(buttons.length).toEqual(tool.totButtons);

            const list = document.getElementsByTagName('li');
            expect(list).toExist();
            expect(list.length).toEqual(tool.length, `the ${tool.name} had wrong number of li tags, expect ${list.length} toEqual ${tool.length}`);

            const aTags = document.getElementsByTagName('a');
            expect(aTags).toExist();
            castArray(aTags).forEach((a, i) => {
                ReactTestUtils.Simulate.click(aTags[i]);
            });
        });
    });
    it(`ContentToolbar rendering fit item and handling click event`, (done) => {
        ReactDOM.render(<ContentToolbar
            tools={["fit"]}
            fit="contain"
            update={(t, fitValue) => {
                expect(t).toEqual("fit");
                expect(fitValue).toEqual("cover");
                done();
            }}
        />, document.getElementById("container"));
        const buttons = document.getElementsByTagName('button');
        expect(buttons).toExist();
        expect(buttons.length).toEqual(1);
        ReactTestUtils.Simulate.click(buttons[0]);
    });
});
