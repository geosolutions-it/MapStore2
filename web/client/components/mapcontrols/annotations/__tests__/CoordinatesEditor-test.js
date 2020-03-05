/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const expect = require('expect');

const React = require('react');
const ReactDOM = require('react-dom');
const dragDropContext = require('react-dnd').DragDropContext;
const testBackend = require('react-dnd-test-backend');
const CoordinatesEditor = dragDropContext(testBackend)(require('../CoordinatesEditor'));
const TestUtils = require('react-dom/test-utils');

const testHandlers = {
    onChange: () => {},
    onHighlightPoint: () => {},
    onChangeRadius: () => {},
    onChangeText: () => {},
    onSetInvalidSelected: () => {}
};

describe("test the CoordinatesEditor Panel", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
        expect.restoreSpies();
    });

    it('CoordinatesEditor rendering with defaults', () => {
        const editor = ReactDOM.render(
            <CoordinatesEditor/>, document.getElementById("container")
        );
        expect(editor).toBeTruthy();
    });

    it('CoordinatesEditor as marker editor with base input coordinates', () => {
        const editor = ReactDOM.render(
            <CoordinatesEditor
                type="Point"
                format="decimal"
                components={[{
                    lat: "",
                    lon: ""
                }]}
            />, document.getElementById("container")
        );
        expect(editor).toBeTruthy();
        const hamburgerMenus = TestUtils.scryRenderedDOMComponentsWithClass(editor, "glyphicon-menu-hamburger");
        expect(hamburgerMenus.length).toBe(0);

        const spans = TestUtils.scryRenderedDOMComponentsWithTag(editor, "span");
        expect(spans).toBeTruthy();
        expect(spans[0].innerText).toBe("annotations.editor.title.Point");

        const exclamationMark = TestUtils.findRenderedDOMComponentWithClass(editor, "glyphicon-exclamation-mark");
        expect(exclamationMark).toBeTruthy();

        const format = TestUtils.findRenderedDOMComponentWithClass(editor, "glyphicon-cog");
        expect(format).toBeTruthy();

        const plus = TestUtils.scryRenderedDOMComponentsWithClass(editor, "glyphicon-plus");
        expect(plus.length).toBe(0);
    });

    it('CoordinatesEditor as Polygon editor, valid input coordinate, changing coords', () => {
        const components = [{
            lat: 10,
            lon: 10
        }, {
            lat: 6,
            lon: 6
        }, {
            lat: 6,
            lon: 6
        }];

        const spyOnChange = expect.spyOn(testHandlers, "onChange");
        const spyOnHighlightPoint = expect.spyOn(testHandlers, "onHighlightPoint");
        const spyOnSetInvalidSelected = expect.spyOn(testHandlers, "onSetInvalidSelected");
        const editor = ReactDOM.render(
            <CoordinatesEditor
                {...testHandlers}
                isMouseEnterEnabled
                type="Polygon"
                format="decimal"
                components={components}
            />, document.getElementById("container")
        );
        expect(editor).toBeTruthy();
        const hamburgerMenus = TestUtils.scryRenderedDOMComponentsWithClass(editor, "glyphicon-menu-hamburger");
        expect(hamburgerMenus.length).toBe(3);
        const inputs = TestUtils.scryRenderedDOMComponentsWithTag(editor, "input");
        expect(inputs).toBeTruthy();
        const input = inputs[0];
        input.value = 15;
        TestUtils.Simulate.change(input);
        expect(spyOnHighlightPoint).toHaveBeenCalled();
        expect(spyOnHighlightPoint).toHaveBeenCalledWith({ lat: 15, lon: 10 });
        expect(spyOnChange).toHaveBeenCalled();
        expect(spyOnChange).toHaveBeenCalledWith([
            { lat: 15, lon: 10 },
            {lat: 6, lon: 6 },
            {lat: 6, lon: 6 },
            { lat: 15, lon: 10 }
        ], undefined, undefined, undefined);

        input.value = "";
        TestUtils.Simulate.change(input);
        expect(spyOnHighlightPoint).toHaveBeenCalled();
        expect(spyOnSetInvalidSelected).toHaveBeenCalled();
        expect(spyOnSetInvalidSelected).toHaveBeenCalledWith("coords", [[10, "" ], [6, 6 ], [6, 6]]);
        expect(spyOnChange).toHaveBeenCalled();
        expect(spyOnChange).toHaveBeenCalledWith([
            { lat: "", lon: 10 },
            { lat: 6, lon: 6 },
            { lat: 6, lon: 6 },
            { lat: "", lon: 10 }
        ], undefined, undefined, undefined);
    });

    it('CoordinatesEditor as LineString editor, valid input coordinate, changing coords', () => {
        const components = [{
            lat: 10,
            lon: 10
        }, {
            lat: 6,
            lon: 6
        }];

        const spyOnChange = expect.spyOn(testHandlers, "onChange");
        const spyOnHighlightPoint = expect.spyOn(testHandlers, "onHighlightPoint");
        const spyOnSetInvalidSelected = expect.spyOn(testHandlers, "onSetInvalidSelected");
        const editor = ReactDOM.render(
            <CoordinatesEditor
                {...testHandlers}
                isMouseEnterEnabled
                type="LineString"
                format="decimal"
                components={components}
            />, document.getElementById("container")
        );
        expect(editor).toBeTruthy();

        const inputs = TestUtils.scryRenderedDOMComponentsWithTag(editor, "input");
        expect(inputs).toBeTruthy();
        const input = inputs[0];
        input.value = 15;
        TestUtils.Simulate.change(input);
        expect(spyOnHighlightPoint).toHaveBeenCalled();
        expect(spyOnHighlightPoint).toHaveBeenCalledWith({ lat: 15, lon: 10 });
        expect(spyOnChange).toHaveBeenCalled();
        expect(spyOnChange).toHaveBeenCalledWith([
            { lat: 15, lon: 10 },
            {lat: 6, lon: 6 }
        ], undefined, undefined, undefined);

        input.value = "";
        TestUtils.Simulate.change(input);
        expect(spyOnHighlightPoint).toHaveBeenCalled();
        expect(spyOnSetInvalidSelected).toHaveBeenCalled();
        expect(spyOnSetInvalidSelected).toHaveBeenCalledWith("coords", [[10, "" ], [6, 6 ]]);
        expect(spyOnChange).toHaveBeenCalled();
        expect(spyOnChange).toHaveBeenCalledWith([
            { lat: "", lon: 10 },
            {lat: 6, lon: 6 }
        ], undefined, undefined, undefined);
    });

    it('CoordinatesEditor as Circle editor, valid input coordinate, changing coords, isMouseLeaveEnabled=true', () => {
        const components = [{
            lat: 10,
            lon: 10
        }];
        const mapProjection = "EPSG:3857";
        const spyOnChange = expect.spyOn(testHandlers, "onChange");
        const spyOnHighlightPoint = expect.spyOn(testHandlers, "onHighlightPoint");
        const spyOnSetInvalidSelected = expect.spyOn(testHandlers, "onSetInvalidSelected");
        const editor = ReactDOM.render(
            <CoordinatesEditor
                mapProjection={mapProjection}
                {...testHandlers}
                isMouseEnterEnabled
                isMouseLeaveEnabled
                type="Circle"
                format="decimal"
                properties={{ radius: 1000 }}
                components={components}
            />, document.getElementById("container")
        );
        expect(editor).toBeTruthy();

        const inputs = TestUtils.scryRenderedDOMComponentsWithTag(editor, "input");
        expect(inputs).toBeTruthy();
        const inputRadius = inputs[0];
        inputRadius.value = 1000;
        const inputCoord = inputs[1];
        inputCoord.value = 15;
        TestUtils.Simulate.change(inputCoord);
        expect(spyOnHighlightPoint).toHaveBeenCalled();
        expect(spyOnHighlightPoint).toHaveBeenCalledWith({ lat: 15, lon: 10 });
        expect(spyOnChange).toHaveBeenCalled();
        expect(spyOnChange).toHaveBeenCalledWith([
            { lat: 15, lon: 10 }
        ], 1000, undefined, mapProjection);

        inputCoord.value = "";
        TestUtils.Simulate.change(inputCoord);
        expect(spyOnHighlightPoint).toHaveBeenCalled();
        expect(spyOnHighlightPoint).toHaveBeenCalledWith(null);
        expect(spyOnSetInvalidSelected).toHaveBeenCalled();
        expect(spyOnSetInvalidSelected).toHaveBeenCalledWith("coords", [[10, "" ]]);
        expect(spyOnChange).toHaveBeenCalled();
        expect(spyOnChange).toHaveBeenCalledWith([
            { lat: "", lon: 10 }
        ], 1000, undefined, mapProjection);
    });

    it('CoordinatesEditor as Circle editor, valid input coordinate, changing coords, isMouseLeaveEnabled=false', () => {
        const components = [{
            lat: 10,
            lon: 10
        }];
        const mapProjection = "EPSG:3857";
        const spyOnChange = expect.spyOn(testHandlers, "onChange");
        const spyOnHighlightPoint = expect.spyOn(testHandlers, "onHighlightPoint");
        const spyOnSetInvalidSelected = expect.spyOn(testHandlers, "onSetInvalidSelected");
        const editor = ReactDOM.render(
            <CoordinatesEditor
                mapProjection={mapProjection}
                {...testHandlers}
                isMouseEnterEnabled
                type="Circle"
                format="decimal"
                properties={{ radius: 1000 }}
                components={components}
            />, document.getElementById("container")
        );
        expect(editor).toBeTruthy();

        const inputs = TestUtils.scryRenderedDOMComponentsWithTag(editor, "input");
        expect(inputs).toBeTruthy();
        const inputRadius = inputs[0];
        inputRadius.value = 1000;
        const inputCoord = inputs[1];

        inputCoord.value = "";
        TestUtils.Simulate.change(inputCoord);
        expect(spyOnHighlightPoint).not.toHaveBeenCalled();
        expect(spyOnSetInvalidSelected).toHaveBeenCalled();
        expect(spyOnSetInvalidSelected).toHaveBeenCalledWith("coords", [[10, "" ]]);
        expect(spyOnChange).toHaveBeenCalled();
        expect(spyOnChange).toHaveBeenCalledWith([{ lat: "", lon: 10 }], 1000, undefined, mapProjection);
    });

    it('CoordinatesEditor as Circle editor, valid input coordinate, changing radius with valid value', () => {
        const components = [{
            lat: 10,
            lon: 10
        }];
        const spyOnChangeRadius = expect.spyOn(testHandlers, "onChangeRadius");
        const mapProjection = "EPSG:3857";
        const spyOnSetInvalidSelected = expect.spyOn(testHandlers, "onSetInvalidSelected");
        const editor = ReactDOM.render(
            <CoordinatesEditor
                mapProjection={mapProjection}
                {...testHandlers}
                isMouseEnterEnabled isMouseLeaveEnabled
                type="Circle"
                format="decimal"
                properties={{ radius: 1000 }}
                components={components}
            />, document.getElementById("container")
        );
        expect(editor).toBeTruthy();

        const inputs = TestUtils.scryRenderedDOMComponentsWithTag(editor, "input");
        expect(inputs).toBeTruthy();
        const inputRadius = inputs[0];
        inputRadius.value = 10000;
        TestUtils.Simulate.change(inputRadius);
        expect(spyOnChangeRadius).toHaveBeenCalled();
        expect(spyOnChangeRadius).toHaveBeenCalledWith(10000, [[10, 10]], mapProjection);
        expect(spyOnSetInvalidSelected).not.toHaveBeenCalled();
    });


    it('CoordinatesEditor as Circle editor, valid input coordinate, changing radius, invalid center', () => {
        const components = [{
            lat: "",
            lon: ""
        }];
        const spyOnChangeRadius = expect.spyOn(testHandlers, "onChangeRadius");
        const spyOnSetInvalidSelected = expect.spyOn(testHandlers, "onSetInvalidSelected");
        const mapProjection = "EPSG:3857";
        const editor = ReactDOM.render(
            <CoordinatesEditor
                mapProjection={mapProjection}
                {...testHandlers}
                isMouseEnterEnabled isMouseLeaveEnabled
                type="Circle"
                format="decimal"
                properties={{ radius: 1000 }}
                components={components}
            />, document.getElementById("container")
        );
        expect(editor).toBeTruthy();

        const inputs = TestUtils.scryRenderedDOMComponentsWithTag(editor, "input");
        expect(inputs).toBeTruthy();
        const inputRadius = inputs[0];
        inputRadius.value = 10000;
        TestUtils.Simulate.change(inputRadius);
        expect(spyOnChangeRadius).toHaveBeenCalled();
        expect(spyOnChangeRadius).toHaveBeenCalledWith(10000, [], mapProjection);
        expect(spyOnSetInvalidSelected).not.toHaveBeenCalled();
    });


    it('CoordinatesEditor as Circle editor, valid input coordinate, changing invalid radius, invalid center', () => {
        const components = [{
            lat: "",
            lon: ""
        }];
        const spyOnChangeRadius = expect.spyOn(testHandlers, "onChangeRadius");
        const spyOnSetInvalidSelected = expect.spyOn(testHandlers, "onSetInvalidSelected");
        const mapProjection = "EPSG:3857";
        const editor = ReactDOM.render(
            <CoordinatesEditor
                mapProjection={mapProjection}
                {...testHandlers}
                isMouseEnterEnabled isMouseLeaveEnabled
                type="Circle"
                format="decimal"
                properties={{ radius: 1000 }}
                components={components}
            />, document.getElementById("container")
        );
        expect(editor).toBeTruthy();

        const hamburgerMenus = TestUtils.scryRenderedDOMComponentsWithClass(editor, "glyphicon-menu-hamburger");
        expect(hamburgerMenus.length).toBe(0);
        const inputs = TestUtils.scryRenderedDOMComponentsWithTag(editor, "input");
        expect(inputs).toBeTruthy();
        const inputRadius = inputs[0];
        inputRadius.value = "";
        TestUtils.Simulate.change(inputRadius);
        expect(spyOnChangeRadius).toHaveBeenCalled();
        expect(spyOnChangeRadius).toHaveBeenCalledWith(null, [["", ""]], mapProjection);
        expect(spyOnSetInvalidSelected).toHaveBeenCalled();
        expect(spyOnSetInvalidSelected).toHaveBeenCalledWith("radius", [["", ""]]);
    });

    it('CoordinatesEditor as Text editor, valid input coordinate, changing coords, isMouseLeaveEnabled=true', () => {
        const components = [{
            lat: 10,
            lon: 10
        }];
        const spyOnChange = expect.spyOn(testHandlers, "onChange");
        const spyOnHighlightPoint = expect.spyOn(testHandlers, "onHighlightPoint");
        const spyOnSetInvalidSelected = expect.spyOn(testHandlers, "onSetInvalidSelected");
        const spyOnChangeText = expect.spyOn(testHandlers, "onChangeText");
        const editor = ReactDOM.render(
            <CoordinatesEditor
                {...testHandlers}
                isMouseEnterEnabled
                isMouseLeaveEnabled
                type="Text"
                format="decimal"
                properties={{ valueText: "myTextAnnotation" }}
                components={components}
            />, document.getElementById("container")
        );
        expect(editor).toBeTruthy();

        const inputs = TestUtils.scryRenderedDOMComponentsWithTag(editor, "input");
        expect(inputs).toBeTruthy();
        const inputText = inputs[0];
        inputText.value = "myTextAnnotation";
        const inputCoord = inputs[1];
        inputCoord.value = 15;
        TestUtils.Simulate.change(inputCoord);
        expect(spyOnHighlightPoint).toHaveBeenCalled();
        expect(spyOnHighlightPoint).toHaveBeenCalledWith({ lat: 15, lon: 10 });
        expect(spyOnChange).toHaveBeenCalled();
        expect(spyOnChangeText).not.toHaveBeenCalled();
        expect(spyOnChange).toHaveBeenCalledWith([
            { lat: 15, lon: 10 }
        ], undefined, "myTextAnnotation", undefined);

        inputCoord.value = "";
        TestUtils.Simulate.change(inputCoord);
        expect(spyOnHighlightPoint).toHaveBeenCalled();
        expect(spyOnHighlightPoint).toHaveBeenCalledWith(null);
        expect(spyOnSetInvalidSelected).toHaveBeenCalled();
        expect(spyOnSetInvalidSelected).toHaveBeenCalledWith("coords", [[10, "" ]]);
        expect(spyOnChange).toHaveBeenCalled();
        expect(spyOnChangeText).not.toHaveBeenCalled();
        expect(spyOnChange).toHaveBeenCalledWith([
            { lat: "", lon: 10 }
        ], undefined, "myTextAnnotation", undefined);
    });

    it('CoordinatesEditor as Text editor, valid input coordinate, changing text, isMouseLeaveEnabled=true', () => {
        const components = [{
            lat: 10,
            lon: 10
        }];
        const spyOnChange = expect.spyOn(testHandlers, "onChange");
        const spyOnHighlightPoint = expect.spyOn(testHandlers, "onHighlightPoint");
        const spyOnSetInvalidSelected = expect.spyOn(testHandlers, "onSetInvalidSelected");
        const spyOnChangeText = expect.spyOn(testHandlers, "onChangeText");
        const editor = ReactDOM.render(
            <CoordinatesEditor
                {...testHandlers}
                isMouseEnterEnabled
                isMouseLeaveEnabled
                type="Text"
                format="decimal"
                properties={{ valueText: "myTextAnnotation" }}
                components={components}
            />, document.getElementById("container")
        );
        expect(editor).toBeTruthy();

        const inputs = TestUtils.scryRenderedDOMComponentsWithTag(editor, "input");
        expect(inputs).toBeTruthy();
        const inputText = inputs[0];
        inputText.value = "my new Text Annotation";
        TestUtils.Simulate.change(inputText);

        expect(spyOnHighlightPoint).not.toHaveBeenCalled();
        expect(spyOnSetInvalidSelected).not.toHaveBeenCalled();
        expect(spyOnChange).not.toHaveBeenCalled();
        expect(spyOnChangeText).toHaveBeenCalled();
        expect(spyOnChangeText).toHaveBeenCalledWith("my new Text Annotation", [[10, 10]]);
    });


    it('CoordinatesEditor as Text editor, valid input coordinate, changing text, invalid point', () => {
        const components = [{
            lat: "",
            lon: ""
        }];
        const spyOnChange = expect.spyOn(testHandlers, "onChange");
        const spyOnHighlightPoint = expect.spyOn(testHandlers, "onHighlightPoint");
        const spyOnSetInvalidSelected = expect.spyOn(testHandlers, "onSetInvalidSelected");
        const spyOnChangeText = expect.spyOn(testHandlers, "onChangeText");
        const editor = ReactDOM.render(
            <CoordinatesEditor
                {...testHandlers}
                isMouseEnterEnabled
                isMouseLeaveEnabled
                type="Text"
                format="decimal"
                properties={{ valueText: "myTextAnnotation" }}
                components={components}
            />, document.getElementById("container")
        );
        expect(editor).toBeTruthy();

        const inputs = TestUtils.scryRenderedDOMComponentsWithTag(editor, "input");
        expect(inputs).toBeTruthy();
        const inputText = inputs[0];
        inputText.value = "my new Text Annotation";
        TestUtils.Simulate.change(inputText);

        expect(spyOnHighlightPoint).not.toHaveBeenCalled();
        expect(spyOnSetInvalidSelected).not.toHaveBeenCalled();
        expect(spyOnChange).not.toHaveBeenCalled();
        expect(spyOnChangeText).toHaveBeenCalled();
        expect(spyOnChangeText).toHaveBeenCalledWith("my new Text Annotation", [["", ""]]);
    });


    it('CoordinatesEditor as Text editor, valid input coordinate, changing with invalid text, invalid point', () => {
        const components = [{
            lat: "",
            lon: ""
        }];
        const spyOnChange = expect.spyOn(testHandlers, "onChange");
        const spyOnHighlightPoint = expect.spyOn(testHandlers, "onHighlightPoint");
        const spyOnSetInvalidSelected = expect.spyOn(testHandlers, "onSetInvalidSelected");
        const spyOnChangeText = expect.spyOn(testHandlers, "onChangeText");
        const editor = ReactDOM.render(
            <CoordinatesEditor
                {...testHandlers}
                isMouseEnterEnabled
                isMouseLeaveEnabled
                type="Text"
                format="decimal"
                properties={{ valueText: "myTextAnnotation" }}
                components={components}
            />, document.getElementById("container")
        );
        expect(editor).toBeTruthy();

        const inputs = TestUtils.scryRenderedDOMComponentsWithTag(editor, "input");
        expect(inputs).toBeTruthy();
        const inputText = inputs[0];
        inputText.value = "";
        TestUtils.Simulate.change(inputText);

        const hamburgerMenus = TestUtils.scryRenderedDOMComponentsWithClass(editor, "glyphicon-menu-hamburger");
        expect(hamburgerMenus.length).toBe(0);

        expect(spyOnHighlightPoint).not.toHaveBeenCalled();
        expect(spyOnChange).not.toHaveBeenCalled();
        expect(spyOnChangeText).toHaveBeenCalled();
        expect(spyOnChangeText).toHaveBeenCalledWith("", [["", ""]]);
        expect(spyOnSetInvalidSelected).toHaveBeenCalled();
        expect(spyOnSetInvalidSelected).toHaveBeenCalledWith("text", [["", ""]]);
    });

    it('CoordinatesEditor as LineString editor, valid input coordinate, mouse enter/leave', () => {
        const components = [{
            lat: 10,
            lon: 10
        }, {
            lat: 6,
            lon: 6
        }];
        const spyOnHighlightPoint = expect.spyOn(testHandlers, "onHighlightPoint");

        const editor = ReactDOM.render(
            <CoordinatesEditor
                {...testHandlers}
                isMouseEnterEnabled
                isMouseLeaveEnabled
                type="LineString"
                format="decimal"
                properties={{ valueText: "myTextAnnotation" }}
                components={components}
            />, document.getElementById("container")
        );
        expect(editor).toBeTruthy();

        const rows = TestUtils.scryRenderedDOMComponentsWithClass(editor, "coordinateRow");
        const firstRow = rows[0];
        TestUtils.Simulate.mouseEnter(firstRow);
        expect(spyOnHighlightPoint).toHaveBeenCalled();
        expect(spyOnHighlightPoint).toHaveBeenCalledWith({lat: 10, lon: 10});
        TestUtils.Simulate.mouseLeave(firstRow);
        expect(spyOnHighlightPoint).toHaveBeenCalled();
        expect(spyOnHighlightPoint).toHaveBeenCalledWith(null);
    });

    it('CoordinatesEditor as LineString editor, 3 valid input coordinate, remove first row', () => {
        const components = [{
            lat: 10,
            lon: 10
        }, {
            lat: 8,
            lon: 8
        }, {
            lat: 6,
            lon: 6
        }];
        const spyOnHighlightPoint = expect.spyOn(testHandlers, "onHighlightPoint");

        const editor = ReactDOM.render(
            <CoordinatesEditor
                {...testHandlers}
                isMouseEnterEnabled
                isMouseLeaveEnabled
                type="LineString"
                format="decimal"
                properties={{}}
                components={components}
            />, document.getElementById("container")
        );
        expect(editor).toBeTruthy();

        let buttons = TestUtils.scryRenderedDOMComponentsWithTag(editor, "button");
        let firstDelButton = buttons[4];
        TestUtils.Simulate.click(firstDelButton);
        expect(spyOnHighlightPoint).toHaveBeenCalled();
        expect(spyOnHighlightPoint).toHaveBeenCalledWith({ lat: 8, lon: 8 });
    });

    it('CoordinatesEditor as LineString editor, 2 valid input coordinate, cannot remove first row trash disabled', () => {
        const components = [{
            lat: 10,
            lon: 10
        }, {
            lat: 6,
            lon: 6
        }];
        const spyOnHighlightPoint = expect.spyOn(testHandlers, "onHighlightPoint");

        const editor = ReactDOM.render(
            <CoordinatesEditor
                {...testHandlers}
                isMouseEnterEnabled
                isMouseLeaveEnabled
                type="LineString"
                format="decimal"
                properties={{}}
                components={components}
            />, document.getElementById("container")
        );
        expect(editor).toBeTruthy();

        let buttons = TestUtils.scryRenderedDOMComponentsWithTag(editor, "button");
        let firstDelButton = buttons[4];
        TestUtils.Simulate.click(firstDelButton);
        expect(spyOnHighlightPoint).not.toHaveBeenCalled();
        expect(firstDelButton.disabled).toBe(true);
    });

    it('CoordinatesEditor as LineString editor, 4 rows, remove first invalid row', () => {
        const components = [{
            lat: "",
            lon: ""
        }, {
            lat: 8,
            lon: 8
        }, {
            lat: 8,
            lon: 8
        }, {
            lat: 6,
            lon: 6
        }];
        const spyOnSetInvalidSelected = expect.spyOn(testHandlers, "onSetInvalidSelected");
        const spyOnHighlightPoint = expect.spyOn(testHandlers, "onHighlightPoint");
        const spyOnChange = expect.spyOn(testHandlers, "onChange");

        const editor = ReactDOM.render(
            <CoordinatesEditor
                {...testHandlers}
                isMouseEnterEnabled
                isMouseLeaveEnabled
                type="LineString"
                format="decimal"
                properties={{isValidFeature: true}}
                components={components}
            />, document.getElementById("container")
        );
        expect(editor).toBeTruthy();

        let buttons = TestUtils.scryRenderedDOMComponentsWithTag(editor, "button");
        let firstDelButton = buttons[4];
        TestUtils.Simulate.click(firstDelButton);
        expect(spyOnSetInvalidSelected).not.toHaveBeenCalled();
        expect(spyOnChange).toHaveBeenCalled();
        expect(spyOnHighlightPoint).toHaveBeenCalled();
        expect(spyOnHighlightPoint).toHaveBeenCalledWith({ lat: 8, lon: 8 });
    });

    it('CoordinatesEditor as LineString, 4 rows, only invalid rows are not disabled', () => {
        const components = [{
            lat: 5,
            lon: ""
        }, {
            lat: 8,
            lon: 8
        }, {
            lat: 8,
            lon: 8
        },
        {
            lat: "",
            lon: ""
        }];

        const editor = ReactDOM.render(
            <CoordinatesEditor
                {...testHandlers}
                isMouseEnterEnabled
                isMouseLeaveEnabled
                type="LineString"
                format="decimal"
                properties={{isValidFeature: true}}
                components={components}
            />, document.getElementById("container")
        );
        expect(editor).toBeTruthy();

        const buttons = TestUtils.scryRenderedDOMComponentsWithTag(editor, "button");
        expect(buttons.length).toBe(11);
        expect(buttons[4].disabled).toBe(false);
        expect(buttons[6].disabled).toBe(true);
        expect(buttons[8].disabled).toBe(true);
        expect(buttons[10].disabled).toBe(false);
    });
    it('CoordinatesEditor as Polygon, 5 rows, only invalid rows are not disabled', () => {
        const components = [{
            lat: 5,
            lon: ""
        }, {
            lat: 7,
            lon: 7
        }, {
            lat: 8,
            lon: 8
        }, {
            lat: 6,
            lon: 6
        },
        {
            lat: "",
            lon: ""
        }];

        const editor = ReactDOM.render(
            <CoordinatesEditor
                {...testHandlers}
                isMouseEnterEnabled
                isMouseLeaveEnabled
                type="Polygon"
                format="decimal"
                properties={{isValidFeature: true}}
                components={components}
            />, document.getElementById("container")
        );
        expect(editor).toBeTruthy();

        const hamburgerMenus = TestUtils.scryRenderedDOMComponentsWithClass(editor, "glyphicon-menu-hamburger");
        expect(hamburgerMenus.length).toBe(5);
        const buttons = TestUtils.scryRenderedDOMComponentsWithTag(editor, "button");
        expect(buttons.length).toBe(13);
        expect(buttons[4].disabled).toBe(false);
        expect(buttons[6].disabled).toBe(true);
        expect(buttons[8].disabled).toBe(true);
        expect(buttons[10].disabled).toBe(true);
        expect(buttons[12].disabled).toBe(false);
    });

});
