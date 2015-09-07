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
var I18N = require('../../../components/I18N/I18N');

var ToggleButton = require('../../../components/ToggleButton/ToggleButton');
var HtmlRenderer = require('../../../components/HtmlRenderer/HtmlRenderer');

var GetFeatureInfo = React.createClass({
    propTypes: {
        htmlResponses: React.PropTypes.array,
        btnConfig: React.PropTypes.object,
        btnText: React.PropTypes.string,
        btnIcon: React.PropTypes.string,
        enabled: React.PropTypes.bool,
        btnClick: React.PropTypes.func,
        onCloseResult: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            enabled: false,
            htmlResponses: [],
            btnClick() {}
        };
    },
    getInitialState() {
        return { showModal: true };
    },
    getModalContent(responses) {
        var output = [];
        var content = "";
        const regexp = /^.*<body>(.*)<\/body>.*$/g;
        for (let i = 0; i < responses.length; i++) {
            if (typeof responses[i] === "string") {
                content = responses[i].replace(regexp, '$1');
                output.push(<HtmlRenderer html={content}/>);
            } else if (responses[i].length !== undefined) {
                const exArray = responses[i];
                for (let j = 0; j < exArray.length; j++) {
                    output.push(<HtmlRenderer html={
                        '<h3>Exception: ' + j + '</h3>' +
                        '<p>' + exArray[j].text + '</p>'
                    }/>);
                }
            } else {
                output.push(<HtmlRenderer html={'<p>' + responses[i].data + '</p>'}/>);
            }
        }
        return output;
    },
    render() {
        return (
            <div id="mapstore-getfeatureinfo">
                <ToggleButton
                    pressed={this.props.enabled}
                    btnConfig={this.props.btnConfig}
                    text={this.props.btnText}
                    glyphicon={this.props.btnIcon}
                    onClick={this.props.btnClick}
                />
                <Modal
                    show={this.props.htmlResponses.length !== 0}
                    onHide={this.props.onCloseResult}
                    bsStyle="info">

                    <Modal.Header closeButton>
                        <Modal.Title><I18N.Message msgId="getFeatureInfoTitle" /></Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div style={{overflow: "auto"}}>
                            {this.getModalContent(this.props.htmlResponses)}
                        </div>
                    </Modal.Body>
                </Modal>
            </div>
        );
    }
});

module.exports = GetFeatureInfo;
