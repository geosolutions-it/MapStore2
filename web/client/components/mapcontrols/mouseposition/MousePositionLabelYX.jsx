
/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import PropTypes from 'prop-types';
import React from 'react';
import NumberFormat from '../../I18N/Number';

class MousePositionLabelYX extends React.Component {
    static propTypes = {
        position: PropTypes.shape({
            x: PropTypes.number,
            y: PropTypes.number
        })
    };

    render() {
        let format = {style: "decimal", minimumIntegerDigits: 2, maximumFractionDigits: 2, minimumFractionDigits: 2};
        return (
            <>
                <span>
                    {"X: "}
                    <NumberFormat key="x" numberParams={format} value={this.props.position.x} />
                </span>
                <span>
                    {"Y: "}
                    <NumberFormat key="y" numberParams={format} value={this.props.position.y} />
                </span>
            </>);
    }
}

export default MousePositionLabelYX;
