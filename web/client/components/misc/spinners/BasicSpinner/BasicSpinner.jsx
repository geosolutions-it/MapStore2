var PropTypes = require('prop-types');
/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
require("./basicSpinner.css");

class BasicSpinner extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        value: PropTypes.number,
        sSize: PropTypes.string
    };

    static defaultProps = {
        id: "mapstore-basicspinner",
        value: null,
        sSize: null
    };

    render() {
        return (
            <div className="spinner">
                <div className={ "spinner-card " + this.props.sSize}>
                    <div className="spinner-bg spinner-loader" >Loading..</div>
                    <div className="spinner-fg">{this.props.value}</div>
                </div>
            </div>
        );
    }
}

module.exports = BasicSpinner;
