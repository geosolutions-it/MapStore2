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
const DropdownFeatureType = require('../DropdownFeatureType');

const titles = {
    marker: "marker",
    line: "line",
    polygon: "polygon",
    circle: "circle",
    text: "text"
};

const testSpies = (spies, button) => {
    expect(button).toExist();
    button.click();
    spies.forEach(spy => {
        expect(spy).toHaveBeenCalled();
    });
};

const resetSpies = (spies) => {
    spies.forEach(spy => {
        spy.restore();
    });
};

describe("test the DropdownFeatureType Panel", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('DropdownFeatureType rendering with defaults', () => {
        ReactDOM.render(
            <DropdownFeatureType
                glyph= "pencil-add"
                tooltip="Tooltip for my button"
                titles={titles}
            />, document.getElementById("container")
        );
        const items = document.getElementsByTagName("li");
        expect(items).toExist();
        expect(items.length).toBe(5);
        const spans = document.getElementsByTagName("span");
        expect(spans).toExist();
        expect(spans.length).toBe(6);
        expect(spans[0].className).toBe("glyphicon glyphicon-pencil-add");
        expect(spans[1].className).toBe("glyphicon glyphicon-point");
        expect(spans[2].className).toBe("glyphicon glyphicon-line");
        expect(spans[3].className).toBe("glyphicon glyphicon-polygon");
        expect(spans[4].className).toBe("glyphicon glyphicon-text-colour");
        expect(spans[5].className).toBe("glyphicon glyphicon-1-circle");
    });

    it('DropdownFeatureType testing the actions', () => {

        const testHandlers = {
            onClick: () => {},
            onStartDrawing: () => {},
            onSetStyle: () => {},
            onAddText: () => {}
        };

        const spyOnClick = expect.spyOn(testHandlers, 'onClick');
        const spyOnSetStyle = expect.spyOn(testHandlers, 'onSetStyle');
        const spyOnStartDrawing = expect.spyOn(testHandlers, 'onStartDrawing');
        const spyOnAddText = expect.spyOn(testHandlers, 'onAddText');

        const spies = [spyOnClick, spyOnSetStyle, spyOnStartDrawing];
        ReactDOM.render(
            <DropdownFeatureType
                glyph= "pencil-add"
                tooltip="Tooltip for my button"
                titles={titles}
                onClick={testHandlers.onClick}
                onSetStyle={testHandlers.onSetStyle}
                onStartDrawing={testHandlers.onStartDrawing}
                onAddText={testHandlers.onAddText}
            />, document.getElementById("container")
        );
        const buttons = document.getElementsByTagName("a");

        const marker = buttons[0];
        testSpies(spies, marker);
        expect(spyOnClick).toHaveBeenCalledWith("Point");
        resetSpies(spies);

        const line = buttons[1];
        testSpies(spies, line);
        expect(spyOnClick).toHaveBeenCalledWith("LineString");
        resetSpies(spies);

        const polygon = buttons[2];
        testSpies(spies, polygon);
        expect(spyOnClick).toHaveBeenCalledWith("Polygon");
        resetSpies(spies);

        const text = buttons[3];
        testSpies([...spies, spyOnAddText], text);
        expect(spyOnClick).toHaveBeenCalledWith("Text");
        resetSpies(spies);

        const circle = buttons[4];
        testSpies(spies, circle);
        expect(spyOnClick).toHaveBeenCalledWith("Circle");
        resetSpies(spies);
    });
});
