/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import Message from '../../../I18N/Message';

import { FormControl as FC, Form, Col, FormGroup, ControlLabel } from "react-bootstrap";
import localizedProps from '../../../misc/enhancers/localizedProps';

const FormControl = localizedProps('placeholder')(FC);

/**
 * Main Form for editing a catalog entry
 */
export default ({
    service = {},
    formats,
    urlLabel = <ControlLabel><Message msgId="catalog.url" /></ControlLabel>,
    urlPlaceholder,
    onChangeTitle,
    onChangeUrl,
    onChangeType
}) => (
    <Form horizontal >
        <FormGroup>
            <Col xs={12}>
                {urlLabel}
                <FormControl
                    type="text"
                    style={{
                        textOverflow: "ellipsis"
                    }}
                    placeholder={urlPlaceholder}
                    value={service && service.url}
                    onChange={(e) => onChangeUrl(e.target.value)} />
            </Col>
        </FormGroup>
        <FormGroup controlId="title" key="title">
            <Col xs={12} sm={3} md={3}>
                <ControlLabel><Message msgId="catalog.type" /></ControlLabel>
                <FormControl
                    onChange={(e) => onChangeType(e.target.value)}
                    value={service && service.type}
                    componentClass="select">
                    {formats.map((format) => <option value={format.name} key={format.name}>{format.label}</option>)}
                </FormControl>
            </Col>
            <Col xs={12} sm={9} md={9}>
                <ControlLabel><Message msgId="catalog.serviceTitle" /></ControlLabel>
                <FormControl
                    type="text"
                    style={{
                        textOverflow: "ellipsis"
                    }}
                    placeholder={"catalog.serviceTitlePlaceholder"}
                    value={service && service.title}
                    onChange={(e) => onChangeTitle(e.target.value)} />
            </Col>
        </FormGroup>
    </Form>);
