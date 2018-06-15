const React = require('react');
const PropTypes = require('prop-types');
// const {FormGroup, FormControl} = require('react-bootstrap');
const DecimalCoordinateEditor = require('./editors/DecimalCoordinateEditor');
const AeronauticalCoordinateEditor = require('./editors/AeronauticalCoordinateEditor');
const {isNil} = require('lodash');

/**
 This component can render an input field in two different formats: 'decimal' or 'aeronautical'
*/
class CoordinateEntry extends React.Component {

    static propTypes = {
        idx: PropTypes.number,
        value: PropTypes.number,
        constraints: PropTypes.object,
        format: PropTypes.string,
        coordinate: PropTypes.string,
        onChange: PropTypes.func
    };
    defaultProps = {
        format: "decimal"
    }

    render() {
        const {format} = this.props;
        return format === "decimal" || isNil(format) ? <DecimalCoordinateEditor {...this.props} format={this.props.format || "decimal"}/> : <AeronauticalCoordinateEditor {...this.props}/>;
    }
}

module.exports = CoordinateEntry;
