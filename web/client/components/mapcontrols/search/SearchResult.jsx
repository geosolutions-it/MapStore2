const PropTypes = require('prop-types');
/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {get} = require('lodash');

const {generateTemplateString} = require('../../../utils/TemplateUtils');

class SearchResult extends React.Component {
    static propTypes = {
        /* field name or template.
         * e.g. "properties.subTitle"
         * e.g. "This is a subtitle for ${properties.subTitle}"
         */
        subTitle: PropTypes.string,
        item: PropTypes.object,
        /* field name or template.
         * e.g. "properties.displayName"
         * e.g. "This is a title for ${properties.title}"
         */
        displayName: PropTypes.string,
        idField: PropTypes.string,
        icon: PropTypes.string,
        onItemClick: PropTypes.func
    };

    static defaultProps = {
        displayName: "properties.display_name",
        idField: "id",
        icon: "properties.icon"
    };

    onClick = () => {
        let item = this.props.item;
        this.props.onItemClick(item);
    };

    render() {
        if (this.props.item === undefined) {
            return null;
        }
        let item = this.props.item;
        return (
            <div key={item.osm_id} className="search-result" style={item.resultCssStyle} onClick={this.onClick}>
                <div className="icon"> <img src={item.icon} /></div>
                <div className="text-result-title">{get(item, this.props.displayName) || generateTemplateString(this.props.displayName || "")(item) }</div>
                <small className="text-info">{this.props.subTitle && get(item, this.props.subTitle) || generateTemplateString(this.props.subTitle || "")(item) }</small>
            </div>
        );
    }
}

module.exports = SearchResult;
