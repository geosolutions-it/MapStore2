/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root dir
 ectory of this source tree.
 */

const React = require('react');
const Dialog = React.createClass({
    propTypes: {
        id: React.PropTypes.string.isRequired,
        style: React.PropTypes.object,
        className: React.PropTypes.string,
        headerClassName: React.PropTypes.string,
        bodyClassName: React.PropTypes.string
    },
    getDefaultProps() {
        return {
            style: {},
            className: "modal-dialog modal-content",
            headerClassName: "modal-header",
            bodyClassName: "modal-body"
        };
    },
    renderHeader() {
        return React.Children.toArray(this.props.children).filter((child) => child.props.role === 'header');
    },
    renderBody() {
        return React.Children.toArray(this.props.children).filter((child) => child.props.role === 'body');
    },
    render() {
        return (<div id={this.props.id} style={this.props.style} className={this.props.className}>
            <div className={this.props.headerClassName}>
                {this.renderHeader()}
            </div>
            <div className={this.props.bodyClassName}>
                {this.renderBody()}
            </div>
        </div>);
    }
});

module.exports = Dialog;
