/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';
import expect from 'expect';

import FormatEditor from '../FormatEditor';

let testColumn = {
    key: 'columnKey'
};

describe('FormatEditor tests', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('FormatEditor with defaults', () => {
        const cmp = ReactDOM.render(<FormatEditor
            value="value"
            rowIdx={1}
            column={testColumn}/>, document.getElementById("container"));
        expect(cmp).toExist();
        const input = document.getElementsByTagName("input")[0];
        expect(input).toExist();
    });
    it('FormatEditor with a valid input', () => {
        const cmp = ReactDOM.render(<FormatEditor
            value="111"
            formatRegex="^[0-9]+$"
            rowIdx={1}
            column={testColumn}/>, document.getElementById("container"));
        expect(cmp).toExist();
        const input = document.getElementsByTagName("input")[0];
        expect(input).toExist();

        TestUtils.Simulate.change(input, {target: {value: '093'}});

        expect(cmp.getValue().columnKey).toBe('093');
        expect(cmp.state.isValid).toBe(true);
    });
    it('FormatEditor with an invalid input', () => {
        const cmp = ReactDOM.render(<FormatEditor
            value="111"
            formatRegex="^[0-9]+$"
            rowIdx={1}
            column={testColumn}/>, document.getElementById("container"));
        expect(cmp).toExist();
        const input = document.getElementsByTagName("input")[0];
        expect(input).toExist();

        TestUtils.Simulate.change(input, {target: {value: '09c'}});

        expect(cmp.getValue().columnKey).toBe('111');
        expect(cmp.state.isValid).toBe(false);
    });
});
