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
let HelpWrapper = React.createClass({
    propTypes: {
        helpText: React.PropTypes.string,
        helpEnabled: React.PropTypes.bool,
        changeHelpText: React.PropTypes.func
    },

    render: function() {
        return (
            <div style={{position: "absolute"}}>
                <HelpBadge
                    id={"helpbadge-" + this.props.children.key}
                    isVisible = {this.props.helpEnabled}
                    helpText = {this.props.helpText}
                    changeHelpText = {this.props.changeHelpText}
                />
                {this.props.children}
            </div>);
    }
});

module.exports = HelpWrapper;
