/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {Button, Glyphicon} = require('react-bootstrap');

const ZoomButton = React.createClass({
    propTypes: {
        id: React.PropTypes.string,
        style: React.PropTypes.object,
        glyphicon: React.PropTypes.string,
        text: React.PropTypes.string,
        btnSize: React.PropTypes.oneOf(['large', 'medium', 'small', 'xsmall']),
        className: React.PropTypes.string,
        step: React.PropTypes.number,
        currentZoom: React.PropTypes.number,
        onZoom: React.PropTypes.func,
        tooltip: React.PropTypes.element
    },
    getDefaultProps() {
        return {
            id: "mapstore-zoom",
            className: "square-button",
            glyphicon: "plus",
            btnSize: 'xsmall',
            step: 1,
            currentZoom: 3,
            onZoom: () => {}
        };
    },
    renderButton() {
        return (
            <Button
                id={this.props.id}
                onClick={this.onClick}
                bsStyle="default"
                className={this.props.className}
                tooltip={this.props.tooltip}
                tooltipPlace="left"
                >
                {this.props.glyphicon ? <Glyphicon glyph={this.props.glyphicon}/> : null}
                {this.props.glyphicon && this.props.text ? "\u00A0" : null}
                {this.props.text}
            </Button>
        );
    },
    onClick() {
        this.props.onZoom(this.props.currentZoom + this.props.step);
    },
    render() {
        return this.renderButton();
    }
});

module.exports = ZoomButton;
