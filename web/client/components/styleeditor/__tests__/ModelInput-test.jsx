/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import ReactDOM from 'react-dom';
import ModelInput from '../ModelInput';
import { act } from 'react-dom/test-utils';
import expect from 'expect';

describe('ModelInput component', () => {
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
        act(() => {
            ReactDOM.render(<ModelInput />, document.getElementById("container"));
        });
        const modelInputNode = document.querySelector('.ms-style-editor-model-input');
        expect(modelInputNode).toBeTruthy();
    });
    it('should throw an error if url is invalid', (done) => {
        act(() => {
            ReactDOM.render(
                <ModelInput
                    value="invalid-url"
                    onError={(error) => {
                        expect(error).toBe(true);
                        done();
                    }}
                />, document.getElementById("container"));
        });
        const modelInputNode = document.querySelector('.ms-style-editor-model-input');
        expect(modelInputNode).toBeTruthy();
    });
    it('should not throw an error if url is valid', (done) => {
        act(() => {
            ReactDOM.render(
                <ModelInput
                    value="https://path-to.org/file.glb"
                    onError={(error) => {
                        expect(error).toBe(false);
                        done();
                    }}
                />, document.getElementById("container"));
        });
        const modelInputNode = document.querySelector('.ms-style-editor-model-input');
        expect(modelInputNode).toBeTruthy();
    });
});
