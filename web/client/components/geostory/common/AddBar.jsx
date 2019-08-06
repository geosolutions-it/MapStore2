import React from 'react';
import PropTypes from 'prop-types';
import { Glyphicon } from 'react-bootstrap';

import ToolbarPopover from './ToolbarPopover';

import Toolbar from '../../misc/toolbar/Toolbar';

class AddBar extends React.Component {

    static propTypes = {
        id: PropTypes.string,
        type: PropTypes.string,
        buttons: PropTypes.buttons
    };

    static defaultProps = {
        id: '',
        type: '',
        buttons: []
    };

    render() {
        return (
            <ToolbarPopover
                className="add-bar"
                style={{ // TODO: externalize
                    textAlign: 'center'
                }}
                content={(<Toolbar buttons={this.props.buttons.map( ({onClick = () => {}, ...button}) => ({
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
                <Glyphicon
                    glyph="plus"
                    className="text-primary"
                    />
            </ToolbarPopover>
        );
    }
}

export default AddBar;
