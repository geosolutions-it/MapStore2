/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import expect from 'expect';
import TestUtils from 'react-dom/test-utils';

import MultiBandEditor from '../MultiBandEditor';

describe("MultiBandEditor", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it("editor with single band data", () => {
        const props = {
            element: {sourceMetadata: {samples: 1, fileDirectory: {PhotometricInterpretation: 0}} }
        };

        render(<MultiBandEditor {...props}/>, document.getElementById("container"));
        const enableBanding = document.querySelector('.enable-band');
        expect(enableBanding).toBeTruthy();
        expect(enableBanding.innerHTML).toContain("styleeditor.enableBanding");

        const propertyFields = document.querySelectorAll('.ms-symbolizer-field');
        const grayChannel = document.querySelector('.ms-symbolizer-label');
        expect(propertyFields.length).toBe(3);
        expect(grayChannel).toBeTruthy();
        expect(grayChannel.innerHTML).toContain('styleeditor.grayChannel');

        expect(propertyFields[1].innerHTML).toContain('styleeditor.minLabel');
        expect(propertyFields[2].innerHTML).toContain('styleeditor.maxLabel');
    });
    it("editor with RGB band data", () => {
        const props = {
            element: {sourceMetadata: {samples: 3} }
        };

        render(<MultiBandEditor {...props}/>, document.getElementById("container"));
        const enableBanding = document.querySelector('.enable-band');
        expect(enableBanding).toBeTruthy();
        expect(enableBanding.innerHTML).toContain("styleeditor.enableBanding");

        const propertyFields = document.querySelectorAll('.ms-symbolizer-field');
        expect(propertyFields.length).toBe(5);
    });
    it("editor with multi band data", () => {
        const props = {
            element: {sourceMetadata: {samples: 4} }
        };

        render(<MultiBandEditor {...props}/>, document.getElementById("container"));
        const enableBanding = document.querySelector('.enable-band');
        expect(enableBanding).toBeTruthy();
        expect(enableBanding.innerHTML).toContain("styleeditor.enableBanding");

        const propertyFields = document.querySelectorAll('.ms-symbolizer-field');
        expect(propertyFields.length).toBe(6);
    });
    it("editor on apply & un-apply banding", () => {
        let props = {
            element: {sourceMetadata: {samples: 4} }
        };
        const action = {
            onUpdateNode: () => {}
        };
        const spyOnUpdate = expect.spyOn(action, 'onUpdateNode');

        render(<MultiBandEditor {...props} onUpdateNode={action.onUpdateNode}/>, document.getElementById("container"));
        const enableBandBtn = document.querySelector('.enable-band .mapstore-switch-btn input');
        expect(enableBandBtn).toBeTruthy();

        TestUtils.Simulate.change(enableBandBtn, { "target": { "checked": true }});
        expect(spyOnUpdate).toHaveBeenCalled();
        expect(spyOnUpdate.calls[0].arguments[1]).toBe("layers");
        expect(spyOnUpdate.calls[0].arguments[2].style.body.color).toBeTruthy();

        props = {
            element: {sourceMetadata: {samples: 4}, style: {body: {color: ["array"]}}}
        };
        render(<MultiBandEditor {...props} onUpdateNode={action.onUpdateNode}/>, document.getElementById("container"));
        TestUtils.Simulate.change(enableBandBtn, { "target": { "checked": false }});
        expect(spyOnUpdate).toHaveBeenCalled();
        expect(spyOnUpdate.calls[1].arguments[1]).toBe("layers");
        expect(spyOnUpdate.calls[1].arguments[2].style).toEqual({ body: { color: undefined }, format: 'openlayers' });
    });
});
