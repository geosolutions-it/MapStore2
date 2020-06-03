/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { identity } from 'lodash';

import QuillEditor from './QuillEditor';
import DraftJSEditor from './DraftJSEditor';

import { draftJSEditorStateToHtml } from '../../../utils/EditorUtils';

export default {
    'QuillEditor': {
        editor: QuillEditor,
        fromEditorState: identity
    },
    'DraftJSEditor': {
        editor: DraftJSEditor,
        fromEditorState: draftJSEditorStateToHtml,
        containerClassName: 'ms-details-draftjseditor-container'
    }
};
