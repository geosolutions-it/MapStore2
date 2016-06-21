/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');

const {Glyphicon, Button} = require('react-bootstrap');

const SwipeHeader = React.createClass({
    propTypes: {
        title: React.PropTypes.string,
        container: React.PropTypes.object,
        useButtons: React.PropTypes.bool
    },
    getDefaultProps() {
        return {
            useButtons: false
        };
    },
    componentDidMount() {
        this.interval = setInterval(() => {
            if (this.props.container && this.props.container().swipe && ReactDOM.findDOMNode(this.refs.left)) {
                ReactDOM.findDOMNode(this.refs.left).style.opacity = this.props.container().swipe.getPos() > 0 ? 1.0 : 0.5;
            }
            if (this.props.container && this.props.container().swipe && ReactDOM.findDOMNode(this.refs.right)) {
                ReactDOM.findDOMNode(this.refs.right).style.opacity = this.props.container().swipe.getPos() < (this.props.container().swipe.getNumSlides() - 1) ? 1.0 : 0.5;
            }
        }, 500);
    },
    componentWillUnmount() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    },
    renderLeftButton() {
        return this.props.useButtons ?
            <Button ref="left" className="swipe-header-left-button square-button" bsStyle="primary" onClick={() => {this.props.container().swipe.prev(); }}><Glyphicon glyph="arrow-left"/></Button> :
            <a ref="left" className="swipe-header-left-button" onClick={() => {this.props.container().swipe.prev(); }}><Glyphicon glyph="chevron-left" /></a>;
    },
    renderRightButton() {
        return this.props.useButtons ?
            <Button ref="right" className="swipe-header-right-button square-button" bsStyle="primary" onClick={() => {this.props.container().swipe.next(); }}><Glyphicon glyph="arrow-right"/></Button> :
            <a ref="right" className="swipe-header-right-button" onClick={() => {this.props.container().swipe.next(); }}><Glyphicon glyph="chevron-right" /></a>;
    },
    render() {
        return (<span>{this.renderLeftButton()} <span>{this.props.title}</span> {this.renderRightButton()}</span>);
    }
});

module.exports = SwipeHeader;
