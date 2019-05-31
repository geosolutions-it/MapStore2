/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const expect = require('expect');
const ReactDOM = require('react-dom');
const {defaultViewerHandlers, defaultViewerDefaultProps} = require('../defaultViewer');
const TestUtils = require('react-dom/test-utils');

describe("test defaultViewer enhancers", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test defaultViewerDefaultProps', () => {
        const Component = defaultViewerDefaultProps(({format, validator}) => validator(format) && <div id="test-component">{format}</div>);
        ReactDOM.render(<Component/>, document.getElementById("container"));
        const testComponent = document.getElementById('test-component');
        expect(testComponent.innerHTML).toBe('text/plain');
    });

    it('test defaultViewerHanlders onNext', done => {
        const Component = defaultViewerHandlers(({onNext = () => {}, index = 0}) =>
            <span>
                <div id="test-component-next" onClick={() => onNext()}>{index}</div>
            </span>
        );

        ReactDOM.render(<Component validResponses={[{dummy: "dummy response"}]} index={0} setIndex={index => {
            expect(index).toBe(0);
            done();
        }} />, document.getElementById("container"));

        const testComponentNext = document.getElementById('test-component-next');
        TestUtils.Simulate.click(testComponentNext);
    });

    it('test defaultViewerHanlders onPrevious', done => {
        const Component = defaultViewerHandlers(({onPrevious = () => {}, index}) =>
            <span>
                <div id="test-component-previous" onClick={() => onPrevious()}>{index}</div>
            </span>
        );

        ReactDOM.render(<Component index={0} setIndex={index => {
            expect(index).toBe(0);
            done();
        }}/>, document.getElementById("container"));

        const testComponentNext = document.getElementById('test-component-previous');
        TestUtils.Simulate.click(testComponentNext);
    });
});
