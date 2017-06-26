const PropTypes = require('prop-types');
/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/


const React = require('react');

class AutocompleteListItem extends React.Component {
    static propTypes = {
        item: PropTypes.object
    };

    render() {
        const option = this.props.item;
        return (
            <span>{option.label} {option.pagination} </span>
        );
    }
}

module.exports = AutocompleteListItem;
