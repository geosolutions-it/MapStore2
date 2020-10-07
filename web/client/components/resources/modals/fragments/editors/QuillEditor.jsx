/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactQuill from 'react-quill';
import {identity} from 'lodash';

import 'react-quill/dist/quill.snow.css';

const Editor = ({
    modules = {
        toolbar: [
            [{ 'size': ['small', false, 'large', 'huge'] }, 'bold', 'italic', 'underline', 'blockquote'],
            [{ 'list': 'bullet' }, { 'align': [] }],
            [{ 'color': [] }, { 'background': [] }, 'clean'], ['image', 'link']
        ]
    },
    editorState,
    onUpdateEditorState = () => {}
}) => (
    <div id="ms-details-editor">
        <ReactQuill
            bounds={"#ms-details-editor"}
            value={editorState || '<p><br></p>'}
            onChange={(details) => {
                onUpdateEditorState(details);
            }}
            modules={modules} />
    </div>
);

export default {
    component: Editor,
    detailsTextToEditorState: identity,
    editorStateToDetailsText: identity,
    containerBodyClass: 'ms-details-quill-editor'
};
