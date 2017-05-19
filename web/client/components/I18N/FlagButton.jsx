
const PropTypes = require('prop-types');
/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var {Button, Tooltip} = require('react-bootstrap');
const OverlayTrigger = require('../misc/OverlayTrigger');
var LocaleUtils = require('../../utils/LocaleUtils');


class LangBar extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        lang: PropTypes.string,
        code: PropTypes.string,
        active: PropTypes.bool,
        label: PropTypes.string,
        description: PropTypes.string,
        onFlagSelected: PropTypes.func
    };

    static defaultProps = {
        locales: LocaleUtils.getSupportedLocales(),
        code: 'en-US',
        onLanguageChange: function() {}
    };

    render() {
        let tooltip = <Tooltip id={"flag-button." + this.props.code}>{this.props.label}</Tooltip>;
        return (<OverlayTrigger key={"overlay-" + this.props.code} overlay={tooltip}>
            <Button
                key={this.props.code}
                onClick={this.launchFlagAction.bind(this, this.props.code)}
                active={this.props.active}>
                <img src={require('./images/flags/' + this.props.code + '.png')} alt={this.props.label}/>
            </Button>
        </OverlayTrigger>);
    }

    launchFlagAction = (code) => {
        this.props.onFlagSelected(code);
    };
}

module.exports = LangBar;
