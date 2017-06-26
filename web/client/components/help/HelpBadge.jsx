const PropTypes = require('prop-types');
/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var BootstrapReact = require('react-bootstrap');
var Badge = BootstrapReact.Badge;

const {isString} = require('lodash');
const LocaleUtils = require('../../utils/LocaleUtils');

/**
 * A badge to show that there is a help text available for the parent component.
 * Also updates the current help text (state) when the badge is clicked.
 *
 * Component's properies:
 *  - helpText: {string}      the text to be displayed when this badge is clicked
 *  - isVisible: {bool}       flag to steer visibility of the badge
 *  - changeHelpText (func)   action to change the current help text
 */
class HelpBadge extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        helpText: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        isVisible: PropTypes.bool,
        changeHelpText: PropTypes.func,
        changeHelpwinVisibility: PropTypes.func,
        className: PropTypes.string
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        helpText: '',
        isVisible: false
    };

    onMouseOver = () => {
        const helpText = isString(this.props.helpText) ? this.props.helpText : LocaleUtils.getMessageById(this.context.messages, this.props.helpText.props.msgId);
        this.props.changeHelpText(helpText);
        this.props.changeHelpwinVisibility(true);
    };

    render() {
        return (
            <Badge
                id={this.props.id}
                onMouseOver={this.onMouseOver}
                className={(this.props.isVisible ? '' : 'hidden ') + (this.props.className ? this.props.className : '')}
            >?</Badge>
        );
    }
}

module.exports = HelpBadge;
