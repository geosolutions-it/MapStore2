/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const {Button, Glyphicon} = require('react-bootstrap');
const Spinner = require('react-spinkit');

const Message = require('../I18N/Message');

const PrintSubmit = React.createClass({
    propTypes: {
        loading: React.PropTypes.bool,
        onPrint: React.PropTypes.func,
        disabled: React.PropTypes.bool
    },
    getDefaultProps() {
        return {
            loading: false,
            onPrint: () => {},
            disabled: false
        };
    },
    render() {
        return (
            <Button disabled={this.props.disabled} bsSize="large" style={{marginTop: "10px"}} onClick={this.props.onPrint}>
                {this.props.loading ? <Spinner spinnerName="circle"/> : <Glyphicon glyph="print"/>} <Message msgId="print.submit"/>
            </Button>
        );
    }
});

module.exports = PrintSubmit;
