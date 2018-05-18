/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
const PropTypes = require('prop-types');
const React = require('react');
const Metadata = require('../forms/Metadata');
const Thumbnail = require('../forms/Thumbnail');
const PermissionEditor = require('../../security/PermissionEditor');
const ReactQuill = require('react-quill');
const Portal = require('../../misc/Portal');
const ResizableModal = require('../../misc/ResizableModal');
require('react-quill/dist/quill.snow.css');
require('./css/modals.css');
const Spinner = require('react-spinkit');
const {Grid, Row, Col} = require('react-bootstrap');
const {isNil} = require('lodash');
const Message = require('../../I18N/Message');
const Toolbar = require('../../misc/toolbar/Toolbar');
const {NO_DETAILS_AVAILABLE} = require('../../../actions/maps');
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
        modules: PropTypes.object,
        metadata: PropTypes.object,
        loadPermissions: PropTypes.func,
        loadAvailableGroups: PropTypes.func,
        onSave: PropTypes.func,
        detailsSheetActions: PropTypes.object,
        onCreateThumbnail: PropTypes.func,
        onDeleteThumbnail: PropTypes.func,
        onGroupsChange: PropTypes.func,
        onAddPermission: PropTypes.func,
        onResetCurrentMap: PropTypes.func,
        useModal: PropTypes.bool,
        closeGlyph: PropTypes.string,
        buttonSize: PropTypes.string,
        includeCloseButton: PropTypes.bool,
        showDetailsRow: PropTypes.bool,
        map: PropTypes.object,
        style: PropTypes.object,
        fluid: PropTypes.bool,
        modalSize: PropTypes.string,
        // I18N
        errorImage: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        errorMessages: PropTypes.object,
        // CALLBACKS
        onSaveAll: PropTypes.func,
        onRemoveThumbnail: PropTypes.func,
        onErrorCurrentMap: PropTypes.func,
        onUpdateCurrentMap: PropTypes.func,
        onDisplayMetadataEdit: PropTypes.func,
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
        modalSize: "",
        loadPermissions: () => {},
        loadAvailableGroups: () => {},
        onSave: ()=> {},
        detailsSheetActions: {
            onBackDetails: () => {},
            onUndoDetails: () => {},
            onToggleGroupProperties: () => {},
            onToggleDetailsSheet: () => {},
            onUpdateDetails: () => {},
            onDeleteDetails: () => {},
            onSaveDetails: () => {}
        },
        onCreateThumbnail: ()=> {},
        onDeleteThumbnail: ()=> {},
        onGroupsChange: ()=> {},
        onAddPermission: ()=> {},
        onDisplayMetadataEdit: ()=> {},
        metadataChanged: ()=> {},
        onNewGroupChoose: ()=> {},
        onNewPermissionChoose: ()=> {},
        user: {
            name: "Guest"
        },
        metadata: {name: "", description: ""},
        modules: {
            toolbar: [
                [{ 'size': ['small', false, 'large', 'huge'] }, 'bold', 'italic', 'underline', 'blockquote'],
                [{ 'list': 'bullet' }, { 'align': [] }],
                [{ 'color': [] }, { 'background': [] }, 'clean'], ['image', 'link']
            ]
        },
        options: {},
        useModal: true,
        closeGlyph: "",
        style: {},
        buttonSize: "small",
        includeCloseButton: true,
        showDetailsRow: true,
        fluid: true,
        // CALLBACKS
        onErrorCurrentMap: ()=> {},
        onUpdateCurrentMap: ()=> {},
        onSaveAll: () => {},
        onRemoveThumbnail: ()=> {},
        onSaveMap: ()=> {},
        onResetCurrentMap: () => {},
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
            // this.props.onResetCurrentMap();
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

    onCloseMapPropertiesModal = () => {
        // TODO write only a single function used also in onClose property
        if (this.props.map.unsavedChanges && this.props.detailsSheetActions.onToggleUnsavedChangesModal) {
            this.props.detailsSheetActions.onToggleUnsavedChangesModal();
        } else {
            this.props.onDisplayMetadataEdit(false);
            this.props.onResetCurrentMap();
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
        this.refs.thumbnail.processUpdateThumbnail(this.props.map, metadata, this.props.map.thumbnailData);
        this.props.updatePermissions(this.props.map.id, this.props.map.permissions);
    };

    renderDetailsSheet = (readOnly) => {
        return (
            <Portal>
                {readOnly ? (
                    <ResizableModal size="lg"
                        showFullscreen
                        onClose={() => {
                            this.props.onResetCurrentMap();
                        }}
                        title={<Message msgId="map.details.title" msgParams={{name: this.props.map.name }}/>}
                        show
                        >
                        <div className="ms-detail-body">
                            {!this.props.map.detailsText ? <Spinner spinnerName="circle" noFadeIn overrideSpinnerClassName="spinner"/> : <div className="ql-editor" dangerouslySetInnerHTML={{__html: this.props.map.detailsText || ''}} />}
                        </div>
                    </ResizableModal>
                ) : (<ResizableModal
                    show={!!this.props.map.showDetailEditor}
                    title={<Message msgId="map.details.title" msgParams={{name: this.props.map.name }}/>}
                    bodyClassName="ms-modal-quill-container"
                    size="lg"
                    clickOutEnabled={false}
                    showFullscreen
                    fullscreenType="full"
                    onClose={() => { this.props.detailsSheetActions.onBackDetails(this.props.map.detailsBackup); }}
                    buttons={[{
                        text: <Message msgId="map.details.back"/>,
                        onClick: () => {
                            this.props.detailsSheetActions.onBackDetails(this.props.map.detailsBackup);
                        }
                    }, {
                        text: <Message msgId="map.details.save"/>,
                        onClick: () => {
                            this.props.detailsSheetActions.onSaveDetails(this.props.map.detailsText);
                        }
                    }]}>
                    <div id="ms-details-editor">
                        <ReactQuill
                            bounds={"#ms-details-editor"}
                            value={this.props.map.detailsText}
                            onChange={(details) => {
                                if (details && details !== '<p><br></p>') {
                                    this.props.detailsSheetActions.onUpdateDetails(details, false);
                                }
                            }}
                            modules={this.props.modules}/>
                    </div>
                </ResizableModal>)}
        </Portal>);
    }
    /**
     * @return the modal for unsaved changes
    */
    renderUnsavedChanges = () => {
        return (<Portal>
                <ResizableModal
                    size="xs"
                    clickOutEnabled={false}
                    showClose={false}
                    title={<Message msgId="warning"/>}
                    bodyClassName="modal-details-sheet-confirm"
                    show={!!this.props.map.showUnsavedChanges}
                    buttons={[{
                        text: <Message msgId="no"/>,
                        onClick: () => {
                            if (this.props.detailsSheetActions.onToggleUnsavedChangesModal) {
                                this.props.detailsSheetActions.onToggleUnsavedChangesModal();
                            }
                            this.props.onDisplayMetadataEdit(true);
                        }
                    }, {
                        text: <Message msgId="yes"/>,
                        onClick: () => {
                            this.props.onResetCurrentMap();
                        }
                    }]}>
                        <div className="ms-alert">
                            <span className="ms-alert-center">
                                <Message msgId="map.details.fieldsChanged"/>
                                <br/>
                                <Message msgId="map.details.sureToClose"/>
                            </span>
                        </div>
                </ResizableModal>
            </Portal>);
    }
    renderDetailsRow = () => {
        return (
            <div className={"ms-section" + (this.props.map.hideGroupProperties ? ' ms-transition' : '')}>
                <div className="mapstore-block-width">
                    <Row>
                        <Col xs={6}>
                            <div className="m-label">
                                {this.props.map.detailsText === "" ? <Message msgId="map.details.add"/> : <Message msgId="map.details.rowTitle"/>}
                            </div>
                        </Col>
                        <Col xs={6}>
                            <div className="ms-details-sheet">
                                <div className="pull-right">
                                    {this.props.map.saving ? <Spinner spinnerName="circle" noFadeIn overrideSpinnerClassName="spinner"/> : null}
                                    {isNil(this.props.map.detailsText) ? <Spinner spinnerName="circle" noFadeIn overrideSpinnerClassName="spinner"/> : <Toolbar
                                        btnDefaultProps={{ className: 'square-button-md no-border'}}
                                        buttons={[
                                            {
                                                glyph: !this.props.map.hideGroupProperties ? 'eye-close' : 'eye-open',
                                                visible: !!this.props.map.detailsText,
                                                onClick: () => { this.props.detailsSheetActions.onToggleGroupProperties(); },
                                                disabled: this.props.map.saving,
                                                tooltipId: !this.props.map.hideGroupProperties ? "map.details.showPreview" : "map.details.hidePreview"
                                            }, {
                                                glyph: 'undo',
                                                tooltipId: "map.details.undo",
                                                visible: !!this.props.map.detailsBackup,
                                                onClick: () => { this.props.detailsSheetActions.onUndoDetails(this.props.map.detailsBackup); },
                                                disabled: this.props.map.saving
                                            }, {
                                                glyph: 'pencil-add',
                                                tooltipId: "map.details.add",
                                                visible: !this.props.map.detailsText,
                                                onClick: () => {
                                                    this.props.detailsSheetActions.onToggleDetailsSheet(false);
                                                },
                                                disabled: this.props.map.saving
                                            }, {
                                                glyph: 'pencil',
                                                tooltipId: "map.details.edit",
                                                visible: !!this.props.map.detailsText && !this.props.map.editDetailsDisabled,
                                                onClick: () => {
                                                    this.props.detailsSheetActions.onToggleDetailsSheet(false);
                                                    if (this.props.map.detailsText) {
                                                        this.props.detailsSheetActions.onUpdateDetails(this.props.map.detailsText, true);
                                                    }
                                                },
                                                disabled: this.props.map.saving
                                            }, {
                                                glyph: 'trash',
                                                tooltipId: "map.details.delete",
                                                visible: !!this.props.map.detailsText,
                                                onClick: () => { this.props.detailsSheetActions.onDeleteDetails(); },
                                                disabled: this.props.map.saving
                                            }]}/>}
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>
                {this.props.map.detailsText && <div className="ms-details-preview-container">
                    {this.props.map.detailsText !== NO_DETAILS_AVAILABLE ? <div className="ms-details-preview" dangerouslySetInnerHTML={{ __html: this.props.map.detailsText}}/>
                : <div className="ms-details-preview"> <Message msgId="maps.feedback.noDetailsAvailable"/></div>}
                    </div>}
            </div>
        );
    }
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
                    disabled={!!this.props.map.saving}
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
    renderMapProperties = () => {
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
        return (<Portal>
            <ResizableModal
            id={this.props.id}
            size={this.props.modalSize}
            title={<Message msgId="manager.editMapMetadata"/>}
            show={this.props.show && !this.props.map.showDetailEditor && !this.props.map.showUnsavedChanges}
            clickOutEnabled
            bodyClassName="ms-flex modal-properties-container"
            buttons={[{
                text: <Message msgId="close"/>,
                onClick: this.onCloseMapPropertiesModal,
                disabled: this.props.map.saving
            }, {
                text: <Message msgId="save"/>,
                onClick: () => { this.onSave(); },
                disabled: this.props.map.saving
            }]}
            showClose={!this.props.map.saving}
            onClose={this.onCloseMapPropertiesModal}>
            <Grid fluid>
                <div className="ms-map-properties">
                    {/* TODO fix this error messages*/}
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
                        <Col xs={12}>
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
                        <Col xs={12}>
                            <Metadata role="body" ref="mapMetadataForm"
                                onChange={this.props.metadataChanged}
                                map={this.props.map}
                                metadata={this.props.metadata}
                                nameFieldText={<Message msgId="map.name" />}
                                descriptionFieldText={<Message msgId="map.description" />}
                                namePlaceholderText={LocaleUtils.getMessageById(this.context.messages, "map.namePlaceholder") || "Map Name"}
                                descriptionPlaceholderText={LocaleUtils.getMessageById(this.context.messages, "map.descriptionPlaceholder") || "Map Description"}
                            />
                        </Col>
                    </Row>
                    {this.props.showDetailsRow ? this.renderDetailsRow() : null}
                    {!this.props.map.hideGroupProperties && this.props.displayPermissionEditor && this.renderPermissionEditor()}

            </div></Grid>
        </ResizableModal>
    </Portal>);
    }
    // TODO restore this
    renderLoading = () => {
        return this.props.map && this.props.map.updating ? <Spinner spinnerName="circle" key="loadingSpinner" noFadeIn overrideSpinnerClassName="spinner"/> : null;
    };

    render() {
        return (
            <span>
                {this.props.map.showDetailEditor && this.renderDetailsSheet(this.props.map.detailsSheetReadOnly)}
                {this.props.map.showUnsavedChanges && this.renderUnsavedChanges()}
                {this.props.show && !this.props.map.showDetailEditor && this.renderMapProperties()}
            </span>);
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
