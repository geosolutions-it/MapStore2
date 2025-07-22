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
import { DEFAULT_CURRENT_TIME_SHAPE_STYLE, DEFAULT_CURRENT_TIME_SHAPE_VALUES } from '../../../../../utils/WidgetsUtils';

const getSelectOptions = (opts) => {
    return opts.map(opt => ({label: opt, value: opt}));
};

/**
 * ShapeStyle component that will render a few input field for customizing:
 * - color
 * - style
 * - size
 * within a widget
 * @param {string} color the value in rgb format
 * @param {boolean} disabled when all fields are disabled
 * @param {number} size the size of the shape
 * @param {string} style the style of the shape (e.g. solid, dot, dash, etc.)
 * @param {string[]} options array used to show partially the attributes, for example if you pass it as options=["color"], only the color field will be rendered
 * @param {function} onChange handler used to dispatch change of value, with dedicated key for each field
 */
const ShapeStyle = ({
    color,
    disabled,
    size,
    style,
    options = ["color", "size", "style"],
    onChange
}) => {
    return (
        <div style={{ borderLeft: '1px solid #ddd', marginLeft: 5 }}>
            {options.includes("color") ? <FormGroup className="form-group-flex">
                <ControlLabel><Message msgId={'styleeditor.color'} /></ControlLabel>
                <InputGroup>
                    <ColorSelector
                        disabled={disabled}
                        format="rgb"
                        color={color || DEFAULT_CURRENT_TIME_SHAPE_VALUES.color}
                        onChangeColor={(colorVal) => colorVal && onChange('color', colorVal)}
                    />
                </InputGroup>
            </FormGroup> : null}
            {options.includes("size") ? <FormGroup className="form-group-flex">
                <ControlLabel><Message msgId={'styleeditor.size'} /></ControlLabel>
                <InputGroup style={{ maxWidth: 90 }}>
                    <DebouncedFormControl
                        type="number"
                        disabled={disabled}
                        value={size || DEFAULT_CURRENT_TIME_SHAPE_VALUES.size}
                        min={1}
                        step={1}
                        fallbackValue={DEFAULT_CURRENT_TIME_SHAPE_VALUES.size}
                        style={{ zIndex: 0 }}
                        onChange={(value) => {
                            onChange('size', Number(value));
                        }}
                    />
                    <InputGroup.Addon>px</InputGroup.Addon>
                </InputGroup>
            </FormGroup> : null}
            {options.includes("style") ? <FormGroup className="form-group-flex">
                <ControlLabel><Message msgId={'styleeditor.style'} /></ControlLabel>
                <InputGroup>
                    <Select
                        clearable={false}
                        value={style || DEFAULT_CURRENT_TIME_SHAPE_VALUES.style}
                        onChange={val => {
                            onChange("style", val.value);
                        }}
                        options={getSelectOptions(DEFAULT_CURRENT_TIME_SHAPE_STYLE)}
                    />
                </InputGroup>
            </FormGroup> : null}
        </div>
    );
};

export default ShapeStyle;
