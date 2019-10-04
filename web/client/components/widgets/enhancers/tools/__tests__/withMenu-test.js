/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');
const {createSink} = require('recompose');
const ReactTestUtils = require('react-dom/test-utils');
const expect = require('expect');
const withMenu = require('../withMenu');
const DefaultWidget = require('../../../widget/DefaultWidget');
const Widget = withMenu()(DefaultWidget);

describe('withMenu enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('withMenu creates needed topRightItems property', (done) => {
        const Sink = withMenu()(createSink( props => {
            expect(props.topRightItems.length).toBe(1);
            done();
        }));
        ReactDOM.render(<Sink widgetTools={[{target: "menu"}]}/>, document.getElementById("container"));
    });
    it('withMenu rendering widget creates menu', () => {
        ReactDOM.render(<Widget
            widgetType="text"
            widgetTools={[{
                glyph: "test",
                target: "menu",
                text: <div id="test" />
            }]} />, document.getElementById("container"));
        expect(document.getElementById("test")).toExist();
        // check the presence of a menu
        expect(document.querySelector('.dropdown .widget-menu')).toExist();
        expect(document.querySelector('.mapstore-widget-options .glyphicon-test'));
    });
    it('withMenu not adding items without "menu" target', () => {

        ReactDOM.render(<Widget
            widgetType="text"
            widgetTools={[{
                glyph: "text",
                text: <div id="test" />
            }]} />, document.getElementById("container"));
        expect(document.getElementById("test")).toNotExist();
    });
    it('Check Widgets menu callback', () => {
        const actions = {
            callback: () => {}
        };
        const spyCallback = expect.spyOn(actions, 'callback');
        ReactDOM.render(<Widget
            widgetType="text"
            widgetTools={[{
                glyph: "text",
                target: "menu",
                text: <div id="test-menu" />,
                onClick: actions.callback
            }]}
        />, document.getElementById("container"));
        ReactTestUtils.Simulate.click(document.querySelector("#test-menu"));
        expect(spyCallback).toHaveBeenCalled();
    });

    it('Widgets callback should not be called when menu disabled', () => {
        const actions = {
            callback: () => {}
        };
        const spyCallback = expect.spyOn(actions, 'callback');
        ReactDOM.render(<Widget
            widgetType="text"
            widgetTools={[{
                glyph: "text",
                target: "menu",
                disabled: true,
                text: <div id="test-menu" />,
                onClick: actions.callback
            }]}
        />, document.getElementById("container"));
        ReactTestUtils.Simulate.click(document.querySelector("#test-menu"));
        expect(spyCallback).toNotHaveBeenCalled();
    });
});
