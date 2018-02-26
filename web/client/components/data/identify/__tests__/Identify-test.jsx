/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');

const Identify = require('../Identify.jsx');
const TestUtils = require('react-dom/test-utils');
const expect = require('expect');

describe('Identify', () => {

    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('creates the Identify component with defaults', () => {
        const identify = ReactDOM.render(
            <Identify/>,
            document.getElementById("container")
        );

        expect(identify).toExist();
    });

    it('creates the Identify component with available requests', () => {
        const identify = ReactDOM.render(
            <Identify enabled requests={[{}]}/>,
            document.getElementById("container")
        );

        expect(identify).toExist();
        const dom = ReactDOM.findDOMNode(identify);
        expect(dom.parentNode.getElementsByClassName('info-panel').length).toBe(1);
    });

    it('creates the Identify component with missing responses', () => {
        const identify = ReactDOM.render(
            <Identify enabled requests={[{}]}/>,
            document.getElementById("container")
        );

        expect(identify).toExist();
        const dom = ReactDOM.findDOMNode(identify);
        expect(dom.getElementsByClassName('spinner').length).toBe(1);
    });

    it('creates the Identify component with no missing responses', () => {
        const identify = ReactDOM.render(
            <Identify enabled requests={[{}]} responses={[{}]}/>,
            document.getElementById("container")
        );

        expect(identify).toExist();
        const dom = ReactDOM.findDOMNode(identify);
        expect(dom.getElementsByClassName('spinner').length).toBe(0);
    });

    it('creates the Identify component changes mousepointer on enable / disable', () => {

        const testHandlers = {
            changeMousePointer: () => {}
        };

        const spyMousePointer = expect.spyOn(testHandlers, 'changeMousePointer');

        ReactDOM.render(
            <Identify changeMousePointer={testHandlers.changeMousePointer}/>,
            document.getElementById("container")
        );
        ReactDOM.render(
            <Identify changeMousePointer={testHandlers.changeMousePointer} enabled/>,
            document.getElementById("container")
        );
        expect(spyMousePointer.calls.length).toEqual(1);
        ReactDOM.render(
            <Identify changeMousePointer={testHandlers.changeMousePointer} enabled={false}/>,
            document.getElementById("container")
        );
        expect(spyMousePointer.calls.length).toEqual(2);
    });

    it('creates the Identify component sends requests on point', () => {
        const testHandlers = {
            sendRequest: () => {}
        };

        const spySendRequest = expect.spyOn(testHandlers, 'sendRequest');

        ReactDOM.render(
            <Identify
                queryableLayersFilter={() => true}
                enabled layers={[{}, {}]} sendRequest={testHandlers.sendRequest} buildRequest={() => ({url: "myurl"})}
                />,
            document.getElementById("container")
        );
        ReactDOM.render(
            <Identify
                queryableLayersFilter={() => true}
                point={{pixel: {x: 1, y: 1}}}
                enabled layers={[{}, {}]} sendRequest={testHandlers.sendRequest} buildRequest={() => ({url: "myurl"})}
                />,
            document.getElementById("container")
        );
        expect(spySendRequest.calls.length).toEqual(2);
    });

    it('creates the Identify component sends local requess on point if no url is specified', () => {
        const testHandlers = {
            sendRequest: () => {}
        };

        const spySendRequest = expect.spyOn(testHandlers, 'sendRequest');

        ReactDOM.render(
            <Identify
                queryableLayersFilter={() => true}
                enabled layers={[{}, {}]} localRequest={testHandlers.sendRequest} buildRequest={() => ({url: ""})}
                />,
            document.getElementById("container")
        );
        ReactDOM.render(
            <Identify
                queryableLayersFilter={() => true}
                point={{pixel: {x: 1, y: 1}}}
                enabled layers={[{}, {}]} localRequest={testHandlers.sendRequest} buildRequest={() => ({url: ""})}
                />,
            document.getElementById("container")
        );
        expect(spySendRequest.calls.length).toEqual(2);
    });

    it('creates the Identify component does not send requests on point if disabled', () => {
        const testHandlers = {
            sendRequest: () => {}
        };

        const spySendRequest = expect.spyOn(testHandlers, 'sendRequest');

        ReactDOM.render(
            <Identify
                queryableLayersFilter={() => true}
                enabled={false} layers={[{}, {}]} sendRequest={testHandlers.sendRequest} buildRequest={() => ({})}
                />,
            document.getElementById("container")
        );
        ReactDOM.render(
            <Identify
                queryableLayersFilter={() => true}
                point={{pixel: {x: 1, y: 1}}}
                enabled={false} layers={[{}, {}]} sendRequest={testHandlers.sendRequest} buildRequest={() => ({})}
                />,
            document.getElementById("container")
        );
        expect(spySendRequest.calls.length).toEqual(0);
    });

    it('creates the Identify component filters layers', () => {
        const testHandlers = {
            sendRequest: () => {}
        };

        const spySendRequest = expect.spyOn(testHandlers, 'sendRequest');

        ReactDOM.render(
            <Identify
                queryableLayersFilter={(layer) => layer.type === "wms"}
                enabled layers={[{type: "wms"}, {type: "osm"}]} sendRequest={testHandlers.sendRequest} buildRequest={() => ({url: "myurl"})}
                />,
            document.getElementById("container")
        );
        ReactDOM.render(
            <Identify
                queryableLayersFilter={(layer) => layer.type === "wms"}
                point={{pixel: {x: 1, y: 1}}}
                enabled layers={[{type: "wms"}, {type: "osm"}]} sendRequest={testHandlers.sendRequest} buildRequest={() => ({url: "myurl"})}
                />,
            document.getElementById("container")
        );
        expect(spySendRequest.calls.length).toEqual(1);
    });

    it('creates the Identify component shows marker on point', () => {
        const testHandlers = {
            showMarker: () => {},
            hideMarker: () => {}
        };

        const spyShowMarker = expect.spyOn(testHandlers, 'showMarker');
        const spyHideMarker = expect.spyOn(testHandlers, 'hideMarker');

        ReactDOM.render(
            <Identify
                queryableLayersFilter={() => true}
                enabled layers={[{}, {}]} {...testHandlers} buildRequest={() => ({})}
                />,
            document.getElementById("container")
        );
        ReactDOM.render(
            <Identify
                queryableLayersFilter={() => true}
                point={{pixel: {x: 1, y: 1}}}
                enabled layers={[{}, {}]} {...testHandlers} buildRequest={() => ({})}
                />,
            document.getElementById("container")
        );
        expect(spyShowMarker.calls.length).toEqual(1);
        ReactDOM.render(
            <Identify
                queryableLayersFilter={() => true}
                point={{pixel: {x: 1, y: 1}}}
                enabled={false} layers={[{}, {}]} {...testHandlers} buildRequest={() => ({})}
                />,
            document.getElementById("container")
        );
        expect(spyHideMarker.calls.length).toEqual(1);
    });

    it('creates the Identify component no queryable layer', () => {
        const testHandlers = {
            noQueryableLayers: () => {}
        };

        const spyNoQueryableLayers = expect.spyOn(testHandlers, 'noQueryableLayers');

        ReactDOM.render(
            <Identify
                queryableLayersFilter={() => false}
                enabled layers={[{}, {}]} {...testHandlers} buildRequest={() => ({})}
                />,
            document.getElementById("container")
        );
        ReactDOM.render(
            <Identify
                queryableLayersFilter={() => false}
                point={{pixel: {x: 1, y: 1}}}
                enabled layers={[{}, {}]} {...testHandlers} buildRequest={() => ({})}
                />,
            document.getElementById("container")
        );
        expect(spyNoQueryableLayers.calls.length).toEqual(1);
    });

    it('creates the Identify component purge results on point', () => {
        const testHandlers = {
            purgeResults: () => {}
        };

        const spyPurgeResults = expect.spyOn(testHandlers, 'purgeResults');

        ReactDOM.render(
            <Identify
                queryableLayersFilter={() => true}
                enabled layers={[{}, {}]} {...testHandlers} buildRequest={() => ({})}
                />,
            document.getElementById("container")
        );
        ReactDOM.render(
            <Identify
                queryableLayersFilter={() => true}
                point={{pixel: {x: 1, y: 1}}}
                enabled layers={[{}, {}]} {...testHandlers} buildRequest={() => ({})}
                />,
            document.getElementById("container")
        );
        expect(spyPurgeResults.calls.length).toEqual(1);
        ReactDOM.render(
            <Identify
                queryableLayersFilter={() => true}
                point={{pixel: {x: 1, y: 1}}}
                enabled={false} layers={[{}, {}]} {...testHandlers} buildRequest={() => ({})}
                />,
            document.getElementById("container")
        );
        expect(spyPurgeResults.calls.length).toEqual(2);
    });

    it('creates the Identify component does not purge if multiselection enabled', () => {
        const testHandlers = {
            purgeResults: () => {}
        };

        const spyPurgeResults = expect.spyOn(testHandlers, 'purgeResults');

        ReactDOM.render(
            <Identify
                queryableLayersFilter={() => true}
                enabled layers={[{}, {}]} {...testHandlers} buildRequest={() => ({})}
                multiSelection
                />,
            document.getElementById("container")
        );
        ReactDOM.render(
            <Identify
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
            <Identify
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

    it('creates the Identify component uses custom viewer', () => {
        const Viewer = (props) => <span className="myviewer">{props.responses.length}</span>;
        const identify = ReactDOM.render(
            <Identify
                queryableLayersFilter={() => true}
                viewer={Viewer}
                requests={[{}]}
                enabled layers={[{}, {}]} responses={[{}, {}]} buildRequest={() => ({})}
                />,
            document.getElementById("container")
        );
        const dom = ReactDOM.findDOMNode(identify);
        const viewer = dom.getElementsByClassName("myviewer");
        expect(viewer.length).toBe(1);
        expect(viewer[0].innerHTML).toBe('2');
    });

    it('test options and parameters filtering', () => {
        const Viewer = (props) => <span className="myviewer">{props.responses.length}</span>;
        const layer = {
            INTERNAL_OPTION: true,
            WMS_OPTION: true,
            params: {
                ONLY_GETMAP: true,
                WMS_PARAMETER_TO_SHARE: true
            }};
        const identify = ReactDOM.render(
            <Identify
                excludeParams={["ONLY_GETMAP"]}
                includeOptions={["WMS_PARAMETER_TO_SHARE", "WMS_OPTION"]}
                enableRevGeocode
                queryableLayersFilter={() => true}
                point={{latlng: {lat: 40, lng: 10}}}
                viewer={Viewer}
                enabled
                layers={[layer]}
                sendRequest={[{}, {}]}
                buildRequest={() => ({})}
                requests={[{}]}
                reverseGeocodeData={{display_name: "test"}} />,
            document.getElementById("container")
        );
        expect(identify).toExist();
        let params = identify.filterRequestParams(layer);
        expect(params).toExist();
        expect(params.ONLY_GETMAP).toNotExist();
        expect(params.INTERNAL_OPTION).toNotExist();
        expect(params.WMS_PARAMETER_TO_SHARE).toBe(true);
        expect(params.WMS_OPTION).toBe(true);

    });

    it('test need refresh with null point', () => {
        const identify = ReactDOM.render(
            <Identify point={null}/>,
            document.getElementById("container")
        );
        expect(identify).toExist();
        expect(identify.needsRefresh({ enabled: true, point: { pixel: {x: 0, y: 0}}})).toBe(true);
    });

    it('test click/touch on header fullscreen false', () => {
        const identify = ReactDOM.render(
            <Identify enabled requests={[{}]} responses={[{}]}/>,
            document.getElementById("container")
        );
        expect(identify).toExist();
        const arrow = document.getElementsByClassName('m-fullscreen-btn');
        expect(arrow.length).toBe(0);
    });

    it('test click/touch on header fullscreen true', () => {
        const identify = ReactDOM.render(
            <Identify fullscreen enabled requests={[{}]} responses={[{}]}/>,
            document.getElementById("container")
        );
        expect(identify).toExist();
        const arrow = document.getElementsByClassName('m-fullscreen-btn');
        expect(arrow.length).toBe(1);
        TestUtils.Simulate.click(arrow[0]);
        expect(document.getElementsByClassName('fullscreen').length).toBe(1);
        TestUtils.Simulate.click(arrow[0]);
        expect(document.getElementsByClassName('fullscreen').length).toBe(0);
    });
});
