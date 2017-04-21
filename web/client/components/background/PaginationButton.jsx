/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {Glyphicon} = require('react-bootstrap');

const PaginationButton = React.createClass({
    propTypes: {
        side: React.PropTypes.number,
        direction: React.PropTypes.bool,
        vertical: React.PropTypes.bool,
        onClick: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            side: 0,
            direction: true,
            vertical: false,
            onClick: () => {}
        };
    },
    render() {
        let glyph = this.props.direction ? 'chevron-right' : 'chevron-left';
        glyph = this.props.vertical && this.props.direction ? 'chevron-down' : glyph;
        glyph = this.props.vertical && !this.props.direction ? 'chevron-up' : glyph;
        const paginationClass = this.props.vertical ? 'background-plugin-pagination-btn-vertical text-center' : 'background-plugin-pagination-btn-horizontal';
        const style = this.props.vertical ? {width: this.props.side} : {height: this.props.side};
        return (
            <div className={paginationClass + ' text-primary'} style={style} onClick={this.props.onClick}>
                <Glyphicon glyph={glyph} />
            </div>
        );
    }
});

module.exports = PaginationButton;
