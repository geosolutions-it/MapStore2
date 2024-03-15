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

/**
 * Font component that will render a few input field for customizing:
 * - color
 * - fontSize
 * - fontFamily
 * within a widget
 * @param {string} color the value in rgb format
 * @param {boolean} disabled when all fields are disabled
 * @param {number} fontSize
 * @param {string} fontFamily
 * @param {string[]} options array used to show partially the attributes, for example if you pass it as options=["color"], only the color field will be rendered
 * @param {function} onChange handler used to dispatch change of value, with dedicated key for each field
 */
const Font = ({
    color,
    disabled,
    fontSize,
    fontFamily,
    options = ["color", "size", "family"],
    onChange
}) => {
    return (<>
        {options.includes("color") ? <FormGroup className="form-group-flex">
            <ControlLabel><Message msgId={'styleeditor.color'} /></ControlLabel>
            <InputGroup>
                <ColorSelector
                    disabled={disabled}
                    format="rgb"
                    color={color}
                    onChangeColor={(colorVal) => colorVal && onChange('color', colorVal)}
                />
            </InputGroup>
        </FormGroup> : null}
        {options.includes("size") ? <FormGroup className="form-group-flex">
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
        { options.includes("family") ? <FormGroup className="form-group-flex">
            <ControlLabel><Message msgId={'styleeditor.fontFamily'} /></ControlLabel>
            <InputGroup>
                <Select
                    clearable={false}
                    value={fontFamily}
                    onChange={val => {
                        onChange("fontFamily", val.value);
                    }}
                    options={getSelectOptions(DEFAULT_FONT_FAMILIES)}
                />
            </InputGroup>
        </FormGroup> : null}
    </>);
};

export default Font;
