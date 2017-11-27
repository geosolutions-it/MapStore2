/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/


const React = require('react');
const PropTypes = require('prop-types');
class ComboFieldListItem extends React.Component {
    static propTypes = {
        item: PropTypes.string,
        textField: PropTypes.string,
        customItemClassName: PropTypes.string,
        valueField: PropTypes.string
    };

    render() {
        return (
            <span className={this.props.customItemClassName ? this.props.customItemClassName : ""}>{this.props.item}</span>
        );
    }
}

module.exports = ComboFieldListItem;
