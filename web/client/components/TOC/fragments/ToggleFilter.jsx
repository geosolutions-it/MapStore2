/*
 * Copyright 2019, GeoSolutions Sas.
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

module.exports = ToggleFilter;
