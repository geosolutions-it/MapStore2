/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { FormGroup } from 'react-bootstrap';
import { htmlToDraftJSEditorState, draftJSEditorStateToHtml } from '../../../utils/EditorUtils';
import withDebounceOnCallback from '../../misc/enhancers/withDebounceOnCallback';
import CompactRichTextEditor from './CompactRichTextEditor';
import Section from './Section';
import Message from '../../I18N/Message';

const DescriptionEditor = withDebounceOnCallback('onEditorStateChange', 'editorState')(CompactRichTextEditor);

function DescriptionSection({
    view = {},
    expandedSections = {},
    onExpandSection = () => {},
    onChange = () => {}
}) {
    const [editorState, setEditorState] = useState(htmlToDraftJSEditorState(view.description || ''));
    return (
        <Section
            title={<Message msgId="mapViews.description"/>}
            initialExpanded={expandedSections.description}
            onExpand={(expanded) => onExpandSection({ description: expanded })}
        >
            <FormGroup controlId="map-views-description" >
                <DescriptionEditor
                    editorState={editorState}
                    onEditorStateChange={(newEditorState) => {
                        const previousHTML = draftJSEditorStateToHtml(editorState);
                        const newHTML = draftJSEditorStateToHtml(newEditorState);
                        if (newHTML !== previousHTML) {
                            onChange({ description: draftJSEditorStateToHtml(newEditorState) });
                            setEditorState(newEditorState);
                        }
                    }}
                />
            </FormGroup>
        </Section>
    );
}

export default DescriptionSection;
