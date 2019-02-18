/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const ReactTestUtils = require('react-dom/test-utils');

const expect = require('expect');
const SquareCard = require('../SquareCard');

describe('SquareCard component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('SquareCard rendering with defaults', () => {
        ReactDOM.render(<SquareCard />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-square-card');
        expect(el).toExist();
        expect(container.querySelector('.ms-selected')).toNotExist();
    });

    it('SquareCard rendering with selected', () => {
        ReactDOM.render(<SquareCard selected/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-square-card');
        expect(el).toExist();
        expect(container.querySelector('.ms-selected')).toExist();
    });

    it('SquareCard rendering with title and preview', () => {
        ReactDOM.render(<SquareCard title={'Title'} preview={'Preview'} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-square-card');
        expect(el).toExist();
        const preview = container.querySelector('.ms-preview');
        expect(preview).toExist();
        expect(preview.innerHTML).toBe('Preview');
        const title = container.querySelector('small');
        expect(title).toExist();
        expect(title.innerHTML).toBe('Title');
    });

    it('SquareCard rendering with title and previewSrc', () => {
        ReactDOM.render(<SquareCard title={'Title'} previewSrc={'src'} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-square-card');
        expect(el).toExist();
        const previewImg = container.querySelector('img');
        expect(previewImg).toExist();
        const title = container.querySelector('small');
        expect(title).toExist();
        expect(title.innerHTML).toBe('Title');
    });

    it('SquareCard test on select', () => {
        const actions = {
            onClick: () => {}
        };
        const spyOnClick = expect.spyOn(actions, 'onClick');

        ReactDOM.render(<SquareCard
            title={'Title'}
            previewSrc={'src'}
            onClick={actions.onClick}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-square-card');
        expect(el).toExist();
        ReactTestUtils.Simulate.click(el);
        expect(spyOnClick).toHaveBeenCalled();
    });
});
