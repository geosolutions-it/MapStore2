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
        buttons: PropTypes.buttons,
        containerWidth: PropTypes.number,
        containerHeight: PropTypes.number
    };

    static defaultProps = {
        id: '',
        type: '',
        buttons: [],
        containerWidth: 0,
        containerHeight: 0
    };

    componentWillReceiveProps(newProps) {
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
                content={(
                <Toolbar
                    btnDefaultProps={{ className: 'square-button btn-tray' }}
                    buttons={this.props.buttons.map( ({onClick = () => {}, ...button}) => ({
                    ...button,
                    // auto-close popover on button click
                    onClick: (...args) => {
                        onClick(...args);
                        this.trigger.hide();
                    }
                }))}/>)}
                ref={(popover) => {
                    if (popover) this.trigger = popover.trigger;
                }}
                placement="top"
                >
                <Button>
                    <Glyphicon
                        glyph="plus"/>
                </Button>
            </ToolbarPopover>
        );
    }
}

export default AddBar;
