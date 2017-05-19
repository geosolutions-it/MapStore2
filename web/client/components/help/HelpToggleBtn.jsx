var PropTypes = require('prop-types');
/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


var React = require('react');
var ToggleButton = require('../buttons/ToggleButton');
require("./help.css");

/**
 * A toggle button class for enabling / disabling help modus
 */
class HelpToggleBtn extends React.Component {
    static propTypes = {
        key: PropTypes.string,
        isButton: PropTypes.bool,
        glyphicon: PropTypes.string,
        pressed: PropTypes.bool,
        changeHelpState: PropTypes.func,
        changeHelpwinVisibility: PropTypes.func
    };

    static defaultProps = {
        key: 'helpButton',
        isButton: true,
        glyphicon: 'question-sign'
    };

    onClick = () => {
        this.props.changeHelpState(!this.props.pressed);
        this.props.changeHelpwinVisibility(false);
    };

    render() {
        return (
            <ToggleButton
                key={this.props.key}
                isButton={this.props.isButton}
                glyphicon={this.props.glyphicon}
                pressed={this.props.pressed}
                onClick={this.onClick}/>
        );
    }
}

module.exports = HelpToggleBtn;
