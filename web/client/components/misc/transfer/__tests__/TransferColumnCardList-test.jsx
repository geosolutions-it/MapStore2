/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';
import expect from 'expect';

import TransferColumnCardList from '../TransferColumnCardList';

describe('TransferColumnCardList component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('TransferColumnCardList rendering with defaults', () => {
        ReactDOM.render(<TransferColumnCardList items={["item"]}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.getElementsByClassName('ms2-transfer-sidegrid')[0]).toExist();
    });
    it('Select items', () => {
        const actions = {
            onSelect: () => {}
        };

        const spy = expect.spyOn(actions, 'onSelect');

        ReactDOM.render(<TransferColumnCardList items={["item1", "item2", "item3", "item4"]} {...actions}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const column = container.getElementsByClassName('ms2-transfer-sidegrid')[0];
        expect(column).toExist();
        const items = column.getElementsByClassName('mapstore-side-card');
        expect(items.length).toBe(4);

        TestUtils.Simulate.click(items[0]);

        expect(spy.calls.length).toBe(1);
        expect(spy.calls[0].arguments[0]).toEqual(["item1"]);
    });
});
