/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');

var React = require('react');
var ReactDOM = require('react-dom');
const ReactTestUtils = require('react-dom/test-utils');
var MeasureDialog = require('../MeasureDialog');


describe("test the MeasureDialog", () => {
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
        let measurement = {};
        const mc = ReactDOM.render(<MeasureDialog show measurement={measurement}/>, document.getElementById("container"));
        expect(mc).toExist();
    });
    it('test close', () => {
        let measurement = {};
        const handlers = {
            onClose() {}
        };
        let spy = expect.spyOn(handlers, "onClose");
        const mc = ReactDOM.render(<MeasureDialog show onClose={handlers.onClose} measurement={measurement}/>, document.getElementById("container"));
        expect(mc).toExist();
        const dom = ReactDOM.findDOMNode(mc);
        const closeBtn = dom.getElementsByClassName('close')[0];
        expect(closeBtn).toExist();
        ReactTestUtils.Simulate.click(closeBtn);
        expect(spy.calls.length).toBe(1);
    });
    it('test default, render a modal', () => {
        let measurement = {};
        const mc = ReactDOM.render(<MeasureDialog show measurement={measurement}/>, document.getElementById("container"));
        expect(mc).toExist();
        const dialog = document.getElementById('measure-dialog');
        expect(dialog).toExist();

    });
    it('test render as side panel', () => {
        let measurement = {};
        const handlers = {
            onMount: () => {},
            onInit: () => {},
            toggleMeasure: () => {}
        };
        let spyMount = expect.spyOn(handlers, "onMount");
        let spyInit = expect.spyOn(handlers, "onInit");
        let spyToggleMeasure = expect.spyOn(handlers, "toggleMeasure");

        const showCoordinateEditor = true;
        const defaultOptions = {showAddAsAnnotation: true};
        const mc = ReactDOM.render(
            <MeasureDialog
                show
                showCoordinateEditor={showCoordinateEditor}
                defaultOptions={defaultOptions}
                onMount={handlers.onMount}
                onInit={handlers.onInit}
                toggleMeasure={handlers.toggleMeasure}
                measurement={measurement}/>, document.getElementById("container"));
        expect(mc).toExist();
        const dom = ReactDOM.findDOMNode(mc);
        const btnGroups = dom.getElementsByClassName('btn-group');
        expect(btnGroups.length).toBe(3);

        const dialog = document.getElementById('measure-dialog');
        expect(dialog).toNotExist();
        expect(spyMount.calls.length).toBe(1);
        expect(spyMount).toHaveBeenCalledWith(showCoordinateEditor);
        expect(spyToggleMeasure.calls.length).toBe(1);
        expect(spyToggleMeasure).toHaveBeenCalledWith({geomType: "LineString"});
        expect(spyInit.calls.length).toBe(1);
        expect(spyInit).toHaveBeenCalledWith(defaultOptions);
    });

    it('test render as side panel with Bearing as default tool', () => {
        let measurement = {};
        const handlers = {
            onMount: () => {},
            onInit: () => {},
            toggleMeasure: () => {}
        };
        let spyMount = expect.spyOn(handlers, "onMount");
        let spyInit = expect.spyOn(handlers, "onInit");
        let spyToggleMeasure = expect.spyOn(handlers, "toggleMeasure");

        const showCoordinateEditor = true;
        const defaultOptions = {
            showAddAsAnnotation: true,
            geomType: "Bearing",
            bearingMeasureEnabled: true};
        const mc = ReactDOM.render(
            <MeasureDialog
                show
                showCoordinateEditor={showCoordinateEditor}
                defaultOptions={defaultOptions}
                onMount={handlers.onMount}
                onInit={handlers.onInit}
                toggleMeasure={handlers.toggleMeasure}
                measurement={measurement}/>, document.getElementById("container"));
        expect(mc).toExist();
        const dom = ReactDOM.findDOMNode(mc);
        const btnGroups = dom.getElementsByClassName('btn-group');
        expect(btnGroups.length).toBe(3);

        const dialog = document.getElementById('measure-dialog');
        expect(dialog).toNotExist();
        expect(spyMount.calls.length).toBe(1);
        expect(spyToggleMeasure.calls.length).toBe(1);
        expect(spyToggleMeasure).toHaveBeenCalledWith({geomType: "Bearing"});
        expect(spyInit.calls.length).toBe(1);
        expect(spyInit).toHaveBeenCalledWith(defaultOptions);
    });

    it('test render as modal with Bearing as default tool', () => {
        let measurement = {};
        const handlers = {
            onMount: () => {},
            onInit: () => {},
            toggleMeasure: () => {}
        };
        let spyMount = expect.spyOn(handlers, "onMount");
        let spyInit = expect.spyOn(handlers, "onInit");
        let spyToggleMeasure = expect.spyOn(handlers, "toggleMeasure");

        const defaultOptions = {
            showAddAsAnnotation: true,
            geomType: "Bearing",
            bearingMeasureEnabled: true,
            trueBearing: { measureTrueBearing: true, fractionDigits: 0}
        };
        const mc = ReactDOM.render(
            <MeasureDialog
                show
                showCoordinateEditor={false}
                defaultOptions={defaultOptions}
                onMount={handlers.onMount}
                onInit={handlers.onInit}
                toggleMeasure={handlers.toggleMeasure}
                measurement={measurement}/>, document.getElementById("container"));
        expect(mc).toExist();
        const dom = ReactDOM.findDOMNode(mc);
        const btnGroups = dom.getElementsByClassName('btn-group');
        expect(btnGroups.length).toBe(3);

        const dialog = document.getElementById('measure-dialog');
        expect(dialog).toExist();
        expect(spyMount.calls.length).toBe(1);
        expect(spyToggleMeasure.calls.length).toBe(1);
        expect(spyToggleMeasure).toHaveBeenCalledWith({geomType: "Bearing"});
        expect(spyInit.calls.length).toBe(1);
        expect(spyInit).toHaveBeenCalledWith(defaultOptions);
    });

    it('should trigger onInit if defaultOptions are updated', () => {
        const handler = {
            onInit: () => {}
        };
        const spyInit = expect.spyOn(handler, "onInit");
        const measurement = {};
        ReactDOM.render(
            <MeasureDialog
                show
                onInit={handler.onInit}
                defaultOptions={{showAddAsAnnotation: true}}
                measurement={measurement}/>, document.getElementById("container"));
        expect(spyInit.calls.length).toBe(1);
        ReactDOM.render(
            <MeasureDialog
                show
                onInit={handler.onInit}
                defaultOptions={{showAddAsAnnotation: false}}
                measurement={measurement}/>, document.getElementById("container"));
        expect(spyInit.calls.length).toBe(2);
    });
});
