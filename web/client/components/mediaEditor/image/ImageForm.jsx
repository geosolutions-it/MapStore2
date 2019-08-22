/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { compose, withState, getContext } from 'recompose';
import { Form, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';

import BorderLayout from '../../layout/BorderLayout';
import Toolbar from '../../misc/toolbar/Toolbar';
import Message from '../../I18N/Message';
import LocaleUtils from '../../../utils/LocaleUtils';

const form = [
    {
        placeholder: "mediaEditor.imagePicker.sourcePlaceholder",
        type: "text",
        id: "src",
        label: <Message msgId = "mediaEditor.imagePicker.source"/>,
        validation: ({ src }) => src !== undefined && src === "" ?
            "error"
            : src
                ? "success"
                : undefined
    },
    {
        placeholder: "mediaEditor.imagePicker.titlePlaceholder",
        type: "text",
        id: "title",
        label: <Message msgId = "mediaEditor.imagePicker.title"/>,
        validation: ({ title }) => title !== undefined && title === "" ?
            "error"
            : title
                ? "success"
                : undefined
    },
    {
        placeholder: "mediaEditor.imagePicker.altTextPlaceholder",
        type: "text",
        id: "alt",
        label: <Message msgId = "mediaEditor.imagePicker.altText"/>
    },
    {
        placeholder: "mediaEditor.imagePicker.descriptionPlaceholder",
        type: "text",
        id: "description",
        label: <Message msgId = "mediaEditor.imagePicker.description"/>
    },
    {
        placeholder: "mediaEditor.imagePicker.creditsPlaceholder",
        type: "text",
        id: "credits",
        label: <Message msgId = "mediaEditor.imagePicker.credits"/>
    }
];

const enhance = compose(
    withState("properties", "setProperties", {}),
    getContext({messages: {}})
);


export default enhance(({
    properties = {},
    setAddingMedia = () => {},
    setProperties = () => {},
    onSave = () => {},
    messages
}) => (
    <BorderLayout
        className="ms-imageForm"
        header={
            <div
                className="text-center"
                key="toolbar"
                style={{
                    borderBottom: "1px solid #ddd",
                    padding: 8
                }}>
                    <Toolbar
                        btnGroupProps={{
                            style: {
                                marginBottom: 8
                            }
                        }}
                        btnDefaultProps={{
                            bsStyle: "primary",
                            className: "square-button-md"
                        }}
                        buttons={[{
                            glyph: "arrow-left",
                            tooltipId: "mediaEditor.imagePicker.back",
                            onClick: () => setAddingMedia(false)
                        }, {
                            glyph: "floppy-disk",
                            tooltipId: "mediaEditor.imagePicker.save",
                            disabled: !properties.src || !properties.title,
                            onClick: () => {
                                onSave(properties);
                            }
                        }]} />
            </div>
        }>
        <Form style={{ padding: 8 }}>
            {form.map((field) => (
                <FormGroup
                    key={field.id}
                    validationState={field.validation && field.validation(properties)}>
                    <ControlLabel>
                        {field.label}
                    </ControlLabel>
                    <FormControl
                        type={field.type}
                        placeholder={LocaleUtils.getMessageById(messages, field.placeholder)}
                        value={properties[field.id] || ""}
                        onChange={(event) => {
                            setProperties({
                                ...properties,
                                [field.id]: event.target.value
                            });
                        }} />
                </FormGroup>
            ))}
        </Form>
    </BorderLayout>
));
