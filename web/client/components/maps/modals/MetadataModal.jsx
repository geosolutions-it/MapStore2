/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const Metadata = require('../forms/Metadata');

const {Modal, Button, Glyphicon} = require('react-bootstrap');
const Message = require('../../I18N/Message');

const Dialog = require('../../../components/misc/Dialog');
const assign = require('object-assign');

const Spinner = require('react-spinkit');
const LocaleUtils = require('../../../utils/LocaleUtils');

  /**
   * A Modal window to show map metadata form
   */
const MetadataModal = React.createClass({
    propTypes: {
        // props
        user: React.PropTypes.object,
        authHeader: React.PropTypes.string,
        show: React.PropTypes.bool,
        options: React.PropTypes.object,
        onMetadataEdit: React.PropTypes.func,
        onMetadataEdited: React.PropTypes.func,
        onClose: React.PropTypes.func,
        useModal: React.PropTypes.bool,
        closeGlyph: React.PropTypes.string,
        style: React.PropTypes.object,
        buttonSize: React.PropTypes.string,
        includeCloseButton: React.PropTypes.bool,
        map: React.PropTypes.object
    },
    contextTypes: {
        messages: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            onMetadataEdit: ()=> {},
            user: {
                name: "Guest"
            },
            onClose: () => {},
            options: {},
            useModal: true,
            closeGlyph: "",
            style: {},
            buttonSize: "large",
            includeCloseButton: true
        };
    },
    componentWillReceiveProps() {
        this.setState({
            loading: false
        });
    },
    setMapNameValue(newName) {
        if (this.refs.mapMetadataForm) {
            this.refs.mapMetadataForm.setMapNameValue(newName);
        }
    },
    getInitialState() {
        return {
            loading: false
        };
    },
    onMetadataEdit() {
        if (
            this.props.map &&
            (
            this.refs.mapMetadataForm.refs.mapDescription.getValue() !== this.props.map.description ||
            this.refs.mapMetadataForm.refs.mapName.getValue() !== this.props.map.name
            )) {
            this.props.onMetadataEdit(this.props.map.id, this.refs.mapMetadataForm.refs.mapName.getValue(), this.refs.mapMetadataForm.refs.mapDescription.getValue());
        }
        this.props.onClose();
    },
    renderLoading() {
        return this.state.loading ? <Spinner spinnerName="circle" key="loadingSpinner" noFadeIn/> : null;
    },
    render() {
        const footer = (<span role="footer"><div style={{"float": "left"}}>{this.renderLoading()}</div>
        <Button
            ref="metadataSaveButton"
            key="metadataSaveButton"
            bsStyle="primary"
            bsSize={this.props.buttonSize}
            onClick={() => {
                this.setState({loading: true});
                this.onMetadataEdit();
            }}><Message msgId="save" /></Button>
        {this.props.includeCloseButton ? <Button
            key="closeButton"
            ref="closeButton"
            bsSize={this.props.buttonSize}
            onClick={this.props.onClose}><Message msgId="close" /></Button> : <span/>}
        </span>);
        const body = (<Metadata role="body" ref="mapMetadataForm"
            onChange={() => {
                this.setState({metadataValid: this.refs.mapMetadataForm.isValid()});
            }}
            map={this.props.map}
            nameFieldText={<Message msgId="map.name" />}
            descriptionFieldText={<Message msgId="map.description" />}
            namePlaceholderText={LocaleUtils.getMessageById(this.context.messages, "map.namePlaceholder") || "Map Name"}
            descriptionPlaceholderText={LocaleUtils.getMessageById(this.context.messages, "map.descriptionPlaceholder") || "Map Description"}
            />);
        return this.props.useModal ? (
            <Modal {...this.props.options}
                show={this.props.show}
                onHide={this.props.onClose}>
                <Modal.Header key="mapMetadata" closeButton>
                  <Modal.Title><Message msgId="manager.editMapMetadata" /></Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {body}
                </Modal.Body>
                <Modal.Footer>
                  {footer}
                </Modal.Footer>
            </Modal>) : (
            <Dialog id="mapstore-mapmetadata-panel" style={assign({}, this.props.style, {display: this.props.show ? "block" : "none"})}>
                <span role="header"><span className="mapmetadata-panel-title"><Message msgId="manager.editMapMetadata" /></span><button onClick={this.props.onClose} className="login-panel-close close">{this.props.closeGlyph ? <Glyphicon glyph={this.props.closeGlyph}/> : <span>×</span>}</button></span>
                {body}
                {footer}
            </Dialog>
        );
    }
});

module.exports = MetadataModal;
