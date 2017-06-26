const PropTypes = require('prop-types');
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const HTML = require('../../components/I18N/HTML');

require('./homedescription/homedescription.css');

class HomeDescription extends React.Component {
    static propTypes = {
        style: PropTypes.object,
        className: PropTypes.object
    };

    render() {
        return (
            <div style={this.props.style} className="mapstore-home-description">
                <HTML msgId="home.description" />
            </div>
        );
    }
}

module.exports = {
    HomeDescriptionPlugin: HomeDescription
};
