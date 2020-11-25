/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import PropTypes from 'prop-types';
import { Glyphicon, Tooltip } from 'react-bootstrap';
import Message from '../../I18N/Message';
import OverlayTrigger from '../../misc/OverlayTrigger';

class ToggleFilter extends React.Component {
    static propTypes = {
        node: PropTypes.object,
        propertiesChangeHandler: PropTypes.func
    };

    static inheritedPropTypes = ['node'];

    static defaultProps = {
        node: null,
        propertiesChangeHandler: () => {}
    };
    render() {
        const {layerFilter} = this.props.node || {};
        const {disabled} = layerFilter || {};
        return !!layerFilter && (
            <OverlayTrigger
                placement="bottom"
                overlay={<Tooltip id="toc-filter-icon">{<Message msgId={!disabled ? 'toc.filterIconEnabled' : 'toc.filterIconDisabled'} />}</Tooltip>}>
                <Glyphicon onClick={this.onClick} className={`toc-filter-icon ${!!disabled ? "disabled" : ""}`} glyph="filter-layer" />
            </OverlayTrigger>
        );
    }
    onClick = () => {
        const {layerFilter} = this.props.node || {};
        this.props.propertiesChangeHandler(this.props.node.id, {layerFilter: {...layerFilter, disabled: !layerFilter.disabled}});
    }
}

export default ToggleFilter;
