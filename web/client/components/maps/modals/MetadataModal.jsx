const PropTypes = require('prop-types');
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
const PermissionEditor = require('../../security/PermissionEditor');

require('./css/modals.css');

const {Button, Grid, Row, Col} = require('react-bootstrap');
const Modal = require('../../misc/Modal');
const Message = require('../../I18N/Message');

const Spinner = require('react-spinkit');
const LocaleUtils = require('../../../utils/LocaleUtils');

/**
* A Modal window to show map metadata form
*/
class MetadataModal extends React.Component {
    static propTypes = {
        // props
        id: PropTypes.string,
        user: PropTypes.object,
        authHeader: PropTypes.string,
        show: PropTypes.bool,
        options: PropTypes.object,
        metadata: PropTypes.object,
        loadPermissions: PropTypes.func,
        loadAvailableGroups: PropTypes.func,
        onSave: PropTypes.func,
        onCreateThumbnail: PropTypes.func,
        onDeleteThumbnail: PropTypes.func,
        onGroupsChange: PropTypes.func,
        onAddPermission: PropTypes.func,
        onClose: PropTypes.func,
        useModal: PropTypes.bool,
        closeGlyph: PropTypes.string,
        buttonSize: PropTypes.string,
        includeCloseButton: PropTypes.bool,
        map: PropTypes.object,
        style: PropTypes.object,
        fluid: PropTypes.bool,
        // I18N
        errorImage: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        errorMessages: PropTypes.object,
        // CALLBACKS
        onSaveAll: PropTypes.func,
        onRemoveThumbnail: PropTypes.func,
        onErrorCurrentMap: PropTypes.func,
        onUpdateCurrentMap: PropTypes.func,
        onNewGroupChoose: PropTypes.func,
        onNewPermissionChoose: PropTypes.func,
        metadataChanged: PropTypes.func,
        displayPermissionEditor: PropTypes.bool,
        availablePermissions: PropTypes.arrayOf(PropTypes.string),
        availableGroups: PropTypes.arrayOf(PropTypes.object),
        updatePermissions: PropTypes.func,
        groups: PropTypes.arrayOf(PropTypes.object),
        newGroup: PropTypes.object,
        newPermission: PropTypes.string
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        id: "MetadataModal",
        loadPermissions: () => {},
        loadAvailableGroups: () => {},
        onSave: ()=> {},
        onCreateThumbnail: ()=> {},
        onDeleteThumbnail: ()=> {},
        onGroupsChange: ()=> {},
        onAddPermission: ()=> {},
        metadataChanged: ()=> {},
        onNewGroupChoose: ()=> {},
        onNewPermissionChoose: ()=> {},
        user: {
            name: "Guest"
        },
        metadata: {name: "", description: ""},
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
        onSaveAll: () => {},
        onRemoveThumbnail: ()=> {},
        onSaveMap: ()=> {},
        onClose: () => {},
        // I18N
        errorMessages: {"FORMAT": <Message msgId="map.errorFormat"/>, "SIZE": <Message msgId="map.errorSize"/>},
        errorImage: <Message msgId="map.error"/>,
        displayPermissionEditor: true,
        availablePermissions: ["canRead", "canWrite"],
        availableGroups: [],
        updatePermissions: () => {},
        groups: []
    };

