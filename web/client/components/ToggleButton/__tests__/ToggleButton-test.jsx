/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');

var React = require('react/addons');
var ToggleButton = require('../ToggleButton');

describe("test the ToggleButton", () => {
    afterEach((done) => {
        React.unmountComponentAtNode(document.body);
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test default properties', () => {
        const tb = React.render(<ToggleButton/>, document.body);
        expect(tb).toExist();

        const tbNode = React.findDOMNode(tb);
        expect(tbNode).toExist();
        expect(tbNode.id).toNotExist();

        const button = tbNode.getElementsByTagName('button')[0];
        expect(button).toExist();
        expect(button.className.indexOf('default') >= 0).toBe(true);

        expect(button.innerHTML).toNotExist();
    });

    it('test glyphicon property', () => {
        const tb = React.render(<ToggleButton glyphicon="info-sign"/>, document.body);
        expect(tb).toExist();

        const tbNode = React.findDOMNode(tb);
        expect(tbNode).toExist();

        const button = tbNode.getElementsByTagName('button')[0];
        expect(button).toExist();

        const icons = button.getElementsByTagName('span');
        expect(icons.length).toBe(1);
    });

    it('test glyphicon property with text', () => {
        const tb = React.render(<ToggleButton glyphicon="info-sign" text="button"/>, document.body);
        expect(tb).toExist();

        const tbNode = React.findDOMNode(tb);
        expect(tbNode).toExist();

        const button = tbNode.getElementsByTagName('button')[0];
        expect(button).toExist();

        const btnItems = button.getElementsByTagName('span');
        expect(btnItems.length).toBe(3);

        expect(btnItems[0].innerHTML).toBe("");
        expect(btnItems[1].innerHTML).toBe("&nbsp;");
        expect(btnItems[2].innerHTML).toBe("button");
    });

    it('test button state', () => {
        const tb = React.render(<ToggleButton pressed={true}/>, document.body);
        expect(tb).toExist();

        const tbNode = React.findDOMNode(tb);
        const button = tbNode.getElementsByTagName('button')[0];

        expect(button.className.indexOf('primary') >= 0).toBe(true);
    });

    it('test click handler', () => {
        const testHandlers = {
            onClick: (pressed) => {return pressed; }
        };
        const spy = expect.spyOn(testHandlers, 'onClick');
        const tb = React.render(<ToggleButton pressed={true} onClick={testHandlers.onClick}/>, document.body);

        const tbNode = React.findDOMNode(tb);
        tbNode.click();

        expect(spy.calls.length).toEqual(1);
        expect(spy.calls[0].arguments).toEqual([true]);
    });
});
