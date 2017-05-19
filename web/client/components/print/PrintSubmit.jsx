const PropTypes = require('prop-types');
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

class PrintSubmit extends React.Component {
    static propTypes = {
        loading: PropTypes.bool,
        onPrint: PropTypes.func,
        disabled: PropTypes.bool,
        buttonConfig: PropTypes.object,
        glyph: PropTypes.string
    };

    static defaultProps = {
        loading: false,
        onPrint: () => {},
        disabled: false,
        buttonConfig: {
            bsSize: "large"
        },
        glyph: "print"
    };

    render() {
        const glyph = this.props.glyph ? <Glyphicon glyph={this.props.glyph}/> : <span/>;
        return (
            <Button className="print-submit" disabled={this.props.disabled} {...this.props.buttonConfig} style={{marginTop: "10px", marginRight: "5px"}} onClick={this.props.onPrint}>
                {this.props.loading ? <Spinner spinnerName="circle" overrideSpinnerClassName="spinner" noFadeIn /> : glyph} <Message msgId="print.submit"/>
            </Button>
        );
    }
}

module.exports = PrintSubmit;
