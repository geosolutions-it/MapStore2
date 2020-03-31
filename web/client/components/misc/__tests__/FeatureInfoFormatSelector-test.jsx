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
import FeatureInfoFormatSelector from '../FeatureInfoFormatSelector';
import TestUtils from 'react-dom/test-utils';

describe('FeatureInfoFormatSelector', () => {
    const data = {
        k0: "v0",
        k1: "v1",
        k2: "v2",
        //  duplicated key value needed to test that featureInfo with same formats are selectable.
        k3: "v2"
    };
    const defaultVal = data.k1;

    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test list filling', () => {
        TestUtils.act(() => {
            ReactDOM.render(
                <FeatureInfoFormatSelector
                    label="Info"
                    availableInfoFormat={data}
                    infoFormat={defaultVal}
                    selectProps={{
                        // force select menu to open state
                        ref: (select) => { if (select) select.setState({ isOpen: true }); }
                    }}/>
                , document.getElementById("container"));
        });
        const cmp = document.querySelector('.form-group');
        expect(cmp).toBeTruthy();

        const selectMenuOptionNodes = cmp.querySelectorAll('.Select-option');
        expect(selectMenuOptionNodes.length).toBe(3);

        expect(selectMenuOptionNodes[0].innerHTML).toBe('k0');
        expect(!!selectMenuOptionNodes[0].getAttribute('class').match('is-selected')).toBe(false);

        expect(selectMenuOptionNodes[1].innerHTML).toBe('k1');
        expect(!!selectMenuOptionNodes[1].getAttribute('class').match('is-selected')).toBe(true);

        expect(selectMenuOptionNodes[2].innerHTML).toBe('k2');
        expect(!!selectMenuOptionNodes[2].getAttribute('class').match('is-selected')).toBe(false);
    });

    it('test onChange handler', (done) => {
        TestUtils.act(() => {
            ReactDOM.render(
                <FeatureInfoFormatSelector
                    label="Info"
                    availableInfoFormat={data}
                    infoFormat={defaultVal}
                    onInfoFormatChange={(format) => {
                        try {
                            expect(format).toBe('v2');
                        } catch (e) {
                            done(e);
                        }
                        done();
                    }}/>
                , document.getElementById("container"));
        });

        const cmp = document.querySelector('.form-group');
        expect(cmp).toBeTruthy();

        const input = cmp.querySelector('input');
        expect(input).toBeTruthy();

        TestUtils.act(() => {
            TestUtils.Simulate.focus(input);
            TestUtils.Simulate.keyDown(input, { key: 'ArrowDown', keyCode: 40 });
        });

        const selectMenuOptionNodes = cmp.querySelectorAll('.Select-option');
        expect(selectMenuOptionNodes.length).toBe(3);
        TestUtils.act(() => {
            TestUtils.Simulate.mouseDown(selectMenuOptionNodes[2]);
        });
        const selectValue = cmp.querySelector('.Select-value');
        expect(selectValue.children[0].innerHTML).toBe('k2');
    });

});
