/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import TestUtils from 'react-dom/test-utils';

import Localized from '../../I18N/Localized';
import SearchBarInput from '../SearchBarInput';

describe('SearchBarInput tests', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test typeahead', (done) => {
        const renderSearchBar = (testHandlers, text) => {
            return ReactDOM.render(<SearchBarInput show searchText={text} delay={0} typeAhead onSearch={testHandlers.onSearchHandler} onSearchReset={testHandlers.onSearchResetHandler} onSearchTextChange={testHandlers.onSearchTextChangeHandler}/>, document.getElementById("container"));
        };

        const testHandlers = {
            onSearchHandler: (text) => { return text; }
        };
        testHandlers.onSearchTextChangeHandler = renderSearchBar.bind(null, testHandlers);

        const spy = expect.spyOn(testHandlers, 'onSearchHandler');
        renderSearchBar(testHandlers);
        let input = document.getElementsByTagName("input")[0];

        expect(input).toExist();
        input.value = "test";
        TestUtils.Simulate.change(input);
        setTimeout(() => {expect(spy.calls.length).toEqual(1); done(); }, 50);
    });

    it('test focus and blur events', (done) => {
        const testHandlers = {
            onSearchHandler: (text) => {return text; },
            onPurgeResultsHandler: () => {}
        };

        const spy = expect.spyOn(testHandlers, 'onSearchHandler');
        const spyReset = expect.spyOn(testHandlers, 'onPurgeResultsHandler');
        ReactDOM.render(<SearchBarInput show searchText="test" delay={0} typeAhead blurResetDelay={0} onSearch={testHandlers.onSearchHandler} onPurgeResults={testHandlers.onPurgeResultsHandler}/>, document.getElementById("container"));
        let input = document.getElementsByTagName("input")[0];
        expect(input).toExist();
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

    it('test autofocus on selected items', (done) => {
        ReactDOM.render(<SearchBarInput show searchText="test" delay={0} typeAhead blurResetDelay={0} />, document.getElementById("container"));
        let input = document.getElementsByTagName("input")[0];
        expect(input).toExist();
        let spyOnFocus = expect.spyOn(input, 'focus');
        input.value = "test";
        TestUtils.Simulate.blur(input);
        ReactDOM.render(<SearchBarInput show searchText="test" delay={0} typeAhead blurResetDelay={0} selectedItems={[{text: "TEST"}]}/>, document.getElementById("container"));
        setTimeout(() => {
            expect(spyOnFocus.calls.length).toEqual(1);
            done();
        }, 210);
    });
    it('test placeholderMsgId', () => {
        const comp = (
            <Localized messages={{'testMessage': 'testmessage'}} locale="en-US">
                <SearchBarInput show delay={0} typeAhead blurResetDelay={0} placeholderMsgId={'testMessage'}/>
            </Localized>
        );
        ReactDOM.render(comp, document.getElementById("container"));
        const input = document.getElementsByTagName("input")[0];
        expect(input).toExist();
        expect(input.placeholder).toBe('testmessage');
    });
});
