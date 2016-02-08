/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var {Glyphicon} = require('react-bootstrap');
const defaultIcon = require('../spinners/InlineSpinner/img/spinner.gif');

var SnapshotBtn = React.createClass({
    propTypes: {
        id: React.PropTypes.string,
        btnConfig: React.PropTypes.object,
        text: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element]),
        status: React.PropTypes.string,
        style: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            id: "snapshot_icon",
            status: "DISABLED",
            style: {width: "100%"}
        };
    },
    shouldComponentUpdate(nextProps) {
        return this.props.status !== nextProps.status;
    },
    renderButton() {
        return (
            <Glyphicon glyph="camera"/>
        );
    },
    renderLoadingButton() {
        return (
            <img src={defaultIcon} style={{
                display: 'inline-block',
                margin: '0px',
                padding: 0,
                background: 'transparent',
                border: 0
            }} alt="..." />
        );
    },
    render() {
        return (this.props.status === "SHOTING") ? this.renderLoadingButton() : this.renderButton();
    },
    getBtnStyle() {
        let style = "default";
        if (this.props.status === "ENABLED") {
            style = "info";
        }
        return style;
    }
});

module.exports = SnapshotBtn;
