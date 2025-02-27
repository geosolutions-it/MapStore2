/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import PropTypes from 'prop-types';
import ScrollUp from 'react-scroll-up';
import Message from '../components/I18N/Message';
import { Glyphicon, Tooltip, OverlayTrigger } from 'react-bootstrap';
import Button from '../components/misc/Button';

/**
 * ScrollUp Plugin. Show a button that allows to scroll to the top of the page. Only for full pages.
 * @prop cfg.style {object} the style of the scrollUp div
 * @prop cfg.btnClassName {string} the class to set for the button
 * @prop cfg.showUnder {number} pixels of scroll before to show the button. Default 200
 * @memberof plugins
 * @class
 * @static
 */
class ScrollTop extends React.Component {
    static propTypes = {
        style: PropTypes.object,
        showUnder: PropTypes.number,
        btnClassName: PropTypes.string
    };

    static defaultProps = {
        showUnder: 200,
        btnClassName: 'square-button shadow-far',
        style: {
            zIndex: 5000,
            position: 'fixed',
            bottom: 12,
            right: 8,
            cursor: 'pointer',
            transitionDuration: '0.2s',
            transitionTimingFunction: 'linear',
            transitionDelay: '0s'
        }
    };

    render() {
        return (
            <ScrollUp style={this.props.style} showUnder={this.props.showUnder}>
                <OverlayTrigger placement="left" overlay={<Tooltip id="scrollTop-button-tooltip"><Message msgId="home.scrollTop"/></Tooltip>}>
                    <Button bsStyle="primary" className={this.props.btnClassName}><Glyphicon glyph="arrow-up"/></Button>
                </OverlayTrigger>
            </ScrollUp>);
    }
}


export default {
    ScrollTopPlugin: ScrollTop
};
