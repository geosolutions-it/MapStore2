/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Message from '../../../I18N/Message';
import Portal from '../../../misc/Portal';
import ResizableModal from '../../../misc/ResizableModal';
import CompactRichTextEditor from '../../../mapviews/settings/CompactRichTextEditor';
import withDebounceOnCallback from '../../../misc/enhancers/withDebounceOnCallback';
import { htmlToDraftJSEditorState, draftJSEditorStateToHtml } from '../../../../utils/EditorUtils';

const DescriptionEditor = withDebounceOnCallback('onEditorStateChange', 'editorState')(CompactRichTextEditor);
/**
 * Component for rendering FeatureInfoEditor a modal editor to modify format template
 * @memberof components.TOC.fragments.settings
 * @name FeatureInfoEditor
 * @class
 * @prop {object} element data of the current selected node
 * @prop {boolean} showEditor show/hide modal
 * @prop {function} onShowEditor called when click on close buttons
 * @prop {function} onChange called when text in editor has been changed
 * @prop {boolean} enableIFrameModule enable iframe in editor, default true
 */

const FeatureInfoEditor = ({
    element,
    showEditor,
    onShowEditor,
    onChange,
    enableIFrameModule
}) => {

    const [editorState, setEditorState] = useState(htmlToDraftJSEditorState(element?.featureInfo?.template || ''));
    const onClose = () => {
        onShowEditor(!showEditor);
        onChange('featureInfo', {
            ...(element && element.featureInfo || {}),
            template: draftJSEditorStateToHtml(editorState)
        });
    };
    return (
        <Portal>
            <ResizableModal
                fade
                show={showEditor}
                title={<Message msgId="layerProperties.editCustomFormat"/>}
                size="lg"
                showFullscreen
                clickOutEnabled={false}
                onClose={onClose}
                buttons={[
                    {
                        bsStyle: 'primary',
                        text: <Message msgId="close"/>,
                        onClick: onClose
                    }
                ]}>
                <div id="ms-template-editor" className="ms-editor">
                    <DescriptionEditor
                        toolbarOptions={['fontFamily', 'blockType', 'inline', 'textAlign', 'list', 'link', 'colorPicker', 'remove', 'image'].concat(enableIFrameModule ? ['embedded'] : [])}
                        editorState={editorState}
                        onEditorStateChange={(newEditorState) => {
                            const previousHTML = draftJSEditorStateToHtml(editorState);
                            const newHTML = draftJSEditorStateToHtml(newEditorState);
                            if (newHTML !== previousHTML) {
                                onChange({ template: draftJSEditorStateToHtml(newEditorState) });
                                setEditorState(newEditorState);
                            }
                        }}
                    />
                </div>
            </ResizableModal>
        </Portal>
    );
};

FeatureInfoEditor.propTypes = {
    showEditor: PropTypes.bool,
    element: PropTypes.object,
    onChange: PropTypes.func,
    onShowEditor: PropTypes.func,
    enableIFrameModule: PropTypes.bool
};

FeatureInfoEditor.defaultProps = {
    showEditor: false,
    element: {},
    enableIFrameModule: false,
    onChange: () => {},
    onShowEditor: () => {}
};


export default FeatureInfoEditor;
