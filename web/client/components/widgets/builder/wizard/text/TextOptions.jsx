/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from "react";
import { Col, Form, FormControl, FormGroup } from "react-bootstrap";
import localizedProps from "../../../../misc/enhancers/localizedProps";
import {
    htmlToDraftJSEditorState,
    draftJSEditorStateToHtml
} from "../../../../../utils/EditorUtils";

import withDebounceOnCallback from "../../../../misc/enhancers/withDebounceOnCallback";
import CompactRichTextEditor from "../../../../mapviews/settings/CompactRichTextEditor";

const TitleInput = localizedProps("placeholder")(FormControl);
const DescriptorEditor = withDebounceOnCallback(
    "onEditorStateChange",
    "editorState"
)(CompactRichTextEditor);

function TextOptions({ data = {}, onChange = () => {} }) {
    const [editorState, setEditorState] = useState(
        htmlToDraftJSEditorState(data.text || "")
    );

    return (
        <div>
            <Col key="form" xs={12}>
                <Form>
                    <FormGroup controlId="title">
                        <Col sm={12}>
                            <TitleInput
                                style={{ marginBottom: 10 }}
                                placeholder="widgets.builder.wizard.titlePlaceholder"
                                value={data.title}
                                type="text"
                                onChange={(e) =>
                                    onChange("title", e.target.value)
                                }
                            />
                        </Col>
                    </FormGroup>
                </Form>
            </Col>
            <DescriptorEditor
                uploadEnabled
                editorState={editorState}
                onEditorStateChange={(newEditorState) => {
                    const previousHTML = draftJSEditorStateToHtml(editorState);
                    const newHTML = draftJSEditorStateToHtml(newEditorState);
                    if (newHTML !== previousHTML) {
                        onChange(
                            "text",
                            draftJSEditorStateToHtml(newEditorState)
                        );
                        setEditorState(newEditorState);
                    }
                }}
                // Array of custom or built in fonts can be set via props
                // fonts={["Arial", "Impact", "Roman"]}
            />
        </div>
    );
}
export default TextOptions;
