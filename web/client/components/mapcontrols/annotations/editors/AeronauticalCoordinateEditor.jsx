const React = require('react');
const PropTypes = require('prop-types');
const {FormGroup, FormControl} = require('react-bootstrap');
// const {capitalize} = require('lodash');

/**
 * This component renders a coordiante inpout for aetronautical degrees
*/

const decimalToAeronautical = require('../enhancers/decimalToAeronautical');
class CoordinateEntry extends React.Component {

    static propTypes = {
        idx: PropTypes.number,
        degrees: PropTypes.number,
        minutes: PropTypes.number,
        seconds: PropTypes.number,
        direction: PropTypes.string,
        coordinate: PropTypes.string,
        onChange: PropTypes.func
    };
    defaultProps = {
        coordinate: "lat"
    }

    render() {
        // const {idx, format} = this.props;
        // const validateNameFunc = "validate" + capitalize(this.props.format) + capitalize(this.props.coordinate);

        return (
            <FormGroup>
                <FormControl
                    key={this.props.coordinate + "degree"}
                    value={this.props.degrees}
                    placeholder="d"
                    onChange={(/*e*/) => /*onChangePart('degree', e.target.value) */{}}
                    step={1}
                    style={{width: 60}}
                    type="number"
                    />
                °
                <FormControl
                    key={this.props.coordinate + "minutes"}
                    placeholder={"m"}
                    onChange={() => {

                    }}
                    value={this.props.minutes}
                    max={60  /*this can change if degree is at the max value or min if South / East*/}
                    min={0}
                    style={{width: 60}}
                    step={1}
                    type="number"
                    />
                {"'"}
                <FormControl
                    key={this.props.coordinate + "seconds"}
                    value={this.props.seconds}
                    placeholder="s"
                    onChange={() => {}}
                    step={1}
                    style={{width: 60}}
                    type="number"
                    />
                {"''"}
                <FormControl componentClass="select" placeholder="select"
                    style={{width: 50}}
                    value={this.props.direction}
                    >
                    <option value="N">N</option>
                    <option value="S">S</option>
                </FormControl>
            </FormGroup>
        );
    }
}

module.exports = decimalToAeronautical(CoordinateEntry);
