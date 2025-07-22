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
import { DEFAULT_SHAPE_STYLE, DEFAULT_SHAPE_VALUES } from '../../../../../utils/WidgetsUtils';

const getSelectOptions = (opts) => {
    return opts.map(opt => ({label: opt, value: opt}));
};

/**
 * ShapeStyle component that will render a few input field for customizing:
 * - shapeColor
 * - shapeStyle
 * - shapeSize
 * within a widget
 * @param {string} color the value in rgb format
 * @param {boolean} disabled when all fields are disabled
 * @param {number} shapeSize the size of the shape
 * @param {string} shapeStyle the style of the shape (e.g. solid, dot, dash, etc.)
 * @param {string[]} options array used to show partially the attributes, for example if you pass it as options=["color"], only the color field will be rendered
 * @param {function} onChange handler used to dispatch change of value, with dedicated key for each field
 */
const ShapeStyle = ({
    shapeColor,
    disabled,
    shapeSize,
    shapeStyle,
    options = ["color", "size", "style"],
    onChange
}) => {
    return (<>
        {options.includes("color") ? <FormGroup className="form-group-flex">
            <ControlLabel><Message msgId={'styleeditor.shapeColor'} /></ControlLabel>
            <InputGroup>
                <ColorSelector
                    disabled={disabled}
                    format="rgb"
                    color={shapeColor || DEFAULT_SHAPE_VALUES.shapeColor}
                    onChangeColor={(colorVal) => colorVal && onChange('shapeColor', colorVal)}
                />
            </InputGroup>
        </FormGroup> : null}
        {options.includes("size") ? <FormGroup className="form-group-flex">
            <ControlLabel><Message msgId={'styleeditor.shapeSize'} /></ControlLabel>
            <InputGroup style={{ maxWidth: 90 }}>
                <DebouncedFormControl
                    type="number"
                    disabled={disabled}
                    value={shapeSize || DEFAULT_SHAPE_VALUES.shapeSize}
                    min={1}
                    step={1}
                    fallbackValue={DEFAULT_SHAPE_VALUES.shapeSize}
                    style={{ zIndex: 0 }}
                    onChange={(value) => {
                        onChange('shapeSize', Number(value));
                    }}
                />
                <InputGroup.Addon>px</InputGroup.Addon>
            </InputGroup>
        </FormGroup> : null}
        {options.includes("style") ? <FormGroup className="form-group-flex">
            <ControlLabel><Message msgId={'styleeditor.shapeStyle'} /></ControlLabel>
            <InputGroup>
                <Select
                    clearable={false}
                    value={shapeStyle || DEFAULT_SHAPE_VALUES.shapeStyle}
                    onChange={val => {
                        onChange("shapeStyle", val.value);
                    }}
                    options={getSelectOptions(DEFAULT_SHAPE_STYLE)}
                />
            </InputGroup>
        </FormGroup> : null}
    </>);
};

export default ShapeStyle;
