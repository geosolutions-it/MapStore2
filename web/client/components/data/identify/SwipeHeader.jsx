/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {Glyphicon} = require('react-bootstrap');

const SwipeHeader = React.createClass({
    propTypes: {
        title: React.PropTypes.string,
        container: React.PropTypes.object
    },
    renderLeftButton() {
        return <a style={{"float": "left"}} onClick={() => {this.props.container().swipe.prev(); }}><Glyphicon glyph="chevron-left" /></a>;
    },
    renderRightButton() {
        return <a style={{"float": "right"}} onClick={() => {this.props.container().swipe.next(); }}><Glyphicon glyph="chevron-right" /></a>;
    },
    render() {
        return (<span>{this.renderLeftButton()} <span>{this.props.title}</span> {this.renderRightButton()}</span>);
    }
});

module.exports = SwipeHeader;
