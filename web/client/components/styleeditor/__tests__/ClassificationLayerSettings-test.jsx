/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import ReactDOM from 'react-dom';
import ClassificationLayerSettings from '../ClassificationLayerSettings';
import { Simulate, act } from 'react-dom/test-utils';
import expect from 'expect';
import { waitFor } from '@testing-library/dom';

describe('ClassificationLayerSettings', () => {
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
        ReactDOM.render(<ClassificationLayerSettings />, document.getElementById("container"));
        const button = document.querySelector('button');
        const settings = document.querySelector('.ms-classification-layer-settings');
        expect(button).toBeTruthy();
        expect(settings).toBeFalsy();
    });
    it('should open popover on click', () => {
        ReactDOM.render(<ClassificationLayerSettings />, document.getElementById("container"));
        const button = document.querySelector('button');
        expect(button).toBeTruthy();
        Simulate.click(button);
        const settings = document.querySelector('.ms-classification-layer-settings');
        expect(settings).toBeTruthy();
    });
    it('should prevent close when params are invalid', (done) => {
        act(() => {
            ReactDOM.render(
                <ClassificationLayerSettings
                    editorRef={(ref) => {
                        if (ref?.editor) {
                            expect(ref.editor.doc).toBeTruthy();
                            ref.editor.setValue('params: [');
                            waitFor(() => document.querySelector('.error-area'))
                                .then(() => {
                                    const settings = document.querySelector('.ms-classification-layer-settings');
                                    const button = settings.querySelector('button');
                                    Simulate.click(button);
                                    const alert = document.querySelector('.ms-style-editor-alert');
                                    expect(alert).toBeTruthy();
                                    done();
                                });
                        }
                    }}
                />, document.getElementById("container"));
        });
        const button = document.querySelector('button');
        expect(button).toBeTruthy();
        Simulate.click(button);
        const settings = document.querySelector('.ms-classification-layer-settings');
        expect(settings).toBeTruthy();
    });
});
