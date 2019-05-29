/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const { Col, Form, FormGroup, FormControl } = require('react-bootstrap');
const localizedProps = require('../../../../misc/enhancers/localizedProps');
const TitleInput = localizedProps("placeholder")(FormControl);

const ReactQuill = require('react-quill');
const Editor = localizedProps("placeholder")(ReactQuill);
module.exports = ({ data = {}, onChange = () => { }}) => (
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
        <Editor placeholder="widgets.builder.wizard.textPlaceholder" value={data && data.text || ''} onChange={(val) => onChange("text", val)} />
</div>
);

