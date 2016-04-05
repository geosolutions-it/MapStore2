/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');

const {Glyphicon, Tooltip} = require('react-bootstrap');
const ToggleButton = require('../../../components/buttons/ToggleButton');
const Message = require('../../../components/I18N/Message');

const Print = React.createClass({
    propTypes: {
        isPanel: React.PropTypes.bool,
        buttonTooltip: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element]),
        help: React.PropTypes.object,
        changeHelpText: React.PropTypes.func,
        changeHelpwinVisibility: React.PropTypes.func,
        onToggle: React.PropTypes.func,
        enabled: React.PropTypes.bool
    },
    contextTypes: {
        router: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            isPanel: false,
            icon: <Glyphicon glyph="print"/>,
            onToggle: () => {},
            enabled: false
        };
    },
    render() {
        let tooltip = <Tooltip id="toolbar-print-button">{this.props.buttonTooltip}</Tooltip>;
        return (
            <ToggleButton
                id="print-button"
                key="print"
                isButton={true}
                pressed={this.props.enabled}
                glyphicon="print"
                helpText={<Message msgId="helptexts.print"/>}
                onClick={this.props.onToggle}
                tooltip={tooltip}
                tooltipPlace="left"
                />
        );
    }
});
module.exports = Print;
