const React = require('react');
const PropTypes = require('prop-types');
const {FormGroup, FormControl} = require('react-bootstrap');
const {capitalize} = require('lodash');

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
        onKeyDown: PropTypes.func
    };
    defaultProps = {
        format: "decimal",
        coordinate: "lat",
        onKeyDown: () => {},
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
        }
    }


    render() {
        const {coordinate, value, onChange} = this.props;
        const validateNameFunc = "validateDecimal" + capitalize(coordinate);
        return (
            <FormGroup
                validationState={this[validateNameFunc](value)}>
                <FormControl
                    key={coordinate}
                    value={value}
                    placeholder={coordinate}
                    onChange={e => {
                        if (e.target.value === "") {
                            onChange("");
                        }
                        if (this[validateNameFunc](e.target.value) === null) {
                            onChange(e.target.value);
                        }
                    }}
                    onKeyDown={this.props.onKeyDown}
                    step={1}
                    type="number"/>
            </FormGroup>
        );
    }

    validateDecimalLon = (longitude) => {
        const min = this.props.constraints[this.props.format].lon.min;
        const max = this.props.constraints[this.props.format].lon.max;

        const lon = parseFloat(longitude);
        if (isNaN(lon) || lon < min || lon > max ) {
            return "error";
        }
        return null; // "success"
    }
    validateDecimalLat = (latitude) => {
        const min = this.props.constraints[this.props.format].lat.min;
        const max = this.props.constraints[this.props.format].lat.max;
        const lat = parseFloat(latitude);
        if (isNaN(lat) || lat < min || lat > max ) {
            return "error";
        }
        return null; // "success"
    }
}

module.exports = DecimalCoordinateEditor;
