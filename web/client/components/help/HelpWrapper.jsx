var PropTypes = require('prop-types');
/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


var React = require('react');
var HelpBadge = require('./HelpBadge');
require("./help.css");

/**
 * A wrapper to add a help badge to an element.
 *
 * Component's properies:
 *  - helpText: {string}      the text to be displayed when this badge is clicked
 *  - helpEnabled: {bool}     flag to steer visibility of the badge
 *  - changeHelpText (func)   action to change the current help text
 */
class HelpWrapper extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        helpText: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        helpEnabled: PropTypes.bool,
        changeHelpText: PropTypes.func,
        changeHelpwinVisibility: PropTypes.func
    };

    render() {
        return (
            <div id={this.props.id}>
                <HelpBadge
                    id={"helpbadge-" + (this.props.children.key || this.props.id)}
                    isVisible = {this.props.helpEnabled}
                    helpText = {this.props.helpText}
                    changeHelpText = {this.props.changeHelpText}
                    changeHelpwinVisibility = {this.props.changeHelpwinVisibility}
                />
                {this.props.children}
            </div>);
    }
}

module.exports = HelpWrapper;
