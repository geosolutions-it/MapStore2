/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import PropTypes from 'prop-types';
import { Popover, OverlayTrigger } from 'react-bootstrap';
import ConfigUtils from '../../../utils/ConfigUtils';

/**
 * Toolbar for AddBar.
 * Shows a toolbar inside the popover
 */
class ToolbarPopover extends React.Component {

    static propTypes = {
        id: PropTypes.string,
        style: PropTypes.object,
        className: PropTypes.string,
        popoverClassName: PropTypes.string,
        placement: PropTypes.string,
        title: PropTypes.node,
        content: PropTypes.node,
        useBody: PropTypes.bool
    };

    static defaultProps = {
        id: '',
        useBody: false
    };

    getContainerNode = (useBody) => {
        // The overlay container should always have a target root container to ensure all mapstore2 styles can be applied.
        // The parentNode is the default and fallback is got from the themePrefix
        return useBody ? document.body : this.parentNode || document.querySelector('.' + (ConfigUtils.getConfigProp('themePrefix') || 'ms2') + " > div") || document.body;
    }

    render() {
        const container = this.getContainerNode(this.props.useBody);
        return (
            <div
                ref={div => {
                    this.parentNode = div && div.parentNode;
                }}
                className={this.props.className} style={this.props.style}>
                <OverlayTrigger
                    ref={trigger => { this.trigger = trigger; }}
                    trigger={['click']}
                    container={container}
                    placement={this.props.placement}
                    rootClose
                    overlay={
                        <Popover
                            id={this.props.id}
                            title={this.props.title}
                            className={this.props.popoverClassName}>
                            {this.props.content}
                        </Popover>}>
                    {this.props.children}
                </OverlayTrigger>
            </div>
        );
    }
}

export default ToolbarPopover;
