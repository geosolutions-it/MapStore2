/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import expect from 'expect';
import assign from 'object-assign';
import React from 'react';
import {DragDropContext as dragDropContext} from 'react-dnd';
import testBackend from 'react-dnd-test-backend';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';

import Message from '../../../I18N/Message';
import MeasureComponentComp from '../MeasureComponent';

const MeasureComponent = dragDropContext(testBackend)(MeasureComponentComp);

describe("test the MeasureComponent", () => {
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
        const mc = ReactDOM.render(<MeasureComponent measurement={measurement}/>, document.getElementById("container"));
        expect(mc).toExist();
    });

    it('test creation of button UIs ', () => {
        let measurement = {};
        const mc = ReactDOM.render(<MeasureComponent useButtonGroup measurement={measurement}/>, document.getElementById("container"));
        expect(mc).toExist();
        const domNode = ReactDOM.findDOMNode(mc);
        expect(domNode).toExist();
        const domButtons = domNode.getElementsByTagName('button');
        expect(domButtons).toExist();
        expect(domButtons.length).toBe(4);
    });


    it('test creation of measurement result panel UI ', () => {
        let measurement = {};
        const mc = ReactDOM.render(<MeasureComponent measurement={measurement}/>, document.getElementById("container"));
        expect(mc).toExist();
        const domNode = ReactDOM.findDOMNode(mc);
        expect(domNode).toExist();
        const domResultPanel = document.getElementById('measure-result-panel');
        expect(domResultPanel).toExist();
    });

    it('test line activation', () => {
        let newMeasureState;
        let measurement = {
            geomType: null
        };
        const cmp = ReactDOM.render(
            <MeasureComponent
                measurement={measurement}
                geomType={'Polygon'}
                toggleMeasure={(data) => {
                    newMeasureState = data;
                }}
                lineMeasureEnabled={false} />, document.getElementById("container")
        );
        expect(cmp).toExist();

        const cmpDom = ReactDOM.findDOMNode(cmp);
        expect(cmpDom).toExist();

        const buttons = cmpDom.getElementsByTagName('button');
        expect(buttons.length).toBe(4);

        const lineBtn = buttons.item(0);
        lineBtn.click();

        expect(newMeasureState).toExist();
        expect(newMeasureState.geomType).toBe('LineString');
    });

    it('test area activation', () => {
        let newMeasureState;
        let measurement = {
            geomType: null
        };
        const cmp = ReactDOM.render(
            <MeasureComponent
                measurement={measurement}
                toggleMeasure={(data) => {
                    newMeasureState = data;
                }}
                areaMeasureEnabled={false} />, document.getElementById("container")
        );
        expect(cmp).toExist();

        const cmpDom = ReactDOM.findDOMNode(cmp);
        expect(cmpDom).toExist();

        const buttons = cmpDom.getElementsByTagName('button');
        expect(buttons.length).toBe(4);

        const areaBtn = buttons.item(1);
        areaBtn.click();

        expect(newMeasureState).toExist();
        expect(newMeasureState.geomType).toBe('Polygon');
    });

    it('test bearing activation', () => {
        let newMeasureState;
        let measurement = {
            geomType: null
        };
        const cmp = ReactDOM.render(
            <MeasureComponent
                measurement={measurement}
                toggleMeasure={(data) => {
                    newMeasureState = data;
                }}
                bearingMeasureEnabled={false} />, document.getElementById("container")
        );
        expect(cmp).toExist();

        const cmpDom = ReactDOM.findDOMNode(cmp);
        expect(cmpDom).toExist();

        const buttons = cmpDom.getElementsByTagName('button');
        expect(buttons.length).toBe(4);

        const bearingBtn = buttons.item(2);
        bearingBtn.click();

        expect(newMeasureState).toExist();
        expect(newMeasureState.geomType).toBe('Bearing');
    });

    it('test measurements resetting', () => {
        let newMeasureState;
        let measurement = {
            geomType: 'Bearing'
        };
        const cmp = ReactDOM.render(
            <MeasureComponent
                measurement={measurement}
                toggleMeasure={(data) => {
                    newMeasureState = data;
                }}
                withReset
            />, document.getElementById("container")
        );
        expect(cmp).toExist();

        const cmpDom = ReactDOM.findDOMNode(cmp);
        expect(cmpDom).toExist();

        const buttons = cmpDom.getElementsByTagName('button');
        expect(buttons.length).toBe(4);

        const resetBtn = buttons.item(3);

        // Dectivate
        resetBtn.click();

        expect(newMeasureState).toExist();
        expect(newMeasureState.geomType).toBe(null);
    });

    it('test bearing format', () => {
        let measurement = {
            lineMeasureEnabled: false,
            areaMeasureEnabled: false,
            bearingMeasureEnabled: true,
            geomType: 'LineString',
            len: 0,
            area: 0,
            bearing: 0
        };
        let cmp = ReactDOM.render(
            <MeasureComponent measurement={measurement} bearingMeasureEnabled bearingMeasureValueEnabled/>, document.getElementById("container")
        );
        expect(cmp).toExist();

        const bearingSpan = document.getElementById('measure-bearing-res');
        expect(bearingSpan).toExist();

        cmp = ReactDOM.render(
            <MeasureComponent measurement={{...measurement, bearing: 45}} bearingMeasureEnabled bearingMeasureValueEnabled/>, document.getElementById("container")
        );
        expect(bearingSpan.innerHTML).toBe("<h3><strong>N 45° 0' 0'' E</strong></h3>");

        cmp = ReactDOM.render(
            <MeasureComponent measurement={assign({}, measurement, {bearing: 135})} bearingMeasureEnabled bearingMeasureValueEnabled/>, document.getElementById("container")
        );
        expect(bearingSpan.innerHTML).toBe("<h3><strong>S 45° 0' 0'' E</strong></h3>");

        cmp = ReactDOM.render(
            <MeasureComponent measurement={assign({}, measurement, {bearing: 225})} bearingMeasureEnabled bearingMeasureValueEnabled/>, document.getElementById("container")
        );
        expect(bearingSpan.innerHTML).toBe("<h3><strong>S 45° 0' 0'' W</strong></h3>");

        cmp = ReactDOM.render(
            <MeasureComponent measurement={assign({}, measurement, {bearing: 315})} bearingMeasureEnabled bearingMeasureValueEnabled/>, document.getElementById("container")
        );
        expect(bearingSpan.innerHTML).toBe("<h3><strong>N 45° 0' 0'' W</strong></h3>");
    });

    it('test true bearing format', () => {
        let measurement = {
            lineMeasureEnabled: false,
            areaMeasureEnabled: false,
            bearingMeasureEnabled: true,
            trueBearing: { measureTrueBearing: true, fractionDigits: 0},
            geomType: 'LineString',
            len: 0,
            area: 0,
            bearing: 0
        };
        let cmp = ReactDOM.render(
            <MeasureComponent measurement={measurement} bearingMeasureEnabled bearingMeasureValueEnabled/>, document.getElementById("container")
        );
        expect(cmp).toExist();

        const bearingSpan = document.getElementById('measure-bearing-res');
        expect(bearingSpan).toExist();

        const bearingTitle = TestUtils.findRenderedDOMComponentWithClass(cmp, 'form-group');
        expect(bearingTitle.textContent).toContain('trueBearingLabel');

        cmp = ReactDOM.render(
            <MeasureComponent measurement={{...measurement, bearing: 45}} bearingMeasureEnabled bearingMeasureValueEnabled trueBearingLabel = {<Message msgId="True Bearing"/>}/>, document.getElementById("container")
        );
        expect(bearingSpan.innerHTML).toBe("<h3><strong>045°</strong></h3>");

        const bearingTitleText = TestUtils.findRenderedDOMComponentWithClass(cmp, 'form-group');
        expect(bearingTitleText.textContent).toContain('True Bearing');

        cmp = ReactDOM.render(
            <MeasureComponent measurement={{...measurement, bearing: 135.235648, trueBearing: {...measurement.trueBearing, fractionDigits: 4}}} bearingMeasureEnabled bearingMeasureValueEnabled/>, document.getElementById("container")
        );
        expect(bearingSpan.innerHTML).toBe("<h3><strong>135.2356°</strong></h3>");

        cmp = ReactDOM.render(
            <MeasureComponent measurement={{...measurement, bearing: 225.83202, trueBearing: {...measurement.trueBearing, fractionDigits: 2}}} bearingMeasureEnabled bearingMeasureValueEnabled/>, document.getElementById("container")
        );
        expect(bearingSpan.innerHTML).toBe("<h3><strong>225.83°</strong></h3>");

        cmp = ReactDOM.render(
            <MeasureComponent measurement={assign({}, measurement, {bearing: 315})} bearingMeasureEnabled bearingMeasureValueEnabled/>, document.getElementById("container")
        );
        expect(bearingSpan.innerHTML).toBe("<h3><strong>315°</strong></h3>");
    });

    it('test uom format area and lenght', () => {
        let measurement = {
            lineMeasureEnabled: false,
            areaMeasureEnabled: false,
            bearingMeasureEnabled: false,
            geomType: 'LineString',
            len: 0,
            area: 0,
            bearing: 0
        };
        let cmp = ReactDOM.render(
            <MeasureComponent
                uom={{
                    length: {unit: 'km', label: 'km'},
                    area: {unit: 'sqkm', label: 'km²'}
                }}
                measurement={measurement}
                lineMeasureEnabled
                lineMeasureValueEnabled
            />, document.getElementById("container")
        );
        expect(cmp).toExist();

        const lenSpan = document.getElementById('measure-len-res');
        expect(lenSpan).toExist();

        let testDiv = document.createElement("div");
        document.body.appendChild(testDiv);

        cmp = ReactDOM.render(
            <MeasureComponent
                lengthLabel="Length"
                lineMeasureEnabled
                lineMeasureValueEnabled
                uom={{
                    length: {unit: 'km', label: 'km'},
                    area: {unit: 'sqkm', label: 'km²'}
                }}
                measurement={assign({}, measurement, {len: 10000})}/>, document.getElementById("container")
        );
        expect(lenSpan.firstChild.firstChild.firstChild.innerHTML).toBe("10");

        cmp = ReactDOM.render(
            <MeasureComponent
                areaMeasureEnabled
                areaMeasureValueEnabled
                uom={{
                    length: {unit: 'km', label: 'km'},
                    area: {unit: 'sqkm', label: 'km²'}
                }} measurement={assign({}, measurement, {geomType: 'Polygon', area: 1000000})}/>, document.getElementById("container")
        );
        const areaSpan = document.getElementById('measure-area-res');
        expect(areaSpan).toExist();
        expect(areaSpan.firstChild.firstChild.firstChild.innerHTML).toBe("1");
    });

    it('test showing coordinate editor', () => {
        let measurement = {
            lineMeasureEnabled: true,
            areaMeasureEnabled: false,
            bearingMeasureEnabled: false,
            geomType: 'LineString',
            feature: {
                type: "Feature",
                geometry: {
                    type: "LineString",
                    coordinates: [[1, 2], [2, 5]]
                },
                properties: {}
            },
            len: 0,
            area: 0,
            bearing: 0
        };
        let cmp = ReactDOM.render(
            <MeasureComponent
                uom={{
                    length: {unit: 'km', label: 'km'},
                    area: {unit: 'sqkm', label: 'km²'}
                }}
                measurement={measurement}
                showCoordinateEditor
                format="decimal"
                isDraggable
                useSingleFeature
                lineMeasureEnabled
            />, document.getElementById("container")
        );
        expect(cmp).toExist();
        const coordEditorPanel = TestUtils.findRenderedDOMComponentWithClass(cmp, 'ms2-border-layout-body');
        expect(coordEditorPanel).toExist();
        const coordinateRows = TestUtils.scryRenderedDOMComponentsWithClass(cmp, 'coordinateRow');
        const submits = TestUtils.scryRenderedDOMComponentsWithClass(cmp, "glyphicon-ok");
        const isValid = TestUtils.scryRenderedDOMComponentsWithClass(cmp, "glyphicon-ok-sign");
        const isInValid = TestUtils.scryRenderedDOMComponentsWithClass(cmp, "glyphicon-exclamation-mark");
        expect(isValid).toExist();
        expect(coordinateRows.length).toBe(2);
        expect(isValid.length).toBe(1);
        expect(submits.length).toBe(2);
        expect(isInValid.length).toBe(0);
    });

    it('rendering a coordinate editor for Polygons with 4 empty rows', () => {
        let measurement = {
            lineMeasureEnabled: false,
            areaMeasureEnabled: true,
            bearingMeasureEnabled: false,
            geomType: 'Polygon',
            feature: {
                type: "Feature",
                geometry: {
                    type: "Polygon",
                    coordinates: [[["", ""], ["", ""], ["", ""], ["", ""]]]
                },
                properties: {}
            },
            len: 0,
            area: 0,
            bearing: 0
        };
        let cmp = ReactDOM.render(
            <MeasureComponent
                uom={{
                    length: {unit: 'km', label: 'km'},
                    area: {unit: 'sqkm', label: 'km²'}
                }}
                measurement={measurement}
                useSingleFeature
                showCoordinateEditor
                format="decimal"
                isDraggable
                areaMeasureEnabled
            />, document.getElementById("container")
        );
        expect(cmp).toExist();
        const coordEditorPanel = TestUtils.findRenderedDOMComponentWithClass(cmp, 'ms2-border-layout-body');
        const coordinateRows = TestUtils.scryRenderedDOMComponentsWithClass(cmp, 'coordinateRow');
        expect(coordEditorPanel).toExist();
        const submits = TestUtils.scryRenderedDOMComponentsWithClass(cmp, "glyphicon-ok");
        const isValid = TestUtils.scryRenderedDOMComponentsWithClass(cmp, "glyphicon-ok-sign");
        const isInValid = TestUtils.scryRenderedDOMComponentsWithClass(cmp, "glyphicon-exclamation-mark");
        expect(isValid).toExist();
        expect(coordinateRows.length).toBe(4);
        expect(isValid.length).toBe(0);
        expect(submits.length).toBe(4);
        expect(isInValid.length).toBe(1);

    });

    it('test showing measurement from annotation', () => {
        let measurement = {
            lineMeasureEnabled: true,
            areaMeasureEnabled: false,
            bearingMeasureEnabled: false,
            geomType: 'LineString',
            features: [{
                type: "Feature",
                geometry: {
                    type: "LineString",
                    coordinates: [[1, 2], [2, 5]]
                },
                properties: {}
            }],
            textLabels: [{position: [1, 1], text: "1,714 m"}],
            id: 1,
            geomTypeSelected: ['LineString'],
            exportToAnnotation: true,
            len: 0,
            area: 0,
            bearing: 0
        };
        const uom = {
            length: {unit: 'km', label: 'km'},
            area: {unit: 'sqkm', label: 'km²'}
        };
        const actions = {
            onAddAnnotation: () => {}
        };
        const spyOnAddAnnotation = expect.spyOn(actions, "onAddAnnotation");
        let cmp = ReactDOM.render(
            <MeasureComponent
                onAddAnnotation={actions.onAddAnnotation}
                uom={uom}
                measurement={measurement}
                format="decimal"
                isDraggable
                useSingleFeature
                lineMeasureEnabled
                showAddAsAnnotation
            />, document.getElementById("container")
        );
        expect(cmp).toExist();
        const toolbar = TestUtils.scryRenderedDOMComponentsWithClass(cmp, "btn-toolbar");
        const toolBarGroup = TestUtils.scryRenderedDOMComponentsWithClass(cmp, "btn-group");
        expect(toolbar).toExist();
        expect(toolBarGroup.length).toBe(3);

        const buttons = document.querySelectorAll('button');
        expect(buttons.length).toBe(7);
        expect(buttons[0].classList.contains('disabled')).toBe(false);
        expect(buttons[1].classList.contains('disabled')).toBe(false);
        expect(buttons[2].classList.contains('disabled')).toBe(false);
        expect(buttons[3].classList.contains('disabled')).toBe(false);
        expect(buttons[4].classList.contains('disabled')).toBe(false);
        expect(buttons[5].classList.contains('disabled')).toBe(true); // Add as layer button
        expect(buttons[6].classList.contains('disabled')).toBe(false);
        expect(buttons[6].childNodes[0].className).toContain('floppy-disk');

        // Save annotation
        TestUtils.Simulate.click(buttons[6]);
        expect(spyOnAddAnnotation).toHaveBeenCalled();
        expect(spyOnAddAnnotation.calls[0].arguments).toBeTruthy();
        expect(spyOnAddAnnotation.calls[0].arguments.length).toBe(5);
        expect(spyOnAddAnnotation.calls[0].arguments[0]).toEqual(measurement.features);
        expect(spyOnAddAnnotation.calls[0].arguments[1]).toEqual(measurement.textLabels);
        expect(spyOnAddAnnotation.calls[0].arguments[2]).toEqual(uom);
        expect(spyOnAddAnnotation.calls[0].arguments[3]).toBe(false);
        expect(spyOnAddAnnotation.calls[0].arguments[4].id).toBe(1);
    });

    it("test Measurement default", () =>{
        let measurement = {
            lineMeasureEnabled: true,
            features: [{
                type: "Feature",
                geometry: {
                    type: "LineString",
                    coordinates: [[1, 2], [2, 5]]
                },
                properties: {}
            }],
            textLabels: [{position: [1, 1], text: "1,714 m"}],
            id: 1,
            len: 0,
            area: 0,
            bearing: 0
        };
        let cmp = ReactDOM.render(
            <MeasureComponent
                measurement={measurement}
                format="decimal"
                isDraggable
                useSingleFeature
                lineMeasureEnabled
                showAddAsAnnotation
            />, document.getElementById("container")
        );
        expect(cmp).toExist();
        const toolbar = TestUtils.scryRenderedDOMComponentsWithClass(cmp, "btn-toolbar");
        const toolBarGroup = TestUtils.scryRenderedDOMComponentsWithClass(cmp, "btn-group");
        expect(toolbar).toExist();
        expect(toolBarGroup.length).toBe(3);

        const buttons = document.querySelectorAll('button');
        expect(buttons.length).toBe(7);
        // By default LineString is selected
        expect(buttons[0].className).toContain('active');

        // Restrict unselect of the geometry
        TestUtils.Simulate.click(buttons[0]);
        expect(buttons[0].className).toContain('active');
    });
    it("test Measurement with invalid features", () =>{
        let measurement = {
            lineMeasureEnabled: true,
            features: [{
                type: "Feature",
                geometry: {
                    type: "LineString",
                    coordinates: [[1, 2], [2, 5], ["", ""]]
                },
                properties: {
                    disabled: true
                }
            }],
            textLabels: [{position: [1, 2], text: "1,714 m"},
                {position: [1, 1], text: "1,723 m"}],
            id: 1,
            len: 0,
            area: 0,
            bearing: 0
        };
        let cmp = ReactDOM.render(
            <MeasureComponent
                measurement={measurement}
                format="decimal"
                isDraggable
                useSingleFeature
                lineMeasureEnabled
                showAddAsAnnotation
            />, document.getElementById("container")
        );
        expect(cmp).toExist();
        const toolbar = TestUtils.scryRenderedDOMComponentsWithClass(cmp, "btn-toolbar");
        const toolBarGroup = TestUtils.scryRenderedDOMComponentsWithClass(cmp, "btn-group");
        expect(toolbar).toExist();
        expect(toolBarGroup.length).toBe(3);
        const geomTypeButtons = toolBarGroup[0].querySelectorAll('button');
        expect(geomTypeButtons.length).toBe(3);
        geomTypeButtons.forEach((btn, i)=> {
            if (i === 0) return expect(btn.className).toContain('active');
            return expect(btn.className).toContain('disabled');
        });

        const exportTools = toolBarGroup[2].querySelectorAll('button');
        expect(exportTools.length).toBe(3);
        exportTools.forEach((btn)=> expect(btn.className).toContain('disabled'));
    });
});
