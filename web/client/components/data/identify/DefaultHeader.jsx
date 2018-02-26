/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');

class DefaultHeader extends React.Component {
    static propTypes = {
        title: PropTypes.string
    };

    render() {
        return <span> <span>{this.props.title}</span> </span>;
    }
}

module.exports = DefaultHeader;
