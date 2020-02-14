/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const React = require('react');
const PropTypes = require('prop-types');
const DecimalCoordinateEditor = require('./editors/DecimalCoordinateEditor');
const AeronauticalCoordinateEditor = require('./editors/AeronauticalCoordinateEditor');
const {isNil} = require('lodash');
const no90Lat = require('./enhancers/no90Lat');

/**
 This component can render an input field in two different formats: 'decimal' or 'aeronautical'
*/
class CoordinateEntry extends React.Component {
    static propTypes = {
        idx: PropTypes.number,
        value: PropTypes.number,
        constraints: PropTypes.object,
        format: PropTypes.string,
        aeronauticalOptions: PropTypes.object,
        coordinate: PropTypes.string,
        onChange: PropTypes.func,
        onKeyDown: PropTypes.func
    };

    static defaultProps = {
        format: "decimal",
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
        const {format} = this.props;
        return format === "decimal" || isNil(format) ?
            <DecimalCoordinateEditor {...this.props} format={this.props.format || "decimal"}/> :
            <AeronauticalCoordinateEditor {...this.props}/>;
    }
}

module.exports = no90Lat(CoordinateEntry); // TODO: remove no90Lat this when issue with coordinate 90 is fixed in annotations
