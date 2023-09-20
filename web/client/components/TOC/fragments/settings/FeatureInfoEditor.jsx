/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

import Message from '../../../I18N/Message';
import Portal from '../../../misc/Portal';
import ResizableModal from '../../../misc/ResizableModal';
import CompactRichTextEditor from '../../../mapviews/settings/CompactRichTextEditor';
import withDebounceOnCallback from '../../../misc/enhancers/withDebounceOnCallback';
import { htmlToDraftJSEditorState, draftJSEditorStateToHtml } from '../../../../utils/EditorUtils';
import { getMessageById } from '../../../../utils/LocaleUtils';

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
}, {messages}) => {
    const [, setCounter] = useState(0);
    useEffect(() => {
        const imageButton = document.querySelector(".rdw-image-wrapper");
        const clickImageToolbarListener = () => {
            setTimeout(() => {
                setCounter(value => value + 1);
            });
        };
        if (imageButton) {
            imageButton.addEventListener("click", clickImageToolbarListener);
        }
        return () => {
            if (imageButton) {
                imageButton?.removeEventListener("click", clickImageToolbarListener);
            }
        };

    }, [showEditor]);

    const [template, setTemplate] = useState(element?.featureInfo?.template || '');
    const [editorState, setEditorState] = useState(htmlToDraftJSEditorState(template));
    const onClose = () => {
        onShowEditor(!showEditor);
        onChange('featureInfo', {
            ...(element && element.featureInfo || {}),
            template: draftJSEditorStateToHtml(editorState)
        });
    };
    const imageField = document.querySelector(".rdw-image-modal-url-section");
    return (
        <Portal>
            <ResizableModal
                modalClassName="ms-feature-info-editor"
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
                    <style dangerouslySetInnerHTML={{__html: ".DraftEditor-editorContainer img::after {content: '" + getMessageById(messages, "layerProperties.imageNotFound") + "'}"} }/>
                    {imageField ? createPortal(<div className="guide-text"><Message msgId="layerProperties.guideText"/></div>, imageField) : null}

                    <DescriptionEditor
                        toolbarOptions={['fontFamily', 'blockType', 'inline', 'textAlign', 'list', 'link', 'colorPicker', 'remove', 'image'].concat(enableIFrameModule ? ['embedded'] : [])}
                        editorState={editorState}
                        onEditorStateChange={(newEditorState) => {
                            const previousHTML = draftJSEditorStateToHtml(editorState);
                            const images = document.querySelectorAll(".DraftEditor-editorContainer img");
                            const newHTML = draftJSEditorStateToHtml(newEditorState);
                            for (const img of images) {
                                // an alt value is needed for firefox to show the ::after and ::after pseudo elements
                                // empty space to avoid to show the alt value
                                // this is a different behaviour from chrome
                                img.alt = " ";

                            }
                            if (newHTML !== previousHTML) {
                                setTemplate(draftJSEditorStateToHtml(newEditorState));
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
FeatureInfoEditor.contextTypes = {
    messages: PropTypes.object
};

FeatureInfoEditor.defaultProps = {
    showEditor: false,
    element: {},
    enableIFrameModule: false,
    onChange: () => {},
    onShowEditor: () => {}
};


export default FeatureInfoEditor;
