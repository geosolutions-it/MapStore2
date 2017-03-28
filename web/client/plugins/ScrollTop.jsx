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
const {Glyphicon, Button, OverlayTrigger, Tooltip} = require('react-bootstrap');

/**
 * ScrollUp Plugin. Show a button that allows to scroll to the top of the page. Only for full pages.
 * @prop style the style of the scrollUp div
 * @memberof plugins
 * @static
 */
const ScrollTop = React.createClass({
    propTypes: {
        style: React.PropTypes.object,
        showUnder: React.PropTypes.number
    },
    getDefaultProps() {
        return {
            showUnder: 200,
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
                <OverlayTrigger placement="left" overlay={<Tooltip><Message msgId="home.scrollTop"/></Tooltip>}>
                    <Button bsStyle="primary"><Glyphicon glyph="arrow-up"/></Button>
                </OverlayTrigger>
            </ScrollUp>);
    }
});


module.exports = {
    ScrollTopPlugin: ScrollTop
};
