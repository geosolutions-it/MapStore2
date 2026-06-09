/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';

import EnumerateEditor from '../EnumerateEditor';

let testColumn = {
    key: 'columnKey'
};

describe('FeatureGrid EnumerateEditor component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should render with valid value from enum', () => {
        const schema = {
            'enum': ['option1', 'option2', 'option3']
        };
        const cmp = ReactDOM.render(
            <EnumerateEditor
                value="option1"
                column={testColumn}
                schema={schema}
            />,
            document.getElementById("container")
        );
        expect(cmp).toBeTruthy();
        expect(cmp.getValue().columnKey).toBe('option1');
        const container = document.getElementById("container");
        const editorDiv = container.querySelector('.ms-cell-editor');
        expect(editorDiv).toBeTruthy();
        expect(editorDiv.className).toNotInclude('invalid');
    });

    it('should render with invalid value not in enum', () => {
        const schema = {
            'enum': ['option1', 'option2', 'option3']
        };
        const cmp = ReactDOM.render(
            <EnumerateEditor
                value="invalidOption"
                column={testColumn}
                schema={schema}
            />,
            document.getElementById("container")
        );
        expect(cmp).toBeTruthy();
        expect(cmp.getValue().columnKey).toBe('invalidOption');
        const container = document.getElementById("container");
        const editorDiv = container.querySelector('.ms-cell-editor');
        expect(editorDiv).toBeTruthy();
        expect(editorDiv.className).toInclude('invalid');
    });

    it('should handle null value', () => {
        const schema = {
            'enum': ['option1', 'option2', null]
        };
        const cmp = ReactDOM.render(
            <EnumerateEditor
                value={null}
                column={testColumn}
                schema={schema}
            />,
            document.getElementById("container")
        );
        expect(cmp).toBeTruthy();
        expect(cmp.getValue().columnKey).toBe(null);
        const container = document.getElementById("container");
        const editorDiv = container.querySelector('.ms-cell-editor');
        expect(editorDiv).toBeTruthy();
        // null is in enum, so should be valid
        expect(editorDiv.className).toNotInclude('invalid');
    });

    it('should handle null value when not in enum', () => {
        const schema = {
            'enum': ['option1', 'option2']
        };
        const cmp = ReactDOM.render(
            <EnumerateEditor
                value={null}
                column={testColumn}
                schema={schema}
            />,
            document.getElementById("container")
        );
        expect(cmp).toBeTruthy();
        expect(cmp.getValue().columnKey).toBe(null);
        const container = document.getElementById("container");
        const editorDiv = container.querySelector('.ms-cell-editor');
        expect(editorDiv).toBeTruthy();
        // null is not in enum, so should be invalid
        expect(editorDiv.className).toInclude('invalid');
    });

    it('should handle number values in enum', () => {
        const schema = {
            'enum': [1, 2, 3]
        };
        const cmp = ReactDOM.render(
            <EnumerateEditor
                value={2}
                column={testColumn}
                schema={schema}
            />,
            document.getElementById("container")
        );
        expect(cmp).toBeTruthy();
        expect(cmp.getValue().columnKey).toBe(2);
        const container = document.getElementById("container");
        const editorDiv = container.querySelector('.ms-cell-editor');
        expect(editorDiv).toBeTruthy();
        expect(editorDiv.className).toNotInclude('invalid');
    });

    it('should handle empty enum array', () => {
        const schema = {
            'enum': []
        };
        const cmp = ReactDOM.render(
            <EnumerateEditor
                value="anyValue"
                column={testColumn}
                schema={schema}
            />,
            document.getElementById("container")
        );
        expect(cmp).toBeTruthy();
        expect(cmp.getValue().columnKey).toBe('anyValue');
        const container = document.getElementById("container");
        const editorDiv = container.querySelector('.ms-cell-editor');
        expect(editorDiv).toBeTruthy();
        // Empty enum means no valid options, so any value is invalid
        expect(editorDiv.className).toInclude('invalid');
    });

    it('should handle missing schema', () => {
        const cmp = ReactDOM.render(
            <EnumerateEditor
                value="value"
                column={testColumn}
            />,
            document.getElementById("container")
        );
        expect(cmp).toBeTruthy();
        expect(cmp.getValue().columnKey).toBe('value');
        const container = document.getElementById("container");
        const editorDiv = container.querySelector('.ms-cell-editor');
        expect(editorDiv).toBeTruthy();
        // No enum means no valid options
        expect(editorDiv.className).toInclude('invalid');
    });

    it('should handle undefined value', () => {
        const schema = {
            'enum': ['option1', 'option2']
        };
        const cmp = ReactDOM.render(
            <EnumerateEditor
                value={undefined}
                column={testColumn}
                schema={schema}
            />,
            document.getElementById("container")
        );
        expect(cmp).toBeTruthy();
        expect(cmp.getValue().columnKey).toBe(undefined);
        const container = document.getElementById("container");
        const editorDiv = container.querySelector('.ms-cell-editor');
        expect(editorDiv).toBeTruthy();
        // undefined is not in enum, so should be invalid
        expect(editorDiv.className).toInclude('invalid');
    });

    it('should call getOption correctly for null value', () => {
        const schema = {
            'enum': ['option1', null]
        };
        const cmp = ReactDOM.render(
            <EnumerateEditor
                value={null}
                column={testColumn}
                schema={schema}
            />,
            document.getElementById("container")
        );
        expect(cmp).toBeTruthy();
        const option = cmp.getOption(null);
        expect(option.value).toBe(null);
        expect(option.label).toBe('');
    });

    it('should call getOption correctly for string value', () => {
        const schema = {
            'enum': ['option1', 'option2']
        };
        const cmp = ReactDOM.render(
            <EnumerateEditor
                value="option1"
                column={testColumn}
                schema={schema}
            />,
            document.getElementById("container")
        );
        expect(cmp).toBeTruthy();
        const option = cmp.getOption('test');
        expect(option.value).toBe('test');
        expect(option.label).toBe('test');
    });

    it('should call getOption correctly for number value', () => {
        const schema = {
            'enum': [1, 2, 3]
        };
        const cmp = ReactDOM.render(
            <EnumerateEditor
                value={1}
                column={testColumn}
                schema={schema}
            />,
            document.getElementById("container")
        );
        expect(cmp).toBeTruthy();
        const option = cmp.getOption(42);
        expect(option.value).toBe(42);
        expect(option.label).toBe('42');
    });

    it('should handle onTemporaryChanges callback', (done) => {
        const onTemporaryChanges = () => done();
        ReactDOM.render(
            <EnumerateEditor
                value="option1"
                column={testColumn}
                schema={{ 'enum': ['option1', 'option2'] }}
                onTemporaryChanges={onTemporaryChanges}
            />,
            document.getElementById("container")
        );
    });

    it('should handle column without key', () => {
        const schema = {
            'enum': ['option1', 'option2']
        };
        const cmp = ReactDOM.render(
            <EnumerateEditor
                value="option1"
                column={{}}
                schema={schema}
            />,
            document.getElementById("container")
        );
        expect(cmp).toBeTruthy();
        const result = cmp.getValue();
        expect(result).toBeTruthy();
        expect(result.undefined).toBe('option1');
    });

    it('should initialize state with value prop', () => {
        const schema = {
            'enum': ['option1', 'option2', 'option3']
        };
        const cmp = ReactDOM.render(
            <EnumerateEditor
                value="option1"
                column={testColumn}
                schema={schema}
            />,
            document.getElementById("container")
        );
        expect(cmp.state.selected.value).toBe('option1');
    });

    it('should initialize state with different value when remounted', () => {
        const schema = {
            'enum': ['option1', 'option2', 'option3']
        };
        let cmp = ReactDOM.render(
            <EnumerateEditor
                value="option1"
                column={testColumn}
                schema={schema}
            />,
            document.getElementById("container")
        );
        expect(cmp.state.selected.value).toBe('option1');

        // Unmount to create a fresh instance
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));

        // Remount with different value
        cmp = ReactDOM.render(
            <EnumerateEditor
                value="option2"
                column={testColumn}
                schema={schema}
            />,
            document.getElementById("container")
        );
        expect(cmp.state.selected.value).toBe('option2');
    });

    it('should handle mixed enum types (string and number)', () => {
        const schema = {
            'enum': ['option1', 2, 'option3']
        };
        const cmp = ReactDOM.render(
            <EnumerateEditor
                value={2}
                column={testColumn}
                schema={schema}
            />,
            document.getElementById("container")
        );
        expect(cmp).toBeTruthy();
        expect(cmp.getValue().columnKey).toBe(2);
        const container = document.getElementById("container");
        const editorDiv = container.querySelector('.ms-cell-editor');
        expect(editorDiv).toBeTruthy();
        expect(editorDiv.className).toNotInclude('invalid');
    });
});

