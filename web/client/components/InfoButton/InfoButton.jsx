/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var BootstrapReact = require('react-bootstrap');
var Modal = BootstrapReact.Modal;
var Button = BootstrapReact.Button;
var Glyphicon = BootstrapReact.Glyphicon;

/**
 * A button to show a simple information window.
 * Component's properies:
 *  - id: {string}            custom identifier for this component
 *  - title: {string|element} title of the window shown in its header
 *  - body: {string|element}  content of the window
 *  - style: {object}         a css-like hash to define the style on the component
 *  - glyphicon: {string}    bootstrap glyphicon name
 *  - text: {string|element}  text content for the button
 *  - btnSize: {string}       bootstrap button size ('large', 'small', 'xsmall')
 *
 * Note: the button will not be never empty, it will show at least the text (default or custom)
 */
var About = React.createClass({
    propTypes: {
        id: React.PropTypes.string,
        title: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element]),
        body: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element]),
        style: React.PropTypes.object,
        glyphicon: React.PropTypes.string,
        text: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element]),
        hiddenText: React.PropTypes.bool,
        btnSize: React.PropTypes.oneOf(['large', 'medium', 'small', 'xsmall'])
    },
    getDefaultProps() {
        return {
            id: "mapstore-infobutton",
            title: "Info",
            body: "",
            style: undefined,
            glyphicon: undefined,
            text: "Info",
            hiddenText: false,
            btnSize: 'medium'
        };
    },
    getInitialState() {
        return {
            isVisible: false
        };
    },
    render() {
        return (
            <div
                id={this.props.id}
                style={this.props.style}>
                <Button
                    bsStyle="info"
                    bsSize={this.props.btnSize}
                    onClick={this.open}>
                    {this.props.glyphicon ? <Glyphicon glyph={this.props.glyphicon}/> : ""}
                    {!this.props.hiddenText && this.props.glyphicon ? "\u00A0" : ""}
                    {!(this.props.hiddenText && this.props.glyphicon) ? this.props.text : ""}
                </Button>

                <Modal
                    show={this.state.isVisible}
                    onHide={this.close}
                    bsStyle="info">

                    <Modal.Header closeButton>
                        <Modal.Title>{this.props.title}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{this.props.body}</Modal.Body>
                </Modal>
            </div>
        );
    },
    close() {
        this.setState({
            isVisible: false
        });
    },
    open() {
        this.setState({
            isVisible: true
        });
    }
});

module.exports = About;
