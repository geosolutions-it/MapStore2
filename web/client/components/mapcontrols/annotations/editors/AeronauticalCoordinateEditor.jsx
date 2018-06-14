const React = require('react');
const PropTypes = require('prop-types');
const {compose} = require('recompose');
const { FormGroup, FormControl } = require('react-bootstrap');
// const {capitalize} = require('lodash');

/**
 * This component renders a coordiante inpout for aetronautical degrees
*/

const decimalToAeronautical = require('../enhancers/decimalToAeronautical');
const coordinateTypePreset = require('../enhancers/coordinateTypePreset');
const tempAreonauticalValue = require('../enhancers/tempAreonauticalValue');

class CoordinateEntry extends React.Component {

    static propTypes = {
        idx: PropTypes.number,
        maxDegrees: PropTypes.number,
        degrees: PropTypes.number,
        minutes: PropTypes.number,
        seconds: PropTypes.number,
        directions: PropTypes.array,
        direction: PropTypes.string,
        coordinate: PropTypes.string,
        onChange: PropTypes.func
    };
    static defaultProps = {
        coordinate: "lat",
        maxDegrees: 90,
        directions: ["N", "S"]
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
                [part]: newValue
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
        // const {idx, format} = this.props;
        // const validateNameFunc = "validate" + capitalize(this.props.format) + capitalize(this.props.coordinate);
        const inputStyle = {
            padding: 0,
            textAlign: "center"
        };
        return (
            <FormGroup
                validationState={() => this.isValid(this.props)}>
                <FormControl
                    key={this.props.coordinate + "degree"}
                    value={this.props.degrees}
                    placeholder="d"
                    onChange={e => this.onChange("degrees", parseInt(e.target.value, 10))}
                    step={1}
                    max={this.props.maxDegrees}
                    min={-1}
                    style={{ width: 65, ...inputStyle }}
                    type="number"
                />
                <strong>&deg;</strong>
                <FormControl
                    key={this.props.coordinate + "minutes"}
                    placeholder={"m"}
                    value={this.props.minutes}
                    onChange={e => this.onChange("minutes", parseInt(e.target.value, 10))}
                    max={60}
                    min={-1}
                    style={{ width: 60, ...inputStyle }}
                    step={1}
                    type="number"
                />
                <strong>&prime;</strong>
                <FormControl
                    key={this.props.coordinate + "seconds"}
                    value={this.props.seconds}
                    placeholder="s"
                    onChange={e => this.onChange("seconds", parseFloat(e.target.value))}
                    step={1}
                    max={60}
                    min={-1}
                    style={{ width: 80, ...inputStyle }}
                    type="number"
                />
                <strong>&Prime;</strong>
                <FormControl
                    componentClass="select" placeholder="select"
                    onChange={e => this.onChange("direction", e.target.value)}
                    style={{ width: 60 }}>
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
        return minutes && minutes > 0 && minutes < 60
            && seconds && seconds > 0 && seconds < 60
            && degrees && degrees > 0 && degrees < this.props.maxDegrees
            && direction;
    }
}

module.exports = compose(
    decimalToAeronautical,
    coordinateTypePreset
)(CoordinateEntry);
