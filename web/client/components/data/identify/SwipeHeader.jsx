const PropTypes = require('prop-types');
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const {Glyphicon, Button} = require('react-bootstrap');

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
        const isDisabled = this.props.index === 0 ? true : false;
        return this.props.useButtons ?
            <Button ref="left" disabled={isDisabled} className={this.props.btnClassName || "square-button-md no-border"} onClick={() => {this.props.onPrevious(); }}><Glyphicon glyph="back"/></Button> :
            <a ref="left" disabled={isDisabled} className={this.props.btnClassName || "square-button-md"} onClick={() => {this.props.onPrevious(); }}><Glyphicon glyph="back" /></a>;
    };

    renderRightButton = () => {
        const isDisabled = this.props.index === this.props.size - 1 ? true : false;
        return this.props.useButtons ?
            <Button ref="right" disabled={isDisabled} className={this.props.btnClassName || "square-button-md no-border"} onClick={() => {this.props.onNext(); }}><Glyphicon glyph="next"/></Button> :
            <a ref="right" disabled={isDisabled} className={this.props.btnClassName || "square-button-md"} onClick={() => {this.props.onNext(); }}><Glyphicon glyph="next" /></a>;
    };

    render() {
        return (
            <div className="ms-identify-swipe-header">
                {this.props.size > 1 &&
                <div className="ms-identify-swipe-header-arrow">
                    {this.renderLeftButton()}
                </div>}
                <div className="ms-identify-swipe-header-title">{this.props.title}</div>
                {this.props.size > 1 &&
                <div className="ms-identify-swipe-header-arrow">
                    {this.renderRightButton()}
                </div>}
            </div>
        );
    }
}

module.exports = SwipeHeader;
