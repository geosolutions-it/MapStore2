/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ContentState, EditorState, convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';

export const htmlToDraftJSEditorState = (html) => {
    const contentBlock = htmlToDraft(html);
    const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);

    return EditorState.createWithContent(contentState);
};

export const draftJSEditorStateToHtml = (editorState, emptyPlaceholder = '') => {
    const blocks = convertToRaw(editorState.getCurrentContent()).blocks;
    // it can happen that first block is empty, i.e. there is a carriage return
    const rawText = blocks.length === 1 ? convertToRaw(editorState.getCurrentContent()).blocks[0].text : true;
    const html = draftToHtml(convertToRaw(editorState.getCurrentContent()));

    return rawText ? html : emptyPlaceholder;
};
