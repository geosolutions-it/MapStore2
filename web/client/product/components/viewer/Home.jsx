const PropTypes = require('prop-types');
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

class Home extends React.Component {
    static propTypes = {
        isPanel: PropTypes.bool,
        buttonTooltip: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        help: PropTypes.object,
        changeHelpText: PropTypes.func,
        changeHelpwinVisibility: PropTypes.func
    };

    static contextTypes = {
        router: PropTypes.object
    };

    static defaultProps = {
        isPanel: false,
        icon: <Glyphicon glyph="home"/>
    };

    render() {
        let tooltip = <Tooltip id="toolbar-home-button">{this.props.buttonTooltip}</Tooltip>;
        return (
            <ToggleButton
                id="home-button"
                key="gohome"
                isButton
                pressed={false}
                glyphicon="home"
                helpText={<Message msgId="helptexts.gohome"/>}
                onClick={this.goHome}
                tooltip={tooltip}
                tooltipPlace="left"
            />
        );
    }

    goHome = () => {
        this.context.router.history.push("/");
    };
}

module.exports = Home;
