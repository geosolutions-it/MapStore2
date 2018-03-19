/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');
const {
    Popover,
    Glyphicon
} = require('react-bootstrap');

const OverlayTrigger = require('../../misc/OverlayTrigger');

class InfoPopover extends React.Component {

    static propTypes = {
        id: PropTypes.string,
        title: PropTypes.string,
        text: PropTypes.string,
        glyph: PropTypes.string,
        bsStyle: PropTypes.string,
        placement: PropTypes.string,
        left: PropTypes.number,
        top: PropTypes.number
    };

    static defaultProps = {
        id: '',
        title: '',
        text: '',
        placement: 'right',
        left: 200,
        top: 50,
        glyph: "question-sign",
        bsStyle: 'info'
    };

    renderPopover() {
        return (
            <Popover
                id={this.props.id}
                placement={this.props.placement}
                positionLeft={this.props.left}
                positionTop={this.props.top}
                title={this.props.title}>
                {this.props.text}
            </Popover>
        );
    }

    render() {
        return (
            <span className="mapstore-info-popover">
                <OverlayTrigger trigger={['hover', 'focus']} placement={this.props.placement} overlay={this.renderPopover()}>
                    <Glyphicon className={`text-${this.props.bsStyle}`} glyph="question-sign"/>
                </OverlayTrigger>
            </span>
        );
    }
}

module.exports = InfoPopover;
