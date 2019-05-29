const PropTypes = require('prop-types');
/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const ToggleButton = require('./ToggleButton');
const {Tooltip} = require('react-bootstrap');
const Message = require('../I18N/Message');

/**
 * Toggle button for fullscreen. Wraps {@link #components.buttons.ToggleButton} with some defaults
 * @memberof components.buttons
 * @class
 * @prop {string} [id] an id for the html component
 * @prop {object} [btnConfig] the configuration to pass to the bootstrap button
 * @prop {object} [options] the options to send when toggle is clicked
 * @prop {string|element} [text] the text to disaplay
 * @prop {string|element} [help] the help text
 * @prop {string} glyphicon the icon name
 * @prop {bool} active the status of the button
 * @prop {function} onClick. The method to call when clicked. the method will return as parameter the toggled `pressed` prop and the `options` object
 * @prop {node} [activeTooltip] the tooltip to use on mouse hover
 * @prop {node} [notActiveTooltip] the tooltip to use on mouse hover when the button is active
 * @prop {string} [tooltipPlace] positon of the tooltip, one of: 'top', 'right', 'bottom', 'left'
 * @prop {object} css style object for the component
 * @prop {btnType} [btnType] one of 'normal', 'image'
 * @prop {string} image if type is 'image', the src of the image
 * @prop {string} pressedStyle the bootstrap style for pressedStyle
 * @prop {string} defaultStyle the bootstrap style when not pressed
 *
 */
class FullScreenButton extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        btnConfig: PropTypes.object,
        options: PropTypes.object,
        text: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        help: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        glyphicon: PropTypes.string,
        active: PropTypes.bool,
        onClick: PropTypes.func,
        activeTooltip: PropTypes.string,
        notActiveTooltip: PropTypes.string,
        tooltipPlace: PropTypes.string,
        style: PropTypes.object,
        btnType: PropTypes.oneOf(['normal', 'image']),
        image: PropTypes.string,
        pressedStyle: PropTypes.string,
        defaultStyle: PropTypes.string
    };

    static defaultProps = {
        id: 'fullscreen-btn',
        activeTooltip: 'fullscreen.tooltipDeactivate',
        notActiveTooltip: 'fullscreen.tooltipActivate',
        tooltipPlace: 'left',
        defaultStyle: 'primary',
        pressedStyle: 'success active',
        glyphicon: '1-full-screen',
        btnConfig: {
            className: "square-button"
        }
    };

    getButtonProperties = () => {
        return ['id',
            'btnConfig',
            'options',
            'text',
            'glyphicon',
            'onClick',
            'tooltipPlace',
            'style',
            'btnType',
            'image',
            'pressedStyle',
            'defaultStyle'
        ].reduce((result, key) => { result[key] = this.props[key]; return result; }, {});
    };

    render() {
        return (<ToggleButton {...this.getButtonProperties()} pressed={this.props.active} tooltip={<Tooltip id="full-screen-button-tip"><Message msgId={this.props.active ? this.props.activeTooltip : this.props.notActiveTooltip}/></Tooltip>} />);
    }
}

module.exports = FullScreenButton;
