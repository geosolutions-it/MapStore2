/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const ReactTestUtils = require('react-dom/test-utils');

const expect = require('expect');
const ShowMore = require('../ShowMore');


describe('ShowMore component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('ShowMore rendering with defaults', () => {
        ReactDOM.render(<ShowMore/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-show-more');
        expect(el).toExist();
    });

    it('ShowMore on load more', () => {
        const actions = {
            onLoadMore: () => {}
        };

        const spyOnLoadMore = expect.spyOn(actions, 'onLoadMore');

        ReactDOM.render(<ShowMore
            items={[{ id: 1}, {id: 2}]}
            total={10}
            skip={0}
            pageSize={2}
            onLoadMore={actions.onLoadMore}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-show-more');
        expect(el).toExist();

        const button = el.querySelector('.btn');
        expect(button).toExist();
        ReactTestUtils.Simulate.click(button);
        expect(spyOnLoadMore).toHaveBeenCalledWith(1);

    });
});
