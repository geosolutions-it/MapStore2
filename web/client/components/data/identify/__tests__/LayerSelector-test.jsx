/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import expect from 'expect';
import ReactDOM from 'react-dom';
import LayerSelector from '../LayerSelector';
import { getValidator } from '../../../../utils/MapInfoUtils';
import TestUtils from 'react-dom/test-utils';

describe("LayerSelector component", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test LayerSelector default', () => {
        ReactDOM.render(<LayerSelector/>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container).toExist();
        const select = container.querySelector("#identify-layer-select");
        expect(select).toExist();
        const labelValue = container.querySelector(".Select-value-label");
        expect(labelValue).toNotExist();

    });
    it('test LayerSelector display only valid responses', () => {
        const responses = [{layerMetadata: {title: "Test1"}, response: "no features were found"}, {layerMetadata: {title: "Test2"}, response: "GetFeatureInfo results"}];
        ReactDOM.render(<LayerSelector loaded responses={responses} validator={getValidator} format={"text/plain"}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container).toExist();
        const select = container.querySelector("#identify-layer-select");
        expect(select).toExist();
        const input = container.querySelector('input');
        expect(input).toBeTruthy();

        TestUtils.act(() => {
            TestUtils.Simulate.focus(input);
            TestUtils.Simulate.keyDown(input, { key: 'ArrowDown', keyCode: 40 });
        });
        const options = select.querySelectorAll(".Select-option");
        // Invalid response - first option is hidden
        expect(options[0].style.display).toBe('none');

        // Valid response - second option is displayed
        expect(options[1].style.display).toBe('block');
    });
    it('test LayerSelector with value and setIndex', (done) => {

        let config = {
            responses: [
                {layerMetadata: {title: "Layer 1"}, response: "GetFeatureInfo results1"},
                {layerMetadata: {title: "Layer 2"}, response: "GetFeatureInfo results2"}],
            index: 0
        };

        TestUtils.act(() => {
            ReactDOM.render(
                <LayerSelector
                    loaded
                    {...config}
                    setIndex={
                        (value) => {
                            try {
                                expect(value).toBe(1);
                            } catch (e) {
                                done(e);
                            }
                            done();
                        }}
                />,
                document.getElementById("container"));
        });
        const cmp = document.getElementById('container');
        expect(cmp).toBeTruthy();

        const input = cmp.querySelector('input');
        expect(input).toBeTruthy();

        let selectValue = cmp.querySelector('.Select-value-label');
        expect(selectValue.innerText).toBe("Layer 1");

        TestUtils.act(() => {
            TestUtils.Simulate.focus(input);
            TestUtils.Simulate.keyDown(input, { key: 'ArrowDown', keyCode: 40 });
        });
        const selectMenuOptionNodes = cmp.querySelectorAll('.Select-option');
        expect(selectMenuOptionNodes.length).toBe(2);
        TestUtils.act(() => {
            TestUtils.Simulate.mouseDown(selectMenuOptionNodes[1]);
        });
        selectValue = cmp.querySelector('.Select-value-label');
        expect(selectValue.innerText).toBe("Layer 2");

    });
});
