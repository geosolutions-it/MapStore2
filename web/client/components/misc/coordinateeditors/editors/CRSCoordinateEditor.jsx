/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import {capitalize} from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import {FormGroup} from 'react-bootstrap';
import IntlNumberFormControl from '../../../I18N/IntlNumberFormControl';

/**
 This component renders a custom coordiante inpout for decimal degrees for default coordinate CRS and current map CRS as well
*/
class CRSCoordinateEditor extends React.Component {

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
    static contextTypes = {
        intl: PropTypes.object
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
    render() {
        const {coordinate, onChange, disabled, value} = this.props;
        const validateNameFunc = "validateDecimal" + capitalize(coordinate);
        return (
            <FormGroup
                validationState={this[validateNameFunc](value)}>
                <IntlNumberFormControl
                    disabled={disabled}
                    key={coordinate}
                    value={value}
                    placeholder={coordinate}
                    onChange={val => {
                        if (val === "") {
                            onChange("");
                        } else {
                            onChange(val);
                        }
                    }}
                    onKeyDown={this.verifyOnKeyDownEvent}
                    step={1}
                    validateNameFunc={this[validateNameFunc]}
                    type="number"
                />
            </FormGroup>
        );
    }
    /**
    * checking and blocking the keydown event to avoid
    * the only letters matched by input type number 'e' or 'E'
    * see https://github.com/geosolutions-it/MapStore2/issues/3523#issuecomment-502660391
    * @param event keydown event
    */
    verifyOnKeyDownEvent = (event) => {
        if (event.keyCode === 69) {
            event.preventDefault();
        }
        if (event.keyCode === 13) {
            event.preventDefault();
            event.stopPropagation();
            this.props.onKeyDown(event);
        }
    };
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

export default CRSCoordinateEditor;
