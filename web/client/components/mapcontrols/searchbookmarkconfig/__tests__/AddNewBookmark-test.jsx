/*
* Copyright 2020, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import expect from 'expect';

import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import AddNewBookmark from '../AddNewBookmark';

describe("AddNewBookmark component", () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="container"></div>';
    });

    afterEach(() => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
    });

    it('test AddNewBookmark', () => {
        ReactDOM.render(<AddNewBookmark.Element />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container).toExist();
        const labels = container.querySelectorAll(".control-label");
        const glyphicons = container.querySelectorAll(".glyphicon");
        const inputs = container.querySelectorAll("input");
        expect(labels.length).toBe(6);
        expect(glyphicons.length).toBe(2);
        expect(inputs.length).toBe(5);
    });

    it('test AddNewBookmark fields validation', () => {
        const actions = {
            onPropertyChange: () => { }
        };
        const spyOnPropertyChange = expect.spyOn(actions, 'onPropertyChange');

        ReactDOM.render(<AddNewBookmark.Element onPropertyChange={actions.onPropertyChange} />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container).toExist();
        const inputs = container.querySelectorAll("input");
        expect(inputs.length).toBe(5);

        const title = inputs[0];
        const north = inputs[1];
        const west = inputs[2];
        const east = inputs[3];
        const south = inputs[4];

        title.value = "New Bookmark";
        north.value = "34";
        west.value = "-107";
        east.value = "107";
        south.value = "-89";

        ReactTestUtils.Simulate.change(title);
        expect(spyOnPropertyChange).toHaveBeenCalled();
        expect(spyOnPropertyChange.calls[0].arguments[0]).toBe("bookmark");
        expect(spyOnPropertyChange.calls[0].arguments[1]).toEqual({title: "New Bookmark"});

        ReactTestUtils.Simulate.change(north);
        expect(spyOnPropertyChange).toHaveBeenCalled();
        expect(spyOnPropertyChange.calls[1].arguments[0]).toBe("bookmark");
        expect(spyOnPropertyChange.calls[1].arguments[1]).toEqual({ options: { north: 34 } });
        ReactTestUtils.Simulate.change(west);
        expect(spyOnPropertyChange).toHaveBeenCalled();
        expect(spyOnPropertyChange.calls[2].arguments[1]).toEqual({ options: { west: -107 } });
        ReactTestUtils.Simulate.change(east);
        expect(spyOnPropertyChange).toHaveBeenCalled();
        expect(spyOnPropertyChange.calls[3].arguments[1]).toEqual({ options: { east: 107 } });
        ReactTestUtils.Simulate.change(south);
        expect(spyOnPropertyChange).toHaveBeenCalled();
        expect(spyOnPropertyChange.calls[4].arguments[1]).toEqual({ options: { south: -89 } });
        expect(spyOnPropertyChange.calls.length).toBe(5);
    });
    it('test AddNewBookmark button validation', () => {
        const actions = {
            onPropertyChange: () => {
            }
        };
        const spyOnPropertyChange = expect.spyOn(actions, 'onPropertyChange');

        ReactDOM.render(<AddNewBookmark.Element
            onPropertyChange={actions.onPropertyChange} bbox={[-5, 10, -112, 78]}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container).toExist();
        const buttons = container.getElementsByTagName("button");
        expect(buttons.length).toBe(2);
        const toggleVisibilityLayerReload = buttons[0];
        const getCurrentBBox = buttons[1];

        // Toggle visibility layer reload option
        ReactTestUtils.Simulate.click(toggleVisibilityLayerReload);
        expect(spyOnPropertyChange).toHaveBeenCalled();
        expect(spyOnPropertyChange.calls[0].arguments[0]).toBe("bookmark");
        expect(spyOnPropertyChange.calls[0].arguments[1]).toEqual({layerVisibilityReload: true});

        // Get current bbox values
        ReactTestUtils.Simulate.click(getCurrentBBox);
        expect(spyOnPropertyChange).toHaveBeenCalled();
        expect(spyOnPropertyChange.calls[1].arguments[1]).toEqual({options: {west: -5, south: 10, east: -112, north: 78}});

    });
});
