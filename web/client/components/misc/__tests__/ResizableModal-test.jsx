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
const ResizableModal = require('../ResizableModal');

describe('ResizableModal component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test rendering ', () => {
        ReactDOM.render(<ResizableModal />, document.getElementById("container"));
        expect(document.getElementById('ms-resizable-modal')).toNotExist();
        ReactDOM.render(<ResizableModal show />, document.getElementById("container"));
        expect(document.getElementById('ms-resizable-modal')).toExist();
        // check loading
        expect(document.getElementsByClassName('mapstore-inline-loader')[0]).toNotExist();

        ReactDOM.render(<ResizableModal show loading/>, document.getElementById("container"));
        expect(document.getElementsByClassName('mapstore-inline-loader')[0]).toExist();


    });

    it('ResizableModal rendering with defaults show', () => {
        const actions = {
            onClose: () => {}
        };
        const spyonClose = expect.spyOn(actions, 'onClose');
        ReactDOM.render(<ResizableModal show onClose={actions.onClose}/>, document.getElementById("container"));
        const modalEl = document.getElementById('ms-resizable-modal');
        expect(modalEl).toExist();
        expect(modalEl.style.display).toBe('flex');
        let headButtons = document.getElementsByClassName('ms-header-btn');
        expect(headButtons.length).toBe(1);
        ReactTestUtils.Simulate.click(headButtons[0]);
        expect(spyonClose).toHaveBeenCalled();
    });

    it('ResizableModal rendering with fullscreen', () => {
        ReactDOM.render(<ResizableModal show showFullscreen/>, document.getElementById("container"));
        const modalEl = document.getElementById('ms-resizable-modal');
        expect(modalEl).toExist();
        expect(modalEl.style.display).toBe('flex');
        let headButtons = document.getElementsByClassName('ms-header-btn');
        expect(headButtons.length).toBe(2);
        expect(headButtons[0].getAttribute('class')).toBe('ms-header-btn glyphicon glyphicon-resize-full');

        expect(document.querySelector('.ms-fullscreen')).toNotExist();
        ReactTestUtils.Simulate.click(headButtons[0]);
        expect(document.querySelector('.ms-fullscreen')).toExist();

        ReactDOM.render(<ResizableModal show showFullscreen fullscreenType="vertical"/>, document.getElementById("container"));
        headButtons = document.getElementsByClassName('ms-header-btn');
        expect(headButtons.length).toBe(2);
        expect(headButtons[0].getAttribute('class')).toBe('ms-header-btn glyphicon glyphicon-resize-vertical');

        ReactDOM.render(<ResizableModal show showFullscreen fullscreenType="horizontal"/>, document.getElementById("container"));
        headButtons = document.getElementsByClassName('ms-header-btn');
        expect(headButtons.length).toBe(2);
        expect(headButtons[0].getAttribute('class')).toBe('ms-header-btn glyphicon glyphicon-resize-horizontal');

        expect(document.querySelector('.modal-fixed')).toExist();
    });

    it('ResizableModal rendering with different sizes', () => {
        ReactDOM.render(<ResizableModal show/>, document.getElementById("container"));
        const modalEl = document.getElementById('ms-resizable-modal');
        expect(modalEl).toExist();

        expect(document.querySelector('.ms-sm')).toNotExist();
        expect(document.querySelector('.ms-lg')).toNotExist();

        ReactDOM.render(<ResizableModal show size="sm"/>, document.getElementById("container"));

        expect(document.querySelector('.ms-sm')).toExist();

        ReactDOM.render(<ResizableModal show size="lg"/>, document.getElementById("container"));

        expect(document.querySelector('.ms-lg')).toExist();
    });

    it('ResizableModal rendering with fitContent', () => {
        ReactDOM.render(<ResizableModal show fitContent/>, document.getElementById("container"));
        const modalWithFitContent = document.querySelector('.ms-fit-content');
        expect(modalWithFitContent).toExist();
    });
});
