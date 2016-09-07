/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const Metadata = require('../forms/Metadata');
const Thumbnail = require('../forms/Thumbnail');
require('./css/modals.css');

const {Modal, Button, Glyphicon, Grid, Row, Col} = require('react-bootstrap');
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
        id: React.PropTypes.string,
        user: React.PropTypes.object,
        authHeader: React.PropTypes.string,
        show: React.PropTypes.bool,
        options: React.PropTypes.object,
        useModal: React.PropTypes.bool,
        closeGlyph: React.PropTypes.string,
        buttonSize: React.PropTypes.string,
        includeCloseButton: React.PropTypes.bool,
        map: React.PropTypes.object,
        style: React.PropTypes.object,
        fluid: React.PropTypes.bool,
        // CALLBACKS
        onSave: React.PropTypes.func,
        onSaveMap: React.PropTypes.func,
        onSaveAll: React.PropTypes.func,
        onRemoveThumbnail: React.PropTypes.func,
        onErrorCurrentMap: React.PropTypes.func,
        onUpdateCurrentMap: React.PropTypes.func,
        onCreateThumbnail: React.PropTypes.func,
        onDeleteThumbnail: React.PropTypes.func,
        onClose: React.PropTypes.func
    },
    contextTypes: {
        messages: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            id: "MetadataModal",
            user: {
                name: "Guest"
            },
            options: {},
            useModal: true,
            closeGlyph: "",
            style: {},
            buttonSize: "small",
            includeCloseButton: true,
            fluid: true,
            // CALLBACKS
            onErrorCurrentMap: ()=> {},
            onUpdateCurrentMap: ()=> {},
            onCreateThumbnail: ()=> {},
            onDeleteThumbnail: ()=> {},
            onSave: ()=> {},
            onSaveAll: () => {},
            onRemoveThumbnail: ()=> {},
            onSaveMap: ()=> {},
            onClose: () => {}
        };
    },
    setMapNameValue(newName) {
        if (this.refs.mapMetadataForm) {
            this.refs.mapMetadataForm.setMapNameValue(newName);
        }
    },
    componentWillReceiveProps(newProps) {
        if (newProps.map && this.props.map && !newProps.map.loading && this.state && this.state.saving) {
            this.setState({
              saving: false
            });
        }
        // if ((newProps.map && newProps.map.errors && newProps.map.errors.length === 0) && !newProps.map.thumbnailError) {
        /*if (this.props.map && newProps.map && (this.props.map.updating === true && newProps.map.updating === false )) {
            this.props.onClose();
        }*/
        /*if (this.props.map &&
            this.props.map.thumbnailUpdating === true && newProps.map.thumbnailUpdating === false &&
            this.props.map.metadataUpdating === true && newProps.map.metadataUpdating === false &&
            this.props.map.updating === true && newProps.map.updating === false &&
            (newProps.map && newProps.map.errors && newProps.map.errors.length === 0) && !newProps.map.thumbnailError) {
            this.props.onClose();
        }*/
        // }
    },
    onSave() {
        this.setState({
            saving: true
        });
        let metadata = null;

        if ( this.isMetadataChanged() ) {
            let name = this.refs.mapMetadataForm.refs.mapName.getValue();
            let description = this.refs.mapMetadataForm.refs.mapDescription.getValue();
            metadata = {
                name: name,
                description: description
            };
            // this.props.onSave(this.props.map.id, name, description);
        }
        this.refs.thumbnail.updateThumbnail(this.props.map, metadata);
    },
    renderLoading() {
        return this.props.map && this.props.map.updating ? <Spinner spinnerName="circle" key="loadingSpinner" noFadeIn/> : null;
    },
    render() {
        const footer = (<span role="footer"><div style={{"float": "left"}}>{this.renderLoading()}</div>
        <Button
            ref="metadataSaveButton"
            key="metadataSaveButton"
            bsStyle="primary"
            bsSize={this.props.buttonSize}
            onClick={() => {
                this.onSave();
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
                onHide={this.props.onClose}
                id={this.props.id}>
                <Modal.Header key="mapMetadata" closeButton>
                    <Modal.Title>
                        <Message msgId="manager.editMapMetadata" />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Grid fluid={this.props.fluid}>
                        <Row>
                            <Col xs={7}>
                                <Thumbnail
                                    map={this.props.map}
                                    onSaveAll={this.props.onSaveAll}
                                    onRemoveThumbnail={this.props.onRemoveThumbnail}
                                    onError={this.props.onErrorCurrentMap}
                                    onUpdate={this.props.onUpdateCurrentMap}
                                    onCreateThumbnail={this.props.onCreateThumbnail}
                                    onDeleteThumbnail={this.props.onDeleteThumbnail}
                                    ref="thumbnail"/>
                            </Col>
                            <Col xs={5}>
                                {body}
                            </Col>
                        </Row>
                    </Grid>
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
    },
    isMetadataChanged() {
        return this.props.map && (
            this.refs.mapMetadataForm.refs.mapDescription.getValue() !== this.props.map.description ||
            this.refs.mapMetadataForm.refs.mapName.getValue() !== this.props.map.name
        );
    },
    isThumbnailChanged() {
        return this.refs && this.refs.thumbnail && this.refs.thumbnail.files && this.refs.thumbnail.files.length > 0;
    }
});

module.exports = MetadataModal;
