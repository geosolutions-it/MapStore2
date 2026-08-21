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
import { waitFor } from '@testing-library/react';

import LayerNameEditField from '../LayerNameEditField';

describe('LayerNameEditField component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('LayerNameEditField with defaults', () => {
        ReactDOM.render(<LayerNameEditField/>, document.getElementById('container'));
        const input = document.getElementsByTagName('input');
        expect(input.length).toBe(1);
        expect(input[0].getAttribute('disabled')).toNotBe(null);
        expect(input[0].getAttribute('data-qa')).toBe('layer-properties-name');
    });
    it('commits the edited service layer name', () => {
        const handlers = { onUpdateEntry: () => {} };
        const spy = expect.spyOn(handlers, 'onUpdateEntry');
        ReactDOM.render(
            <LayerNameEditField
                element={{name: 'old-name'}}
                onUpdateEntry={handlers.onUpdateEntry}/>,
            document.getElementById('container')
        );
        ReactTestUtils.act(() => {
            ReactTestUtils.Simulate.click(document.querySelector('.input-group-addon'));
        });
        ReactTestUtils.act(() => {
            ReactTestUtils.Simulate.change(document.querySelector('input'), {target: {value: 'new-name'}});
        });
        ReactTestUtils.act(() => {
            ReactTestUtils.Simulate.click(document.querySelector('.input-group-addon'));
        });
        expect(spy).toHaveBeenCalled();
        expect(spy.calls[0].arguments[0]).toBe('name');
        expect(spy.calls[0].arguments[1].target.value).toBe('new-name');
    });
    it('commits validation metadata with the edited layer name', (done) => {
        const handlers = {
            onValidate: () => Promise.resolve({fields: [{name: 'field'}]}),
            onUpdateEntry: () => {}
        };
        const validateSpy = expect.spyOn(handlers, 'onValidate').andCallThrough();
        const updateSpy = expect.spyOn(handlers, 'onUpdateEntry');
        ReactDOM.render(
            <LayerNameEditField
                element={{name: 'old-name'}}
                onValidate={handlers.onValidate}
                onUpdateEntry={handlers.onUpdateEntry}/>,
            document.getElementById('container')
        );
        ReactTestUtils.act(() => {
            ReactTestUtils.Simulate.click(document.querySelector('.input-group-addon'));
        });
        ReactTestUtils.act(() => {
            ReactTestUtils.Simulate.change(document.querySelector('input'), {target: {value: 'new-name'}});
        });
        ReactTestUtils.act(() => {
            ReactTestUtils.Simulate.click(document.querySelector('.input-group-addon'));
        });

        waitFor(() => expect(updateSpy).toHaveBeenCalled())
            .then(() => {
                expect(validateSpy.calls[0].arguments).toEqual(['new-name']);
                expect(updateSpy.calls[0].arguments[0]).toBe('name');
                expect(updateSpy.calls[0].arguments[1].target.value).toBe('new-name');
                expect(updateSpy.calls[0].arguments[2]).toEqual({fields: [{name: 'field'}]});
                done();
            })
            .catch(done);
    });
    it('keeps editing and does not commit when validation fails', (done) => {
        const handlers = {
            onValidate: () => Promise.reject(new Error('Invalid layer name')),
            onUpdateEntry: () => {}
        };
        const updateSpy = expect.spyOn(handlers, 'onUpdateEntry');
        ReactDOM.render(
            <LayerNameEditField
                element={{name: 'old-name'}}
                onValidate={handlers.onValidate}
                onUpdateEntry={handlers.onUpdateEntry}/>,
            document.getElementById('container')
        );
        ReactTestUtils.act(() => {
            ReactTestUtils.Simulate.click(document.querySelector('.input-group-addon'));
        });
        ReactTestUtils.act(() => {
            ReactTestUtils.Simulate.change(document.querySelector('input'), {target: {value: 'invalid-name'}});
        });
        ReactTestUtils.act(() => {
            ReactTestUtils.Simulate.click(document.querySelector('.input-group-addon'));
        });

        waitFor(() => expect(document.querySelector('.form-group').classList.contains('has-error')).toBe(true))
            .then(() => {
                expect(updateSpy).toNotHaveBeenCalled();
                expect(document.querySelector('input').getAttribute('disabled')).toBe(null);
                done();
            })
            .catch(done);
    });
});
