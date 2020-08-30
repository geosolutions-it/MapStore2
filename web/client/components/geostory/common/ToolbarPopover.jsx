/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');
const {
    Popover,
    OverlayTrigger
} = require('react-bootstrap');

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
        content: PropTypes.node
    };

    static defaultProps = {
        id: ''
    };

    render() {
        return (
            <div
                ref={div => { this.parentNode = div && div.parentNode; }}
                className={this.props.className} style={this.props.style}>
                <OverlayTrigger
                    ref={trigger => { this.trigger = trigger; }}
                    trigger={['click']}
                    container={this.parentNode}
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
