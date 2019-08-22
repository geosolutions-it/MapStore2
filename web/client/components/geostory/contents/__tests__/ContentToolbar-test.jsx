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
    const testOptions = [{
            name: "align",
            length: 3,
            totButtons: 1
        },
        {
            name: "size",
            length: 4,
            totButtons: 1
        },
        {
            name: "theme",
            length: 4,
            totButtons: 1
        }];
    testOptions.forEach(tool => {
        it(`ContentToolbar rendering ${tool.name} item`, () => {
            ReactDOM.render(<ContentToolbar tools={[tool.name]}/>, document.getElementById("container"));
            const buttons = document.getElementsByTagName('button');
            expect(buttons).toExist();
            expect(buttons.length).toEqual(tool.totButtons);
            const list = document.getElementsByTagName('li');
            expect(list).toExist();
            expect(list.length).toEqual(tool.length, `the ${tool.name} had wrong number of li tags, expect ${list.length} toEqual ${tool.length}`);
        });
    });
});


