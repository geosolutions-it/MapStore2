/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Glyphicon, Button } from 'react-bootstrap';

import ToolbarPopover from './ToolbarPopover';

import Toolbar from '../../misc/toolbar/Toolbar';

/**
 * Generic bar for add Contents
 */
class AddBar extends React.Component {

    static propTypes = {
        id: PropTypes.string,
        type: PropTypes.string,
        buttons: PropTypes.array,
        containerWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        containerHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        addButtonClassName: PropTypes.string
    };

    static defaultProps = {
        id: '',
        type: '',
        buttons: [],
        containerWidth: 0,
        containerHeight: 0,
        addButtonClassName: ''
    };

    UNSAFE_componentWillReceiveProps(newProps) {
        // popover is displayed on wrong position when container change size
        // so hide popover when container width or height change
        if (this.trigger
        && (newProps.containerWidth !== this.props.containerWidth
        || newProps.containerHeight !== this.props.containerHeight)) {
            this.trigger.hide();
        }
    }

    render() {
        return (
            <ToolbarPopover
                className="add-bar"
                popoverClassName="add-bar-popover"
                content={(
                    <Toolbar
                        btnDefaultProps={{ className: 'square-button btn-tray' }}
                        buttons={this.props.buttons.map( ({onClick = () => {}, ...button}) => ({
                            ...button,
                            // auto-close popover on button click
                            onClick: (...args) => {
                                onClick(...args);
                                this.trigger.hide();
                                if (args[0] && args[0].preventDefault) {
                                    args[0].preventDefault();
                                }
                            }
                        }))}/>)}
                ref={(popover) => {
                    if (popover) this.trigger = popover.trigger;
                }}
                placement="top">
                <Button
                    className={this.props.addButtonClassName}>
                    <Glyphicon
                        glyph="plus"/>
                </Button>
            </ToolbarPopover>
        );
    }
}

export default AddBar;
