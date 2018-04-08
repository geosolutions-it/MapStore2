/*
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');
const {Glyphicon, Tooltip} = require('react-bootstrap');
const Message = require('../../I18N/Message');
const OverlayTrigger = require('../../misc/OverlayTrigger');

class StatusIcon extends React.Component {
    static propTypes = {
        node: PropTypes.object,
        onClick: PropTypes.func
    };

    static inheritedPropTypes = ['node', 'expanded'];

    static defaultProps = {
        node: null,
        onClick: () => {}
    };

    render() {
        const expanded = this.props.node.expanded !== undefined ? this.props.node.expanded : true;
        return (
            <OverlayTrigger
                placement="bottom"
                overlay={<Tooltip id="toc-status-icon">{<Message msgId={expanded ? 'toc.statusIconOpen' : 'toc.statusIconClose'} />}</Tooltip>}>
                <Glyphicon onClick={this.props.onClick} className="toc-status-icon" glyph={expanded ? "folder-open" : "folder-close"} />
            </OverlayTrigger>
        );
    }
}

module.exports = StatusIcon;
