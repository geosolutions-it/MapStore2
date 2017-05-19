const PropTypes = require('prop-types');
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

class CustomTooltip extends React.Component {
    static propTypes = {
        type: PropTypes.string,
        payload: PropTypes.array,
        label: PropTypes.string,
        active: PropTypes.bool
    };

    render() {
        const {active} = this.props;

        if (active) {
            const { payload} = this.props;
            return (
                <div className="custom-tooltip">
                    <p className="label">{Math.abs(payload[0].value)}</p>
                </div>
            );
        }
        return null;
    }
}

module.exports = CustomTooltip;
