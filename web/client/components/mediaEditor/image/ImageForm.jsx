/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import BorderLayout from '../../layout/BorderLayout';
import Toolbar from '../../misc/toolbar/Toolbar';
import { compose, withState } from 'recompose';


import { Form, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';

const form = [
    {
        placeholder: 'Enter image source',
        type: 'text',
        id: 'src',
        label: 'Source',
        validation: ({ src }) => src !== undefined && src === '' ?
            'error'
            : src
                ? 'success'
                : undefined
    },
    {
        placeholder: 'Enter title',
        type: 'text',
        id: 'title',
        label: 'Title',
        validation: ({ title }) => title !== undefined && title === '' ?
            'error'
            : title
                ? 'success'
                : undefined
    },
    {
        placeholder: 'Enter alternative text',
        type: 'text',
        id: 'alt',
        label: 'Alternative text'
    },
    {
        placeholder: 'Enter description',
        type: 'text',
        id: 'description',
        label: 'Description'
    },
    {
        placeholder: 'Enter credits',
        type: 'text',
        id: 'credits',
        label: 'Credits'
    }
];

const enhance = compose(
    withState('properties', 'setProperties', {})
);


export default enhance(({
    properties = {},
    setAddingMedia = () => {},
    setProperties = () => {},
    onSave = () => {}
}) => (
    <BorderLayout
        header={
            <div
                className="text-center"
                key="toolbar"
                style={{
                    borderBottom: '1px solid #ddd',
                    padding: 8
                }}>
                    <Toolbar
                        btnGroupProps={{
                            style: {
                                marginBottom: 8
                            }
                        }}
                        btnDefaultProps={{
                            bsStyle: 'primary',
                            className: 'square-button-md'
                        }}
                        buttons={[{
                            glyph: 'arrow-left',
                            onClick: () => setAddingMedia(false)
                        }, {
                            glyph: 'floppy-disk',
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
                        placeholder={field.placeholder}
                        value={properties[field.id] || ''}
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
