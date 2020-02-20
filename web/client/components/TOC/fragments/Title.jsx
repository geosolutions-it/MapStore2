/*
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const PropTypes = require('prop-types');
const React = require('react');
const {Tooltip} = require('react-bootstrap');
const OverlayTrigger = require('../../misc/OverlayTrigger');
const {getTitleAndTooltip} = require('../../../utils/TOCUtils');

require("./css/toctitle.css");

class Title extends React.Component {
    static propTypes = {
        node: PropTypes.object,
        onClick: PropTypes.func,
        onContextMenu: PropTypes.func,
        currentLocale: PropTypes.string,
        filterText: PropTypes.string,
        tooltip: PropTypes.bool,
        tooltipOptions: PropTypes.object
    };

    static defaultProps = {
        onClick: () => {},
        onContextMenu: () => {},
        currentLocale: 'en-US',
        filterText: '',
        tooltip: false,
        tooltipOptions: {
            maxLength: 807,
            separator: " - "
        }
    };

    getFilteredTitle = (title) => {
        const splitTitle = title.toLowerCase().split(this.props.filterText.toLowerCase());

        return this.props.filterText ? splitTitle.reduce((a, b, idx) => {
            if (idx === splitTitle.length - 1) {
                return [...a, b];
            }
            return [...a, b, <strong key={idx}>{this.props.filterText.toLowerCase()}</strong>];
        }, []) : title;
    };

    renderTitle = () => {
        const {title} = getTitleAndTooltip(this.props);
        return (
            <div className="toc-title" onClick={this.props.onClick ? (e) => this.props.onClick(this.props.node.id, 'layer', e.ctrlKey) : () => {}} onContextMenu={(e) => {e.preventDefault(); this.props.onContextMenu(this.props.node); }}>
                {this.getFilteredTitle(title)}
            </div>
        );
    };

    render() {
        const {tooltipText} = getTitleAndTooltip(this.props);
        return this.props.tooltip && tooltipText ? (
            <OverlayTrigger placement={this.props.node.tooltipPlacement || "top"} overlay={(<Tooltip id={"tooltip-layer-title"}>{tooltipText}</Tooltip>)}>
                {this.renderTitle()}
            </OverlayTrigger>
        ) : this.renderTitle();
    }
}


module.exports = Title;
