/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import { FormControl, FormGroup } from 'react-bootstrap';
import { isNumber } from 'lodash';
import { convertUom } from '../../../utils/MeasureUtils';
import { getUnits } from '../../../utils/CoordinatesUtils';
import IntlNumberFormControl from '../../I18N/IntlNumberFormControl';

// convert to valueUom if it is a valid number
const toValue = (value, uom, valueUom) => (isNumber(parseFloat(value)) && !isNaN(parseFloat(value)))
    ? convertUom(parseFloat(value), uom, valueUom)
    : value;
// convert to local uom if it is a valid number
const toLocalValue = (value, uom, valueUom) =>
    isNumber(parseFloat(value)) && !isNaN(parseFloat(value))
        ? parseFloat(convertUom(value, valueUom, uom).toFixed(4))
        : value;

import {
    compose,
    withHandlers,
    withPropsOnChange,
    withState,
    withStateHandlers,
    defaultProps
} from 'recompose';

export default compose(
    defaultProps({
        valueUom: 'm',
        displayUom: 'm',
        units: [
            { value: "degrees", label: "deg", originUom: "degrees" },
            { value: "ft", label: "ft", originUom: "m"  },
            { value: "m", label: "m", originUom: "m" },
            { value: "km", label: "km", originUom: "m" },
            { value: "mi", label: "mi", originUom: "m" },
            { value: "nm", label: "nm", originUom: "m" }
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
        onChange: ({ uom, projection, valueUom, onChange = () => { }, setLocalValue = () => {} }) => (value) => {
            setLocalValue(value);
            onChange(
                toValue(value, uom, valueUom), projection
            );
        }

    })

)(({
    value,
    units = [],
    uom,
    projection = "EPSG:3857",
    style = {display: "inline-flex", width: "100%"},
    setUom = () => {},
    onChange = () => {}
}) => {
    const unitsFromCrs = getUnits(projection);
    return (<FormGroup style={style}>
        <IntlNumberFormControl
            value={value}
            placeholder="radius"
            name="radius"
            onChange={val => onChange(val, uom)}
            step={1}
            type="number" />
        <FormControl
            componentClass="select" placeholder="select"
            value={uom}
            onChange={e => setUom(e.target.value)}
            style={{ width: 85 }}>
            {units.filter(({originUom}) => unitsFromCrs === originUom).map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
        </FormControl>
    </FormGroup>);
});
