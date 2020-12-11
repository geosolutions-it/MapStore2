/**
 * Copyright 2015-2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';

import LocateBtn from '../LocateBtn';

describe("test the Locate Button", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.body);
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test default properties', () => {
        const tb = ReactDOM.render(<LocateBtn locate="DISABLED" />, document.getElementById("container"));
        expect(tb).toExist();

        const tbNode = ReactDOM.findDOMNode(tb);
        expect(tbNode).toExist();
        expect(tbNode.id).toBe("locate-btn");

        const icons = tbNode.getElementsByTagName('span');
        expect(icons.length).toBe(1);

        expect(tbNode.className.indexOf('default') >= 0).toBe(true);
        expect(tbNode.className.indexOf('success') === -1).toBe(true);
        expect(tbNode.innerHTML).toExist();
    });

    it('test button state', () => {
        const tb = ReactDOM.render(<LocateBtn locate="FOLLOWING"/>, document.getElementById("container"));
        expect(tb).toExist();

        const tbNode = ReactDOM.findDOMNode(tb);

        expect(tbNode.className.indexOf('default') === -1).toBe(true);
        expect(tbNode.className.indexOf('success') >= 0).toBe(true);
    });

    it('test click handler', () => {
        const testHandlers = {
            onClick: (pressed) => {return pressed; }
        };
        const spy = expect.spyOn(testHandlers, 'onClick');
        const tb = ReactDOM.render(<LocateBtn locate="ENABLED" onClick={testHandlers.onClick}/>, document.getElementById("container"));

        const tbNode = ReactDOM.findDOMNode(tb);
        tbNode.click();

        expect(spy.calls.length).toEqual(1);
        expect(spy.calls[0].arguments).toEqual(["FOLLOWING"]);
        expect(tbNode.className.indexOf('default') === -1).toBe(true);
        expect(tbNode.className.indexOf('success') >= 0).toBe(true);
    });

    it('test permission denied state', () => {
        const component = ReactDOM.render(<LocateBtn locate="PERMISSION_DENIED"/>,
            document.getElementById("container"));
        expect(component).toExist();
        // check if the button was correctly disabled
        const button = ReactTestUtils.findRenderedDOMComponentWithTag(component, "button");
        expect(button).toExist();
        expect(button.classList.contains('disabled')).toEqual(true);
    });

});
