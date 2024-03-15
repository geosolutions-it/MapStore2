/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React, { useState } from 'react';
import isFunction from 'lodash/isFunction';
import { FormGroup, FormControl, ControlLabel, HelpBlock } from "react-bootstrap";
import Message from '../../../components/I18N/Message';
import { htmlToDraftJSEditorState, draftJSEditorStateToHtml } from '../../../utils/EditorUtils';
import withDebounceOnCallback from '../../../components/misc/enhancers/withDebounceOnCallback';
import CompactRichTextEditor from '../../../components/mapviews/settings/CompactRichTextEditor';

const DescriptionEditor = withDebounceOnCallback('onEditorStateChange', 'editorState')(CompactRichTextEditor);

function AnnotationsFields({
    preview,
    properties = {},
    fields = [
        {
            name: 'title',
            type: 'text',
            validator: (val) => val,
            validateError: 'annotations.mandatory',
            showLabel: true,
            editable: true
        },
        {
            name: 'description',
            type: 'html',
            showLabel: true,
            editable: true
        }
    ],
    onChange = () => {}
}) {
    const [editorState, setEditorState] = useState(fields.filter(field => field.type === 'html').reduce((acc, field) => ({ ...acc, [field.name]: htmlToDraftJSEditorState(properties[field.name] || '') }), {}));

    if (preview) {
        return (<div className="ms-annotations-fields preview">
            {fields.map((field) => {
                const showLabel = field.showLabel;
                return (
                    <div key={field.name} className="ms-annotations-field">
                        {showLabel && <div className="ms-annotations-field-label">
                            <Message msgId={`annotations.field.${field.name}`} />
                        </div>}
                        <div className="ms-annotations-field-value" dangerouslySetInnerHTML={{ __html: properties[field.name] }} />
                    </div>
                );
            })}
        </div>);
    }

    return (
        <form className="ms-annotations-fields">
            {fields.map((field) => {
                const validator = isFunction(field.validator) ? field.validator : null;
                const isValid = validator && validator(properties[field.name]);
                const validateError = field.validateError || 'annotations.mandatory';
                const showLabel = field.showLabel;
                const isEditable = field.editable;
                if (field.type === 'text') {
                    return (
                        <FormGroup
                            key={field.name}
                            controlId={`annotations-${field.name}`}
                            validationState={validator ? isValid ? 'success' : 'error' : null}
                        >
                            {showLabel && <ControlLabel>
                                <Message msgId={`annotations.field.${field.name}`} />
                            </ControlLabel>}
                            <FormControl
                                disabled={!isEditable}
                                type="text"
                                value={properties[field.name]}
                                onChange={(event) => onChange({
                                    [field.name]: event.target.value
                                })}
                            />
                            {validator && !isValid && <HelpBlock><Message msgId={validateError} /></HelpBlock>}
                        </FormGroup>
                    );
                }
                if (field.type === 'html') {
                    return (
                        <FormGroup
                            key={field.name}
                            controlId={`annotations-${field.name}`}
                            validationState={validator ? isValid ? 'success' : 'error' : null}
                        >
                            {showLabel && <ControlLabel>
                                <Message msgId={`annotations.field.${field.name}`} />
                            </ControlLabel>}
                            {isEditable
                                ? <DescriptionEditor
                                    editorState={editorState[field.name]}
                                    onEditorStateChange={(newEditorState) => {
                                        const previousHTML = draftJSEditorStateToHtml(editorState[field.name]);
                                        const newHTML = draftJSEditorStateToHtml(newEditorState);
                                        if (newHTML !== previousHTML) {
                                            onChange({ [field.name]: draftJSEditorStateToHtml(newEditorState) });
                                            setEditorState((prevEditorState) => ({ ...prevEditorState, [field.name]: newEditorState }));
                                        }
                                    }}
                                />
                                : <div dangerouslySetInnerHTML={{ __html: properties[field.name] }} />}
                            {validator && !isValid && <HelpBlock><Message msgId={validateError} /></HelpBlock>}
                        </FormGroup>
                    );
                }
                return null;
            })}
        </form>
    );
}

export default AnnotationsFields;
