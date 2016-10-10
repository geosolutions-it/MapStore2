/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');

var React = require('react/addons');
var ReactDOM = require('react-dom');
var SearchBar = require('../SearchBar');

describe("test the SearchBar", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test component creation', () => {
        const tb = ReactDOM.render(<SearchBar/>, document.getElementById("container"));
        expect(tb).toExist();
    });

    it('test search and reset on enter', () => {
        var TestUtils = React.addons.TestUtils;
        var tb;
        const testHandlers = {
            onSearchHandler: (text) => { return text; },
            onSearchResetHandler: () => {},
            onSearchTextChangeHandler: (text) => { tb.setProps({searchText: text}); }
        };

        const spy = expect.spyOn(testHandlers, 'onSearchHandler');
        const spyReset = expect.spyOn(testHandlers, 'onSearchResetHandler');
        tb = ReactDOM.render(<SearchBar delay={0} typeAhead={false} onSearch={testHandlers.onSearchHandler} onSearchReset={testHandlers.onSearchResetHandler} onSearchTextChange={testHandlers.onSearchTextChangeHandler}/>, document.getElementById("container"));
        let input = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithTag(tb, "input")[0]);

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
        var tb;
        const testHandlers = {
            onSearchHandler: (text) => { return text; },
            onSearchResetHandler: () => { tb.setProps({searchText: ""}); },
            onSearchTextChangeHandler: (text) => { tb.setProps({searchText: text}); }
        };

        const spyReset = expect.spyOn(testHandlers, 'onSearchResetHandler');
        spyReset.andCallThrough();
        tb = ReactDOM.render(<SearchBar delay={0} typeAhead={false} onSearch={testHandlers.onSearchHandler} onSearchReset={testHandlers.onSearchResetHandler} onSearchTextChange={testHandlers.onSearchTextChangeHandler}/>, document.getElementById("container"));
        let input = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithTag(tb, "input")[0]);
        // test reset button
        expect(input).toExist();
        input.value = "test";
        TestUtils.Simulate.change(input);
        let reset = TestUtils.findRenderedDOMComponentWithClass(tb, "searchclear");
        expect(reset).toExist();
        TestUtils.Simulate.click(reset);
        expect(spyReset.calls.length).toEqual(1);
        expect(input.value).toEqual("");

    });

    it('test typeahead', (done) => {
        var TestUtils = React.addons.TestUtils;
        var tb;
        const testHandlers = {
            onSearchHandler: (text) => {return text; },
            onSearchTextChangeHandler: (text) => { tb.setProps({searchText: text}); }
        };
        const spy = expect.spyOn(testHandlers, 'onSearchHandler');
        tb = ReactDOM.render(<SearchBar delay={0} typeAhead={true} onSearch={testHandlers.onSearchHandler} onSearchReset={testHandlers.onSearchResetHandler} onSearchTextChange={testHandlers.onSearchTextChangeHandler}/>, document.getElementById("container"));
        let input = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithTag(tb, "input")[0]);

        expect(input).toExist();
        input.value = "test";
        TestUtils.Simulate.change(input);
        setTimeout(() => {expect(spy.calls.length).toEqual(1); done(); }, 50);
    });

    it('test focus and blur events', (done) => {
        var TestUtils = React.addons.TestUtils;
        const testHandlers = {
            onSearchHandler: (text) => {return text; },
            onPurgeResultsHandler: () => {}
        };

        const spy = expect.spyOn(testHandlers, 'onSearchHandler');
        const spyReset = expect.spyOn(testHandlers, 'onPurgeResultsHandler');
        var tb = ReactDOM.render(<SearchBar delay={0} typeAhead={true} blurResetDelay={0} onSearch={testHandlers.onSearchHandler} onPurgeResults={testHandlers.onPurgeResultsHandler}/>, document.getElementById("container"));
        let input = TestUtils.scryRenderedDOMComponentsWithTag(tb, "input")[0];
        expect(input).toExist();
        input = ReactDOM.findDOMNode(input);
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

    it('test that options are passed to search action', () => {
        var TestUtils = React.addons.TestUtils;
        var tb;
        const testHandlers = {
            onSearchHandler: (text, options) => { return [text, options]; },
            onSearchTextChangeHandler: (text) => { tb.setProps({searchText: text}); }
        };

        let searchOptions = {displaycrs: "EPSG:3857"};
        const spy = expect.spyOn(testHandlers, 'onSearchHandler');
        tb = ReactDOM.render(<SearchBar delay={0} typeAhead={false} onSearch={testHandlers.onSearchHandler} onSearchTextChange={testHandlers.onSearchTextChangeHandler} searchOptions={searchOptions}/>, document.getElementById("container"));
        let input = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithTag(tb, "input")[0]);

        expect(input).toExist();
        input.value = "test";
        TestUtils.Simulate.change(input);
        TestUtils.Simulate.keyDown(input, {key: "Enter", keyCode: 13, which: 13});
        expect(spy.calls.length).toEqual(1);
        expect(spy).toHaveBeenCalledWith('test', searchOptions);
    });
});
