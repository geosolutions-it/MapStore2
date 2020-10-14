/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const React = require('react');
const PropTypes = require('prop-types');
const {FormGroup} = require('react-bootstrap');
const {capitalize} = require('lodash');
const IntlNumberFormControl = require('../../../I18N/IntlNumberFormControl');

/**
 This component renders a coordiante inpout for decimal degrees
*/
class DecimalCoordinateEditor extends React.Component {

    static propTypes = {
        idx: PropTypes.number,
        value: PropTypes.number,
        constraints: PropTypes.object,
        format: PropTypes.string,
        coordinate: PropTypes.string,
        onChange: PropTypes.func,
        onKeyDown: PropTypes.func,
        onSubmit: PropTypes.func
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
        onKeyDown: () => {}
    }


    render() {
        const {coordinate, value, onChange} = this.props;
        const validateNameFunc = "validateDecimal" + capitalize(coordinate);
        return (
            <FormGroup
                validationState={this[validateNameFunc](value)}>
                <IntlNumberFormControl
                    key={coordinate}
                    value={value}
                    placeholder={coordinate}
                    onChange={val => {
                        // when inserting 4eee5 as number here it comes "" that makes the re-render fail
                        if (val === "") {
                            onChange("");
                        }
                        if (this[validateNameFunc](val) === null) {
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

    validateDecimalLon = (longitude) => {
        const min = this.props.constraints[this.props.format].lon.min;
        const max = this.props.constraints[this.props.format].lon.max;

        const lon = parseFloat(longitude);
        if (isNaN(lon) || lon < min || lon > max ) {
            return "error";
        }
        return null; // "success"
    };
    validateDecimalLat = (latitude) => {
        const min = this.props.constraints[this.props.format].lat.min;
        const max = this.props.constraints[this.props.format].lat.max;
        const lat = parseFloat(latitude);
        if (isNaN(lat) || lat < min || lat > max ) {
            return "error";
            // return true;
        }
        return null; // "success"
        // return false; // "success"
    }
}

module.exports = DecimalCoordinateEditor;
