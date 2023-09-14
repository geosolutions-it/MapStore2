/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import AnnotationsFields from '../AnnotationsFields';
import expect from 'expect';
import { Simulate } from 'react-dom/test-utils';

describe('AnnotationsFields component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should render with default', () => {
        ReactDOM.render(<AnnotationsFields />, document.getElementById("container"));
        const fieldsNode = document.querySelector('.ms-annotations-fields');
        expect(fieldsNode).toBeTruthy();
    });
    it('should render with preview', () => {
        ReactDOM.render(<AnnotationsFields preview properties={{ title: 'Title', description: '<p>Description</p>' }} />, document.getElementById("container"));
        const fieldsNode = document.querySelector('.ms-annotations-fields.preview');
        expect(fieldsNode).toBeTruthy();
        const field = [...fieldsNode.querySelectorAll('.ms-annotations-field')];
        expect(field.length).toBe(2);
        expect(field.map((node) => node.querySelector('.ms-annotations-field-value').innerHTML)).toEqual([ 'Title', '<p>Description</p>' ]);
    });
    it('should trigger on change', (done) => {
        ReactDOM.render(<AnnotationsFields
            onChange={(options) => {
                try {
                    expect(options).toEqual({ title: 'Title ' });
                } catch (e) {
                    done(e);
                }
                done();
            }}
            properties={{ title: 'Title', description: '<p>Description</p>' }}
        />, document.getElementById("container"));
        const fieldsNode = document.querySelector('.ms-annotations-fields');
        expect(fieldsNode).toBeTruthy();
        const input = [...fieldsNode.querySelectorAll('.form-control')];
        expect(input.length).toBe(1);
        Simulate.change(input[0], { target: { value: 'Title ' } });
    });
    it('should use custom fields', (done) => {
        ReactDOM.render(<AnnotationsFields
            fields={[{
                name: 'myattribute',
                type: 'text',
                editable: true,
                showLabel: true,
                validator: (value = '') => !value.includes('fake'),
                validateError: 'annotations.error.fake'
            }]}
            onChange={(options) => {
                try {
                    expect(options).toEqual({ myattribute: 'Ok' });
                } catch (e) {
                    done(e);
                }
                done();
            }}
            properties={{ myattribute: 'fake' }}
        />, document.getElementById("container"));
        const fieldsNode = document.querySelector('.ms-annotations-fields');
        expect(fieldsNode).toBeTruthy();
        const input = [...fieldsNode.querySelectorAll('.form-control')];
        expect(input.length).toBe(1);
        expect(input[0].value).toBe('fake');
        expect(fieldsNode.querySelector('.control-label').innerText).toBe('annotations.field.myattribute');
        expect(fieldsNode.querySelector('.help-block').innerText).toBe('annotations.error.fake');
        Simulate.change(input[0], { target: { value: 'Ok' } });
    });
});
