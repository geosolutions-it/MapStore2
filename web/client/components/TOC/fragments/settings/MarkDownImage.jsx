/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { EditorState, Modifier } from 'draft-js';
import {Glyphicon, Tooltip, OverlayTrigger} from 'react-bootstrap';
import Message from '../../../I18N/Message';

/**
 * Component used in the react-draft-wysiwyg for wrapping the selected text with
 * @param {Object} editorState state object of the draft-js lib
 * @param {Function} onChange triggered to update text content change event in the editor
 */
const MarkDownImage = ({
    editorState,
    onChange
}) => {

    const onClick = () => {

        const selectionState = editorState.getSelection();
        const anchorKey = selectionState.getAnchorKey();
        const currentContent = editorState.getCurrentContent();
        const currentContentBlock = currentContent.getBlockForKey(anchorKey);
        const start = selectionState.getStartOffset();
        const end = selectionState.getEndOffset();
        const selectedText = currentContentBlock.getText().slice(start, end);
        const contentState = Modifier.replaceText(
            currentContent,
            selectionState,
            `![image](${selectedText})`,
            editorState.getCurrentInlineStyle()
        );
        onChange(EditorState.push(editorState, contentState, 'insert-characters'));
    };
    const tooltip = (<Tooltip>
        <Message msgId="layerProperties.editCustomFormat"/>
    </Tooltip>);

    return (
        <OverlayTrigger placement="bottom" overlay={tooltip}>
            <div className="rdw-image-wrapper">
                <div className="rdw-option-wrapper">
                    <Glyphicon glyph="picture" onClick={onClick}/>
                </div>
            </div>
        </OverlayTrigger>
    );
};

export default MarkDownImage;

MarkDownImage.propTypes = {
    editorState: PropTypes.object,
    onChange: PropTypes.func
};
