/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import Message from '../I18N/Message';
import Select from 'react-select';
import PropertyField from './PropertyField';

function Band({
    label = 'styleeditor.band',
    value,
    bands,
    onChange,
    enhancementType
}) {
    return (
        <>
        <PropertyField
            label={label}>
            <Select
                clearable={false}
                options={bands}
                value={value}
                onChange={option => onChange('band', option.value)}
            />
        </PropertyField>
        <PropertyField
            label="styleeditor.contrastEnhancement">
            <Select
                clearable={false}
                options={[
                    {
                        label: <Message msgId="styleeditor.none" />,
                        value: 'none'
                    },
                    {
                        label: <Message msgId="styleeditor.normalize" />,
                        value: 'normalize'
                    },
                    {
                        label: <Message msgId="styleeditor.histogram" />,
                        value: 'histogram'
                    }
                ]}
                value={enhancementType || 'none'}
                onChange={option => {
                    const newEnhancementType = option.value === 'none'
                        ? undefined
                        : option.value;
                    onChange('enhancementType', newEnhancementType);
                }}
            />
        </PropertyField>
        </>
    );
}

export default Band;
