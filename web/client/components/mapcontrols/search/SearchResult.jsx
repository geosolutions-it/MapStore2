/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {get} = require('lodash');


let SearchResult = React.createClass({
    propTypes: {
        item: React.PropTypes.object,
        displayName: React.PropTypes.string,
        idField: React.PropTypes.string,
        icon: React.PropTypes.string,
        onItemClick: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            displayName: "properties.display_name",
            idField: "id",
            icon: "properties.icon"
        };
    },
    onClick() {
        let item = this.props.item;
        this.props.onItemClick(item);
    },
    render() {
        if (this.props.item === undefined) {
            return null;
        }
        let item = this.props.item;
        return (
            <div key={item.osm_id} className="search-result NominatimResult" onClick={this.onClick}>
                <div className="icon"> <img src={item.icon} /></div>
                {get(item, this.props.displayName) }
            </div>
        );
    }
});

module.exports = SearchResult;
