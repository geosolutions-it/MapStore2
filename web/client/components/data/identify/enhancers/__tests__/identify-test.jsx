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
const {identifyLifecycle} = require('../identify');
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

    it('test identifyLifecycle component changes mousepointer on enable / disable', () => {

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

    it("test identifyLifecycle component doesn't need reset current index when requests are the same", () => {
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
            purgeResults: () => {}
        };
        const spyCloseIdentify = expect.spyOn(testHandlers, 'closeIdentify');
        const spyPurgeResults = expect.spyOn(testHandlers, 'purgeResults');
        ReactDOM.render(
            <Component
                enabled
                responses={[{}]}
                closeIdentify={testHandlers.closeIdentify}
                purgeResults={testHandlers.purgeResults}/>,
            document.getElementById("container")
        );

        const testComponent = document.getElementById('test-component');
        TestUtils.Simulate.click(testComponent);
        expect(spyCloseIdentify).toHaveBeenCalled();
        expect(spyPurgeResults).toHaveBeenCalled();
    });
    it("test reset on unmount", () => {
        const Component = identifyLifecycle(({ onClose = () => { } }) => <div id="test-component" onClick={() => onClose()}></div>);
        const testHandlers = {
            changeMousePointer: () => { },
            purgeResults: () => { },
            hideMarker: () => { }
        };
        const spyChangeMousePointer = expect.spyOn(testHandlers, 'changeMousePointer');
        const spyPurgeResults = expect.spyOn(testHandlers, 'purgeResults');
        const spyHideMarker = expect.spyOn(testHandlers, 'hideMarker');
        ReactDOM.render(
            <Component
                enabled
                responses={[{}]}
                changeMousePointer={testHandlers.changeMousePointer}
                purgeResults={testHandlers.purgeResults}
                hideMarker={testHandlers.hideMarker} />,
            document.getElementById("container")
        );

        ReactDOM.render(<div></div>, document.getElementById("container"));
        // this ensure that when the is un-mounted, the cursor of the mouse pointer, the marker and result are correctly reset.
        expect(spyChangeMousePointer).toHaveBeenCalled();
        expect(spyChangeMousePointer.calls.length).toBe(2);
        expect(spyChangeMousePointer.calls[0].arguments[0]).toBe('pointer'); // cursor change on mount
        expect(spyChangeMousePointer.calls[1].arguments[0]).toBe('auto'); // this is the reset on unmount
        expect(spyPurgeResults).toHaveBeenCalled();
        expect(spyPurgeResults.calls.length).toBe(1);
        expect(spyHideMarker).toHaveBeenCalled();
        expect(spyHideMarker.calls.length).toBe(1);
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
    it("test identifyLifecycle onSubmitClickPoint", () => {
        const testHandlers = {
            onSubmitClickPoint: () => {}
        };
        const spyOnSubmitClickPoint = expect.spyOn(testHandlers, 'onSubmitClickPoint');
        const Component = identifyLifecycle(({onSubmitClickPoint = () => {}}) => <div id="test-component" onClick={() => onSubmitClickPoint({lat: "4", lon: "4"})}></div>);
        ReactDOM.render(
            <Component
                enabled
                showCoordinateEditor
                enabledCoordEditorButton
                formatCoord="decimal"
                responses={[{}]}
                onSubmitClickPoint={testHandlers.onSubmitClickPoint}
            />,
            document.getElementById("container")
        );
        const testComponent = document.getElementById('test-component');
        TestUtils.Simulate.click(testComponent);
        expect(spyOnSubmitClickPoint).toHaveBeenCalled();
    });
});
