/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import { waitFor } from '@testing-library/react';

import EditableTextField, { getTooltipMessageId } from '../EditableTextField';

const render = (props = {}) => ReactDOM.render(<EditableTextField
    field="url"
    dataQa="editable-value"
    labelId="test.label"
    value="value"
    {...props}/>, document.getElementById('container'));
const getInput = () => document.querySelector('[data-qa="editable-value"]');
const getButton = () => document.querySelector('[data-qa="editable-value-edit"]');
const hasError = () => getInput().closest('.form-group').classList.contains('has-error');

describe('EditableTextField', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('renders a disabled value with the edit button when not editing', () => {
        const onEdit = expect.createSpy();
        const onConfirm = expect.createSpy();
        render({onEdit, onConfirm});
        expect(getInput().value).toBe('value');
        expect(getInput().disabled).toBe(true);
        expect(getButton().querySelector('.glyphicon-pencil')).toExist();
        expect(hasError()).toBe(false);
        ReactTestUtils.Simulate.click(getButton());
        expect(onEdit).toHaveBeenCalled();
        expect(onConfirm).toNotHaveBeenCalled();
    });

    it('edits and confirms the value while editing', () => {
        const onChange = expect.createSpy();
        const onConfirm = expect.createSpy();
        render({editing: true, onChange, onConfirm});
        expect(getInput().disabled).toBe(false);
        expect(getButton().querySelector('.glyphicon-ok')).toExist();
        ReactTestUtils.Simulate.change(getInput(), {target: {value: 'new value'}});
        expect(onChange).toHaveBeenCalledWith('new value');
        ReactTestUtils.Simulate.click(getButton());
        expect(onConfirm).toHaveBeenCalled();
    });

    it('locks the field and ignores clicks while busy', () => {
        const onEdit = expect.createSpy();
        const onConfirm = expect.createSpy();
        render({editing: true, busy: true, error: {code: 'service'}, onEdit, onConfirm});
        expect(getInput().disabled).toBe(true);
        expect(getButton().querySelector('.glyphicon')).toNotExist();
        expect(hasError()).toBe(false);
        ReactTestUtils.Simulate.click(getButton());
        expect(onEdit).toNotHaveBeenCalled();
        expect(onConfirm).toNotHaveBeenCalled();
    });

    it('shows the error state', () => {
        render({editing: true, error: {code: 'notFound', field: 'name'}});
        expect(hasError()).toBe(true);
        expect(getInput().disabled).toBe(false);
    });

    it('shows the tooltip for the current state', (done) => {
        render({editing: true, error: {code: 'service', field: 'url'}});
        waitFor(() => {
            ReactTestUtils.Simulate.mouseOver(getButton());
            expect(document.body.innerText).toContain('layerProperties.sourceField.service');
        })
            .then(() => done(), done);
    });

    it('does not show the tooltip while busy', (done) => {
        render({editing: true, busy: true});
        setTimeout(() => {
            ReactTestUtils.Simulate.mouseOver(getButton());
            setTimeout(() => {
                expect(document.body.innerText).toNotContain('layerProperties.sourceField');
                done();
            }, 50);
        }, 150);
    });

    it('getTooltipMessageId', () => {
        expect(getTooltipMessageId({field: 'url'})).toBe('layerProperties.sourceField.edit');
        expect(getTooltipMessageId({field: 'url', editing: true})).toBe('layerProperties.sourceField.confirm');
        expect(getTooltipMessageId({field: 'url', editing: true, error: {code: 'required', field: 'url'}}))
            .toBe('layerProperties.sourceField.required');
        expect(getTooltipMessageId({field: 'name', editing: true, error: {code: 'required', field: 'url'}}))
            .toBe('layerProperties.sourceField.requiredUrl');
        expect(getTooltipMessageId({field: 'searchUrl', editing: true, error: {code: 'required', field: 'searchTypeName'}}))
            .toBe('layerProperties.sourceField.requiredSearchTypeName');
        ['service', 'notFound', 'load', 'generic'].forEach((code) => {
            expect(getTooltipMessageId({field: 'name', editing: true, error: {code, field: 'url'}}))
                .toBe(`layerProperties.sourceField.${code}`);
        });
    });
});
