/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import CompactRichTextEditor from '../CompactRichTextEditor';
import expect from 'expect';
import TestUtils from 'react-dom/test-utils';

describe('CompactRichTextEditor component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should render with default which does not include image upload', () => {
        ReactDOM.render(<CompactRichTextEditor />, document.getElementById("container"));
        const textEditorContainer = document.querySelector(".ms-compact-text-editor.rdw-editor-wrapper");
        expect(textEditorContainer).toBeTruthy();
        // check img upload btn
        const imageWidget = document.querySelector(".rdw-image-wrapper .rdw-option-wrapper");
        TestUtils.act(() => {
            TestUtils.Simulate.click(imageWidget);
        });
        const uploadImgInput = document.querySelector(".rdw-image-modal-upload-option");
        expect(uploadImgInput).toBeFalsy();
    });
    it('test rendering TextEditor with enabling image upload [uploadEnabled]', () => {
        ReactDOM.render(<CompactRichTextEditor uploadEnabled />, document.getElementById("container"));
        const textEditorContainer = document.querySelector(".ms-compact-text-editor.rdw-editor-wrapper");
        expect(textEditorContainer).toBeTruthy();
        const imageWidget = document.querySelector(".rdw-image-wrapper .rdw-option-wrapper");
        TestUtils.act(() => {
            TestUtils.Simulate.click(imageWidget);
        });
        const uploadImgInput = document.querySelector(".rdw-image-modal-upload-option");
        expect(uploadImgInput).toBeTruthy();
    });
});
