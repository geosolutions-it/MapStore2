/*
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const PropTypes = require('prop-types');
const {Button, Tooltip} = require('react-bootstrap');
const OverlayTrigger = require('../misc/OverlayTrigger');
const LocaleUtils = require('../../utils/LocaleUtils');


class LangBar extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        lang: PropTypes.string,
        code: PropTypes.string,
        active: PropTypes.bool,
        label: PropTypes.string,
        description: PropTypes.string,
        onFlagSelected: PropTypes.func,
        tooltipPlacement: PropTypes.string
    };

    static defaultProps = {
        locales: LocaleUtils.getSupportedLocales(),
        code: 'en-US',
        onLanguageChange: function() {},
        onFlagSelected: () => {},
        tooltipPlacement: 'bottom'
    };

    render() {
        let tooltip = <Tooltip id={"flag-button." + this.props.code} >{this.props.label}</Tooltip>;
        let imgSrc;
        try {
            imgSrc = require('./images/flags/' + this.props.code + '.png');
        } catch (e) {
            imgSrc = null;
        }

        return imgSrc ? (<OverlayTrigger key={"overlay-" + this.props.code} overlay={tooltip} placement={this.props.tooltipPlacement}>
            <Button
                key={this.props.code}
                onClick={this.launchFlagAction.bind(this, this.props.code)}
                active={this.props.active}>
                <img src={imgSrc} alt={this.props.label}/>
            </Button>
        </OverlayTrigger>) : null;
    }

    launchFlagAction = (code) => {
        this.props.onFlagSelected(code);
    };
}

module.exports = LangBar;
