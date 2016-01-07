/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var BootstrapReact = require('react-bootstrap');
var Panel = BootstrapReact.Panel;

/**
 * A panel showning th current selectd help text.
 *
 * Component's properies:
 *  - id: {string}            the components identifier
 *  - helpText: {string}      the text to display
 *  - isVisible: {bool}       flag to steer visibility of the badge
 *  - title (string)          header text of this panel
 */
var HelpTextPanel = React.createClass({
    propTypes: {
        id: React.PropTypes.string,
        helpText: React.PropTypes.string,
        isVisible: React.PropTypes.bool,
        title: React.PropTypes.string
    },
    getDefaultProps() {
        return {
            id: 'mapstore-helptext-panel',
            isVisible: false,
            title: 'HELP'
        };
    },
    render() {
        return (
            <div
                id={this.props.id}
                className={this.props.isVisible ? '' : 'hidden'}
                style={{position: "absolute", top: "140px", marginLeft: "8px"}}>
                <Panel
                    header={this.props.title}>
                    {this.props.helpText}
                </Panel>
            </div>
        );
    }
});

module.exports = HelpTextPanel;
