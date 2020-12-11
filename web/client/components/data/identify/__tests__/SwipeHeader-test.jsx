/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import SwipeHeader from '../SwipeHeader.jsx';
import expect from 'expect';

describe('SwipeHeader', () => {

    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('creates the SwipeHeader component with defaults', () => {
        const header = ReactDOM.render(
            <SwipeHeader/>,
            document.getElementById("container")
        );

        expect(header).toExist();
    });

    it('creates the SwipeHeader component with title', () => {
        const header = ReactDOM.render(
            <SwipeHeader title="mytitle"/>,
            document.getElementById("container")
        );

        expect(header).toExist();
        const dom = ReactDOM.findDOMNode(header);
        expect(dom.innerHTML.indexOf('mytitle') !== -1).toBe(true);
    });

    it('creates the SwipeHeader component with swipe buttons', () => {
        const header = ReactDOM.render(
            <SwipeHeader title="mytitle" size={2}/>,
            document.getElementById("container")
        );

        expect(header).toExist();
        const dom = ReactDOM.findDOMNode(header);
        expect(dom.getElementsByTagName('button').length).toBe(2);
    });

    it('calls containers handler when swipe buttons are pressed', () => {
        const testHandlers = {
            onNext: () => {},
            onPrevious: () => {}
        };

        const container = () => ({
            swipe: testHandlers
        });

        const spyNext = expect.spyOn(testHandlers, 'onNext');
        const spyPrev = expect.spyOn(testHandlers, 'onPrevious');

        const header = ReactDOM.render(
            <SwipeHeader title="mytitle" container={container} onNext={testHandlers.onNext} onPrevious={testHandlers.onPrevious} size={2}/>,
            document.getElementById("container")
        );
        const dom = ReactDOM.findDOMNode(header);
        const buttons = dom.getElementsByTagName('button');

        ReactTestUtils.Simulate.click(buttons[0]);
        expect(spyPrev.calls.length).toEqual(1);
        ReactTestUtils.Simulate.click(buttons[1]);
        expect(spyNext.calls.length).toEqual(1);
    });
    it('should not have button if size is less than 2', () => {
        const header = ReactDOM.render(
            <SwipeHeader title="mytitle" size={1}/>,
            document.getElementById("container")
        );
        expect(header).toExist();
        const dom = ReactDOM.findDOMNode(header);
        expect(dom.getElementsByTagName('button').length).toBe(0);
    });
});
