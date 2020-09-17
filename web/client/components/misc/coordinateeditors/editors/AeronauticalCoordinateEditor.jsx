/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const React = require('react');
const PropTypes = require('prop-types');
const {compose} = require('recompose');
const { FormGroup, FormControl } = require('react-bootstrap');
const {isNil} = require('lodash');
const IntlNumberFormControl = require('../../../I18N/IntlNumberFormControl');

/**
 * This component renders a coordiante inpout for aetronautical degrees
*/

const decimalToAeronautical = require('../enhancers/decimalToAeronautical');
const coordinateTypePreset = require('../enhancers/coordinateTypePreset');
const tempAeronauticalValue = require('../enhancers/tempAeronauticalValue');

class AeronauticalCoordinateEditor extends React.Component {

    static propTypes = {
        idx: PropTypes.number,
        maxDegrees: PropTypes.number,
        degrees: PropTypes.number,
        minutes: PropTypes.number,
        seconds: PropTypes.number,
        directions: PropTypes.array,
        direction: PropTypes.string,
        aeronauticalOptions: PropTypes.object,
        coordinate: PropTypes.string,
        onChange: PropTypes.func,
        onKeyDown: PropTypes.func
    };
    static defaultProps = {
        coordinate: "lat",
        maxDegrees: 90,
        directions: ["N", "S"],
        aeronauticalOptions: {
            seconds: {
                decimals: 4,
                step: 0.0001
            }
        },
        onKeyDown: () => {}
    }

    onChange = (part, newValue) => {
        const coord = this.getUpdatedCoordinateValue(part, newValue);
        this.props.onChange(coord);
    }
    getUpdatedCoordinateValue = (part, newValue) => {
        try {
            const newValues = {
                degrees: this.props.degrees,
                minutes: this.props.minutes,
                seconds: this.props.seconds,
                direction: this.props.direction,
                [part]: part === "degrees" ? Math.min(newValue, this.props.maxDegrees) : newValue
            };
            let seconds = newValues.seconds;
            let minutes = newValues.minutes + this.getSexagesimalStep(seconds);
            let degrees = Math.min(this.props.maxDegrees, newValues.degrees + this.getSexagesimalStep(minutes));
            let direction = newValues.direction;
            seconds = this.roundToNextSexagesimalStep(seconds);
            minutes = this.roundToNextSexagesimalStep(minutes);
            if (degrees === this.props.maxDegrees) {
                minutes = 0;
                seconds = 0;
            }
            direction = degrees < 0
                ? (direction === this.props.directions[0] ? this.props.directions[1] : this.props.directions[0])
                : direction;
            if ( degrees === -1) {
                // when switching from 0° 0' 0'' E to -1° 0' 0'' E it was not going to 1° 0' 0'' W
                if (newValues.degrees < 0 && newValues.minutes >= 0) {
                    degrees = newValues.degrees;
                } else if (newValues.minutes < 0 && newValues.degrees <= 0) {
                    // when switching from 0° 0' 0'' E to 0° -1' 0'' E it was not going to 0° 1' 0'' W
                    degrees = 0;
                    minutes = newValues.minutes;
                } else {
                    degrees = 0;
                    minutes = 0;
                    seconds = 0.0001;
                }
            }
            return {
                degrees,
                minutes,
                seconds,
                direction
            };
        } catch (e) {
            return null;
        }
    }

    getSexagesimalStep = (val) => {
        return val >= 60
            ? 1
            : val < 0
                ? -1
                : 0;

    }
    getInputStyle = (val) => {
        return (isNaN(val) || val === "") ? {borderColor: "#a94442"} : {};
    }

    render() {
        const inputStyle = { padding: 0, textAlign: "center", borderRight: 'none' };
        const degreesInvalidStyle = this.getInputStyle(this.props.degrees);
        const minutesInvalidStyle = this.getInputStyle(this.props.minutes);
        const secondsInvalidStyle = this.getInputStyle(this.props.seconds);
        const labelStyle = {
            position: "relative",
            top: 0,
            overflow: "visible",
            zIndex: 3,
            left: -25,
            width: 0,
            height: 0
        };
        const {step: stepSeconds} = this.props.aeronauticalOptions.seconds;
        return (
            <FormGroup style={{display: "inline-flex"}}>
                <div className={"degrees"} style={{width: 40, display: 'flex'}}>
                    <IntlNumberFormControl
                        key={this.props.coordinate + "degree"}
                        value={this.props.degrees}
                        placeholder="d"
                        onChange={val => this.onChange("degrees", parseInt(val, 10))}
                        step={1}
                        size={3}
                        max={this.props.maxDegrees}
                        min={-1}
                        onKeyDown={(event) => {
                            this.verifyOnKeyDownEvent(event);
                        }}
                        style={{ width: '100%', ...inputStyle, ...degreesInvalidStyle }}
                        type="number"
                    />
                    <span style={labelStyle}>&deg;</span>
                </div>

                <div className={"minutes"} style={{width: 40, display: 'flex' }}>
                    <IntlNumberFormControl
                        key={this.props.coordinate + "minutes"}
                        placeholder={"m"}
                        size={3}
                        value={this.props.minutes}
                        onChange={val => {
                            this.onChange("minutes", parseInt(val, 10));
                        }}
                        max={60}
                        min={-1}
                        onKeyDown={(event) => {
                            this.verifyOnKeyDownEvent(event);
                        }}
                        style={{ width: '100%', ...inputStyle, ...minutesInvalidStyle}}
                        step={1}
                        type="number"
                    />
                    <span style={labelStyle}>&prime;</span>
                </div>
                <div className="seconds" style={{display: 'flex'}}>
                    <IntlNumberFormControl
                        key={this.props.coordinate + "seconds"}
                        value={this.props.seconds}
                        placeholder="s"
                        onChange={val => this.onChange("seconds", parseFloat(val))}
                        step={stepSeconds}
                        max={60}
                        // size={5}
                        onKeyDown={(event) => {
                            this.verifyOnKeyDownEvent(event);
                        }}
                        min={-1}
                        style={{ width: '100%', ...inputStyle, ...secondsInvalidStyle}}
                        type="number"
                    />
                    <span style={labelStyle}>&Prime;</span>
                </div>
                <div className={"direction-select"}>

                    <FormControl
                        componentClass="select" placeholder="select"
                        value={this.props.direction}
                        onChange={e => this.onChange("direction", e.target.value)}
                        style={{ paddingLeft: 4, paddingRight: 4, flex: "1 1 0%" }}>
                        {this.props.directions.map((d) => <option key={d} value={d}>{d}</option>)}
                    </FormControl>
                </div>
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
        if (event.keyCode === 13 ) {
            event.preventDefault();
            event.stopPropagation();
            this.props.onKeyDown();
        }
    };

    roundToNextSexagesimalStep = val => {
        return val < 0
            ? 60 + val
            : val >= 60
                ? val - 60
                : val;
    };
    isValid = (coord) => {
        const { minutes, seconds, degrees, direction } = coord;
        return !isNil(minutes) && minutes > 0 && minutes < 60
            && !isNil(seconds) && seconds > 0 && seconds < 60
            && !isNil(degrees) && degrees > 0 && degrees < this.props.maxDegrees
            && direction;
    }
}

module.exports = compose(
    coordinateTypePreset,
    decimalToAeronautical,
    tempAeronauticalValue
)(AeronauticalCoordinateEditor);
