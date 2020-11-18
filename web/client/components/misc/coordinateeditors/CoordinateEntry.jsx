/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';

import PropTypes from 'prop-types';
import DecimalCoordinateEditor from './editors/DecimalCoordinateEditor';
import AeronauticalCoordinateEditor from './editors/AeronauticalCoordinateEditor';
import { isNil } from 'lodash';
import no90Lat from './enhancers/no90Lat';

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

export default no90Lat(CoordinateEntry); // TODO: remove no90Lat this when issue with coordinate 90 is fixed in annotations
