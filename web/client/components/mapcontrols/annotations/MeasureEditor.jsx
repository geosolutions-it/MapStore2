/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const { FormControl, FormGroup } = require('react-bootstrap');
const { isNumber } = require('lodash');
const { convertUom } = require('../../../utils/MeasureUtils');
const localizedProps = require('../../misc/enhancers/localizedProps');
const FormControlLocalized = localizedProps('placeholder')(FormControl);

// convert to valueUom if it is a valid number
const toValue = (value, uom, valueUom) => (isNumber(parseFloat(value)) && !isNaN(parseFloat(value)))
    ? convertUom(parseFloat(value), uom, valueUom)
    : value;
// convert to local uom if it is a valid number
const toLocalValue = (value, uom, valueUom) =>
    isNumber(parseFloat(value)) && !isNaN(parseFloat(value))
        ? parseFloat(convertUom(value, valueUom, uom).toFixed(4))
        : value;

const { compose, withHandlers, withPropsOnChange, withState, withStateHandlers, defaultProps} = require('recompose');


module.exports = compose(
    defaultProps({
        valueUom: 'm',
        displayUom: 'm',
        units: [
            { value: "ft", label: "ft" },
            { value: "m", label: "m" },
            { value: "km", label: "km" },
            { value: "mi", label: "mi" },
            { value: "nm", label: "nm" }
        ]
    }),
    withStateHandlers(
        ({ displayUom = "nm"}) => ({
            uom: displayUom
        }), {
            setUom: () => (uom) => ({
                uom
            })
        }
    ),
    /**
     * The component keeps locally the current edited value, and update it only when the value prop is different
     * from the latest localValue (conversion apart)
     * This avoid the conversion errors to be propagated in
     */
    withState('localValue', 'setLocalValue'),
    withPropsOnChange(
        ['value', 'localValue', 'uom', 'valueUom'],
        ({ value, localValue, uom, valueUom}) => ({
        value: value === toValue(localValue, uom, valueUom)
            ? localValue
            : toLocalValue(value, uom, valueUom)
    })),
    withHandlers({
        onChange: ({ uom, valueUom, onChange = () => { }, setLocalValue = () => {} }) => (value) => {
            setLocalValue(value);
            onChange(
                toValue(value, uom, valueUom)
            );
        }

    })

)(({
    value,
    units,
    uom,
    style = {display: "inline-flex", width: "100%"},
    setUom = () => {},
    onChange = () => {}
}) => (
    <FormGroup style={style}>
        <FormControlLocalized
            value={value}
            placeholder="annotations.editor.placeholder.radius"
            name="radius"
            onChange={e => onChange(e.target.value)}
            step={1}
            type="number" />
        <FormControlLocalized
            componentClass="select"
            placeholder="annotations.editor.placeholder.select"
            value={uom}
            onChange={e => setUom(e.target.value)}
            style={{ width: 85 }}>
            {units.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
        </FormControlLocalized>
    </FormGroup>));
