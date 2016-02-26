/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');

var GlobalSpinner = React.createClass({
    propTypes: {
        id: React.PropTypes.string,
        loading: React.PropTypes.bool
    },
    getDefaultProps() {
        return {
            id: "mapstore-globalspinner",
            loading: false
        };
    },
    render() {
        if (this.props.loading) {
            return (
                <div id={this.props.id}></div>
            );
        }
        return null;
    }
});

module.exports = GlobalSpinner;
