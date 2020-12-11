/*
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import PropTypes from 'prop-types';
import StatusIcon from './StatusIcon';
import { Tooltip } from 'react-bootstrap';
import OverlayTrigger from '../../misc/OverlayTrigger';
import { getTitleAndTooltip } from '../../../utils/TOCUtils';

class GroupTitle extends React.Component {
    static propTypes = {
        node: PropTypes.object,
        onClick: PropTypes.func,
        onSelect: PropTypes.func,
        style: PropTypes.object,
        currentLocale: PropTypes.string,
        tooltip: PropTypes.bool,
        tooltipOptions: PropTypes.object
    };

    static inheritedPropTypes = ['node'];

    static defaultProps = {
        onClick: () => {},
        onSelect: null,
        currentLocale: 'en-US',
        style: {},
        tooltip: false,
        tooltipOptions: {
            maxLength: 807,
            separator: " - "
        }
    };

    render() {
        let expanded = this.props.node.expanded !== undefined ? this.props.node.expanded : true;
        const {title: groupTitle, tooltipText} = getTitleAndTooltip(this.props);

        return this.props.tooltip && tooltipText ? (
            <OverlayTrigger placement={this.props.node.tooltipPlacement || "top"} overlay={(<Tooltip id={"tooltip-layer-group"}>{tooltipText}</Tooltip>)}>
                <div style={this.props.style}>
                    <span className="toc-group-title" onClick={ this.props.onSelect ? (e) => this.props.onSelect(this.props.node.id, 'group', e.ctrlKey) : () => {}}>{groupTitle}</span><StatusIcon onClick={() => this.props.onClick(this.props.node.id, expanded)} expanded={expanded} node={this.props.node}/>
                </div>
            </OverlayTrigger>
        ) :
            (
                <div style={this.props.style}>
                    <span className="toc-group-title" onClick={ this.props.onSelect ? (e) => this.props.onSelect(this.props.node.id, 'group', e.ctrlKey) : () => {}}>{groupTitle}</span><StatusIcon onClick={() => this.props.onClick(this.props.node.id, expanded)} expanded={expanded} node={this.props.node}/>
                </div>
            );
    }
}

export default GroupTitle;
