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

import EditableTextField from '../EditableTextField';

describe('EditableTextField component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    const getInput = () => document.querySelector('[data-qa="editable-value"]');
    const getButton = () => document.querySelector('[data-qa="editable-value-edit"]');

    const editValue = (value) => {
        ReactTestUtils.Simulate.click(getButton());
        ReactTestUtils.Simulate.change(getInput(), {target: {value}});
        ReactTestUtils.Simulate.click(getButton());
    };

    it('force saves an unchanged value on the second click after validation fails', (done) => {
        const validationError = new Error('Service unavailable');
        const onValidate = expect.createSpy().andReturn(Promise.reject(validationError));
        const onChange = expect.createSpy();
        ReactDOM.render(<EditableTextField
            dataQa="editable-value"
            labelId="test.label"
            value="old"
            onValidate={onValidate}
            onChange={onChange}/>, document.getElementById('container'));

        editValue('new');

        waitFor(() => expect(getInput().closest('.form-group').classList.contains('has-error')).toBe(true))
            .then(() => {
                expect(onValidate.calls.length).toBe(1);
                expect(onChange).toNotHaveBeenCalled();
                ReactTestUtils.Simulate.mouseOver(getButton());
                return waitFor(() => expect(document.body.innerText)
                    .toContain('layerProperties.tooltip.confirmValue'));
            })
            .then(() => {
                ReactTestUtils.Simulate.click(getButton());
                expect(onValidate.calls.length).toBe(1);
                expect(onChange).toHaveBeenCalledWith('new', undefined, {forced: true});
                expect(getInput().getAttribute('disabled')).toNotBe(null);
                done();
            })
            .catch(done);
    });

    it('validates again when the value changes after a failure', (done) => {
        const onValidate = expect.createSpy().andCall((value) => value === 'bad'
            ? Promise.reject(new Error('Invalid value'))
            : Promise.resolve('metadata'));
        const onChange = expect.createSpy();
        ReactDOM.render(<EditableTextField
            dataQa="editable-value"
            labelId="test.label"
            value="old"
            onValidate={onValidate}
            onChange={onChange}/>, document.getElementById('container'));

        editValue('bad');

        waitFor(() => expect(getInput().closest('.form-group').classList.contains('has-error')).toBe(true))
            .then(() => {
                ReactTestUtils.Simulate.change(getInput(), {target: {value: 'good'}});
                ReactTestUtils.Simulate.click(getButton());
                return waitFor(() => expect(onChange).toHaveBeenCalled());
            })
            .then(() => {
                expect(onValidate.calls.length).toBe(2);
                expect(onChange).toHaveBeenCalledWith('good', 'metadata', {forced: false});
                done();
            })
            .catch(done);
    });

    it('does not force save an empty required value', () => {
        const onValidate = expect.createSpy();
        const onChange = expect.createSpy();
        ReactDOM.render(<EditableTextField
            dataQa="editable-value"
            labelId="test.label"
            value="old"
            required
            onValidate={onValidate}
            onChange={onChange}/>, document.getElementById('container'));

        editValue('');
        ReactTestUtils.Simulate.click(getButton());

        expect(onValidate).toNotHaveBeenCalled();
        expect(onChange).toNotHaveBeenCalled();
        expect(getInput().closest('.form-group').classList.contains('has-error')).toBe(true);
    });

    it('keeps editing until the updated layer finishes loading', (done) => {
        const onChange = expect.createSpy();
        const render = (props = {}) => ReactDOM.render(<EditableTextField
            dataQa="editable-value"
            labelId="test.label"
            value="old"
            waitForLayerLoad
            onValidate={() => Promise.resolve()}
            onChange={onChange}
            {...props}/>, document.getElementById('container'));
        render();
        editValue('new');

        waitFor(() => expect(onChange).toHaveBeenCalled())
            .then(() => {
                render({value: 'new', layerLoading: true});
                render({value: 'new', layerLoading: false, layerLoadingError: true});
                return waitFor(() => expect(getInput().closest('.form-group').classList.contains('has-error')).toBe(true));
            })
            .then(() => {
                expect(getInput().getAttribute('disabled')).toBe(null);
                ReactTestUtils.Simulate.click(getButton());
                expect(getInput().getAttribute('disabled')).toNotBe(null);
                expect(onChange.calls.length).toBe(2);
                expect(onChange.calls[1].arguments).toEqual(['new', undefined, {forced: true}]);
                done();
            })
            .catch(done);
    });
});
