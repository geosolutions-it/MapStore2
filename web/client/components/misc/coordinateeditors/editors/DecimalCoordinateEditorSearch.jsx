/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import {capitalize, isNumber} from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import {FormGroup} from 'react-bootstrap';
import DecimalCoordinateEditor from './DecimalCoordinateEditor';
import IntlNumberFormControl from '../../../I18N/IntlNumberFormControl';

/**
 This component renders a custom coordiante inpout for decimal degrees for default coordinate CRS and current map CRS as well
*/
class DecimalCoordinateEditorSearch extends DecimalCoordinateEditor {

    static propTypes = {
        idx: PropTypes.number,
        value: PropTypes.number,
        constraints: PropTypes.object,
        format: PropTypes.string,
        coordinate: PropTypes.string,
        onChange: PropTypes.func,
        onKeyDown: PropTypes.func,
        onSubmit: PropTypes.func,
        disabled: PropTypes.bool,
        currentMapCRS: PropTypes.string
    };
    static defaultProps = {
        format: "decimal",
        coordinate: "lat",
        constraints: {
            decimal: {
                lat: {
                    min: -90,
                    max: 90
                },
                lon: {
                    min: -180,
                    max: 180
                }
            }
        },
        onKeyDown: () => {},
        disabled: false,
        currentMapCRS: 'EPSG:4326'
    }
    constructor(props, context) {
        super(props, context);
        this.state = {
            value: this.props.value
        };
    }
    componentDidUpdate(prevProps) {
        // in case clear the inputs by clicking on clear btn
        if ((prevProps.value !== this.props.value && this.props.value !== this.state.value)) {
            this.setState({value: this.props.value});
        }
        // in case change currentMapCRS ---> validate the coords and reset if not
        if (prevProps.currentMapCRS !== this.props.currentMapCRS) {
            const parsedVal = parseFloat(this.props.value);
            const valueIsNumber = isNumber(parsedVal) && !isNaN(parsedVal);
            if (valueIsNumber) {
                const isXNotValidVal = (this.props.coordinate === 'X' && this.validateDecimalX(this.props.value));
                const isYNotValidVal = (this.props.coordinate === 'Y' && this.validateDecimalY(this.props.value));
                const resetValue = '';
                if (isXNotValidVal) {
                    this.props.onChange(parseFloat(resetValue));
                    this.setState({value: ''});
                }
                if (isYNotValidVal) {
                    this.props.onChange(parseFloat(resetValue));
                    this.setState({value: ''});
                }
            }
        }
    }

    render() {
        const {coordinate, onChange, disabled} = this.props;
        const validateNameFunc = "validateDecimal" + capitalize(coordinate);
        return (
            <FormGroup
                validationState={this[validateNameFunc](this.state.value)}>
                <IntlNumberFormControl
                    disabled={disabled}
                    key={coordinate}
                    value={this.state.value}
                    placeholder={coordinate}
                    onChange={val => {
                        const parsedVal = parseFloat(val);
                        this.setState({ value: parsedVal });
                        onChange(parsedVal);
                    }}
                    onKeyDown={this.verifyOnKeyDownEvent}
                    step={1}
                    validateNameFunc={this[validateNameFunc]}
                    type="number"
                />
            </FormGroup>
        );
    }
	validateDecimalX = (xCoordinate) => {
	    const min = this.props.constraints[this.props.format].xCoord.min;
	    const max = this.props.constraints[this.props.format].xCoord.max;

	    const xCoord = parseFloat(xCoordinate);
	    if (isNaN(xCoord) || xCoord < min || xCoord > max ) {
	        return "error";
	    }
	    return null; // "success"
	};
    validateDecimalY = (yCoordinate) => {
        const min = this.props.constraints[this.props.format].yCoord.min;
        const max = this.props.constraints[this.props.format].yCoord.max;
        const yCoord = parseFloat(yCoordinate);
        if (isNaN(yCoord) || yCoord < min || yCoord > max ) {
            return "error";
        }
        return null; // "success"
    }

}

export default DecimalCoordinateEditorSearch;
