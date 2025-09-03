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
import TagsManagerEntry from '../TagsManagerEntry';
import { act, Simulate } from 'react-dom/test-utils';

describe('TagsManagerEntry component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should render with default', () => {
        ReactDOM.render(<TagsManagerEntry />, document.getElementById('container'));
        const tagEntry = document.querySelector('.ms-tags-manager-entry');
        expect(tagEntry).toBeTruthy();
    });
    it('should render tag information in ready only mode', () => {
        ReactDOM.render(<TagsManagerEntry name="Tag" description="The tag" color="#ff0000"/>, document.getElementById('container'));
        const tagEntry = document.querySelector('.ms-tags-manager-entry');
        expect(tagEntry).toBeTruthy();
        const texts = tagEntry.querySelectorAll('.ms-text');
        expect(texts.length).toBe(2);
        const computedStyle = getComputedStyle(texts[0]);
        expect(computedStyle.getPropertyValue('--tag-color-r')).toBe('255');
        expect(computedStyle.getPropertyValue('--tag-color-g')).toBe('0');
        expect(computedStyle.getPropertyValue('--tag-color-b')).toBe('0');
        expect(texts[0].innerHTML).toBe('Tag');
        expect(texts[1].innerHTML).toBe('The tag');
    });
    it('should allow to edit the name', (done) => {
        act(() => {
            ReactDOM.render(<TagsManagerEntry
                name="Tag"
                description="The tag"
                color="#ff0000"
                editing
                debounceTime={1}
                onChange={(value) => {
                    try {
                        expect(value).toEqual({ name: 'New Tag' });
                    } catch (e) {
                        done(e);
                    }
                    done();
                }}
            />, document.getElementById('container'));
        });
        const tagEntry = document.querySelector('.ms-tags-manager-entry');
        expect(tagEntry).toBeTruthy();
        const inputs = tagEntry.querySelectorAll('input');
        expect(inputs.length).toBe(2);
        Simulate.change(inputs[0], { target: { value: 'New Tag' } });
    });
    it('should allow to edit the description', (done) => {
        act(() => {
            ReactDOM.render(<TagsManagerEntry
                name="Tag"
                description="The tag"
                color="#ff0000"
                editing
                debounceTime={1}
                onChange={(value) => {
                    try {
                        expect(value).toEqual({ description: 'The new tag' });
                    } catch (e) {
                        done(e);
                    }
                    done();
                }}
            />, document.getElementById('container'));
        });
        const tagEntry = document.querySelector('.ms-tags-manager-entry');
        expect(tagEntry).toBeTruthy();
        const inputs = tagEntry.querySelectorAll('input');
        expect(inputs.length).toBe(2);
        Simulate.change(inputs[1], { target: { value: 'The new tag' } });
    });
});
