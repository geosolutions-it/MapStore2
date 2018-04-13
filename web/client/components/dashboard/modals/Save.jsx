/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
const PropTypes = require('prop-types');
const React = require('react');

const Portal = require('../../misc/Portal');
const ResizableModal = require('../../misc/ResizableModal');
require('./css/modals.css');
const {Grid} = require('react-bootstrap');
const Message = require('../../I18N/Message');
const ErrorBox = require('./fragments/ErrorBox');
const MainForm = require('./fragments/MainForm');

/**
 * A Modal window to show map metadata form
*/
class SaveModal extends React.Component {
    static propTypes = {
        // props
        user: PropTypes.object,
        show: PropTypes.bool,
        metadata: PropTypes.object,
        errors: PropTypes.array,
        loadPermissions: PropTypes.func,
        loadAvailableGroups: PropTypes.func,
        detailsSheetActions: PropTypes.func,
        onSave: PropTypes.func,
        onGroupsChange: PropTypes.func,
        onAddPermission: PropTypes.func,
        closeGlyph: PropTypes.string,
        buttonSize: PropTypes.string,
        showDetailsRow: PropTypes.bool,
        resource: PropTypes.object,
        linkedResources: PropTypes.object,
        style: PropTypes.object,
        fluid: PropTypes.bool,
        modalSize: PropTypes.string,
        // CALLBACKS
        onSaveAll: PropTypes.func,
        onError: PropTypes.func,
        onUpdate: PropTypes.func,
        onUpdateLinkedResource: PropTypes.func,
        onClose: PropTypes.func,
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
        resource: {},
        linkedResources: {},
        loadPermissions: () => {},
        loadAvailableGroups: () => {},
        detailsSheetActions: {
            onBackDetails: () => {},
            onUndoDetails: () => {},
            onToggleGroupProperties: () => {},
            onToggleDetailsSheet: () => {},
            onUpdateDetails: () => {},
            onDeleteDetails: () => {},
            onSaveDetails: () => {}
        },
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
        options: {},
        closeGlyph: "",
        style: {},
        buttonSize: "small",
        showDetailsRow: false,
        fluid: true,
        // CALLBACKS
        onError: ()=> {},
        onUpdate: ()=> {},
        onUpdateLinkedResource: () => {},
        onSaveAll: () => {},
        onSave: ()=> {},
        onReset: () => {},
        displayPermissionEditor: false,
        availablePermissions: ["canRead", "canWrite"],
        availableGroups: [],
        updatePermissions: () => {},
        groups: []
    };

    state = {
        name: this.props.resource && this.props.resource.name || '',
        description: this.props.resource && this.props.resource.description || ''
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.map && this.props.resource && !nextProps.map.loading && this.state && this.state.saving) {
            this.setState({
                saving: false
            });
            // this.props.onResetCurrentMap();
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.show && !prevProps.show) {
            if (this.props.displayPermissionEditor && (this.props.user.name === this.props.resource.owner || this.props.user.role === "ADMIN" )) {
                this.loadPermissions();
                this.loadAvailableGroups();
            }
        }
    }

    onCloseMapPropertiesModal = () => {
        // TODO write only a single function used also in onClose property
        if (this.props.resource.unsavedChanges && this.props.detailsSheetActions.onToggleUnsavedChangesModal) {
            this.props.detailsSheetActions.onToggleUnsavedChangesModal();
        } else {
            this.props.onClose();
        }
    }

    onSave = () => {
        this.setState({
            saving: true
        });

        if ( this.isMetadataChanged() ) {
            this.props.onSave(this.props.resource);
        }
        this.props.updatePermissions(this.props.resource.id, this.props.resource.permissions);
    };

    /**
     * @return the modal for unsaved changes
    */
    render() {
        return (<Portal>
            <ResizableModal
                title={<Message msgId="manager.editMapMetadata"/>}
                show={this.props.show}
                clickOutEnabled
                bodyClassName="ms-flex modal-properties-container"
                buttons={[{
                    text: <Message msgId="close"/>,
                    onClick: this.onCloseMapPropertiesModal,
                    disabled: this.props.resource.saving
                }, {
                    text: <Message msgId="save"/>,
                    onClick: () => { this.onSave(); },
                    disabled: this.props.resource.saving
                }]}
                showClose={!this.props.resource.saving}
                onClose={this.onCloseMapPropertiesModal}>
            <Grid fluid>
                <div className="ms-map-properties">
                    <ErrorBox errors={this.props.errors} />
                    <MainForm
                        metadata={this.props.metadata}
                        resource={this.props.resource}
                        onUpdateLinkedResource={this.props.onUpdateLinkedResource}
                        linkedResources={this.props.linkedResources}
                        onMetadataChanged={this.props.metadataChanged}
                        onError={this.props.onError}
                        onUpdate={this.props.onUpdate} />

                    {this.props.showDetailsRow ? this.renderDetailsRow() : null}
                    {this.props.displayPermissionEditor && this.renderPermissionEditor()}

            </div></Grid>
        </ResizableModal>
    </Portal>);
    }

    loadAvailableGroups = () => {
        this.props.loadAvailableGroups(this.props.user);
    };

    loadPermissions = () => {
        this.props.loadPermissions(this.props.resource.id);
    };

    isMetadataChanged = () => {
        return this.props.resource && (
            this.props.metadata.description !== this.props.resource.description ||
            this.props.metadata.name !== this.props.resource.name
        );
    };
}

module.exports = SaveModal;
