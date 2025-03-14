/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { Editor } from 'react-draft-wysiwyg';
import { Tabs, Tab, Checkbox } from 'react-bootstrap';
import { htmlToDraftJSEditorState, draftJSEditorStateToHtml } from '../../../utils/EditorUtils';
import Message from '../../../components/I18N/Message';
import FlexBox from '../../../components/layout/FlexBox';

function ResourceAboutEditor({
    value,
    settings,
    onChange
}) {
    const [editorState, setEditorState] = useState(htmlToDraftJSEditorState(value || ''));
    return (
        <Tabs>
            <Tab eventKey="content" title={'Content'}>
                <Editor
                    wrapperClassName="resource-about-editor"
                    editorState={editorState}
                    stripPastedStyles
                    onEditorStateChange={(newEditorState) => {
                        setEditorState(newEditorState);
                        const previousHTML = draftJSEditorStateToHtml(editorState);
                        const newHTML = draftJSEditorStateToHtml(newEditorState);
                        if (newHTML !== previousHTML) {
                            onChange({ 'attributes.details': newHTML });
                        }
                    }}
                    toolbar={{
                        options: ['fontFamily', 'blockType', 'inline', 'textAlign', 'colorPicker', 'list', 'link', 'remove', 'image'],
                        image: {
                            className: undefined,
                            component: undefined,
                            popupClassName: undefined,
                            urlEnabled: true,
                            uploadEnabled: true,
                            alignmentEnabled: true,
                            uploadCallback: (file) => new Promise((resolve, reject) => {
                                const reader = new FileReader();
                                reader.addEventListener('load', () => {
                                    resolve({data: {link: reader.result}});
                                });
                                if (file) {
                                    reader.readAsDataURL(file);
                                } else {
                                    reject();
                                }
                            }),
                            previewImage: true,
                            inputAccept: 'image/gif,image/jpeg,image/jpg,image/png,image/svg',
                            alt: { present: false, mandatory: false },
                            defaultSize: {
                                height: 'auto',
                                width: 'auto'
                            }
                        }
                    }}
                />
            </Tab>
            <Tab eventKey="settings" title={'Settings'}>
                <FlexBox column gap="sm" classNames={['_padding-tb-sm']}>
                    <Checkbox
                        checked={!!settings?.showAsModal}
                        onChange={(event) => onChange({ 'attributes.detailsSettings.showAsModal': event.target.checked })}
                    >
                        <Message msgId="map.details.showAsModal" />
                    </Checkbox>
                    <Checkbox
                        checked={!!settings?.showAtStartup}
                        onChange={(event) => onChange({ 'attributes.detailsSettings.showAtStartup': event.target.checked })}
                    >
                        <Message msgId="map.details.showAtStartup" />
                    </Checkbox>
                </FlexBox>
            </Tab>
        </Tabs>
    );
}

export default ResourceAboutEditor;
