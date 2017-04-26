/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ScrollUp = require('react-scroll-up');
const Message = require('../components/I18N/Message');
const {Glyphicon, Button, Tooltip} = require('react-bootstrap');
const OverlayTrigger = require('../components/misc/OverlayTrigger');

/**
 * ScrollUp Plugin. Show a button that allows to scroll to the top of the page. Only for full pages.
 * @prop cfg.style {object} the style of the scrollUp div
 * @prop cfg.btnClassName {string} the class to set for the button
 * @prop cfg.showUnder {number} pixels of scroll before to show the button. Default 200
 * @memberof plugins
 * @class
 * @static
 */
const ScrollTop = React.createClass({
    propTypes: {
        style: React.PropTypes.object,
        showUnder: React.PropTypes.number,
        btnClassName: React.PropTypes.string
    },
    getDefaultProps() {
        return {
            showUnder: 200,
            btnClassName: 'square-button',
            style: {
              zIndex: 10,
              position: 'fixed',
              bottom: 50,
              right: 30,
              cursor: 'pointer',
              transitionDuration: '0.2s',
              transitionTimingFunction: 'linear',
              transitionDelay: '0s'
            }
        };
    },
    render() {
        return (
            <ScrollUp style={this.props.style} showUnder={this.props.showUnder}>
                <OverlayTrigger placement="left" overlay={<Tooltip id="scrollTop-button-tooltip"><Message msgId="home.scrollTop"/></Tooltip>}>
                    <Button bsStyle="primary" className={this.props.btnClassName}><Glyphicon glyph="arrow-up"/></Button>
                </OverlayTrigger>
            </ScrollUp>);
    }
});


module.exports = {
    ScrollTopPlugin: ScrollTop
};
