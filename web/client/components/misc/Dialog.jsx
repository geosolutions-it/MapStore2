/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root dir
 ectory of this source tree.
 */

const React = require('react');

const Draggable = require('react-draggable');
const Spinner = require('react-spinkit');
require('./style/dialog.css');

const Dialog = React.createClass({
    propTypes: {
        id: React.PropTypes.string.isRequired,
        style: React.PropTypes.object,
        className: React.PropTypes.string,
        maskLoading: React.PropTypes.bool,
        headerClassName: React.PropTypes.string,
        bodyClassName: React.PropTypes.string,
        footerClassName: React.PropTypes.string,
        modal: React.PropTypes.bool
    },
    getDefaultProps() {
        return {
            style: {},
            className: "modal-dialog modal-content",
            maskLoading: false,
            headerClassName: "modal-header",
            bodyClassName: "modal-body",
            footerClassName: "modal-footer",
            modal: false
        };
    },
    renderLoading() {
        if (this.props.maskLoading) {
            return (<div style={{
                width: "100%",
                height: "100%",
                position: "absolute",
                overflow: "visible",
                margin: "auto",
                verticalAlign: "center",
                left: "0",
                background: "rgba(255, 255, 255, 0.5)",
                zIndex: 2
            }}><div style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -40%)"
            }}>Loading...<Spinner spinnerName="circle" noFadeIn/></div></div>);
        }
    },
    renderRole(role) {
        return React.Children.toArray(this.props.children).filter((child) => child.props.role === role);
    },
    render() {
        const dialog = (<Draggable start={{x: 0, y: 0}} handle=".draggable-header, .draggable-header *">
            <div id={this.props.id} style={{zIndex: 3, ...this.props.style}} className={this.props.className + " modal-dialog-container"}>
                <div className={this.props.headerClassName + " draggable-header"}>
                    {this.renderRole('header')}
                </div>
                <div className={this.props.bodyClassName}>
                    {this.renderLoading()}
                    {this.renderRole('body')}
                </div>
                {this.hasRole('footer') ? <div className={this.props.footerClassName}>
                    {this.renderRole('footer')}
                </div> : <span/>}
            </div>
        </Draggable>);
        return this.props.modal ?
            (<div style={this.props.style} className="modal">
                {dialog}
            </div>) :
            dialog;
    },
    hasRole(role) {
        return React.Children.toArray(this.props.children).filter((child) => child.props.role === role).length > 0;
    }
});

module.exports = Dialog;
