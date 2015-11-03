/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');

var React = require('react/addons');
var SearchBar = require('../SearchBar');

describe("test the SearchBar", () => {
    afterEach((done) => {
        React.unmountComponentAtNode(document.body);
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test component creation', () => {
        const tb = React.render(<SearchBar/>, document.body);
        expect(tb).toExist();
    });

    it('test search and reset on enter', () => {
        var TestUtils = React.addons.TestUtils;
        const testHandlers = {
            onSearchHandler: (text) => {return text; },
            onSearchResetHandler: () => {}
        };

        const spy = expect.spyOn(testHandlers, 'onSearchHandler');
        const spyReset = expect.spyOn(testHandlers, 'onSearchResetHandler');
        var tb = React.render(<SearchBar delay={0} typeAhead={false} onSearch={testHandlers.onSearchHandler} onSearchReset={testHandlers.onSearchResetHandler}/>, document.body);
        let input = TestUtils.scryRenderedDOMComponentsWithTag(tb, "input")[0].getDOMNode();

        expect(input).toExist();
        input.value = "test";
        TestUtils.Simulate.change(input);
        TestUtils.Simulate.keyDown(input, {key: "Enter", keyCode: 13, which: 13});
        expect(spy.calls.length).toEqual(1);
        input.value = "";
        TestUtils.Simulate.change(input);
        TestUtils.Simulate.keyDown(input, {key: "Enter", keyCode: 13, which: 13});
        expect(spyReset.calls.length).toEqual(1);
    });

    it('test search and reset buttons', () => {
        var TestUtils = React.addons.TestUtils;
        const testHandlers = {
            onSearchHandler: (text) => {return text; },
            onSearchResetHandler: () => {}
        };

        const spy = expect.spyOn(testHandlers, 'onSearchHandler');
        const spyReset = expect.spyOn(testHandlers, 'onSearchResetHandler');
        var tb = React.render(<SearchBar delay={0} typeAhead={false} onSearch={testHandlers.onSearchHandler} onSearchReset={testHandlers.onSearchResetHandler}/>, document.body);
        let input = TestUtils.scryRenderedDOMComponentsWithTag(tb, "input")[0].getDOMNode();
        // test reset button
        expect(input).toExist();
        input.value = "test";
        TestUtils.Simulate.change(input);
        let reset = TestUtils.findRenderedDOMComponentWithClass(tb, "searchclear");
        expect(reset).toExist();
        TestUtils.Simulate.click(reset);
        expect(spyReset.calls.length).toEqual(1);
        expect(input.value).toEqual("");

        // search button
        let button = TestUtils.scryRenderedDOMComponentsWithTag(tb, "button")[0].getDOMNode();
        input.value = "test 2";
        TestUtils.Simulate.change(input);
        TestUtils.Simulate.click(button);
        expect(spy.calls.length).toEqual(1);
    });

    it('test typeahead', (done) => {
        var TestUtils = React.addons.TestUtils;
        const testHandlers = {
            onSearchHandler: (text) => {return text; }
        };
        const spy = expect.spyOn(testHandlers, 'onSearchHandler');
        var tb = React.render(<SearchBar delay={0} typeAhead={true} onSearch={testHandlers.onSearchHandler} onSearchReset={testHandlers.onSearchResetHandler}/>, document.body);
        let input = TestUtils.scryRenderedDOMComponentsWithTag(tb, "input")[0].getDOMNode();

        expect(input).toExist();
        input.value = "test";
        TestUtils.Simulate.change(input);
        setTimeout(() => {expect(spy.calls.length).toEqual(1); done(); }, 50);
    });

    it('test focus and blur events', (done) => {
        var TestUtils = React.addons.TestUtils;
        const testHandlers = {
            onSearchHandler: (text) => {return text; },
            onSearchResetHandler: () => {}
        };

        const spy = expect.spyOn(testHandlers, 'onSearchHandler');
        const spyReset = expect.spyOn(testHandlers, 'onSearchResetHandler');
        var tb = React.render(<SearchBar delay={0} typeAhead={true} blurResetDelay={0} onSearch={testHandlers.onSearchHandler} onSearchReset={testHandlers.onSearchResetHandler}/>, document.body);
        let input = TestUtils.scryRenderedDOMComponentsWithTag(tb, "input")[0];
        expect(input).toExist();
        input = React.findDOMNode(input);
        input.value = "test";

        TestUtils.Simulate.click(input);
        TestUtils.Simulate.focus(input);
        TestUtils.Simulate.blur(input);
        setTimeout(() => {
            expect(spy.calls.length).toEqual(1);
            expect(spyReset.calls.length).toEqual(1);
            done();
        }, 50);
    });
});
