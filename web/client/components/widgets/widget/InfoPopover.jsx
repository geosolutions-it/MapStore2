/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const PropTypes = require('prop-types');
const {
    Popover,
    Glyphicon
} = require('react-bootstrap');

const Overlay = require('../../misc/Overlay');
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
        top: PropTypes.number,
        trigger: PropTypes.array,
        target: PropTypes.any
    };

    static defaultProps = {
        id: '',
        title: '',
        text: '',
        placement: 'right',
        left: 200,
        top: 50,
        glyph: "question-sign",
        bsStyle: 'info',
        trigger: ['hover', 'focus']
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
    renderContent() {
        return (<Glyphicon
            ref={button => {
                this.target = button;
            }}
            className={`text-${this.props.bsStyle}`}
            glyph={this.props.glyph} />);
    }
    render() {
        return (
            <span className="mapstore-info-popover">
                {this.props.trigger
                        ? (<OverlayTrigger trigger={this.props.trigger} placement={this.props.placement} overlay={this.renderPopover()}>
                                {this.renderContent()}
                            </OverlayTrigger>)
                    : [
                        this.renderContent(),
                        <Overlay show target={() => ReactDOM.findDOMNode(this.target)}>
                        {this.renderPopover()}
                        </Overlay>
                    ]}
            </span>
        );
    }
}

module.exports = InfoPopover;
