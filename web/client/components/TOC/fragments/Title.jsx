/*
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const PropTypes = require('prop-types');
const React = require('react');
const {isObject} = require('lodash');
const {Tooltip} = require('react-bootstrap');
const OverlayTrigger = require('../../misc/OverlayTrigger');
require("./css/toctitle.css");

class Title extends React.Component {
    static propTypes = {
        node: PropTypes.object,
        onClick: PropTypes.func,
        onContextMenu: PropTypes.func,
        currentLocale: PropTypes.string,
        filterText: PropTypes.string,
        tooltip: PropTypes.bool
    };

    static defaultProps = {
        onClick: () => {},
        onContextMenu: () => {},
        currentLocale: 'en-US',
        filterText: '',
        tooltip: false
    };

    getFilteredTitle = (title) => {
        const splitTitle = title.toLowerCase().split(this.props.filterText.toLowerCase());

        return this.props.filterText ? splitTitle.reduce((a, b, idx) => {
            if (idx === splitTitle.length - 1) {
                return [...a, b];
            }
            return [...a, b, <strong key={idx}>{this.props.filterText.toLowerCase()}</strong>];
        }, []) : title;
    }

    render() {
        const translation = isObject(this.props.node.title) ? this.props.node.title[this.props.currentLocale] || this.props.node.title.default : this.props.node.title;
        const title = translation || this.props.node.name;
        return this.props.tooltip ? (
            <OverlayTrigger placement="top" overlay={(<Tooltip id={"tooltip-layer-title"}>{title}</Tooltip>)}>
                <div className="toc-title" onClick={this.props.onClick ? (e) => this.props.onClick(this.props.node.id, 'layer', e.ctrlKey) : () => {}} onContextMenu={(e) => {e.preventDefault(); this.props.onContextMenu(this.props.node); }}>
                    {this.getFilteredTitle(title)}
                </div>
            </OverlayTrigger>

        ) :
        (
            <div className="toc-title" onClick={this.props.onClick ? (e) => this.props.onClick(this.props.node.id, 'layer', e.ctrlKey) : () => {}} onContextMenu={(e) => {e.preventDefault(); this.props.onContextMenu(this.props.node); }}>
                {this.getFilteredTitle(title)}
            </div>
        );
    }
}

module.exports = Title;
