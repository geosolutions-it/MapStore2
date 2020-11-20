import PropTypes from 'prop-types';

/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import { Glyphicon, Tooltip } from 'react-bootstrap';
import OverlayTrigger from '../../misc/OverlayTrigger';
import Message from '../../I18N/Message';

class LayersTool extends React.Component {
    static propTypes = {
        node: PropTypes.object,
        onClick: PropTypes.func,
        style: PropTypes.object,
        glyph: PropTypes.string,
        tooltip: PropTypes.string,
        className: PropTypes.string
    };

    static defaultProps = {
        onClick: () => {}
    };

    render() {
        const cn = this.props.className ? " " + this.props.className : "";
        const tool = (<Glyphicon className={"toc-layer-tool" + cn} style={this.props.style}
            glyph={this.props.glyph}
            onClick={() => this.props.onClick(this.props.node)}/>);
        return this.props.tooltip ?
            <OverlayTrigger placement="bottom" overlay={(<Tooltip id={"Tooltip-" + this.props.tooltip}><strong><Message msgId={this.props.tooltip}/></strong></Tooltip>)}>
                {tool}
            </OverlayTrigger> : tool;

    }
}

export default LayersTool;
