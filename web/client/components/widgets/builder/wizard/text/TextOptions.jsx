/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Col, Form, FormControl, FormGroup } from 'react-bootstrap';
import ReactQuill from 'react-quill';

import localizedProps from '../../../../misc/enhancers/localizedProps';

const TitleInput = localizedProps("placeholder")(FormControl);

const Editor = localizedProps("placeholder")(ReactQuill);

export default ({ data = {}, onChange = () => { }}) => (
    <div>
        <Col key="form" xs={12}>
            <Form>
                <FormGroup controlId="title">
                    <Col sm={12}>
                        <TitleInput style={{ marginBottom: 10 }} placeholder="widgets.builder.wizard.titlePlaceholder" value={data.title} type="text" onChange={e => onChange("title", e.target.value)} />
                    </Col>
                </FormGroup>
            </Form>
        </Col>
        <Editor modules={{
            toolbar: [
                [{'size': ['small', false, 'large', 'huge'] }, 'bold', 'italic', 'underline', 'blockquote'],
                [{'list': 'bullet' }, {'align': [] }],
                [{'color': [] }, {'background': [] }, 'clean'], ['image', 'link']
            ]
        }} placeholder="widgets.builder.wizard.textPlaceholder" value={data && data.text || ''} onChange={(val) => onChange("text", val)} />
    </div>
);

