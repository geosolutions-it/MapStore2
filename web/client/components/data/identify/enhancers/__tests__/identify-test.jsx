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
const {identifyLifecycle, switchControlledIdentify} = require('../identify');
const TestUtils = require('react-dom/test-utils');

describe("test identify enhancers", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test switchControlledIdentify', () => {
        const Component = switchControlledIdentify(({index = 0, setIndex = () => {}}) => <div id="test-component" onClick={() => setIndex(2)}>{index}</div>);
        ReactDOM.render(<Component />, document.getElementById("container"));
        let testComponent = document.getElementById('test-component');
        expect(testComponent.innerHTML).toBe('0');
        TestUtils.Simulate.click(testComponent);
        expect(testComponent.innerHTML).toBe('2');

        ReactDOM.render(<Component viewerOptions={{header: true}}/>, document.getElementById("container"));
        testComponent = document.getElementById('test-component');
        expect(testComponent.innerHTML).toBe('0');
        TestUtils.Simulate.click(testComponent);
        expect(testComponent.innerHTML).toBe('0');

        ReactDOM.render(<Component viewerOptions={{}}/>, document.getElementById("container"));
        testComponent = document.getElementById('test-component');
        expect(testComponent.innerHTML).toBe('0');
        TestUtils.Simulate.click(testComponent);
        expect(testComponent.innerHTML).toBe('2');
    });

    it('test switchControlledIdentify component changes mousepointer on enable / disable', () => {

        const Component = identifyLifecycle(() => <div id="test-component"></div>);

        const testHandlers = {
            changeMousePointer: () => {}
        };

        const spyMousePointer = expect.spyOn(testHandlers, 'changeMousePointer');

        ReactDOM.render(
            <Component changeMousePointer={testHandlers.changeMousePointer} />,
            document.getElementById("container")
        );
        ReactDOM.render(
            <Component changeMousePointer={testHandlers.changeMousePointer} enabled/>,
            document.getElementById("container")
        );
        expect(spyMousePointer.calls.length).toEqual(1);
        ReactDOM.render(
            <Component changeMousePointer={testHandlers.changeMousePointer} enabled={false}/>,
            document.getElementById("container")
        );
        expect(spyMousePointer.calls.length).toEqual(2);
    });

    it("test switchControlledIdentify component doesn't need reset current index when requests are the same", () => {
        const Component = identifyLifecycle(() => <div id="test-component"></div>);
        const testHandlers = {
            setIndex: () => {}
        };
        const spySetIndex = expect.spyOn(testHandlers, 'setIndex');
        ReactDOM.render(
            <Component enabled responses={[{}]} setIndex={testHandlers.setIndex}/>,
            document.getElementById("container")
        );
        ReactDOM.render(
            <Component enabled responses={[{}]} setIndex={testHandlers.setIndex}/>,
            document.getElementById("container")
        );
        expect(spySetIndex.calls.length).toEqual(0);
    });

    it("test identifyLifecycle on close", () => {
        const Component = identifyLifecycle(({onClose = () => {}}) => <div id="test-component" onClick={() => onClose()}></div>);
        const testHandlers = {
            closeIdentify: () => {},
            purgeResults: () => {},
            hideMarker: () => {}
        };
        const spyCloseIdentify = expect.spyOn(testHandlers, 'closeIdentify');
        const spyPurgeResults = expect.spyOn(testHandlers, 'purgeResults');
        const spyHideMarker = expect.spyOn(testHandlers, 'hideMarker');
        ReactDOM.render(
            <Component
                enabled
                responses={[{}]}
                closeIdentify={testHandlers.closeIdentify}
                purgeResults={testHandlers.purgeResults}
                hideMarker={testHandlers.hideMarker}/>,
            document.getElementById("container")
        );

        const testComponent = document.getElementById('test-component');
        TestUtils.Simulate.click(testComponent);
        expect(spyCloseIdentify).toHaveBeenCalled();
        expect(spyPurgeResults).toHaveBeenCalled();
        expect(spyHideMarker).toHaveBeenCalled();
    });

    it("test identifyLifecycle onChangeFormat", () => {
        const testHandlers = {
            onChangeFormat: () => {}
        };
        const spyChangeFormat = expect.spyOn(testHandlers, 'onChangeFormat');
        const Component = identifyLifecycle(({onChangeFormat = () => {}}) => <div id="test-component" onClick={() => onChangeFormat("format")}></div>);
        ReactDOM.render(
            <Component
                enabled
                showCoordinateEditor
                enabledCoordEditorButton
                formatCoord="decimal"
                responses={[{}]}
                onChangeFormat={testHandlers.onChangeFormat}
            />,
            document.getElementById("container")
        );
        const testComponent = document.getElementById('test-component');
        TestUtils.Simulate.click(testComponent);
        expect(spyChangeFormat).toHaveBeenCalled();
    });
    it("test identifyLifecycle onChangeClickPoint", () => {
        const testHandlers = {
            onChangeClickPoint: () => {}
        };
        const spyOnChangeClickPoint = expect.spyOn(testHandlers, 'onChangeClickPoint');
        const Component = identifyLifecycle(({onChangeClickPoint = () => {}}) => <div id="test-component" onClick={() => onChangeClickPoint("lat", "4")}></div>);
        ReactDOM.render(
            <Component
                enabled
                showCoordinateEditor
                enabledCoordEditorButton
                formatCoord="decimal"
                responses={[{}]}
                onChangeClickPoint={testHandlers.onChangeClickPoint}
            />,
            document.getElementById("container")
        );
        const testComponent = document.getElementById('test-component');
        TestUtils.Simulate.click(testComponent);
        expect(spyOnChangeClickPoint).toHaveBeenCalled();
    });


});
