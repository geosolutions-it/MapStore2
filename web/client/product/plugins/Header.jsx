var PropTypes = require('prop-types');
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');

class Header extends React.Component {
    static propTypes = {
        style: PropTypes.object,
        className: PropTypes.object
    };

    render() {
        return (
            <div style={this.props.style} className="mapstore-header" />
        );
    }
}

module.exports = {
    HeaderPlugin: Header
};
