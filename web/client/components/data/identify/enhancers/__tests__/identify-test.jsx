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

    it('test switchControlledIdentify component sends requests on point', () => {
        const Component = identifyLifecycle(() => <div id="test-component"></div>);
        const testHandlers = {
            sendRequest: () => {}
        };

        const spySendRequest = expect.spyOn(testHandlers, 'sendRequest');

        ReactDOM.render(
            <Component
                queryableLayersFilter={() => true}
                enabled layers={[{}, {}]} sendRequest={testHandlers.sendRequest} buildRequest={() => ({url: "myurl"})}
                />,
            document.getElementById("container")
        );
        ReactDOM.render(
            <Component
                queryableLayersFilter={() => true}
                point={{pixel: {x: 1, y: 1}}}
                enabled layers={[{}, {}]} sendRequest={testHandlers.sendRequest} buildRequest={() => ({url: "myurl"})}
                />,
            document.getElementById("container")
        );
        expect(spySendRequest.calls.length).toEqual(2);
    });

    it('test switchControlledIdentify component sends local requess on point if no url is specified', () => {
        const Component = identifyLifecycle(() => <div id="test-component"></div>);
        const testHandlers = {
            sendRequest: () => {}
        };

        const spySendRequest = expect.spyOn(testHandlers, 'sendRequest');

        ReactDOM.render(
            <Component
                queryableLayersFilter={() => true}
                enabled layers={[{}, {}]} localRequest={testHandlers.sendRequest} buildRequest={() => ({url: ""})}
                />,
            document.getElementById("container")
        );
        ReactDOM.render(
            <Component
                queryableLayersFilter={() => true}
                point={{pixel: {x: 1, y: 1}}}
                enabled layers={[{}, {}]} localRequest={testHandlers.sendRequest} buildRequest={() => ({url: ""})}
                />,
            document.getElementById("container")
        );
        expect(spySendRequest.calls.length).toEqual(2);
    });

    it('test switchControlledIdentify component does not send requests on point if disabled', () => {
        const Component = identifyLifecycle(() => <div id="test-component"></div>);
        const testHandlers = {
            sendRequest: () => {}
        };

        const spySendRequest = expect.spyOn(testHandlers, 'sendRequest');

        ReactDOM.render(
            <Component
                queryableLayersFilter={() => true}
                enabled={false} layers={[{}, {}]} sendRequest={testHandlers.sendRequest} buildRequest={() => ({})}
                />,
            document.getElementById("container")
        );
        ReactDOM.render(
            <Component
                queryableLayersFilter={() => true}
                point={{pixel: {x: 1, y: 1}}}
                enabled={false} layers={[{}, {}]} sendRequest={testHandlers.sendRequest} buildRequest={() => ({})}
                />,
            document.getElementById("container")
        );
        expect(spySendRequest.calls.length).toEqual(0);
    });

    it('test switchControlledIdentify component filters layers', () => {
        const Component = identifyLifecycle(() => <div id="test-component"></div>);
        const testHandlers = {
            sendRequest: () => {}
        };

        const spySendRequest = expect.spyOn(testHandlers, 'sendRequest');

        ReactDOM.render(
            <Component
                queryableLayersFilter={(layer) => layer.type === "wms"}
                enabled layers={[{type: "wms"}, {type: "osm"}]} sendRequest={testHandlers.sendRequest} buildRequest={() => ({url: "myurl"})}
                />,
            document.getElementById("container")
        );
        ReactDOM.render(
            <Component
                queryableLayersFilter={(layer) => layer.type === "wms"}
                point={{pixel: {x: 1, y: 1}}}
                enabled layers={[{type: "wms"}, {type: "osm"}]} sendRequest={testHandlers.sendRequest} buildRequest={() => ({url: "myurl"})}
                />,
            document.getElementById("container")
        );
        expect(spySendRequest.calls.length).toEqual(1);
    });

    it('test switchControlledIdentify component shows marker on point', () => {
        const Component = identifyLifecycle(() => <div id="test-component"></div>);
        const testHandlers = {
            showMarker: () => {},
            hideMarker: () => {}
        };

        const spyShowMarker = expect.spyOn(testHandlers, 'showMarker');
        const spyHideMarker = expect.spyOn(testHandlers, 'hideMarker');

        ReactDOM.render(
            <Component
                queryableLayersFilter={() => true}
                enabled layers={[{}, {}]} {...testHandlers} buildRequest={() => ({})}
                />,
            document.getElementById("container")
        );
        ReactDOM.render(
            <Component
                queryableLayersFilter={() => true}
                point={{pixel: {x: 1, y: 1}}}
                enabled layers={[{}, {}]} {...testHandlers} buildRequest={() => ({})}
                />,
            document.getElementById("container")
        );
        expect(spyShowMarker.calls.length).toEqual(1);
        ReactDOM.render(
            <Component
                queryableLayersFilter={() => true}
                point={{pixel: {x: 1, y: 1}}}
                enabled={false} layers={[{}, {}]} {...testHandlers} buildRequest={() => ({})}
                />,
            document.getElementById("container")
        );
        expect(spyHideMarker.calls.length).toEqual(1);
    });

    it('test switchControlledIdentify component no queryable layer', () => {

        const Component = identifyLifecycle(() => <div id="test-component"></div>);
        const testHandlers = {
            noQueryableLayers: () => {}
        };

        const spyNoQueryableLayers = expect.spyOn(testHandlers, 'noQueryableLayers');

        ReactDOM.render(
            <Component
                queryableLayersFilter={() => false}
                enabled layers={[{}, {}]} {...testHandlers} buildRequest={() => ({})}
                />,
            document.getElementById("container")
        );
        ReactDOM.render(
            <Component
                queryableLayersFilter={() => false}
                point={{pixel: {x: 1, y: 1}}}
                enabled layers={[{}, {}]} {...testHandlers} buildRequest={() => ({})}
                />,
            document.getElementById("container")
        );
        expect(spyNoQueryableLayers.calls.length).toEqual(1);
    });

    it('test switchControlledIdentify component purge results on point', () => {

        const Component = identifyLifecycle(() => <div id="test-component"></div>);

        const testHandlers = {
            purgeResults: () => {}
        };

        const spyPurgeResults = expect.spyOn(testHandlers, 'purgeResults');

        ReactDOM.render(
            <Component
                queryableLayersFilter={() => true}
                enabled layers={[{}, {}]} {...testHandlers} buildRequest={() => ({})}
                />,
            document.getElementById("container")
        );
        ReactDOM.render(
            <Component
                queryableLayersFilter={() => true}
                point={{pixel: {x: 1, y: 1}}}
                enabled layers={[{}, {}]} {...testHandlers} buildRequest={() => ({})}
                />,
            document.getElementById("container")
        );
        expect(spyPurgeResults.calls.length).toEqual(1);
        ReactDOM.render(
            <Component
                queryableLayersFilter={() => true}
                point={{pixel: {x: 1, y: 1}}}
                enabled={false} layers={[{}, {}]} {...testHandlers} buildRequest={() => ({})}
                />,
            document.getElementById("container")
        );
        expect(spyPurgeResults.calls.length).toEqual(2);
    });

    it('test switchControlledIdentify component does not purge if multiselection enabled', () => {

        const Component = identifyLifecycle(() => <div id="test-component"></div>);

        const testHandlers = {
            purgeResults: () => {}
        };

        const spyPurgeResults = expect.spyOn(testHandlers, 'purgeResults');

        ReactDOM.render(
            <Component
                queryableLayersFilter={() => true}
                enabled layers={[{}, {}]} {...testHandlers} buildRequest={() => ({})}
                multiSelection
                />,
            document.getElementById("container")
        );
        ReactDOM.render(
            <Component
                queryableLayersFilter={() => true}
                point={{pixel: {x: 1, y: 1}}}
                modifiers={{ctrl: false}}
                enabled layers={[{}, {}]} {...testHandlers} buildRequest={() => ({})}
                multiSelection
                />,
            document.getElementById("container")
        );
        expect(spyPurgeResults.calls.length).toEqual(1);
        ReactDOM.render(
            <Component
                queryableLayersFilter={() => true}
                point={{pixel: {x: 1, y: 1}}}
                modifiers={{ctrl: true}}
                enabled layers={[{}, {}]} {...testHandlers} buildRequest={() => ({})}
                multiSelection
                />,
            document.getElementById("container")
        );
        expect(spyPurgeResults.calls.length).toEqual(1);
    });

    it('test switchControlledIdentify component need refresh with null point', () => {

        const Component = identifyLifecycle(() => <div id="test-component"></div>);
        const testHandlers = {
            purgeResults: () => {}
        };
        const spyPurgeResults = expect.spyOn(testHandlers, 'purgeResults');
        ReactDOM.render(
            <Component enabled point={null} purgeResults={testHandlers.purgeResults}/>,
            document.getElementById("container")
        );
        ReactDOM.render(
            <Component enabled point={{pixel: {x: 1, y: 1}}} purgeResults={testHandlers.purgeResults}/>,
            document.getElementById("container")
        );
        expect(spyPurgeResults.calls.length).toEqual(1);
    });

    it('test switchControlledIdentify component need reset current index on new request', () => {
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
            <Component enabled responses={[{}, {}]} setIndex={testHandlers.setIndex}/>,
            document.getElementById("container")
        );
        expect(spySetIndex.calls.length).toEqual(1);
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

});
