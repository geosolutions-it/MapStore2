/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from "react";
import ReactDOM from "react-dom";
import expect from "expect";
import TestUtils from 'react-dom/test-utils';
import ItemThumbnail from '../ItemThumbnail';

describe('ItemThumbnail component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('ItemThumbnail rendering with defaults', () => {
        ReactDOM.render(<ItemThumbnail/>, document.getElementById("container"));
        const container = document.getElementById("container");
        const el = container.querySelector('.modal-dialog');
        expect(el).toExist();
    });
    it('ItemThumbnail rendering with data', () => {
        ReactDOM.render(<ItemThumbnail title={"Card one"} thumbnail={{}}/>, document.getElementById("container"));
        const container = document.getElementById("container");
        const el = container.querySelector('.modal-dialog');
        expect(el).toExist();
        const title = el.getElementsByClassName('form-control').item(0);
        expect(title.value).toBe('Card one');
    });
    it('ItemThumbnail on add of new data', () => {
        const action = {update: () => {}, onClose: () => {}};
        const spyUpdate = expect.spyOn(action, 'update');
        const spyClose = expect.spyOn(action, 'onClose');
        ReactDOM.render(<ItemThumbnail title={"Card one"} thumbnail={{}} onClose={action.onClose}
            update={action.update}/>, document.getElementById("container"));
        const container = document.getElementById("container");
        const el = container.querySelector('.modal-dialog');
        expect(el).toExist();
        const addButton = el.querySelector('.modal-footer button');
        TestUtils.Simulate.click(addButton);
        expect(spyUpdate).toHaveBeenCalled();
        expect(spyClose).toHaveBeenCalled();
    });
});