    state = {
        name: this.props.map && this.props.map.name || '',
        description: this.props.map && this.props.map.description || ''
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.map && this.props.map && !nextProps.map.loading && this.state && this.state.saving) {
            this.setState({
                saving: false
            });
            this.props.onClose();
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.show && !prevProps.show) {
            if (this.props.displayPermissionEditor && (this.props.user.name === this.props.map.owner || this.props.user.role === "ADMIN" )) {
                this.loadPermissions();
                this.loadAvailableGroups();
            }
        }
    }

    onSave = () => {
        this.setState({
            saving: true
        });
        let metadata = null;

        if ( this.isMetadataChanged() ) {
            let name = this.props.metadata.name;
            let description = this.props.metadata.description;
            metadata = {
                name: name,
                description: description
            };
            this.props.onSave(this.props.map.id, name, description);
        }
        this.props.updatePermissions(this.props.map.id, this.props.map.permissions);
        this.refs.thumbnail.updateThumbnail(this.props.map, metadata);
    };

    renderPermissionEditor = () => {
        if (this.props.displayPermissionEditor && this.props.user.name === this.props.map.owner || this.props.user.role === "ADMIN" ) {
            // Hack to convert map permissions to a simpler format, TODO: remove this
            if (this.props.map && this.props.map.permissions && this.props.map.permissions.SecurityRuleList && this.props.map.permissions.SecurityRuleList.SecurityRule) {
                this.localGroups = this.props.map.permissions.SecurityRuleList.SecurityRule.map(function(rule) {
                    if (rule && rule.group && rule.canRead) {
                        return {name: rule.group.groupName, permission: rule.canWrite ? "canWrite" : "canRead" };
                    }
                }
                ).filter(rule => rule);  // filter out undefined values
            } else {
                this.localGroups = this.props.groups;
            }
            return (
                <PermissionEditor
                    map={this.props.map}
                    user={this.props.user}
                    availablePermissions ={this.props.availablePermissions}
                    availableGroups={this.props.availableGroups}
                    groups={this.props.groups}
                    newGroup={this.props.newGroup}
                    newPermission={this.props.newPermission}
                    onNewGroupChoose={this.props.onNewGroupChoose}
                    onNewPermissionChoose={this.props.onNewPermissionChoose}
                    onAddPermission={this.props.onAddPermission}
                    onGroupsChange={this.props.onGroupsChange}
                />
            );
        }
    };

    renderLoading = () => {
        return this.props.map && this.props.map.updating ? <Spinner spinnerName="circle" key="loadingSpinner" noFadeIn overrideSpinnerClassName="spinner"/> : null;
    };

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
        const body =
            (<Metadata role="body" ref="mapMetadataForm"
                onChange={this.props.metadataChanged}
                map={this.props.map}
                nameFieldText={<Message msgId="map.name" />}
                descriptionFieldText={<Message msgId="map.description" />}
                namePlaceholderText={LocaleUtils.getMessageById(this.context.messages, "map.namePlaceholder") || "Map Name"}
                descriptionPlaceholderText={LocaleUtils.getMessageById(this.context.messages, "map.descriptionPlaceholder") || "Map Description"}
            />);
        const mapErrorStatus = this.props.map && this.props.map.mapError && this.props.map.mapError.status ? this.props.map.mapError.status : null;
        let messageIdMapError = "";
        if (mapErrorStatus === 404 || mapErrorStatus === 403 || mapErrorStatus === 409) {
            messageIdMapError = mapErrorStatus;
        } else {
            messageIdMapError = "Default";
        }
        const thumbnailErrorStatus = this.props.map && this.props.map.thumbnailError && this.props.map.thumbnailError.status ? this.props.map.thumbnailError.status : null;
        let messageIdError = "";
        if (thumbnailErrorStatus === 404 || thumbnailErrorStatus === 403 || thumbnailErrorStatus === 409) {
            messageIdError = thumbnailErrorStatus;
        } else {
            messageIdError = "Default";
        }
        return (
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
                            {this.props.map && this.props.map.mapError ?
                                <div className="dropzone-errorBox alert-danger">
                                    <div id={"error" + messageIdMapError} key={"error" + messageIdMapError} className={"error" + messageIdMapError}>
                                        <Message msgId={"map.mapError.error" + messageIdMapError}/>
                                    </div>
                                </div>
                            : null }
                            {this.props.map && this.props.map.errors && this.props.map.errors.length > 0 ?
                            <div className="dropzone-errorBox alert-danger">
                                <p>{this.props.errorImage}</p>
                                { (this.props.map.errors.map((error) => <div id={"error" + error} key={"error" + error} className={"error" + error}> {this.props.errorMessages[error]} </div>))}
                            </div>
                            : null }
                            {this.props.map && this.props.map.thumbnailError ?
                                <div className="dropzone-errorBox alert-danger">
                                    <div id={"error" + messageIdError} key={"error" + messageIdError} className={"error" + messageIdError}>
                                        <Message msgId={"map.thumbnailError.error" + messageIdError}/>
                                    </div>
                                </div>
                            : null }
                        </Row>
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
                        {this.renderPermissionEditor()}
                    </Grid>
                </Modal.Body>
                <Modal.Footer>
                  {footer}
                </Modal.Footer>
            </Modal>);
    }

    loadAvailableGroups = () => {
        this.props.loadAvailableGroups(this.props.user);
    };

    loadPermissions = () => {
        this.props.loadPermissions(this.props.map.id);
    };

    updateThumbnail = () => {
        this.refs.thumbnail.updateThumbnail();
    };

    isMetadataChanged = () => {
        return this.props.map && (
            this.props.metadata.description !== this.props.map.description ||
            this.props.metadata.name !== this.props.map.name
        );
    };

    isThumbnailChanged = () => {
        return this.refs && this.refs.thumbnail && this.refs.thumbnail.files && this.refs.thumbnail.files.length > 0;
    };
}

module.exports = MetadataModal;
