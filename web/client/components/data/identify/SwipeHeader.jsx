const PropTypes = require('prop-types');
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const {Glyphicon, Button, ButtonGroup} = require('react-bootstrap');

class SwipeHeader extends React.Component {
    static propTypes = {
        title: PropTypes.string,
        index: PropTypes.number,
        size: PropTypes.number,
        container: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
        useButtons: PropTypes.bool,
        onPrevious: PropTypes.func,
        onNext: PropTypes.func,
        btnClassName: PropTypes.string
    };

    static defaultProps = {
        useButtons: true
    };

    componentWillUnmount() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    renderLeftButton = () => {
        return this.props.useButtons ?
            <Button ref="left" disabled={this.props.index === 0 ? true : false} className={this.props.btnClassName || "square-button-md"} bsStyle="primary" onClick={() => {this.props.onPrevious(); }}><Glyphicon glyph="arrow-left"/></Button> :
            <a ref="left" disabled={this.props.index === 0 ? true : false} className={this.props.btnClassName || "square-button-md"} onClick={() => {this.props.onPrevious(); }}><Glyphicon glyph="chevron-left" /></a>;
    };

    renderRightButton = () => {
        return this.props.useButtons ?
            <Button ref="right" disabled={this.props.index === this.props.size - 1 ? true : false } className={this.props.btnClassName || "square-button-md"} bsStyle="primary" onClick={() => {this.props.onNext(); }}><Glyphicon glyph="arrow-right"/></Button> :
            <a ref="right" disabled={this.props.index === this.props.size - 1 ? true : false} className={this.props.btnClassName || "square-button-md"} onClick={() => {this.props.onNext(); }}><Glyphicon glyph="chevron-right" /></a>;
    };

    render() {
        return <span><span>{this.props.title}</span><ButtonGroup className="pull-right">{this.renderLeftButton()}{this.renderRightButton()}</ButtonGroup></span>;
    }
}

module.exports = SwipeHeader;
