/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';

import CellValidationErrorMessage from '../CellValidationErrorMessage';

describe('Tests CellValidationErrorMessage component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should return null when valid is true', () => {
        const props = {
            value: 'test',
            valid: true,
            column: { key: 'testColumn' },
            changed: false
        };
        const comp = ReactDOM.render(<CellValidationErrorMessage {...props} />, document.getElementById("container"));
        expect(comp).toBe(null);
        const container = document.getElementById("container");
        expect(container.querySelector('.ms-cell-validation-indicator')).toNotExist();
    });

    it('should return null when column.key is geometry', () => {
        const props = {
            value: 'test',
            valid: false,
            column: { key: 'geometry' },
            changed: false
        };
        const comp = ReactDOM.render(<CellValidationErrorMessage {...props} />, document.getElementById("container"));
        expect(comp).toBe(null);
        const container = document.getElementById("container");
        expect(container.querySelector('.ms-cell-validation-indicator')).toNotExist();
    });

    it('should render validation error indicator when valid is false', () => {
        const props = {
            value: 'test',
            valid: false,
            column: { key: 'testColumn' },
            changed: false
        };
        ReactDOM.render(<CellValidationErrorMessage {...props} />, document.getElementById("container"));
        const container = document.getElementById("container");
        const indicator = container.querySelector('.ms-cell-validation-indicator');
        expect(indicator).toBeTruthy();
        expect(indicator.getAttribute('class')).toInclude('ms-warning-text');
    });

    it('should show placeholder span when value is empty string', () => {
        const props = {
            value: '',
            valid: false,
            column: { key: 'testColumn' },
            changed: false
        };
        ReactDOM.render(<CellValidationErrorMessage {...props} />, document.getElementById("container"));
        const container = document.getElementById("container");
        const placeholder = container.querySelector('span[style*="height: 1em"]');
        expect(placeholder).toBeTruthy();
        expect(placeholder.style.height).toBe('1em');
        expect(placeholder.style.display).toBe('inline-block');
    });

    it('should show placeholder span when value is null', () => {
        const props = {
            value: null,
            valid: false,
            column: { key: 'testColumn' },
            changed: false
        };
        ReactDOM.render(<CellValidationErrorMessage {...props} />, document.getElementById("container"));
        const container = document.getElementById("container");
        const placeholder = container.querySelector('span[style*="height: 1em"]');
        expect(placeholder).toBeTruthy();
    });

    it('should show danger class when changed is true', () => {
        const props = {
            value: 'test',
            valid: false,
            column: { key: 'testColumn' },
            changed: true
        };
        ReactDOM.render(<CellValidationErrorMessage {...props} />, document.getElementById("container"));
        const container = document.getElementById("container");
        const indicator = container.querySelector('.ms-cell-validation-indicator');
        expect(indicator).toBeTruthy();
        expect(indicator.getAttribute('class')).toInclude('ms-danger-text');
        expect(indicator.getAttribute('class')).toNotInclude('ms-warning-text');
    });

    it('should show warning class when changed is false and not primary key', () => {
        const props = {
            value: 'test',
            valid: false,
            column: { key: 'testColumn', isPrimaryKey: false },
            changed: false
        };
        ReactDOM.render(<CellValidationErrorMessage {...props} />, document.getElementById("container"));
        const container = document.getElementById("container");
        const indicator = container.querySelector('.ms-cell-validation-indicator');
        expect(indicator).toBeTruthy();
        expect(indicator.getAttribute('class')).toInclude('ms-warning-text');
        expect(indicator.getAttribute('class')).toNotInclude('ms-danger-text');
        expect(indicator.getAttribute('class')).toNotInclude('ms-info-text');
    });

    it('should show info class when isPrimaryKey is true', () => {
        const props = {
            value: 'test',
            valid: false,
            column: { key: 'testColumn', isPrimaryKey: true },
            changed: false
        };
        ReactDOM.render(<CellValidationErrorMessage {...props} />, document.getElementById("container"));
        const container = document.getElementById("container");
        const indicator = container.querySelector('.ms-cell-validation-indicator');
        expect(indicator).toBeTruthy();
        expect(indicator.getAttribute('class')).toInclude('ms-info-text');
        expect(indicator.getAttribute('class')).toNotInclude('ms-warning-text');
    });

    it('should show danger class when changed is true even if isPrimaryKey is true', () => {
        const props = {
            value: 'test',
            valid: false,
            column: { key: 'testColumn', isPrimaryKey: true },
            changed: true
        };
        ReactDOM.render(<CellValidationErrorMessage {...props} />, document.getElementById("container"));
        const container = document.getElementById("container");
        const indicator = container.querySelector('.ms-cell-validation-indicator');
        expect(indicator).toBeTruthy();
        expect(indicator.getAttribute('class')).toInclude('ms-danger-text');
        expect(indicator.getAttribute('class')).toNotInclude('ms-info-text');
    });

    it('should render with default props', () => {
        ReactDOM.render(<CellValidationErrorMessage />, document.getElementById("container"));
        // When valid is undefined (falsy) and column.key is undefined (not 'geometry'), it should render
        // But since column is {} by default, column.key is undefined, so it will render
        const container = document.getElementById("container");
        // Component should render because valid is falsy and column.key is not 'geometry'
        const indicator = container.querySelector('.ms-cell-validation-indicator');
        expect(indicator).toBeTruthy();
    });

    it('should handle missing column prop gracefully', () => {
        const props = {
            value: 'test',
            valid: false,
            changed: false
        };
        ReactDOM.render(<CellValidationErrorMessage {...props} />, document.getElementById("container"));
        const container = document.getElementById("container");
        // Should render because valid is false and column.key is undefined (not 'geometry')
        const indicator = container.querySelector('.ms-cell-validation-indicator');
        expect(indicator).toBeTruthy();
    });

    it('should render glyphicon with exclamation-mark', () => {
        const props = {
            value: 'test',
            valid: false,
            column: { key: 'testColumn' },
            changed: false
        };
        ReactDOM.render(<CellValidationErrorMessage {...props} />, document.getElementById("container"));
        const container = document.getElementById("container");
        const indicator = container.querySelector('.ms-cell-validation-indicator');
        expect(indicator).toBeTruthy();
        expect(indicator.getAttribute('class')).toInclude('glyphicon');
        expect(indicator.getAttribute('class')).toInclude('glyphicon-exclamation-mark');
    });

    it('should handle column with schema and schemaRequired', () => {
        const props = {
            value: 'test',
            valid: false,
            column: {
                key: 'testColumn',
                schema: { type: 'string', minLength: 5 },
                schemaRequired: true
            },
            changed: false
        };
        ReactDOM.render(<CellValidationErrorMessage {...props} />, document.getElementById("container"));
        const container = document.getElementById("container");
        const indicator = container.querySelector('.ms-cell-validation-indicator');
        expect(indicator).toBeTruthy();
    });

    it('should handle column without schema', () => {
        const props = {
            value: 'test',
            valid: false,
            column: {
                key: 'testColumn'
            },
            changed: false
        };
        ReactDOM.render(<CellValidationErrorMessage {...props} />, document.getElementById("container"));
        const container = document.getElementById("container");
        const indicator = container.querySelector('.ms-cell-validation-indicator');
        expect(indicator).toBeTruthy();
    });
});

