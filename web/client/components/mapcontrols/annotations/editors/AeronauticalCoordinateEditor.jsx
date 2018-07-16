const React = require('react');
const PropTypes = require('prop-types');
const {compose} = require('recompose');
const { FormGroup, FormControl } = require('react-bootstrap');
const {isNil} = require('lodash');

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
        onChange: PropTypes.func
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
        }
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
            direction = degrees < 0
                ? (direction === this.props.directions[0] ? this.props.directions[1] : this.props.directions[0])
                : direction;
            if (degrees >= this.props.maxDegrees) {
                degrees = this.props.maxDegrees;
                minutes = 0;
                seconds = 0;
            }
            return {
                degrees,
                minutes,
                seconds,
                direction
            };
        } catch (e) {
            return undefined;
        }
    }

    getSexagesimalStep = (val) => {
        return val >= 60
            ? 1
            : val < 0
                ? -1
                : 0;

    }

    render() {
        const inputStyle = { padding: 0, textAlign: "center" };
        const degreesInvalidStyle = isNaN(this.props.degrees) ? {borderColor: "red"} : {};
        const minutesInvalidStyle = isNaN(this.props.minutes) ? {borderColor: "red"} : {};
        const secondsInvalidStyle = isNaN(this.props.seconds) ? {borderColor: "red"} : {};
        const labelStyle = {
            position: "relative",
            top: 0,
            overflow: "visible",
            zIndex: 3,
            left: -23,
            fontSize: 20,
            width: 0,
            height: 0
        };
        const {step: stepSeconds} = this.props.aeronauticalOptions.seconds;
        return (
            <FormGroup style={{display: "inline-flex"}}>
                <FormControl
                    key={this.props.coordinate + "degree"}
                    value={this.props.degrees}
                    placeholder="d"
                    onChange={e => this.onChange("degrees", parseInt(e.target.value, 10))}
                    step={1}
                    max={this.props.maxDegrees}
                    min={-1}
                    style={{ width: 60, ...inputStyle, ...degreesInvalidStyle }}
                    type="number"
                />
                <span style={labelStyle}>&deg;</span>
                <FormControl
                    key={this.props.coordinate + "minutes"}
                    placeholder={"m"}
                    value={this.props.minutes}
                    onChange={e => this.onChange("minutes", parseInt(e.target.value, 10))}
                    max={60}
                    min={-1}
                    style={{ width: 60, ...inputStyle, ...minutesInvalidStyle}}
                    step={1}
                    type="number"
                />
                <span style={labelStyle}>&prime;</span>
                <FormControl
                    key={this.props.coordinate + "seconds"}
                    value={this.props.seconds}
                    placeholder="s"
                    onChange={e => this.onChange("seconds", parseFloat(e.target.value))}
                    step={stepSeconds}
                    max={60}
                    min={-1}
                    style={{ width: 80, ...inputStyle, ...secondsInvalidStyle}}
                    type="number"
                />
            <span style={labelStyle}>&Prime;</span>
                <FormControl
                    componentClass="select" placeholder="select"
                    value={this.props.direction}
                    onChange={e => this.onChange("direction", e.target.value)}
                    style={{ width: 65 }}>
                    {this.props.directions.map((d) => <option key={d} value={d}>{d}</option>)}
                </FormControl>
            </FormGroup>
        );
    }

    roundToNextSexagesimalStep = val => {
        return val < 0
            ? 60 + val
            : val >= 60
                ? val - 60
                : val;
    }
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
