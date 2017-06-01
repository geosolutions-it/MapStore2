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
        glyphs: React.PropTypes.object,
        onClick: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            side: 0,
            direction: true,
            vertical: false,
            glyphs: {
                horizontal: {
                    next: 'chevron-right',
                    back: 'chevron-left'
                },
                vertical: {
                    next: 'chevron-down',
                    back: 'chevron-up'
                }
            },
            onClick: () => {}
        };
    },
    render() {
        const glyph = this.props.glyphs[this.props.vertical ? 'vertical' : 'horizontal'][this.props.direction ? 'next' : 'back'];
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
