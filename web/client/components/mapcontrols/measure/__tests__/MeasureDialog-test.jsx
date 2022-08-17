/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';

import MeasureDialog from '../MeasureDialog';

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
        expect(mc).toBeTruthy();
    });
    it('test default, render a modal', () => {
        let measurement = {};
        const mc = ReactDOM.render(<MeasureDialog show measurement={measurement}/>, document.getElementById("container"));
        expect(mc).toBeTruthy();
        const dialog = document.getElementById('measure-panel');
        expect(dialog).toBeTruthy();

    });
    it('test render as side panel', () => {
        let measurement = {};
        const handlers = {
            onMount: () => {},
            toggleMeasure: () => {}
        };
        let spyMount = expect.spyOn(handlers, "onMount");
        let spyToggleMeasure = expect.spyOn(handlers, "toggleMeasure");

        const showCoordinateEditor = true;
        const defaultOptions = {showAddAsAnnotation: true};
        const mc = ReactDOM.render(
            <MeasureDialog
                show
                showCoordinateEditor={showCoordinateEditor}
                defaultOptions={defaultOptions}
                onMount={handlers.onMount}
                toggleMeasure={handlers.toggleMeasure}
                measurement={measurement}/>, document.getElementById("container"));
        expect(mc).toBeTruthy();
        const dom = ReactDOM.findDOMNode(mc);
        const btnGroups = dom.getElementsByClassName('btn-group');
        expect(btnGroups.length).toBe(3);

        const dialog = document.getElementById('measure-container');
        expect(dialog).toBeTruthy();
        expect(spyMount.calls.length).toBe(1);
        expect(spyMount).toHaveBeenCalledWith(showCoordinateEditor);
        expect(spyToggleMeasure.calls.length).toBe(1);
        expect(spyToggleMeasure).toHaveBeenCalledWith({geomType: "LineString"});
    });

    it('test render as side panel with Bearing as default tool', () => {
        let measurement = {};
        const handlers = {
            onMount: () => {},
            toggleMeasure: () => {}
        };
        let spyMount = expect.spyOn(handlers, "onMount");
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
        expect(mc).toBeTruthy();
        const dom = ReactDOM.findDOMNode(mc);
        const btnGroups = dom.getElementsByClassName('btn-group');
        expect(btnGroups.length).toBe(3);

        const dialog = document.getElementById('measure-container');
        expect(dialog).toBeTruthy();
        expect(spyMount.calls.length).toBe(1);
        expect(spyToggleMeasure.calls.length).toBe(1);
        expect(spyToggleMeasure).toHaveBeenCalledWith({geomType: "Bearing"});
    });

    it('test render as modal with Bearing as default tool', () => {
        let measurement = {};
        const handlers = {
            onMount: () => {},
            toggleMeasure: () => {}
        };
        let spyMount = expect.spyOn(handlers, "onMount");
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
        expect(mc).toBeTruthy();
        const dom = ReactDOM.findDOMNode(mc);
        const btnGroups = dom.getElementsByClassName('btn-group');
        expect(btnGroups.length).toBe(3);

        const dialog = document.getElementById('measure-panel');
        expect(dialog).toBeTruthy();
        expect(spyMount.calls.length).toBe(1);
        expect(spyToggleMeasure.calls.length).toBe(1);
        expect(spyToggleMeasure).toHaveBeenCalledWith({geomType: "Bearing"});
    });
});
