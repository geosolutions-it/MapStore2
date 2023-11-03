/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { FormGroup, ControlLabel, InputGroup } from 'react-bootstrap';
import Select from 'react-select';

import Message from '../../../../I18N/Message';
import ColorSelector from '../../../../style/ColorSelector';
import DebouncedFormControl from '../../../../misc/DebouncedFormControl';

const getSelectOptions = (opts) => {
    return opts.map(opt => ({label: opt, value: opt}));
};

import { DEFAULT_FONT_FAMILIES } from '../../../../../utils/GeoStoryUtils';
import { FONT } from '../../../../../utils/WidgetsUtils';

const Font = ({
    color,
    fontSize,
    fontFamily,
    showFontSize = true,
    disabled,
    onChange
}) => {
    return (<>
        <FormGroup className="form-group-flex">
            <ControlLabel><Message msgId={'styleeditor.color'} /></ControlLabel>
            <InputGroup>
                <ColorSelector
                    disabled={disabled}
                    format="rgb"
                    color={color}
                    onChangeColor={(colorVal) => colorVal && onChange('color', colorVal)}
                />
            </InputGroup>
        </FormGroup>
        {showFontSize ? <FormGroup className="form-group-flex">
            <ControlLabel><Message msgId={'styleeditor.fontSize'} /></ControlLabel>
            <InputGroup style={{ maxWidth: 90 }}>
                <DebouncedFormControl
                    type="number"
                    disabled={disabled}
                    value={fontSize || FONT.SIZE}
                    min={1}
                    step={1}
                    fallbackValue={FONT.SIZE}
                    style={{ zIndex: 0 }}
                    onChange={(value) => {
                        onChange('fontSize', Number(value));
                    }}
                />
                <InputGroup.Addon>px</InputGroup.Addon>
            </InputGroup>
        </FormGroup> : null}
        <FormGroup className="form-group-flex">
            <ControlLabel><Message msgId={'styleeditor.fontFamily'} /></ControlLabel>
            <InputGroup>
                <Select
                    value={fontFamily}
                    onChange={val => {
                        onChange("fontFamily", val.value);
                    }}
                    options={getSelectOptions(DEFAULT_FONT_FAMILIES)}
                />
            </InputGroup>
        </FormGroup>
    </>);
};

export default Font;
