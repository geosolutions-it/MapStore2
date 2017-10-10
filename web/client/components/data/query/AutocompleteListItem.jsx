/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/


const React = require('react');
const PropTypes = require('prop-types');
class AutocompleteListItem extends React.Component {
    static propTypes = {
        item: PropTypes.object,
        textField: PropTypes.string,
        valueField: PropTypes.string
    };

    render() {
        const option = this.props.item;
        return (
            !!option.pagination ? <span>{option[this.props.textField]} {option.pagination} </span> : <span>{option[this.props.textField]}</span>
        );
    }
}

module.exports = AutocompleteListItem;
